import { Router } from 'express';

import { renderFeaturePage } from './route-utils.js';

const router = Router();

router.get('/login', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Login',
    routeGroup: 'Authentication',
    pagePath: req.path,
    description: 'This page is a placeholder for account sign-in.',
    todoItems: [
      'Users will be able to sign in with their registered email and password.',
      'Validation, error handling, and password recovery links will appear here.',
      'Successful sign-in will return users to their intended destination.'
    ]
  });
});

router.get('/register', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Register',
    routeGroup: 'Authentication',
    pagePath: req.path,
    description: 'This page is a placeholder for account registration.',
    todoItems: [
      'New users will be able to create an account here.',
      'Required profile fields and password rules will be presented here.',
      'Submission feedback and account verification steps will appear here.'
    ]
  });
});

export default router;
