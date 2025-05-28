
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Non-null assertion, assuming it's set or handled by UI

export const generateHashtagsFromApi = async (topic: string): Promise<string[]> => {
  if (!API_KEY) {
    throw new Error("API Key is not configured. Cannot generate hashtags.");
  }
  
  const model = 'gemini-2.5-flash-preview-04-17';
  const prompt = `
You are an expert social media marketing strategist specializing in hashtag generation.
For the topic: "${topic}", generate a list of exactly 15 to 20 highly professional, relevant, and high-ranking hashtags.
These hashtags should be suitable for platforms like Instagram, LinkedIn, and X (formerly Twitter).
Ensure each hashtag starts with '#' and the list is diverse, covering different facets and related keywords of the topic.
Prioritize hashtags that can increase visibility and engagement.

Return the result ONLY as a JSON array of strings.
Example for "sustainable energy": ["#SustainableEnergy", "#RenewablePower", "#GreenTech", "#EcoFriendlyLiving", "#SolarEnergyNow", "#WindPowerFuture", "#CleanEnergyRevolution", "#ClimateAction", "#GoGreen", "#EnergyTransition", "#EnvironmentallyFriendly", "#FutureOfEnergy", "#EcoInnovation", "#SustainabilityGoals", "#SaveThePlanet"]
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, // A bit of creativity but still focused
      },
    });

    let jsonStr = response.text.trim();
    
    // Remove markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string' && item.startsWith('#'))) {
      return parsedData;
    } else {
      console.error("Unexpected JSON format from API:", parsedData);
      throw new Error("Received an unexpected format from the AI. Please try a different topic or wording.");
    }
  } catch (error) {
    console.error("Error generating hashtags:", error);
    if (error instanceof Error && error.message.includes("API Key not valid")) {
        throw new Error("Invalid API Key. Please check your API_KEY environment variable.");
    }
    // Check for specific Gemini API errors if possible, or provide a general message
    // e.g. if (error.status === 429) { throw new Error("API rate limit exceeded.") }
    throw new Error("Failed to generate hashtags. The AI service might be temporarily unavailable or the request could not be processed.");
  }
};
    