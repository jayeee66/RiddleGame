function Modal({ isOpen, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 animate-fade-slide-up">
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {title && (
          <h3 className="text-white font-bold text-lg mb-4">{title}</h3>
        )}
        <div>{children}</div>
        {footer && <div className="flex gap-3 mt-4">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
