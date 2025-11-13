export interface ApiError {
  code: string;
  message: string;
  userFriendlyMessage: string;
  retryable: boolean;
}

// API hata kodlarını kullanıcı dostu mesajlara çevir
// t fonksiyonu i18n translation fonksiyonu olmalı
export const getErrorMessage = (error: unknown, t: (key: string) => string = (key: string) => key): ApiError => {
  // Network hatası kontrolü
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: error.message,
      userFriendlyMessage: t('errors.networkError'),
      retryable: true,
    };
  }

  // Response hatası
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // API hata kodları
    if (errorMessage.includes('400') || errorMessage.includes('bad_request')) {
      return {
        code: 'BAD_REQUEST',
        message: error.message,
        userFriendlyMessage: t('errors.badRequest'),
        retryable: false,
      };
    }

    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return {
        code: 'UNAUTHORIZED',
        message: error.message,
        userFriendlyMessage: t('errors.unauthorized'),
        retryable: false,
      };
    }

    if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      return {
        code: 'FORBIDDEN',
        message: error.message,
        userFriendlyMessage: t('errors.forbidden'),
        retryable: false,
      };
    }

    if (errorMessage.includes('404') || errorMessage.includes('not_found')) {
      return {
        code: 'NOT_FOUND',
        message: error.message,
        userFriendlyMessage: t('errors.notFound'),
        retryable: false,
      };
    }

    if (errorMessage.includes('429') || errorMessage.includes('too_many_requests')) {
      return {
        code: 'RATE_LIMIT',
        message: error.message,
        userFriendlyMessage: t('errors.rateLimit'),
        retryable: true,
      };
    }

    if (errorMessage.includes('500') || errorMessage.includes('internal_server_error')) {
      return {
        code: 'SERVER_ERROR',
        message: error.message,
        userFriendlyMessage: t('errors.serverError'),
        retryable: true,
      };
    }

    if (errorMessage.includes('503') || errorMessage.includes('service_unavailable')) {
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: error.message,
        userFriendlyMessage: t('errors.serviceUnavailable'),
        retryable: true,
      };
    }

    // Genel hata
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      userFriendlyMessage: t('errors.unknownError'),
      retryable: true,
    };
  }

  // Bilinmeyen hata
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unknown error',
    userFriendlyMessage: t('errors.unknownError'),
    retryable: true,
  };
};

// Retry mekanizması
export const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Son denemede hata fırlat
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

