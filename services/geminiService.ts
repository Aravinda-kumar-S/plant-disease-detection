import { GoogleGenAI, Type } from "@google/genai";
import type { PredictionData, AnalysisRecord, EnvironmentalData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const pestSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Common name of the pest. 'N/A' if none." },
        description: { type: Type.STRING, description: "Description of the pest and the damage it causes." },
        remedy: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Steps to treat the pest infestation." }
    },
    required: ["name", "description", "remedy"]
};

const nutrientSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Name of the deficient nutrient (e.g., 'Nitrogen'). 'N/A' if none." },
        description: { type: Type.STRING, description: "Description of the symptoms of the deficiency." },
        remedy: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Steps to correct the nutrient deficiency." }
    },
    required: ["name", "description", "remedy"]
};


const modelConfig = {
    model: "gemini-2.5-flash",
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                plantName: { type: Type.STRING, description: "The common name of the plant." },
                isHealthy: { type: Type.BOOLEAN, description: "Is the plant healthy overall? (Considering diseases, pests, and deficiencies)." },
                diseaseName: { type: Type.STRING, description: "Disease name or 'N/A' if no disease." },
                description: { type: Type.STRING, description: "Detailed description of overall health, disease, pests, or deficiencies." },
                treatmentSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of treatments for the disease. Empty if healthy." },
                benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of plant benefits or medicinal uses." },
                confidenceScore: { type: Type.INTEGER, description: "Confidence score (0-100) of the overall analysis." },
                preventativeCareTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tips for preventative care." },
                progressAssessment: {
                    type: Type.STRING,
                    enum: ['Improved', 'Worsened', 'Unchanged', 'N/A'],
                    description: "Assessment of progress compared to previous analysis. 'N/A' for first analysis."
                },
                comparativeAnalysis: {
                    type: Type.STRING,
                    description: "A detailed text comparing the current state to the previous one, explaining the changes. 'N/A' for first analysis."
                },
                pestIdentification: { type: Type.ARRAY, items: pestSchema, description: "List of identified pests. Empty if none." },
                nutrientDeficiencies: { type: Type.ARRAY, items: nutrientSchema, description: "List of identified nutrient deficiencies. Empty if none." }
            },
            required: ["plantName", "isHealthy", "diseaseName", "description", "treatmentSuggestions", "benefits", "confidenceScore", "preventativeCareTips", "progressAssessment", "comparativeAnalysis", "pestIdentification", "nutrientDeficiencies"],
        },
    }
};

const buildPrompt = (environmentalData?: EnvironmentalData, previousAnalysis?: AnalysisRecord): string => {
    let prompt = `
        You are an expert botanist and plant pathologist. Your analysis must be comprehensive. Analyze the provided image of a plant.
        - First, identify the plant's common name.
        - Then, conduct a full diagnostic: check for diseases, pest infestations, and nutrient deficiencies.
        - Your final 'isHealthy' status should be true ONLY if there are no diseases, no pests, and no nutrient deficiencies.
        - For each issue found (disease, pest, or deficiency), provide its name, a description, and specific remedy suggestions.
        - If the plant is completely healthy, confirm this and describe characteristics of a healthy specimen.
        - Provide common benefits/medicinal uses, a confidence score (0-100), and general preventative care tips for this plant species.
    `;

    if (environmentalData) {
         prompt += `\n\nConsider the following environmental context provided by the user:`;
        if (environmentalData.location) {
            prompt += `
            - User's Location: Latitude ${environmentalData.location.latitude}, Longitude ${environmentalData.location.longitude}.
            - Use this location to infer local weather patterns, common regional pests/diseases, and soil type. Factor this heavily into your diagnosis and recommendations. Mention how the location impacts your analysis.
            `
        }
        prompt += `
        - Sunlight Exposure: ${environmentalData.sunlight || 'Not provided'}
        - Watering Frequency: ${environmentalData.watering || 'Not provided'}
        - Additional Notes: ${environmentalData.notes || 'None'}
        Incorporate how these factors might be affecting the plant's health in your analysis.`;
        if (environmentalData.organicPreference) {
            prompt += `\n- The user has requested organic and sustainable remedies. Prioritize these solutions.`
        }
    }

    if (previousAnalysis) {
        prompt += `\n\nThis is a follow-up analysis. The previous analysis on ${new Date(previousAnalysis.date).toLocaleDateString()} concluded:
        - Health Status: ${previousAnalysis.isHealthy ? 'Healthy' : `Issues detected (${previousAnalysis.diseaseName}, Pests: ${previousAnalysis.pestIdentification.map(p=>p.name).join(', ')}, Deficiencies: ${previousAnalysis.nutrientDeficiencies.map(n=>n.name).join(', ')})`}
        - Key finding from description: "${previousAnalysis.description.substring(0, 150)}..."

        Based on the new image, please perform a comparative analysis.
        - Determine if the plant's condition has 'Improved', 'Worsened', or 'Unchanged'.
        - Provide a 'comparativeAnalysis' text explaining the specific changes you observe.
        - If this is the first analysis, set progressAssessment and comparativeAnalysis to 'N/A'.`;
    } else {
        prompt += `\n\nThis is the first analysis for this plant. Set 'progressAssessment' and 'comparativeAnalysis' to 'N/A'. Also ensure 'pestIdentification' and 'nutrientDeficiencies' are empty arrays if none are found.`;
    }

    prompt += "\n\nProvide your complete response in the requested JSON format.";
    return prompt;
};

export async function* analyzePlantImage(
    imageFile: File, 
    environmentalData?: EnvironmentalData, 
    previousAnalysis?: AnalysisRecord
): AsyncGenerator<string, void, unknown> {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = buildPrompt(environmentalData, previousAnalysis);

    try {
        const response = await ai.models.generateContentStream({
            ...modelConfig,
            contents: { parts: [imagePart, { text: prompt }] },
        });

        for await (const chunk of response) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        if (error instanceof Error && error.message.includes("400 Bad Request")) {
            throw new Error("The uploaded image could not be processed. It may be invalid or corrupted. Please try a different image.");
        }
        throw new Error("Failed to get analysis from AI. The service may be temporarily unavailable.");
    }
};