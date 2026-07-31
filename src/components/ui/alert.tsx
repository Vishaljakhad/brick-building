import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

const styles: Record<AlertVariant, { box: string; icon: string }> = {
  info: { box: "bg-blue-50 border-blue-200 text-blue-800", icon: "text-blue-500" },
  success: { box: "bg-green-50 border-green-200 text-green-800", icon: "text-green-500" },
  warning: { box: "bg-amber-50 border-amber-200 text-amber-800", icon: "text-amber-500" },
  error: { box: "bg-red-50 border-red-200 text-red-800", icon: "text-red-500" },
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export function AlertBanner({ variant = "info", title, message, onClose, className }: AlertBannerProps) {
  const Icon = icons[variant];
  const { box, icon } = styles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        box,
        className
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", icon)} />
      <div className="flex-1 space-y-0.5 min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {message && <p className="text-sm opacity-90 break-words">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
