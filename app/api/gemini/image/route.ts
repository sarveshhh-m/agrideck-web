import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commodityName } = body;

    console.log(
      `[API Image] Generating image for commodity: "${commodityName}"`,
    );

    if (!commodityName) {
      return NextResponse.json(
        { error: "Commodity name is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[API Image] GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const prompt = `Professional studio macro photography of ${commodityName}, close up shot, fresh and organic texture, soft natural lighting, isolated on a pure white background, 512x512 pixels, highly detailed, sharp focus, commercial food photography style --ar 1:1`;

    console.log(
      `[API Image] Calling Gemini REST API for image generation with Gemini 2.0`,
    );

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
        }),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("[API Image] Gemini API error:", responseData);
      return NextResponse.json(
        { error: responseData.error?.message || "Image generation failed" },
        { status: response.status },
      );
    }

    console.log(`[API Image] Gemini response received, checking for image...`);

    const imageData = extractImageFromResponse(responseData);

    if (!imageData) {
      console.error(
        "[API Image] No image data in response, trying text mode...",
      );
      return NextResponse.json(
        {
          error:
            "Model did not generate an image. Try using Gemini 2.0 with image generation support or switch to Imagen API.",
        },
        { status: 500 },
      );
    }

    console.log(
      `[API Image] Image generated successfully, length: ${imageData.length}`,
    );
    return NextResponse.json({ image: imageData });
  } catch (error) {
    console.error("[API Image] Image generation API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate image",
      },
      { status: 500 },
    );
  }
}

function extractImageFromResponse(data: any): string | null {
  try {
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];

      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            console.log(
              `[API Image] Found inlineData image, mimeType: ${part.inlineData.mimeType}`,
            );
            return part.inlineData.data;
          }
          if (part.text) {
            console.log(
              `[API Image] Received text response instead of image: ${part.text.substring(0, 100)}...`,
            );
            return null;
          }
        }
      }
    }

    if (data.promptFeedback && data.promptFeedback.blockReason) {
      console.error(
        `[API Image] Request blocked: ${data.promptFeedback.blockReason}`,
      );
      return null;
    }

    console.log(`[API Image] No image data found in response`);
    console.log(
      `[API Image] Full response:`,
      JSON.stringify(data).substring(0, 500),
    );
    return null;
  } catch (error) {
    console.error("[API Image] Error extracting image:", error);
    return null;
  }
}
