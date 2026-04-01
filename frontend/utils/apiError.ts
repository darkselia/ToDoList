import type { ApiErrorLike } from '~/types/api';

export function extractApiErrorMessage(error: unknown, fallbackMessage = '') {
  if (!error || typeof error !== 'object') {
    return fallbackMessage;
  }

  const apiError = error as ApiErrorLike;
  const serverMessage = apiError.response?._data?.error?.message;

  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage.trim();
  }

  if (typeof apiError.message === 'string' && apiError.message.trim()) {
    return apiError.message.trim();
  }

  return fallbackMessage;
}

