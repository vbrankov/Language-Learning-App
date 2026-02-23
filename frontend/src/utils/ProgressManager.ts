import { UserProgress, LessonProgress, LessonStats } from '../types';

const STORAGE_KEY = 'language-learning-progress-v3';

export class ProgressManager {
  static getProgress(): UserProgress {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse progress from localStorage:', e);
      }
    }
    return { lessons: {} };
  }

  private static saveProgress(progress: UserProgress): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  static recordAnswer(lessonTitle: string, isCorrect: boolean): void {
    const progress = this.getProgress();

    if (!progress.lessons[lessonTitle]) {
      progress.lessons[lessonTitle] = { correct: 0, incorrect: 0, lastAttempted: new Date().toISOString() };
    }

    const lp: LessonProgress = progress.lessons[lessonTitle];
    if (isCorrect) lp.correct++; else lp.incorrect++;
    lp.lastAttempted = new Date().toISOString();

    this.saveProgress(progress);
  }

  static getLessonStats(lessonTitle: string, totalSentences: number): LessonStats {
    const progress = this.getProgress();
    const lp = progress.lessons[lessonTitle] ?? null;

    const correctCount = lp?.correct ?? 0;
    const incorrectCount = lp?.incorrect ?? 0;
    const totalAttempts = correctCount + incorrectCount;
    const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;

    return {
      totalSentences,
      correctCount,
      incorrectCount,
      accuracy,
      lastAttempted: lp?.lastAttempted ?? null,
    };
  }

  static exportProgress(): void {
    const progress = this.getProgress();
    const dataStr = JSON.stringify(progress, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `language-learning-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async importProgress(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const progress: UserProgress = JSON.parse(e.target?.result as string);
          if (!progress.lessons || typeof progress.lessons !== 'object') {
            throw new Error('Invalid progress file format');
          }
          this.saveProgress(progress);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static clearProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
