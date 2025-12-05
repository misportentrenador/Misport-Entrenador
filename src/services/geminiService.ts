
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.warn("Gemini API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFitnessTip = async (trainingName: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Recuerda hidratarte bien antes de tu sesión.";

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Proporciona un consejo corto, motivador y útil (máximo 20 palabras) para alguien que se está preparando para una sesión de entrenamiento de tipo: "${trainingName}".`,
    });
    return response.text || "¡Prepárate para darlo todo!";
  } catch (error) {
    console.error("Error generating tip:", error);
    return "El ejercicio es salud. ¡Disfruta tu sesión!";
  }
};