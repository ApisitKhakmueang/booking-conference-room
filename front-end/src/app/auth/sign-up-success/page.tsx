import CardLayout from "@/components/layout/card-layout"

export default function SignUpSuccessForm() {
  return (
    <CardLayout>
      <p className="text-3xl font-semibold">Thank you for signing up!</p>
      <p className="text-slate">Check your email to confirm</p>
      <p>
        You&apos;ve successfully signed up. <br />
        Please check your email to confirm your account before signing in.
      </p>
    </CardLayout>
  )
}