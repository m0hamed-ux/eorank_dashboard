"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"

export type OnboardingAnswers = {
  referralSource: string
  companyName: string
  companyWebsite: string
  companyType: string
  companySize: string
  role: string
}

const REQUIRED_FIELDS: (keyof OnboardingAnswers)[] = [
  "referralSource",
  "companyName",
  "companyType",
  "companySize",
  "role",
]

export async function completeOnboarding(answers: OnboardingAnswers) {
  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated) {
    return { error: "You must be signed in." }
  }

  for (const field of REQUIRED_FIELDS) {
    if (!answers[field]?.trim()) {
      return { error: "Please fill in all required fields." }
    }
  }

  const client = await clerkClient()

  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        referralSource: answers.referralSource.trim(),
        companyName: answers.companyName.trim(),
        companyWebsite: answers.companyWebsite.trim(),
        companyType: answers.companyType.trim(),
        companySize: answers.companySize.trim(),
        role: answers.role.trim(),
      },
    })
    return { success: true }
  } catch {
    return { error: "There was an error saving your answers. Please try again." }
  }
}
