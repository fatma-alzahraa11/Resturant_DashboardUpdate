export interface ExtractedApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}

export function extractApiError(error: unknown): ExtractedApiError {
  let fallbackMessage = 'Something went wrong. Please try again.';
  const result: ExtractedApiError = { message: fallbackMessage };

  const normalizeFieldName = (name: unknown): string | null => {
    if (!name) return null;
    if (typeof name === 'string') return name;
    if (Array.isArray(name) && name.length > 0) return String(name[0]);
    return null;
  };

  const tryExtractFromData = (data: any) => {
    if (!data || typeof data !== 'object') return;
    if (typeof data.message === 'string') {
      result.message = data.message;
    } else if (typeof data.error === 'string') {
      result.message = data.error;
    }

    // Common validation error shapes
    const errors = (data as any).errors;
    if (errors) {
      const fieldErrors: Record<string, string> = {};
      if (Array.isArray(errors)) {
        for (const item of errors) {
          const field = normalizeFieldName(item?.field ?? item?.path ?? item?.param);
          const message = item?.message || item?.msg || item?.error || String(item);
          if (field) fieldErrors[field] = message;
        }
      } else if (typeof errors === 'object') {
        for (const key of Object.keys(errors)) {
          const value = (errors as any)[key];
          if (typeof value === 'string') fieldErrors[key] = value;
          else if (Array.isArray(value) && value.length > 0) fieldErrors[key] = String(value[0]);
          else if (value && typeof value.message === 'string') fieldErrors[key] = value.message;
        }
      }
      if (Object.keys(fieldErrors).length > 0) result.fieldErrors = fieldErrors;
    }
  };

  if (error && typeof error === 'object') {
    const err: any = error as any;
    if (typeof err.status !== 'undefined') {
      // RTK Query FetchBaseQueryError
      const status = err.status;
      if (status === 'FETCH_ERROR') {
        result.message = 'Cannot reach the server. Please check your connection and try again.';
      } else if (status === 'PARSING_ERROR') {
        result.message = 'Received an unexpected response from the server.';
      } else if (status === 'TIMEOUT_ERROR') {
        result.message = 'The request timed out. Please try again.';
      } else if (status === 'CUSTOM_ERROR') {
        result.message = err.error || fallbackMessage;
      } else if (typeof status === 'number') {
        // Try payload first
        tryExtractFromData(err.data);
        // Specific mappings
        if (status === 401) {
          const backendCode = (err.data && (err.data.code || err.data.error)) || '';
          const passwordSpecific = backendCode === 'INVALID_PASSWORD' || !!(result.fieldErrors && result.fieldErrors.password);
          result.message = passwordSpecific ? 'Password is wrong.' : 'Invalid email or password.';
        } else if (result.message === fallbackMessage) {
          if (status === 400 || status === 422) result.message = 'Please check the highlighted fields.';
          else if (status === 403) result.message = 'You do not have permission to perform this action.';
          else if (status === 404) result.message = 'Requested resource was not found.';
          else if (status === 409) result.message = 'A conflicting record already exists.';
          else if (status >= 500) result.message = 'Server error. Please try again later.';
        }
      }
      return result;
    }

    // Fallbacks
    if (typeof err.error === 'string') {
      result.message = err.error;
      return result;
    }
    if (err.data) {
      tryExtractFromData(err.data);
      return result;
    }
  }

  if (error instanceof Error && error.message) {
    result.message = error.message;
  }

  return result;
}


