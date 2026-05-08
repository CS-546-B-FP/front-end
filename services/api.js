const BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

async function request(path, { method = "GET", body, cookie } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookie) headers["Cookie"] = cookie;

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const setCookie = res.headers.get("set-cookie") || "";
    const payload = await res.json().catch(() => null);

    return {
      ok: res.ok,
      status: res.status,
      data: payload?.data ?? null,
      error:
        payload?.error || (!res.ok ? `${res.status} ${res.statusText}` : ""),
      setCookie,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Unable to connect to the backend server. Please try again later.",
      setCookie: "",
    };
  }
}

export const auth = {
  async login(username, password) {
    return request("/auth/login", {
      method: "POST",
      body: { username, password },
    });
  },
  async register({ firstName, lastName, email, username, password }) {
    return request("/auth/register", {
      method: "POST",
      body: { firstName, lastName, email, username, password },
    });
  },
  async logout(cookie) {
    return request("/auth/logout", { method: "POST", cookie });
  },
};

export const buildings = {
  async list({ search, borough, page, limit } = {}) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (borough) params.set("borough", borough);
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    return request(`/buildings${qs ? `?${qs}` : ""}`);
  },
  async getById(id) {
    return request(`/buildings/${encodeURIComponent(id)}`);
  },
  async getByOwner(ownerName) {
    return request(`/portfolios/${encodeURIComponent(ownerName)}`);
  },
};

export const reviews = {
  async getForBuilding(buildingId) {
    return request(`/buildings/${encodeURIComponent(buildingId)}/reviews`);
  },
  async create(buildingId, { reviewText, rating, issueTags }, cookie) {
    return request(`/buildings/${encodeURIComponent(buildingId)}/reviews`, {
      method: "POST",
      body: { reviewText, rating: Number(rating), issueTags },
      cookie,
    });
  },
  async update(reviewId, { reviewText, rating, issueTags }, cookie) {
    return request(`/reviews/${encodeURIComponent(reviewId)}`, {
      method: "PUT",
      body: { reviewText, rating: Number(rating), issueTags },
      cookie,
    });
  },
  async remove(reviewId, cookie) {
    return request(`/reviews/${encodeURIComponent(reviewId)}`, {
      method: "DELETE",
      cookie,
    });
  },
};

export const watchlist = {
  async toggle(buildingId, cookie) {
    return request("/watchlist/toggle", {
      method: "POST",
      body: { buildingId },
      cookie,
    });
  },
};

export const shortlists = {
  async list(cookie) {
    return request("/shortlists", { cookie });
  },
  async create(shortlistName, cookie) {
    return request("/shortlists", {
      method: "POST",
      body: { shortlistName },
      cookie,
    });
  },
  async remove(id, cookie) {
    return request(`/shortlists/${encodeURIComponent(id)}`, {
      method: "DELETE",
      cookie,
    });
  },
  async addItem(shortlistId, buildingId, cookie) {
    return request(`/shortlists/${encodeURIComponent(shortlistId)}/items`, {
      method: "POST",
      body: { buildingId },
      cookie,
    });
  },
  async removeItem(shortlistId, buildingId, cookie) {
    return request(
      `/shortlists/${encodeURIComponent(shortlistId)}/items/${encodeURIComponent(buildingId)}`,
      { method: "DELETE", cookie },
    );
  },
  async updateNote(shortlistId, buildingId, privateNote, cookie) {
    return request(
      `/shortlists/${encodeURIComponent(shortlistId)}/items/${encodeURIComponent(buildingId)}/note`,
      { method: "PATCH", body: { privateNote }, cookie },
    );
  },
};

export const users = {
  async getProfile(cookie) {
    return request("/users/me", { cookie });
  },
  async updateProfile({ firstName, lastName, email, username }, cookie) {
    return request("/users/me", {
      method: "PUT",
      body: { firstName, lastName, email, username },
      cookie,
    });
  },
  async changePassword({ currentPassword, newPassword }, cookie) {
    return request("/users/me/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
      cookie,
    });
  },
  async deleteAccount(cookie) {
    return request("/users/me", { method: "DELETE", cookie });
  },
};

export const admin = {
  async createBuilding(body, cookie) {
    return request("/admin/buildings", { method: "POST", body, cookie });
  },
  async updateBuilding(id, body, cookie) {
    return request(`/admin/buildings/${encodeURIComponent(id)}`, {
      method: "PUT",
      body,
      cookie,
    });
  },
  async deleteBuilding(id, cookie) {
    return request(`/admin/buildings/${encodeURIComponent(id)}`, {
      method: "DELETE",
      cookie,
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
  },
};
