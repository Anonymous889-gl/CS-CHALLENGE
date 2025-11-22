"use client";

import { useState } from "react";
import Header from "../../components/header";
import PageTransition from "../../components/page-transition";

type Audience = "jobseeker" | "company";

type Plan = {
  name: string
  price: string
  period: string
  credits?: string
  features: string[]
  cta: string
  popular?: boolean
  icon?: string // material symbol name
}

export default function PricingPage() {
  const [audience, setAudience] = useState<Audience>("jobseeker");

  const jobPlans: Plan[] = [
    {
      name: "Free",
      price: "0",
      period: "per month",
      credits: "250 credits / week",
      features: [
        "Up to 10 CV reviews / week (25 credits each)",
        "Up to 6 AI interviews / week (40 credits each)",
        "Up to 70 job matches / week",
      ],
      cta: "Get Started",
      icon: "bolt",  // generic icon
    },
    {
      name: "Premium",
      price: "9.99",
      period: "per month",
      credits: "1,500 credits / month",
      features: [
        "CV reviews cost 20 credits",
        "AI interviews cost 35 credits",
        "Unlimited job matches",
        "Priority support",
      ],
      cta: "Upgrade",
      popular: true,
      icon: "workspace_premium"
    },
    {
      name: "Pro",
      price: "19.99",
      period: "per month",
      credits: "Unlimited credits",
      features: [
        "Unlimited CV reviews",
        "Unlimited AI interviews",
        "Unlimited job matches",
        "Early access to new features",
      ],
      cta: "Go Pro",
      icon: "military_tech"
    },
  ];

  const companyPlans: Plan[] = [
    {
      name: "Company",
      price: "49.99",
      period: "per month",
      credits: "Unlimited job posts",
      features: [
        "Create and publish job listings",
        "Receive detailed reports of matching candidates",
        "Priority visibility across the platform",
      ],
      cta: "Subscribe",
      popular: true,
      icon: "business_center"
    },
  ];

  const plans = audience === "jobseeker" ? jobPlans : companyPlans;

  return (
    <PageTransition>
      <div className="min-h-screen bg-white font-[Manrope] text-[#1f2937]">
        <Header />
        <main className="py-20 sm:py-28">
          <div className="w-full px-4 sm:px-5 lg:px-6 text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold">Pricing Plans</h1>

            {/* Audience Toggle */}
            <div className="inline-flex border border-gray-200 rounded-full overflow-hidden mt-6">
              <button
                onClick={() => setAudience("jobseeker")}
                className={`px-6 py-3 text-base font-medium transition-colors ${
                  audience === "jobseeker"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Job Seeker
              </button>
              <button
                onClick={() => setAudience("company")}
                className={`px-6 py-3 text-base font-medium transition-colors border-l border-gray-200 ${
                  audience === "company"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Company
              </button>
            </div>

            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              {audience === "jobseeker"
                ? "Choose the plan that fits your career journey. Credits renew automatically."
                : "Subscribe to reach top talent and gain enhanced visibility on UtopiaHire."}
            </p>
          </div>

          <div
            className={`grid gap-4 transition-opacity duration-300 ${audience === 'jobseeker' ? 'opacity-100' : 'opacity-100'} ${
              plans.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'max-w-md'} w-full px-4 sm:px-5 lg:px-6 mx-auto`}
          >
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col w-full border rounded-[32px] p-10 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-gray-900 shadow-2xl'
                    : 'border-gray-200 hover:border-gray-300 shadow-md hover:shadow-xl'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                )}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {plan.icon && (
                  <span className={`material-symbols-outlined text-3xl ${plan.popular ? 'text-gray-900' : 'text-gray-600'}`}>{plan.icon}</span>
                )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold">${plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
                {plan.credits && (
                  <p className="text-sm text-indigo-600 font-semibold mb-6">
                    {plan.credits}
                  </p>
                )}
                <ul className="space-y-2 text-left flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-indigo-600 text-base">check_circle</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
