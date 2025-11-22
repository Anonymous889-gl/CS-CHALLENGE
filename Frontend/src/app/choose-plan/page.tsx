"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/header";
import PageTransition from "../../components/page-transition";
import { Button } from "../../components/ui/button";

// Type describing a subscription plan
interface Plan {
  name: "free" | "premium" | "pro";
  label: string;
  price: string;
  period: string;
  credits: string;
  description: string;
  features: string[];
  icon: string; // material symbol name
  popular?: boolean;
}

// Plans shown to the user (mirrors pricing page design)
const plans: Plan[] = [
  {
    name: "free",
    label: "Free",
    price: "0",
    period: "per month",
    credits: "250 credits / week",
    description: "Great to start",
    features: [
      "Up to 10 CV reviews / week (25 credits each)",
      "Up to 6 AI interviews / week (40 credits each)",
      "Up to 70 job matches / week",
    ],
    icon: "bolt",
  },
  {
    name: "premium",
    label: "Premium",
    price: "9.99",
    period: "per month",
    credits: "1,500 credits / month",
    description: "Power user",
    features: [
      "CV reviews cost 20 credits",
      "AI interviews cost 35 credits",
      "Unlimited job matches",
      "Priority support",
    ],
    icon: "workspace_premium",
    popular: true,
  },
  {
    name: "pro",
    label: "Pro",
    price: "19.99",
    period: "per month",
    credits: "Unlimited credits",
    description: "Unlimited everything",
    features: [
      "Unlimited CV reviews",
      "Unlimited AI interviews",
      "Unlimited job matches",
      "Early access to new features",
    ],
    icon: "military_tech",
  },
];

export default function ChoosePlan() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<Plan["name"] | null>(null);

  const selectPlan = async (plan: Plan["name"]) => {
    setLoadingPlan(plan);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/billing/select-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Billing error");
      const data = await res.json();
      window.dispatchEvent(
        new CustomEvent("credits-update", { detail: data.creditsBalance })
      );
      router.push("/dashboard");
    } catch (e) {
      alert("Error selecting plan. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white font-[Manrope] text-[#1f2937]">
        <Header />
        <main className="py-20 sm:py-28">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-12">
            Select a Plan
          </h1>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full px-4 sm:px-5 lg:px-6 mx-auto">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col w-full border rounded-[32px] p-10 transition-all duration-300 hover:-translate-y-1 ${
                  p.popular
                    ? "border-gray-900 shadow-2xl"
                    : "border-gray-200 hover:border-gray-300 shadow-md hover:shadow-xl"
                }`}
              >
                {/* Popular badge */}
                {p.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}

                {/* Header */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {p.icon && (
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        p.popular ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {p.icon}
                    </span>
                  )}
                  <h3 className="text-xl font-bold capitalize">{p.label}</h3>
                </div>

                {/* Price / Credits */}
                <div className="mb-6">
                  <span className="text-5xl font-extrabold">${p.price}</span>
                  <span className="text-gray-600 ml-1">{p.period}</span>
                </div>
                <p className="text-sm text-indigo-600 font-semibold mb-6">
                  {p.credits}
                </p>

                {/* Feature list */}
                <ul className="space-y-2 text-left flex-1">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-indigo-600 text-base">
                        check_circle
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  disabled={loadingPlan !== null}
                  onClick={() => selectPlan(p.name)}
                  className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  {loadingPlan === p.name ? "..." : "Choose"}
                </Button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
