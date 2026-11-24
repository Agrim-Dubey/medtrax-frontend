/**
 * Centralized API Error Parser for DRF and Axios
 */

export interface ParsedError {
  message: string;
  fieldErrors: Record<string, string>;
  isUnverified?: boolean;
  isProfileIncomplete?: boolean;
  email?: string;
  role?: string;
}

export function parseApiError(err: any): ParsedError {
  if (!err) {
    return { message: 'An unexpected error occurred. Please try again.', fieldErrors: {} };
  }

  const data = err.response?.data;

  // Check if network error or no response
  if (!err.response) {
    return {
      message: err.message?.includes('Network Error')
        ? 'Network error. Please check your internet connection or server status.'
        : err.message || 'Unable to connect to the server. Please try again later.',
      fieldErrors: {},
    };
  }

  // Handle HTML error responses (e.g. 502/504 Bad Gateway from reverse proxy)
  if (typeof data === 'string' && data.includes('<html')) {
    return {
      message: `Server returned error (${err.response.status}). Please try again in a few moments.`,
      fieldErrors: {},
    };
  }

  const fieldErrors: Record<string, string> = {};
  let mainMessage = '';
  let isUnverified = false;
  let isProfileIncomplete = false;
  let email: string | undefined;
  let role: string | undefined;

  // Check if backend flagged unverified or incomplete profile
  if (data?.is_unverified || data?.errors?.is_unverified) {
    isUnverified = true;
  }
  if (data?.is_profile_complete === false) {
    isProfileIncomplete = true;
  }
  if (data?.email) email = data.email;
  if (data?.role) role = data.role;

  // Extract field errors if present
  const rawErrors = data?.errors || (typeof data === 'object' && !data.error && !data.detail ? data : null);

  if (rawErrors && typeof rawErrors === 'object') {
    Object.keys(rawErrors).forEach((key) => {
      const val = rawErrors[key];
      let msg = '';
      if (Array.isArray(val)) {
        msg = val[0];
      } else if (typeof val === 'string') {
        msg = val;
      }

      if (key === 'non_field_errors') {
        mainMessage = msg;
        if (msg.toLowerCase().includes('not verified')) {
          isUnverified = true;
        }
      } else if (key !== 'success' && key !== 'is_unverified' && key !== 'is_profile_complete') {
        // Clean up common DRF choice validation strings
        if (msg.includes('is not a valid choice')) {
          msg = `Please select a valid ${key.replace(/_/g, ' ')}.`;
        }
        fieldErrors[key] = msg;
      }
    });
  }

  // Determine the primary user-facing message
  if (!mainMessage) {
    mainMessage =
      data?.error ||
      data?.message ||
      data?.detail ||
      (Object.values(fieldErrors)[0] ? Object.values(fieldErrors)[0] : '') ||
      'Action failed. Please review your input and try again.';
  }

  return {
    message: mainMessage,
    fieldErrors,
    isUnverified,
    isProfileIncomplete,
    email,
    role,
  };
}
