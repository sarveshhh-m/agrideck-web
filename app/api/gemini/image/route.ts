import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

/**
 * Image generation using Google Vertex AI Imagen 3
 * Google's state-of-the-art image generation model
 *
 * Setup: Add these to .env.local:
 * - GOOGLE_CLOUD_PROJECT_ID=your-project-id
 * - GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
 * OR
 * - GOOGLE_CLOUD_API_KEY=your-vertex-ai-api-key
 */

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commodityName } = body;

    console.log(
      `[API Image] Generating image for commodity: "${commodityName}" using Google Imagen 3`,
    );

    if (!commodityName) {
      return NextResponse.json(
        { error: "Commodity name is required" },
        { status: 400 },
      );
    }

    if (!PROJECT_ID) {
      console.error(
        "[API Image] GOOGLE_CLOUD_PROJECT_ID not configured. Please set it in .env.local",
      );
      return NextResponse.json(
        {
          error:
            "Google Cloud not configured. Please set GOOGLE_CLOUD_PROJECT_ID in environment variables.",
        },
        { status: 500 },
      );
    }

    const prompt = `Professional studio macro photography of ${commodityName}, close up shot, fresh and organic texture, soft natural lighting, isolated on a pure white background, highly detailed, sharp focus, commercial food photography style`;

    console.log(`[API Image] Prompt: ${prompt}`);
    console.log(`[API Image] Environment check:`, {
      PROJECT_ID,
      LOCATION,
      GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    // Get access token
    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.error("[API Image] Failed to get access token");
      return NextResponse.json(
        {
          error:
            "Authentication failed. Please configure Google Cloud credentials.",
        },
        { status: 500 },
      );
    }

    console.log(`[API Image] Access token obtained (length: ${accessToken.length})`);
    console.log(`[API Image] Calling Vertex AI Imagen 3 API`);

    // Call Vertex AI Imagen API
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        negativePrompt: "blurry, low quality, distorted, watermark, text",
        safetySetting: "block_some",
        personGeneration: "dont_allow",
      },
    };

    console.log(`[API Image] Request endpoint: ${endpoint}`);
    console.log(`[API Image] Request body:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[API Image] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[API Image] ===== FULL ERROR DETAILS =====");
      console.error("[API Image] Status:", response.status, response.statusText);
      console.error("[API Image] Full error response:", JSON.stringify(errorData, null, 2));
      console.error("[API Image] Error details stringified:", JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorBody: errorData,
      }, null, 2));
      console.error("[API Image] =============================");

      if (response.status === 403) {
        return NextResponse.json(
          {
            error:
              "Vertex AI API not enabled. Please enable Vertex AI API in your Google Cloud project.",
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          error: errorData.error?.message || "Image generation failed",
        },
        { status: response.status },
      );
    }

    const responseData = await response.json();
    console.log(`[API Image] Imagen response received`);

    const imageData = responseData.predictions?.[0]?.bytesBase64Encoded;

    if (!imageData) {
      console.error(
        "[API Image] No image data in response:",
        JSON.stringify(responseData).substring(0, 200),
      );
      return NextResponse.json(
        { error: "No image data received from Imagen" },
        { status: 500 },
      );
    }

    console.log(
      `[API Image] Image generated successfully with Imagen 3, size: ${imageData.length} bytes`,
    );

    return NextResponse.json({ image: imageData });
  } catch (error) {
    console.error("[API Image] ===== CATCH BLOCK ERROR =====");
    console.error("[API Image] Error generating image:", error);
    console.error("[API Image] Error type:", typeof error);
    console.error("[API Image] Error stringified:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    if (error instanceof Error) {
      console.error("[API Image] Error message:", error.message);
      console.error("[API Image] Error stack:", error.stack);
    }
    console.error("[API Image] ===========================");
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
  try {
    console.log("[API Image] Getting access token...");
    console.log("[API Image] GoogleAuth credentials path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

    // Try using Application Default Credentials
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    console.log("[API Image] Auth client obtained, type:", typeof client);

    const accessTokenResponse = await client.getAccessToken();
    console.log("[API Image] Access token response:", JSON.stringify({
      hasToken: !!accessTokenResponse.token,
      tokenLength: accessTokenResponse.token?.length,
    }));

    return accessTokenResponse.token ?? null;
  } catch (error) {
    console.error("[API Image] ===== ACCESS TOKEN ERROR =====");
    console.error("[API Image] Failed to get access token:", error);
    console.error("[API Image] Error stringified:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error("[API Image] ===============================");
    return null;
  }
}
