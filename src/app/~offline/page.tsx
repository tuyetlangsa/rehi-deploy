"use client";
import Link from "next/link";

export default function Offline() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-200 mb-4">
          You&apos;re offline
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mb-6">
          This page isn&apos;t available offline yet.
        </p>
        <Link
          href="/articles"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Articles
        </Link>
      </div>
    </div>
  );
}
