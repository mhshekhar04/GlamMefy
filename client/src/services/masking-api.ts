// Masking API Service for FAL AI Integration
import { fal } from "@fal-ai/client";

interface MaskingResult {
  image: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
}

export class MaskingAPIService {
  private static instance: MaskingAPIService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): MaskingAPIService {
    if (!MaskingAPIService.instance) {
      MaskingAPIService.instance = new MaskingAPIService();
    }
    return MaskingAPIService.instance;
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

  // Helper function to convert File/Blob to Base64 data URL
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to Base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  public async processFaceCollage(imageFile: File, options?: { prompt?: string }): Promise<MaskingResult> {
    try {
      // Log the input collage image details
      console.log('Input collage image file:', imageFile);
      console.log('Input collage image size:', imageFile.size, 'bytes');
      console.log('Input collage image type:', imageFile.type);
      
      // Convert File to Base64 data URL
      const base64DataUrl = await this.fileToBase64(imageFile);
      console.log('Converted to Base64 data URL:', base64DataUrl.substring(0, 100) + '...');

      // Use custom prompt if provided, otherwise use default
      const prompt = options?.prompt || "mask the head hair region of all the images in uploaded image";
      console.log('Using masking prompt:', prompt);

      // Call the FAL AI masking API with head/hair region prompt using Base64 data URL
      const result = await fal.subscribe("fal-ai/evf-sam", {
        input: {
          prompt: prompt,
          image_url: base64DataUrl, // Use Base64 data URL directly
          mask_only: true // Return only the mask
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      return result.data as MaskingResult;

    } catch (error) {
      console.error('Masking API error:', error);
      throw new Error('Failed to process face collage');
    }
  }

  public async processFaceCollageWithQueue(imageFile: File, options?: { prompt?: string }): Promise<MaskingResult> {
    try {
      // Log the input collage image details
      console.log('Input collage image file:', imageFile);
      console.log('Input collage image size:', imageFile.size, 'bytes');
      console.log('Input collage image type:', imageFile.type);
      
      // Convert File to Base64 data URL
      const base64DataUrl = await this.fileToBase64(imageFile);
      console.log('Converted to Base64 data URL:', base64DataUrl.substring(0, 100) + '...');

      // Use custom prompt if provided, otherwise use default
      const prompt = options?.prompt || "Mask only the scalp hair in the full-face crop, excluding all facial hair (beard, eyebrows). Focus on the hair on top of the head, sideburns, and back of the head. Do not include any facial hair, eyebrows, or beard.";
      console.log('Using masking prompt:', prompt);

      // Submit to queue for long-running processing using Base64 data URL
      const { request_id } = await fal.queue.submit("fal-ai/evf-sam", {
        input: {
          prompt: prompt,
          image_url: base64DataUrl, // Use Base64 data URL directly
          mask_only: true // Return only the mask
        }
      });

      console.log('Masking request submitted:', request_id);

      // Poll for completion
      let status;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        status = await fal.queue.status("fal-ai/evf-sam", {
          requestId: request_id,
          logs: true
        });
        console.log('Status:', status.status);
      } while (status.status === "IN_PROGRESS");

      if (status.status === "COMPLETED") {
        const result = await fal.queue.result("fal-ai/evf-sam", {
          requestId: request_id
        });
        return result.data as MaskingResult;
      } else {
        throw new Error(`Masking failed with status: ${status.status}`);
      }

    } catch (error) {
      console.error('Masking API error:', error);
      throw new Error('Failed to process face collage');
    }
  }
}

// Export singleton instance
export const maskingAPI = MaskingAPIService.getInstance(); 