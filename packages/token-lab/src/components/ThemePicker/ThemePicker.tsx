import { Half2, Moon, Sun } from '@terrazzo/icons';
import { Select, SelectItem } from '@terrazzo/tiles';
import { useEffect, useState } from 'react';
import c from './ThemePicker.module.css';

type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'terrazzo-theme-preference';

const themePreference = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

// Manage the theme state and persist it to localStorage
const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(themePreference || 'system');

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-color-mode');
    } else {
      document.documentElement.setAttribute('data-color-mode', theme);
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
};

const ThemePicker = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as Theme)} trigger={theme} aria-label='Theme'>
      <SelectItem value='system'>
        <span className={c.themePickerItem}>
          <Half2 /> System
        </span>
      </SelectItem>
      <SelectItem value='light'>
        <span className={c.themePickerItem}>
          <Sun /> Light
        </span>
      </SelectItem>
      <SelectItem value='dark'>
        <span className={c.themePickerItem}>
          <Moon /> Dark
        </span>
      </SelectItem>
    </Select>
  );
};

export default ThemePicker;
