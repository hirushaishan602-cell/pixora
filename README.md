# PIXORA — Firebase-powered site with Admin Panel

මේක Next.js site එකක්, Firebase (Auth + Firestore + Storage) පාවිච්චි කරලා පුරාවටම admin panel එකකින් manage කරන්න පුළුවන් විදිහට හදලා තියෙන්නේ.

**මේක ඔයාගේ Creativo Firebase project එකේම run කරන්න පුළුවන්** — අලුත් Firebase project එකක් හදන්න ඕන නෑ. Data conflict වෙන්නෙ නැති වෙන්න collection/storage path ඔක්කොම `pixora_` / `pixora-` prefix එකකින් namespace කරලා තියෙන්නේ (`pixora_users`, `pixora_projects`, `pixora_siteConfig`, `pixora-projects/` storage folder) — ඉතින් Creativo ගේ `users`, `siteConfig` ආදී collections වලට කිසිම බලපෑමක් වෙන්නෙ නෑ.

## මොනවද build කරලා තියෙන්නේ

- **Admin Panel** — `/admin/login` වලින් login වෙලා `/admin` යටතේ:
  - **Projects** — portfolio එකට project (image + title + category + description) upload/edit/delete කරන්න
  - **Site Settings** — hero text, about text, stats, contact info, **WhatsApp number**, **social media links**, CTA — සියල්ල මෙතනින්ම edit කරන්න, save කරාම site එකේ instant update වෙනවා
  - **Admin Users** — main admin කෙනාට විතරක් පේනවා. අලුත් admin කෙනෙක් email + password එකකින් add කරන්න පුළුවන්
- **Public site**:
  - Portfolio section එක admin panel එකෙන් upload කරන projects auto-fetch කරලා පෙන්නනවා
  - Contact form එකෙන් "Send via WhatsApp" click කළාම, ඇතුල් කරපු details එක්කම WhatsApp chat එකට redirect වෙනවා
  - Footer/Navbar එකේ social media icons — admin panel එකේ link දාපු ඒවා විතරක් පේනවා

## 1. Creativo ගේ Firebase config එකම දාන්න

`.env.local.example` file එක `.env.local` කියලා copy කරගන්න:

```bash
cp .env.local.example .env.local
```

Creativo codebase එකේ Firebase config එක තියෙන තැනින් (`firebaseConfig = {...}` object එක) මේ values copy කරගෙන `.env.local` එකේ දාන්න:

```
NEXT_PUBLIC_FIREBASE_API_KEY=          → apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=      → authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=       → projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=   → storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= → messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=           → appId
```

Admin panel එකට (server-side admin user creation) අමතරව මේවත් ඕන — Firebase Console > Project Settings > **Service Accounts** > **Generate new private key**:

```
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

(මේ service account key එක download කරගත්තු JSON file එකේ `project_id`, `client_email`, `private_key` values.)

## 2. Security Rules — ADD කරන්න, REPLACE කරන්න එපා

⚠️ Creativo ගේ දැනට තියෙන `firestore.rules` සහ `storage.rules` **overwrite කරන්න එපා**. මේ repo එකේ `firestore.rules` / `storage.rules` file දෙකේ තියෙන `match` blocks විතරක් copy කරලා, Creativo ගේ existing rules file එකේ `match /databases/{database}/documents { ... }` block එක ඇතුලට **add** කරන්න (existing rules ඒ විදිහටම තියෙන්න ඕන).

Firebase Console > Firestore Database > Rules, සහ Console > Storage > Rules දෙකෙන්ම මේක කරන්න ඕන.

## 3. Install & Run

```bash
npm install
npm run dev
```

## 4. පළවෙනි Main Admin එක හදන්න (එක පාරක් විතරයි)

දැන් UID එක Firebase Console එකෙන් copy කරලා Firestore එකට manual එකෙන් type කරන්න ඕන නෑ. ඒ වෙනුවට:

1. `.env.local` එකේ `MAIN_ADMIN_EMAIL=` කියලා තියෙන line එකට ඔයාට main admin කරගන්න ඕන email එක දාන්න (උදා: `MAIN_ADMIN_EMAIL=you@example.com`)
2. Site එකේ `/signup` වලින් **ඒ එකම email එකෙන්ම** account එකක් හදන්න (normal client signup එකක් වගේ)
3. Login වෙච්ච ගමන්ම ඒ user ලා automatic-ම `mainAdmin` බවට promote වෙනවා — ඊට පස්සේ `/admin` login/dashboard පේනවා

මේක `MAIN_ADMIN_EMAIL` එකට match වෙන email එකෙන් login/signup වෙන හැම වෙලාවෙම check කරනවා, ඒ නිසා අනාගතේ ඕන නම් email එක වෙනස් කරලා Vercel/`.env.local` update කරලා ඒ email එකෙන් login වුනොත් ඒ කෙනාත් mainAdmin වෙනවා.

ඊට පස්සේ අනිත් admin ලා (mainAdmin නෙවෙයි, plain admin) Admin Users page එකෙන්ම add කරන්න පුළුවන් — ඒක කලින් වගේම.

## 5. Deploy

Vercel එකට deploy කරනකොට environment variables ටික (Project Settings > Environment Variables) එතනටත් දාන්න ඕන — `MAIN_ADMIN_EMAIL` එකත් අමතක කරන්න එපා. `.env.local` commit කරන්න එපා (`.gitignore` වල already තියෙනවා).

---

## Original create-next-app info

This is a [Next.js](https://nextjs.org) project. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).
