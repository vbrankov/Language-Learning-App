import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuizSettingsPage from './pages/QuizSettingsPage';
import QuizPage from './pages/QuizPage';

function App() {
  // Use the correct base path for GitHub Pages
  const basename = import.meta.env.MODE === 'production' ? '/Language-Learning-App' : '/';
  
  return (
    <Router basename={basename}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lesson/:lessonId/settings" element={<QuizSettingsPage />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
