export class NotImplementedError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotImplementedError";
    this.status = 501;
  }
}

export function getUserFriendlyApiError(
  result,
  fallbackMessage = "Something went wrong. Please try again.",
) {
  if (!result) return fallbackMessage;

  if (result.status === 0) {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  if (result.status === 401) {
    return "Invalid username or password.";
  }

  if (result.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (result.status === 404) {
    return "The requested information could not be found.";
  }

  if (result.status >= 500) {
    return "The server is temporarily unavailable. Please try again later.";
  }

  return result.error || result.message || fallbackMessage;
}

export function getUnexpectedErrorMessage() {
  return "An unexpected error occurred. Please try again.";
}
