export function getTranslation(messages, key, fallback = '') {
  if (!messages || !key) {
    return fallback;
  }

  const parts = key.split('.');
  let current = messages;

  for (const part of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
      continue;
    }

    return fallback;
  }

  return typeof current === 'string' ? current : fallback;
}
