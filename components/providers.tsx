"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth"
import { StoreProvider } from "@/lib/store"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <StoreProvider>{children}</StoreProvider>
      </AuthProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
}
