export {}

export type OnboardingData = {
  onboardingComplete?: boolean
  referralSource?: string
  companyName?: string
  companyWebsite?: string
  companyType?: string
  companySize?: string
  role?: string
}

declare global {
  interface CustomJwtSessionClaims {
    metadata: OnboardingData
  }

  interface UserPublicMetadata extends OnboardingData {}
}
