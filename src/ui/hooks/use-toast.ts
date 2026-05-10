import * as React from "react";

type Toast = {
  title?: React.ReactNode;
  description?: React.ReactNode;
};

const toasts: Toast[] = [];

export function toast(payload: Toast) {
  toasts.push(payload);
  console.log("Toast:", payload);
  return {
    id: String(toasts.length),
    dismiss: () => undefined,
    update: () => undefined,
  };
}

export function useToast() {
  return {
    toasts,
    toast,
    dismiss: () => undefined,
  };
}
