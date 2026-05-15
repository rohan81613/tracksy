import { HiSun, HiMoon, HiDesktopComputer } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

/**
 * Cycles: light → dark → system → light
 * Shows the icon for the *current* resolved theme.
 * Tooltip describes the *next* state in the cycle.
 */
const NEXT_LABEL = {
  light: 'Switch to dark mode',
  dark: 'Switch to system theme',
  system: 'Switch to light mode',
};

export default function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const ariaLabel = NEXT_LABEL[theme] ?? 'Toggle theme';

  return (
    <button
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-[#1e2530] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
    >
      {theme === 'system' ? (
        <HiDesktopComputer className="w-5 h-5" aria-hidden="true" />
      ) : resolvedTheme === 'dark' ? (
        <HiSun className="w-5 h-5" aria-hidden="true" />
      ) : (
        <HiMoon className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
}
