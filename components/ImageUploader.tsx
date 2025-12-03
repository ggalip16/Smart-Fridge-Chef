import React, { useCallback, useState } from 'react';
import { Upload, Camera, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix if present for Gemini API usually, 
        // but the SDK handles base64 extraction often better if we strip the header manually or pass just the data.
        // The service logic expects clean base64 data usually, but the example used `inlineData` which takes pure base64.
        // `reader.result` is `data:image/jpeg;base64,....`. We need to strip the prefix.
        const base64Data = base64.split(',')[1];
        onImageSelected(base64Data);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-80 border-3 border-dashed rounded-3xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-emerald-400'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          accept="image/*"
          onChange={handleChange}
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 z-20">
            <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
            <p className="text-lg font-medium text-emerald-700 animate-pulse">Analyzing your fridge...</p>
            <p className="text-sm text-slate-500">Identifying ingredients & dreaming up recipes</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center p-6 z-0">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <Camera className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Snap Your Fridge</h3>
            <p className="text-slate-500 max-w-xs">
              Drag & drop a photo here, or click to open camera
            </p>
            <div className="flex gap-3 mt-4">
               <button className="px-4 py-2 bg-white border border-slate-300 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                 Choose File
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
