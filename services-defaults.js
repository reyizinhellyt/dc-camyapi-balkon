window.DC_SERVICES_KEY='dcYapiServices';
window.DC_DEFAULT_SERVICES=[
 {id:'service-balcony',kicker:'01 — ŞEFFAF DÖRT MEVSİM KONFORU',title:'Cam Balkon',description:'Balkon konforunu dört mevsime taşıyın.',art:'art-custom',image:'assets/services/01-cam-balkon.webp'},
 {id:'service-sliding',kicker:'02 — AKICI KULLANIM',title:'Sürme Cam',description:'Geniş açıklıklarda rahat ve akıcı kullanım.',art:'art-custom',image:'assets/services/02-surme-cam.webp'},
 {id:'service-guillotine',kicker:'03 — DİKEY AÇILIR CAM',title:'Giyotin Cam',description:'Dikey hareketli panellerle açık alan esnekliği.',art:'art-custom',image:'assets/services/03-giyotin-cam.webp'},
 {id:'service-pergola',kicker:'04 — DIŞ MEKÂN GÖLGELENDİRME',title:'Pergole',description:'Terasınıza gölgelik ve konfor katın.',art:'art-custom',image:'assets/services/04-pergole.webp'},
 {id:'service-pvc',kicker:'05 — PVC KAPI VE PENCERE',title:'PVC Doğrama',description:'Yaşam alanları için yalıtımlı doğrama çözümleri.',art:'art-custom',image:'assets/services/05-pvc-dograma.webp'},
 {id:'service-railing',kicker:'06 — GÜVENLİ ŞEFFAFLIK',title:'Korkuluk',description:'Balkon ve merdivenler için cam korkuluk.',art:'art-custom',image:'assets/services/06-korkuluk.webp'},
 {id:'service-office',kicker:'07 — OFİS İÇ MEKÂN ÇÖZÜMLERİ',title:'Ofis Bölme',description:'Çalışma alanlarını ferah cam bölmelerle düzenleyin.',art:'art-custom',image:'assets/services/07-ofis-bolme.webp'},
 {id:'service-aluminum',kicker:'08 — DAYANIKLI PROFİL SİSTEMLERİ',title:'Alüminyum Doğrama',description:'İnce profilli kapı ve pencere uygulamaları.',art:'art-custom',image:'assets/services/08-aluminyum-dograma.webp'}
];

/* Migrate only an untouched copy of the former built-in service list; preserve custom admin edits. */
try{
 const legacy=[
  {id:'service-balcony',kicker:'01 — DÖRT MEVSİM KONFOR',title:'Cam balkon',description:'Alanı koruyun, manzarayı yaşayın',art:'art-balcony',image:''},
  {id:'service-sliding',kicker:'02 — AKICI KULLANIM',title:'Sürme cam',description:'Yer tasarrufu ve yalın görünüm',art:'art-sliding',image:''},
  {id:'service-guillotine',kicker:'03 — MODERN AÇILIM',title:'Giyotin cam',description:'Dikey hareketli cam sistemleri',art:'art-guillotine',image:''},
  {id:'service-pergola',kicker:'04 — AÇIK ALANLAR',title:'Pergola & kış bahçesi',description:'Terasınıza yeni bir kullanım kazandırın',art:'art-pergola',image:''}
 ];
 const stored=localStorage.getItem(window.DC_SERVICES_KEY);
 if(stored!==null&&JSON.stringify(JSON.parse(stored))===JSON.stringify(legacy))localStorage.setItem(window.DC_SERVICES_KEY,JSON.stringify(window.DC_DEFAULT_SERVICES));
}catch{}
