document.addEventListener('DOMContentLoaded', () => {
  if (typeof executeClipboardCopyAction === 'function') {
    window.executeClipboardCopyAction = executeClipboardCopyAction = function() {
      const rawBlock = document.getElementById('latexCodeOutputDOM')?.textContent || '';
      navigator.clipboard.writeText(rawBlock)
        .then(() => window.showAppModal('Production LaTeX source code copied to clipboard context.', { variant: 'success', title: 'Copied' }))
        .catch(() => window.showAppModal('Error writing data streams to clipboard buffer context.', { variant: 'danger', title: 'Clipboard Error' }));
    };
  }
  if (typeof executeAdminShortlistSubmission === 'function') {
    window.executeAdminShortlistSubmission = executeAdminShortlistSubmission = async function() {
      if (document.getElementById('updateCvBtn')?.classList.contains('visible')) {
        const proceed = await window.showConfirmModal('Warning: Core upstream records possess changes that have not been compiled with submission anyways?', { okText: 'Submit', danger: false });
        if (!proceed) return;
      }
      window.showAppModal('Success: Current compiled document version successfully committed for administrative overview.', { variant: 'success', title: 'Submitted' });
    };
  }
});
