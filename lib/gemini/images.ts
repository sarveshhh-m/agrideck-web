import { geminiClient, isConfigured } from "./client";

export interface ImageGenerationOptions {
  commodityName: string;
}

interface ApiError {
  error?: {
    code?: number;
    status?: string;
  };
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "error" in error;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateImageWithRetry(
  prompt: string,
  retries: number = 3,
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[Gemini Image] Attempt ${attempt + 1}/${retries}...`);
      console.log(`[Gemini Image] Prompt: ${prompt}`);

      const response = await geminiClient!.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      });

      console.log(`[Gemini Image] Response received:`, response);

      return response.text || "";
    } catch (error) {
      lastError = error;
      console.error(`[Gemini Image] Attempt ${attempt + 1} failed:`, error);

      if (isApiError(error) && error.error?.code === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(
          `[Gemini Image] Rate limited, retrying in ${waitTime}ms...`,
        );
        await sleep(waitTime);
        continue;
      }

      throw error;
    }
  }

  console.error("[Gemini Image] All retries failed:", lastError);
  throw lastError;
}

export async function generateCommodityImage(
  options: ImageGenerationOptions,
): Promise<string> {
  if (!isConfigured() || !geminiClient) {
    const error = new Error(
      "Gemini API is not configured. Please set GEMINI_API_KEY in .env.local",
    );
    console.error("[Gemini Image]", error.message);
    throw error;
  }

  const { commodityName } = options;

  console.log(
    `[Gemini Image] Generating 512x512 JPG image for commodity: "${commodityName}"`,
  );

  const prompt = `Professional studio macro photography of ${commodityName}, close up shot, fresh and organic texture, soft natural lighting, isolated on a pure white background, 512x512 pixels, highly detailed, sharp focus, commercial food photography style, output as JPEG format, compact file size --ar 1:1`;

  try {
    const imageData = await generateImageWithRetry(prompt, 3);
    console.log(
      `[Gemini Image] Image generated successfully, length: ${imageData.length}`,
    );
    return imageData;
  } catch (error) {
    console.error("[Gemini Image] Error generating image:", error);

    if (isApiError(error)) {
      console.error("[Gemini Image] API Error details:", {
        code: error.error?.code,
        status: error.error?.status,
      });
    }

    if (isApiError(error) && error.error?.code === 429) {
      throw new Error(
        "Quota exceeded. Please try again later or add billing to your Google Cloud project.",
      );
    }

    throw error;
  }
}
