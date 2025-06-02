import { Half2, Moon, Sun } from '@terrazzo/icons';
import { Select, SelectItem } from '@terrazzo/tiles';
import { useEffect, useState } from 'react';

export const LS_THEME_KEY = 'tz-www-theme';
export const DOM_THEME_ATTRIBUTE = 'data-color-mode';

function getCurrentTheme(): 'light' | 'dark' | 'auto' {
  if (typeof localStorage !== 'undefined') {
    const lsValue = localStorage.getItem(LS_THEME_KEY);
    if (lsValue === 'light' || lsValue === 'dark') {
      return lsValue;
    } else {
      localStorage.removeItem(LS_THEME_KEY); // broken LS key? repair
      return 'auto';
    }
  }
  if (typeof window !== 'undefined') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  }
  return 'auto';
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(getCurrentTheme());

  // handle token updates
  useEffect(() => {
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute(DOM_THEME_ATTRIBUTE, theme);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LS_THEME_KEY, theme);
      }
    } else {
      document.documentElement.removeAttribute(DOM_THEME_ATTRIBUTE);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(LS_THEME_KEY);
      }
    }
  }, [theme]);

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as typeof theme)} aria-label='Theme'>
      <SelectItem value='auto' icon={<Half2 />}>
        Auto
      </SelectItem>
      <SelectItem value='light' icon={<Sun />}>
        Light
      </SelectItem>
      <SelectItem value='dark' icon={<Moon />}>
        Dark
      </SelectItem>
    </Select>
  );
}
