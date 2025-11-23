import { Sentence } from '../types';
import { getSentenceText } from './ContentFormatter';

/**
 * Algorithm A: Random selection with removal
 * 
 * - Randomly picks from remaining sentences in the lesson
 * - Correct answer → remove from set
 * - Wrong answer → keep in set
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

  /**
   * Shuffle the remaining sentences array
   */
  private shuffle(): void {
    for (let i = this.remainingSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.remainingSentences[i], this.remainingSentences[j]] = 
        [this.remainingSentences[j], this.remainingSentences[i]];
    }
  }

  /**
   * Get the next sentence to practice
   */
  getNextSentence(): Sentence {
    // If no sentences remain, refill and shuffle
    if (this.remainingSentences.length === 0) {
      this.remainingSentences = [...this.allSentences];
      this.shuffle();
    }

    // Pick the first sentence (already shuffled)
    this.currentSentence = this.remainingSentences[0];
    return this.currentSentence;
  }

  /**
   * Record the answer and update the sentence pool
   */
  recordAnswer(isCorrect: boolean): void {
    if (!this.currentSentence) {
      return;
    }

    if (isCorrect) {
      // Remove the sentence from the remaining pool
      this.remainingSentences = this.remainingSentences.filter(
        s => s.id !== this.currentSentence!.id
      );
    } else {
      // Keep in pool but move to a random position (not just the front)
      const currentId = this.currentSentence.id;
      this.remainingSentences = this.remainingSentences.filter(s => s.id !== currentId);
      
      // Insert at random position
      const randomIndex = Math.floor(Math.random() * (this.remainingSentences.length + 1));
      this.remainingSentences.splice(randomIndex, 0, this.currentSentence);
    }

    this.currentSentence = null;
  }

  /**
   * Get the current progress (for display purposes)
   */
  getProgress(): { remaining: number; total: number; completed: number } {
    const remaining = this.remainingSentences.length;
    const total = this.allSentences.length;
    const completed = total - remaining;
    
    return { remaining, total, completed };
  }

  /**
   * Reset the algorithm to start fresh
   */
  reset(): void {
    this.remainingSentences = [...this.allSentences];
    this.shuffle();
    this.currentSentence = null;
  }
}

/**
 * Generate random wrong answers for multiple choice
 * Returns 4 sentences that are different from the correct answer
 * All wrong answers come from the same lesson (lessonSentences)
 */
export function generateWrongAnswers(
  correctSentence: Sentence,
  lessonSentences: Sentence[],
  isSourceToDestination: boolean
): string[] {
  // Get the text we want to avoid (the correct answer)
  const correctText = isSourceToDestination 
    ? correctSentence.destination 
    : correctSentence.source;

  // Get all possible wrong answers from the same lesson only
  const possibleWrong = lessonSentences
    .filter(s => {
      const text = isSourceToDestination ? s.destination : s.source;
      return text !== correctText && s.id !== correctSentence.id;
    })
    .map(s => {
      const text = isSourceToDestination ? s.destination : s.source;
      // Extract first alternative if it's an array
      return getSentenceText(text);
    });

  // Shuffle and take 4
  const shuffled = [...possibleWrong].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

/**
 * Create a multiple choice question with 5 options (1 correct, 4 wrong)
 * Returns array of 5 options in random order, and the index of the correct answer
 * All wrong answers come from the same lesson
 */
export function createMultipleChoiceQuestion(
  correctSentence: Sentence,
  lessonSentences: Sentence[],
  isSourceToDestination: boolean
): { options: string[]; correctIndex: number } {
  const correctAnswer = isSourceToDestination 
    ? correctSentence.destination 
    : correctSentence.source;

  // Extract text from correct answer (handle alternatives)
  const correctAnswerText = getSentenceText(correctAnswer);

  const wrongAnswers = generateWrongAnswers(correctSentence, lessonSentences, isSourceToDestination);
  
  // Combine and shuffle
  const allOptions = [correctAnswerText, ...wrongAnswers];
  const shuffledOptions: string[] = [];
  let correctIndex = -1;

  // Shuffle while tracking where the correct answer ends up
  const indices = [0, 1, 2, 3, 4];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  indices.forEach((originalIndex, newIndex) => {
    shuffledOptions.push(allOptions[originalIndex]);
    if (originalIndex === 0) {
      correctIndex = newIndex;
    }
  });

  return { options: shuffledOptions, correctIndex };
}
