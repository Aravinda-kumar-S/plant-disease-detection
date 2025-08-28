import { useState, useEffect, useCallback } from 'react';
import type { PlantProfile, AnalysisRecord } from '../types';

const STORAGE_KEY = 'plant-disease-app-profiles';

export const usePlantStore = () => {
  const [plantProfiles, setPlantProfiles] = useState<PlantProfile[]>([]);

  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEY);
      if (storedProfiles) {
        setPlantProfiles(JSON.parse(storedProfiles));
      }
    } catch (error) {
      console.error("Failed to load or parse plant profiles from localStorage", error);
      setPlantProfiles([]);
    }
  }, []);

  const saveProfiles = useCallback((profiles: PlantProfile[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      setPlantProfiles(profiles);
    } catch (error) {
      console.error("Failed to save plant profiles to localStorage", error);
    }
  }, []);

  const addPlant = useCallback((name: string): PlantProfile => {
    if (!name.trim()) throw new Error("Plant name cannot be empty.");
    const newPlant: PlantProfile = {
      id: new Date().toISOString() + Math.random(),
      name: name.trim(),
      analysisHistory: [],
    };
    const updatedProfiles = [...plantProfiles, newPlant];
    saveProfiles(updatedProfiles);
    return newPlant;
  }, [plantProfiles, saveProfiles]);

  const addAnalysisToPlant = useCallback((plantId: string, analysis: AnalysisRecord) => {
    const updatedProfiles = plantProfiles.map(plant => {
      if (plant.id === plantId) {
        return {
          ...plant,
          analysisHistory: [...plant.analysisHistory, analysis],
        };
      }
      return plant;
    });
    saveProfiles(updatedProfiles);
  }, [plantProfiles, saveProfiles]);

  return { plantProfiles, addPlant, addAnalysisToPlant };
};
