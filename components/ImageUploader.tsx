import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CameraCaptureIcon } from './icons/CameraCaptureIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null | undefined) => {
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-300
        ${isDragging ? 'border-emerald-400 bg-slate-700' : 'border-slate-600'}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        className="hidden"
        disabled={isLoading}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleInputChange}
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={isLoading}
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <UploadIcon className="w-12 h-12 text-slate-400" />
        <h2 className="text-xl font-semibold text-white">
          Add an Image
        </h2>
        <p className="text-slate-400">Drop an image here, or use an option below.</p>
        <p className="text-xs text-slate-500 mt-1">Supports: JPG, PNG, WEBP</p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <UploadIcon className="w-5 h-5" />
          Browse Files
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <CameraCaptureIcon className="w-5 h-5" />
          Take Photo
        </button>
      </div>
    </div>
  );
};