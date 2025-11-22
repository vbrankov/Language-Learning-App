import { UserProgress, SentenceProgress, LessonStats, Sentence } from '../types';

const STORAGE_KEY = 'language-learning-progress';

export class ProgressManager {
  /**
   * Get the complete user progress from localStorage
   */
  static getProgress(): UserProgress {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse progress from localStorage:', e);
      }
    }
    
    // Return default empty progress
    return {
      sentences: {},
      settings: {}
    };
  }

  /**
   * Save the complete user progress to localStorage
   */
  private static saveProgress(progress: UserProgress): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  /**
   * Record an answer for a sentence
   */
  static recordAnswer(sentenceId: number, isCorrect: boolean): void {
    const progress = this.getProgress();
    
    if (!progress.sentences[sentenceId]) {
      progress.sentences[sentenceId] = {
        correct: 0,
        incorrect: 0,
        lastAttempted: new Date().toISOString()
      };
    }
    
    const sentenceProgress = progress.sentences[sentenceId];
    
    if (isCorrect) {
      sentenceProgress.correct++;
    } else {
      sentenceProgress.incorrect++;
    }
    
    sentenceProgress.lastAttempted = new Date().toISOString();
    
    this.saveProgress(progress);
  }

  /**
   * Get progress data for a specific sentence
   */
  static getSentenceProgress(sentenceId: number): SentenceProgress | null {
    const progress = this.getProgress();
    return progress.sentences[sentenceId] || null;
  }

  /**
   * Get statistics for a specific lesson
   */
  static getLessonStats(lessonId: number, sentences: Sentence[]): LessonStats {
    const progress = this.getProgress();
    
    let correctCount = 0;
    let incorrectCount = 0;
    let attemptedSentences = 0;
    let lastAttempted: string | null = null;
    
    for (const sentence of sentences) {
      const sentenceProgress = progress.sentences[sentence.id];
      
      if (sentenceProgress) {
        attemptedSentences++;
        correctCount += sentenceProgress.correct;
        incorrectCount += sentenceProgress.incorrect;
        
        // Track the most recent attempt
        if (!lastAttempted || sentenceProgress.lastAttempted > lastAttempted) {
          lastAttempted = sentenceProgress.lastAttempted;
        }
      }
    }
    
    const totalAttempts = correctCount + incorrectCount;
    const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
    
    return {
      lessonId,
      totalSentences: sentences.length,
      attemptedSentences,
      correctCount,
      incorrectCount,
      accuracy,
      lastAttempted
    };
  }

  /**
   * Get all sentences that need practice (sorted by priority)
   * Currently just returns sentences with low accuracy
   */
  static getSentencesNeedingPractice(): Array<{ sentenceId: number; progress: SentenceProgress }> {
    const progress = this.getProgress();
    const needsPractice: Array<{ sentenceId: number; progress: SentenceProgress }> = [];
    
    for (const [sentenceIdStr, sentenceProgress] of Object.entries(progress.sentences)) {
      const totalAttempts = sentenceProgress.correct + sentenceProgress.incorrect;
      const accuracy = totalAttempts > 0 ? sentenceProgress.correct / totalAttempts : 0;
      
      // Consider sentences with < 70% accuracy as needing practice
      if (accuracy < 0.7) {
        needsPractice.push({
          sentenceId: parseInt(sentenceIdStr),
          progress: sentenceProgress
        });
      }
    }
    
    // Sort by incorrect count (descending)
    needsPractice.sort((a, b) => b.progress.incorrect - a.progress.incorrect);
    
    return needsPractice;
  }

  /**
   * Export progress as JSON file
   */
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

  /**
   * Import progress from JSON file
   */
  static async importProgress(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const progress: UserProgress = JSON.parse(content);
          
          // Validate the structure
          if (!progress.sentences || typeof progress.sentences !== 'object') {
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

  /**
   * Clear all progress data
   */
  static clearProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
