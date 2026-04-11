import { useState } from 'react';

const MAX_WIDTH = 800;
const QUALITY = 0.75;

const compressImage = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.src = url;
  });

function MediaInput({ media, mediaType, onChange }) {
  const [mode, setMode] = useState(() =>
    media && !media.startsWith('data:') ? 'url' : 'upload'
  );
  const [urlInput, setUrlInput] = useState(() =>
    media && !media.startsWith('data:') ? media : ''
  );
  const [urlType, setUrlType] = useState(mediaType || 'image');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith('video/')) {
      onChange(null, null);
      return;
    }
    const compressed = await compressImage(file);
    onChange(compressed, 'image');
  };

  const handleUrlLoad = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim(), urlType);
  };

  const handleClear = () => {
    onChange(null, null);
    setUrlInput('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-300 text-sm font-medium">Media (optional)</p>
        <div className="flex gap-1">
          {['upload', 'url'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium border transition ${
                mode === m
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              {m === 'upload' ? 'Upload' : 'URL'}
            </button>
          ))}
        </div>
      </div>

      {media ? (
        <div className="relative rounded-xl overflow-hidden bg-black/20 border border-white/10">
          {mediaType === 'image' ? (
            <img src={media} alt="" className="w-full max-h-48 object-contain" />
          ) : (
            <video src={media} controls className="w-full max-h-48" />
          )}
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white hover:bg-red-500/80 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : mode === 'upload' ? (
        <div className="space-y-1">
          <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border border-dashed border-white/20 text-slate-500 hover:text-slate-300 hover:border-white/40 cursor-pointer transition">
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Click to upload image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <p className="text-slate-600 text-xs text-center">Video? Switch to URL tab</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            {['image', 'video'].map(t => (
              <button
                key={t}
                onClick={() => setUrlType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  urlType === t
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {t === 'image' ? 'Image' : 'Video'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUrlLoad()}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
            <button
              onClick={handleUrlLoad}
              className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition"
            >
              Load
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaInput;
