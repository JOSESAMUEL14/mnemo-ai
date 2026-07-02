/* =====================================================================
   Mnemo AI — Evening Reminder Notifications
   Plain vanilla JS, no dependencies. Safe to include on every page.
   ===================================================================== */

/**
 * Requests permission to show browser notifications.
 *
 * Browser permission states (for reference):
 *   - "granted": user has already allowed notifications — Notification()
 *     can be constructed directly, no further prompt needed.
 *   - "denied":  user has explicitly blocked notifications — calling
 *     Notification.requestPermission() again will NOT re-prompt; the
 *     browser silently resolves with "denied" again. There is no way
 *     to un-block this from JS; the user must change it in browser
 *     site settings manually.
 *   - "default": user hasn't been asked yet (or dismissed the prompt
 *     without choosing) — requestPermission() will show the native
 *     browser prompt.
 *
 * @returns {Promise<boolean>} resolves true if permission is "granted",
 *          false otherwise (denied, default-after-prompt, or unsupported).
 */
function requestNotificationPermission() {
  // Edge case: Notification API doesn't exist at all (older browsers,
  // some in-app webviews, etc). Resolve false instead of throwing.
  if (!('Notification' in window)) {
    return Promise.resolve(false);
  }

  // Edge case: already denied previously — don't bother prompting again,
  // browsers won't show the dialog anyway and it can clutter the console
  // in some implementations. Just resolve false immediately.
  if (Notification.permission === 'denied') {
    return Promise.resolve(false);
  }

  // Edge case: already granted — no need to prompt, resolve true right away.
  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }

  // Default state — actually ask the user. requestPermission() returns
  // a Promise in modern browsers, but older Safari used a callback-style
  // API instead. Handle both for safety.
  try {
    const result = Notification.requestPermission();
    if (result && typeof result.then === 'function') {
      // Modern Promise-based API
      return result.then((permission) => permission === 'granted');
    }
    // Legacy callback-based API (old Safari) — wrap in a Promise
    return new Promise((resolve) => {
      Notification.requestPermission((permission) => {
        resolve(permission === 'granted');
      });
    });
  } catch (err) {
    // Any unexpected error (e.g. blocked by browser policy, iframe
    // restrictions) — fail silently and resolve false.
    return Promise.resolve(false);
  }
}

/**
 * Returns today's date as an ISO string (YYYY-MM-DD), matching the
 * format used elsewhere in Mnemo AI (journal.html, timeline.html).
 */
function _mnemoTodayIso() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * Checks every minute whether it's 9 PM and, if the user hasn't
 * journaled yet today, fires a single evening reminder notification.
 * Designed to be safe to call multiple times — actual interval setup
 * is guarded in initNotifications() via window.__mnemoNotifInit.
 */
function scheduleEveningReminder() {
  // Re-check support here too, in case this is ever called directly
  // without going through initNotifications() first.
  if (!('Notification' in window)) return;

  setInterval(() => {
    const now = new Date();
    const isNinePM = now.getHours() === 21 && now.getMinutes() === 0;

    if (!isNinePM) return;

    // Edge case: permission could have been revoked by the user mid-session
    // (e.g. via browser site settings) — re-check before firing, don't
    // trust the permission state captured at page load.
    if (Notification.permission !== 'granted') return;

    const todayIso = _mnemoTodayIso();

    // Has the user already journaled today? journal.html sets this key
    // whenever an entry is saved successfully.
    const lastEntryDate = localStorage.getItem('mnemo_last_entry_date');
    if (lastEntryDate === todayIso) return; // already journaled — skip

    // Has the reminder already fired today? Prevents repeat notifications
    // if this interval somehow ticks more than once during the 21:00 minute,
    // or if multiple tabs are open simultaneously.
    const reminderFiredDate = localStorage.getItem('mnemo_reminder_fired_date');
    if (reminderFiredDate === todayIso) return;

    // ---- Fire the notification ----
    try {
      const notification = new Notification('Mnemo AI', {
        body: 'Time for your DayEnd ritual! 🌙 Tell me about your day.',
        // icon: '/static/img/logo.png' // optional — add if you have an icon asset
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/journal';
      };

      // Mark as fired so it doesn't repeat again today, even across
      // multiple open tabs (localStorage is shared across same-origin tabs).
      localStorage.setItem('mnemo_reminder_fired_date', todayIso);
    } catch (err) {
      // Construction can fail in rare cases (e.g. permission revoked
      // between the check above and now, some mobile browsers restrict
      // Notification() outside a service worker). Fail silently.
    }
  }, 60 * 1000); // check once per minute
}

/**
 * Entry point — call this once per page load. Safe to call on every
 * page without creating duplicate intervals, since it's guarded by
 * a global flag.
 */
function initNotifications() {
  // Guard against multiple intervals if this script (or this function)
  // somehow runs more than once on the same page — e.g. duplicate
  // <script> tags, hot-reload during dev, or repeated manual calls.
  if (window.__mnemoNotifInit) return;
  window.__mnemoNotifInit = true;

  requestNotificationPermission().then((granted) => {
    if (granted) {
      scheduleEveningReminder();
    }
    // If not granted (denied, default-but-dismissed, or unsupported),
    // we simply don't schedule anything — no errors, no nagging.
  });
}