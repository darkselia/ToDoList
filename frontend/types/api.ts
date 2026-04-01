export type ApiError = {
  code: number;
  message: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError | null;
};

export type ApiErrorLike = {
  response?: {
    _data?: {
      error?: {
        message?: string;
      };
    };
  };
  message?: string;
};

