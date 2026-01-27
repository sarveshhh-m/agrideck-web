import { NextRequest, NextResponse } from "next/server";

/**
 * Image generation using Google Cloud Vertex AI Imagen API
 *
 * Setup required:
 * 1. Enable Vertex AI API in Google Cloud Console
 * 2. Set environment variables:
 *    - GOOGLE_CLOUD_PROJECT_ID
 *    - GOOGLE_CLOUD_LOCATION (e.g., "us-central1")
 *    - GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON)
 */

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

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
    const accessToken = await getAccessToken();

    if (!projectId || !accessToken) {
      console.error("[API Image] Google Cloud credentials not configured");
      return NextResponse.json(
        { error: "Google Cloud credentials not configured" },
        { status: 500 },
      );
    }

    const prompt = `Professional studio macro photography of ${commodityName}, close up shot, fresh and organic texture, soft natural lighting, isolated on a pure white background, highly detailed, sharp focus, commercial food photography style`;

    console.log(`[API Image] Calling Vertex AI Imagen API`);

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          negativePrompt: "blurry, low quality, distorted, watermark",
          safetySetting: "block_some",
          personGeneration: "dont_allow",
        },
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("[API Image] Vertex AI error:", responseData);
      return NextResponse.json(
        { error: responseData.error?.message || "Image generation failed" },
        { status: response.status },
      );
    }

    console.log(`[API Image] Imagen response received`);

    const imageData = responseData.predictions?.[0]?.bytesBase64Encoded;

    if (!imageData) {
      console.error("[API Image] No image data in response");
      return NextResponse.json(
        { error: "No image data in response" },
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

async function getAccessToken(): Promise<string | null> {
  // You'll need to implement OAuth2 token generation
  // or use Google Auth library
  // For now, returning null - you need to set this up
  return null;
}
