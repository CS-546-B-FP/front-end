const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[A-Za-z0-9._-]+$/;
const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

export const VALIDATION_LIMITS = Object.freeze({
  emailMaxLength: 254,
  usernameMinLength: 3,
  usernameMaxLength: 24,
  passwordMinLength: 8,
  passwordMaxLength: 128,
  nameMaxLength: 50,
  ratingMin: 1,
  ratingMax: 5,
  noteMaxLength: 1000,
  reviewTextMaxLength: 2000,
  textMaxLength: 5000
});

export const VALIDATION_HINTS = Object.freeze({
  username: Object.freeze([
    `Use ${VALIDATION_LIMITS.usernameMinLength}-${VALIDATION_LIMITS.usernameMaxLength} characters.`,
    'Letters, numbers, periods, underscores, and hyphens are allowed.',
    'Spaces are not allowed.'
  ]),
  password: Object.freeze([
    `Use ${VALIDATION_LIMITS.passwordMinLength}-${VALIDATION_LIMITS.passwordMaxLength} characters.`,
    'Include at least one uppercase letter.',
    'Include at least one lowercase letter.',
    'Include at least one number.',
    'Include at least one special character.',
    'Spaces are not allowed.'
  ]),
  confirmPassword: Object.freeze(['Must match the password exactly.']),
  rating: Object.freeze([
    `Choose a rating from ${VALIDATION_LIMITS.ratingMin} to ${VALIDATION_LIMITS.ratingMax}.`
  ]),
  note: Object.freeze([
    `Use ${VALIDATION_LIMITS.noteMaxLength} characters or fewer.`
  ])
});

export class ValidationError extends Error {
  constructor(message, { field = 'form', label = 'Field', code = 'invalid', value } = {}) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.label = label;
    this.code = code;
    this.value = value;
  }
}

export function isValidationError(error) {
  return error instanceof ValidationError;
}

export function humanizeFieldName(field = 'value') {
  return String(field)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function makeValidationError(message, options = {}) {
  return new ValidationError(message, options);
}

function getFieldLabel(field, label) {
  return label || humanizeFieldName(field);
}

function normalizeScalarValue(value) {
  if (Array.isArray(value)) {
    return value.length ? normalizeScalarValue(value[value.length - 1]) : '';
  }

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  throw new TypeError('Validation values must be strings, numbers, booleans, null, or undefined.');
}

export function normalizeTextInput(value, { trim = true } = {}) {
  const normalized = normalizeScalarValue(value);
  return trim ? normalized.trim() : normalized;
}

export function validateRequiredString(
  value,
  {
    field = 'value',
    label,
    trim = true,
    minLength = 1,
    maxLength = VALIDATION_LIMITS.textMaxLength,
    pattern,
    patternMessage
  } = {}
) {
  const resolvedLabel = getFieldLabel(field, label);
  const normalized = normalizeTextInput(value, { trim });

  if (normalized.length === 0) {
    throw makeValidationError(`${resolvedLabel} is required.`, {
      field,
      label: resolvedLabel,
      code: 'required',
      value: normalized
    });
  }

  if (normalized.length < minLength) {
    throw makeValidationError(
      `${resolvedLabel} must be at least ${minLength} character${minLength === 1 ? '' : 's'} long.`,
      {
        field,
        label: resolvedLabel,
        code: 'too_short',
        value: normalized
      }
    );
  }

  if (normalized.length > maxLength) {
    throw makeValidationError(`${resolvedLabel} must be ${maxLength} characters or fewer.`, {
      field,
      label: resolvedLabel,
      code: 'too_long',
      value: normalized
    });
  }

  if (pattern && !pattern.test(normalized)) {
    throw makeValidationError(patternMessage || `${resolvedLabel} is invalid.`, {
      field,
      label: resolvedLabel,
      code: 'invalid_format',
      value: normalized
    });
  }

  return normalized;
}

export function validateOptionalString(
  value,
  {
    field = 'value',
    label,
    trim = true,
    maxLength = VALIDATION_LIMITS.textMaxLength,
    pattern,
    patternMessage,
    emptyValue = ''
  } = {}
) {
  const normalized = normalizeTextInput(value, { trim });

  if (normalized.length === 0) {
    return emptyValue;
  }

  return validateRequiredString(normalized, {
    field,
    label,
    trim: false,
    minLength: 1,
    maxLength,
    pattern,
    patternMessage
  });
}

export function validateName(
  value,
  { field = 'name', label, maxLength = VALIDATION_LIMITS.nameMaxLength } = {}
) {
  return validateRequiredString(value, {
    field,
    label,
    maxLength,
    pattern: NAME_REGEX,
    patternMessage: `${getFieldLabel(field, label)} can only include letters, spaces, apostrophes, periods, and hyphens.`
  });
}

export function validateEmail(
  value,
  { field = 'email', label, maxLength = VALIDATION_LIMITS.emailMaxLength } = {}
) {
  const resolvedLabel = getFieldLabel(field, label);
  const normalized = validateRequiredString(value, {
    field,
    label: resolvedLabel,
    maxLength
  }).toLowerCase();

  if (!EMAIL_REGEX.test(normalized)) {
    throw makeValidationError(`${resolvedLabel} must be a valid email address.`, {
      field,
      label: resolvedLabel,
      code: 'invalid_email',
      value: normalized
    });
  }

  return normalized;
}

export function validateUsername(
  value,
  {
    field = 'username',
    label,
    minLength = VALIDATION_LIMITS.usernameMinLength,
    maxLength = VALIDATION_LIMITS.usernameMaxLength
  } = {}
) {
  const resolvedLabel = getFieldLabel(field, label);
  const normalized = validateRequiredString(value, {
    field,
    label: resolvedLabel,
    minLength,
    maxLength
  });

  if (!USERNAME_REGEX.test(normalized) || normalized.startsWith('.') || normalized.endsWith('.')) {
    throw makeValidationError(
      `${resolvedLabel} can only use letters, numbers, periods, underscores, and hyphens.`,
      {
        field,
        label: resolvedLabel,
        code: 'invalid_username',
        value: normalized
      }
    );
  }

  return normalized;
}

export function validatePassword(
  value,
  {
    field = 'password',
    label,
    minLength = VALIDATION_LIMITS.passwordMinLength,
    maxLength = VALIDATION_LIMITS.passwordMaxLength,
    allowSpaces = false,
    requireLowercase = true,
    requireUppercase = true,
    requireNumber = true,
    requireSpecial = true
  } = {}
) {
  const resolvedLabel = getFieldLabel(field, label);
  const normalized = validateRequiredString(value, {
    field,
    label: resolvedLabel,
    trim: false,
    minLength,
    maxLength
  });

  if (!allowSpaces && /\s/.test(normalized)) {
    throw makeValidationError(`${resolvedLabel} cannot contain spaces.`, {
      field,
      label: resolvedLabel,
      code: 'password_spaces',
      value: normalized
    });
  }

  if (requireLowercase && !/[a-z]/.test(normalized)) {
    throw makeValidationError(`${resolvedLabel} must include at least one lowercase letter.`, {
      field,
      label: resolvedLabel,
      code: 'password_lowercase',
      value: normalized
    });
  }

  if (requireUppercase && !/[A-Z]/.test(normalized)) {
    throw makeValidationError(`${resolvedLabel} must include at least one uppercase letter.`, {
      field,
      label: resolvedLabel,
      code: 'password_uppercase',
      value: normalized
    });
  }

  if (requireNumber && !/[0-9]/.test(normalized)) {
    throw makeValidationError(`${resolvedLabel} must include at least one number.`, {
      field,
      label: resolvedLabel,
      code: 'password_number',
      value: normalized
    });
  }

  if (requireSpecial && !/[^A-Za-z0-9]/.test(normalized)) {
    throw makeValidationError(`${resolvedLabel} must include at least one special character.`, {
      field,
      label: resolvedLabel,
      code: 'password_special',
      value: normalized
    });
  }

  return normalized;
}

export function validatePasswordConfirmation(
  password,
  confirmation,
  { field = 'confirmPassword', label = 'Confirm password' } = {}
) {
  const resolvedLabel = getFieldLabel(field, label);
  const normalizedConfirmation = validateRequiredString(confirmation, {
    field,
    label: resolvedLabel,
    trim: false,
    minLength: 1,
    maxLength: VALIDATION_LIMITS.passwordMaxLength
  });

  if (password !== normalizedConfirmation) {
    throw makeValidationError(`${resolvedLabel} must match Password.`, {
      field,
      label: resolvedLabel,
      code: 'password_mismatch',
      value: normalizedConfirmation
    });
  }

  return normalizedConfirmation;
}

export function validateRating(
  value,
  {
    field = 'rating',
    label,
    min = VALIDATION_LIMITS.ratingMin,
    max = VALIDATION_LIMITS.ratingMax
  } = {}
) {
  const resolvedLabel = getFieldLabel(field, label);
  const normalized = normalizeTextInput(value);

  if (normalized.length === 0) {
    throw makeValidationError(`${resolvedLabel} is required.`, {
      field,
      label: resolvedLabel,
      code: 'required',
      value: normalized
    });
  }

  if (!/^-?\d+$/.test(normalized)) {
    throw makeValidationError(`${resolvedLabel} must be a whole number.`, {
      field,
      label: resolvedLabel,
      code: 'invalid_number',
      value: normalized
    });
  }

  const rating = Number(normalized);

  if (rating < min || rating > max) {
    throw makeValidationError(`${resolvedLabel} must be between ${min} and ${max}.`, {
      field,
      label: resolvedLabel,
      code: 'out_of_range',
      value: normalized
    });
  }

  return rating;
}

export function validateNoteLength(
  value,
  {
    field = 'note',
    label,
    maxLength = VALIDATION_LIMITS.noteMaxLength,
    emptyValue = ''
  } = {}
) {
  return validateOptionalString(value, {
    field,
    label,
    maxLength,
    emptyValue
  });
}

export function validateReviewText(
  value,
  {
    field = 'reviewText',
    label = 'Review',
    maxLength = VALIDATION_LIMITS.reviewTextMaxLength
  } = {}
) {
  return validateRequiredString(value, {
    field,
    label,
    maxLength
  });
}

export function composeValidators(...validators) {
  return (value, context) => validators.reduce((currentValue, validator) => validator(currentValue, context), value);
}

function appendFormValue(target, key, value) {
  if (!Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = value;
    return;
  }

  if (Array.isArray(target[key])) {
    target[key].push(value);
    return;
  }

  target[key] = [target[key], value];
}

export function getFormValues(source) {
  if (!source) {
    return {};
  }

  if (typeof HTMLFormElement !== 'undefined' && source instanceof HTMLFormElement) {
    return getFormValues(new FormData(source));
  }

  if (
    typeof FormData !== 'undefined' &&
    source instanceof FormData
  ) {
    const values = {};
    for (const [key, value] of source.entries()) {
      appendFormValue(values, key, value);
    }
    return values;
  }

  if (
    typeof URLSearchParams !== 'undefined' &&
    source instanceof URLSearchParams
  ) {
    const values = {};
    for (const [key, value] of source.entries()) {
      appendFormValue(values, key, value);
    }
    return values;
  }

  if (source instanceof Map) {
    const values = {};
    for (const [key, value] of source.entries()) {
      appendFormValue(values, key, value);
    }
    return values;
  }

  if (typeof source === 'object' && !Array.isArray(source)) {
    return { ...source };
  }

  throw new TypeError('Form values must be provided as an object, FormData, URLSearchParams, Map, or HTMLFormElement.');
}

function getSchemaValidators(schemaEntry) {
  if (typeof schemaEntry === 'function') {
    return [schemaEntry];
  }

  if (Array.isArray(schemaEntry)) {
    return schemaEntry;
  }

  if (schemaEntry && typeof schemaEntry === 'object') {
    if (typeof schemaEntry.validate === 'function') {
      return [schemaEntry.validate];
    }

    if (Array.isArray(schemaEntry.validators)) {
      return schemaEntry.validators;
    }
  }

  throw new TypeError('Each validation schema entry must be a validator function, an array of validator functions, or an object with validate/validators.');
}

function getSchemaLabel(field, schemaEntry) {
  if (schemaEntry && typeof schemaEntry === 'object' && !Array.isArray(schemaEntry)) {
    return schemaEntry.label || humanizeFieldName(field);
  }

  return humanizeFieldName(field);
}

function normalizeValidationError(error, { field, label, value }) {
  if (error instanceof ValidationError) {
    return error;
  }

  if (typeof error === 'string') {
    return new ValidationError(error, { field, label, code: 'invalid', value });
  }

  if (error instanceof Error) {
    return new ValidationError(error.message || `${label} is invalid.`, {
      field,
      label,
      code: error.code || 'invalid',
      value
    });
  }

  return new ValidationError(`${label} is invalid.`, {
    field,
    label,
    code: 'invalid',
    value
  });
}

export function validateField(value, validator, context = {}) {
  const validators = getSchemaValidators(validator);
  return validators.reduce(
    (currentValue, currentValidator) => currentValidator(currentValue, context),
    value
  );
}

export function validateForm(source, schema) {
  const rawValues = getFormValues(source);
  const values = {};
  const errors = {};

  for (const [field, schemaEntry] of Object.entries(schema)) {
    const label = getSchemaLabel(field, schemaEntry);
    const fieldValue = rawValues[field];

    try {
      values[field] = validateField(fieldValue, schemaEntry, {
        field,
        label,
        rawValues,
        values,
        errors
      });
    } catch (error) {
      errors[field] = normalizeValidationError(error, {
        field,
        label,
        value: fieldValue
      });
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    values,
    errors,
    firstErrorField: Object.keys(errors)[0] || null,
    errorList: Object.values(errors)
  };
}

export function hasValidationErrors(resultOrErrors) {
  if (!resultOrErrors) {
    return false;
  }

  if (resultOrErrors.errors && typeof resultOrErrors.errors === 'object') {
    return Object.keys(resultOrErrors.errors).length > 0;
  }

  return Object.keys(resultOrErrors).length > 0;
}

export function getFieldError(validationResult, field) {
  return validationResult?.errors?.[field] || null;
}

export function getErrorSummaryItems(validationResult, { fieldIdPrefix = '' } = {}) {
  if (!validationResult?.errorList) {
    return [];
  }

  return validationResult.errorList.map((error) => ({
    field: error.field,
    label: error.label,
    message: error.message,
    code: error.code,
    targetId: `${fieldIdPrefix}${error.field}`
  }));
}

export function getFieldValidationState(
  validationResult,
  field,
  { hintId, errorId = `${field}-error`, describedBy = [] } = {}
) {
  const error = getFieldError(validationResult, field);
  const describedByIds = [...describedBy];

  if (hintId) {
    describedByIds.push(hintId);
  }

  if (error) {
    describedByIds.push(errorId);
  }

  return {
    error,
    errorId,
    errorMessage: error?.message || '',
    invalid: Boolean(error),
    ariaInvalid: error ? 'true' : 'false',
    ariaDescribedBy: describedByIds.join(' ').trim()
  };
}

const validateLoginPassword = (value) =>
  validatePassword(value, {
    field: 'password',
    label: 'Password',
    minLength: 1,
    requireLowercase: false,
    requireUppercase: false,
    requireNumber: false,
    requireSpecial: false
  });

export const authValidationSchemas = Object.freeze({
  login: {
    username: (value) => validateUsername(value, { field: 'username', label: 'Username' }),
    password: validateLoginPassword
  },
  register: {
    firstName: (value) => validateName(value, { field: 'firstName', label: 'First name' }),
    lastName: (value) => validateName(value, { field: 'lastName', label: 'Last name' }),
    email: (value) => validateEmail(value, { field: 'email', label: 'Email' }),
    username: (value) => validateUsername(value, { field: 'username', label: 'Username' }),
    password: (value) => validatePassword(value, { field: 'password', label: 'Password' }),
    confirmPassword: (value, context) =>
      validatePasswordConfirmation(context.values.password ?? context.rawValues.password, value, {
        field: 'confirmPassword',
        label: 'Confirm password'
      })
  }
});

export const profileValidationSchema = Object.freeze({
  firstName: (value) => validateName(value, { field: 'firstName', label: 'First name' }),
  lastName: (value) => validateName(value, { field: 'lastName', label: 'Last name' }),
  email: (value) => validateEmail(value, { field: 'email', label: 'Email' }),
  username: (value) => validateUsername(value, { field: 'username', label: 'Username' })
});

export const reviewValidationSchema = Object.freeze({
  reviewText: (value) => validateReviewText(value, { field: 'reviewText', label: 'Review' }),
  rating: (value) => validateRating(value, { field: 'rating', label: 'Rating' })
});

export const shortlistNoteValidationSchema = Object.freeze({
  privateNote: (value) => validateNoteLength(value, { field: 'privateNote', label: 'Private note' })
});
