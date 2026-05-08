(function () {
  function setMessage(element, message) {
    if (!element) return;
    element.textContent = message || "";
    element.hidden = !message;
  }

  function setSubmitLoading(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.textContent = "Submitting...";
      button.disabled = true;
      return;
    }

    button.disabled = false;
    button.textContent = button.dataset.originalText || "Submit";
    delete button.dataset.originalText;
  }

  document.addEventListener("submit", async (e) => {
    const form = e.target.closest("form[data-review-form]");
    if (!form || form.method.toUpperCase() !== "POST") return;

    const action = form.getAttribute("action") || "";
    const match = action.match(/\/buildings\/([^/]+)\/reviews/);
    if (!match) return;

    e.preventDefault();

    const errorBox = form.querySelector("[data-review-error]");
    const successBox = form.querySelector("[data-review-success]");
    const submitBtn = form.querySelector('button[type="submit"]');

    setMessage(errorBox, "");
    setMessage(successBox, "");

    const buildingId = match[1];
    const formData = new FormData(form);
    const reviewText = String(
      formData.get("text") || formData.get("reviewText") || "",
    ).trim();
    const rating = Number(formData.get("rating"));

    if (!reviewText) {
      setMessage(errorBox, "Review text is required.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage(errorBox, "Rating must be between 1 and 5.");
      return;
    }

    setSubmitLoading(submitBtn, true);

    try {
      const res = await fetch(
        `/api/buildings/${encodeURIComponent(buildingId)}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewText,
            rating,
            issueTags: formData.getAll("issueTags"),
          }),
        },
      );

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success !== false) {
        submitBtn.disabled = true;
        window.location.reload();
        return;
      }

      setMessage(errorBox, data?.error || "Failed to submit review.");
    } catch {
      setMessage(errorBox, "Unable to submit review. Please try again.");
    } finally {
      setSubmitLoading(submitBtn, false);
    }
  });
})();
