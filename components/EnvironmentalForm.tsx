import React, { useState, useCallback } from 'react';
import type { EnvironmentalData } from '../types';
import { LocationIcon } from './icons/LocationIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

// Extend the Window interface for vendor-prefixed Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface EnvironmentalFormProps {
  data: EnvironmentalData;
  setData: React.Dispatch<React.SetStateAction<EnvironmentalData>>;
}

export const EnvironmentalForm: React.FC<EnvironmentalFormProps> = ({ data, setData }) => {
  const [isListening, setIsListening] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setData(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
          setLocationStatus('success');
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationStatus('error');
          alert("Could not get location. Please ensure you have granted permission.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLocationStatus('error');
    }
  };

  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setData(prev => ({ ...prev, notes: prev.notes ? `${prev.notes} ${transcript}` : transcript }));
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }, [isListening, setData]);


  return (
    <div className="w-full bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">Environmental Context (Optional)</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="sunlight" className="block text-sm font-medium text-slate-300 mb-1">Sunlight Exposure</label>
          <select
            name="sunlight"
            id="sunlight"
            value={data.sunlight}
            onChange={handleSimpleChange}
            className="w-full bg-slate-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Select...</option>
            <option value="direct-sun">Direct Sun</option>
            <option value="partial-shade">Partial Shade</option>
            <option value="full-shade">Full Shade</option>
            <option value="indoors-bright">Indoors (Bright Light)</option>
            <option value="indoors-low">Indoors (Low Light)</option>
          </select>
        </div>
        <div>
          <label htmlFor="watering" className="block text-sm font-medium text-slate-300 mb-1">Watering Frequency</label>
           <select
            name="watering"
            id="watering"
            value={data.watering}
            onChange={handleSimpleChange}
            className="w-full bg-slate-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Select...</option>
            <option value="daily">Daily</option>
            <option value="few-times-week">A few times a week</option>
            <option value="weekly">Once a week</option>
            <option value="bi-weekly">Every two weeks</option>
            <option value="when-dry">When soil is dry</option>
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">Additional Notes</label>
          <div className="relative">
             <textarea
              name="notes"
              id="notes"
              rows={3}
              value={data.notes}
              onChange={handleSimpleChange}
              placeholder="e.g., high humidity, recently repotted, signs of pests..."
              className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-10"
            />
            <button onClick={handleVoiceInput} className={`absolute right-2 top-2 p-1 rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600 hover:bg-slate-500'}`} title={isListening ? 'Stop Listening' : 'Dictate Notes'}>
              <MicrophoneIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
             <button onClick={handleLocation} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                <LocationIcon className={`w-4 h-4 ${locationStatus === 'success' ? 'text-emerald-400' : ''}`} />
                {locationStatus === 'loading' && 'Getting...'}
                {locationStatus === 'success' && 'Location Added!'}
                {(locationStatus === 'idle' || locationStatus === 'error') && 'Use My Location'}
            </button>
             <div className="flex items-center gap-2">
                 <input
                    type="checkbox"
                    id="organicPreference"
                    name="organicPreference"
                    checked={data.organicPreference}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-emerald-600 focus:ring-emerald-500"
                />
                 <label htmlFor="organicPreference" className="text-sm font-medium text-slate-300">Prefer organic remedies</label>
            </div>
        </div>
      </div>
    </div>
  );
};