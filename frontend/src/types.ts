// Core data types for the language learning database

// A sentence is an array of language slots (one per language).
// Each slot can be a string or an array of accepted alternatives.
export type Sentence = Array<string | string[]>;

export interface Lesson {
  title: string | string[]; // indexed by language, e.g. ["English title", "Serbian title"]
  words?: string[];
  sentences: Sentence[];
}

export interface LessonDatabase {
  version: string;
  languages: string[]; // e.g. ["English", "Serbian"]
  lessons: Lesson[];
}

// User progress tracking — stored per lesson, keyed by source-language title

export interface LessonProgress {
  correct: number;
  incorrect: number;
  lastAttempted: string; // ISO date string
}

export interface UserProgress {
  lessons: Record<string, LessonProgress>; // key is the lesson's source-language title
}

// Quiz configuration

export type QuizDirection = 'source-to-dest' | 'dest-to-source' | 'source-to-source' | 'dest-to-dest';
export type QuizMode = 'type' | 'multiple-choice' | 'speak';
export type QuizAlgorithm = 'A' | 'B';

export interface QuizSettings {
  lessonIndex: number;
  direction: QuizDirection;
  mode: QuizMode;
  algorithm: QuizAlgorithm;
  englishVoice?: string;
  serbianVoice?: string;
}

// Lesson statistics for display

export interface LessonStats {
  totalSentences: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number; // 0-100
  lastAttempted: string | null;
}
