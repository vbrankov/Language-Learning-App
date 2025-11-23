import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuizSettings, Lesson, Sentence } from '../types';
import { AlgorithmA, createMultipleChoiceQuestion } from '../utils/QuizAlgorithms';
import { ProgressManager } from '../utils/ProgressManager';
import { LessonDatabase } from '../types';
import { getTitles, getSentenceText, checkAnswerWithAlternatives, cyrillicToLatin } from '../utils/ContentFormatter';

type QuizState = 'question' | 'correct' | 'incorrect';

// Text-to-speech function
function speak(text: string, lang: 'en' | 'sr', voiceName?: string) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    
    const voices = window.speechSynthesis.getVoices();
    
    if (voiceName) {
      // Use the specified voice
      const selectedVoice = voices.find(v => v.name === voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else if (lang === 'en') {
        utterance.lang = 'en-GB';
      } else {
        utterance.lang = 'hr-HR';
      }
    } else {
      // Fallback to default behavior
      if (lang === 'en') {
        utterance.lang = 'en-GB';
      } else {
        utterance.lang = 'hr-HR';
      }
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const settings = location.state as QuizSettings;
  const [lessonData, setLessonData] = useState<LessonDatabase | null>(null);
  
  // Get the lesson
  const lesson: Lesson | undefined = lessonData?.lessons.find(l => l.id === settings?.lessonId);
  
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
  const [englishText, setEnglishText] = useState('');
  const [serbianText, setSerbianText] = useState('');
  
  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const isListeningRef = useRef(false);

  // Initialize speech recognition
  useEffect(() => {
    if (settings?.mode === 'speak' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Set language based on quiz direction
      // source-to-dest: answer in Serbian, dest-to-source: answer in English
      // source-to-source: answer in English, dest-to-dest: answer in Serbian
      const isEnglish = settings.direction === 'dest-to-source' || settings.direction === 'source-to-source';
      recognitionInstance.lang = isEnglish ? 'en-US' : 'sr-RS'; // Use Serbian (Serbia)
      recognitionInstance.continuous = true; // Keep listening continuously
      recognitionInstance.interimResults = true; // Show interim results
      recognitionInstance.maxAlternatives = 1;
      
      recognitionInstance.onstart = () => {
        console.log('[Debug] Recognition started');
      };
      
      recognitionInstance.onresult = (event: any) => {
        console.log('[Debug] Got result:', event.results[event.results.length - 1][0].transcript);
        // Get the latest result (interim or final)
        // If there's a pause, it restarts - promotes fluent speaking without breaks
        const results = event.results;
        const latestResult = results[results.length - 1];
        let transcript = latestResult[0].transcript;
        
        // Convert Cyrillic to Latin for Serbian
        if (!isEnglish) {
          transcript = cyrillicToLatin(transcript);
        }
        
        setUserAnswer(transcript);
        
        // Don't auto-stop - let user pause and continue
        // They can manually stop or submit when ready
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('[Debug] Speech recognition error:', event.error, 'Type:', event.type);
        setIsListening(false);
        isListeningRef.current = false;
        // Don't auto-restart on iOS - let user manually control it
        // iOS has stricter permissions for continuous listening
      };
      
      recognitionInstance.onend = () => {
        console.log('[Debug] Recognition ended. isListening:', isListeningRef.current);
        // On iOS with continuous=false, restart automatically after each utterance
        // This gives a brief pause between listening sessions
        if (isListeningRef.current) {
          console.log('[Debug] Attempting to restart...');
          setTimeout(() => {
            try {
              recognitionInstance.start();
              console.log('[Debug] Restart successful');
            } catch (err) {
              console.error('[Debug] Failed to restart:', err);
              setIsListening(false);
              isListeningRef.current = false;
            }
          }, 200);
        } else {
          setIsListening(false);
        }
      };
      
      setRecognition(recognitionInstance);
    }
  }, [settings]);

  // Load database
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

  // Initialize algorithm and first question
  useEffect(() => {
    if (!lessonData || !lesson) {
      return;
    }

    const algo = new AlgorithmA(lesson.sentences);
    setAlgorithm(algo);
    loadNextQuestion(algo);
  }, [lessonData, lesson]);

  // Focus input or button depending on state, and auto-start listening for speak mode
  useEffect(() => {
    if (quizState === 'question' && settings?.mode === 'type') {
      inputRef.current?.focus();
    } else if (quizState === 'incorrect' && settings?.mode === 'type') {
      buttonRef.current?.focus();
    } else if (quizState === 'question' && settings?.mode === 'speak' && recognition) {
      // Auto-start listening when question appears
      setTimeout(() => {
        try {
          console.log('[Debug] Auto-starting recognition...');
          recognition.start();
          setIsListening(true);
          isListeningRef.current = true;
          console.log('[Debug] Auto-start called');
        } catch (err) {
          console.error('[Debug] Failed to start recognition:', err);
        }
      }, 300);
    }
  }, [quizState, settings?.mode, recognition]);

  // Removed auto-check - user must manually submit in speak mode

  const loadNextQuestion = (algo: AlgorithmA) => {
    const sentence = algo.getNextSentence();
    setCurrentSentence(sentence);
    setUserAnswer('');
    setQuizState('question');
    setSelectedOptionIndex(-1);

    // Determine question and answer based on direction
    let question, answer, targetLang;
    
    if (settings.direction === 'source-to-dest') {
      question = sentence.source;
      answer = sentence.destination;
      targetLang = 'en' as const;
    } else if (settings.direction === 'dest-to-source') {
      question = sentence.destination;
      answer = sentence.source;
      targetLang = 'sr' as const;
    } else if (settings.direction === 'source-to-source') {
      // Pronunciation mode: both question and answer are source language
      question = sentence.source;
      answer = sentence.source;
      targetLang = 'en' as const;
    } else {
      // dest-to-dest: both question and answer are destination language
      question = sentence.destination;
      answer = sentence.destination;
      targetLang = 'sr' as const;
    }

    // Extract text from question/answer (handle alternatives)
    const questionText = getSentenceText(question);
    const answerText = getSentenceText(answer);
    const englishSentenceText = getSentenceText(sentence.source);
    const serbianSentenceText = getSentenceText(sentence.destination);
    
    setQuestionText(questionText);
    setCorrectAnswer(answerText);
    setEnglishText(englishSentenceText);
    setSerbianText(serbianSentenceText);

    // Auto-speak the question
    setTimeout(() => {
      const voiceName = targetLang === 'en' ? settings.englishVoice : settings.serbianVoice;
      speak(questionText, targetLang, voiceName);
    }, 100);

    // Setup multiple choice if needed
    if (settings.mode === 'multiple-choice') {
      const { options, correctIndex } = createMultipleChoiceQuestion(
        sentence,
        lesson!.sentences,
        settings.direction === 'source-to-dest' || settings.direction === 'dest-to-dest'
      );
      setMultipleChoiceOptions(options);
      setCorrectOptionIndex(correctIndex);
    }
  };

  const checkAnswer = (selectedIndex?: number) => {
    if (!algorithm || !currentSentence) return;

    let isCorrect = false;
    let answerToCheck;

    // Determine which field to check answer against
    if (settings.direction === 'source-to-dest') {
      answerToCheck = currentSentence.destination;
    } else if (settings.direction === 'dest-to-source') {
      answerToCheck = currentSentence.source;
    } else if (settings.direction === 'source-to-source') {
      // For pronunciation: check against source
      answerToCheck = currentSentence.source;
    } else {
      // dest-to-dest: check against destination
      answerToCheck = currentSentence.destination;
    }

    if (settings.mode === 'type' || settings.mode === 'speak') {
      // Check against all alternatives
      // For speak mode with Serbian answers, also try Cyrillic-to-Latin conversion
      const isSerbianAnswer = settings.mode === 'speak' && 
        (settings.direction === 'source-to-dest' || settings.direction === 'dest-to-dest');
      isCorrect = checkAnswerWithAlternatives(userAnswer, answerToCheck, isSerbianAnswer);
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
      // For speak mode, speak the correct answer aloud
      if (settings.mode === 'speak') {
        let speakLang: 'en' | 'sr';
        if (settings.direction === 'source-to-dest' || settings.direction === 'dest-to-source') {
          // Standard translation modes
          speakLang = settings.direction === 'source-to-dest' ? 'sr' : 'en';
        } else {
          // Pronunciation modes
          speakLang = settings.direction === 'source-to-source' ? 'en' : 'sr';
        }
        setTimeout(() => {
          const voiceName = speakLang === 'en' ? settings.englishVoice : settings.serbianVoice;
          speak(correctAnswer, speakLang, voiceName);
        }, 100);
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

  const restartListening = () => {
    if (recognition && quizState === 'question') {
      setUserAnswer('');
      setIsListening(false);
      isListeningRef.current = false;
      
      // Stop current recognition
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
      
      // Restart after a brief delay
      setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
          isListeningRef.current = true;
        } catch (err) {
          console.error('Error restarting recognition:', err);
        }
      }, 300);
    }
  };

  const toggleListening = () => {
    if (!recognition || quizState !== 'question') return;
    
    if (isListening) {
      // Stop listening
      console.log('[Debug] User manually stopping');
      setIsListening(false);
      isListeningRef.current = false;
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    } else {
      // Start listening
      console.log('[Debug] User manually starting');
      setIsListening(true);
      isListeningRef.current = true;
      try {
        recognition.start();
        console.log('[Debug] Manual start called');
      } catch (err) {
        console.error('Error starting recognition:', err);
        setIsListening(false);
        isListeningRef.current = false;
      }
    }
  };

  const handleNext = () => {
    if (algorithm) {
      loadNextQuestion(algorithm);
    }
  };

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-900 mt-1">{getTitles(lesson.title).en}</h1>
              <div className="text-sm text-gray-600">{getTitles(lesson.title).sr}</div>
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
            <div className="text-sm text-gray-600 mb-2">
              {settings.direction === 'source-to-source' || settings.direction === 'dest-to-dest' ? 'Pronunciation:' : 'Translate:'}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-gray-900 flex-1">
                {(settings.direction === 'source-to-source' || settings.direction === 'dest-to-dest') ? (
                  <div className="space-y-2">
                    <div>
                      {settings.direction === 'source-to-source' ? (
                        <>
                          <span className="font-bold">{englishText}</span>
                          <br />
                          <span className="text-gray-500">{serbianText}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-500">{englishText}</span>
                          <br />
                          <span className="font-bold">{serbianText}</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  questionText
                )}
              </div>
              <button
                onClick={() => {
                  let lang: 'en' | 'sr';
                  if (settings.direction === 'source-to-dest' || settings.direction === 'source-to-source') {
                    lang = 'en';
                  } else {
                    lang = 'sr';
                  }
                  const voiceName = lang === 'en' ? settings.englishVoice : settings.serbianVoice;
                  speak(questionText, lang, voiceName);
                }}
                className="p-3 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Listen to question"
                type="button"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
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
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-red-800 font-semibold text-lg">✗ Incorrect</div>
                      <div className="text-red-600 text-sm mt-2">
                        The correct answer is shown above. Press Enter to continue.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        let lang: 'en' | 'sr';
                        if (settings.direction === 'source-to-dest' || settings.direction === 'dest-to-dest') {
                          lang = 'sr';
                        } else {
                          lang = 'en';
                        }
                        const voiceName = lang === 'en' ? settings.englishVoice : settings.serbianVoice;
                        speak(correctAnswer, lang, voiceName);
                      }}
                      className="p-2 text-red-600 hover:bg-red-200 rounded-full transition-colors flex-shrink-0"
                      title="Listen to correct answer"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    </button>
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

          {/* Speak Answer Mode */}
          {settings.mode === 'speak' && (
            <div>
              <div className="mb-6">
                {/* Microphone Visual Indicator */}
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-red-500 animate-pulse'
                        : quizState === 'question'
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}>
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <div className="text-center">
                    {isListening ? (
                      <div className="text-red-600 font-semibold text-lg">🔴 Listening...</div>
                    ) : userAnswer && quizState === 'question' ? (
                      <div className="text-blue-600 font-semibold">Checking...</div>
                    ) : (
                      <div className="text-gray-600">
                        {quizState === 'question' ? 'Speak your answer' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Control Buttons */}
                {quizState === 'question' && (
                  <div className="mt-6 space-y-3">
                    {/* Recognized text display */}
                    {userAnswer && (
                      <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">You said:</div>
                        <div className="text-xl text-gray-900">{userAnswer}</div>
                      </div>
                    )}
                    
                    {/* Control buttons row */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={toggleListening}
                        className={`py-3 px-4 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          isListening 
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Pause
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Resume
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={restartListening}
                        className="py-3 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Start Over
                      </button>
                    </div>
                    
                    {/* Submit button */}
                    {userAnswer && (
                      <button
                        onClick={() => checkAnswer()}
                        className="w-full py-4 px-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Submit Answer
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Feedback */}
              {quizState === 'correct' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
                  <div className="text-green-800 font-semibold text-lg">✓ Correct!</div>
                </div>
              )}

              {quizState === 'incorrect' && (
                <div>
                  <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-red-800 font-semibold text-lg">✗ Incorrect</div>
                        <div className="text-red-700 mt-2">
                          Correct answer: <strong>{correctAnswer}</strong>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          let lang: 'en' | 'sr';
                          if (settings.direction === 'source-to-dest' || settings.direction === 'dest-to-dest') {
                            lang = 'sr';
                          } else {
                            lang = 'en';
                          }
                          const voiceName = lang === 'en' ? settings.englishVoice : settings.serbianVoice;
                          speak(correctAnswer, lang, voiceName);
                        }}
                        className="p-2 text-red-600 hover:bg-red-200 rounded-full transition-colors flex-shrink-0"
                        title="Listen to correct answer"
                        type="button"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => algorithm && loadNextQuestion(algorithm)}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
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
                  <div key={index} className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (quizState !== 'question') return;
                        setSelectedOptionIndex(index);
                        // Check answer immediately with the selected index
                        checkAnswer(index);
                      }}
                      disabled={quizState !== 'question'}
                      className={buttonClass + ' flex-1'}
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
                    <button
                      onClick={() => {
                        let lang: 'en' | 'sr';
                        if (settings.direction === 'source-to-dest' || settings.direction === 'dest-to-dest') {
                          lang = 'sr';
                        } else {
                          lang = 'en';
                        }
                        const voiceName = lang === 'en' ? settings.englishVoice : settings.serbianVoice;
                        speak(option, lang, voiceName);
                      }}
                      className="p-3 text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
                      title="Listen to this option"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
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
