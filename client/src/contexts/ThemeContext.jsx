import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE = 'ems_theme'

function getSystem() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE) || 'dark')
  const [resolved, setResolved] = useState(() => (theme === 'system' ? getSystem() : theme))

  useEffect(() => {
    const apply = () => {
      const r = theme === 'system' ? getSystem() : theme
      setResolved(r)
      document.documentElement.classList.toggle('dark', r === 'dark')
    }
    apply()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (theme === 'system') apply()
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = (t) => {
    localStorage.setItem(STORAGE, t)
    setThemeState(t)
  }

  const toggle = () => {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }

  const value = { theme, resolved, setTheme, toggle }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme outside provider')
  return ctx
}
