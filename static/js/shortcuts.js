/* ============================================================
   Mnemo AI — Global keyboard shortcuts
   Ctrl/Cmd + J  → /journal
   Ctrl/Cmd + C  → /chat
   Ctrl/Cmd + I  → /insights
   Ctrl/Cmd + D  → /dashboard
   Ctrl/Cmd + G  → /goals
   ?             → show shortcuts help modal
   ============================================================ */

const MNEMO_SHORTCUTS = [
  { combo: 'Ctrl/Cmd + J', desc: 'Go to Journal' },
  { combo: 'Ctrl/Cmd + C', desc: 'Go to Chat' },
  { combo: 'Ctrl/Cmd + I', desc: 'Go to Insights' },
  { combo: 'Ctrl/Cmd + D', desc: 'Go to Dashboard' },
  { combo: 'Ctrl/Cmd + G', desc: 'Go to Goals' },
  { combo: '?', desc: 'Show this shortcuts menu' },
  { combo: 'Esc', desc: 'Close this menu' }
];

const MNEMO_ROUTE_KEYS = {
  'j': '/journal',
  'c': '/chat',
  'i': '/insights',
  'd': '/dashboard',
  'g': '/goals'
};

function isTypingInField() {
  const tag = document.activeElement && document.activeElement.tagName;
  const editable = document.activeElement && document.activeElement.isContentEditable;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable;
}

function initShortcuts() {
  document.addEventListener('keydown', function (event) {
    const isCmdOrCtrl = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    // Ctrl/Cmd + [route key]
    if (isCmdOrCtrl && MNEMO_ROUTE_KEYS.hasOwnProperty(key)) {
      event.preventDefault();
      window.location.href = MNEMO_ROUTE_KEYS[key];
      return;
    }

    // "?" opens the shortcuts modal — but not while typing
    if (event.key === '?' && !isTypingInField()) {
      event.preventDefault();
      showShortcutsModal();
      return;
    }

    // Escape closes the modal if it's open
    if (event.key === 'Escape') {
      closeShortcutsModal();
    }
  });
}

function injectShortcutsModalStyles() {
  if (document.getElementById('mnemo-shortcuts-style')) return;

  const style = document.createElement('style');
  style.id = 'mnemo-shortcuts-style';
  style.textContent = `
    .mnemo-shortcuts-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: mnemoFadeIn 0.15s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .mnemo-shortcuts-modal {
      background: #13131a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 22px 24px;
      width: 320px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: mnemoSlideUp 0.2s ease;
    }
    .mnemo-shortcuts-modal h3 {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }
    .mnemo-shortcuts-modal .mnemo-sc-sub {
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      margin-bottom: 16px;
    }
    .mnemo-sc-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .mnemo-sc-row:last-child { border-bottom: none; }
    .mnemo-sc-desc {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
    }
    .mnemo-sc-key {
      font-family: 'SF Mono', Menlo, Consolas, monospace;
      font-size: 11px;
      color: #a78bfa;
      background: rgba(124,58,237,0.15);
      border: 1px solid rgba(124,58,237,0.25);
      border-radius: 6px;
      padding: 3px 8px;
      white-space: nowrap;
    }
    .mnemo-sc-close {
      margin-top: 16px;
      width: 100%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.6);
      font-size: 12px;
      padding: 8px;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mnemo-sc-close:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }
    @keyframes mnemoFadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes mnemoSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

function showShortcutsModal() {
  // Avoid duplicate modals
  if (document.getElementById('mnemo-shortcuts-overlay')) return;

  injectShortcutsModalStyles();

  const overlay = document.createElement('div');
  overlay.className = 'mnemo-shortcuts-overlay';
  overlay.id = 'mnemo-shortcuts-overlay';

  const rowsHtml = MNEMO_SHORTCUTS.map(function (s) {
    return (
      '<div class="mnemo-sc-row">' +
        '<span class="mnemo-sc-desc">' + s.desc + '</span>' +
        '<span class="mnemo-sc-key">' + s.combo + '</span>' +
      '</div>'
    );
  }).join('');

  overlay.innerHTML =
    '<div class="mnemo-shortcuts-modal">' +
      '<h3>Keyboard shortcuts</h3>' +
      '<div class="mnemo-sc-sub">Navigate Mnemo AI without touching your mouse</div>' +
      rowsHtml +
      '<button class="mnemo-sc-close" onclick="closeShortcutsModal()">Close</button>' +
    '</div>';

  // Click outside modal closes it
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) {
      closeShortcutsModal();
    }
  });

  document.body.appendChild(overlay);
}

function closeShortcutsModal() {
  const overlay = document.getElementById('mnemo-shortcuts-overlay');
  if (overlay) overlay.remove();
}

// Auto-init on load — no separate init call needed in HTML
initShortcuts();