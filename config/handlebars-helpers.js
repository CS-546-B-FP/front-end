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
    },
    concat(...args) {
      const options = args.pop();
      return args.join('');
    },
    isWatched(buildingId, watchlistIds) {
      if (!buildingId || !Array.isArray(watchlistIds)) {
        return false;
      }
      return watchlistIds.some(id => String(id) === String(buildingId));
    },
    canDeleteReview(review, currentUser) {
      if (!review || !currentUser) {
        return false;
      }
      return String(review.userId) === String(currentUser._id);
    },
    times(n, options) {
      let out = '';
      for (let i = 0; i < n; i++) {
        out += options.fn(i);
      }
      return out;
    },
    timesFrom(from, to, options) {
      let out = '';
      for (let i = from; i < to; i++) {
        out += options.fn(i);
      }
      return out;
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    queryString(query, options) {
      const base = query && typeof query === 'object' ? { ...query } : {};
      const overrides = options?.hash || {};
      for (const [key, value] of Object.entries(overrides)) {
        if (value !== undefined && value !== null && value !== '') {
          base[key] = value;
        } else if (value === '') {
          delete base[key];
        }
      }
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(base)) {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, Array.isArray(value) ? value[0] : String(value));
        }
      }
      return params.toString();
    }
  };
}
