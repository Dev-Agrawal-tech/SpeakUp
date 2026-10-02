/**
 * Plan configuration — single source of truth for subscription tiers.
 * All prices are placeholders. Set `available: true` once payments are wired.
 * Currency can be changed globally via `defaultCurrency`.
 */

export const defaultCurrency = '₹' as const

export interface PlanFeature {
  label: string
  free: boolean | string
  plus: boolean | string
  pro: boolean | string
}

export interface PlanTier {
  id: 'free' | 'plus' | 'pro'
  name: string
  tagline: string
  price: number          // in smallest unit or display amount
  priceLabel: string     // formatted string shown in UI
  interval: 'month'
  available: boolean     // can users purchase this right now?
  features: string[]
  limits: Record<string, string | number>
  badge?: string
}

export const plans: PlanTier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Get started with core practice',
    price: 0,
    priceLabel: `${defaultCurrency}0/mo`,
    interval: 'month',
    available: true,
    badge: 'Current Plan',
    features: [
      '5 practice sessions per day',
      'Access to all beginner scenarios',
      'Basic AI feedback (grammar, clarity, confidence)',
      'Progress tracking overview',
      'Community scenarios',
      'Email support',
    ],
    limits: {
      dailySessions: 5,
      scenarioAccess: 'beginner',
      feedbackDepth: 'basic',
      historyDays: 7,
    },
  },
  {
    id: 'plus',
    name: 'Plus',
    tagline: 'Level up with deeper coaching',
    price: 499,
    priceLabel: `${defaultCurrency}499/mo`,
    interval: 'month',
    available: false,
    features: [
      '25 practice sessions per day',
      'All scenario levels unlocked',
      'Advanced AI feedback (tone, filler words, pacing)',
      'Session replay & history (30 days)',
      'Priority AI response times',
      'Hindi-English bilingual mode',
      'Priority support',
    ],
    limits: {
      dailySessions: 25,
      scenarioAccess: 'all',
      feedbackDepth: 'advanced',
      historyDays: 30,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Unlimited coaching for serious growth',
    price: 999,
    priceLabel: `${defaultCurrency}999/mo`,
    interval: 'month',
    available: false,
    features: [
      'Unlimited practice sessions',
      'All scenario levels + custom scenarios',
      'Expert AI feedback with improvement tracking',
      'Full session history & analytics',
      'Fastest AI response times',
      'Hindi-English bilingual mode',
      'Daily personalized challenge',
      'Dedicated support',
      'API access (coming soon)',
    ],
    limits: {
      dailySessions: -1, // unlimited
      scenarioAccess: 'all+custom',
      feedbackDepth: 'expert',
      historyDays: -1,   // unlimited
    },
  },
]

export const featureComparison: PlanFeature[] = [
  { label: 'Daily practice sessions', free: '5', plus: '25', pro: 'Unlimited' },
  { label: 'Scenario access', free: 'Beginner', plus: 'All levels', pro: 'All + Custom' },
  { label: 'AI feedback depth', free: 'Basic', plus: 'Advanced', pro: 'Expert' },
  { label: 'Session history', free: '7 days', plus: '30 days', pro: 'Unlimited' },
  { label: 'Hindi-English mode', free: false, plus: true, pro: true },
  { label: 'Session replay', free: false, plus: true, pro: true },
  { label: 'Improvement tracking', free: false, plus: false, pro: true },
  { label: 'Custom scenarios', free: false, plus: false, pro: true },
  { label: 'Daily challenge', free: false, plus: false, pro: true },
  { label: 'Priority AI response', free: false, plus: true, pro: true },
  { label: 'API access', free: false, plus: false, pro: 'Coming Soon' },
]
