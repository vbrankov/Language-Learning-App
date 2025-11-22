import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LessonDatabase, LessonStats } from '../types';
import { ProgressManager } from '../utils/ProgressManager';
import { timeAgo } from '../utils/timeAgo';

function HomePage() {
  const navigate = useNavigate();
  const [database, setDatabase] = useState<LessonDatabase | null>(null);
  const [lessonStats, setLessonStats] = useState<Record<number, LessonStats>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDatabase = async () => {
      try {
        const response = await fetch('/Language-Learning-App/data/lessons_1_to_106_enhanced.json');
        if (!response.ok) {
          throw new Error(`Failed to load database: ${response.status}`);
        }
        const data = await response.json();
        setDatabase(data);
      } catch (err) {
        console.error('Error loading database:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    loadDatabase();
  }, []);

  useEffect(() => {
    if (!database || !database.lessons) {
      return;
    }
    
    try {
      // Calculate stats for all lessons
      const stats: Record<number, LessonStats> = {};
      
      for (const lesson of database.lessons) {
        stats[lesson.id] = ProgressManager.getLessonStats(lesson.id, lesson.sentences);
      }
      
      setLessonStats(stats);
    } catch (err) {
      console.error('Error calculating stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [database]);

  const handleLessonClick = (lessonId: number) => {
    navigate(`/lesson/${lessonId}/settings`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !database) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading App</h1>
          <p className="text-gray-600 mt-2">{error || 'Database not loaded'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Language Learning</h1>
          <p className="mt-2 text-sm text-gray-600">
            {database.sourceLanguage} → {database.destinationLanguage}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Lessons</h2>
          <p className="mt-1 text-sm text-gray-500">
            {database.lessons.length} lessons • {database.lessons.reduce((sum, l) => sum + l.sentences.length, 0)} sentences
          </p>
        </div>

        {/* Lesson Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {database.lessons.map((lesson) => {
            const stats = lessonStats[lesson.id];
            
            return (
              <button
                key={lesson.id}
                onClick={() => handleLessonClick(lesson.id)}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 text-left border border-gray-200 hover:border-blue-500"
              >
                {/* Lesson Number & Title */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">Lesson {lesson.id}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1">
                      {lesson.title}
                    </h3>
                    {lesson.title_serbian && (
                      <div className="text-sm text-gray-600 mt-0.5">
                        {lesson.title_serbian}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                {stats && (
                  <div className="space-y-2">
                    {/* Progress Bar */}
                    {stats.attemptedSentences > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(stats.attemptedSentences / stats.totalSentences) * 100}%`
                          }}
                        />
                      </div>
                    )}

                    {/* Sentence Count */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {stats.totalSentences} sentence{stats.totalSentences !== 1 ? 's' : ''}
                      </span>
                      {stats.attemptedSentences > 0 && (
                        <span className="text-gray-500">
                          {stats.attemptedSentences} attempted
                        </span>
                      )}
                    </div>

                    {/* Correct/Incorrect Counts */}
                    {stats.attemptedSentences > 0 && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-medium">
                          ✓ {stats.correctCount} correct
                        </span>
                        <span className="text-red-600 font-medium">
                          ✗ {stats.incorrectCount} incorrect
                        </span>
                      </div>
                    )}

                    {/* Accuracy */}
                    {stats.attemptedSentences > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Accuracy: </span>
                        <span className={`font-semibold ${
                          stats.accuracy >= 80 ? 'text-green-600' :
                          stats.accuracy >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {stats.accuracy.toFixed(0)}%
                        </span>
                      </div>
                    )}

                    {/* Last Attempted */}
                    <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                      {stats.lastAttempted ? (
                        <>Last practiced {timeAgo(stats.lastAttempted)}</>
                      ) : (
                        <>Not yet practiced</>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default HomePage;
