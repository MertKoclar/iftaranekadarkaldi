// Türkiye İller ve İlçeler Verisi
export interface City {
  name: string;
  districts: string[];
}

export const turkeyCities: City[] = [
  { name: 'Adana', districts: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'Kozan', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Pozantı', 'Feke', 'Tufanbeyli', 'Saimbeyli', 'Aladağ'] },
  { name: 'Adıyaman', districts: ['Merkez', 'Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Samsat', 'Sincik', 'Tut'] },
  { name: 'Afyonkarahisar', districts: ['Merkez', 'Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'] },
  { name: 'Ağrı', districts: ['Merkez', 'Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Patnos', 'Taşlıçay', 'Tutak'] },
  { name: 'Amasya', districts: ['Merkez', 'Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merzifon', 'Suluova', 'Taşova'] },
  { name: 'Ankara', districts: ['Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Güdül', 'Haymana', 'Kalecik', 'Kızılcahamam', 'Nallıhan', 'Polatlı', 'Şereflikoçhisar', 'Yenimahalle', 'Gölbaşı', 'Keçiören', 'Mamak', 'Sincan', 'Kazan', 'Akyurt', 'Etimesgut', 'Evren', 'Pursaklar'] },
  { name: 'Antalya', districts: ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Döşemealtı', 'Aksu', 'Alanya', 'Demre', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Korkuteli', 'Kumluca', 'Manavgat', 'Serik'] },
  { name: 'Artvin', districts: ['Merkez', 'Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Murgul', 'Şavşat', 'Yusufeli'] },
  { name: 'Aydın', districts: ['Efeler', 'Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'] },
  { name: 'Balıkesir', districts: ['Altıeylül', 'Karesi', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'] },
  { name: 'Bilecik', districts: ['Merkez', 'Bozüyük', 'Gölpazarı', 'İnhisar', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'] },
  { name: 'Bingöl', districts: ['Merkez', 'Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Solhan', 'Yayladere', 'Yedisu'] },
  { name: 'Bitlis', districts: ['Merkez', 'Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Mutki', 'Tatvan'] },
  { name: 'Bolu', districts: ['Merkez', 'Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Mudurnu', 'Seben', 'Yeniçağa'] },
  { name: 'Burdur', districts: ['Merkez', 'Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Tefenni', 'Yeşilova'] },
  { name: 'Bursa', districts: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya', 'Gemlik', 'İnegöl', 'Mustafakemalpaşa', 'Orhangazi', 'Karacabey', 'Gürsu', 'Kestel', 'Yenişehir', 'İznik', 'Orhaneli', 'Büyükorhan', 'Harmancık', 'Keles'] },
  { name: 'Çanakkale', districts: ['Merkez', 'Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Yenice'] },
  { name: 'Çankırı', districts: ['Merkez', 'Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Orta', 'Şabanözü', 'Yapraklı'] },
  { name: 'Çorum', districts: ['Merkez', 'Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'] },
  { name: 'Denizli', districts: ['Pamukkale', 'Merkezefendi', 'Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Sarayköy', 'Serinhisar', 'Tavas'] },
  { name: 'Diyarbakır', districts: ['Bağlar', 'Kayapınar', 'Sur', 'Yenişehir', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kocaköy', 'Kulp', 'Lice', 'Silvan'] },
  { name: 'Edirne', districts: ['Merkez', 'Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Süloğlu', 'Uzunköprü'] },
  { name: 'Elazığ', districts: ['Merkez', 'Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Palu', 'Sivrice'] },
  { name: 'Erzincan', districts: ['Merkez', 'Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'] },
  { name: 'Erzurum', districts: ['Yakutiye', 'Palandöken', 'Aziziye', 'Aşkale', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere'] },
  { name: 'Eskişehir', districts: ['Odunpazarı', 'Tepebaşı', 'Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar'] },
  { name: 'Gaziantep', districts: ['Şahinbey', 'Şehitkamil', 'Oğuzeli', 'Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Yavuzeli'] },
  { name: 'Giresun', districts: ['Merkez', 'Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Güce', 'Keşap', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'] },
  { name: 'Gümüşhane', districts: ['Merkez', 'Kelkit', 'Köse', 'Kürtün', 'Şiran', 'Torul'] },
  { name: 'Hakkari', districts: ['Merkez', 'Çukurca', 'Şemdinli', 'Yüksekova'] },
  { name: 'Hatay', districts: ['Antakya', 'Defne', 'Altınözü', 'Belen', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Reyhanlı', 'Samandağ', 'Yayladağı'] },
  { name: 'Isparta', districts: ['Merkez', 'Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'] },
  { name: 'Mersin', districts: ['Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mut', 'Silifke', 'Tarsus'] },
  { name: 'İstanbul', districts: ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'] },
  { name: 'İzmir', districts: ['Aliağa', 'Bayındır', 'Bergama', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'] },
  { name: 'Kars', districts: ['Merkez', 'Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Sarıkamış', 'Selim', 'Susuz'] },
  { name: 'Kastamonu', districts: ['Merkez', 'Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'] },
  { name: 'Kayseri', districts: ['Melikgazi', 'Kocasinan', 'Talas', 'Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Tomarza', 'Yahyalı', 'Yeşilhisar'] },
  { name: 'Kırklareli', districts: ['Merkez', 'Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Pehlivanköy', 'Pınarhisar', 'Vize'] },
  { name: 'Kırşehir', districts: ['Merkez', 'Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Mucur'] },
  { name: 'Kocaeli', districts: ['İzmit', 'Gebze', 'Gölcük', 'Kandıra', 'Karamürsel', 'Körfez', 'Derince', 'Başiskele', 'Çayırova', 'Darıca', 'Dilovası', 'Kartepe'] },
  { name: 'Konya', districts: ['Karatay', 'Meram', 'Selçuklu', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysinir', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Kulu', 'Sarayönü', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'] },
  { name: 'Kütahya', districts: ['Merkez', 'Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz', 'Hisarcık', 'Pazarlar', 'Simav', 'Şaphane', 'Tavşanlı'] },
  { name: 'Malatya', districts: ['Battalgazi', 'Yeşilyurt', 'Akçadağ', 'Arapgir', 'Arguvan', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan'] },
  { name: 'Manisa', districts: ['Yunusemre', 'Şehzadeler', 'Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Turgutlu'] },
  { name: 'Kahramanmaraş', districts: ['Dulkadiroğlu', 'Onikişubat', 'Afşin', 'Andırın', 'Çağlayancerit', 'Ekinözü', 'Elbistan', 'Göksun', 'Nurhak', 'Pazarcık', 'Türkoğlu'] },
  { name: 'Mardin', districts: ['Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Yeşilli'] },
  { name: 'Muğla', districts: ['Menteşe', 'Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Milas', 'Ortaca', 'Ula', 'Yatağan'] },
  { name: 'Muş', districts: ['Merkez', 'Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Varto'] },
  { name: 'Nevşehir', districts: ['Merkez', 'Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Ürgüp'] },
  { name: 'Niğde', districts: ['Merkez', 'Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Ulukışla'] },
  { name: 'Ordu', districts: ['Altınordu', 'Akkuş', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye'] },
  { name: 'Rize', districts: ['Merkez', 'Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Pazar'] },
  { name: 'Sakarya', districts: ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'] },
  { name: 'Samsun', districts: ['Atakum', 'Canik', 'İlkadım', 'Tekkeköy', 'Alaçam', 'Asarcık', 'Ayvacık', 'Bafra', 'Çarşamba', 'Havza', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Terme', 'Vezirköprü', 'Yakakent'] },
  { name: 'Siirt', districts: ['Merkez', 'Baykan', 'Eruh', 'Kurtalan', 'Pervari', 'Şirvan', 'Tillo'] },
  { name: 'Sinop', districts: ['Merkez', 'Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Saraydüzü', 'Türkeli'] },
  { name: 'Sivas', districts: ['Merkez', 'Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Şarkışla', 'Suşehri', 'Ulaş', 'Yıldızeli', 'Zara'] },
  { name: 'Tekirdağ', districts: ['Süleymanpaşa', 'Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Şarköy'] },
  { name: 'Tokat', districts: ['Merkez', 'Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'] },
  { name: 'Trabzon', districts: ['Ortahisar', 'Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Şalpazarı', 'Sürmene', 'Tonya', 'Vakfıkebir', 'Yomra'] },
  { name: 'Tunceli', districts: ['Merkez', 'Çemişgezek', 'Hozat', 'Mazgirt', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'] },
  { name: 'Şanlıurfa', districts: ['Eyyübiye', 'Haliliye', 'Karaköprü', 'Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Halfeti', 'Harran', 'Hilvan', 'Siverek', 'Suruç', 'Viranşehir'] },
  { name: 'Uşak', districts: ['Merkez', 'Banaz', 'Eşme', 'Karahallı', 'Sivaslı', 'Ulubey'] },
  { name: 'Van', districts: ['İpekyolu', 'Tuşba', 'Edremit', 'Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Erciş', 'Gevaş', 'Gürpınar', 'Muradiye', 'Özalp', 'Saray'] },
  { name: 'Yozgat', districts: ['Merkez', 'Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yerköy', 'Yenifakılı'] },
  { name: 'Zonguldak', districts: ['Merkez', 'Alaplı', 'Çaycuma', 'Devrek', 'Gökçebey', 'Kilimli', 'Kozlu'] },
  { name: 'Aksaray', districts: ['Merkez', 'Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Ortaköy', 'Sarıyahşi'] },
  { name: 'Bayburt', districts: ['Merkez', 'Aydıntepe', 'Demirözü'] },
  { name: 'Karaman', districts: ['Merkez', 'Ayrancı', 'Başyayla', 'Ermenek', 'Kazımkarabekir', 'Sarıveliler'] },
  { name: 'Kırıkkale', districts: ['Merkez', 'Bahşılı', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Sulakyurt', 'Yahşihan'] },
  { name: 'Batman', districts: ['Merkez', 'Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Sason'] },
  { name: 'Şırnak', districts: ['Merkez', 'Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Silopi', 'Uludere'] },
  { name: 'Bartın', districts: ['Merkez', 'Amasra', 'Kurucaşile', 'Ulus'] },
  { name: 'Ardahan', districts: ['Merkez', 'Çıldır', 'Damal', 'Göle', 'Hanak', 'Posof'] },
  { name: 'Iğdır', districts: ['Merkez', 'Aralık', 'Karakoyunlu', 'Tuzluca'] },
  { name: 'Yalova', districts: ['Merkez', 'Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Termal'] },
  { name: 'Karabük', districts: ['Merkez', 'Eflani', 'Eskipazar', 'Ovacık', 'Safranbolu', 'Yenice'] },
  { name: 'Kilis', districts: ['Merkez', 'Elbeyli', 'Musabeyli', 'Polateli'] },
  { name: 'Osmaniye', districts: ['Merkez', 'Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Sumbas', 'Toprakkale'] },
  { name: 'Düzce', districts: ['Merkez', 'Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Yığılca'] },
];

// İl adına göre ilçeleri getir
export const getDistrictsByCity = (cityName: string): string[] => {
  const city = turkeyCities.find(c => c.name === cityName);
  return city ? city.districts : [];
};

// Tüm il adlarını getir
export const getAllCities = (): string[] => {
  return turkeyCities.map(city => city.name);
};

