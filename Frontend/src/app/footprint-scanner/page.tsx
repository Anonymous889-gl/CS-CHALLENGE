"use client"

import Header from "../../components/header";
import PageTransition from "../../components/page-transition";

export default function FootprintScannerPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white font-[Manrope] text-[#1f2937]">
        <Header />

        <main className="py-20 sm:py-28 flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[Manrope] text-center mb-4">
            Footprint Scanner
          </h1>
          <p className="max-w-xl text-center text-lg text-gray-600 font-[Manrope]">
            This feature is coming soon! Stay tuned as we build a smart tool to analyze your digital footprint and help tailor your job search.
          </p>
        </main>
      </div>
    </PageTransition>
  );
}
