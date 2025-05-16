import { Types } from 'mongoose';

export interface ErrorResponseData {
  message?: string;
  status?: boolean;
  statusCode?: number;
} 