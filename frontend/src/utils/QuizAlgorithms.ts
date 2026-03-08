import { Sentence } from '../types';
import { getSentenceText } from './ContentFormatter';

export interface QuizAlgorithmInstance {
  getNextSentence(): Sentence;
  recordAnswer(isCorrect: boolean): void;
  getProgress(): { remaining: number; total: number; completed: number };
}

/**
 * Algorithm A: Random selection with removal
 *
 * - Randomly picks from remaining sentences in the lesson
 * - Correct answer → remove from set
 * - Wrong answer → keep in set, reinsert at random position
 * - When set is empty → refill with all sentences and continue
 */
export class AlgorithmA implements QuizAlgorithmInstance {
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
 * Sequential Algorithm: works through stories in order.
 *
 * - Randomly shuffles the list of stories at the start (and after completing all)
 * - Within each story, presents sentences in their original order
 * - Always advances to the next sentence regardless of correct/incorrect
 * - When a story is finished, moves to the next shuffled story
 */
export class SequentialAlgorithm implements QuizAlgorithmInstance {
  private stories: Sentence[][];
  private readonly originalStories: Sentence[][];
  private currentStoryIdx: number = 0;
  private currentSentenceIdx: number = 0;
  private completedInRound: number = 0;
  private readonly totalSentences: number;

  constructor(stories: Sentence[][]) {
    this.originalStories = stories;
    this.stories = this.shuffleStories([...stories]);
    this.totalSentences = stories.reduce((sum, s) => sum + s.length, 0);
  }

  private shuffleStories(arr: Sentence[][]): Sentence[][] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  getNextSentence(): Sentence {
    return this.stories[this.currentStoryIdx][this.currentSentenceIdx];
  }

  recordAnswer(_isCorrect: boolean): void {
    this.currentSentenceIdx++;
    this.completedInRound++;
    if (this.currentSentenceIdx >= this.stories[this.currentStoryIdx].length) {
      this.currentStoryIdx++;
      this.currentSentenceIdx = 0;
      if (this.currentStoryIdx >= this.stories.length) {
        this.stories = this.shuffleStories([...this.originalStories]);
        this.currentStoryIdx = 0;
        this.completedInRound = 0;
      }
    }
  }

  getProgress(): { remaining: number; total: number; completed: number } {
    return {
      total: this.totalSentences,
      completed: this.completedInRound,
      remaining: this.totalSentences - this.completedInRound,
    };
  }
}

/**
 * Story-by-Story Algorithm: AlgorithmA scoped to one story at a time.
 *
 * - Shuffles the list of stories
 * - For the current story, uses AlgorithmA logic (random with removal/reinsertion)
 * - When all sentences in the current story are answered correctly, advances to next story
 * - When all stories are done, reshuffles and starts over
 */
export class StoryByStoryAlgorithm implements QuizAlgorithmInstance {
  private readonly originalStories: Sentence[][];
  private storyQueue: Sentence[][];
  private currentPool: Sentence[];
  private currentSentence: Sentence | null = null;
  private readonly totalSentences: number;
  private completedInRound: number = 0;

  constructor(stories: Sentence[][]) {
    this.originalStories = stories;
    this.totalSentences = stories.reduce((sum, s) => sum + s.length, 0);
    this.storyQueue = this.shuffleArray([...stories]);
    this.currentPool = this.shuffleArray([...this.storyQueue[0]]);
  }

  private shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  getNextSentence(): Sentence {
    if (this.currentPool.length === 0) {
      // Current story mastered — advance
      this.storyQueue.shift();
      if (this.storyQueue.length === 0) {
        // All stories done — reshuffle and restart
        this.storyQueue = this.shuffleArray([...this.originalStories]);
        this.completedInRound = 0;
      }
      this.currentPool = this.shuffleArray([...this.storyQueue[0]]);
    }
    this.currentSentence = this.currentPool[0];
    return this.currentSentence;
  }

  recordAnswer(isCorrect: boolean): void {
    if (!this.currentSentence) return;
    if (isCorrect) {
      this.currentPool = this.currentPool.filter(s => s !== this.currentSentence);
      this.completedInRound++;
    } else {
      const current = this.currentSentence;
      this.currentPool = this.currentPool.filter(s => s !== current);
      const idx = Math.floor(Math.random() * (this.currentPool.length + 1));
      this.currentPool.splice(idx, 0, current);
    }
    this.currentSentence = null;
  }

  getProgress(): { remaining: number; total: number; completed: number } {
    return {
      total: this.totalSentences,
      completed: this.completedInRound,
      remaining: this.totalSentences - this.completedInRound,
    };
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
