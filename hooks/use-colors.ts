import { useColorScheme } from './use-color-scheme'

export interface ColorPalette {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  /** Text color on top of primary action buttons */
  onPrimary: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  input: string
  ring: string
  destructive: string
  sidebar: string
  sidebarForeground: string
  sidebarPrimary: string
  sidebarPrimaryForeground: string
}

const lightColors: ColorPalette = {
  background: '#F4F4F2',
  foreground: '#202258',
  card: '#FFFFFF',
  cardForeground: '#202258',
  primary: '#6DABCA',
  primaryForeground: '#000000',
  onPrimary: '#000000',
  secondary: '#EEEEF2',
  secondaryForeground: '#202258',
  muted: '#EEEEF2',
  mutedForeground: '#7A7A9A',
  accent: '#EEEEF2',
  accentForeground: '#202258',
  border: '#DDDDE8',
  input: '#EBEBF0',
  ring: '#202258',
  destructive: '#DC2626',
  sidebar: '#FFFFFF',
  sidebarForeground: '#202258',
  sidebarPrimary: '#202258',
  sidebarPrimaryForeground: '#FFFFFF',
}

const darkColors: ColorPalette = {
  background: '#000000',
  foreground: '#EDEDED',
  card: '#111111',
  cardForeground: '#EDEDED',
  primary: '#6DABCA',
  primaryForeground: '#000000',
  onPrimary: '#000000',
  secondary: '#1A1A1A',
  secondaryForeground: '#EDEDED',
  muted: '#1A1A1A',
  mutedForeground: '#A0A0A0',
  accent: '#1A2530',
  accentForeground: '#6DABCA',
  border: '#1F1F1F',
  input: '#1A1A1A',
  ring: '#6DABCA',
  destructive: '#EF4444',
  sidebar: '#0D0D0D',
  sidebarForeground: '#EDEDED',
  sidebarPrimary: '#6DABCA',
  sidebarPrimaryForeground: '#000000',
}

export function useColors(): ColorPalette {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkColors : lightColors
}
