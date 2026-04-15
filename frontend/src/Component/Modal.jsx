function Modal({ isOpen, title, children, footer, error }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 animate-fade-slide-up">
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {title && (
          <h3 className="text-white font-bold text-lg mb-4">{title}</h3>
        )}
        <div>{children}</div>
        {error && (
          <p className="mt-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </p>
        )}
        {footer && <div className="flex gap-3 mt-4">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
