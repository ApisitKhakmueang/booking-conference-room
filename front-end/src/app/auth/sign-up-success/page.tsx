import AuthLayout from "@/components/auth/auth-layout"

export default function SignUpSuccessForm() {
  return (
    <AuthLayout>
      <p className="text-3xl font-semibold">Thank you for signing up!</p>
      <p className="text-slate">Check your email to confirm</p>
      <p>
        You&apos;ve successfully signed up. <br />
        Please check your email to confirm your account before signing in.
      </p>
    </AuthLayout>
  )
}