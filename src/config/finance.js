// =========================================================
// PÉNZÜGYI ALAPBEÁLLÍTÁSOK
//
// Ezek az értékek korábban külön-külön szerepeltek az
// Admin, a Business és az Expenses oldalon. Egy helyen
// tartva nem tudnak elcsúszni egymástól.
// =========================================================

/*
 * Alapértelmezett kezdőtőke.
 *
 * Csak akkor érvényes, ha a Firestore
 * finance/settings dokumentumban nincs
 * initialCapital érték.
 */
export const INITIAL_CAPITAL = 1000000;

/*
 * A kávézó indulásának hónapja.
 *
 * Ettől a hónaptól kezdve számolunk
 * pénzügyi időszakokat.
 */
export const FINANCE_START_PERIOD = "2026-08";
