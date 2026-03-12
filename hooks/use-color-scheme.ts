import * as React from 'react'

type ColorScheme = 'light' | 'dark'

export function useColorScheme(): ColorScheme {
  const [scheme, setScheme] = React.useState<ColorScheme>('light')

  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    setScheme(mql.matches ? 'dark' : 'light')

    const onChange = (e: MediaQueryListEvent) => {
      setScheme(e.matches ? 'dark' : 'light')
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return scheme
}
