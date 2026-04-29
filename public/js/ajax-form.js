(() => {
  const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';
  const DEFAULT_SUCCESS_MESSAGE = 'Saved successfully.';
  const DEFAULT_LOADING_TEXT = 'Saving...';
  const JSON_CONTENT_TYPE = 'application/json';

  function isForm(value) {
    return value && value.tagName === 'FORM';
  }

  function getSubmitButtons(form) {
    return Array.from(form.querySelectorAll('button:not([type]), button[type="submit"], input[type="submit"]'));
  }

  function getMessageTarget(form, dataKey, fallbackSelector) {
    const selector = form.dataset[dataKey];

    if (selector) {
      return form.querySelector(selector) || document.querySelector(selector);
    }

    return form.querySelector(fallbackSelector);
  }

  function writeMessage(element, message) {
    if (!element) {
      return;
    }

    element.textContent = message || '';
    element.hidden = !message;
  }

  function announce(form, message) {
    const statusElement = (form.ownerDocument || document).getElementById('global-status');

    if (statusElement) {
      statusElement.textContent = message || '';
    }
  }

  function setButtonLoading(button, isLoading, loadingText) {
    if (!button.dataset.ajaxOriginalDisabled) {
      button.dataset.ajaxOriginalDisabled = button.disabled ? 'true' : 'false';
    }

    if (button.tagName === 'INPUT') {
      if (!button.dataset.ajaxOriginalValue) {
        button.dataset.ajaxOriginalValue = button.value;
      }

      button.value = isLoading ? loadingText : button.dataset.ajaxOriginalValue;
    } else {
      if (!button.dataset.ajaxOriginalText) {
        button.dataset.ajaxOriginalText = button.textContent;
      }

      button.textContent = isLoading ? loadingText : button.dataset.ajaxOriginalText;
    }

    button.disabled = isLoading || button.dataset.ajaxOriginalDisabled === 'true';

    if (!isLoading) {
      delete button.dataset.ajaxOriginalDisabled;
      delete button.dataset.ajaxOriginalText;
      delete button.dataset.ajaxOriginalValue;
    }
  }

  function setFormLoading(form, isLoading, loadingText = DEFAULT_LOADING_TEXT) {
    form.setAttribute('aria-busy', isLoading ? 'true' : 'false');

    for (const button of getSubmitButtons(form)) {
      setButtonLoading(button, isLoading, loadingText);
    }
  }

  function serializeForm(form) {
    const values = {};
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        values[key] = Array.isArray(values[key]) ? values[key].concat(value) : [values[key], value];
      } else {
        values[key] = value;
      }
    }

    return values;
  }

  function clearFieldErrors(form) {
    for (const element of form.querySelectorAll('[data-field-error], [data-error-for]')) {
      writeMessage(element, '');
    }

    for (const field of form.querySelectorAll('[aria-invalid="true"]')) {
      field.removeAttribute('aria-invalid');
    }
  }

  function clearFormFeedback(form) {
    writeMessage(getMessageTarget(form, 'ajaxErrorTarget', '[data-ajax-error]'), '');
    writeMessage(getMessageTarget(form, 'ajaxSuccessTarget', '[data-ajax-success]'), '');
    clearFieldErrors(form);
    announce(form, '');
  }

  function normalizeFieldErrors(errors) {
    if (!errors || typeof errors !== 'object') {
      return [];
    }

    if (Array.isArray(errors)) {
      return errors
        .map((error) => ({
          field: error.field || error.name,
          message: error.message || error.error || ''
        }))
        .filter((error) => error.field && error.message);
    }

    return Object.entries(errors)
      .map(([field, message]) => ({
        field,
        message: Array.isArray(message) ? message.join(' ') : String(message)
      }))
      .filter((error) => error.field && error.message);
  }

  function findFieldErrorElement(form, field) {
    return Array.from(form.querySelectorAll('[data-field-error], [data-error-for]')).find(
      (element) => element.dataset.fieldError === field || element.dataset.errorFor === field
    );
  }

  function markFieldInvalid(form, fieldName) {
    const field = form.elements[fieldName];

    if (field && typeof field.setAttribute === 'function') {
      field.setAttribute('aria-invalid', 'true');
      return;
    }

    if (field && typeof field.length === 'number') {
      for (const fieldOption of Array.from(field)) {
        fieldOption.setAttribute('aria-invalid', 'true');
      }
    }
  }

  function renderFieldErrors(form, errors) {
    for (const error of normalizeFieldErrors(errors)) {
      markFieldInvalid(form, error.field);
      writeMessage(findFieldErrorElement(form, error.field), error.message);
    }
  }

  async function parseJsonSafely(response) {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      return {
        success: false,
        error: 'The server returned an invalid JSON response.'
      };
    }
  }

  function normalizeAjaxResponse(response, payload) {
    const success = response.ok && payload?.success !== false;
    const fallbackMessage = response.statusText || DEFAULT_ERROR_MESSAGE;
    const message = payload?.message || payload?.error || (success ? DEFAULT_SUCCESS_MESSAGE : fallbackMessage);

    return {
      success,
      status: response.status,
      data: payload?.data ?? (success ? payload : null),
      error: success ? null : message,
      fieldErrors: payload?.fieldErrors || payload?.errors || null,
      message,
      response,
      payload
    };
  }

  function buildRequestUrl(url, payload) {
    const requestUrl = new URL(url, window.location.href);

    for (const [key, value] of Object.entries(payload)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          requestUrl.searchParams.append(key, item);
        }
      } else {
        requestUrl.searchParams.set(key, value);
      }
    }

    return requestUrl.toString();
  }

  async function submitAjaxForm(form, options = {}) {
    if (!isForm(form)) {
      throw new TypeError('submitAjaxForm expects a form element.');
    }

    const method = String(options.method || form.method || 'POST').toUpperCase();
    const loadingText = options.loadingText || form.dataset.loadingText || DEFAULT_LOADING_TEXT;
    const payload = options.getPayload ? options.getPayload(form) : serializeForm(form);
    const url = options.url || form.action || window.location.href;
    const requestUrl = method === 'GET' ? buildRequestUrl(url, payload) : url;
    const headers = {
      Accept: JSON_CONTENT_TYPE,
      ...(method === 'GET' ? {} : { 'Content-Type': JSON_CONTENT_TYPE }),
      ...(options.headers || {})
    };

    clearFormFeedback(form);
    setFormLoading(form, true, loadingText);

    try {
      const response = await (options.fetchImpl || window.fetch)(requestUrl, {
        method,
        headers,
        credentials: options.credentials || 'same-origin',
        body: method === 'GET' ? undefined : JSON.stringify(payload)
      });
      const result = normalizeAjaxResponse(response, await parseJsonSafely(response));

      if (!result.success) {
        renderFieldErrors(form, result.fieldErrors);
        writeMessage(getMessageTarget(form, 'ajaxErrorTarget', '[data-ajax-error]'), result.error);
        announce(form, result.error);
        options.onError?.(result, form);
        return result;
      }

      writeMessage(getMessageTarget(form, 'ajaxSuccessTarget', '[data-ajax-success]'), result.message);
      announce(form, result.message || DEFAULT_SUCCESS_MESSAGE);

      if (options.resetOnSuccess || form.dataset.ajaxReset === 'true') {
        form.reset();
      }

      options.onSuccess?.(result, form);
      return result;
    } catch (error) {
      const result = {
        success: false,
        status: 0,
        data: null,
        error: error.message || DEFAULT_ERROR_MESSAGE,
        fieldErrors: null,
        message: error.message || DEFAULT_ERROR_MESSAGE,
        response: null,
        payload: null
      };

      writeMessage(getMessageTarget(form, 'ajaxErrorTarget', '[data-ajax-error]'), result.error);
      announce(form, result.error);
      options.onError?.(result, form);
      return result;
    } finally {
      setFormLoading(form, false, loadingText);
    }
  }

  function attachAjaxForm(form, options = {}) {
    if (!isForm(form)) {
      throw new TypeError('attachAjaxForm expects a form element.');
    }

    const handleSubmit = (event) => {
      event.preventDefault();
      submitAjaxForm(form, options);
    };

    form.addEventListener('submit', handleSubmit);

    return () => form.removeEventListener('submit', handleSubmit);
  }

  function attachAjaxForms(selector = 'form[data-ajax-form]', options = {}) {
    return Array.from(document.querySelectorAll(selector)).map((form) => attachAjaxForm(form, options));
  }

  window.LeaseWiseAjaxForms = Object.freeze({
    attachAjaxForm,
    attachAjaxForms,
    clearFormFeedback,
    normalizeAjaxResponse,
    parseJsonSafely,
    renderFieldErrors,
    serializeForm,
    setFormLoading,
    submitAjaxForm
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => attachAjaxForms(), { once: true });
  } else {
    attachAjaxForms();
  }
})();
