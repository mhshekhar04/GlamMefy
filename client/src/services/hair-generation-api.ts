// Hair Generation API Service using FLUX.1 Inpainting
import { fal } from "@fal-ai/client";

interface HairTemplate {
  id: string;
  name: string;
  triggerWord: string;
  loraPath: string;
  color: string;
  icon: string;
  image: string;
  prompt: string;
}

interface HairGenerationResult {
  images: Array<{
    url: string;
    content_type: string;
    width?: number;
    height?: number;
  }>;
  prompt: string;
  seed: number;
  has_nsfw_concepts: boolean[];
}

export class HairGenerationAPIService {
  private static instance: HairGenerationAPIService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): HairGenerationAPIService {
    if (!HairGenerationAPIService.instance) {
      HairGenerationAPIService.instance = new HairGenerationAPIService();
    }
    return HairGenerationAPIService.instance;
  }

  public initialize(apiKey?: string) {
    if (this.isInitialized) return;

    if (apiKey) {
      fal.config({
        credentials: apiKey
      });
    }

    this.isInitialized = true;
  }

  // Helper function to convert URL to Base64 data URL if needed
  private async urlToBase64(url: string): Promise<string> {
    // If it's already a Base64 data URL, return it as is
    if (url.startsWith('data:')) {
      return url;
    }

    // If it's a blob URL, convert it to Base64
    if (url.startsWith('blob:')) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });
    }

    // For other URLs, try to fetch and convert
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert to Base64'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read blob'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert URL to Base64:', error);
      // Return the original URL if conversion fails
      return url;
    }
  }

  public async generateHairStyle(
    originalImageUrl: string,
    maskImageUrl: string,
    template: HairTemplate
  ): Promise<HairGenerationResult> {
    try {
      console.log('=== Starting Hair Generation ===');
      console.log('Template:', template.name);
      console.log('Template prompt:', template.prompt);
      console.log('Template LoRA path:', template.loraPath);
      console.log('Original image URL:', originalImageUrl);
      console.log('Mask image URL:', maskImageUrl);

      // Convert URLs to Base64 data URLs if needed
      const originalImageBase64 = await this.urlToBase64(originalImageUrl);
      const maskImageBase64 = await this.urlToBase64(maskImageUrl);

      console.log('Original image Base64 length:', originalImageBase64.length);
      console.log('Mask image Base64 length:', maskImageBase64.length);
      console.log('Original image Base64 preview:', originalImageBase64.substring(0, 100) + '...');
      console.log('Mask image Base64 preview:', maskImageBase64.substring(0, 100) + '...');

      // Prepare the API request parameters
      const requestParams = {
        prompt: template.prompt,
        image_url: originalImageBase64,
        mask_url: maskImageBase64,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        real_cfg_scale: 3.5,
        strength: 0.85,
        num_images: 1,
        enable_safety_checker: true,
        reference_strength: 0.65,
        reference_end: 1,
        base_shift: 0.5,
        max_shift: 1.15,
        output_format: "png" as const,
        scheduler: "euler" as const,
        loras: [
          {
            path: template.loraPath,
            scale: 1.0
          }
        ]
      };

      console.log('=== API Request Parameters ===');
      console.log('Full request object:', JSON.stringify(requestParams, null, 2));
      console.log('Prompt:', requestParams.prompt);
      console.log('Image URL type:', typeof requestParams.image_url);
      console.log('Image URL starts with:', requestParams.image_url.substring(0, 50));
      console.log('Mask URL type:', typeof requestParams.mask_url);
      console.log('Mask URL starts with:', requestParams.mask_url.substring(0, 50));
      console.log('LoRA path:', requestParams.loras[0].path);
      console.log('LoRA scale:', requestParams.loras[0].scale);
      console.log('Inference steps:', requestParams.num_inference_steps);
      console.log('Guidance scale:', requestParams.guidance_scale);
      console.log('Real CFG scale:', requestParams.real_cfg_scale);
      console.log('Strength:', requestParams.strength);
      console.log('Num images:', requestParams.num_images);
      console.log('Safety checker:', requestParams.enable_safety_checker);
      console.log('Reference strength:', requestParams.reference_strength);
      console.log('Reference end:', requestParams.reference_end);
      console.log('Base shift:', requestParams.base_shift);
      console.log('Max shift:', requestParams.max_shift);
      console.log('Output format:', requestParams.output_format);
      console.log('Scheduler:', requestParams.scheduler);

      // Call FLUX.1 inpainting API with proper parameters
      console.log('=== Calling FLUX.1 Inpainting API ===');
      const result = await fal.subscribe("fal-ai/flux-general/inpainting", {
        input: requestParams,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log('API Logs:', update.logs.map((log) => log.message));
          }
        },
      });

      console.log('=== API Response ===');
      console.log('Full response:', result);
      console.log('Response data:', result.data);
      console.log('Generated images count:', result.data.images?.length);
      
      if (result.data.images && result.data.images.length > 0) {
        console.log('First generated image URL:', result.data.images[0].url);
      }

      return result.data as HairGenerationResult;

    } catch (error) {
      console.error('=== Hair Generation API Error ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error('Failed to generate hairstyle');
    }
  }

  public async generateHairStyleWithQueue(
    originalImageUrl: string,
    maskImageUrl: string,
    template: HairTemplate
  ): Promise<HairGenerationResult> {
    try {
      console.log('Starting hair generation with queue for template:', template.name);

      // Convert URLs to Base64 data URLs if needed
      const originalImageBase64 = await this.urlToBase64(originalImageUrl);
      const maskImageBase64 = await this.urlToBase64(maskImageUrl);

      // Submit to queue for long-running processing
      const { request_id } = await fal.queue.submit("fal-ai/flux-general/inpainting", {
        input: {
          prompt: template.prompt,
          image_url: originalImageBase64, // Image A: Original collage of 3 scanned images (Base64)
          mask_url: maskImageBase64, // Image M: Masked image from masking API (Base64)
          num_inference_steps: 28,
          guidance_scale: 3.5,
          real_cfg_scale: 3.5,
          strength: 0.85,
          num_images: 1,
          enable_safety_checker: true,
          reference_strength: 0.65,
          reference_end: 1,
          base_shift: 0.5,
          max_shift: 1.15,
          output_format: "png",
          scheduler: "euler",
          loras: [
            {
              path: template.loraPath,
              scale: 1.0
            }
          ]
        }
      });

      console.log('Hair generation request submitted:', request_id);

      // Poll for completion
      let status;
      do {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        status = await fal.queue.status("fal-ai/flux-general/inpainting", {
          requestId: request_id,
          logs: true
        });
        console.log('Generation status:', status.status);
      } while (status.status === "IN_PROGRESS");

      if (status.status === "COMPLETED") {
        const result = await fal.queue.result("fal-ai/flux-general/inpainting", {
          requestId: request_id
        });
        console.log('Hair generation completed:', result.data);
        return result.data as HairGenerationResult;
      } else {
        throw new Error(`Hair generation failed with status: ${status.status}`);
      }

    } catch (error) {
      console.error('Hair generation API error:', error);
      throw new Error('Failed to generate hairstyle');
    }
  }
}

// Export singleton instance
export const hairGenerationAPI = HairGenerationAPIService.getInstance(); 

      // Initialize hair generation API
      const apiKey = import.meta.env.VITE_FAL_KEY;
      if (!apiKey) {
        throw new Error('FAL API key not found. Please set VITE_FAL_KEY environment variable.');
      }
      hairGenerationAPI.initialize(apiKey); 