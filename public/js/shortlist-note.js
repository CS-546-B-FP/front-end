(function () {
  const DEFAULT_MAX_LENGTH = 1000;

  function getFormParts(form) {
    return {
      view: form.querySelector('[data-note-view]'),
      editor: form.querySelector('[data-note-editor]'),
      input: form.querySelector('[data-note-input]'),
      preview: form.querySelector('[data-note-preview]'),
      counter: form.querySelector('[data-note-counter]'),
      error: form.querySelector('[data-ajax-error]'),
      success: form.querySelector('[data-ajax-success]'),
      editButton: form.querySelector('[data-note-edit]')
    };
  }

  function getMaxLength(form) {
    const maxLength = Number(form.dataset.noteMaxLength);
    return Number.isInteger(maxLength) && maxLength > 0 ? maxLength : DEFAULT_MAX_LENGTH;
  }

  function getNoteValue(form) {
    return getFormParts(form).input?.value || '';
  }

  function setMessage(element, message) {
    if (!element) return;
    element.textContent = message || '';
    element.hidden = !message;
  }

  function clearFeedback(form) {
    const { error, success, input } = getFormParts(form);
    setMessage(error, '');
    setMessage(success, '');
    input?.removeAttribute('aria-invalid');
  }

  function updateCounter(form) {
    const { counter } = getFormParts(form);
    if (!counter) return;

    const maxLength = getMaxLength(form);
    const length = getNoteValue(form).length;
    counter.textContent = `${length} / ${maxLength}`;
    counter.classList.toggle('is-over-limit', length > maxLength);
  }

  function updatePreview(form, note) {
    const { preview } = getFormParts(form);
    if (!preview) return;

    const displayText = note.trim();
    preview.textContent = displayText || preview.dataset.emptyText || '';
    preview.classList.toggle('is-empty', !displayText);
  }

  function setEditorVisible(form, isVisible, { focus = false } = {}) {
    const { view, editor, input } = getFormParts(form);

    if (view) view.hidden = isVisible;
    if (editor) editor.hidden = !isVisible;

    if (isVisible) {
      updateCounter(form);
      if (focus) input?.focus();
    }
  }

  function resetEditor(form) {
    const { input } = getFormParts(form);
    if (!input) return;

    input.value = form.dataset.savedNote || '';
    clearFeedback(form);
    updateCounter(form);
  }

  function getValidationError(form) {
    const note = getNoteValue(form);
    const maxLength = getMaxLength(form);

    if (note.length > maxLength) {
      return form.dataset.noteTooLongMessage || `Private note must be ${maxLength} characters or fewer.`;
    }

    return '';
  }

  function renderValidationError(form, message) {
    const { error, input } = getFormParts(form);
    setMessage(error, message);

    if (message) {
      input?.setAttribute('aria-invalid', 'true');
    } else {
      input?.removeAttribute('aria-invalid');
    }
  }

  function getApiUrl(form) {
    const action = form.getAttribute('action') || '';
    const match = action.match(/\/shortlists\/([^/]+)\/items\/([^/]+)\/note/);

    if (!match) {
      return '';
    }

    return `/api/shortlists/${encodeURIComponent(match[1])}/items/${encodeURIComponent(match[2])}/note`;
  }

  async function fallbackSubmit(form, apiUrl, privateNote) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ privateNote })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success === false) {
        return {
          success: false,
          error: payload?.error || form.dataset.noteErrorMessage || 'Unable to save note.'
        };
      }

      return { success: true, data: payload?.data || { privateNote } };
    } catch {
      return {
        success: false,
        error: form.dataset.noteErrorMessage || 'Unable to save note.'
      };
    }
  }

  async function submitNote(form) {
    const apiUrl = getApiUrl(form);
    const privateNote = getNoteValue(form);
    const validationError = getValidationError(form);

    clearFeedback(form);

    if (!apiUrl) {
      form.submit();
      return;
    }

    if (validationError) {
      renderValidationError(form, validationError);
      return;
    }

    const ajax = window.LeaseWiseAjaxForms;
    const result = ajax?.submitAjaxForm
      ? await ajax.submitAjaxForm(form, {
          url: apiUrl,
          method: 'POST',
          loadingText: form.dataset.loadingText || 'Saving...',
          getPayload: () => ({ privateNote })
        })
      : await fallbackSubmit(form, apiUrl, privateNote);

    if (!result.success) {
      renderValidationError(form, result.error || form.dataset.noteErrorMessage || 'Unable to save note.');
      return;
    }

    const savedNote = result.data?.privateNote ?? privateNote;
    form.dataset.savedNote = savedNote;
    getFormParts(form).input.value = savedNote;
    updatePreview(form, savedNote);
    setMessage(getFormParts(form).success, form.dataset.noteSavedMessage || result.message || 'Note saved.');
    setEditorVisible(form, false);
  }

  function initNoteForm(form) {
    const { input, editButton } = getFormParts(form);

    form.dataset.savedNote = input?.value || '';
    updatePreview(form, form.dataset.savedNote);
    updateCounter(form);
    setEditorVisible(form, false);

    editButton?.addEventListener('click', () => {
      clearFeedback(form);
      setEditorVisible(form, true, { focus: true });
    });

    form.querySelector('[data-note-cancel]')?.addEventListener('click', () => {
      resetEditor(form);
      setEditorVisible(form, false);
    });

    input?.addEventListener('input', () => {
      updateCounter(form);
      if (!getValidationError(form)) {
        renderValidationError(form, '');
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitNote(form);
    });
  }

  function init() {
    document.querySelectorAll('[data-note-form]').forEach(initNoteForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
