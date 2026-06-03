"use client";

interface ToastProps {
  message: string | null;
}

// Componente puramente visual — el auto-dismiss lo maneja el llamador con setTimeout.
// Position: fixed encima del footer fijo (bottom-[72px]).
// La animación toastIn está definida en globals.css.
export default function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-[72px] left-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-sans font-bold whitespace-nowrap animate-toast-in"
      style={{
        transform: "translateX(-50%)",
        background: "linear-gradient(135deg, #2e1c0a, #231508)",
        border: "1px solid rgba(201,158,76,0.4)",
        color: "#f5ead8",
        boxShadow: "0 10px 28px rgba(0,0,0,0.55)",
      }}
    >
      <span style={{ color: "#c99e4c" }}>🥐</span>
      {message}
    </div>
  );
}
