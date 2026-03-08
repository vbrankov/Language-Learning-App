import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizSettings, QuizDirection, QuizMode } from '../types';
import { useDatabase } from '../DatabaseContext';
import { getLangText, getLessonSentences } from '../utils/ContentFormatter';

function QuizSettingsPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { database: lessonData, sourceIndex, destIndex } = useDatabase();
  
  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // Filter for English voices (en-US, en-GB, en-AU, etc.)
      const english = voices.filter(v => {
        const normalized = normalizeLocale(v.lang);
        return normalized.startsWith('en-') || normalized === 'en';
      });
      
      // Filter for Serbian, Croatian, and Bosnian voices (all mutually intelligible)
      // Serbian can be: sr-RS, sr-Latn-RS, sr-Cyrl-RS, sr, or rs-RS, rs
      // Croatian: hr-HR or hr
      // Bosnian: bs-BA or bs
      const serbian = voices.filter(v => {
        const normalized = normalizeLocale(v.lang);
        return normalized.startsWith('sr-') || normalized === 'sr' ||
               normalized.startsWith('rs-') || normalized === 'rs' ||
               normalized.startsWith('hr-') || normalized === 'hr' ||
               normalized.startsWith('bs-') || normalized === 'bs';
      });
      
      // Debug: log all voices to console
      console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));
      console.log('English voices found:', english.map(v => `${v.name} (${v.lang})`));
      console.log('Serbian/Croatian/Bosnian voices found:', serbian.map(v => `${v.name} (${v.lang})`));
      
      setEnglishVoices(english);
      setSerbianVoices(serbian);
      
      // Extract unique English locales (normalized) and sort by country name
      const uniqueLocales = Array.from(new Set(english.map(v => normalizeLocale(v.lang))));
      uniqueLocales.sort((a, b) => getCountryName(a).localeCompare(getCountryName(b)));
      setEnglishLocales(uniqueLocales);
      
      // Extract unique Serbian/Croatian/Bosnian locales (normalized) and sort by country name
      const uniqueSerbianLocales = Array.from(new Set(serbian.map(v => normalizeLocale(v.lang))));
      uniqueSerbianLocales.sort((a, b) => getCountryName(a).localeCompare(getCountryName(b)));
      setSerbianLocales(uniqueSerbianLocales);
      
      // Set default locale and voices
      if (uniqueLocales.length > 0 && !englishLocale) {
        // Prefer en-US, then en-GB, then first available
        const defaultLocale = uniqueLocales.find(l => l === 'en-us') || 
                             uniqueLocales.find(l => l === 'en-gb') ||
                             uniqueLocales[0];
        setEnglishLocale(defaultLocale);
        
        // Filter voices for default locale
        const voicesForLocale = english.filter(v => normalizeLocale(v.lang) === defaultLocale);
        setFilteredEnglishVoices(voicesForLocale);
        
        if (voicesForLocale.length > 0 && !selectedEnglishVoice) {
          const defaultVoice = voicesForLocale.find(v => v.name.includes('Natural') || v.name.includes('Premium')) || voicesForLocale[0];
          setSelectedEnglishVoice(defaultVoice.name);
        }
      }
      
      if (uniqueSerbianLocales.length > 0 && !serbianLocale) {
        // On Android prefer Serbian (sr), on other platforms prefer Croatian (hr)
        const isAndroid = /android/i.test(navigator.userAgent);
        const defaultSerbianLocale = isAndroid
          ? (uniqueSerbianLocales.find(l => l.startsWith('sr-') || l === 'sr') || 
             uniqueSerbianLocales.find(l => l.startsWith('hr-') || l === 'hr') ||
             uniqueSerbianLocales[0])
          : (uniqueSerbianLocales.find(l => l.startsWith('hr-') || l === 'hr') || 
             uniqueSerbianLocales.find(l => l.startsWith('sr-') || l === 'sr') ||
             uniqueSerbianLocales[0]);
        setSerbianLocale(defaultSerbianLocale);
        
        // Filter voices for default locale
        const voicesForSerbianLocale = serbian.filter(v => normalizeLocale(v.lang) === defaultSerbianLocale);
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

  const lessonIndex = parseInt(lessonId || '0');
  const lesson = lessonData?.lessons[lessonIndex];
  
  const [direction, setDirection] = useState<QuizDirection>('source-to-dest');
  const [mode, setMode] = useState<QuizMode>('type');
  const [storyOrder, setStoryOrder] = useState<'random' | 'in-order' | 'story-by-story'>('story-by-story');
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

  // Speak mode is enabled on all platforms
  const isSpeakModeDisabled = false;

  const normalizeLocale = (locale: string): string => {
    // Normalize Android format (e.g., "en_US_#android", "hr_HR") to standard format (e.g., "en-US", "hr-HR")
    // Also handle mixed formats like "sr_RS_#Latn"
    return locale
      .replace(/_/g, '-')  // Replace underscores with hyphens
      .replace(/#.+$/g, '')  // Remove script markers like #Cyrl, #Latn, #android
      .split('-')  // Split by hyphen
      .slice(0, 2)  // Take only language and country code
      .join('-')  // Join back
      .toLowerCase();
  };

  const getCountryName = (locale: string): string => {
    const normalized = normalizeLocale(locale);
    const countryNames: Record<string, string> = {
      'en-gb': 'United Kingdom',
      'en-us': 'United States',
      'en-au': 'Australia',
      'en-ca': 'Canada',
      'en-ie': 'Ireland',
      'en-in': 'India',
      'en-nz': 'New Zealand',
      'en-za': 'South Africa',
      'en-sg': 'Singapore',
      'en-ph': 'Philippines',
      'en-hk': 'Hong Kong',
      'en-ke': 'Kenya',
      'en-ng': 'Nigeria',
      'en-tz': 'Tanzania',
      'sr-rs': 'Serbia',
      'sr': 'Serbia',
      'rs-rs': 'Serbia',
      'rs': 'Serbia',
      'hr-hr': 'Croatia',
      'hr': 'Croatia',
      'bs-ba': 'Bosnia and Herzegovina',
      'bs': 'Bosnia and Herzegovina',
    };
    return countryNames[normalized] || normalized;
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
    const voicesForLocale = englishVoices.filter(v => normalizeLocale(v.lang) === locale);
    setFilteredEnglishVoices(voicesForLocale);
    
    // Auto-select first voice for new locale
    if (voicesForLocale.length > 0) {
      const defaultVoice = voicesForLocale.find(v => v.name.includes('Natural') || v.name.includes('Premium')) || voicesForLocale[0];
      setSelectedEnglishVoice(defaultVoice.name);
    }
  };

  const handleSerbianLocaleChange = (locale: string) => {
    setSerbianLocale(locale);
    const voicesForLocale = serbianVoices.filter(v => normalizeLocale(v.lang) === locale);
    setFilteredSerbianVoices(voicesForLocale);
    
    // Auto-select first voice for new locale
    if (voicesForLocale.length > 0) {
      const defaultVoice = voicesForLocale.find(v => v.name.includes('Natural') || v.name.includes('Premium')) || voicesForLocale[0];
      setSelectedSerbianVoice(defaultVoice.name);
    }
  };

  const handleStart = () => {
    const settings: QuizSettings = {
      lessonIndex,
      direction,
      mode,
      algorithm: 'A',
      englishVoice: selectedEnglishVoice,
      serbianVoice: selectedSerbianVoice,
      storyOrder,
    };

    // Pass settings via state
    navigate('/quiz', { state: settings });
  };

  const sourceLang = lessonData.languages[sourceIndex];
  const destLang = lessonData.languages[destIndex];
  const hasStories = !!(lesson.stories && lesson.stories.length > 0);

  const toggleBtn = (selected: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
      selected
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-1"
          >
            ← Back to Lessons
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{getLangText(lesson.title, sourceIndex)}</h1>
          <div className="text-lg text-gray-700">{getLangText(lesson.title, destIndex)}</div>
          <p className="mt-1 text-sm text-gray-500">
            Lesson {lessonIndex + 1} • {getLessonSentences(lesson).length} sentences
          </p>
        </div>
      </header>

      {/* Settings */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-5">
          {/* Row 1: Direction + Mode + Sentence Order */}
          <div className={`grid gap-4 ${hasStories ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {/* Direction */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Direction</div>
              <div className="flex flex-col gap-2">
                <button className={toggleBtn(direction === 'source-to-dest')} onClick={() => setDirection('source-to-dest')}>
                  {sourceLang} → {destLang}
                </button>
                <button className={toggleBtn(direction === 'dest-to-source')} onClick={() => setDirection('dest-to-source')}>
                  {destLang} → {sourceLang}
                </button>
                <button className={toggleBtn(direction === 'dest-to-dest')} onClick={() => setDirection('dest-to-dest')}>
                  {destLang} pronunciation
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {direction === 'source-to-dest' && `Read in ${sourceLang}, answer in ${destLang}`}
                {direction === 'dest-to-source' && `Read in ${destLang}, answer in ${sourceLang}`}
                {direction === 'dest-to-dest' && `Listen and repeat in ${destLang}`}
              </p>
            </div>

            {/* Mode */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Answer Mode</div>
              <div className="flex flex-col gap-2">
                <button className={toggleBtn(mode === 'multiple-choice')} onClick={() => setMode('multiple-choice')}>
                  Multiple Choice
                </button>
                <button className={toggleBtn(mode === 'type')} onClick={() => setMode('type')}>
                  Type Answer
                </button>
                <button
                  className={`${toggleBtn(mode === 'speak')} ${isSpeakModeDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (isSpeakModeDisabled) {
                      alert('Speech recognition is not supported on this platform for this language.');
                    } else {
                      setMode('speak');
                    }
                  }}
                >
                  Speak
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {mode === 'multiple-choice' && 'Pick the correct translation from 5 options'}
                {mode === 'type' && 'Type the translation yourself'}
                {mode === 'speak' && 'Say the translation out loud'}
              </p>
            </div>

            {/* Sentence Order */}
            {hasStories && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Sentence Order</div>
                <div className="flex flex-col gap-2">
                  <button className={toggleBtn(storyOrder === 'story-by-story')} onClick={() => setStoryOrder('story-by-story')}>
                    Story by Story
                  </button>
                  <button className={toggleBtn(storyOrder === 'in-order')} onClick={() => setStoryOrder('in-order')}>
                    In Order
                  </button>
                  <button className={toggleBtn(storyOrder === 'random')} onClick={() => setStoryOrder('random')}>
                    Random
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {storyOrder === 'story-by-story' && 'One story at a time, drill until all correct, then next story'}
                  {storyOrder === 'in-order' && 'Pick a random story and go through its sentences in order'}
                  {storyOrder === 'random' && 'All sentences from all stories mixed together'}
                </p>
              </div>
            )}
          </div>

          {/* Row 2: Voice Settings */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Voice Settings</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{sourceLang} Region</label>
                  <select
                    value={englishLocale}
                    onChange={(e) => handleLocaleChange(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {englishLocales.map((locale) => (
                      <option key={locale} value={locale}>{getCountryName(locale)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{sourceLang} Voice</label>
                  <select
                    value={selectedEnglishVoice}
                    onChange={(e) => setSelectedEnglishVoice(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {filteredEnglishVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>{voice.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{destLang} Region</label>
                  <select
                    value={serbianLocale}
                    onChange={(e) => handleSerbianLocaleChange(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {serbianLocales.map((locale) => (
                      <option key={locale} value={locale}>{getCountryName(locale)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{destLang} Voice</label>
                  <select
                    value={selectedSerbianVoice}
                    onChange={(e) => setSelectedSerbianVoice(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {filteredSerbianVoices.length > 0 ? (
                      filteredSerbianVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>{voice.name}</option>
                      ))
                    ) : (
                      <option value="">No voices found</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </main>
    </div>
  );
}

export default QuizSettingsPage;
