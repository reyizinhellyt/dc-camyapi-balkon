# Teslim Maddeleri

## Ortak gezinme, ana sayfa ve modern görsel sistem
- [x] Ekli Türkçe DC Yapı Cam Balkon sitesinin marka kimliği, metinleri, özgün logosu ve görsel varlıkları korunarak daha modern bir tasarımla yeniden oluşturulur.
- [x] Ana sayfada Hizmetler, Hakkımızda, Süreç, Blog, Galeri, SSS ve iletişim/teklif çağrıları yer alır; ortak gezinme ve mobil menü sayfalar arasında tutarlı çalışır.
- [x] Cam balkon, sürme cam, giyotin cam, pergole, PVC doğrama, korkuluk, ofis bölme ve alüminyum doğrama hizmetleri mevcut içerik/görsellerle sunulur.
- [x] Tüm sayfalar duyarlı, erişilebilir, klavye ile gezilebilir ve hareket azaltma tercihini gözetir.

## Teklif oluşturma ve 3B önizleme
- [x] Teklif sayfası sistem/ürün, balkon şekli (düz, L, U, açılı), cam, kasa rengi, genişlik/yükseklik ölçüleri, bölme sayısı ve üst/alt sabit alan seçimlerini içerir.
- [x] Seçimler proje özetini ve yaklaşık m² alan bilgisini günceller; 3B önizleme seçimlere göre güncellenir ve döndürme/yakınlaştırma/kamera kontrolleri çalışır.
- [x] Alan hesabının tahmini olduğu ve sayfanın fiyat hesaplamadığı açıkça belirtilir.
- [x] Teklif formu zorunlu seçim/onay koşullarını uygular ve kullanıcı tarafından kontrol edilip gönderilecek WhatsApp taslağı açar; bilgiler sunucuya kaydedilmez ve otomatik gönderilmez.

## İletişim formu ve WhatsApp taslağı
- [x] İletişim sayfası kaynak form alanlarını, konu seçeneklerini ve iletişim onayını korur.
- [x] Gönderim, ad/telefon/e-posta/konu/mesajı içeren WhatsApp taslağı açar; form verisi sunucuda saklanmaz veya otomatik gönderilmez.

## Blog ve galeri
- [x] Blog sayfası varsayılan yazıları, kategori/etiket filtrelerini, tarih sıralamasını ve yazının devamını açma davranışını sunar.
- [x] Galeri sayfası varsayılan proje görsellerini, kategori filtrelerini ve klavye ile de kullanılabilen tam ekran görüntüleyiciyi sunar.

## Yerel demo yönetim paneli
- [x] Panel hizmet, blog yazısı, galeri öğesi ve Instagram bağlantılarını düzenler; kayıtlar aynı tarayıcıdaki localStorage'da tutulur ve cihazlar arasında paylaşılmaz.
- [x] Seçilen görsellerin tarayıcıda küçültülerek saklandığı bilgisi korunur.
- [x] Panelin gerçek güvenlik sağlamadığı, kimlik bilgilerinin JavaScript'te görülebileceği ve içeriklerin yerel demo kapsamında kaldığı açıkça belirtilir.
- [x] Admin sayfasında gece/gündüz tema düğmesi bulunmaz; diğer sayfalardaki tema düğmesi ve tema tercihi davranışı korunur.

## Yasal ve bilgilendirme sayfaları
- [x] Gizlilik Politikası, KVKK Aydınlatma Metni, Çerez Politikası, Kullanım Koşulları ve Erişilebilirlik Beyanı sayfaları kaynak içerikleriyle birlikte erişilebilir ve gezinilebilir kalır.


## Hizmet detay sayfaları
- [x] Kullanıcının son listesindeki 10 hizmetin her biri için ayrı statik sayfa oluşturulur: Isıcamlı cam balkon, Giyotin cam sistemleri, Sürme cam sistemleri, Katlanır cam balkon, Pergole & kış bahçesi, Kış bahçesi, Duşakabin, Alüminyum doğrama, Balkon kapatma & camlama, Otomatik pergola. Her sayfa kendi başlığını ve açıklayıcı Türkçe içeriğini ilk HTML yanıtında sunar; mevcut uygun görsel kullanılır, uygun olmayan durumda yanıltıcı görsel yerine markalı nötr panel kullanılır; sayfada Teklif ve WhatsApp çağrıları bulunur.

## Hizmet bölgeleri
- [x] “Tüm hizmet bölgeleri” sayfası ile Osmangazi, Nilüfer, Yıldırım, Mudanya, Gürsu, Kestel ve İnegöl için ayrı sayfalar oluşturulur; her bölge sayfası ilgili ilçe adını, hizmet açıklamasını, bölgeler dizinine ve Teklif/İletişim yollarına giden bağlantıları içerir.

## Footer bağlantı grupları ve mevcut hedeflerin kullanımı
- [x] Tüm mevcut ve yeni sayfaların altbilgisinde “Menü”, “Hizmetler”, “Bölgeler” ve “Yasal” grupları bulunur. Menü bağlantıları Anasayfa, Hizmetler, Hakkımızda, Galeri, Blog, Sıkça sorulan sorular ve İletişim’i içerir; İletişim bağlantısı footer içinde Menü grubunda yer alır. Bölgeler grubu tüm bölgeler dizinini ve 7 ilçe sayfasını, ayrıca Ücretsiz fiyat teklifi ve WhatsApp bağlantılarını içerir; İletişim bağlantısı bu gruptan çıkarılır. Masaüstünde gruplar kolon düzeninde ve bağlantılar alt alta; mobilde gruplar alt alta, her grubun bağlantıları ikişerli yan yana, sosyal medya ikonları yan yana kalır.

## Google yorumları bağlantısı
- [ ] Altbilgide “Google yorumları” bağlantısı, kullanıcı tarafından doğrulanmış resmî Google İşletme/yorum URL’sine yönelir; profil adresi alınana kadar benzer isimli başka işletmelere bağlantı verilmez.

## Statik sayfa rotaları
- [x] `manus-routes.json`, mevcut 11 sayfayı koruyarak yeni 10 hizmet sayfasını, hizmet bölgeleri dizinini ve 7 ilçe sayfasını bildirir; her route doğru Türkçe başlıkla ve doğrudan erişilebilir HTML içerikle sunulur.


## Ana sayfa görselleri
- [x] Kullanıcının verdiği `https://jukowindows.com/wp-content/uploads/2026/09/9-5.webp` görseli hem ana sayfanın üst hero arka planında hem de `#hakkimizda` içindeki “Yaklaşımımız” fotoğrafında kullanılır; mevcut metinler, hero kaplaması, fotoğraf damgası ve duyarlı kadraj korunur. `Yaklaşımımız` görselinin alternatif metni yeni görseli doğru anlatır; iletişim sayfasındaki hero görseli değiştirilmez.


## Gizlilik Politikası ve KVKK Aydınlatma Metni
- [x] Gizlilik Politikası ve KVKK Aydınlatma Metni, DC Yapı Cam Balkon Ltd. Şti. unvanını, +90 535 213 58 04 numarasını, info@dcyapicambalkon.com adresini ve kamuya açık işletme adresinin paylaşılmadığını doğru açıklar. İletişim formundaki ad, telefon, isteğe bağlı e-posta, konu ve mesaj ile teklif formundaki iletişim bilgileri, sistem/ürün seçimleri ve yaklaşık ölçüler site sunucusunda kaydedilmez; form kullanıcının gözden geçirip WhatsApp üzerinden kendisinin gönderebileceği mesaj taslağı açar. İşletmeye ulaşan talep kayıtları hizmete veya sözleşmeye dönüşüp dönüşmemesine bakılmaksızın talebin alındığı tarihten itibaren 6 ay saklanır; sözleşme, fatura ve diğer yasal kayıtlar mevzuatın gerektirdiği sürelerde tutulur. info@dcyapicambalkon.com resmî KVKK başvuru kutusu olarak kullanılır; başvurunun, ilgili kişinin veri sorumlusuna daha önce bildirdiği ve işletme sisteminde kayıtlı kendi e-posta adresinden gönderilmesi gerekir. Telefon genel iletişim numarasıdır, tek başına resmî KVKK başvuru yöntemi değildir. Açık rıza hukuki dayanakmış gibi temelsiz kullanılmaz.

## Çerez ve benzeri depolama politikası
- [x] Politika site kodunda birinci taraf çerez yazımı ve analitik/reklam pikseli bulunmadığını; proje düzeyindeki site-analitik ayarının da kapatıldığını, bu nedenle Manus Umami/Plausible analitik betiklerinin siteye eklenmediğini açıklar. Bu ifade barındırma/CDN ve harici sağlayıcıların kendi teknik işlemlerini yok saymaz. Tema tercihi ve tarayıcı tabanlı demo içeriğinin `localStorage` kullanabildiği açıklanır. Google Fonts, jsDelivr/Three.js ve ana sayfaya yakınlaşıldığında yüklenen Instagram gömme betiği dış kaynak olarak tanımlanır; gömülü Instagram içeriği yalnızca tıklama sonrası açılan bağlantı gibi gösterilmez. WhatsApp/sosyal doğrudan bağlantılar kullanıcı tıkladığında açılır. Google Maps bu sürümde gömülü değildir; daha sonra harita eklenirse çerez/gizlilik bildiriminin güncellenmesi gerektiği belirtilir. Kullanılmayan çerez veya izleme aracı varmış gibi gösterilmez.

## Kullanım Koşulları ve teklif süreci
- [x] Site doğrudan çevrimiçi satış veya ödeme alıyormuş gibi tanımlanmaz. Kullanıcı tarafından bildirildiği üzere teklif geçerlilik süresi değişebilir ve ilgili süre yazılı teklif/sözleşmede belirtilir. Keşif, ölçü, fiyat, ödeme, teslim/montaj ve varsa garanti koşulları yazılı belgede netleştirilir; yürürlükteki tüketici hakları sınırlandırılmaz ve doğrulanmamış ticari koşul uydurulmaz.

## Erişilebilirlik Beyanı
- [x] Beyan telefonla geri bildirim yolu sunar ve yalnızca doğrulanmış uygulamaları taahhüt eder. Bağımsız bir inceleme/denetim sonucu bulunmadıkça WCAG veya mevzuata tam uyum iddiası ve ölçülmemiş başarı beyanı yer almaz.

## Yasal sayfaların canlı kullanıma hazırlanması
- [x] Beş sayfanın tamamındaki taslak uyarıları ve boş yer tutucular kaldırılmıştır; Gizlilik Politikası, KVKK Aydınlatma Metni, Çerez Politikası, Kullanım Koşulları ve Erişilebilirlik Beyanı sayfalarından `noindex,nofollow` direktifleri çıkarılmıştır. Metinler gerçek süreçleri anlatır, yasal gezinme bağlantıları korunur ve hukuki danışmanlık/uygunluk sertifikası iddiası kurulmaz. Paylaşılmayan adres veya şirket kayıt bilgileri tahmin edilmez; Google Maps bu sürümde eklenmez ve ileride gömülürse gizlilik/çerez açıklamaları güncellenir.


## Kullanıcı tarafından teyit edilen yasal bilgiler
- Talep/teklif kayıtları hizmete veya sözleşmeye dönüşüp dönüşmemesine bakılmaksızın talebin alındığı tarihten itibaren 6 ay saklanır; sözleşme, fatura ve diğer yasal kayıtlar mevzuatın gerektirdiği sürelerde tutulur.
- Kullanıcı kamuya açık işletme adresi olmadığını ve info@dcyapicambalkon.com e-posta adresini verdi. Bu gelen kutusunu resmî KVKK başvuruları için kullanmayı ve başvuruları yalnızca başvuranın daha önce veri sorumlusuna bildirdiği, işletme kayıtlarında bulunan kendi e-posta adresinden gönderildiğinde doğrulamayı onayladı. Telefon genel iletişim numarasıdır; tek başına resmî başvuru yöntemi değildir. Adres uydurulmaz.
- Google Maps için konum/pin bağlantısı henüz yoktur; bu sürüme harita eklenmez. Metinler, Google Maps daha sonra gömülü olarak eklendiğinde gizlilik/çerez bildirimlerinin gözden geçirilip güncellenmesi gerektiğini açıkça belirtir.


## Formlarda veri toplama anındaki aydınlatma
- [x] İletişim ve fiyat teklifi formlarında, veri girilen noktada tamamlanmış Gizlilik Politikası ve KVKK Aydınlatma Metni’ne görünür bağlantılar bulunur. Açıklama, form bilgilerinin site sunucusunda saklanmadığını ve WhatsApp bağlantısı açıldığında taslak içeriğinin WhatsApp’a aktarılabileceğini; kullanıcının taslağı inceleyip işletmeye kendisinin gönderdiğini belirtir. Onay kutusu, bilgilendirme metnini okuduğunu teyit eder; açık rıza veya bağımsız bir işleme hukuki sebebi gibi sunulmaz.

## İletişim bilgileri ve sosyal bağlantılar
- [x] İletişim sayfası teyitli +90 535 213 58 04 telefonunu ve info@dcyapicambalkon.com adresini gösterir. Kamuya açık adres veya işletme tarafından doğrulanmamış çalışma saati uydurulmaz; kullanıcıya güncel saatler için iletişim kurabileceği söylenir. Hizmet bölgesi metni gerçek proje konumuna göre uygunluk değerlendirmesini açıklar.
- [x] Altbilgide genel platform ana sayfalarına giden Facebook/YouTube yer tutucuları bulunmaz; yalnızca sitede zaten kullanılan işletme Instagram ve TikTok profilleri (@dcyapicambalkon ve @dc.yapi16) gösterilir.
