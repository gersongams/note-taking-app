import Image from "next/image";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({
  message = "I'm just here waiting for your charming notes...",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-6">
      <div className="mb-6">
        <Image
          src="/asssets/empty_state.png"
          alt="Empty state illustration"
          width={297}
          height={296}
          priority
        />
      </div>
      <p className="text-lg text-foreground/80 max-w-md">{message}</p>
    </div>
  );
}
