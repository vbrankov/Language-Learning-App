// Core data types matching the enhanced database structure

export interface Sentence {
  id: number;
  source: string;
  destination: string | string[]; // Can be single string or array of alternatives
}

export interface Lesson {
  id: number;
  title: string | [string, string]; // Can be single string or [English, Serbian]
  title_serbian?: string;
  words: string[] | Array<{ english: string; serbian: string }>;
  sentences: Sentence[];
}

export interface LessonDatabase {
  version: string;
  sourceLanguage: string;
  destinationLanguage: string;
  lastUpdated: string;
  nextLessonId: number;
  nextSentenceId: number;
  metadata: Record<string, any>;
  lessons: Lesson[];
}

// User progress tracking

export interface SentenceProgress {
  correct: number;
  incorrect: number;
  lastAttempted: string; // ISO date string
}

export interface UserProgress {
  sentences: Record<number, SentenceProgress>; // key is sentence ID
  settings: {
    theme?: string;
    [key: string]: any;
  };
}

// Quiz configuration

export type QuizDirection = 'source-to-dest' | 'dest-to-source' | 'source-to-source' | 'dest-to-dest';
export type QuizMode = 'type' | 'multiple-choice' | 'speak';
export type QuizAlgorithm = 'A' | 'B';

export interface QuizSettings {
  lessonId: number;
  direction: QuizDirection;
  mode: QuizMode;
  algorithm: QuizAlgorithm;
  englishVoice?: string;
  serbianVoice?: string;
}

// Lesson statistics for display

export interface LessonStats {
  lessonId: number;
  totalSentences: number;
  attemptedSentences: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number; // 0-100
  lastAttempted: string | null; // ISO date string or null
}
