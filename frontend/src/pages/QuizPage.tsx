import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuizSettings, Lesson, Sentence } from '../types';
import { AlgorithmA, createMultipleChoiceQuestion } from '../utils/QuizAlgorithms';
import { ProgressManager } from '../utils/ProgressManager';
import lessonData from '../data/lessons_1_to_106_enhanced.json';

type QuizState = 'question' | 'correct' | 'incorrect';

function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const settings = location.state as QuizSettings;
  
  // Get the lesson
  const lesson: Lesson | undefined = lessonData.lessons.find(l => l.id === settings?.lessonId);
  
  // Quiz state
  const [algorithm, setAlgorithm] = useState<AlgorithmA | null>(null);
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [quizState, setQuizState] = useState<QuizState>('question');
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(-1);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);

  // Initialize algorithm and first question
  useEffect(() => {
    if (!lesson) {
      navigate('/');
      return;
    }

    const algo = new AlgorithmA(lesson.sentences);
    setAlgorithm(algo);
    loadNextQuestion(algo);
  }, [lesson, navigate]);

  // Focus input or button depending on state
  useEffect(() => {
    if (quizState === 'question' && settings?.mode === 'type') {
      inputRef.current?.focus();
    } else if (quizState === 'incorrect' && settings?.mode === 'type') {
      buttonRef.current?.focus();
    }
  }, [quizState, settings?.mode]);

  const loadNextQuestion = (algo: AlgorithmA) => {
    const sentence = algo.getNextSentence();
    setCurrentSentence(sentence);
    setUserAnswer('');
    setQuizState('question');
    setSelectedOptionIndex(-1);

    const isSourceToDest = settings.direction === 'source-to-dest';
    const question = isSourceToDest ? sentence.source : sentence.destination;
    const answer = isSourceToDest ? sentence.destination : sentence.source;

    setQuestionText(question);
    setCorrectAnswer(answer);

    // Setup multiple choice if needed
    if (settings.mode === 'multiple-choice') {
      const { options, correctIndex } = createMultipleChoiceQuestion(
        sentence,
        lesson!.sentences,
        isSourceToDest
      );
      setMultipleChoiceOptions(options);
      setCorrectOptionIndex(correctIndex);
    }
  };

  const checkAnswer = (selectedIndex?: number) => {
    if (!algorithm || !currentSentence) return;

    let isCorrect = false;

    if (settings.mode === 'type') {
      // Case-insensitive exact match
      isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    } else {
      // Multiple choice - use passed index or state
      const indexToCheck = selectedIndex !== undefined ? selectedIndex : selectedOptionIndex;
      isCorrect = indexToCheck === correctOptionIndex;
    }

    // Record answer
    ProgressManager.recordAnswer(currentSentence.id, isCorrect);
    algorithm.recordAnswer(isCorrect);

    if (isCorrect) {
      setQuizState('correct');
      // Auto-advance after a short delay
      setTimeout(() => {
        loadNextQuestion(algorithm);
      }, settings.mode === 'type' ? 1000 : 500);
    } else {
      setQuizState('incorrect');
      // For type mode, show the correct answer in the input box
      if (settings.mode === 'type') {
        setUserAnswer(correctAnswer);
      }
    }
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quizState === 'question') {
      checkAnswer();
    } else if (quizState === 'incorrect') {
      // User pressed Enter to continue after seeing correct answer
      if (algorithm) {
        loadNextQuestion(algorithm);
      }
    }
  };

  const handleNext = () => {
    if (algorithm) {
      loadNextQuestion(algorithm);
    }
  };

  if (!settings || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid quiz settings</h1>
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

  const progress = algorithm?.getProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Finish Session
              </button>
              <h1 className="text-xl font-semibold text-gray-900 mt-1">{lesson.title}</h1>
            </div>
            {progress && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-lg font-semibold text-gray-900">
                  {progress.completed} / {progress.total}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quiz Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Question */}
          <div className="mb-8">
            <div className="text-sm text-gray-600 mb-2">Translate:</div>
            <div className="text-3xl font-bold text-gray-900">{questionText}</div>
          </div>

          {/* Type Answer Mode */}
          {settings.mode === 'type' && (
            <form onSubmit={handleTypeSubmit}>
              <div className="mb-6">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  readOnly={quizState !== 'question'}
                  className={`w-full text-2xl px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white ${
                    quizState === 'correct'
                      ? 'border-green-500'
                      : quizState === 'incorrect'
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Type your answer..."
                  autoComplete="off"
                />
              </div>

              {/* Feedback */}
              {quizState === 'correct' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
                  <div className="text-green-800 font-semibold text-lg">✓ Correct!</div>
                </div>
              )}

              {quizState === 'incorrect' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
                  <div className="text-red-800 font-semibold text-lg">✗ Incorrect</div>
                  <div className="text-red-600 text-sm mt-2">
                    The correct answer is shown above. Press Enter to continue.
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                ref={buttonRef}
                type="submit"
                disabled={(quizState === 'question' && !userAnswer.trim()) || quizState === 'correct'}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {quizState === 'question' ? 'Check Answer' : quizState === 'incorrect' ? 'Next Question (Press Enter)' : 'Next Question'}
              </button>
            </form>
          )}

          {/* Multiple Choice Mode */}
          {settings.mode === 'multiple-choice' && (
            <div className="space-y-3">
              {multipleChoiceOptions.map((option, index) => {
                const isSelected = selectedOptionIndex === index;
                const isCorrect = index === correctOptionIndex;
                const showFeedback = quizState !== 'question';

                let buttonClass = 'w-full text-left p-4 text-lg border-2 rounded-lg transition-colors ';
                
                if (showFeedback) {
                  if (isCorrect) {
                    buttonClass += 'border-green-500 bg-green-50 text-green-900';
                  } else if (isSelected && !isCorrect) {
                    buttonClass += 'border-red-500 bg-red-50 text-red-900';
                  } else {
                    buttonClass += 'border-gray-200 bg-gray-50 text-gray-600';
                  }
                } else {
                  buttonClass += 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-gray-900 cursor-pointer text-gray-900';
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (quizState !== 'question') return;
                      setSelectedOptionIndex(index);
                      // Check answer immediately with the selected index
                      checkAnswer(index);
                    }}
                    disabled={quizState !== 'question'}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showFeedback && isCorrect && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <span className="text-red-600 font-bold">✗</span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Next button for multiple choice only when incorrect */}
              {quizState === 'incorrect' && (
                <button
                  onClick={handleNext}
                  className="w-full mt-6 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Question
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default QuizPage;
