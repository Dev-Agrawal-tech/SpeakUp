'use client'

import { Check, Sparkles, Zap, Crown, CreditCard as CardIcon, Receipt } from 'lucide-react'
import { plans, featureComparison } from '@/lib/config/plans'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'

export function SubscriptionSettings() {
  const currentPlan = plans.find(p => p.id === 'free')!

  return (
    <div className="max-w-3xl">
      <SettingsHeader
        title="Subscription & Plans"
        description="Manage your current plan and explore upgrade options."
      />

      {/* Current Plan Card */}
      <SettingsSection title="Current Plan">
        <SettingsCard className="relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/[0.07]" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{currentPlan.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                    Active
                  </span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">{currentPlan.tagline}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{currentPlan.priceLabel}</span>
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      {/* Plan Cards */}
      <SettingsSection title="Available Plans">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isFree = plan.id === 'free'
            const isPlus = plan.id === 'plus'
            const isPro = plan.id === 'pro'
            const PlanIcon = isFree ? Sparkles : isPlus ? Zap : Crown

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 transition-all ${
                  isFree
                    ? 'border-blue-500/30 bg-blue-500/[0.04]'
                    : 'border-white/[0.08] bg-white/[0.025] opacity-80'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white uppercase tracking-wider">
                    Best Value
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isFree ? 'bg-blue-500/15' : isPlus ? 'bg-violet-500/15' : 'bg-amber-500/15'
                  }`}>
                    <PlanIcon className={`h-4 w-4 ${
                      isFree ? 'text-blue-400' : isPlus ? 'text-violet-400' : 'text-amber-400'
                    }`} />
                  </div>
                  <h4 className="text-sm font-bold">{plan.name}</h4>
                </div>

                <div className="mb-4">
                  {plan.available ? (
                    <span className="text-xl font-bold">{plan.priceLabel}</span>
                  ) : (
                    <div>
                      <span className="text-xl font-bold text-white/60">{plan.priceLabel}</span>
                      <span className="block text-[10px] text-white/30 mt-0.5">Coming Soon</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-white/40 mb-4">{plan.tagline}</p>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-white/60">
                      <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                        isFree ? 'text-blue-400' : isPlus ? 'text-violet-400' : 'text-amber-400'
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isFree ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-blue-500/15 border border-blue-500/25 text-xs font-semibold text-blue-300 cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-medium text-white/40 cursor-not-allowed"
                  >
                    Upgrade — Coming Soon
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </SettingsSection>

      {/* Feature Comparison Matrix */}
      <SettingsSection title="Feature Comparison">
        <SettingsCard className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-2.5 pr-4 text-white/50 font-medium">Feature</th>
                {plans.map(p => (
                  <th key={p.id} className="text-center py-2.5 px-3 text-white/50 font-medium whitespace-nowrap">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureComparison.map((row) => (
                <tr key={row.label} className="border-b border-white/[0.04] last:border-0">
                  <td className="py-2.5 pr-4 text-white/60">{row.label}</td>
                  {(['free', 'plus', 'pro'] as const).map((tier) => {
                    const val = row[tier]
                    return (
                      <td key={tier} className="text-center py-2.5 px-3">
                        {val === true ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
                        ) : val === false ? (
                          <span className="text-white/20">—</span>
                        ) : (
                          <span className="text-white/60">{val}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsCard>
      </SettingsSection>

      {/* Billing Details */}
      <SettingsSection title="Billing Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsCard className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
              <Receipt className="h-5 w-5 text-white/25" />
            </div>
            <h4 className="text-sm font-medium text-white/60 mb-1">Billing History</h4>
            <p className="text-xs text-white/30">No billing history yet</p>
          </SettingsCard>

          <SettingsCard className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
              <CardIcon className="h-5 w-5 text-white/25" />
            </div>
            <h4 className="text-sm font-medium text-white/60 mb-1">Payment Methods</h4>
            <p className="text-xs text-white/30">No payment method needed on the Free plan</p>
          </SettingsCard>
        </div>
      </SettingsSection>
    </div>
  )
}
