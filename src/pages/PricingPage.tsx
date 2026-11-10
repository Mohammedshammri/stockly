import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PRICING_PLANS } from '../data/demoData';
import { SubscriptionTier } from '../types';
import { Check, Sparkles, HelpCircle, ShieldCheck, Zap } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { activePlan, setActivePlan } = useStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleSelectPlan = (tier: SubscriptionTier) => {
    setActivePlan(tier);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparent SaaS Retail Plans</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Flexible Pricing for Growing Retailers
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Choose the right plan for your boutique shop, supermarket, or multi-location store. Scale up as your SKU catalog grows.
        </p>

        {/* Billing cycle switch */}
        <div className="pt-2 flex items-center justify-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const isCurrent = activePlan === plan.id;
          const isFeatured = plan.highlighted;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                isFeatured
                  ? 'bg-white border-2 border-emerald-600 shadow-lg ring-4 ring-emerald-500/10'
                  : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                  Recommended for Retailers
                </div>
              )}

              {/* Plan Header */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[11px] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active Tier (Demo)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

                {/* Price Display */}
                <div className="mt-5 pb-5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                      ${billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {billingCycle === 'annual' ? '/ year' : '/ month'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    {billingCycle === 'annual'
                      ? `Billed annually at $${plan.priceAnnual}/year ($${Math.round(plan.priceAnnual / 12)}/mo equivalent, save 20%)`
                      : `Standard monthly billing: $${plan.priceMonthly}/month`}
                  </span>
                </div>

                {/* Capacity badge */}
                <div className="mt-4 p-2 bg-slate-50 rounded-lg text-center font-mono text-xs font-semibold text-slate-700">
                  {plan.productLimit}
                </div>

                {/* Features List */}
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all shadow-xs ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default border border-slate-200'
                      : isFeatured
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? 'Current Active Tier (Demo)' : `Switch to ${plan.name} (Demo)`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demonstration Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1.5 text-xs text-slate-600">
        <p className="font-semibold text-slate-900">
          Demonstration Pricing & Interactive Tier Simulation
        </p>
        <p className="text-slate-500">
          These plans are demonstration prices for commercial evaluation. Clicking plan buttons toggles features and tier parameters in the local demo store. No actual payment processing or real credit card transactions occur.
        </p>
      </div>
    </div>
  );
};
