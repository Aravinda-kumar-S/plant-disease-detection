import React, { useState, useCallback, useRef } from 'react';
import type { PlantProfile } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';
import { CameraCaptureIcon } from './icons/CameraCaptureIcon';

interface PlantProfilerProps {
  plantProfiles: PlantProfile[];
  onAddPlant: (name: string) => void;
  onStartAnalysis: (plant: PlantProfile) => void;
  onQuickAnalysis: (file: File) => void;
}

export const PlantProfiler: React.FC<PlantProfilerProps> = ({ plantProfiles, onAddPlant, onStartAnalysis, onQuickAnalysis }) => {
  const [newPlantName, setNewPlantName] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<PlantProfile | null>(plantProfiles.length > 0 ? plantProfiles[0] : null);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null | undefined) => {
    if (file && file.type.startsWith('image/')) {
      onQuickAnalysis(file);
    }
  }, [onQuickAnalysis]);

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
  
  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;
    onAddPlant(newPlantName);
    setNewPlantName('');
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-start animate-fade-in">
      {/* Left column for plant list */}
      <div className="md:col-span-1 bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-full">
        <h2 className="text-xl font-bold text-white mb-4">My Plants</h2>
        <form onSubmit={handleAddPlant} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlantName}
            onChange={(e) => setNewPlantName(e.target.value)}
            placeholder="New plant name..."
            className="flex-grow bg-slate-700 text-white placeholder-slate-400 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            aria-label="New plant name"
          />
          <button type="submit" disabled={!newPlantName.trim()} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors" aria-label="Add new plant">
            <PlusIcon className="w-5 h-5" />
          </button>
        </form>
        <div className="space-y-2">
          {plantProfiles.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">Add your first plant to get started.</p>
          )}
          {plantProfiles.map(plant => (
            <button
              key={plant.id}
              onClick={() => setSelectedPlant(plant)}
              className={`w-full text-left p-3 rounded-md transition-colors text-white ${selectedPlant?.id === plant.id ? 'bg-emerald-600/50' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              {plant.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right column for selected plant details and history */}
      <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 min-h-[500px] flex flex-col justify-center">
        {selectedPlant ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedPlant.name}</h3>
              <button onClick={() => onStartAnalysis(selectedPlant)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                New Analysis
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-400 mb-4">
               <HistoryIcon className="w-5 h-5" />
               <h4 className="font-semibold text-lg text-slate-300">Analysis History</h4>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {selectedPlant.analysisHistory.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No analysis history. Start a new analysis to see results here.</p>
              ) : (
                [...selectedPlant.analysisHistory].reverse().map(record => (
                  <div key={record.id} className="bg-slate-700/50 p-4 rounded-lg flex items-center gap-4">
                    <img src={record.imageUrl} alt="Analyzed leaf" className="w-16 h-16 object-cover rounded-md border-2 border-slate-600" />
                    <div className="flex-grow">
                      <p className="font-bold text-white">{record.isHealthy ? 'Healthy' : record.diseaseName}</p>
                      <p className="text-sm text-slate-400">{new Date(record.date).toLocaleString()}</p>
                    </div>
                     <span className={`px-3 py-1 text-xs font-medium rounded-full ${record.isHealthy ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'}`}>
                        {record.isHealthy ? 'Healthy' : 'Diseased'}
                     </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl transition-all duration-300 w-full min-h-[400px]
                ${isDragging ? 'border-emerald-400 bg-slate-700' : 'border-slate-600 hover:bg-slate-800/60'}
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleInputChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
                <CameraIcon className="w-16 h-16 text-slate-400" />
                <h2 className="text-2xl font-bold text-white">
                  Quick Analysis
                </h2>
                <p className="text-slate-400">Drop an image here to get started.</p>
              </div>
               <div className="mt-6 flex justify-center flex-wrap gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <UploadIcon className="w-5 h-5"/>
                  <span>Browse File</span>
                </button>
                <button 
                  onClick={() => cameraInputRef.current?.click()} 
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <CameraCaptureIcon className="w-5 h-5"/>
                  <span>Take Photo</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-4 absolute bottom-4">A new plant profile will be created automatically.</p>
            </div>
        )}
      </div>
    </div>
  );
};