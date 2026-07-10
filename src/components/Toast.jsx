import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

let listeners = [];
let toastsList = [];

export function toast(message, type = "success") {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { id, message, type };
  toastsList = [...toastsList, newToast];
  listeners.forEach((listener) => listener(toastsList));

  // Auto remove after 4 seconds
  setTimeout(() => {
    toastsList = toastsList.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(toastsList));
  }, 4000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleUpdate = (updatedToasts) => {
      setToasts(updatedToasts);
    };
    listeners.push(handleUpdate);
    setToasts(toastsList);

    return () => {
      listeners = listeners.filter((l) => l !== handleUpdate);
    };
  }, []);

  const removeToast = (id) => {
    toastsList = toastsList.filter((t) => t.id !== id);
    setToasts(toastsList);
    listeners.forEach((listener) => listener(toastsList));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => {
          const bgClass =
            t.type === "success"
              ? "border-green-500/30 bg-black/90 text-green-400"
              : t.type === "error"
              ? "border-red-500/30 bg-black/90 text-red-400"
              : "border-gold-500/30 bg-black/90 text-gold-400";

          const Icon =
            t.type === "success"
              ? CheckCircle
              : t.type === "error"
              ? AlertCircle
              : Info;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              layout
              className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-md ${bgClass}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
