import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, redirectToSignIn } = await auth()

  if (!isAuthenticated) {
    return redirectToSignIn()
  }

  // Already onboarded — go straight to the app.
  const user = await currentUser()

  if (user?.publicMetadata?.onboardingComplete) {
    redirect("/")
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-10 sm:px-8">
      {children}
    </div>
  )
}
