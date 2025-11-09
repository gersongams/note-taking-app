"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import { Button } from "./ui/button";

interface Category {
  id: string;
  name: string;
  color: string;
  slug: string;
  count?: number;
}

interface SidebarProps {
  categories: Category[];
}

export function Sidebar({ categories }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const _currentCategory = categories.find(
    (cat) => pathname === `/${cat.slug}`,
  );

  const _handleCategoryChange = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      router.push(`/${category.slug}`);
    }
  };

  return (
    <aside className="hidden md:flex w-64 md:mt-[90px] bg-background h-screen sticky top-0 p-6 flex-col font-inter">
      <div className="flex-1 space-y-6">
        <div>
          <Link href="/">
            <h2 className="text-xs font-bold text-black mb-4">
              All Categories
            </h2>
          </Link>

          <nav className="space-y-1">
            {categories.map((category) => {
              const isActive = pathname === `/${category.slug}`;
              return (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2 text-xs text-black rounded-lg transition-all hover:bg-muted/30",
                    isActive && "bg-muted/30 font-medium",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  {category.count !== undefined && category.count > 0 && (
                    <span className="text-xs text-black/60 font-medium">
                      {category.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm text-black rounded-lg border-[#957139] hover:bg-muted/30 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
