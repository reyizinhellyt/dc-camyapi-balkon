document.addEventListener('DOMContentLoaded',()=>{
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.header nav');
 if(toggle&&nav)toggle.addEventListener('click',()=>nav.classList.toggle('open'));
 const serviceTrack=document.querySelector('#serviceTrack'),serviceKey=window.DC_SERVICES_KEY||'dcYapiServices';
 const readServices=()=>{try{const raw=localStorage.getItem(serviceKey),items=raw===null?(window.DC_DEFAULT_SERVICES||[]):JSON.parse(raw);return Array.isArray(items)?items:(window.DC_DEFAULT_SERVICES||[])}catch{return window.DC_DEFAULT_SERVICES||[]}};
 const renderServices=()=>{
  if(!serviceTrack)return;
  const allowedArt=['art-balcony','art-sliding','art-guillotine','art-pergola','art-custom'];
  serviceTrack.replaceChildren();
  readServices().forEach(service=>{
   const card=document.createElement('a');card.className='service-card';card.href='fiyat-teklifi.html';card.setAttribute('aria-label',service.title||'Hizmet');
   const art=document.createElement('div');art.className=`service-art ${allowedArt.includes(service.art)?service.art:'art-custom'}`;
   const imageSource=String(service.image||'').trim(),localAsset=/^assets\/services\/[A-Za-z0-9._/-]+\.(?:png|jpe?g|webp)$/i.test(imageSource)&&!imageSource.split('/').includes('..');if(/^https?:\/\//i.test(imageSource)||localAsset){const image=document.createElement('img');image.src=imageSource;image.alt=service.title||'Hizmet görseli';image.loading='lazy';image.decoding='async';art.classList.add('service-art-has-image');art.append(image)}
   const info=document.createElement('div');info.className='service-info';
   const kicker=document.createElement('small');kicker.textContent=service.kicker||'';
   const title=document.createElement('h3');title.textContent=service.title||'';
   const description=document.createElement('span');description.append(document.createTextNode(service.description||''));
   const arrow=document.createElement('b');arrow.textContent='↗';description.append(arrow);
   info.append(kicker,title,description);card.append(art,info);serviceTrack.append(card);
  });
 };
 renderServices();
 const home=document.querySelector('.hero')&&document.querySelector('#hizmetler');
 if(home&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.body.classList.add('home-motion-ready');
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('home-revealed');revealObserver.unobserve(entry.target)}}),{threshold:.14,rootMargin:'0px 0px -42px 0px'});
  const revealGroups=['.trust-strip','#hizmetler','#hakkimizda','#surec','#instagram','.cta-band','#sss','#hizmetler .service-card','#surec .steps article','#sss .faq-list details'];
  revealGroups.forEach(selector=>document.querySelectorAll(selector).forEach((element,index)=>{
   element.classList.add('home-reveal');element.style.setProperty('--home-reveal-delay',`${Math.min(index,3)*75}ms`);
   const rect=element.getBoundingClientRect();
   if(rect.top<innerHeight*.92&&rect.bottom>0)requestAnimationFrame(()=>requestAnimationFrame(()=>element.classList.add('home-revealed')));
   revealObserver.observe(element);
  }));
 }
 if(serviceTrack){
  const previous=document.querySelector('#servicePrev'),next=document.querySelector('#serviceNext');
  const scrollServices=direction=>{const card=serviceTrack.querySelector('.service-card');if(!card)return;const gap=parseFloat(getComputedStyle(serviceTrack).gap)||0;serviceTrack.scrollBy({left:direction*(card.getBoundingClientRect().width+gap),behavior:'smooth'})};
  const syncServiceButtons=()=>{const max=serviceTrack.scrollWidth-serviceTrack.clientWidth;if(previous)previous.disabled=serviceTrack.scrollLeft<=2;if(next)next.disabled=serviceTrack.scrollLeft>=max-2};
  previous?.addEventListener('click',()=>scrollServices(-1));
  next?.addEventListener('click',()=>scrollServices(1));
  serviceTrack.addEventListener('scroll',syncServiceButtons,{passive:true});
  serviceTrack.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();scrollServices(1)}else if(event.key==='ArrowLeft'){event.preventDefault();scrollServices(-1)}});
  window.addEventListener('storage',event=>{if(event.key===serviceKey){renderServices();requestAnimationFrame(syncServiceButtons)}});
  window.addEventListener('resize',syncServiceButtons);
  syncServiceButtons();
 }
 const $=id=>document.getElementById(id);
 const contactForm=$('contactForm');
 if(contactForm)contactForm.addEventListener('submit',event=>{
  event.preventDefault();
  const message=['Merhaba, cam balkon projem hakkında bilgi almak istiyorum.',`Ad: ${$('contactName').value}`,`Telefon: ${$('contactPhone').value}`,`E-posta: ${$('contactEmail').value||'Belirtilmedi'}`,`Konu: ${$('contactTopic').value}`,`Mesaj: ${$('contactMessage').value}`].join('\n');
  window.open(`https://wa.me/905352135804?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');
 });
 const form=$('quoteForm');if(!form)return;
 const system=$('system'),glass=$('glass'),frame=$('frame'),width=$('width'),height=$('height'),panels=$('panels');
 const shapeLabels={straight:'Düz balkon · 1 cephe',l:'L balkon · 2 cephe',u:'U balkon · 3 cephe',angled:'Açılı / dönüşlü · 135°'};
 const update=()=>{
  const w=Number(width.value)||0,h=Number(height.value)||0,shape=document.querySelector('input[name="shape"]:checked')?.value||'straight';
  $('sumSystem').textContent=system.value||'Henüz seçilmedi';$('sumShape').textContent=shapeLabels[shape];$('sumColors').textContent=`${glass.value} / ${frame.value}`;
  $('sumDimensions').textContent=w&&h?`${w} × ${h} mm · ${panels.value||1} bölme`:'—';$('sumArea').innerHTML=`${((w*h)/1000000).toFixed(2)} <small>m²</small>`;
  window.dispatchEvent(new CustomEvent('balcony-config-change',{detail:{shape,system:system.value,glass:glass.value,frame:frame.value,width:w,height:h,panels:Math.max(1,Math.min(10,Number(panels.value)||4)),fixedBottom:$('fixedBottom').checked,fixedTop:$('fixedTop').checked}}));
 };
 [system,glass,frame,width,height,panels,$('fixedTop'),$('fixedBottom'),...document.querySelectorAll('input[name="shape"]')].forEach(el=>{el.addEventListener('input',update);el.addEventListener('change',update)});
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!system.value){system.focus();return}if(!$('consent').checked){$('consent').focus();alert('Devam etmek için bilgilendirme metnini okuduğunuzu onaylayın.');return}
  const w=Number(width.value)||0,h=Number(height.value)||0,shape=document.querySelector('input[name="shape"]:checked')?.value||'straight';
  const msg=['Merhaba, cam balkon projem için teklif almak istiyorum.',`Ad: ${$('name').value||'Belirtilmedi'}`,`Telefon: ${$('phone').value||'Belirtilmedi'}`,`Sistem: ${system.value}`,`Balkon şekli: ${shapeLabels[shape]}`,`Cam / kasa: ${glass.value} / ${frame.value}`,`Ölçüler: ${w&&h?`${w} × ${h} mm`:'Henüz belirtilmedi'}`,`Yaklaşık alan: ${((w*h)/1000000).toFixed(2)} m²`,`Alt sabit: ${$('fixedBottom').checked?'Evet':'Hayır'} · Üst sabit: ${$('fixedTop').checked?'Evet':'Hayır'}`].join('\n');
  window.open(`https://wa.me/905352135804?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');
 });
 update();
});
