import Link from "next/link"
import { Car, Shield, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo and title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-4">
          <Car className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Valet Parking System</h1>
        <p className="text-muted-foreground mt-2 text-lg">Select your role</p>
      </div>

      {/* Role selection cards */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Attendant Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer">
          <Link href="/login/attendant" className="block">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <UserCog className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Attendant</CardTitle>
              <CardDescription className="text-muted-foreground">Vehicle management</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Register vehicles</li>
                {/* <li>• Scan QR codes</li> */}{/* QR deshabilitado */}
                <li>• View stored vehicles</li>
              </ul>
              <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign in as Attendant
              </Button>
            </CardContent>
          </Link>
        </Card>

        {/* Administrator Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50 cursor-pointer">
          <Link href="/login/admin" className="block">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-xl text-foreground">Administrator</CardTitle>
              <CardDescription className="text-muted-foreground">Full system access</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configure payments</li>
                <li>• Financial dashboard</li>
                <li>• Employee management</li>
              </ul>
              <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                Sign in as Admin
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>© 2026 Valet Parking System. All rights reserved.</p>
      </footer>
    </main>
  )
}
