"use client";

import { useRouter } from "next/navigation";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="w-full max-w-md p-8 bg-neutral-900 rounded-2xl shadow-lg text-center animate-fadeIn">
        
        <div className="mb-4">
          <svg
            className="mx-auto h-14 w-14 text-red-500 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3">
          Payment Cancelled
        </h1>

        <p className="text-gray-400 mb-8">
          Your subscription process was cancelled. No charges were made.
        </p>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-white/10 hover:bg-white/20 transition text-white font-semibold py-2.5 rounded-lg"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
