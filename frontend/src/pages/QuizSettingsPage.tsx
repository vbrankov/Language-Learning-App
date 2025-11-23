import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizSettings, QuizDirection, QuizMode, QuizAlgorithm, LessonDatabase } from '../types';
import { getTitles } from '../utils/ContentFormatter';

function QuizSettingsPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState<LessonDatabase | null>(null);
  
  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const english = voices.filter(v => v.lang.startsWith('en-'));
      // Filter for Serbian, Croatian, and Bosnian voices (all mutually intelligible)
      // Serbian can be: sr-RS, sr-Latn-RS, sr-Cyrl-RS, sr, or rs-RS, rs
      // Croatian: hr-HR or hr
      // Bosnian: bs-BA or bs
      const serbian = voices.filter(v => 
        v.lang.startsWith('sr-') || v.lang.startsWith('sr') ||
        v.lang.startsWith('rs-') || v.lang.startsWith('rs') ||
        v.lang.startsWith('hr-') || v.lang.startsWith('hr') ||
        v.lang.startsWith('bs-') || v.lang.startsWith('bs')
      );
      
      // Debug: log all voices to console
      console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));
      console.log('Serbian/Croatian/Bosnian voices found:', serbian.map(v => `${v.name} (${v.lang})`));
      
      setEnglishVoices(english);
      setSerbianVoices(serbian);
      
      // Extract unique English locales and sort by country name
      const uniqueLocales = Array.from(new Set(english.map(v => v.lang)));
      uniqueLocales.sort((a, b) => getCountryName(a).localeCompare(getCountryName(b)));
      setEnglishLocales(uniqueLocales);
      
      // Extract unique Serbian/Croatian/Bosnian locales and sort by country name
      const uniqueSerbianLocales = Array.from(new Set(serbian.map(v => v.lang)));
      uniqueSerbianLocales.sort((a, b) => getCountryName(a).localeCompare(getCountryName(b)));
      setSerbianLocales(uniqueSerbianLocales);
      
      // Set default locale and voices
      if (uniqueLocales.length > 0 && !englishLocale) {
        // Prefer en-US, then en-GB, then first available
        const defaultLocale = uniqueLocales.find(l => l === 'en-US') || 
                             uniqueLocales.find(l => l === 'en-GB') ||
                             uniqueLocales[0];
        setEnglishLocale(defaultLocale);
        
        // Filter voices for default locale
        const voicesForLocale = english.filter(v => v.lang === defaultLocale);
        setFilteredEnglishVoices(voicesForLocale);
        
        if (voicesForLocale.length > 0 && !selectedEnglishVoice) {
          const defaultVoice = voicesForLocale.find(v => v.name.includes('Natural') || v.name.includes('Premium')) || voicesForLocale[0];
          setSelectedEnglishVoice(defaultVoice.name);
        }
      }
      
      if (uniqueSerbianLocales.length > 0 && !serbianLocale) {
        // Prefer Croatian (hr), then Serbian (sr), then Bosnian (bs)
        const defaultSerbianLocale = uniqueSerbianLocales.find(l => l.startsWith('hr')) || 
                                    uniqueSerbianLocales.find(l => l.startsWith('sr')) ||
                                    uniqueSerbianLocales[0];
        setSerbianLocale(defaultSerbianLocale);
        
        // Filter voices for default locale
        const voicesForSerbianLocale = serbian.filter(v => v.lang === defaultSerbianLocale);
        setFilteredSerbianVoices(voicesForSerbianLocale);
        
        if (voicesForSerbianLocale.length > 0 && !selectedSerbianVoice) {
          const defaultVoice = voicesForSerbianLocale.find(v => v.name.includes('Natural') || v.name.includes('Premium')) || voicesForSerbianLocale[0];
          setSelectedSerbianVoice(defaultVoice.name);
        }
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

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
  const [englishVoices, setEnglishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [serbianVoices, setSerbianVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedEnglishVoice, setSelectedEnglishVoice] = useState<string>('');
  const [selectedSerbianVoice, setSelectedSerbianVoice] = useState<string>('');
  const [englishLocale, setEnglishLocale] = useState('');
  const [englishLocales, setEnglishLocales] = useState<string[]>([]);
  const [filteredEnglishVoices, setFilteredEnglishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [serbianLocale, setSerbianLocale] = useState('');
  const [serbianLocales, setSerbianLocales] = useState<string[]>([]);
  const [filteredSerbianVoices, setFilteredSerbianVoices] = useState<SpeechSynthesisVoice[]>([]);

  const getCountryName = (locale: string): string => {
    const countryNames: Record<string, string> = {
      'en-GB': 'United Kingdom',
      'en-US': 'United States',
      'en-AU': 'Australia',
      'en-CA': 'Canada',
      'en-IE': 'Ireland',
      'en-IN': 'India',
      'en-NZ': 'New Zealand',
      'en-ZA': 'South Africa',
      'en-SG': 'Singapore',
      'en-PH': 'Philippines',
      'en-HK': 'Hong Kong',
      'en-KE': 'Kenya',
      'en-NG': 'Nigeria',
      'en-TZ': 'Tanzania',
      'sr-RS': 'Serbia',
      'sr': 'Serbia',
      'rs-RS': 'Serbia',
      'rs': 'Serbia',
      'hr-HR': 'Croatia',
      'hr': 'Croatia',
      'bs-BA': 'Bosnia and Herzegovina',
      'bs': 'Bosnia and Herzegovina',
    };
    return countryNames[locale] || locale;
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

  const handleLocaleChange = (locale: string) => {
    setEnglishLocale(locale);
    const voicesForLocale = englishVoices.filter(v => v.lang === locale);
    setFilteredEnglishVoices(voicesForLocale);
    
    // Auto-select first voice for new locale
    if (voicesForLocale.length > 0) {
      const defaultVoice = voicesForLocale.find(v => v.name.includes('Natural') || v.name.includes('Premium')) || voicesForLocale[0];
      setSelectedEnglishVoice(defaultVoice.name);
    }
  };

  const handleSerbianLocaleChange = (locale: string) => {
    setSerbianLocale(locale);
    const voicesForLocale = serbianVoices.filter(v => v.lang === locale);
    setFilteredSerbianVoices(voicesForLocale);
    
    // Auto-select first voice for new locale
    if (voicesForLocale.length > 0) {
      const defaultVoice = voicesForLocale.find(v => v.name.includes('Natural') || v.name.includes('Premium')) || voicesForLocale[0];
      setSelectedSerbianVoice(defaultVoice.name);
    }
  };

  const handleStart = () => {
    const settings: QuizSettings = {
      lessonId: lesson.id,
      direction,
      mode,
      algorithm,
      englishVoice: selectedEnglishVoice,
      serbianVoice: selectedSerbianVoice,
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
          <h1 className="text-3xl font-bold text-gray-900">{getTitles(lesson.title).en}</h1>
          <div className="text-xl text-gray-700 mt-1">{getTitles(lesson.title).sr}</div>
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
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="direction"
                  checked={direction === 'source-to-source'}
                  onChange={() => setDirection('source-to-source')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-900">
                  {lessonData.sourceLanguage} → {lessonData.sourceLanguage}
                </span>
              </label>
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="direction"
                  checked={direction === 'dest-to-dest'}
                  onChange={() => setDirection('dest-to-dest')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-900">
                  {lessonData.destinationLanguage} → {lessonData.destinationLanguage}
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
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'speak'}
                  onChange={() => setMode('speak')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3">
                  <div className="text-gray-900 font-medium">🎤 Speak Answer</div>
                  <div className="text-sm text-gray-500">Say the translation out loud</div>
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

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Voice Settings
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">English Country/Region</label>
                <select
                  value={englishLocale}
                  onChange={(e) => handleLocaleChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {englishLocales.map((locale) => (
                    <option key={locale} value={locale}>
                      {getCountryName(locale)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">English Voice</label>
                <select
                  value={selectedEnglishVoice}
                  onChange={(e) => setSelectedEnglishVoice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {filteredEnglishVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Serbian/Croatian/Bosnian Country/Region</label>
                <select
                  value={serbianLocale}
                  onChange={(e) => handleSerbianLocaleChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {serbianLocales.map((locale) => (
                    <option key={locale} value={locale}>
                      {getCountryName(locale)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Serbian/Croatian/Bosnian Voice</label>
                <select
                  value={selectedSerbianVoice}
                  onChange={(e) => setSelectedSerbianVoice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {filteredSerbianVoices.length > 0 ? (
                    filteredSerbianVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No voices found - check console for available voices</option>
                  )}
                </select>
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
