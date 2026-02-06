interface ConfirmDialogProps {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  title = '确认操作',
  message,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-bg-card rounded-card p-6 max-w-md w-full border border-border-light shadow-card-hover animate-scale-in">
        <h3 className="text-lg font-medium text-text-primary mb-3">{title}</h3>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-bg-primary hover:bg-bg-elevated text-text-secondary text-sm rounded-btn transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-error/15 hover:bg-error/25 text-error text-sm rounded-btn transition-all duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
