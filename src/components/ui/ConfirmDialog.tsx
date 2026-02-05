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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-bg-card rounded-card p-6 max-w-md w-full border border-border">
        <h3 className="text-lg font-medium text-text-primary mb-3">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-bg-primary hover:bg-border text-text-secondary text-sm rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-error hover:bg-error/90 text-white text-sm rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
