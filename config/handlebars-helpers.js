import { getTranslation } from '../utils/translate.js';

export function registerHandlebarsHelpers() {
  return {
    t(key, options) {
      const data = options?.data?.root || this;
      return getTranslation(data.messages, key, options?.hash?.fallback || key);
    },
    eq(left, right) {
      return left === right;
    },
    ne(left, right) {
      return left !== right;
    },
    isActivePath(currentPath, targetPath, mode = 'exact') {
      if (!currentPath || !targetPath) {
        return false;
      }

      if (mode === 'prefix') {
        return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
      }

      return currentPath === targetPath;
    }
  };
}
