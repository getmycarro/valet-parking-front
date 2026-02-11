import { LoginPageLayout } from "@/components/shared/login-page-layout"
import { LoginForm } from "@/components/login-form"

export default function AdminLoginPage() {
  return (
    <LoginPageLayout
      title="Admin Login"
      description="Access the administration panel"
      role="admin"
    >
      <LoginForm userType="admin" />
    </LoginPageLayout>
  )
}
