import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizSettings, QuizDirection, QuizMode, QuizAlgorithm, LessonDatabase } from '../types';

function QuizSettingsPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState<LessonDatabase | null>(null);
  
  useEffect(() => {
    const loadDatabase = async () => {
      try {
        const response = await fetch('/Language-Learning-App/data/lessons_1_to_106_enhanced.json');
        const data = await response.json();
        setLessonData(data);
      } catch (err) {
        console.error('Error loading database:', err);
      }
    };
    
    loadDatabase();
  }, []);
  
  const lesson = lessonData?.lessons.find(l => l.id === parseInt(lessonId || '0'));
  
  const [direction, setDirection] = useState<QuizDirection>('source-to-dest');
  const [mode, setMode] = useState<QuizMode>('type');
  const [algorithm] = useState<QuizAlgorithm>('A'); // Only A for now

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Lesson not found</h1>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    const settings: QuizSettings = {
      lessonId: lesson.id,
      direction,
      mode,
      algorithm
    };
    
    // Pass settings via state
    navigate('/quiz', { state: settings });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
          >
            ← Back to Lessons
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
          {lesson.title_serbian && (
            <div className="text-xl text-gray-700 mt-1">{lesson.title_serbian}</div>
          )}
          <p className="mt-2 text-sm text-gray-600">
            Lesson {lesson.id} • {lesson.sentences.length} sentences
          </p>
        </div>
      </header>

      {/* Settings Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Quiz Settings</h2>

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Translation Direction
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="direction"
                  checked={direction === 'source-to-dest'}
                  onChange={() => setDirection('source-to-dest')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-900">
                  {lessonData.sourceLanguage} → {lessonData.destinationLanguage}
                </span>
              </label>
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="direction"
                  checked={direction === 'dest-to-source'}
                  onChange={() => setDirection('dest-to-source')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-900">
                  {lessonData.destinationLanguage} → {lessonData.sourceLanguage}
                </span>
              </label>
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Answer Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'type'}
                  onChange={() => setMode('type')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3">
                  <div className="text-gray-900 font-medium">Type Answer</div>
                  <div className="text-sm text-gray-500">Type the translation manually</div>
                </span>
              </label>
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'multiple-choice'}
                  onChange={() => setMode('multiple-choice')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3">
                  <div className="text-gray-900 font-medium">Multiple Choice</div>
                  <div className="text-sm text-gray-500">Choose from 5 options</div>
                </span>
              </label>
            </div>
          </div>

          {/* Algorithm (informational only for now) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selection Algorithm
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-gray-900 font-medium">Algorithm A (Random)</div>
              <div className="text-sm text-gray-600 mt-1">
                Randomly selects sentences. Correct answers are removed from the pool, 
                incorrect ones stay in. Pool refills when empty.
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-4">
            <button
              onClick={handleStart}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QuizSettingsPage;
