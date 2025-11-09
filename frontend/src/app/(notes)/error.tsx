"use client";

import { ServerError } from "@/components/ServerError";

export default function NotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string; isNetworkError?: boolean };
  reset: () => void;
}) {
  if (error.isNetworkError) {
    return <ServerError message={error.message} showRetry={true} />;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#EF9C66] text-white rounded-lg hover:bg-[#E88B55] transition-colors font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
