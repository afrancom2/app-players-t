export type ErrorSource = 'validation' | 'auth' | 'database' | 'backend';

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  source: ErrorSource;
  code: string;
  message: string;
  details?: FieldError[];
  path: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}
