(() => {
  function openDialog(id) {
    const backdrop = document.getElementById(id);
    if (!backdrop) return;
    backdrop.classList.add('is-open');
    const focusable = backdrop.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
    backdrop._focusable = focusable;
    backdrop._returnFocus = document.activeElement;
  }

  function closeDialog(id) {
    const backdrop = document.getElementById(id);
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    if (backdrop._returnFocus) backdrop._returnFocus.focus();
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-dialog-trigger]');
    if (trigger) { openDialog(trigger.dataset.dialogTrigger); return; }
    const close = e.target.closest('[data-dialog-close]');
    if (close) { closeDialog(close.dataset.dialogClose); return; }
    if (e.target.classList.contains('dialog-backdrop')) closeDialog(e.target.id);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' && e.key !== 'Tab') return;
    const open = document.querySelector('.dialog-backdrop.is-open');
    if (!open) return;
    if (e.key === 'Escape') { closeDialog(open.id); return; }
    const focusable = open._focusable;
    if (!focusable || !focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });
})();
