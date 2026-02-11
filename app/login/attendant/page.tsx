import { LoginPageLayout } from "@/components/shared/login-page-layout"
import { LoginForm } from "@/components/login-form"

export default function AttendantLoginPage() {
  return (
    <LoginPageLayout
      title="Attendant Login"
      description="Sign in to manage vehicle parking"
      role="attendant"
    >
      <LoginForm userType="attendant" />
    </LoginPageLayout>
  )
}
