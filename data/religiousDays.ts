// Dini günler verileri (2024-2026 yılları için)
export interface ReligiousDay {
  id: string;
  name: {
    tr: string;
    en: string;
    ar: string;
  };
  hijriDate: {
    day: number;
    month: number;
    year: number;
  };
  gregorianDate: string; // YYYY-MM-DD formatında
  type: 'ramadan' | 'eid' | 'other';
  description?: {
    tr: string;
    en: string;
    ar: string;
  };
}

export const religiousDays: ReligiousDay[] = [
  // 2024
  {
    id: 'ramadan-2024',
    name: {
      tr: 'Ramazan Başlangıcı',
      en: 'Ramadan Begins',
      ar: 'بداية رمضان',
    },
    hijriDate: { day: 1, month: 9, year: 1445 },
    gregorianDate: '2024-03-11',
    type: 'ramadan',
    description: {
      tr: 'Ramazan ayının ilk günü',
      en: 'First day of Ramadan',
      ar: 'أول يوم من رمضان',
    },
  },
  {
    id: 'laylat-al-qadr-2024',
    name: {
      tr: 'Kadir Gecesi',
      en: 'Laylat al-Qadr',
      ar: 'ليلة القدر',
    },
    hijriDate: { day: 27, month: 9, year: 1445 },
    gregorianDate: '2024-04-06',
    type: 'other',
    description: {
      tr: 'Bin aydan daha hayırlı gece',
      en: 'Night of Power, better than a thousand months',
      ar: 'ليلة خير من ألف شهر',
    },
  },
  {
    id: 'eid-al-fitr-2024',
    name: {
      tr: 'Ramazan Bayramı',
      en: 'Eid al-Fitr',
      ar: 'عيد الفطر',
    },
    hijriDate: { day: 1, month: 10, year: 1445 },
    gregorianDate: '2024-04-10',
    type: 'eid',
    description: {
      tr: 'Ramazan Bayramı\'nın ilk günü',
      en: 'First day of Eid al-Fitr',
      ar: 'أول يوم من عيد الفطر',
    },
  },
  {
    id: 'eid-al-fitr-2-2024',
    name: {
      tr: 'Ramazan Bayramı (2. Gün)',
      en: 'Eid al-Fitr (Day 2)',
      ar: 'عيد الفطر (اليوم الثاني)',
    },
    hijriDate: { day: 2, month: 10, year: 1445 },
    gregorianDate: '2024-04-11',
    type: 'eid',
  },
  {
    id: 'eid-al-fitr-3-2024',
    name: {
      tr: 'Ramazan Bayramı (3. Gün)',
      en: 'Eid al-Fitr (Day 3)',
      ar: 'عيد الفطر (اليوم الثالث)',
    },
    hijriDate: { day: 3, month: 10, year: 1445 },
    gregorianDate: '2024-04-12',
    type: 'eid',
  },
  {
    id: 'arafah-2024',
    name: {
      tr: 'Arafat Günü',
      en: 'Day of Arafah',
      ar: 'يوم عرفة',
    },
    hijriDate: { day: 9, month: 12, year: 1445 },
    gregorianDate: '2024-06-15',
    type: 'other',
    description: {
      tr: 'Hac ibadetinin en önemli günü',
      en: 'The most important day of Hajj',
      ar: 'أهم يوم في الحج',
    },
  },
  {
    id: 'eid-al-adha-2024',
    name: {
      tr: 'Kurban Bayramı',
      en: 'Eid al-Adha',
      ar: 'عيد الأضحى',
    },
    hijriDate: { day: 10, month: 12, year: 1445 },
    gregorianDate: '2024-06-16',
    type: 'eid',
    description: {
      tr: 'Kurban Bayramı\'nın ilk günü',
      en: 'First day of Eid al-Adha',
      ar: 'أول يوم من عيد الأضحى',
    },
  },
  {
    id: 'eid-al-adha-2-2024',
    name: {
      tr: 'Kurban Bayramı (2. Gün)',
      en: 'Eid al-Adha (Day 2)',
      ar: 'عيد الأضحى (اليوم الثاني)',
    },
    hijriDate: { day: 11, month: 12, year: 1445 },
    gregorianDate: '2024-06-17',
    type: 'eid',
  },
  {
    id: 'eid-al-adha-3-2024',
    name: {
      tr: 'Kurban Bayramı (3. Gün)',
      en: 'Eid al-Adha (Day 3)',
      ar: 'عيد الأضحى (اليوم الثالث)',
    },
    hijriDate: { day: 12, month: 12, year: 1445 },
    gregorianDate: '2024-06-18',
    type: 'eid',
  },
  {
    id: 'eid-al-adha-4-2024',
    name: {
      tr: 'Kurban Bayramı (4. Gün)',
      en: 'Eid al-Adha (Day 4)',
      ar: 'عيد الأضحى (اليوم الرابع)',
    },
    hijriDate: { day: 13, month: 12, year: 1445 },
    gregorianDate: '2024-06-19',
    type: 'eid',
  },
  {
    id: 'mawlid-2024',
    name: {
      tr: 'Mevlid Kandili',
      en: 'Mawlid al-Nabi',
      ar: 'المولد النبوي',
    },
    hijriDate: { day: 12, month: 3, year: 1446 },
    gregorianDate: '2024-09-15',
    type: 'other',
    description: {
      tr: 'Peygamberimizin doğum günü',
      en: 'Birthday of Prophet Muhammad',
      ar: 'عيد المولد النبوي الشريف',
    },
  },
  {
    id: 'isra-miraj-2024',
    name: {
      tr: 'İsra ve Miraç Kandili',
      en: 'Isra and Mi\'raj',
      ar: 'الإسراء والمعراج',
    },
    hijriDate: { day: 27, month: 7, year: 1446 },
    gregorianDate: '2024-02-08',
    type: 'other',
    description: {
      tr: 'Peygamberimizin İsra ve Miraç mucizesi',
      en: 'The Night Journey and Ascension',
      ar: 'ليلة الإسراء والمعراج',
    },
  },
  {
    id: 'regab-2024',
    name: {
      tr: 'Regaip Kandili',
      en: 'Rajab Night',
      ar: 'ليلة الرغائب',
    },
    hijriDate: { day: 1, month: 7, year: 1446 },
    gregorianDate: '2024-01-13',
    type: 'other',
  },
  {
    id: 'baraat-2024',
    name: {
      tr: 'Berat Kandili',
      en: 'Laylat al-Bara\'ah',
      ar: 'ليلة البراءة',
    },
    hijriDate: { day: 15, month: 8, year: 1446 },
    gregorianDate: '2024-02-24',
    type: 'other',
    description: {
      tr: 'Berat gecesi',
      en: 'Night of Absolution',
      ar: 'ليلة البراءة',
    },
  },
  // 2025
  {
    id: 'ramadan-2025',
    name: {
      tr: 'Ramazan Başlangıcı',
      en: 'Ramadan Begins',
      ar: 'بداية رمضان',
    },
    hijriDate: { day: 1, month: 9, year: 1446 },
    gregorianDate: '2025-03-01',
    type: 'ramadan',
    description: {
      tr: 'Ramazan ayının ilk günü',
      en: 'First day of Ramadan',
      ar: 'أول يوم من رمضان',
    },
  },
  {
    id: 'laylat-al-qadr-2025',
    name: {
      tr: 'Kadir Gecesi',
      en: 'Laylat al-Qadr',
      ar: 'ليلة القدر',
    },
    hijriDate: { day: 27, month: 9, year: 1446 },
    gregorianDate: '2025-03-27',
    type: 'other',
    description: {
      tr: 'Bin aydan daha hayırlı gece',
      en: 'Night of Power, better than a thousand months',
      ar: 'ليلة خير من ألف شهر',
    },
  },
  {
    id: 'eid-al-fitr-2025',
    name: {
      tr: 'Ramazan Bayramı',
      en: 'Eid al-Fitr',
      ar: 'عيد الفطر',
    },
    hijriDate: { day: 1, month: 10, year: 1446 },
    gregorianDate: '2025-03-31',
    type: 'eid',
    description: {
      tr: 'Ramazan Bayramı\'nın ilk günü',
      en: 'First day of Eid al-Fitr',
      ar: 'أول يوم من عيد الفطر',
    },
  },
  {
    id: 'eid-al-fitr-2-2025',
    name: {
      tr: 'Ramazan Bayramı (2. Gün)',
      en: 'Eid al-Fitr (Day 2)',
      ar: 'عيد الفطر (اليوم الثاني)',
    },
    hijriDate: { day: 2, month: 10, year: 1446 },
    gregorianDate: '2025-04-01',
    type: 'eid',
  },
  {
    id: 'eid-al-fitr-3-2025',
    name: {
      tr: 'Ramazan Bayramı (3. Gün)',
      en: 'Eid al-Fitr (Day 3)',
      ar: 'عيد الفطر (اليوم الثالث)',
    },
    hijriDate: { day: 3, month: 10, year: 1446 },
    gregorianDate: '2025-04-02',
    type: 'eid',
  },
  {
    id: 'arafah-2025',
    name: {
      tr: 'Arafat Günü',
      en: 'Day of Arafah',
      ar: 'يوم عرفة',
    },
    hijriDate: { day: 9, month: 12, year: 1446 },
    gregorianDate: '2025-06-05',
    type: 'other',
    description: {
      tr: 'Hac ibadetinin en önemli günü',
      en: 'The most important day of Hajj',
      ar: 'أهم يوم في الحج',
    },
  },
  {
    id: 'eid-al-adha-2025',
    name: {
      tr: 'Kurban Bayramı',
      en: 'Eid al-Adha',
      ar: 'عيد الأضحى',
    },
    hijriDate: { day: 10, month: 12, year: 1446 },
    gregorianDate: '2025-06-06',
    type: 'eid',
    description: {
      tr: 'Kurban Bayramı\'nın ilk günü',
      en: 'First day of Eid al-Adha',
      ar: 'أول يوم من عيد الأضحى',
    },
  },
  {
    id: 'eid-al-adha-2-2025',
    name: {
      tr: 'Kurban Bayramı (2. Gün)',
      en: 'Eid al-Adha (Day 2)',
      ar: 'عيد الأضحى (اليوم الثاني)',
    },
    hijriDate: { day: 11, month: 12, year: 1446 },
    gregorianDate: '2025-06-07',
    type: 'eid',
  },
  {
    id: 'eid-al-adha-3-2025',
    name: {
      tr: 'Kurban Bayramı (3. Gün)',
      en: 'Eid al-Adha (Day 3)',
      ar: 'عيد الأضحى (اليوم الثالث)',
    },
    hijriDate: { day: 12, month: 12, year: 1446 },
    gregorianDate: '2025-06-08',
    type: 'eid',
  },
  {
    id: 'eid-al-adha-4-2025',
    name: {
      tr: 'Kurban Bayramı (4. Gün)',
      en: 'Eid al-Adha (Day 4)',
      ar: 'عيد الأضحى (اليوم الرابع)',
    },
    hijriDate: { day: 13, month: 12, year: 1446 },
    gregorianDate: '2025-06-09',
    type: 'eid',
  },
  // 2026
  {
    id: 'ramadan-2026',
    name: {
      tr: 'Ramazan Başlangıcı',
      en: 'Ramadan Begins',
      ar: 'بداية رمضان',
    },
    hijriDate: { day: 1, month: 9, year: 1447 },
    gregorianDate: '2026-02-18',
    type: 'ramadan',
    description: {
      tr: 'Ramazan ayının ilk günü',
      en: 'First day of Ramadan',
      ar: 'أول يوم من رمضان',
    },
  },
  {
    id: 'laylat-al-qadr-2026',
    name: {
      tr: 'Kadir Gecesi',
      en: 'Laylat al-Qadr',
      ar: 'ليلة القدر',
    },
    hijriDate: { day: 27, month: 9, year: 1447 },
    gregorianDate: '2026-03-16',
    type: 'other',
    description: {
      tr: 'Bin aydan daha hayırlı gece',
      en: 'Night of Power, better than a thousand months',
      ar: 'ليلة خير من ألف شهر',
    },
  },
  {
    id: 'eid-al-fitr-2026',
    name: {
      tr: 'Ramazan Bayramı',
      en: 'Eid al-Fitr',
      ar: 'عيد الفطر',
    },
    hijriDate: { day: 1, month: 10, year: 1447 },
    gregorianDate: '2026-03-20',
    type: 'eid',
    description: {
      tr: 'Ramazan Bayramı\'nın ilk günü',
      en: 'First day of Eid al-Fitr',
      ar: 'أول يوم من عيد الفطر',
    },
  },
  {
    id: 'eid-al-fitr-2-2026',
    name: {
      tr: 'Ramazan Bayramı (2. Gün)',
      en: 'Eid al-Fitr (Day 2)',
      ar: 'عيد الفطر (اليوم الثاني)',
    },
    hijriDate: { day: 2, month: 10, year: 1447 },
    gregorianDate: '2026-03-21',
    type: 'eid',
  },
  {
    id: 'eid-al-fitr-3-2026',
    name: {
      tr: 'Ramazan Bayramı (3. Gün)',
      en: 'Eid al-Fitr (Day 3)',
      ar: 'عيد الفطر (اليوم الثالث)',
    },
    hijriDate: { day: 3, month: 10, year: 1447 },
    gregorianDate: '2026-03-22',
    type: 'eid',
  },
  {
    id: 'arafah-2026',
    name: {
      tr: 'Arafat Günü',
      en: 'Day of Arafah',
      ar: 'يوم عرفة',
    },
    hijriDate: { day: 9, month: 12, year: 1447 },
    gregorianDate: '2026-05-25',
    type: 'other',
    description: {
      tr: 'Hac ibadetinin en önemli günü',
      en: 'The most important day of Hajj',
      ar: 'أهم يوم في الحج',
    },
  },
  {
    id: 'eid-al-adha-2026',
    name: {
      tr: 'Kurban Bayramı',
      en: 'Eid al-Adha',
      ar: 'عيد الأضحى',
    },
    hijriDate: { day: 10, month: 12, year: 1447 },
    gregorianDate: '2026-05-26',
    type: 'eid',
    description: {
      tr: 'Kurban Bayramı\'nın ilk günü',
      en: 'First day of Eid al-Adha',
      ar: 'أول يوم من عيد الأضحى',
    },
  },
  {
    id: 'eid-al-adha-2-2026',
    name: {
      tr: 'Kurban Bayramı (2. Gün)',
      en: 'Eid al-Adha (Day 2)',
      ar: 'عيد الأضحى (اليوم الثاني)',
    },
    hijriDate: { day: 11, month: 12, year: 1447 },
    gregorianDate: '2026-05-27',
    type: 'eid',
  },
  {
    id: 'eid-al-adha-3-2026',
    name: {
      tr: 'Kurban Bayramı (3. Gün)',
      en: 'Eid al-Adha (Day 3)',
      ar: 'عيد الأضحى (اليوم الثالث)',
    },
    hijriDate: { day: 12, month: 12, year: 1447 },
    gregorianDate: '2026-05-28',
    type: 'eid',
  },
  {
    id: 'eid-al-adha-4-2026',
    name: {
      tr: 'Kurban Bayramı (4. Gün)',
      en: 'Eid al-Adha (Day 4)',
      ar: 'عيد الأضحى (اليوم الرابع)',
    },
    hijriDate: { day: 13, month: 12, year: 1447 },
    gregorianDate: '2026-05-29',
    type: 'eid',
  },
];

// Bugünden itibaren gelecek dini günleri getir
export const getUpcomingReligiousDays = (): ReligiousDay[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcoming = religiousDays
    .filter(day => {
      const dayDate = new Date(day.gregorianDate);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.gregorianDate);
      const dateB = new Date(b.gregorianDate);
      return dateA.getTime() - dateB.getTime();
    });
  
  // Eğer yaklaşan gün yoksa, tüm dini günleri göster (geçmiş ve gelecek)
  if (upcoming.length === 0) {
    return religiousDays.sort((a, b) => {
      const dateA = new Date(a.gregorianDate);
      const dateB = new Date(b.gregorianDate);
      return dateA.getTime() - dateB.getTime();
    });
  }
  
  return upcoming;
};

// Belirli bir tarihe göre dini günleri getir
export const getReligiousDaysByYear = (year: number): ReligiousDay[] => {
  return religiousDays.filter(day => {
    const dayYear = new Date(day.gregorianDate).getFullYear();
    return dayYear === year;
  });
};

