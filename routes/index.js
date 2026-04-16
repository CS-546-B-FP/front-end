import adminRoutes from './admin.js';
import apiRoutes from './api.js';
import authRoutes from './auth.js';
import siteRoutes from './site.js';
import userRoutes from './user.js';

import { renderNotFound, renderUnexpectedError } from './route-utils.js';

export default function registerRoutes(app) {
  app.use(siteRoutes);
  app.use(authRoutes);
  app.use(userRoutes);
  app.use(adminRoutes);
  app.use(apiRoutes);

  app.use((req, res) => {
    return renderNotFound(res);
  });

  app.use((error, req, res, next) => {
    return renderUnexpectedError(res, error);
  });
}
