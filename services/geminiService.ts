import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// This approach ensures the API key works in both Vite's environment (for deployment)
// and the preview environment (which uses process.env).
const apiKey = (import.meta.env && import.meta.env.VITE_API_KEY) || process.env.API_KEY;


if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Please ensure it's available as VITE_API_KEY for Vite/deploy or API_KEY for other environments.");
}

const ai = new GoogleGenAI({ apiKey });

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

const cleanJsonString = (text: string): string => {
    let jsonStr = text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    return jsonStr;
};

export const generateText = async (prompt: string, expectJson: boolean = false): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: expectJson ? { responseMimeType: "application/json" } : {},
        });
        const text = response.text;
        return expectJson ? cleanJsonString(text) : text;
    } catch (error) {
        console.error("Error generating text:", error);
        throw new Error("Failed to generate text from API.");
    }
};


export const analyzeImageAndCreatePrompt = async (imageFile: File, prompt: string): Promise<string> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: prompt };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: { parts: [imagePart, textPart] },
        });
        
        return response.text;

    } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error("Failed to analyze image with API.");
    }
};

export const generateImage = async (prompt: string, numberOfImages: number = 1): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: { numberOfImages: numberOfImages, outputMimeType: 'image/jpeg' },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        }
        throw new Error("No image was generated.");

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image with API.");
    }
};