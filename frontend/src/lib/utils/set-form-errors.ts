import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

export function setFormErrors<TFieldValues extends FieldValues>({
  form,
  errors,
}: {
  form: UseFormReturn<TFieldValues>;
  errors: Record<string, string[]>;
}) {
  Object.entries(errors).forEach(([field, messages]) => {
    form.setError(field as Path<TFieldValues>, {
      type: "server",
      message: messages.join(", "),
    });
  });
}
