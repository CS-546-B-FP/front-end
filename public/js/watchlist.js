(function () {
  function setStatusMessage(form, message) {
    let status = form.querySelector("[data-watchlist-error]");

    if (!status) {
      status = document.createElement("div");
      status.className = "error-message";
      status.setAttribute("role", "alert");
      status.dataset.watchlistError = "true";
      form.appendChild(status);
    }

    status.textContent = message || "";
    status.hidden = !message;
  }

  function updateButton(btn, watching) {
    btn.setAttribute("aria-pressed", String(watching));
    btn.dataset.watching = String(watching);
    btn.textContent = watching ? "Watching" : "Watch";
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".watchlist-btn");
    if (!btn) return;

    const form = btn.closest("form");
    if (!form) return;

    e.preventDefault();

    const action = form.getAttribute("action") || "";
    const match = action.match(/\/watchlist\/(.+)/);
    if (!match) return;

    const buildingId = match[1];
    const previousWatching =
      btn.dataset.watching === "true" ||
      btn.getAttribute("aria-pressed") === "true";

    const nextWatching = !previousWatching;

    setStatusMessage(form, "");
    updateButton(btn, nextWatching);
    btn.disabled = true;

    try {
      const res = await fetch("/api/watchlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildingId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        updateButton(btn, previousWatching);
        setStatusMessage(form, data?.error || "Failed to update watchlist.");
        return;
      }

      const watching = Boolean(data?.data?.watching);
      updateButton(btn, watching);
    } catch {
      updateButton(btn, previousWatching);
      setStatusMessage(form, "Unable to update watchlist. Please try again.");
    } finally {
      btn.disabled = false;
    }
  });
})();
