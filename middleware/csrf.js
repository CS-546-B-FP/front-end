import crypto from 'crypto';

const CSRF_TOKEN_BYTES = 32;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_ERROR_MESSAGE = 'Invalid CSRF token. Please refresh the page and try again.';

export const CSRF_FIELD_NAME = '_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

const createCsrfToken = () => crypto.randomBytes(CSRF_TOKEN_BYTES).toString('hex');

const getSessionToken = (req) => {
  if (!req.session) {
    return '';
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = createCsrfToken();
  }

  return req.session.csrfToken;
};

const getRequestToken = (req) =>
  req.get(CSRF_HEADER_NAME) ||
  req.get('csrf-token') ||
  req.body?.[CSRF_FIELD_NAME] ||
  '';

const tokensMatch = (expected, received) => {
  if (typeof expected !== 'string' || typeof received !== 'string') {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

const wantsJson = (req) =>
  req.path.startsWith('/api/') ||
  req.get('accept')?.includes('application/json') ||
  req.get('content-type')?.includes('application/json');

const rejectCsrfRequest = (req, res) => {
  if (wantsJson(req)) {
    return res.status(403).json({ success: false, error: CSRF_ERROR_MESSAGE });
  }

  return res.status(403).render('errors/403', {
    pageTitle: 'Forbidden - LeaseWise NYC'
  });
};

export function attachCsrfToken(req, res, next) {
  res.locals.csrfToken = getSessionToken(req);
  return next();
}

export function validateCsrfToken(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const expectedToken = getSessionToken(req);
  const requestToken = getRequestToken(req);

  if (!tokensMatch(expectedToken, requestToken)) {
    return rejectCsrfRequest(req, res);
  }

  return next();
}
