import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CategoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <h1 className="text-6xl font-serif font-bold text-foreground mb-4">
        404
      </h1>
      <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
        Category Not Found
      </h2>
      <p className="text-lg text-foreground/80 mb-8 max-w-md">
        The category you're looking for doesn't exist or has been removed.
      </p>
      <Link href="/">
        <Button className="rounded-xl bg-transparent border border-[#957139] text-[#957139] hover:bg-[#957139] hover:text-background transition-colors cursor-pointer">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
