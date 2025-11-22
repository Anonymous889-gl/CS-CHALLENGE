"use client";
import React from 'react';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f8]">
      <div className="text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="font-[Manrope] text-gray-700">Preparing AI Interview module…</p>
      </div>
    </div>
  );
}
