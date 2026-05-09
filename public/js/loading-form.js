(() => {
  function getSubmitButtons(form) {
    return Array.from(
      form.querySelectorAll(
        'button:not([type]), button[type="submit"], input[type="submit"]',
      ),
    );
  }

  function setLoading(form, isLoading) {
    const loadingText = form.dataset.loadingText || "Loading...";
    const buttons = getSubmitButtons(form);

    form.setAttribute("aria-busy", isLoading ? "true" : "false");

    for (const button of buttons) {
      if (isLoading) {
        if (button.tagName === "INPUT") {
          button.dataset.originalValue = button.value;
          button.value = loadingText;
        } else {
          button.dataset.originalText = button.textContent;
          button.textContent = loadingText;
        }
        button.disabled = true;
      } else {
        if (button.tagName === "INPUT") {
          button.value = button.dataset.originalValue || button.value;
          delete button.dataset.originalValue;
        } else {
          button.textContent =
            button.dataset.originalText || button.textContent;
          delete button.dataset.originalText;
        }
        button.disabled = false;
      }
    }
  }

  function init() {
    const forms = document.querySelectorAll("form[data-loading-form]");

    for (const form of forms) {
      form.addEventListener("submit", (event) => {
        setTimeout(() => {
          if (event.defaultPrevented) return;
          setLoading(form, true);
        }, 0);
      });
    }

    window.addEventListener("pageshow", () => {
      for (const form of document.querySelectorAll("form[data-loading-form]")) {
        setLoading(form, false);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
