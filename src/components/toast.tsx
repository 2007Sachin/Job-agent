"use client";

import { useEffect, useState } from "react";

export function notify(message: string) {
  window.dispatchEvent(new CustomEvent("ja-toast", { detail: message }));
}

export function Toasts() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let timer = 0;
    function onToast(event: Event) {
      setMessage(String((event as CustomEvent).detail || ""));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(""), 2800);
    }
    window.addEventListener("ja-toast", onToast);
    return () => {
      window.removeEventListener("ja-toast", onToast);
      window.clearTimeout(timer);
    };
  }, []);
  if (!message) return null;
  return (
    <p role="status" className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 border border-line bg-card px-4 py-3 shadow-lg">
      {message}
    </p>
  );
}
