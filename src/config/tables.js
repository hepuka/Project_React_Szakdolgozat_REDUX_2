/* =========================================================
   ASZTALOK
   =========================================================

   Az asztalok száma és a hozzájuk tartozó rendelési tételek
   kollekciója egy helyen.

   Korábban minden asztalnak saját Firestore-kollekciója volt
   (tableorders_1 ... tableorders_10). Emiatt a főoldalnak tíz
   külön figyelőt kellett nyitnia, új asztal felvételéhez pedig
   kódot kellett írni. Most egyetlen tableOrders kollekció van,
   és a tétel tableNumber mezője mondja meg, melyik asztalhoz
   tartozik.
   ========================================================= */

export const TABLE_COUNT = 10;

export const TABLE_ORDERS = "tableOrders";
