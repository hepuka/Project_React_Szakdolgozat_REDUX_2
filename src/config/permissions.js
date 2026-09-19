// ============================================================
// SZEREPKÖRÖK
//
// Az értékek pontosan azok, amik a Firestore users
// dokumentumaiban szerepelnek. A kódban sehol nem írjuk ki
// őket sztringként, mindig ezekre a konstansokra hivatkozunk.
// ============================================================

export const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  LEADER: "Leader",
  EMPLOYEE: "Alap",
};

// ============================================================
// SZEREPKÖRÖK LISTÁJA (űrlapokhoz)
// ============================================================

export const ROLE_OPTIONS = Object.values(ROLES);

// ============================================================
// JOGOSULTSÁGOK
// ============================================================

export const PERMISSIONS = {
  // Főoldal
  MAIN_READ: "main.read",

  // Felhasználók
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",

  // Termékek
  PRODUCTS_READ: "products.read",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",

  // Rendelések
  ORDERS_READ: "orders.read",
  ORDERS_UPDATE: "orders.update",

  // Üzleti riport
  BUSINESS_READ: "business.read",

  // Kiadások
  EXPENSES_READ: "expenses.read",
  EXPENSES_CREATE: "expenses.create",
  EXPENSES_PAY: "expenses.pay",

  // Hibabejelentés
  CONTACT_READ: "contact.read",

  // Asztalok
  TABLES_READ: "tables.read",
  TABLES_USE: "tables.use",
};

// ============================================================
// SZEREPKÖR → JOGOSULTSÁGOK
//
// Ez a táblázat a rendszer egyetlen jogosultsági forrása:
// ebből készül a menü, az útvonalvédelem és a gombok
// láthatósága is.
// ============================================================

export const ROLE_PERMISSIONS = {
  /*
   * Admin: felhasználókezelés.
   *
   * Szándékosan nem kap termék-, rendelés- és
   * pénzügyi jogot: ezek a Manager és a Leader
   * feladatkörébe tartoznak.
   */
  [ROLES.ADMIN]: [
    PERMISSIONS.MAIN_READ,

    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,

    PERMISSIONS.CONTACT_READ,
  ],

  /*
   * Manager: termékek, rendelések és a
   * kiadások rögzítése.
   */
  [ROLES.MANAGER]: [
    PERMISSIONS.MAIN_READ,

    PERMISSIONS.USERS_READ,

    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,

    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,

    PERMISSIONS.EXPENSES_READ,
    PERMISSIONS.EXPENSES_CREATE,

    PERMISSIONS.CONTACT_READ,
  ],

  /*
   * Leader: üzleti riport, és a kiadások
   * rendezettre állítása.
   *
   * A rögzítés és a rendezés szándékosan két
   * külön szerepkörhöz tartozik (négy szem elve).
   */
  [ROLES.LEADER]: [
    PERMISSIONS.MAIN_READ,

    PERMISSIONS.USERS_READ,

    PERMISSIONS.PRODUCTS_READ,

    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,

    PERMISSIONS.BUSINESS_READ,

    PERMISSIONS.EXPENSES_READ,
    PERMISSIONS.EXPENSES_PAY,

    PERMISSIONS.CONTACT_READ,
  ],

  /*
   * Alap (felszolgáló): rendelésfelvétel és fizetés.
   */
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.PRODUCTS_READ,

    PERMISSIONS.ORDERS_READ,

    PERMISSIONS.TABLES_READ,
    PERMISSIONS.TABLES_USE,
  ],
};

// ============================================================
// MENÜ STRUKTÚRA
//
// A sorrend itt dől el. Mindenki azokat a pontokat látja,
// amelyekhez a szerepköre szerint joga van.
// ============================================================

export const MENU_ITEMS = [
  {
    label: "Rendelés / Fizetés",
    path: "/tables",
    icon: "🛎️",
    permission: PERMISSIONS.TABLES_USE,
  },

  {
    label: "Főoldal",
    path: "/main",
    icon: "⌂",
    permission: PERMISSIONS.MAIN_READ,
  },

  {
    label: "Felhasználók",
    path: "/users",
    icon: "👥",
    permission: PERMISSIONS.USERS_READ,
  },

  {
    label: "Új felhasználó",
    path: "/register/ADD",
    icon: "＋",
    permission: PERMISSIONS.USERS_CREATE,
  },

  {
    label: "Termékek",
    path: "/products",
    icon: "☕",
    permission: PERMISSIONS.PRODUCTS_READ,
  },

  {
    label: "Új termék",
    path: "/add-product/ADD",
    icon: "＋",
    permission: PERMISSIONS.PRODUCTS_CREATE,
  },

  {
    label: "Összes rendelés",
    path: "/orders",
    icon: "🧾",
    permission: PERMISSIONS.ORDERS_READ,
  },

  {
    label: "Munkabér és egyéb kiadások",
    path: "/expenses",
    icon: "💰",
    permission: PERMISSIONS.EXPENSES_READ,
  },

  {
    label: "Üzleti összesítő",
    path: "/business",
    icon: "📊",
    permission: PERMISSIONS.BUSINESS_READ,
  },

  {
    label: "Hibabejelentés",
    path: "/contact",
    icon: "💬",
    permission: PERMISSIONS.CONTACT_READ,
  },
];

// ============================================================
// SEGÉDFÜGGVÉNYEK
// ============================================================

export const getRoleFromUser = (user) => {
  if (!user?.displayName) {
    return "";
  }

  const parts = user.displayName.split("|");

  return parts[1] || "";
};

export const hasPermission = (role, permission) => {
  if (!role || !permission) {
    return false;
  }

  const rolePermissions = ROLE_PERMISSIONS[role] || [];

  return rolePermissions.includes(permission);
};

export const getUserPermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// ============================================================
// KEZDŐOLDAL SZEREPKÖR SZERINT
//
// Bejelentkezés után és jogosulatlan oldal megnyitásakor
// ide irányítjuk a felhasználót.
// ============================================================

export const getHomePath = (role) => {
  if (hasPermission(role, PERMISSIONS.MAIN_READ)) {
    return "/main";
  }

  if (hasPermission(role, PERMISSIONS.TABLES_USE)) {
    return "/tables";
  }

  return "/";
};

// ============================================================
// A SZEREPKÖR SZERINT ELÉRHETŐ MENÜPONTOK
// ============================================================

export const getMenuItems = (role) => {
  return MENU_ITEMS.filter((item) => hasPermission(role, item.permission));
};
