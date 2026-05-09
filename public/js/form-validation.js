(() => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernamePattern = /^[A-Za-z0-9._-]+$/;

  function getFormErrorBox(form) {
    let box = form.querySelector("[data-client-error]");

    if (!box) {
      box = document.createElement("div");
      box.className = "error-message";
      box.setAttribute("role", "alert");
      box.dataset.clientError = "true";
      form.prepend(box);
    }

    return box;
  }

  function showError(form, message) {
    const box = getFormErrorBox(form);
    box.textContent = message;
    box.hidden = false;
  }

  function clearError(form) {
    const box = form.querySelector("[data-client-error]");
    if (box) {
      box.textContent = "";
      box.hidden = true;
    }

    for (const field of form.querySelectorAll('[aria-invalid="true"]')) {
      field.removeAttribute("aria-invalid");
    }
  }

  function markInvalid(form, fieldName) {
    const field = form.elements[fieldName];
    if (field && typeof field.setAttribute === "function") {
      field.setAttribute("aria-invalid", "true");
    }
  }

  function requireValue(form, fieldName, label) {
    const value = String(form.elements[fieldName]?.value || "").trim();

    if (!value) {
      markInvalid(form, fieldName);
      throw new Error(`${label} is required.`);
    }

    return value;
  }

  function validateName(value, label) {
    if (value.length > 50) {
      throw new Error(`${label} must be 50 characters or fewer.`);
    }
  }

  function validateEmailValue(value) {
    if (value.length > 254 || !emailPattern.test(value)) {
      throw new Error("Email must be a valid email address.");
    }
  }

  function validateUsernameValue(value) {
    if (
      value.length < 3 ||
      value.length > 24 ||
      !usernamePattern.test(value) ||
      value.startsWith(".") ||
      value.endsWith(".")
    ) {
      throw new Error(
        "Username must be 3-24 characters and may only include letters, numbers, periods, underscores, and hyphens.",
      );
    }
  }

  function validateStrongPassword(value, label) {
    if (value.length < 8 || value.length > 128) {
      throw new Error(`${label} must be 8-128 characters.`);
    }

    if (/\s/.test(value)) {
      throw new Error(`${label} cannot contain spaces.`);
    }

    if (
      !/[a-z]/.test(value) ||
      !/[A-Z]/.test(value) ||
      !/[0-9]/.test(value) ||
      !/[^A-Za-z0-9]/.test(value)
    ) {
      throw new Error(
        `${label} must include uppercase, lowercase, number, and special character.`,
      );
    }
  }

  function validateProfileForm(form) {
    const firstName = requireValue(form, "firstName", "First name");
    const lastName = requireValue(form, "lastName", "Last name");
    const email = requireValue(form, "email", "Email");
    const username = requireValue(form, "username", "Username");

    validateName(firstName, "First name");
    validateName(lastName, "Last name");
    validateEmailValue(email);
    validateUsernameValue(username);
  }

  function validateRegisterForm(form) {
    validateProfileForm(form);

    const password = String(form.elements.password?.value || "");
    const confirmPassword = String(form.elements.confirmPassword?.value || "");

    if (!password) {
      markInvalid(form, "password");
      throw new Error("Password is required.");
    }

    validateStrongPassword(password, "Password");

    if (!confirmPassword) {
      markInvalid(form, "confirmPassword");
      throw new Error("Confirm password is required.");
    }

    if (password !== confirmPassword) {
      markInvalid(form, "confirmPassword");
      throw new Error("Confirm password must match Password.");
    }
  }

  function validatePasswordForm(form) {
    const currentPassword = String(form.elements.currentPassword?.value || "");
    const newPassword = String(form.elements.newPassword?.value || "");
    const confirmPassword = String(form.elements.confirmPassword?.value || "");

    if (!currentPassword) {
      markInvalid(form, "currentPassword");
      throw new Error("Current password is required.");
    }

    if (!newPassword) {
      markInvalid(form, "newPassword");
      throw new Error("New password is required.");
    }

    validateStrongPassword(newPassword, "New password");

    if (newPassword !== confirmPassword) {
      markInvalid(form, "confirmPassword");
      throw new Error("Confirm password must match New password.");
    }
  }

  function validateForm(form) {
    const validationType = form.dataset.validation;

    if (validationType === "register") {
      validateRegisterForm(form);
    }

    if (validationType === "profile") {
      validateProfileForm(form);
    }

    if (validationType === "password") {
      validatePasswordForm(form);
    }
  }

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-validation]");
    if (!form) return;

    clearError(form);

    try {
      validateForm(form);
    } catch (error) {
      event.preventDefault();
      showError(form, error.message || "Please check your input.");
    }
  });
  function validateFormRealtime(form) {
    clearError(form);

    try {
      validateForm(form);
    } catch (error) {
      showError(form, error.message || "Please check your input.");
    }
  }
  document.addEventListener(
    "blur",
    (event) => {
      const form = event.target.closest("form[data-validation]");
      if (!form || !form.querySelector("[data-client-error]:not([hidden])"))
        return;

      validateFormRealtime(form);
    },
    true,
  );

  document.addEventListener("input", (event) => {
    const form = event.target.closest("form[data-validation]");
    if (!form || !form.querySelector("[data-client-error]:not([hidden])"))
      return;

    validateFormRealtime(form);
  });

  document.addEventListener("change", (event) => {
    const form = event.target.closest("form[data-validation]");
    if (!form || !form.querySelector("[data-client-error]:not([hidden])"))
      return;

    validateFormRealtime(form);
  });
})();
