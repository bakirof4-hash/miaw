# 🤍 Asilzoda uchun Samimiy Do‘stona Uzr So‘rash Sayti & Boshqaruv Paneli (Admin)

Ushbu loyiha Asilzoda bilan do‘stlikni tiklash, unga iliq va samimiy tuyg‘ularni yetkazish hamda o‘zaro muloqot qilish uchun yaratilgan zamonaviy, animatsiyali va to‘liq avtonom (backend talab qilmaydigan) veb-sahifa va maxfiy Admin panelidir.

---

## ✨ Asosiy Imkoniyatlar (Frontend)

1. **🎨 Nafis Glassmorphism Dizayn:**
   - Yumshoq gradientlar, orqa fondagi nozik animatsiyali pufaklar (blobs) va suzib yuruvchi yulduzchalar/yurakchalar.
   - Sifatli shaffof oynasimon (glassmorphism) asosiy karta.
   - Zamonaviy *Plus Jakarta Sans* va *Outfit* tipografiyasi.

2. **😂 Qochib ketuvchi "YO‘Q" tugmasi:**
   - Sichqoncha yaqinlashganda yoki telefonda bosishga harakat qilinganda ekranning tasodifiy xavfsiz nuqtasiga qochadi.
   - Tugma hech qachon ekrandan chiqib ketmaydi (ekran o‘lchami va chekka chegaralari hisobga olingan).
   - Qochganda har safar kulgili maslahat bulutlari ko‘rinadi (*"Yo‘q deyishga shoshma 😭"*, *"Bu tugma qochib ketdi 😂"*, *"Bir marta o‘ylab ko‘r 😄"* va h.k.).
   - Web Audio API yordamida yoqimli va kulgili ovoz effektlari.

3. **❤️ "HA" tugmasi va Do‘stlik Tiklanishi:**
   - Bosilganda bayramona salyut (Canvas Confetti & yurakchalar) otiladi.
   - Modal oyna ochiladi:
     - *"🥹 RAHMAT, ASILZODA! ❤️"*
     - *"Demak, yana gaplashamiz! Men bundan juda xursandman. Do‘stligimizni qadrlayman va seni boshqa xafa qilmaslikka harakat qilaman. 🤝❤️"*
     - *"🔓 Do‘stlik qayta ochildi! Asilzoda seni blockdan ochdi 😂❤️"*
   - *"💬 Endi gaplashamiz"* tugmasi orqali suhbat boshlash imkoniyati.

4. **💬 O‘zaro Real-Vaqt Chat (Asilzoda ↔ Admin):**
   - Sayt burchagidagi 💬 **"Menga yoz"** tugmasi orqali to‘g‘ridan-to‘g‘ri yozishish oynasi ochiladi.
   - Yangi xabarlar darhol Admin panelga boradi va Admin javoblari Asilzoda ekranida real vaqtda yangilanadi (boshqa oyna yoki tabda ochilgan bo‘lsa ham sahifani yangilash shart emas!).

5. **🎵 Fon Musiqasi:**
   - Yuqori o‘ng burchakdagi tugma orqali yoqiladi (avtomatik yangramaydi).
   - Tashqi mp3 fayllarsiz, to‘g‘ridan-to‘g‘ri brauzerning Web Audio API orqali sokin akkordlar hosil qiladi (100% oflayn ishlaydi).

---

## 🔐 Boshqaruv Paneli (Admin Panel)

Admin panel alohida maxfiy sahifada (`admin.html`) joylashgan.

### 🔑 Standart Kirish Ma'lumotlari:
- **Login:** `admin`
- **Parol:** `admin123`
*(Parolni panelning "Sozlamalar" bo‘limidan o‘zingiz xohlagan boshqa parolga o‘zgartirishingiz mumkin, u brauzerda SHA-256 orqali xavfsiz saqlanadi).*

### 📊 Admin Panel Imkoniyatlari:
1. **Statistika va Ko‘rsatkichlar:**
   - 🔴 O‘qilmagan yangi xabarlar soni (jonli puls animatsiyasi bilan)
   - 💬 Jami xabarlar soni
   - ❤️ Kechirish holati (*Kechirdi 🔓* yoki *Kutilmoqda ⏳*)
   - 😂 Asilzoda "YO‘Q" tugmasini tutishga necha marta uringani hisoblagichi
2. **Kelgan Xabarlar va Jonli Chat:**
   - Asilzodadan kelgan barcha xabarlar ro‘yxati (sana, vaqt, o‘qilganlik holati).
   - O‘qildi deb belgilash, o‘chirish imkoniyatlari.
   - Tayyor shablon javob tugmalari (chips) va ixtiyoriy javob yozib yuborish.
3. **Javoblar va Harakatlar Tarixi:**
   - Asilzoda qachon "HA" deb bosgani, qachon xabar yozgani xronologiyasi.
4. **SMS Integratsiya Arxitekturasi:**
   - Eskiz.uz, PlayMobile yoki Twilio SMS provayderlari orqali Asilzoda xabar yozganda admin telefoniga SMS yuborish API-integratsiyasi uchun to‘liq tayyorlangan modul va JSON simulyatsiyasi.

---

## 📁 Fayllar Strukturasi

```
miaw/
├── index.html          # Asilzoda uchun asosiy uzr so‘rash sahifasi
├── admin.html          # Maxfiy Admin Boshqaruv Paneli
├── README.md           # Qo‘llanma va hujjatlar
├── css/
│   ├── style.css       # Asosiy saytning glassmorphism stillari va animatsiyalari
│   └── admin.css       # Admin panelining zamonaviy Dark/Glass dizayni
└── js/
    ├── storage.js      # Ma'lumotlar markazi (localStorage, real-time sync, auth)
    ├── audio.js        # Web Audio API ovoz sintezatori va fon musiqasi
    ├── confetti.js     # Canvas Confetti va yuraklar animatsiyasi
    ├── app.js          # Asosiy sahifaning interaktiv mantiqi va chati
    └── admin.js        # Admin panel boshqaruvi va xabarlarni qayta ishlash
```

---

## 🚀 Ishga Tushirish

Hech qanday o‘rnatish, server yoki dastur talab qilinmaydi!
1. `index.html` faylini istalgan brauzerda (Chrome, Safari, Edge, Firefox) ikki marta bosib oching.
2. Admin panelni ochish uchun:
   - Sayt pastidagi **"🔐 Boshqaruv paneli"** havolasini bosing yoki
   - Brauzerda bevosita `admin.html` faylini oching.
   - Login: `admin`, Parol: `admin123`
