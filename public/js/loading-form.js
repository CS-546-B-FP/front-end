(() => {
  const forms = document.querySelectorAll("form[data-loading-form]");

  for (const form of forms) {
    form.addEventListener("submit", () => {
      const loadingText = form.dataset.loadingText || "Loading...";
      const buttons = form.querySelectorAll(
        'button[type="submit"], input[type="submit"]',
      );

      form.setAttribute("aria-busy", "true");

      for (const button of buttons) {
        if (button.tagName === "INPUT") {
          button.dataset.originalValue = button.value;
          button.value = loadingText;
        } else {
          button.dataset.originalText = button.textContent;
          button.textContent = loadingText;
        }

        button.disabled = true;
      }
    });
  }
})();
