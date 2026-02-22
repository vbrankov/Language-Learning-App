import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LessonDatabase } from './types';

interface DatabaseContextValue {
  database: LessonDatabase | null;
  loading: boolean;
  error: string | null;
  noDatabase: boolean;
  dbUrl: string | null;
  sourceIndex: number;
  destIndex: number;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [database, setDatabase] = useState<LessonDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noDatabase, setNoDatabase] = useState(false);
  const [dbUrl, setDbUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('db');

    if (!url) {
      setNoDatabase(true);
      setLoading(false);
      return;
    }

    setDbUrl(url);

    const load = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load database: ${response.status}`);
        const data = await response.json();
        setDatabase(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <DatabaseContext.Provider value={{ database, loading, error, noDatabase, dbUrl, sourceIndex: 0, destIndex: 1 }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider');
  return ctx;
}
