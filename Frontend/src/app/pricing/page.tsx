"use client";

import { useState } from "react";
import Header from "../../components/header";
import PageTransition from "../../components/page-transition";

type Audience = "jobseeker" | "company";

type Plan = {
  name: string;
  price: string;
  period: string;
  credits: string;
  features: string[];
  cta: string;
};

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
                className="max-w-sm w-full flex flex-col min-h-[460px] border-2 border-gray-300 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-indigo-600 font-semibold mb-6">
                  {plan.credits}
                </p>
                <ul className="space-y-2 text-left flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-indigo-600 text-base">
                        check_circle
                      </span>
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
