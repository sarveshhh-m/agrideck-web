# Image Generation Setup

## Current Status: Disabled ❌

AI image generation is currently disabled because **Gemini models cannot generate images**.

### What Gemini Can Do:
- ✅ Generate text
- ✅ Analyze images (accept images as input)
- ❌ Generate images from text prompts

---

## Options to Enable Image Generation

### Option 1: Google Imagen (Recommended)

Since you're already using Google Cloud/Gemini API, Imagen is the natural choice.

**Setup Steps:**

1. **Enable Vertex AI API** in Google Cloud Console:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

2. **Create a service account** with Vertex AI permissions:
   ```bash
   gcloud iam service-accounts create vertex-ai-user \
     --display-name="Vertex AI User"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:vertex-ai-user@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **Download service account key**:
   ```bash
   gcloud iam service-accounts keys create ./vertex-ai-key.json \
     --iam-account=vertex-ai-user@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Add environment variables** to `.env.local`:
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/vertex-ai-key.json
   ```

5. **Install Google Auth library**:
   ```bash
   npm install @google-cloud/aiplatform
   ```

6. **Replace** `app/api/gemini/image/route.ts` with the Imagen implementation:
   - Use the example code in `route-imagen.ts`
   - Implement proper OAuth2 authentication

**Pricing:** ~$0.020 per image (512x512)

---

### Option 2: OpenAI DALL-E

**Setup Steps:**

1. **Get OpenAI API key** from https://platform.openai.com/api-keys

2. **Add to `.env.local`**:
   ```env
   OPENAI_API_KEY=sk-...
   ```

3. **Install OpenAI SDK**:
   ```bash
   npm install openai
   ```

4. **Update API route** (`app/api/gemini/image/route.ts`):
   ```typescript
   import OpenAI from 'openai';

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
   });

   export async function POST(request: NextRequest) {
     const { commodityName } = await request.json();

     const response = await openai.images.generate({
       model: "dall-e-3",
       prompt: `Professional studio macro photography of ${commodityName}...`,
       size: "1024x1024",
       quality: "standard",
       n: 1,
     });

     const imageUrl = response.data[0].url;
     // Fetch and convert to base64...
   }
   ```

**Pricing:**
- DALL-E 3: $0.040 per image (1024x1024)
- DALL-E 2: $0.020 per image (512x512)

---

### Option 3: Stability AI (Stable Diffusion)

**Setup Steps:**

1. **Get API key** from https://platform.stability.ai/

2. **Add to `.env.local`**:
   ```env
   STABILITY_API_KEY=sk-...
   ```

3. **Update API route** to use Stability AI API

**Pricing:** ~$0.002 per image (very affordable)

---

### Option 4: Replicate (Various Models)

Replicate provides access to many open-source image generation models.

**Setup Steps:**

1. **Get API key** from https://replicate.com/

2. **Install Replicate SDK**:
   ```bash
   npm install replicate
   ```

3. **Use SDXL or other models**

**Pricing:** Pay-per-use, varies by model (~$0.002-0.01 per image)

---

## Re-enabling the UI

Once you've configured an image generation service:

1. **Update** `app/api/gemini/image/route.ts` with proper implementation
2. **Remove** the `{false &&` condition in `CommoditiesTable.tsx:127`
3. **Test** the image generation flow

---

## Testing

After setup, test with:
```bash
curl -X POST http://localhost:3000/api/gemini/image \
  -H "Content-Type: application/json" \
  -d '{"commodityName": "Tomato"}'
```

Should return:
```json
{
  "image": "base64encodedimagedata..."
}
```

---

## Notes

- Images are generated as 512x512 JPEG for consistency
- All options support similar pricing (~$0.002-0.04 per image)
- For production, implement rate limiting and caching
- Consider storing generated images in cloud storage to avoid regeneration
