# KunPao's Coffee – Management

Kávézói rendelés-, készlet- és pénzügykezelő webalkalmazás.
Szakdolgozati projekt.

A rendszer egy kávézó napi működését fedi le: asztali rendelésfelvétel
és fizetés, termék- és készletnyilvántartás, felhasználók és
jogosultságok kezelése, valamint havi pénzügyi zárás.

---

## Technológiák

| Réteg | Megoldás |
| --- | --- |
| Felület | React 18, React Router 6 |
| Állapotkezelés | Redux Toolkit |
| Stílus | SCSS, CSS-változókra épülő designtokenek |
| Adatbázis, hitelesítés | Firebase (Authentication, Cloud Firestore) |
| Képfeltöltés | Cloudinary |
| Építőeszköz | Vite |

---

## Indítás

```bash
npm install
npm run dev
```

Az alkalmazás a <http://localhost:3000> címen érhető el.

| Parancs | Mit csinál |
| --- | --- |
| `npm run dev` | Fejlesztői szerver |
| `npm run build` | Éles build a `dist` mappába |
| `npm run preview` | Az éles build kipróbálása helyben |
| `npm run lint` | ESLint ellenőrzés |

---

## Szerepkörök és jogosultságok

Négy szerepkör van: **Admin**, **Manager**, **Leader** és **Alap**
(alkalmazott). Azt, hogy melyik szerepkör mit tehet, egyetlen fájl
írja le: `src/config/permissions.js`.

Itt van a `PERMISSIONS` lista (mi az a művelet), a `ROLE_PERMISSIONS`
mátrix (ki végezheti el), valamint a menüpontok és a bejelentkezés
utáni kezdőoldal is szerepkörönként. Új jogosultság felvételéhez
csak ezt a fájlt kell bővíteni — az útvonalvédelem
(`ProtectedRoute`), a gombok megjelenítése (`RequirePermission`) és
az oldalsáv menüje mind ebből dolgozik.

---

## Mappaszerkezet

```
src/
  components/      újrahasznosítható komponensek (Layout, Sidebar, Icon,
                   asztali rendelés részei)
  config/          jogosultságok, pénzügyi és asztalkonstansok, Cloudinary
  customHooks/     Firestore-figyelők és az irányítópult adatrétege
  firebase/        Firebase inicializálás
  pages/
    admin/         adminisztrációs oldalak
      dashboard/   a főoldal panelei
    auth/          bejelentkezés, regisztráció, jelszó-visszaállítás
    employees/     rendelésfelvétel és fizetés
  Redux/slice/     auth és product szeletek
  services/        pénzügyi számítások, felhasználókezelés, segédfüggvények
  styles/          közös SCSS mixinek
  index.scss       designtokenek, világos és sötét téma, alapstílusok
```

---

## Firestore-kollekciók

| Kollekció | Tartalom |
| --- | --- |
| `users` | felhasználói adatlapok (a dokumentum azonosítója az auth UID) |
| `kunpaosproducts` | termékek és készletszintek |
| `kunpaosorders` | lezárt, kifizetett rendelések |
| `tableOrders` | az asztalokon éppen nyitott tételek (`tableNumber` mező) |
| `businessExpenses` | rezsi és egyéb kiadások |
| `stockPurchases` | beszerzések |
| `financePeriods` | havi pénzügyi időszakok, zárás és záró pénzkészlet |
| `finance/settings` | kezdőtőke |

---

## Biztonság

- A bejelentkezés **mindig** a Firebase Authenticationnel kezdődik, és
  csak sikeres hitelesítés után olvasunk bármit az adatbázisból.
- A böngésző tárolójába semmilyen felhasználói adat nem kerül. A
  munkamenetet oldalfrissítés után a `useAuthListener` állítja vissza
  a Firebase saját munkamenetéből.
- A fizetéshez kért PIN kódot minden alkalommal az adatbázisból
  olvassuk ki, nem tároljuk a kliensen.
- A hozzáférést a `firestore.rules` szabályozza. **A fájl módosítása
  önmagában nem elég: a Firebase konzolban publikálni kell.**

A `src/firebase/config.js` fájlban szereplő Firebase-kulcsok nyilvános
kliensazonosítók, nem titkos kulcsok — a Firebase dokumentációja
szerint a védelmet a biztonsági szabályok adják, nem a kulcsok
rejtése.
