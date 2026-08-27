// ============================================================
// SZEREPKÖRÖK
// ============================================================

export const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  LEADER: "Leader",
  EMPLOYEE: "Employee",
};

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

  // Hibabejelentés
  CONTACT_READ: "contact.read",

  // Asztalok
  TABLES_READ: "tables.read",
  TABLES_USE: "tables.use",
};

// ============================================================
// SZEREPKÖR → JOGOSULTSÁGOK
// ============================================================

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.MAIN_READ,

    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,

    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,

    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,

    PERMISSIONS.BUSINESS_READ,

    PERMISSIONS.CONTACT_READ,

    PERMISSIONS.TABLES_READ,
    PERMISSIONS.TABLES_USE,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.MAIN_READ,

    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,

    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,

    PERMISSIONS.CONTACT_READ,

    PERMISSIONS.TABLES_READ,
    PERMISSIONS.TABLES_USE,
  ],

  [ROLES.LEADER]: [
    PERMISSIONS.MAIN_READ,

    PERMISSIONS.PRODUCTS_READ,

    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,

    PERMISSIONS.BUSINESS_READ,

    PERMISSIONS.CONTACT_READ,
  ],

  [ROLES.EMPLOYEE]: [
    PERMISSIONS.PRODUCTS_READ,

    PERMISSIONS.ORDERS_READ,

    PERMISSIONS.TABLES_READ,
    PERMISSIONS.TABLES_USE,
  ],
};

// ============================================================
// MENÜ STRUKTÚRA
// ============================================================

export const MENU_ITEMS = [
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

  {
    label: "Rendelés / Fizetés",
    path: "/tables",
    icon: "🛎️",
    permission: PERMISSIONS.TABLES_USE,
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
