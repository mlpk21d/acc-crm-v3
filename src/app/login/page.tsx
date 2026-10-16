import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <h1>ACC CRM</h1>
      <p>Sign in to your account.</p>
      <LoginForm />
    </main>
  );
}
