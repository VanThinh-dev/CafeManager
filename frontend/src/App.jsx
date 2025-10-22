import { useEffect } from 'react';
import AppRoutes from './config/router';
import { useThemeStore } from './store/useThemeStore';

function App() {
  const { effectiveTheme, initSystemThemeListener } = useThemeStore();

  // Initialize system theme listener
  useEffect(() => {
    return initSystemThemeListener();
  }, [initSystemThemeListener]);

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300" data-theme={effectiveTheme}>
      <AppRoutes />
    </div>
  );
}

export default App;