import { toPlaceholderPageModel } from '../adapters/view-models.js';

const DEFAULT_BACKEND_URL = 'http://localhost:3001';
const NETWORK_ERROR_MESSAGE = 'Unable to connect to the backend server. Please try again later.';
const JSON_ERROR_MESSAGE = 'Backend response was not valid JSON.';

export const BACKEND_API_BASE_URL = process.env.API_BASE_URL || DEFAULT_BACKEND_URL;

const buildBackendUrl = (path, baseUrl = BACKEND_API_BASE_URL) => {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  const endpoint = String(path || '');

  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

const appendQuery = (path, params = {}) => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  }

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
};

const buildHeaders = ({ body, cookie, headers = {} } = {}) => {
  const requestHeaders = {
    Accept: 'application/json',
    ...headers
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (cookie) {
    requestHeaders.Cookie = cookie;
  }

  return requestHeaders;
};

const parseJsonSafely = async (response) => {
  const text = await response.text();

  if (!text) {
    return { payload: null, parseError: false };
  }

  try {
    return { payload: JSON.parse(text), parseError: false };
  } catch {
    return { payload: null, parseError: true };
  }
};

const getResponseData = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }

  return null;
};

const getResponseError = (response, payload) => {
  if (payload && typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error;
  }

  if (payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  return response.ok ? '' : `${response.status} ${response.statusText}`.trim();
};

export async function request(path, {
  method = 'GET',
  body,
  cookie,
  headers,
  fetchImpl = globalThis.fetch
} = {}) {
  const url = buildBackendUrl(path);
  const requestOptions = {
    method,
    headers: buildHeaders({ body, cookie, headers }),
    body: body !== undefined ? JSON.stringify(body) : undefined
  };

  if (typeof fetchImpl !== 'function') {
    return {
      ok: false,
      status: 0,
      data: null,
      error: NETWORK_ERROR_MESSAGE,
      setCookie: ''
    };
  }

  try {
    const response = await fetchImpl(url, requestOptions);
    const { payload, parseError } = await parseJsonSafely(response);
    const ok = response.ok && payload?.success !== false && !parseError;

    return {
      ok,
      status: response.status,
      data: getResponseData(payload),
      error: ok ? '' : parseError ? JSON_ERROR_MESSAGE : getResponseError(response, payload),
      setCookie: response.headers.get('set-cookie') || ''
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: NETWORK_ERROR_MESSAGE,
      setCookie: ''
    };
  }
}

export const auth = {
  async login(username, password) {
    return request('/auth/login', {
      method: 'POST',
      body: { username, password }
    });
  },

  async register({ firstName, lastName, email, username, password }) {
    return request('/auth/register', {
      method: 'POST',
      body: { firstName, lastName, email, username, password }
    });
  },

  async logout(cookie) {
    return request('/auth/logout', { method: 'POST', cookie });
  }
};

export const buildings = {
  async list({
    search,
    borough,
    neighborhood,
    riskLevel,
    sortBy,
    sortOrder,
    page,
    limit
  } = {}) {
    return request(
      appendQuery('/buildings', {
        search,
        borough,
        neighborhood,
        riskLevel,
        sortBy,
        sortOrder,
        page,
        limit
      })
    );
  },

  async getById(id) {
    return request(`/buildings/${encodeURIComponent(id)}`);
  },

  async getByOwner(ownerName) {
    return request(`/portfolios/${encodeURIComponent(ownerName)}`);
  },

  async getTrends(borough) {
    return request(
      appendQuery('/neighborhoods/trends', { borough })
    );
  },

  async getAlternatives(id, limit) {
    return request(
      appendQuery(`/buildings/${encodeURIComponent(id)}/alternatives`, { limit })
    );
  }
};

export const reviews = {
  async getForBuilding(buildingId) {
    return request(`/buildings/${encodeURIComponent(buildingId)}/reviews`);
  },

  async create(buildingId, { reviewText, rating, issueTags }, cookie) {
    return request(`/buildings/${encodeURIComponent(buildingId)}/reviews`, {
      method: 'POST',
      body: { reviewText, rating: Number(rating), issueTags },
      cookie
    });
  },

  async update(reviewId, { reviewText, rating, issueTags }, cookie) {
    return request(`/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'PUT',
      body: { reviewText, rating: Number(rating), issueTags },
      cookie
    });
  },

  async remove(reviewId, cookie) {
    return request(`/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
      cookie
    });
  }
};

export const watchlist = {
  async toggle(buildingId, cookie) {
    return request('/watchlist/toggle', {
      method: 'POST',
      body: { buildingId },
      cookie
    });
  }
};

export const shortlists = {
  async list(cookie) {
    return request('/shortlists', { cookie });
  },

  async create(shortlistName, cookie) {
    return request('/shortlists', {
      method: 'POST',
      body: { shortlistName },
      cookie
    });
  },

  async remove(id, cookie) {
    return request(`/shortlists/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      cookie
    });
  },

  async addItem(shortlistId, buildingId, cookie) {
    return request(`/shortlists/${encodeURIComponent(shortlistId)}/items`, {
      method: 'POST',
      body: { buildingId },
      cookie
    });
  },

  async removeItem(shortlistId, buildingId, cookie) {
    return request(
      `/shortlists/${encodeURIComponent(shortlistId)}/items/${encodeURIComponent(buildingId)}`,
      { method: 'DELETE', cookie }
    );
  },

  async updateNote(shortlistId, buildingId, privateNote, cookie) {
    return request(
      `/shortlists/${encodeURIComponent(shortlistId)}/items/${encodeURIComponent(buildingId)}/note`,
      { method: 'PATCH', body: { privateNote }, cookie }
    );
  }
};

export const users = {
  async getProfile(cookie) {
    return request('/users/me', { cookie });
  },

  async updateProfile({ firstName, lastName, email, username }, cookie) {
    return request('/users/me', {
      method: 'PUT',
      body: { firstName, lastName, email, username },
      cookie
    });
  },

  async changePassword({ currentPassword, newPassword }, cookie) {
    return request('/users/me/password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
      cookie
    });
  },

  async deleteAccount(cookie) {
    return request('/users/me', { method: 'DELETE', cookie });
  }
};

export const admin = {
  async createBuilding(body, cookie) {
    return request('/admin/buildings', { method: 'POST', body, cookie });
  },

  async updateBuilding(id, body, cookie) {
    return request(`/admin/buildings/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body,
      cookie
    });
  },

  async deleteBuilding(id, cookie) {
    return request(`/admin/buildings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      cookie
    });
  },

  async listUsers(cookie) {
    return request('/admin/users', { cookie });
  },

  async promoteUser(id, cookie) {
    return request(`/admin/users/${encodeURIComponent(id)}/promote`, {
      method: 'PATCH',
      cookie
    });
  },

  async banUser(id, cookie) {
    return request(`/admin/users/${encodeURIComponent(id)}/ban`, {
      method: 'PATCH',
      cookie
    });
  },

  async listReviews(cookie) {
    return request('/admin/reviews', { cookie });
  },

  async flagReview(id, cookie) {
    return request(`/admin/reviews/${encodeURIComponent(id)}/flag`, {
      method: 'PATCH',
      cookie
    });
  },

  async hideReview(id, cookie) {
    return request(`/admin/reviews/${encodeURIComponent(id)}/hide`, {
      method: 'PATCH',
      cookie
    });
  },

  async deleteReview(id, cookie) {
    return request(`/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      cookie
    });
  }
};

export function getPagePlaceholder({ title, routeGroup, description, pagePath, todoItems = [] }) {
  return {
    pageTitle: `${title} - LeaseWise NYC`,
    page: toPlaceholderPageModel({
      title,
      routeGroup,
      description,
      pagePath,
      todoItems
    }),
    scripts: ['/public/js/ajax-form.js', '/public/js/app.js']
  };
}

export function getApiPlaceholder({ feature, route, method }) {
  return {
    status: 'not_implemented',
    feature,
    route,
    method,
    message: 'This endpoint is not available yet.'
  };
}
