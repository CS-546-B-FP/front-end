const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i;
const DEFAULT_NETWORK_ERROR_MESSAGE = 'Network request failed. Please try again.';
const DEFAULT_JSON_ERROR_MESSAGE = 'Response was not valid JSON.';

export const DEFAULT_API_BASE_URL = '/api';

export class ApiClientError extends Error {
  constructor(message, {
    status = 0,
    statusText = '',
    method = 'GET',
    url = '',
    data = null,
    cause
  } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.statusText = statusText;
    this.method = method;
    this.url = url;
    this.data = data;
    this.cause = cause;
  }
}

const normalizeMethod = (method = 'GET') => String(method).toUpperCase();

export function buildApiUrl(endpoint, baseUrl = DEFAULT_API_BASE_URL) {
  const normalizedEndpoint = String(endpoint || '').trim();
  const normalizedBaseUrl = String(baseUrl || '').trim();

  if (!normalizedEndpoint) {
    return normalizedBaseUrl || '/';
  }

  if (ABSOLUTE_URL_PATTERN.test(normalizedEndpoint) || !normalizedBaseUrl) {
    return normalizedEndpoint;
  }

  const base = normalizedBaseUrl.replace(/\/+$/, '');

  if (normalizedEndpoint === base || normalizedEndpoint.startsWith(`${base}/`)) {
    return normalizedEndpoint;
  }

  const path = normalizedEndpoint.startsWith('/')
    ? normalizedEndpoint
    : `/${normalizedEndpoint}`;

  return `${base}${path}`;
}

export function normalizeHeaders(headers = {}) {
  return {
    Accept: 'application/json',
    ...headers
  };
}

export async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text) {
    return { data: null, parseError: null, rawText: '' };
  }

  try {
    return { data: JSON.parse(text), parseError: null, rawText: text };
  } catch (error) {
    return { data: null, parseError: error, rawText: text };
  }
}

const getPayloadError = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  if (typeof payload.error === 'string') {
    return payload.error;
  }

  if (typeof payload.message === 'string') {
    return payload.message;
  }

  return '';
};

const getPayloadData = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }

  if (payload.success === true) {
    return null;
  }

  return payload;
};

export async function normalizeApiResponse(response, { method = 'GET', url = '' } = {}) {
  const { data: payload, parseError, rawText } = await parseJsonSafely(response);
  const payloadError = getPayloadError(payload);
  const responseData = getPayloadData(payload);
  const payloadSuccess = payload && typeof payload === 'object'
    ? payload.success
    : undefined;
  const success = response.ok && payloadSuccess !== false && !parseError;

  return {
    success,
    ok: success,
    status: response.status,
    statusText: response.statusText,
    method: normalizeMethod(method),
    url: response.url || url,
    data: success ? responseData : null,
    error: success
      ? ''
      : payloadError || (parseError ? DEFAULT_JSON_ERROR_MESSAGE : `${response.status} ${response.statusText}`.trim()),
    rawText,
    parseError
  };
}

export function normalizeNetworkError(error, { method = 'GET', url = '' } = {}) {
  return {
    success: false,
    ok: false,
    status: 0,
    statusText: '',
    method: normalizeMethod(method),
    url,
    data: null,
    error: DEFAULT_NETWORK_ERROR_MESSAGE,
    rawText: '',
    parseError: null,
    cause: error
  };
}

export function throwIfApiError(result) {
  if (result.success) {
    return result;
  }

  throw new ApiClientError(result.error, {
    status: result.status,
    statusText: result.statusText,
    method: result.method,
    url: result.url,
    data: result.data,
    cause: result.cause || result.parseError
  });
}

const DEFAULT_TIMEOUT_MS = 30000;

export function createApiClient({
  baseUrl = DEFAULT_API_BASE_URL,
  fetchImpl = globalThis.fetch,
  defaultHeaders = {},
  credentials = 'same-origin',
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  const request = async (endpoint, {
    method = 'GET',
    headers = {},
    body,
    json,
    throwOnError = false,
    ...fetchOptions
  } = {}) => {
    const normalizedMethod = normalizeMethod(method);
    const url = buildApiUrl(endpoint, baseUrl);
    const resolvedHeaders = normalizeHeaders({
      ...defaultHeaders,
      ...headers,
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {})
    });
    const requestOptions = {
      method: normalizedMethod,
      credentials,
      headers: resolvedHeaders,
      ...fetchOptions,
      ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
      ...(body !== undefined && json === undefined ? { body } : {})
    };

    if (typeof fetchImpl !== 'function') {
      const result = normalizeNetworkError(new TypeError('fetch is not available'), {
        method: normalizedMethod,
        url
      });
      return throwOnError ? throwIfApiError(result) : result;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    requestOptions.signal = requestOptions.signal ?? controller.signal;

    try {
      const response = await fetchImpl(url, requestOptions);
      clearTimeout(timeoutId);
      const result = await normalizeApiResponse(response, {
        method: normalizedMethod,
        url
      });
      return throwOnError ? throwIfApiError(result) : result;
    } catch (error) {
      clearTimeout(timeoutId);
      const result = normalizeNetworkError(error, {
        method: normalizedMethod,
        url
      });
      return throwOnError ? throwIfApiError(result) : result;
    }
  };

  return Object.freeze({
    request,
    get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, json, options) => request(endpoint, { ...options, method: 'POST', json }),
    put: (endpoint, json, options) => request(endpoint, { ...options, method: 'PUT', json }),
    patch: (endpoint, json, options) => request(endpoint, { ...options, method: 'PATCH', json }),
    delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
  });
}

export const apiClient = createApiClient();
export const apiRequest = apiClient.request;
