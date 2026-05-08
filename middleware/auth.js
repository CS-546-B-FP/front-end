function getLoginRedirect(req) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return '/login';
  }

  const returnTo = req.originalUrl || req.url || '';
  if (!returnTo || returnTo === '/login') {
    return '/login';
  }

  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect(getLoginRedirect(req));
  }
  return next();
}

export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect(getLoginRedirect(req));
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).render('errors/404', {
      pageTitle: 'Forbidden — LeaseWise NYC'
    });
  }
  return next();
}
