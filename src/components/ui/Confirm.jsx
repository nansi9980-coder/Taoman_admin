import clsx from "clsx";
import Modal from "./Modal";

export default function Confirm({
  isOpen,
  onClose,
  title = "Confirmation",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  variant = "primary", // primary, danger, warning
  isLoading = false,
}) {
  const variantClasses = {
    primary: "bg-primary hover:bg-primary-container text-white dark:bg-[#b2c5ff] dark:text-primary dark:hover:bg-[#c4d2ff]",
    danger: "bg-error hover:bg-error-container text-white dark:bg-[#ba1a1a] dark:text-white",
    warning: "bg-tertiary hover:bg-tertiary-container text-white dark:bg-[#ffb59b] dark:text-tertiary",
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnBackdrop={false}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={clsx(
              "px-lg py-sm rounded-lg font-label-md text-label-md transition-colors duration-150",
              "bg-surface-container-low dark:bg-[#282a36] text-on-surface dark:text-[#e4e4ef]",
              "hover:bg-surface-container-high dark:hover:bg-[#3a3d4a]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={clsx(
              "px-lg py-sm rounded-lg font-label-md text-label-md transition-colors duration-150",
              variantClasses[variant],
              "disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-sm"
            )}
          >
            {isLoading && (
              <span className="material-symbols-outlined text-[16px] animate-spin">
                autorenew
              </span>
            )}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-body-md text-on-surface dark:text-[#e4e4ef]">
        {message}
      </p>
    </Modal>
  );
}