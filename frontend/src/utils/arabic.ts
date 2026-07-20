/**
 * Arabic script detection — matches Flutter's containsArabic() function.
 * Unicode ranges:
 *   U+0600–U+06FF  Arabic
 *   U+0750–U+077F  Arabic Supplement
 *   U+08A0–U+08FF  Arabic Extended-A
 *   U+FB50–U+FDFF  Arabic Presentation Forms-A
 *   U+FE70–U+FEFF  Arabic Presentation Forms-B
 */
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/

export function containsArabic(text: string): boolean {
  return ARABIC_REGEX.test(text)
}

/**
 * Determine the effective text language for a given name, respecting
 * the user-selected TextMode. Mirrors Flutter textLanguage().
 */
export function textLanguage(name: string, mode: 'auto' | 'ar' | 'en'): 'ar' | 'en' {
  if (mode === 'ar') return 'ar'
  if (mode === 'en') return 'en'
  return containsArabic(name) ? 'ar' : 'en'
}

/**
 * Compute the set of required languages from a list of names.
 * Used by validation to decide which fonts are required.
 */
export function requiredLanguages(
  names: string[],
  mode: 'auto' | 'ar' | 'en'
): Set<'ar' | 'en'> {
  if (mode === 'ar') return new Set(['ar'])
  if (mode === 'en') return new Set(['en'])
  const langs = new Set<'ar' | 'en'>()
  for (const name of names) {
    langs.add(textLanguage(name, mode))
  }
  return langs
}
