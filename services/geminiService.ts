
import { GoogleGenAI } from "@google/genai";

export const generateBirthdayWish = async (name: string): Promise<string> => {
  // Always create a new instance right before the call to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `你是一个温暖、充满童心且极其用心的生日祝愿官，深受三丽鸥（Sanrio）风格的影响。
  请为名叫“${name}”的你写一段简短、治愈且富有诗意的生日祝福。
  要求：
  1. 语气亲切、梦幻，带一点点魔法感。
  2. 包含一些可爱的意象（如云朵、星星、甜点、蝴蝶结）。
  3. 字数在 60 字以内，使用中文。
  4. 能够体现送礼人的极度用心和对 TA 的珍惜。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.9,
        topP: 0.95,
      },
    });

    const text = response.text;
    if (text) return text.trim();
    throw new Error("Empty response");
  } catch (error: any) {
    // Gracefully handle Quota Exceeded (429) errors without polluting the console with red errors
    if (error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      console.warn("✨ Magic Quota Limit Reached: Switching to offline spellbook (Fallback Mode).");
    } else {
      console.error("Gemini Error:", error);
    }
    
    // Return a high-quality fallback wish in case of API or network issues
    const fallbacks = [
      `致亲爱的 ${name}：愿你的生日被星星温柔包裹，世界为你准备了最甜的软糖，所有的快乐都如约而至。愿你在新的一岁，依然是被魔法宠爱的小可爱。✨`,
      `给最特别的 ${name}：愿你像云朵一样自由，像草莓一样甜美。在这个属于你的日子里，整个世界的温柔都想分你一半。生日快乐，你是最值得被珍惜的存在。🎀`,
      `亲爱的 ${name}：希望你的生活里总有蝴蝶结般的精致，也有奶油蛋糕般的甜蜜。愿魔法永远守护你的纯真，愿你每天都被幸福紧紧拥抱。生日快乐！🍭`,
      `To ${name}：今天星星为你亮起，风儿为你唱歌。愿你眼里的光永远清澈，愿你的世界永远只有童话般的快乐。生日快乐，我的宝藏！💖`,
      `致独一无二的 ${name}：愿你的每一个愿望都像种下的种子，在未来的日子里开出最美的花。请继续发光，继续可爱，继续做我们最爱的小天使。🎂`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};
