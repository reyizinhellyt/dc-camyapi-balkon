(()=>{
 const defaults=[
  {id:'dc-gallery-reference-1',title:'Dış cephe cam balkon uygulaması',category:'Cam balkon',caption:'Mevcut yapıya uyum sağlayan cam balkon uygulaması.',image:'assets/gallery-project-1.webp'},
  {id:'dc-gallery-reference-2',title:'L balkon cam balkon uygulaması',category:'Cam balkon',caption:'L biçimli balkon alanında cam kapama örneği.',image:'assets/gallery-project-2.webp'},
  {id:'dc-gallery-reference-3',title:'Şehir manzaralı cam balkon',category:'Cam balkon',caption:'Cam panellerle korunan şehir manzaralı balkon.',image:'assets/gallery-project-3.webp'}
 ];
 window.DC_DEFAULT_GALLERY_ITEMS=defaults;
 try{
  const key='dcYapiGalleryItems',flag='dcYapiGallerySeed_v1';
  if(localStorage.getItem(flag)==='1')return;
  let stored=[];try{stored=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
  if(!Array.isArray(stored))stored=[];
  const ids=new Set(stored.map(item=>item&&item.id));
  const merged=[...stored,...defaults.filter(item=>!ids.has(item.id))];
  localStorage.setItem(key,JSON.stringify(merged));
  localStorage.setItem(flag,'1');
 }catch{}
})();
