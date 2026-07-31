import { cn } from "@/lib/utils";
import { forwardRef, useId } from "react";
import { Input, type InputProps } from "./input";
import { Select, type SelectProps } from "./select";
import { Textarea, type TextareaProps } from "./textarea";

interface FieldInputProps extends Omit<InputProps, "error"> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

interface FieldSelectProps extends Omit<SelectProps, "error"> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

interface FieldTextareaProps extends Omit<TextareaProps, "error"> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

function FieldLabel({
  id,
  label,
  required,
}: {
  id: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function FieldError({ error, hint }: { error?: string; hint?: string }) {
  return error ? (
    <p className="text-xs text-red-600" role="alert">{error}</p>
  ) : hint ? (
    <p className="text-xs text-gray-500">{hint}</p>
  ) : null;
}

export const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    const id = useId();
    return (
      <div className={cn("space-y-1.5", className)}>
        <FieldLabel id={id} label={label} required={required} />
        <Input id={id} ref={ref} error={!!error} {...props} />
        <FieldError error={error} hint={hint} />
      </div>
    );
  }
);
FieldInput.displayName = "FieldInput";

export const FieldSelect = forwardRef<HTMLSelectElement, FieldSelectProps>(
  ({ label, error, hint, required, className, children, ...props }, ref) => {
    const id = useId();
    return (
      <div className={cn("space-y-1.5", className)}>
        <FieldLabel id={id} label={label} required={required} />
        <Select id={id} ref={ref} error={!!error} {...props}>
          {children}
        </Select>
        <FieldError error={error} hint={hint} />
      </div>
    );
  }
);
FieldSelect.displayName = "FieldSelect";

export const FieldTextarea = forwardRef<HTMLTextAreaElement, FieldTextareaProps>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    const id = useId();
    return (
      <div className={cn("space-y-1.5", className)}>
        <FieldLabel id={id} label={label} required={required} />
        <Textarea id={id} ref={ref} error={!!error} {...props} />
        <FieldError error={error} hint={hint} />
      </div>
    );
  }
);
FieldTextarea.displayName = "FieldTextarea";

export type { FieldInputProps, FieldSelectProps, FieldTextareaProps };
