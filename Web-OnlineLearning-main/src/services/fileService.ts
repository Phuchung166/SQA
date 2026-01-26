import { axiosUpload } from '@/config/axios';
import { parseApiError } from './apiError';

export interface UploadRequest {
  variant: string;
  extension: string;
  file_name: string;
}

export interface UploadResponse {
  cloudFrontUrl: string;
  filename: string;
  presignedUrl: string;
}

export const createUrlFile = async (UploadResponse: UploadRequest): Promise<UploadResponse> => {
  try {
    const response = await axiosUpload.post(`/files/pre-signed-url`, UploadResponse);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating pre-signed URL:', error);
    return Promise.reject(parseApiError(error));
  }
};

