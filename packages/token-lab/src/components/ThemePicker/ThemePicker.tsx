import { Half2, Moon, Sun } from '@terrazzo/icons';
import { Select, SelectItem } from '@terrazzo/tiles';
import { useEffect, useState } from 'react';

const THEME_OPTIONS = [
  {
    value: 'auto',
    icon: <Half2 />,
    label: 'Auto',
  },
  {
    value: 'light',
    icon: <Sun />,
    label: 'Light',
  },
  {
    value: 'dark',
    icon: <Moon />,
    label: 'Dark',
  },
] as const;

type ThemeValue = (typeof THEME_OPTIONS)[number]['value'];

const THEME_STORAGE_KEY = 'tz-token-lab-theme';
const DOM_THEME_ATTRIBUTE = 'data-color-mode';

// Only need to get the theme preference from localStorage on page load
const themePreference = localStorage.getItem(THEME_STORAGE_KEY) as ThemeValue | null;

// Manage the theme state and persist it to localStorage
const useTheme = () => {
  const [theme, setTheme] = useState<ThemeValue>(themePreference || 'auto');

  useEffect(() => {
    if (theme === 'auto') {
      document.documentElement.removeAttribute(DOM_THEME_ATTRIBUTE);
    } else {
      document.documentElement.setAttribute(DOM_THEME_ATTRIBUTE, theme);
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
};

const ThemePicker = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as ThemeValue)} trigger={theme} aria-label='Theme'>
      {THEME_OPTIONS.map((option) => (
        <SelectItem key={option.value} value={option.value} icon={option.icon}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default ThemePicker;
