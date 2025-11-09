"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ServerErrorProps {
  message?: string;
  showRetry?: boolean;
}

export function ServerError({
  message = "Unable to connect to the server. Please try again later.",
  showRetry = true,
}: ServerErrorProps) {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mx-auto">
      <div className="text-center max-w-md w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 p-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Server Connection Error
          </h2>

          <p className="text-gray-600 mb-8">{message}</p>

          {showRetry && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#EF9C66] text-white rounded-lg hover:bg-[#E88B55] transition-colors font-medium mb-8"
            >
              <RefreshCw className="h-5 w-5" />
              Retry Connection
            </button>
          )}

          <div className="text-sm text-gray-500 border-t border-gray-200 pt-6">
            <p className="font-medium mb-3">Possible causes:</p>
            <ul className="space-y-2 text-center">
              <li className="flex items-center justify-center gap-2">
                <span className="text-red-500">•</span>
                The backend server is not running
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-red-500">•</span>
                Network connection issues
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-red-500">•</span>
                Server is temporarily unavailable
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
