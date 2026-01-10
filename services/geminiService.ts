
import { GoogleGenAI } from "@google/genai";

export const getCircuitExplanation = async (
  vIn: number, 
  targetVOut: number, 
  r1: string, 
  r2: string, 
  actualVOut: number
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    I am building a voltage divider circuit.
    Input Voltage: ${vIn}V
    Desired Output: ${targetVOut}V
    Actual Output with standard resistors: ${actualVOut.toFixed(2)}V
    R1 (Top Resistor): ${r1}
    R2 (Bottom Resistor): ${r2}

    Please explain to a hobbyist:
    1. What this circuit does in simple terms.
    2. Why these specific resistor values were chosen (briefly mention E24 series).
    3. Any safety warnings (power dissipation, heat, or input impedance for microcontrollers).
    4. Keep the tone friendly, encouraging, and "free-spirited".
    Use markdown for formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "I couldn't generate an explanation right now, but your circuit looks great!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI assistant is taking a break. Your math is still solid though!";
  }
};
