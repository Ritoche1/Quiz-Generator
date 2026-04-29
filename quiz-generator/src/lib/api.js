'use client';

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again later.';

export function cleanErrorMessage(message, fallback = DEFAULT_ERROR_MESSAGE) {
  if (typeof message !== 'string') return fallback;

  const cleaned = message
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || fallback;
}

export async function getErrorMessage(response, fallback = DEFAULT_ERROR_MESSAGE) {
  if (!response) return fallback;

  try {
    const contentType = response.headers?.get?.('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (typeof data === 'string') return cleanErrorMessage(data, fallback);
      return cleanErrorMessage(data?.detail || data?.message || data?.error, fallback);
    }

    const text = await response.text();
    return cleanErrorMessage(text, fallback);
  } catch {
    return fallback;
  }
}