import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './DatabaseContext';
import HomePage from './pages/HomePage';
import QuizSettingsPage from './pages/QuizSettingsPage';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <Router basename="/Language-Learning-App">
      <DatabaseProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lesson/:lessonId/settings" element={<QuizSettingsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
          </Routes>
        </div>
      </DatabaseProvider>
    </Router>
  );
}

export default App;
