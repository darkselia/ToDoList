export type ApiError = {
  code: number;
  message: string;
};

export type ApiResponse<T, M = undefined> = {
  success: boolean;
  data?: T;
  meta?: M;
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

