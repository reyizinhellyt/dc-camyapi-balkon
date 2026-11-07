/*
 * DC Yapı Cam Balkon — orijinal tasarımı değiştirmeyen D1 yönetim adaptörü.
 * admin.html ve mevcut CSS sınıfları korunur.
 * Blog / Galeri: Cloudflare D1 API.
 * Hizmetler/blog/galeri/Instagram D1; dosyalar Cloudflare R2.
 * Güvenlik: kimlik doğrulama ve veri değişiklikleri yalnızca sunucu API'sinde.
 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const SERVICE_KEY = window.DC_SERVICES_KEY || 'dcYapiServices';
  const API = '/api/admin';
  const csrfPattern = /^[A-Za-z0-9_-]{43}$/;
  const state = { posts: [], gallery: [], services: [], blogCategories: [], galleryCategories: [], csrf: '', admin: null };
  const loginForm = $('loginForm');
  const loginView = $('loginView');
  const dashboard = $('dashboard');
  const loginError = $('loginError');
  const blogForm = $('blogPostForm');
  const galleryForm = $('galleryItemForm');
  const serviceForm = $('serviceForm');

  if (!loginForm || !dashboard || !blogForm || !galleryForm || !serviceForm) {
    console.error('DC Yapı: yönetim sayfasının orijinal HTML alanları bulunamadı.');
    return;
  }

  function localRead(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data === null ? clone(fallback) : JSON.parse(data);
    } catch { return clone(fallback); }
  }
  function localWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { alert('Yerel depolamaya yazılamadı. Tarayıcı ayarlarını kontrol edin.'); return false; }
  }
  function notice(text) {
    let el = $('adminApiNotice');
    if (!el) {
      el = document.createElement('p');
      el.id = 'adminApiNotice';
      el.setAttribute('role', 'status');
      el.className = 'admin-storage-note';
      const note = dashboard.querySelector('.admin-storage-note');
      if (note) note.insertAdjacentElement('afterend', el);
      else dashboard.querySelector('.admin-head')?.insertAdjacentElement('afterend', el);
    }
    el.textContent = text;
    el.hidden = false;
  }
  function showLogin() {
    state.admin = null;
    state.csrf = '';
    dashboard.hidden = true;
    loginView.hidden = false;
  }
  function showDashboard() {
    loginError.hidden = true;
    loginView.hidden = true;
    dashboard.hidden = false;
    $('adminPass').value = '';
  }
  function displayLoginError(text) {
    loginError.textContent = text;
    loginError.hidden = false;
    $('adminPass').value = '';
    $('adminPass').focus();
  }
  function asError(resp, body) {
    if (resp.status === 401) return 'Oturum süresi doldu veya kullanıcı bilgileri hatalı.';
    if (resp.status === 403) return 'Güvenlik doğrulaması reddedildi. Sayfayı yeniden yükleyin.';
    if (resp.status === 409) return 'Bu bağlantı veya başlık zaten kayıtlı.';
    const msg = body && typeof body.error === 'string' ? body.error : `HTTP ${resp.status}`;
    return `API hatası: ${msg}`;
  }
  async function refreshCsrf() {
    const response = await fetch(`${API}/content`, { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok || new URL(response.url).pathname !== `${API}/content`) {
      throw new Error('Yönetici oturumu veya güvenlik doğrulaması alınamadı.');
    }
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const token = doc.querySelector('meta[name="csrf-token"]')?.content || '';
    if (!csrfPattern.test(token)) throw new Error('API CSRF anahtarı bulunamadı.');
    state.csrf = token; // Çerez API'den HttpOnly olarak gönderilir; burada yalnızca eşleşen token tutulur.
    return token;
  }
  async function fetchApi(path, options = {}, retry = true) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = new Headers(options.headers || {});
    if (!['GET', 'HEAD'].includes(method)) {
      if (!state.csrf) await refreshCsrf();
      headers.set('X-CSRF-Token', state.csrf);
    }
    const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', ...options, headers });
    if (response.status === 403 && retry && !['GET', 'HEAD'].includes(method)) {
      await refreshCsrf();
      return fetchApi(path, options, false);
    }
    let data = null;
    try { data = await response.json(); } catch {}
    if (!response.ok || !data || data.ok !== true) {
      if (response.status === 401) showLogin();
      throw new Error(asError(response, data));
    }
    return data;
  }

  async function getLoginCsrf() {
    const resp = await fetch(`${API}/login`, { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
    if (!resp.ok) throw new Error('Giriş güvenlik bilgileri alınamadı.');
    const finalPath = new URL(resp.url).pathname;
    if (finalPath === `${API}/dashboard`) return { alreadyLoggedIn: true };
    if (finalPath !== `${API}/login`) throw new Error('Beklenmedik giriş yönlendirmesi.');
    const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
    const token = doc.querySelector('input[name="_csrf"]')?.value || '';
    if (!csrfPattern.test(token)) throw new Error('Giriş doğrulama tokenı eksik.');
    return { token };
  }

  async function loadContent() {
    const [cats, posts, gallery, services] = await Promise.all([
      fetchApi(`${API}/categories`),
      fetchApi(`${API}/posts`),
      fetchApi(`${API}/gallery`),
      fetchApi(`${API}/services`),
    ]);
    state.blogCategories = cats.blog || [];
    state.galleryCategories = cats.gallery || [];
    state.posts = posts.items || [];
    state.gallery = gallery.items || [];
    state.services = services.items || [];
    const gallerySelect = $('galleryCategory');
    const prior = gallerySelect.value;
    gallerySelect.replaceChildren();
    for (const category of state.galleryCategories) {
      const option = document.createElement('option');
      option.value = String(category.id);
      option.textContent = category.name;
      gallerySelect.append(option);
    }
    if (state.galleryCategories.some(c => String(c.id) === prior)) gallerySelect.value = prior;
    renderBlog();
    renderGallery();
    renderServices();
    const storageNote = dashboard.querySelector('.admin-storage-note');
    if (storageNote) storageNote.textContent = 'Hizmetler, blog, galeri ve Instagram D1 ile yönetilir. Görseller ve yüklenen belgeler R2 üzerinde saklanır.';
  }

  async function onAuthenticated() {
    await refreshCsrf();
    showDashboard();
    await loadContent();
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = loginForm.querySelector('[type="submit"]');
    if (submit?.disabled) return;
    const username = $('adminUser').value.trim();
    const password = $('adminPass').value;
    loginError.hidden = true;
    if (submit) submit.disabled = true;
    try {
      const csrf = await getLoginCsrf();
      if (!csrf.alreadyLoggedIn) {
        const response = await fetch(`${API}/login`, {
          method: 'POST', credentials: 'same-origin', cache: 'no-store',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams({ username, password, _csrf: csrf.token }),
        });
        if (!response.ok || new URL(response.url).pathname !== `${API}/dashboard`) {
          if (response.status === 401) throw new Error('Kullanıcı adı veya parola hatalı.');
          if (response.status === 429) throw new Error('Çok fazla deneme yapıldı. Daha sonra tekrar deneyin.');
          if (response.status === 403) throw new Error('Giriş güvenlik kontrolü başarısız oldu.');
          throw new Error('Giriş yapılamadı (HTTP ' + response.status + ').');
        }
      }
      const me = await fetchApi(`${API}/me`);
      state.admin = me.user;
      await onAuthenticated();
    } catch (e) { showLogin(); displayLoginError(e.message || 'Giriş yapılamadı.'); }
    finally { if (submit) submit.disabled = false; }
  });

  $('logoutBtn').addEventListener('click', async () => {
    try {
      if (!state.csrf) await refreshCsrf();
      const body = new URLSearchParams({ _csrf: state.csrf });
      const resp = await fetch(`${API}/logout`, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body,
      });
      if (!resp.ok || new URL(resp.url).pathname !== `${API}/login`) throw new Error('Çıkış doğrulanamadı.');
      showLogin(); loginForm.reset();
      location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { notice('Çıkış işlemi: ' + e.message); }
  });


  // 'Dosyalar' tab is constructed using existing design classes.
  function activateFilesTab() {
    const tabs = dashboard.querySelector('.admin-tabs');
    const lastPanel = $('instagramPanel');
    if (!tabs || !lastPanel) return;
    const tab = document.createElement('button');
    tab.type='button'; tab.className='admin-tab';tab.dataset.panel='r2FilesPanel';
    tab.textContent='Dosyalar (R2)';
    tabs.append(tab);
    const panel = document.createElement('section');
    panel.id='r2FilesPanel'; panel.className='admin-content-panel'; panel.hidden=true;
    panel.innerHTML = `<div class="admin-columns">
      <form id="r2FilesForm" class="admin-form">
        <h2>R2 dosya yükle</h2>
        <p class="form-note">Görseller: JPG, PNG, WEBP, GIF (8 MB). Belgeler: PDF, DOCX, XLSX, TXT (10 MB). Belgelere yalnızca yönetici erişir.</p>
        <label class="field-label" for="r2DocumentFile">Dosya seç</label>
        <input id="r2DocumentFile" type="file" required accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.docx,.xlsx,.txt">
        <div class="admin-form-actions"><button type="submit" class="button button-red">R2’ye yükle →</button></div>
        <p id="r2FilesStatus" class="form-note" role="status"></p>
      </form>
      <div class="admin-list-wrap"><h2>Yüklenen dosyalar</h2>
        <div id="r2FilesList" class="admin-list"></div>
      </div>
    </div>`;
    lastPanel.insertAdjacentElement('afterend',panel);
    const form=panel.querySelector('#r2FilesForm');
    const status=panel.querySelector('#r2FilesStatus');
    const list=panel.querySelector('#r2FilesList');
    async function reloadFiles() {
      const data=await fetchApi(`${API}/uploads`);
      list.replaceChildren();
      if (!data.items.length){list.textContent='Henüz dosya yüklenmedi.';return;}
      for (const asset of data.items) {
        const row=document.createElement('article');row.className='admin-list-item';
        const detail=document.createElement('div');
        const name=document.createElement('b');name.textContent=asset.name;
        const small=document.createElement('small');
        small.textContent=`${asset.kind==='image'?'Görsel':'Özel belge'} · ${(asset.size/1024/1024).toFixed(2)} MB`;
        detail.append(name,small);
        const actions=document.createElement('div');actions.className='admin-list-actions';
        if(asset.kind==='image') {
          const link=document.createElement('a');link.className='admin-list-action';
          link.textContent='Görseli aç';link.href=asset.url;link.target='_blank';link.rel='noopener';
          const copy=document.createElement('button');copy.className='admin-list-action';
          copy.type='button';copy.textContent='URL kopyala';
          copy.onclick=async()=>{try{await navigator.clipboard.writeText(asset.url);status.textContent='Görsel URL kopyalandı.';}catch{status.textContent=asset.url;}};
          actions.append(link,copy);
        } else {
          const link=document.createElement('a');link.className='admin-list-action';
          link.textContent='İndir (giriş gerekli)';link.href=asset.download_url;
          actions.append(link);
        }
        row.append(detail,actions);list.append(row);
      }
    }
    tab.addEventListener('click',()=>reloadFiles().catch(e=>status.textContent=e.message));
    form.addEventListener('submit', async e => {
      e.preventDefault();const input=panel.querySelector('#r2DocumentFile');
      const file=input.files?.[0];if(!file)return;
      if(file.size>10*1024*1024){status.textContent='10 MB sınırı aşıldı.';return;}
      const button=form.querySelector('[type="submit"]');button.disabled=true;
      const body=new FormData();body.set('file',file,file.name);
      status.textContent='R2’ye yükleniyor...';
      try {
        const data=await fetchApi(`${API}/upload`,{method:'POST',body});
        status.textContent = data.kind==='image'
          ? 'Görsel yüklendi. Görsel bağlantısı aşağıdaki listeden kopyalanabilir.'
          : 'Belge yüklendi. Bu belge yalnızca admin oturumuyla indirilebilir.';
        input.value='';await reloadFiles();
      } catch(err) {status.textContent='Yükleme başarısız: '+err.message;}
      finally{button.disabled=false;}
    });
  }
  activateFilesTab();

  // Var olan sekmelerin HTML / CSS yapısını değiştirme.
  document.querySelectorAll('.admin-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(x => x.classList.toggle('active', x === tab));
    document.querySelectorAll('.admin-content-panel').forEach(panel => {
      panel.hidden = panel.id !== tab.dataset.panel;
    });
  }));
  const openPanel = id => document.querySelector(`[data-panel="${id}"]`)?.click();
  function actionButton(label, action, id, kind) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'admin-list-action';
    button.dataset.action = action;
    button.dataset.id = String(id);
    button.dataset.kind = kind;
    button.textContent = label;
    return button;
  }
  function renderList(target, items, kind, formatter) {
    const list = $(target);
    list.replaceChildren();
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'admin-list-empty';
      empty.textContent = 'Henüz kayıt yok.';
      list.append(empty);
      return;
    }
    for (const item of items) {
      const row = document.createElement('article');
      row.className = 'admin-list-item';
      const info = document.createElement('div');
      const title = document.createElement('b');
      const meta = document.createElement('small');
      title.textContent = item.title;
      meta.textContent = formatter(item);
      info.append(title, meta);
      const actions = document.createElement('div');
      actions.className = 'admin-list-actions';
      actions.append(actionButton('Düzenle', 'edit', item.id, kind), actionButton('Sil', 'delete', item.id, kind));
      row.append(info, actions);
      list.append(row);
    }
  }
  function renderBlog() {
    $('blogCount').textContent = String(state.posts.length);
    renderList('adminBlogList', state.posts, 'blog', p =>
      `${p.category_name || ''} · ${p.post_date || ''} · ${p.status === 'published' ? 'Yayında' : p.status === 'draft' ? 'Taslak' : 'Arşiv'}`);
  }
  function renderGallery() {
    $('galleryCount').textContent = String(state.gallery.length);
    renderList('adminGalleryList', state.gallery, 'gallery', g =>
      `${g.category_name || ''} · ${g.is_published ? 'Yayında' : 'Gizli'}`);
  }
  function renderServices() {
    const services = state.services;
    $('serviceCount').textContent = String(services.length);
    renderList('adminServiceList', services, 'service', s => `${s.kicker || 'Hizmet'} · ${s.is_active ? 'Aktif' : 'Gizli'} · D1`);
  }

  // R2 upload, existing HTML/CSS elements remain unchanged.
  function imageField(kind) {
    const names = kind === 'post'
      ? {url:'postImage', data:'postImageData', file:'postImageFile', preview:'postImagePreview', img:'postPreviewImg', name:'postImageFilename', status:'postImageStatus', clear:'clearPostImage'}
      : {url:'galleryImage', data:'galleryImageData', file:'galleryImageFile', preview:'galleryImagePreview', img:'galleryPreviewImg', name:'galleryImageFilename', status:'galleryImageStatus', clear:'clearGalleryImage'};
    const input = $(names.url), file = $(names.file), status = $(names.status);
    const preview = $(names.preview), image = $(names.img), filename = $(names.name);
    const fileLabel = document.querySelector(`label[for="${names.file}"]`);
    file.disabled = false;
    file.accept = '.jpg,.jpeg,.png,.webp,.gif';
    if (fileLabel) {
      fileLabel.textContent = 'R2 ile görsel yükle';
      fileLabel.title = '8 MB altında PNG/JPG/WEBP/GIF görsel seçin';
      fileLabel.style.opacity = '';
      fileLabel.style.cursor = 'pointer';
    }
    let busy = false;
    function reset() {
      if (busy) return;
      input.value = '';
      file.value = '';
      $(names.data).value = '';
      image.removeAttribute('src');
      preview.hidden = true;
      filename.textContent = '';
      status.textContent = 'Görsel URL girin veya cihazdan R2’ye yükleyin (8 MB).';
    }
    function setValue(value) {
      reset();
      input.value = value || '';
      if (value) {
        image.onload = () => { preview.hidden = false; };
        image.onerror = () => { preview.hidden = true; status.textContent = 'Görsel önizlenemedi.'; };
        image.src = value;
        filename.textContent = 'Yüklenen görsel';
      }
    }
    input.addEventListener('change', () => setValue(input.value.trim()));
    $(names.clear).addEventListener('click', reset);
    file.addEventListener('change', async () => {
      const chosen = file.files?.[0];
      if (!chosen) return;
      if (chosen.size > 8*1024*1024) { status.textContent = 'Görsel 8 MB sınırını aşıyor.'; file.value=''; return; }
      const data = new FormData();
      data.append('file', chosen, chosen.name);
      busy = true;
      file.disabled = true;
      status.textContent = 'R2’ye yükleniyor: ' + chosen.name;
      try {
        const result = await fetchApi(`${API}/upload`, {method:'POST', body:data});
        if (result.kind !== 'image' || !result.url) throw new Error('Görsel URL alınamadı.');
        busy = false;
        setValue(result.url);
        filename.textContent = chosen.name;
        status.textContent = 'Görsel R2’ye yüklendi. İçeriği kaydetmek için Kaydet’e basın.';
      } catch (error) {
        status.textContent = 'Yükleme başarısız: ' + error.message;
        notice('R2 yükleme hatası: ' + error.message);
      } finally {
        busy = false;
        file.disabled = false;
        file.value = '';
      }
    });
    reset();
    return {reset,setValue,url:()=>input.value.trim()};
  }
  const blogImage = imageField('post');
  const galleryImage = imageField('gallery');
  for (const note of galleryForm.querySelectorAll('.form-note')) {
    if (note.textContent.includes('R2 kurulumu') || note.textContent.includes('şimdilik HTTPS')) {
      note.textContent = 'Görseller R2 üzerine yüklenir ve içerik kaydedildiğinde sitede görünür.';
    }
  }


  function activateServiceUpload() {
    const textInput = $('serviceImage');
    if (!textInput) return;
    const control = document.createElement('div');
    control.className = 'gallery-upload-controls';
    const label = document.createElement('label');
    label.className = 'button button-outline-dark upload-select-button';
    label.htmlFor = 'serviceImageFileR2';
    label.textContent = 'R2 ile hizmet görseli yükle';
    const field = document.createElement('input');
    field.id = 'serviceImageFileR2'; field.type='file'; field.hidden=true;
    field.accept = '.jpg,.jpeg,.png,.webp,.gif';
    const note = document.createElement('span');
    note.className='form-note'; note.setAttribute('role','status');
    note.textContent = '8 MB altında görsel yükleyebilirsiniz.';
    control.append(label, field, note);
    textInput.insertAdjacentElement('afterend', control);
    field.addEventListener('change', async () => {
      const file=field.files?.[0]; if (!file) return;
      if (file.size > 8*1024*1024) {note.textContent='Görsel 8 MB sınırını aşıyor.';field.value='';return;}
      const body = new FormData(); body.set('file',file,file.name);
      field.disabled=true; note.textContent = 'R2’ye yükleniyor...';
      try {
        const result = await fetchApi(`${API}/upload`,{method:'POST',body});
        if (!result.url || result.kind !== 'image') throw new Error('Görsel URL alınamadı');
        textInput.value=result.url;
        note.textContent='R2’ye yüklendi. Hizmeti kaydetmek için Kaydet’e basın.';
      } catch(e) {note.textContent='Yüklenemedi: '+e.message;}
      finally {field.disabled=false;field.value='';}
    });
  }
  activateServiceUpload();


  // Yayın durumu, mevcut CSS sınıfları ile orijinal formun içine eklenir.
  function addStatusField(form, id, label, items) {
    const existing = $(id);
    if (existing) return existing;
    const wrapper = document.createElement('div');
    const text = document.createElement('label');
    text.className = 'field-label';
    text.htmlFor = id;
    text.textContent = label;
    const select = document.createElement('select');
    select.id = id;
    for (const [value, name] of items) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = name;
      select.append(option);
    }
    wrapper.append(text, select);
    form.querySelector('.admin-form-actions')?.before(wrapper);
    return select;
  }
  const blogStatus = addStatusField(blogForm, 'postPublishStatus', 'Yayın durumu', [
    ['draft', 'Taslak'], ['published', 'Yayınla'], ['archived', 'Arşiv'],
  ]);
  const galleryStatus = addStatusField(galleryForm, 'galleryPublishStatus', 'Yayın durumu', [
    ['1', 'Yayında'], ['0', 'Gizli'],
  ]);
  function resetBlog() {
    blogForm.reset();
    $('blogId').value = '';
    $('postCategory').value = 'Cam balkon rehberi';
    $('postDate').value = new Date().toISOString().slice(0,10);
    $('postTags').value = '';
    blogStatus.value = 'draft';
    blogImage.reset();
    $('blogFormHeading').textContent = 'Blog yazısı ekle';
    $('cancelBlogEdit').hidden = true;
  }
  function resetGallery() {
    galleryForm.reset();
    $('galleryId').value = '';
    galleryStatus.value = '1';
    galleryImage.reset();
    $('galleryFormHeading').textContent = 'Galeri öğesi ekle';
    $('cancelGalleryEdit').hidden = true;
  }
  function resetService() {
    serviceForm.reset();
    $('serviceId').value = '';
    $('serviceImage').setCustomValidity('');
    $('serviceFormHeading').textContent = 'Hizmet ekle';
    $('cancelServiceEdit').hidden = true;
  }
  $('cancelBlogEdit').addEventListener('click', resetBlog);
  $('cancelGalleryEdit').addEventListener('click', resetGallery);
  $('cancelServiceEdit').addEventListener('click', resetService);

  // Blog kategorisi formda metin; D1 API ise geçerli kategori ID'si bekler.
  const postCategoryInput = $('postCategory');
  const list = document.createElement('datalist');
  list.id = 'blogCategoryChoices';
  postCategoryInput.setAttribute('list', list.id);
  postCategoryInput.after(list);
  function matchBlogCategory(name) {
    return state.blogCategories.find(c => c.name.trim().toLocaleLowerCase('tr') === String(name).trim().toLocaleLowerCase('tr'));
  }
  async function savePost(event) {
    event.preventDefault();
    const category = matchBlogCategory(postCategoryInput.value);
    if (!category) {
      alert('Geçerli bir blog kategorisi seçin: ' + state.blogCategories.map(c => c.name).join(', '));
      postCategoryInput.focus();
      return;
    }
    const postId = $('blogId').value;
    const payload = {
      title: $('postTitle').value.trim(),
      category_id: Number(category.id),
      tags: [...new Set($('postTags').value.split(/[,;،]+/).map(s => s.trim()).filter(Boolean))].slice(0,15),
      post_date: $('postDate').value,
      excerpt: $('postExcerpt').value.trim(),
      content: $('postContent').value.trim(),
      image_url: blogImage.url() || null,
      status: blogStatus.value,
    };
    if (postId) {
      const existing = state.posts.find(p => String(p.id) === postId);
      if (existing) payload.slug = existing.slug;
    }
    try {
      await fetchApi(`${API}/posts${postId ? '/' + encodeURIComponent(postId) : ''}`, {
        method: postId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadContent();
      resetBlog();
      notice('Blog yazısı D1 veritabanına kaydedildi.');
    } catch (e) { notice('Blog kaydedilemedi: ' + e.message); }
  }
  blogForm.addEventListener('submit', savePost);
  async function saveGallery(event) {
    event.preventDefault();
    const id = $('galleryId').value;
    const imageUrl = galleryImage.url();
    if (!imageUrl) { notice('Galeri için HTTPS görsel bağlantısı girin.'); return; }
    const payload = {
      title: $('galleryTitle').value.trim(),
      category_id: Number($('galleryCategory').value),
      image_url: imageUrl,
      caption: $('galleryCaption').value.trim(),
      alt_text: $('galleryTitle').value.trim(),
      sort_order: 0,
      is_published: Number(galleryStatus.value),
    };
    try {
      await fetchApi(`${API}/gallery${id ? '/' + encodeURIComponent(id) : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadContent();
      resetGallery();
      notice('Galeri kaydı D1 veritabanına kaydedildi.');
    } catch (e) { notice('Galeri kaydedilemedi: ' + e.message); }
  }
  galleryForm.addEventListener('submit', saveGallery);

  function editBlog(id) {
    const p = state.posts.find(x => String(x.id) === String(id));
    if (!p) return;
    $('blogId').value = p.id;
    $('postTitle').value = p.title;
    $('postCategory').value = p.category_name || '';
    $('postTags').value = (p.tags || []).join(', ');
    $('postDate').value = p.post_date || '';
    $('postExcerpt').value = p.excerpt || '';
    $('postContent').value = p.content || '';
    blogStatus.value = p.status;
    blogImage.setValue(p.image_url || '');
    $('blogFormHeading').textContent = 'Blog yazısını düzenle';
    $('cancelBlogEdit').hidden = false;
    openPanel('blogPanel');
    blogForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function editGallery(id) {
    const g = state.gallery.find(x => String(x.id) === String(id));
    if (!g) return;
    $('galleryId').value = g.id;
    $('galleryTitle').value = g.title;
    $('galleryCategory').value = String(g.category_id);
    $('galleryCaption').value = g.caption || '';
    galleryStatus.value = String(g.is_published ? 1 : 0);
    galleryImage.setValue(g.image_url || '');
    $('galleryFormHeading').textContent = 'Galeri öğesini düzenle';
    $('cancelGalleryEdit').hidden = false;
    openPanel('galleryPanel');
    galleryForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Hizmet kayitlari artik gercek Cloudflare D1 API uzerinden yonetilir.
  serviceForm.addEventListener('submit', async event => {
    event.preventDefault();
    const id = $('serviceId').value;
    const existing = state.services.find(s => String(s.id) === id);
    const image = $('serviceImage').value.trim();
    const localAsset = /^assets\/services\/[A-Za-z0-9._/-]+\.(?:png|jpe?g|webp)$/i.test(image) &&
      !image.split('/').includes('..') && !image.includes('//');
    if (image && !localAsset) {
      try {
        const u = new URL(image);
        if (u.protocol !== 'https:' || u.username || u.password) throw new Error();
      } catch { notice('HTTPS resim URLsi veya assets/services/ yolu girin.'); return; }
    }
    const sortOrder = existing ? existing.sort_order :
      Math.max(0, ...state.services.map(s => Number(s.sort_order) || 0)) + 10;
    const payload = {
      kicker: $('serviceKicker').value.trim(),
      title: $('serviceTitle').value.trim(),
      description: $('serviceDescription').value.trim(),
      image_url: image || null,
      art: existing?.art || 'art-custom',
      sort_order: sortOrder,
      is_active: existing ? existing.is_active : 1,
    };
    try {
      await fetchApi(`${API}/services${id ? '/' + encodeURIComponent(id) : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadContent();
      resetService();
      notice('Hizmet D1 veritabanina kaydedildi.');
    } catch(e) { notice('Hizmet kaydedilemedi: '+e.message); }
  });
  function editService(id) {
    const item = state.services.find(s => String(s.id) === String(id));
    if (!item) return;
    $('serviceId').value = item.id;
    $('serviceKicker').value = item.kicker || '';
    $('serviceTitle').value = item.title || '';
    $('serviceDescription').value = item.description || '';
    $('serviceImage').value = item.image_url || '';
    $('serviceFormHeading').textContent = 'Hizmeti düzenle';
    $('cancelServiceEdit').hidden = false;
    openPanel('servicesPanel');
    serviceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('.admin-list-action');
    if (!button?.dataset.action) return;
    const { kind, action, id } = button.dataset;
    if (action === 'edit') {
      if (kind === 'blog') editBlog(id);
      else if (kind === 'gallery') editGallery(id);
      else if (kind === 'service') editService(id);
      return;
    }
    if (action !== 'delete') return;
    if (kind === 'service') {
      if (!confirm('Bu hizmeti D1 veritabanindan kalici olarak silmek istiyor musunuz?')) return;
      try {
        await fetchApi(`${API}/services/${encodeURIComponent(id)}`, { method:'DELETE' });
        await loadContent();
        notice('Hizmet D1 veritabanindan silindi.');
      } catch(e) { notice('Hizmet silinemedi: '+e.message); }
      return;
    }
    if (!['blog','gallery'].includes(kind) || !confirm('Bu kaydı D1 veritabanından kalıcı olarak silmek istiyor musunuz?')) return;
    try {
      await fetchApi(`${API}/${kind === 'blog' ? 'posts' : 'gallery'}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadContent();
      notice('Kayıt D1 veritabanından silindi.');
    } catch (e) { notice('Silme işlemi başarısız: ' + e.message); }
  });

  resetBlog(); resetGallery(); resetService();
  loginError.hidden = true;
  (async () => {
    try {
      const r = await fetch(`${API}/me`, { credentials: 'same-origin', cache: 'no-store' });
      if (!r.ok) { showLogin(); return; }
      const data = await r.json();
      if (!data.ok) { showLogin(); return; }
      state.admin = data.user;
      await onAuthenticated();
    } catch (e) { showLogin(); console.warn('DC Yapı oturum kontrolü:', e.message); }
  })();
})();
