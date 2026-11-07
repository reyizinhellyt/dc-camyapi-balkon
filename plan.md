# DC Yapı Cam Balkon — Yenileme Planı

## Amaç ve kapsam

Ekli `cam-balkon-site` arşivindeki DC Yapı Cam Balkon sitesini, mevcut Türkçe marka kimliğini ve işlevlerini koruyarak daha çağdaş, düzenli ve mobil uyumlu bir tasarımla yeniden oluşturmak. Kaynaktaki 11 sayfa kapsama dahildir:

- Ana sayfa (Hizmetler, Hakkımızda, Süreç, Blog, Galeri, SSS ve iletişim/teklif çağrıları)
- Fiyat teklifi oluşturma
- İletişim
- Blog
- Galeri
- Yerel demo yönetim paneli
- Gizlilik politikası, KVKK aydınlatma metni, çerez politikası, kullanım koşulları ve erişilebilirlik beyanı

Kaynak paketindeki logo, ana görsel, 8 hizmet görseli ve 3 galeri fotoğrafı kullanılacak. İçerik ve dosya isimleri korunacak; özgün metinler, yasal sayfa içerikleri, sosyal bağlantılar ve Türkçe karakterler aktarılacak.

## Uygulama yaklaşımı

- Statik, çok sayfalı bir site olarak yerel HTML, CSS ve JavaScript kullanılacak; yeni sunucu, veritabanı veya üçüncü taraf CMS eklenmeyecek. Bu yaklaşım kaynak prototipin tarayıcı tabanlı davranışını ve sınırlarını korur.
- Var olan sayfa işaretlemesi, form alanları, yerel içerik verileri ve JavaScript etkileşimleri temel alınacak; yeni görsel sistem ortak stiller ve gerektiği kadar sayfa düzenlemesiyle uygulanacak.
- Ana gezinme, mobil menü, hizmet kartları ve sayfa altı teklif bağlantıları ortak marka sistemine bağlanacak.
- Teklif aracındaki ürün/sistem, balkon biçimi (düz, L, U, açılı), cam ve kasa rengi, ölçü, bölme sayısı ve sabit alan seçimleri; yaklaşık m² özeti ve 3B önizlemenin döndürme/yakınlaştırma/kamera kontrolleri korunacak. Alan yalnızca tahmindir; sayfa fiyat hesaplamaz.
- Teklif ve iletişim formları mevcut davranış gibi kullanıcı tarafından kontrol edilip gönderilecek WhatsApp mesaj taslağını açacak. Form bilgileri site sunucusuna kaydedilmeyecek ve otomatik gönderilmeyecek; kaynakta bulunan bilgilendirme ve iletişim onayları korunacak.
- Blog filtreleri ve yazı detayları, galeri kategori filtreleri ve tam ekran görsel görüntüleyicisi korunacak.
- Yönetim paneli aynı tarayıcıdaki `localStorage` tabanlı yerel demo olarak kalacak; hizmet/blog/galeri/Instagram bağlantısı düzenleme ve görsel seçme davranışları korunacak. Panelin sunucu güvenliği olmadığı, kimlik bilgilerinin JavaScript'te görülebileceği ve kayıtların cihazlar arasında paylaşılmadığı uyarıları açıkça kalacak.
- Sayfalar klavye ile kullanılabilirlik, görünür odak, anlamlı görsel alternatifleri, duyarlı kırılımlar ve azaltılmış hareket tercihi gözetilerek düzenlenecek.

## Tasarım yönü

**Tasarım hareketi:** Güncel mimari yayıncılık ile sıcak, yalın yapı markası estetiği. Kaynaktaki cam/metal/konut görsel kimliğini koruyup tipografik hiyerarşi, boşluk ve görsel kadrajları rafine et.

**Temel ilkeler:** (1) Camı ve yaşam alanını öne çıkar; (2) güven duygusunu abartısız, açık içerikle kur; (3) her sayfada aynı gezinme ve teklif yolunu sürdür; (4) mobilde okunabilirlik ve dokunma rahatlığını önceliklendir.

**Renk felsefesi:** Kırık beyaz ve açık taş tonları ferahlık ve mimari yüzey hissi verir; koyu mürekkep/lacivert metinler güven ve netlik sağlar; kaynak logodaki kiremit-koral vurgu yalnızca etkileşim ve önemli işaretlerde kullanılır. Cam görsellerindeki doğal yeşil ve gün ışığı tonları yardımcı renk olarak kalır.

**Yerleşim yaklaşımı:** Geniş boşluklu editoryal sayfa akışı; bir tarafta güçlü başlık ve kısa metin, diğer tarafta büyük mimari görsel; yatay kaydırılabilir hizmet dizisi; değişken genişlikte galeri ve içerik yüzeyleri. Bölümler arasında sade numaralandırma, ince çizgiler ve net hizalama kullan; her şeyi eşit kartlardan oluşan merkezi bir ızgaraya sıkıştırma.

**İmza öğeleri:** İnce kiremit renkli çizgi/numara vurguları; cam ve profil geometrisini çağrıştıran çerçeve köşeleri; koyu fonda yumuşak ışıklı görsel paneller.

**Etkileşim:** Teklif verme ve iletişim çağrıları her zaman bulunabilir, ancak sakin ve açıklayıcı kalır. Formdaki her seçim proje özetini hemen günceller. Filtreler, galeri ve menü klavye/dokunma için uygun, anlaşılır durum bildirimleriyle çalışır.

**Animasyon:** Az ve amaçlı geçişler; menü, kart ve içerik görünümünde kısa opaklık/konum değişimleri. Hareketi `prefers-reduced-motion` ile azalt; ölçü/önizleme güncellemelerini geciktirme.

**Tipografi:** Başlıklarda yerel sistem sans-serif yığını (mimari, güçlü ve yalın); gövde metninde aynı erişilebilir sans-serif aile, rahat satır aralığı. Büyük başlıklar kısa satırlarla, içerik genişliği kontrollü; küçük üst etiketler büyük harf ve hafif harf aralığıyla ayrışsın. Dış font yüklemesi zorunlu olmasın.

**Marka özü:** Balkon ve terasları yıl boyu daha kullanılabilir kılan cam sistem çözümleri; kişilik: güvenilir, özenli, çağdaş.

**Marka dili:** Net, sıcak ve ölçülü; teknik ayrıntıyı anlaşılır Türkçe ile açıkla. Örnek: “Dışarıyla aranızda konforlu bir alan.” / “Mekânınıza uygun sistemi birlikte belirleyelim.”

**Logo:** Arşivdeki DC Yapı Cam Balkon logosunu mevcut oranlarıyla kullan; sade ve yatay kilitli marka yerleşimi. Yeni bir logotip icat etme.

**İmza marka rengi:** Kaynak marka işaretindeki kiremit-koral tonu.

## Proje yapısı

```text
/
├── index.html                         # Ana sayfa
├── fiyat-teklifi.html                 # Teklif aracı ve önizleme
├── iletisim.html                      # WhatsApp mesaj taslağı formu
├── blog.html / galeri.html            # İçerik listeleme ve filtreleme
├── admin.html                         # Yerel demo yönetim paneli
├── gizlilik-politikasi.html           # Yasal sayfalar (4 ek HTML sayfasıyla)
├── style.css                          # Kaynaktan korunan temel ortak stiller
├── modern-theme.css                   # Duyarlı yenileme, karanlık tema ve hareket tercihleri
├── app.js / three-preview.js          # Gezinme, formlar, teklif özeti ve 3B önizleme
├── blog.js / gallery.js / admin.js    # İçerik listeleme ve yerel panel işlevleri
├── *-defaults.js / theme.js           # Başlangıç içerikleri ve tema davranışı
├── assets/                            # Kaynak logo ve görseller
├── database/schema.sql                # Kaynak arşiv referansı; uygulamada sunucu/veritabanı kullanılmayacak
└── manus-routes.json                   # Site kökünde sunulan statik route bildirimi
```

## İşletim ve teslim

Geliştirme önizlemesi Manus web projesinde çalıştırılacak. Uygulama, arşivdeki davranışları sunucu/veritabanı eklemeden koruyan statik sayfa seti olarak sunulacak. Talepte yayınlama istenmediği için yayına alma bu planın kapsamında değildir.


## 2026-11-07 kapsam genişletmesi: hizmet ve bölge sayfaları

- Kullanıcının son verdiği listedeki 10 hizmet için ayrı, içerik barındıran statik HTML sayfaları oluşturulacak. Tekil sayfalarda route’a özgü başlık/açıklama, hizmete uygun mevcut site görseli (uygun değilse nötr stil paneli), açıklayıcı içerik, ilişkili hizmet/bölge bağlantıları ve mevcut teklif/WhatsApp çağrıları bulunacak.
- `Tüm hizmet bölgeleri` için bir listeleme sayfası ve Osmangazi, Nilüfer, Yıldırım, Mudanya, Gürsu, Kestel ve İnegöl için ayrı bölge sayfaları eklenecek. Metinler hizmet bölgelerini tanıtacak; doğrulanmamış adres, fiyat, proje sayısı, teslim süresi veya teknik garanti iddiası eklenmeyecek.
- Var olan İletişim (`/iletisim.html`), Ücretsiz fiyat teklifi (`/fiyat-teklifi.html`) ve WhatsApp (`https://wa.me/905352135804`) hedefleri yeniden kullanılacak. Kullanıcı son listesinde “Sineklik” maddesini tekrarlamadığı için yeni kapsam dışı tutulacak.
- Footer mevcut menüyü ve yasal/sosyal alanları koruyarak Hizmetler ve Bölgeler & iletişim gruplarıyla genişletilecek; masaüstü ve mobil düzenleri korunacak. Resmî Google yorum profili aramada doğrulanamadığından bu dış link, kullanıcıdan doğru Google İşletme/yorum URL’si gelene kadar eklenmeyecek.
- Statik route manifesti toplam yeni HTML rotalarıyla güncellenecek; tüm yeni sayfalar doğrudan sunulabilir, JavaScript çalıştırmadan okunabilir HTML içerik taşıyacak.


## 2026-11-07 kapsam genişletmesi: yasal ve uyumluluk sayfalarını canlı kullanıma hazırlama

- Beş mevcut HTML sayfası ayrı kalacak: Gizlilik Politikası, KVKK Aydınlatma Metni, Çerez Politikası, Kullanım Koşulları ve Erişilebilirlik Beyanı. Taslak uyarıları, köşeli parantezli alanlar ve `noindex,nofollow` direktifleri, yalnızca metin ve işletme bilgileri doğrulanıp değiştirildikten sonra kaldırılacak.
- Metinler sayfanın gerçek işleyişini anlatacak: iletişim/teklif formları veriyi site sunucusuna göndermiyor; WhatsApp mesaj taslağı açıyor ve kullanıcı mesajı kendisi gönderiyor. Site kaynak kodunda analitik/reklam pikseli veya birinci taraf çerez yazımı yok; proje düzeyindeki site analitiği de kapalı. Barındırma/CDN ve harici kaynakların kendi teknik veri işlemleri ayrıca açıklanacak. Tema tercihi ve yerel demo içerikleri tarayıcı `localStorage` alanında tutuluyor. Google Fonts, Three.js CDN ve ana sayfadaki tembel yüklenen Instagram gömmesi gibi dış kaynaklar açıklanacak; harita bu sürümde gömülü değil.
- Kullanıcının sağladığı işletme bilgileri: “DC Yapı Cam Balkon Ltd. Şti.” unvanı, +90 535 213 58 04 telefonu, kamuya açık adres olmadığı ve kullanıcı tarafından genel e-posta olarak info@dcyapicambalkon.com verildiği, tamamlanan veya tamamlanmayan taleplerin alındığı tarihten başlayarak 6 ay saklanması niyeti ve teklif geçerlilik süresinin yazılı teklif/sözleşmede belirtilmesi. Sözleşme/fatura ve diğer yasal kayıtlar mevzuatın gerektirdiği sürelerde tutulacak. Telefon genel iletişim bilgisi olabilir; resmî KVKK başvuru kanalı olarak tek başına gösterilmeyecek, çünkü Kurulun resmî kararında sayılan kanallar arasında telefon yoktur.
- Kullanım koşulları çevrimiçi satın alma/ödeme varmış gibi yazılmayacak; keşif, teklif, geçerlilik, ödeme ve montaj koşulları yazılı teklifte/sözleşmede belirlenir. Tüketici mevzuatındaki zorunlu hakları sınırlayan hüküm eklenmeyecek.
- Erişilebilirlik beyanı gerçek geliştirme durumuyla sınırlı olacak; bağımsız erişilebilirlik denetimi olmadan WCAG veya mevzuata tam uyum iddiası kurulmayacak.
- Sayfalar, ilgili güncel resmî mevzuat ve kurum kaynaklarıyla hazırlanacak. Metinler yayına hazır site içeriği olacak ancak hukuki danışmanlık veya resmî uygunluk sertifikası olarak sunulmayacak; kullanıcıdan zorunlu işletme bilgileri alınana kadar tamamlanmamış bilgi uydurulmayacak.

### 2026-11-07 kullanıcı teyidi

Kamuya açık işletme adresi bulunmuyor; kullanıcı genel iletişim ve KVKK başvuruları için info@dcyapicambalkon.com e-posta adresini ve +90 535 213 58 04 telefon numarasını verdi. Kullanıcı, resmî e-posta başvurularının yalnızca ilgili kişinin daha önce veri sorumlusuna bildirdiği ve işletme kayıtlarında bulunan kendi e-posta adresinden gönderilmesi doğrulama usulünü onayladı; telefon genel iletişim içindir, tek başına resmî başvuru kanalı değildir. Adres uydurulmayacak. Talep/teklif kayıtları, sonuçlansa da sonuçlanmasa da talebin alındığı tarihten itibaren 6 ay saklanacak; sözleşme, fatura ve benzeri kayıtlar mevzuatın gerektirdiği sürelerde tutulacak. Google Maps için henüz paylaşım bağlantısı veya pin yok; harita bu sürümde eklenmeyecek. Metin, daha sonra Google Maps gömülü içeriği eklenirse gizlilik/çerez açıklamalarının güncellenmesi gerektiğini belirtecek.


### Formlarda aydınlatma bağlantıları

İletişim ve fiyat teklifi formlarında, kişisel veri girilen noktada tamamlanmış Gizlilik Politikası/KVKK Aydınlatma sayfalarına görünür bağlantı bulunmalı; site sunucusunda saklama yapılmadığı ve kullanıcı formu gönderdiğinde WhatsApp’ta düzenleyip kendisinin ileteceği mesaj taslağı açıldığı açıkça belirtilmeli. Mevcut onay kutularının dili bilgilendirme/onay niteliğiyle tutarlı olmalı; işleme şartı ayrıca doğrulanmadan “açık rıza” gibi kullanılmamalı.

### İletişim sayfası ve doğrulanmış sosyal bağlantılar

İletişim sayfasında kullanıcının verdiği telefon ve e-posta yayımlanır; paylaşılmayan işletme adresi veya çalışma saatleri uydurulmaz, güncel saat bilgisi için doğrudan iletişim istenir. Hizmet alanı cümlesi kesin olmayan proje uygunluğunu vaat etmez. Altbilgideki genel Facebook/YouTube ana sayfa bağlantıları kaldırılır; yalnızca sitede zaten işletme profili olarak kullanılan Instagram (`instagram.com/dcyapicambalkon`) ve TikTok (`tiktok.com/@dc.yapi16`) bağlantıları tutulur.
