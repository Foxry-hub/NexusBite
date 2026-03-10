"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastStyles: Record<ToastType, { bg: string; icon: typeof CheckCircle; iconColor: string; border: string }> = {
  success: {
    bg: "bg-green-500/10",
    icon: CheckCircle,
    iconColor: "text-green-400",
    border: "border-green-500/30",
  },
  error: {
    bg: "bg-red-500/10",
    icon: XCircle,
    iconColor: "text-red-400",
    border: "border-red-500/30",
  },
  warning: {
    bg: "bg-amber-500/10",
    icon: AlertCircle,
    iconColor: "text-amber-400",
    border: "border-amber-500/30",
  },
  info: {
    bg: "bg-blue-500/10",
    icon: Info,
    iconColor: "text-blue-400",
    border: "border-blue-500/30",
  },
};

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: string) => void;
}) {
  const style = toastStyles[toast.type];
  const Icon = style.icon;

  return (
    <div
      className={`${style.bg} ${style.border} border backdrop-blur-xl rounded-xl p-4 shadow-2xl flex items-start gap-3 min-w-[320px] max-w-[420px] animate-toast-slide-in`}
    >
      <div className={`flex-shrink-0 ${style.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="flex-1 text-white text-sm font-medium leading-relaxed">
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-neutral-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={hideToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
