# İftar/Sahur Vakti Uygulaması

React Native ve Expo kullanılarak geliştirilmiş bir İftar ve Sahur Vakti takip uygulaması. Uygulama, kullanıcının mevcut veya manuel olarak belirlenen konumuna göre namaz vakitlerini alır ve bu vakitlere göre iftar ve sahura kalan süreyi hesaplayıp gösterir.

## 🚀 Özellikler

- **Otomatik ve Manuel Konum**: GPS ile otomatik konum veya manuel şehir/ülke girişi
- **Canlı Geri Sayım**: İftar ve Sahur vakitlerine kalan süreyi gerçek zamanlı gösterir
- **Namaz Vakitleri**: Günün tüm namaz vakitlerini (İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı) gösterir
- **Hicri ve Miladi Tarih**: Hem Hicri hem de Miladi tarih gösterimi
- **Bildirimler**: İftar ve Sahur vakitleri için özelleştirilebilir bildirimler
- **Karanlık Mod Desteği**: Otomatik karanlık/aydınlık mod desteği
- **Modern UI**: Sade ve kullanıcı dostu arayüz

## 🛠️ Teknoloji Stack

- **React Native** (0.81.5)
- **Expo** (~54.0.23)
- **Expo Router** (file-based routing)
- **TypeScript**
- **Context API** (state management)
- **AsyncStorage** (veri saklama)
- **Expo Location** (konum servisleri)
- **Expo Notifications** (bildirimler)
- **date-fns** (tarih/zaman işlemleri)
- **Aladhan API** (namaz vakitleri)

## 📦 Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. Uygulamayı başlatın:

```bash
npx expo start
```

3. Uygulamayı çalıştırın:

- **iOS**: `i` tuşuna basın veya iOS simülatöründe açın
- **Android**: `a` tuşuna basın veya Android emülatöründe açın
- **Web**: `w` tuşuna basın

## 📱 Kullanım

### İlk Kullanım

1. Uygulama ilk açıldığında konum izni isteyecektir. İzin vererek otomatik konum kullanabilirsiniz.
2. Alternatif olarak, Ayarlar ekranından manuel olarak şehir ve ülke girebilirsiniz.

### Ana Ekran

- **Geri Sayım**: Ekranın ortasında bir sonraki vakit (İftar veya Sahur) için geri sayım gösterilir
- **Namaz Vakitleri**: Tüm namaz vakitleri liste halinde gösterilir
- **Tarih**: Hem Miladi hem de Hicri tarih gösterilir
- **Yenileme**: Ekranı aşağı çekerek vakitleri yenileyebilirsiniz

### Ayarlar Ekranı

#### Konum Ayarları

- **Otomatik Konum**: GPS ile otomatik konum kullanımı
- **Manuel Konum**: Şehir ve ülke adı ile manuel konum ayarlama

#### Bildirim Ayarları

- **Bildirimleri Aç/Kapat**: Tüm bildirimleri tek seferde açıp kapatma
- **Sahur Bildirimi**: Sahur vakti için bildirim ayarlama
- **İftar Bildirimi**: İftar vakti için bildirim ayarlama
- **Zamanlama**: Bildirimin vaktin kaç dakika öncesinde geleceğini ayarlama (0 = vakit geldiğinde)

## 🔧 Yapılandırma

### app.json

Uygulama yapılandırması `app.json` dosyasında bulunur. Konum ve bildirim izinleri burada tanımlanmıştır.

### API

Uygulama, namaz vakitlerini almak için [Aladhan API](http://api.aladhan.com) kullanır. API yapılandırması `services/api.ts` dosyasında bulunur.

## 📁 Proje Yapısı

```
iftaranekadarkaldi/
├── app/                    # Expo Router ekranları
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Ana ekran
│   └── settings.tsx       # Ayarlar ekranı
├── context/               # Context API
│   └── PrayerTimesContext.tsx
├── services/              # Servisler
│   ├── api.ts            # Aladhan API entegrasyonu
│   ├── location.ts       # Konum servisleri
│   └── notifications.ts  # Bildirim servisleri
├── types/                 # TypeScript tipleri
│   └── index.ts
├── utils/                 # Yardımcı fonksiyonlar
│   └── dateUtils.ts      # Tarih/zaman yardımcıları
└── package.json
```

## 🎨 Özelleştirme

### Tema

Uygulama, sistem temasını otomatik olarak algılar. Karanlık mod ve aydınlık mod desteği vardır.

### Hesaplama Metodu

Varsayılan olarak Diyanet İşleri metodu (method: 2) kullanılır. `services/api.ts` dosyasında değiştirilebilir.

## 📝 Notlar

- Widget özelliği henüz implement edilmemiştir. Expo'nun widget desteği sınırlı olduğu için, bu özellik için native modül geliştirmesi gerekebilir.
- Bildirimler, uygulama kapalıyken de çalışır ancak cihazın bildirim izni vermesi gerekir.
- Konum izni verilmezse, manuel konum girişi yapılmalıdır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel bir projedir.

## 🙏 Teşekkürler

- [Aladhan API](http://api.aladhan.com) - Namaz vakitleri API'si
- [Expo](https://expo.dev) - React Native framework
- [date-fns](https://date-fns.org) - Tarih/zaman kütüphanesi
