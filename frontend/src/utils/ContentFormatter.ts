/**
 * Utility functions to handle new database format with:
 * - Bilingual titles: [English, Serbian] or string
 * - Sentence alternatives: string or [alternative1, alternative2, ...]
 */

/**
 * Get the title in the requested language
 */
export function getTitle(title: string | [string, string], lang: 'en' | 'sr'): string {
  if (typeof title === 'string') {
    return title;
  }
  // title is [english, serbian]
  return lang === 'en' ? title[0] : title[1];
}

/**
 * Get both language titles
 */
export function getTitles(title: string | [string, string]): { en: string; sr: string } {
  if (typeof title === 'string') {
    return { en: title, sr: title };
  }
  return { en: title[0], sr: title[1] };
}

/**
 * Get a single sentence translation (picks first alternative if multiple exist)
 */
export function getSentenceText(sentence: string | string[]): string {
  if (typeof sentence === 'string') {
    return sentence;
  }
  // sentence is array of alternatives - return first one
  return sentence[0];
}

/**
 * Get all alternatives for a sentence
 */
export function getSentenceAlternatives(sentence: string | string[]): string[] {
  if (typeof sentence === 'string') {
    return [sentence];
  }
  return sentence;
}

/**
 * Normalize text for comparison (removes trailing punctuation)
 */
export function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/[.!?]+$/, '');
}

/**
 * Check if user answer matches any alternative of the correct sentence
 * For Serbian answers, also tries Cyrillic-to-Latin conversion
 */
export function checkAnswerWithAlternatives(
  userAnswer: string,
  correctSentence: string | string[],
  isSerbianAnswer?: boolean
): boolean {
  const normalizedUserAnswer = normalizeText(userAnswer);
  const alternatives = getSentenceAlternatives(correctSentence);
  
  // First, try direct match
  let matches = alternatives.some(alt => normalizeText(alt) === normalizedUserAnswer);
  
  // If no match and this is Serbian answer, try converting alternatives to Latin
  if (!matches && isSerbianAnswer) {
    matches = alternatives.some(alt => {
      const latinAlt = cyrillicToLatin(alt);
      return normalizeText(latinAlt) === normalizedUserAnswer;
    });
  }
  
  return matches;
}

/**
 * Convert Serbian Cyrillic to Latin (for speech recognition output normalization)
 * Based on official Serbian Cyrillic-to-Latin mapping
 * Handles digraphs: Љ→Lj, Њ→Nj, Џ→Dž
 */
export function cyrillicToLatin(text: string): string {
  const cyrillicToLatinMap: { [key: string]: string } = {
    // Uppercase
    'А': 'A',
    'Б': 'B',
    'В': 'V',
    'Г': 'G',
    'Д': 'D',
    'Ђ': 'Đ',
    'Е': 'E',
    'Ж': 'Ž',
    'З': 'Z',
    'И': 'I',
    'Ј': 'J',
    'К': 'K',
    'Л': 'L',
    'Љ': 'Lj',
    'М': 'M',
    'Н': 'N',
    'Њ': 'Nj',
    'О': 'O',
    'П': 'P',
    'Р': 'R',
    'С': 'S',
    'Т': 'T',
    'Ћ': 'Ć',
    'У': 'U',
    'Ф': 'F',
    'Х': 'H',
    'Ц': 'C',
    'Ч': 'Č',
    'Ш': 'Š',
    'Џ': 'Dž',
    // Lowercase
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'ђ': 'đ',
    'е': 'e',
    'ж': 'ž',
    'з': 'z',
    'и': 'i',
    'ј': 'j',
    'к': 'k',
    'л': 'l',
    'љ': 'lj',
    'м': 'm',
    'н': 'n',
    'њ': 'nj',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'ћ': 'ć',
    'у': 'u',
    'ф': 'f',
    'х': 'h',
    'ц': 'c',
    'ч': 'č',
    'ш': 'š',
    'џ': 'dž',
  };

  return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
}
