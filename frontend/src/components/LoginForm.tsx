"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { setFormErrors } from "@/lib/utils/set-form-errors";
import { loginSchema } from "@/schemas/auth";
import { loginAction } from "@/server/actions/auth";
import type { ActionState } from "@/server/actions/middleware";

export function LoginForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    { error: "", success: "" },
  );

  const [, startTransition] = useTransition();

  const onSubmit = useCallback(
    async (_values: z.infer<typeof loginSchema>) => {
      const formElement = formRef.current;
      if (!formElement) {
        return;
      }
      startTransition(() => {
        action(new FormData(formElement));
      });
    },
    [action],
  );

  useEffect(() => {
    if (pending || !state) {
      return;
    }

    if (state.success) {
      toast.success(state.success);
      router.push("/");
    } else if (state.error) {
      if (typeof state.error === "string") {
        toast.error(state.error);
      } else if (form) {
        setFormErrors({ form, errors: state.error });
      }
    }
  }, [state, router, form, pending]);

  return (
    <div className="w-full max-w-md mx-auto px-6">
      <div className="text-center space-y-6 mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/asssets/login.png"
            alt="Login illustration"
            width={95}
            height={113}
            priority
          />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground">
          Yay, You&apos;re Back!
        </h1>
      </div>

      <Form {...form}>
        <form
          ref={formRef}
          action={action}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground/80">
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    className="h-12 rounded-sm border-[#957139] bg-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground/80">
                  Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    className="h-12 rounded-sm border-[#957139] bg-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-background border border-[#957139] text-[#957139] hover:bg-[#957139] hover:text-background font-medium text-base mt-6 transition-colors cursor-pointer"
            disabled={pending}
          >
            {pending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-6">
        <Link
          href="/auth/signup"
          className="text-sm text-[#A08968] hover:text-foreground underline transition-colors"
        >
          Oops! I&apos;ve never been here before
        </Link>
      </div>
    </div>
  );
}
