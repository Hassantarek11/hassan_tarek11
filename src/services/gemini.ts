import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAIResponse(prompt: string) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `أنت مساعد ذكي، لبق، ومفيد. 
  تجيب على أسئلة المستخدم بوضوح ودقة. 
  إذا سألك المستخدم عن أمور دينية (إسلامية أو مسيحية)، قدم له إجابات موثقة ومحترمة تدعو للتسامح والمحبة.
  استخدم لغة عربية فصحى وجميلة.
  ركز على تقديم الفائدة والمعرفة في كافة المجالات.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "عذراً، لم أتمكن من العثور على إجابة حالياً.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.";
  }
}
