
import { GoogleGenAI, Type } from "@google/genai";

const IMAGE_MODEL = 'gemini-3.1-flash-image-preview';
const PRO_MODEL = 'gemini-3.1-pro-preview';
const MAX_DIMENSION = 1024;

const resizeImageIfNeeded = async (base64Str: string): Promise<string> => {
  try {
    const response = await fetch(base64Str);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          let width = img.width;
          let height = img.height;
          if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
            resolve(base64Str);
            return;
          }
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(base64Str);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (e) {
          console.error("Canvas resize error:", e);
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(base64Str);
      };
      img.src = objectUrl;
    });
  } catch (e) {
    console.error("Blob conversion error:", e);
    return base64Str;
  }
};

export const editImageWithGemini = async (
  base64Image: string,
  instruction: string,
  attempt: number = 1
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");
  
  const processedImage = await resizeImageIfNeeded(base64Image);
  const ai = new GoogleGenAI({ apiKey });
  
  const mimeType = processedImage.match(/^data:(image\/[a-zA-Z+]+);base64,/)?.[1] || 'image/jpeg';
  const cleanBase64 = processedImage.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  try {
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType } },
            { text: `System: You are a professional AI image editor. Edit the image precisely based on user instructions. Output the modified image data directly.\n\nUser Instruction: ${attempt > 2 ? instruction.split('.')[0] : instruction}${attempt > 1 ? ` (Variation ${attempt})` : ''}` },
          ],
        },
        config: {
          imageConfig: {
            imageSize: "1K"
          }
        }
      });
    
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;
    
    if (!parts || parts.length === 0) {
      const finishReason = candidate?.finishReason || 'UNKNOWN';
      // Retry on generic 'OTHER' or 'IMAGE_OTHER' errors which can be transient
      if ((finishReason.includes('OTHER') || finishReason === 'RECITATION' || !candidate) && attempt < 5) {
        console.warn(`Gemini Image Error (${finishReason}), retrying attempt ${attempt + 1}...`);
        // Wait with exponential backoff
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
        return editImageWithGemini(base64Image, instruction, attempt + 1);
      }
      throw new Error(`Generation failed: ${finishReason}`);
    }
    
    for (const part of parts) { 
      if (part.inlineData?.data) return part.inlineData.data; 
    }
    throw new Error("No image returned in response parts.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Exponential backoff retry for network or generic internal errors
    if (attempt < 4 && (error.message?.includes('OTHER') || error.message?.includes('xhr') || error.message?.includes('fetch'))) {
      await new Promise(r => setTimeout(r, 500 * attempt));
      return editImageWithGemini(base64Image, instruction, attempt + 1);
    }
    throw error;
  }
};

export const parseScriptToScenes = async (script: string): Promise<any[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: `Analyze this movie script and split it into a logical sequence of visual storyboard panels (max 8). 
    For each panel, provide:
    1. A short excerpt of the script it covers.
    2. A detailed visual prompt for an image generator (describe lighting, angle, composition, and mood).
    
    Script:
    ${script}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            scriptText: { type: Type.STRING },
            visualPrompt: { type: Type.STRING }
          },
          required: ["scriptText", "visualPrompt"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateStoryboardPanel = async (visualPrompt: string, attempt: number = 1): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: `Cinematic storyboard illustration, digital concept art, atmospheric lighting: ${attempt > 2 ? visualPrompt.split(',').slice(0, 3).join(',') : visualPrompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;
    
    if (!parts || parts.length === 0) {
      const finishReason = candidate?.finishReason || 'UNKNOWN';
      if ((finishReason.includes('OTHER') || finishReason === 'RECITATION' || !candidate) && attempt < 5) {
        console.warn(`Gemini Storyboard Error (${finishReason}), retrying attempt ${attempt + 1}...`);
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
        return generateStoryboardPanel(visualPrompt, attempt + 1);
      }
      throw new Error(`Panel generation failed: ${finishReason}`);
    }

    for (const part of parts) {
      if (part.inlineData?.data) return part.inlineData.data;
    }
    throw new Error("No panel data found");
  } catch (error: any) {
    if (attempt < 5 && (error.message?.includes('OTHER') || error.message?.includes('xhr') || error.message?.includes('fetch'))) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      return generateStoryboardPanel(visualPrompt, attempt + 1);
    }
    throw error;
  }
};

export const generateTextSuggestions = async (base64Image: string, prompt: string): Promise<string[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");
  
  const ai = new GoogleGenAI({ apiKey });
  const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
  const mimeType = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/)?.[1] || 'image/jpeg';

  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: {
      parts: [
        { inlineData: { data: cleanBase64, mimeType: mimeType } },
        { text: `Based on this image, generate 5 creative and catchy text suggestions (captions, slogans, or titles) for the following request: "${prompt}". 
        If the request is empty, suggest general creative captions for the image.
        Return only a JSON array of strings.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateLogo = async (
  prompt: string, 
  style: string, 
  colorPalette: string = "", 
  typography: string = "", 
  logoType: string = "Combination Mark",
  attempt: number = 1
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const fullPrompt = `Professional logo design, ${style}, ${logoType}. 
    Brand Colors: ${colorPalette}. 
    Typography Style: ${typography}. 
    Subject: ${prompt}. 
    High quality, vector style, clean lines, minimalist aesthetic, professional branding, centered on a solid neutral background. No realistic photos, no complex backgrounds.`;
    
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: `Professional logo design, ${style}, ${logoType}. Subject: ${attempt > 2 ? prompt.split(' ').slice(0, 5).join(' ') : prompt}. Clean lines, minimalist aesthetic.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;
    
    if (!parts || parts.length === 0) {
      const finishReason = candidate?.finishReason || 'UNKNOWN';
      if ((finishReason.includes('OTHER') || finishReason === 'RECITATION' || !candidate) && attempt < 5) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
        return generateLogo(prompt, style, colorPalette, typography, logoType, attempt + 1);
      }
      throw new Error(`Logo generation failed: ${finishReason}`);
    }

    let textResponse = "";
    for (const part of parts) {
      if (part.inlineData?.data) return part.inlineData.data;
      if (part.text) textResponse += part.text;
    }
    
    if (textResponse && attempt < 3) {
       console.warn("Model returned text instead of image, retrying...", textResponse);
       return generateLogo(prompt, style, colorPalette, typography, logoType, attempt + 1);
    }

    throw new Error(textResponse || "No logo data found");
  } catch (error: any) {
    if (attempt < 5 && (error.message?.includes('OTHER') || error.message?.includes('xhr') || error.message?.includes('fetch'))) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      return generateLogo(prompt, style, colorPalette, typography, logoType, attempt + 1);
    }
    throw error;
  }
};
