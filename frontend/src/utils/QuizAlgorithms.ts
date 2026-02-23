import { Sentence } from '../types';
import { getSentenceText } from './ContentFormatter';

/**
 * Algorithm A: Random selection with removal
 *
 * - Randomly picks from remaining sentences in the lesson
 * - Correct answer → remove from set
 * - Wrong answer → keep in set, reinsert at random position
 * - When set is empty → refill with all sentences and continue
 */
export class AlgorithmA {
  private allSentences: Sentence[];
  private remainingSentences: Sentence[];
  private currentSentence: Sentence | null = null;

  constructor(sentences: Sentence[]) {
    this.allSentences = [...sentences];
    this.remainingSentences = [...sentences];
    this.shuffle();
  }

  private shuffle(): void {
    for (let i = this.remainingSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.remainingSentences[i], this.remainingSentences[j]] =
        [this.remainingSentences[j], this.remainingSentences[i]];
    }
  }

  getNextSentence(): Sentence {
    if (this.remainingSentences.length === 0) {
      this.remainingSentences = [...this.allSentences];
      this.shuffle();
    }
    this.currentSentence = this.remainingSentences[0];
    return this.currentSentence;
  }

  recordAnswer(isCorrect: boolean): void {
    if (!this.currentSentence) return;

    if (isCorrect) {
      this.remainingSentences = this.remainingSentences.filter(s => s !== this.currentSentence);
    } else {
      const current = this.currentSentence;
      this.remainingSentences = this.remainingSentences.filter(s => s !== current);
      const randomIndex = Math.floor(Math.random() * (this.remainingSentences.length + 1));
      this.remainingSentences.splice(randomIndex, 0, current);
    }

    this.currentSentence = null;
  }

  getProgress(): { remaining: number; total: number; completed: number } {
    const remaining = this.remainingSentences.length;
    const total = this.allSentences.length;
    return { remaining, total, completed: total - remaining };
  }

  reset(): void {
    this.remainingSentences = [...this.allSentences];
    this.shuffle();
    this.currentSentence = null;
  }
}

/**
 * Generate 4 wrong answers for multiple choice from the same lesson.
 */
export function generateWrongAnswers(
  correctSentence: Sentence,
  lessonSentences: Sentence[],
  answerLangIndex: number
): string[] {
  const correctText = correctSentence[answerLangIndex];

  const possibleWrong = lessonSentences
    .filter(s => s !== correctSentence && s[answerLangIndex] !== correctText)
    .map(s => getSentenceText(s[answerLangIndex]));

  return [...possibleWrong].sort(() => Math.random() - 0.5).slice(0, 4);
}

/**
 * Create a multiple choice question: 1 correct + 4 wrong options, shuffled.
 */
export function createMultipleChoiceQuestion(
  correctSentence: Sentence,
  lessonSentences: Sentence[],
  answerLangIndex: number
): { options: string[]; correctIndex: number } {
  const correctAnswerText = getSentenceText(correctSentence[answerLangIndex]);
  const wrongAnswers = generateWrongAnswers(correctSentence, lessonSentences, answerLangIndex);

  const allOptions = [correctAnswerText, ...wrongAnswers];
  const shuffledOptions: string[] = [];
  let correctIndex = -1;

  const indices = [0, 1, 2, 3, 4];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  indices.forEach((originalIndex, newIndex) => {
    shuffledOptions.push(allOptions[originalIndex]);
    if (originalIndex === 0) correctIndex = newIndex;
  });

  return { options: shuffledOptions, correctIndex };
}
