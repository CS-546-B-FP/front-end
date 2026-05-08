(() => {
  document.documentElement.dataset.appMode = 'live';

  const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  const originalFetch = window.fetch?.bind(window);

  function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  }

  function isSameOriginRequest(input) {
    const requestUrl = input instanceof Request ? input.url : String(input);
    return new URL(requestUrl, window.location.href).origin === window.location.origin;
  }

  if (originalFetch) {
    window.fetch = function fetchWithCsrf(input, init = {}) {
      const method = String(init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const token = getCsrfToken();

      if (!unsafeMethods.has(method) || !token || !isSameOriginRequest(input)) {
        return originalFetch(input, init);
      }

      const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
      if (!headers.has('X-CSRF-Token')) {
        headers.set('X-CSRF-Token', token);
      }

      return originalFetch(input, { ...init, headers });
    };
  }
})();
