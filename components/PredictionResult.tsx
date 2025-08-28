import React from 'react';
import type { AnalysisRecord } from '../types';
import { ShieldIcon } from './icons/ShieldIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { BugIcon } from './icons/BugIcon';
import { NutrientIcon } from './icons/NutrientIcon';

interface PredictionResultProps {
  prediction: AnalysisRecord;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ prediction }) => {
  const { 
    plantName, 
    isHealthy, 
    diseaseName, 
    description, 
    treatmentSuggestions, 
    benefits, 
    confidenceScore, 
    preventativeCareTips,
    progressAssessment,
    comparativeAnalysis,
    pestIdentification,
    nutrientDeficiencies,
  } = prediction;

  const cardBaseClasses = "w-full flex flex-col gap-6 p-6 rounded-xl shadow-lg transition-all duration-500";
  const healthyClasses = "bg-emerald-900/50 border border-emerald-500";
  const diseasedClasses = "bg-amber-900/50 border border-amber-500";

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      let summary = `Analysis for ${plantName}. `;
      summary += `Confidence score is ${confidenceScore} percent. `;
      
      if (isHealthy) {
        summary += `The plant is healthy. `;
      } else {
        summary += `The plant is not healthy. `;
        if (diseaseName && diseaseName !== 'N/A') {
          summary += `Disease detected: ${diseaseName}. `;
        }
        if (pestIdentification && pestIdentification.length > 0) {
            summary += `Pests detected: ${pestIdentification.map(p => p.name).join(', ')}. `;
        }
        if (nutrientDeficiencies && nutrientDeficiencies.length > 0) {
            summary += `Nutrient deficiencies detected: ${nutrientDeficiencies.map(n => n.name).join(', ')}. `;
        }
      }
      summary += `Main finding: ${description}`;

      const utterance = new SpeechSynthesisUtterance(summary);
      speechSynthesis.cancel(); // Cancel any previous speech
      speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  const renderRemedyList = (items: string[], type: 'treatment' | 'prevention' | 'benefit' | 'remedy') => (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={`${type}-${index}`} className="flex items-start gap-3">
          <div className="flex-shrink-0 text-emerald-400 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-slate-300 text-sm">{item}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`${cardBaseClasses} ${isHealthy ? healthyClasses : diseasedClasses} animate-fade-in`}>
      <div className="flex justify-between items-start">
        <div className="flex-grow">
           <p className="font-semibold text-base text-slate-300">
              Plant Identified: <span className="text-white font-bold">{plantName}</span>
           </p>
          <h2 className="font-bold text-2xl sm:text-3xl text-white">
            {isHealthy ? 'Plant is Healthy' : diseaseName !== 'N/A' ? diseaseName : 'Issues Detected'}
          </h2>
        </div>
        <button onClick={handleReadAloud} title="Read Aloud" className="p-2 bg-slate-700/50 rounded-full hover:bg-emerald-600 transition-colors">
            <SpeakerIcon className="w-5 h-5 text-white"/>
        </button>
      </div>

       <div className="flex justify-between items-center gap-2 mb-1 text-sm">
         <p className={`font-display uppercase tracking-widest ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isHealthy ? 'Health Status: Good' : 'Health Status: Issues Detected'}
         </p>
         <div className="bg-slate-700/50 px-2 py-1 rounded-full text-xs font-medium text-slate-200">
             Confidence: <span className="font-bold text-white">{confidenceScore}%</span>
         </div>
       </div>
      
      {progressAssessment && progressAssessment !== 'N/A' && (
        <div>
          <h3 className="font-bold text-lg mb-3 text-slate-200 flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-emerald-400" />
            Progress Update
          </h3>
          <div className="bg-slate-800/50 p-4 rounded-lg">
             <p className="font-semibold text-center text-lg mb-2">
                Status: <span className={
                    progressAssessment === 'Improved' ? 'text-emerald-400' :
                    progressAssessment === 'Worsened' ? 'text-red-400' : 'text-slate-300'
                }>{progressAssessment}</span>
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{comparativeAnalysis}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-lg mb-2 text-slate-200">Analysis Details</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
      </div>

      {!isHealthy && diseaseName !== 'N/A' && treatmentSuggestions && treatmentSuggestions.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 text-slate-200">Disease Remedies &amp; Solutions</h3>
          {renderRemedyList(treatmentSuggestions, 'treatment')}
        </div>
      )}

      {!isHealthy && pestIdentification && pestIdentification.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 text-slate-200 flex items-center gap-2">
            <BugIcon className="w-5 h-5 text-amber-400" />
            Pest Control
          </h3>
          {pestIdentification.map((pest, index) => (
            <div key={`pest-${index}`} className="mb-4 bg-slate-800/50 p-4 rounded-lg">
                <p className="font-bold text-amber-300">{pest.name}</p>
                <p className="text-sm text-slate-300 mb-2 italic">{pest.description}</p>
                {renderRemedyList(pest.remedy, 'remedy')}
            </div>
          ))}
        </div>
      )}

      {!isHealthy && nutrientDeficiencies && nutrientDeficiencies.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 text-slate-200 flex items-center gap-2">
            <NutrientIcon className="w-5 h-5 text-sky-400" />
            Nutrient Correction
          </h3>
          {nutrientDeficiencies.map((nutrient, index) => (
            <div key={`nutrient-${index}`} className="mb-4 bg-slate-800/50 p-4 rounded-lg">
                <p className="font-bold text-sky-300">{nutrient.name} Deficiency</p>
                <p className="text-sm text-slate-300 mb-2 italic">{nutrient.description}</p>
                {renderRemedyList(nutrient.remedy, 'remedy')}
            </div>
          ))}
        </div>
      )}


      {preventativeCareTips && preventativeCareTips.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 text-slate-200 flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-emerald-400" />
            Preventative Care
          </h3>
          {renderRemedyList(preventativeCareTips, 'prevention')}
        </div>
      )}
      
      {benefits && benefits.length > 0 && (
         <div>
          <h3 className="font-bold text-lg mb-3 text-slate-200">Benefits &amp; Uses of {plantName}</h3>
          {renderRemedyList(benefits, 'benefit')}
        </div>
      )}
    </div>
  );
};