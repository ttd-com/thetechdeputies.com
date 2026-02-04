'use client';

import { useTheme } from '@/contexts/ThemeContext';

/**
 * Theme toggle button with sun/moon icons
 */
export function ThemeToggle() {
  const { effectiveTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {effectiveTheme === 'light' ? (
        // Moon icon for dark mode
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 1 1 .12-11.48 1 1 0 0 0 1.07-1.66 9.93 9.93 0 0 0-13.96 13.66A9.9 9.9 0 0 0 21.64 13Z" />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
          <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
