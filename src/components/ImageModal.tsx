import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full bg-black/40 rounded-2xl p-2 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-11 right-0 sm:right-2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          title="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-auto max-h-[82vh] w-full flex items-center justify-center rounded-xl">
          <img
            src={imageUrl}
            alt="Expanded question"
            className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};
