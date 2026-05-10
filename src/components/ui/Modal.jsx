import { useEffect } from "react";
import clsx from "clsx";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md", // sm, md, lg, xl
  closeOnBackdrop = true,
  closeButton = true,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
        onClick={() => closeOnBackdrop && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-md pointer-events-none">
        <div
          className={clsx(
            "bg-surface-container-lowest dark:bg-[#1e1f2a] rounded-lg shadow-card-hover",
            "border border-outline-variant overflow-hidden max-w-full pointer-events-auto",
            "animate-fadeIn",
            sizeClasses[size]
          )}
        >
          {/* Header */}
          <div className={clsx(
            "px-lg py-md border-b border-outline-variant flex items-center justify-between",
            "bg-surface-container-low dark:bg-[#282a36]"
          )}>
            <h2 className="text-headline-md text-on-surface dark:text-[#e4e4ef] font-semibold">
              {title}
            </h2>
            {closeButton && (
              <button
                onClick={onClose}
                className={clsx(
                  "p-xs rounded-lg transition-colors duration-150",
                  "text-on-surface-variant dark:text-[#8e90a2]",
                  "hover:bg-surface-container-high dark:hover:bg-[#282a36]"
                )}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-lg py-md max-h-[60vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={clsx(
              "px-lg py-md border-t border-outline-variant flex items-center justify-end gap-md",
              "bg-surface-container-low dark:bg-[#282a36]"
            )}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
