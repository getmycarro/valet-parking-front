import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "lucide-react"
import type { ReactNode } from "react"

interface LoginPageLayoutProps {
  title: string
  description: string
  role: "admin" | "attendant"
  children: ReactNode
}

export function LoginPageLayout({ title, description, role, children }: LoginPageLayoutProps) {
  const bgColor = role === "admin" ? "bg-primary" : "bg-blue-600"

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className={`${bgColor} rounded-full p-3`}>
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Valet Parking</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
