(() => {
'use strict';
const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
const $ = (id) => document.getElementById(id);
const forms = { posts: $('postForm'), gallery: $('galleryForm') };
const state = { posts: [], gallery: [] };
function show(message, isError=false) {
  const box=$('status');box.textContent=message;box.classList.toggle('error',isError);box.style.display='block';
  box.scrollIntoView({behavior:'smooth',block:'start'});
}
async function api(url, opts={}) {
  const options={credentials:'same-origin', cache:'no-store', ...opts};
  if(options.method && !['GET','HEAD'].includes(options.method.toUpperCase()))
    options.headers={...(options.headers||{}),'X-CSRF-Token':csrf};
  const response=await fetch(url, options);
  if(response.status===401){location.replace('/admin.html');throw new Error('Oturum süresi doldu.');}
  const data=await response.json().catch(()=>({ok:false,error:'Geçersiz API yanıtı'}));
  if(!response.ok || !data.ok) throw new Error(data.error||`Sunucu hatası (${response.status})`);
  return data;
}
const text=(value)=>String(value??'');
function optionize(sel,items) {
  sel.replaceChildren();
  for(const item of items){const e=document.createElement('option');e.value=item.id;e.textContent=item.name;sel.append(e);}
}
function clear(form){form.reset();form.elements.id.value='';}
function resetPost() {clear(forms.posts);forms.posts.elements.post_date.value=new Date().toISOString().slice(0,10);}
function resetGallery() {clear(forms.gallery);forms.gallery.elements.sort_order.value='0';}
function edit(type,item) {
  document.querySelector(`[data-tab="${type==='posts'?'blog':'gallery'}"]`).click();
  const form=forms[type];form.elements.id.value=item.id;
  const fields=type==='posts'?['title','slug','category_id','post_date','excerpt','content','image_url','status']
    :['title','category_id','image_url','caption','alt_text','sort_order','is_published'];
  for(const field of fields){if(form.elements[field])form.elements[field].value=text(item[field]);}
  if(type==='posts')form.elements.tags.value=(item.tags||[]).join(', ');
  form.scrollIntoView({behavior:'smooth',block:'start'});
}
function render(kind) {
  const items=state[kind], container=$(kind==='posts'?'postList':'galleryList');
  const counter=$(kind==='posts'?'postCount':'galleryCount');counter.textContent=String(items.length);
  container.replaceChildren();
  if(!items.length){const el=document.createElement('div');el.className='empty';el.textContent='Henüz kayıt yok.';container.append(el);return;}
  for(const item of items){
    const entry=document.createElement('div');entry.className='entry';
    const desc=document.createElement('div'),title=document.createElement('strong'),info=document.createElement('small');
    title.textContent=text(item.title);info.textContent=text(item.category_name)+' · '+(kind==='posts'?text(item.status):(item.is_published?'Yayında':'Gizli'));
    desc.append(title,info);
    const buttons=document.createElement('div');buttons.className='buttons';
    const editBtn=document.createElement('button');editBtn.className='mini';editBtn.textContent='Düzenle';editBtn.onclick=()=>edit(kind,item);
    const delBtn=document.createElement('button');delBtn.className='mini red';delBtn.textContent='Sil';
    delBtn.onclick=async()=>{if(!confirm('Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?'))return;
      try{await api('/api/admin/'+kind+'/'+item.id,{method:'DELETE'});await load();show('Kayıt silindi.');}catch(e){show(e.message,true);}};
    buttons.append(editBtn,delBtn);entry.append(desc,buttons);container.append(entry);
  }
}
async function load() {
  const [posts,gallery]=await Promise.all([api('/api/admin/posts'),api('/api/admin/gallery')]);
  state.posts=posts.items||[];state.gallery=gallery.items||[];render('posts');render('gallery');
}
forms.posts.addEventListener('submit',async(event)=>{
  event.preventDefault();const f=forms.posts,id=f.elements.id.value;
  const payload={title:f.elements.title.value,slug:f.elements.slug.value||undefined,
    category_id:Number(f.elements.category_id.value),post_date:f.elements.post_date.value,
    excerpt:f.elements.excerpt.value,content:f.elements.content.value,
    image_url:f.elements.image_url.value,status:f.elements.status.value,
    tags:f.elements.tags.value.split(',').map(x=>x.trim()).filter(Boolean)};
  try{await api('/api/admin/posts'+(id?'/'+id:''),{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    resetPost();await load();show('Blog yazısı kaydedildi.');}catch(e){show(e.message,true);}
});
forms.gallery.addEventListener('submit',async(event)=>{
  event.preventDefault();const f=forms.gallery,id=f.elements.id.value;
  const payload={title:f.elements.title.value,category_id:Number(f.elements.category_id.value),
    image_url:f.elements.image_url.value,caption:f.elements.caption.value,alt_text:f.elements.alt_text.value,
    sort_order:Number(f.elements.sort_order.value),is_published:Number(f.elements.is_published.value)};
  try{await api('/api/admin/gallery'+(id?'/'+id:''),{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    resetGallery();await load();show('Galeri öğesi kaydedildi.');}catch(e){show(e.message,true);}
});
$('resetPost').onclick=resetPost;$('resetGallery').onclick=resetGallery;
for(const btn of document.querySelectorAll('[data-tab]')){
  btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===btn));
    document.querySelectorAll('.tabpanel').forEach(x=>x.classList.toggle('active',x.id==='tab-'+btn.dataset.tab));
  });
}
$('darkMode').onclick=()=>{
  document.body.classList.toggle('dark');
  $('darkMode').textContent=document.body.classList.contains('dark')?'☀ Aydınlık mod':'☾ Karanlık mod';
};
(async()=>{
  try{
    const cats=await api('/api/admin/categories');
    optionize($('blogCategories'),cats.blog||[]);optionize($('galleryCategories'),cats.gallery||[]);
    resetPost();resetGallery();await load();
  }catch(e){show('İçerikler yüklenemedi: '+e.message,true);}
})();
})();
