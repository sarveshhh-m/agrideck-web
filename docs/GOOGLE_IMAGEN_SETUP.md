# Google Imagen Setup Guide

## Overview

This guide shows how to set up **Google Imagen 3** (Google's best image generation model) for commodity image generation.

---

## Step 1: Enable Vertex AI API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Enable the Vertex AI API:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```
   Or visit: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com

---

## Step 2: Set Up Authentication

### Option A: Service Account (Recommended for Production)

1. **Create a service account:**
   ```bash
   gcloud iam service-accounts create imagen-service \
     --display-name="Imagen Service Account"
   ```

2. **Grant permissions:**
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:imagen-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **Create and download key:**
   ```bash
   gcloud iam service-accounts keys create ./imagen-key.json \
     --iam-account=imagen-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Add to `.env.local`:**
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./imagen-key.json
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

### Option B: Application Default Credentials (For Development)

1. **Install gcloud CLI** if not already installed

2. **Authenticate:**
   ```bash
   gcloud auth application-default login
   ```

3. **Add to `.env.local`:**
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

---

## Step 3: Test the Setup

1. **Restart your Next.js server:**
   ```bash
   npm run dev
   ```

2. **Test the API:**
   ```bash
   curl -X POST http://localhost:3000/api/gemini/image \
     -H "Content-Type: application/json" \
     -d '{"commodityName": "Tomato"}'
   ```

   Expected response:
   ```json
   {
     "image": "base64-encoded-image-data..."
   }
   ```

3. **Test in the UI:**
   - Go to Commodities section
   - Click the sparkles (✨) icon next to any commodity image
   - Confirm the dialog
   - Wait for image generation (~5-10 seconds)
   - Review and upload the generated image

---

## Pricing

**Imagen 3 Pricing (as of 2024):**
- ~$0.020 per image (512x512)
- ~$0.040 per image (1024x1024)

Much cheaper than DALL-E and comparable quality!

---

## Troubleshooting

### Error: "Vertex AI API not enabled"

**Solution:** Enable the API:
```bash
gcloud services enable aiplatform.googleapis.com
```

### Error: "Authentication failed"

**Solutions:**
1. Check that `GOOGLE_CLOUD_PROJECT_ID` is set correctly
2. Verify credentials file path in `GOOGLE_APPLICATION_CREDENTIALS`
3. Try running: `gcloud auth application-default login`

### Error: "Permission denied"

**Solution:** Grant proper permissions:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### Images not generating in UI

1. Check browser console for errors
2. Check server logs: `npm run dev`
3. Verify environment variables are loaded
4. Test API directly with curl

---

## Available Imagen Models

- `imagen-3.0-generate-001` - Latest, best quality (currently used)
- `imagen-3.0-fast-generate-001` - Faster generation, slightly lower quality
- `imagegeneration@006` - Previous version (Imagen 2)

To change the model, update the endpoint in `app/api/gemini/image/route.ts`:
```typescript
const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;
```

---

## Security Best Practices

1. **Never commit** service account keys to Git
2. Add `*.json` to `.gitignore` (already done)
3. Use **least privilege** IAM roles
4. Rotate service account keys regularly
5. Use different credentials for dev/staging/prod

---

## Cost Management

1. **Set budget alerts** in Google Cloud Console
2. **Monitor usage:**
   ```bash
   gcloud logging read "resource.type=aiplatform.googleapis.com" --limit 10
   ```
3. **Rate limiting:** Consider adding rate limits in the API route
4. **Caching:** Store generated images to avoid regeneration

---

## Next Steps

Once Imagen is working:
- Generated images appear in a preview modal
- Review the image before uploading
- Images are stored in Supabase storage
- Consider adding retry logic for failed generations
- Add image caching to reduce API calls

---

## Support

- [Vertex AI Imagen Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- [Imagen API Reference](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/imagen)
- [Google Cloud Console](https://console.cloud.google.com/)
