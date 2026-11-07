












/* DC Yapı Cam Balkon — Instagram yönetimi; orijinal HTML/CSS korunur. */
(() => {
  'use strict';
  const form = document.getElementById('instagramPostsForm');
  const status = document.getElementById('instagramStatus');
  const count = document.getElementById('instagramCount');
  const tab = document.querySelector('.admin-tab[data-panel="instagramPanel"]');
  const inputs = Array.from({length: 5}, (_,i) => document.getElementById(`instagramPost${i+1}`));
  if (!form || inputs.some(x=>!x)) return;

  const setStatus = (text) => { if (status) status.textContent = text; };
  function normalize(value) {
    try {
      const u = new URL(String(value || '').trim());
      if (u.protocol !== 'https:' || !['www.instagram.com','instagram.com'].includes(u.hostname.toLowerCase()) || u.username || u.password) return '';
      if (!/^\/(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(u.pathname)) return '';
      return 'https://www.instagram.com' + (u.pathname.endsWith('/') ? u.pathname : u.pathname + '/');
    } catch { return ''; }
  }
  async function readJson(url, options = {}) {
    const response = await fetch(url, {credentials:'same-origin', cache:'no-store', ...options});
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.ok !== true) throw new Error(data?.error || `HTTP ${response.status}`);
    return data;
  }
  async function load() {
    try {
      const data = await readJson('/api/admin/instagram');
      const urls = (data.items || []).filter(item=>item.is_active === 1).map(item=>item.post_url);
      inputs.forEach((input,index)=>{input.value=urls[index]||'';input.setCustomValidity('');});
      if (count) count.textContent = String(urls.length);
      setStatus('D1 veritabanından ' + urls.length + ' bağlantı yüklendi. En yeni gönderi 1. sıradadır.');
    } catch (error) {
      setStatus('Instagram bağlantıları yüklenemedi: ' + error.message);
    }
  }
  async function csrfToken() {
    const response = await fetch('/api/admin/content', {credentials:'same-origin',cache:'no-store'});
    if (!response.ok || new URL(response.url).pathname !== '/api/admin/content') throw new Error('Yönetici oturumu bulunamadı.');
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const token = doc.querySelector('meta[name="csrf-token"]')?.content || '';
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('CSRF doğrulaması alınamadı.');
    return token;
  }
  inputs.forEach(input=>input.addEventListener('input',()=>input.setCustomValidity('')));
  form.addEventListener('submit', async (event)=>{
    event.preventDefault();
    const urls=[];
    for (const input of inputs) {
      input.setCustomValidity('');
      const url=normalize(input.value);
      if (!url) {
        input.setCustomValidity('Geçerli bir Instagram gönderi veya Reel HTTPS bağlantısı girin.');
        input.reportValidity();
        return;
      }
      if (urls.includes(url)) {
        input.setCustomValidity('Aynı gönderi bağlantısı iki kez kullanılamaz.');
        input.reportValidity();
        return;
      }
      urls.push(url);
    }
    const button=form.querySelector('[type="submit"]');
    if (button) button.disabled=true;
    setStatus('Bağlantılar kaydediliyor…');
    try {
      const token=await csrfToken();
      await readJson('/api/admin/instagram', {
        method:'PUT',
        headers: {'Content-Type':'application/json','X-CSRF-Token':token},
        body: JSON.stringify({urls})
      });
      if (count) count.textContent=String(urls.length);
      setStatus('5 Instagram bağlantısı Cloudflare D1 veritabanına kaydedildi. Sitede tüm ziyaretçiler aynı sırayı görür.');
    } catch (error) {
      setStatus('Kayıt başarısız: ' + error.message);
    } finally { if (button) button.disabled=false; }
  });
  tab?.addEventListener('click',()=>{void load();});
  // Already-signed-in admin opening page with Instagram tab selected.
  if (tab?.classList.contains('active')) void load();
})();



