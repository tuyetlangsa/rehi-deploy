"use client";

import { useRouter } from "next/navigation";

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="w-full max-w-md p-8 bg-neutral-900 rounded-2xl shadow-lg text-center animate-fadeIn">
        <div className="mb-4">
          <svg
            className="mx-auto h-14 w-14 text-green-500 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3">Payment Successful</h1>

        <p className="text-gray-400 mb-8">
          Your subscription has been activated successfully.
        </p>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-green-600 hover:bg-green-700 transition text-white font-semibold py-2.5 rounded-lg"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
