/* ============================================================
   Mnemo AI — voice.js
   Standalone, dependency-free voice module.

   Provides:
     startVoiceInput(onResult, onError)
     speakText(text, lang)
     stopSpeaking()
     isVoiceSupported()

   Plain <script src="/static/js/voice.js"></script> include —
   no ES modules, no bundler, no build step. All functions are
   attached to the global (window) scope so any page can call
   them directly after including this file.

   This file intentionally does NOT touch the DOM or assume any
   element IDs exist. Pages that include it (chat.html,
   journal.html, future.html) are responsible for wiring these
   functions to their own buttons/inputs via the callbacks below.
   ============================================================ */

(function (global) {
  'use strict';

  /* ----------------------------------------------------------
     BROWSER COMPATIBILITY NOTES
     ----------------------------------------------------------
     Speech-to-text (SpeechRecognition):
       - Chrome, Edge, and most Chromium-based browsers expose
         this as `webkitSpeechRecognition` (still prefixed, even
         in modern versions).
       - Firefox and Safari do not support the recognition API
         at all as of this writing (Safari has partial/no public
         support; Firefox has none by default). On those
         browsers `window.SpeechRecognition` and
         `window.webkitSpeechRecognition` are both undefined.
       - There is no reliable feature-detection trick beyond
         checking for the constructor's existence — we do that
         below and call the caller's onError() instead of
         throwing, so the rest of the page keeps working.

     Text-to-speech (SpeechSynthesis):
       - Far better supported than recognition — Chrome, Edge,
         Firefox, and Safari all implement `window.speechSynthesis`
         and `SpeechSynthesisUtterance` natively, unprefixed.
       - Voice availability per language (e.g. ta-IN, te-IN) is
         NOT guaranteed — it depends entirely on the voices the
         user's OS/browser has installed. If no matching voice
         is found, most browsers silently fall back to a default
         system voice rather than throwing an error, so this is
         handled gracefully without extra code on our side.
       - `speechSynthesis.getVoices()` can return an empty array
         on first call in some browsers (voices load
         asynchronously). We don't hard-depend on voice list
         enumeration here — we just set `utterance.lang` and let
         the browser pick the closest available voice itself.
     ---------------------------------------------------------- */

  // Tracks whether voice input is actively listening right now.
  // Pages can read this directly: if (window.isRecording) { ... }
  global.isRecording = false;

  // Internal reference to the active recognition instance so it
  // can be stopped/restarted safely without creating duplicates.
  var _recognition = null;

  // Maps the language labels used across Mnemo AI's UI (the same
  // strings stored in localStorage as "mnemo_language") to BCP-47
  // locale codes expected by both SpeechRecognition and
  // SpeechSynthesisUtterance.
  var LANGUAGE_MAP = {
    'English': 'en-US',
    'Tamil': 'ta-IN',
    'Hindi': 'hi-IN',
    'Telugu': 'te-IN',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Arabic': 'ar-SA',
    'Japanese': 'ja-JP'
  };

  /**
   * Resolves a Mnemo language label (e.g. "Tamil") to a BCP-47
   * locale code (e.g. "ta-IN"). Falls back to English (en-US)
   * for any unmapped or missing value, so callers never need to
   * guard against unknown languages themselves.
   *
   * @param {string} lang - Language label, e.g. "Tamil"
   * @returns {string} BCP-47 locale code
   */
  function resolveLocale(lang) {
    if (!lang) return 'en-US';
    return LANGUAGE_MAP[lang] || 'en-US';
  }

  /**
   * Checks whether the current browser supports BOTH the speech
   * recognition (voice input) and speech synthesis (voice output)
   * APIs that this module relies on.
   *
   * Pages can use this to decide whether to show mic/voice
   * buttons at all, e.g.:
   *   if (!isVoiceSupported()) { micBtn.style.display = 'none'; }
   *
   * @returns {boolean} true if both APIs are available
   */
  function isVoiceSupported() {
    var hasRecognition = !!(global.SpeechRecognition || global.webkitSpeechRecognition);
    var hasSynthesis = !!(global.speechSynthesis && global.SpeechSynthesisUtterance);
    return hasRecognition && hasSynthesis;
  }

  /**
   * Starts listening for a single spoken phrase using the
   * browser's SpeechRecognition API.
   *
   * Behavior:
   *   - Sets window.isRecording = true while actively listening,
   *     and resets it to false when recognition ends, errors, or
   *     is stopped — regardless of outcome.
   *   - Calls onResult(transcriptText) exactly once per successful
   *     recognized phrase.
   *   - Calls onError(errorMessage) if the browser doesn't support
   *     speech recognition at all, if mic permission is denied,
   *     or if any other recognition error occurs.
   *   - If recognition is already running when this is called
   *     again, it stops the current session first rather than
   *     starting a second overlapping one.
   *
   * @param {function(string): void} onResult - called with the
   *        recognized speech as plain text
   * @param {function(string): void} onError - called with a
   *        human-readable error message string
   */
  function startVoiceInput(onResult, onError) {
    onResult = typeof onResult === 'function' ? onResult : function () {};
    onError = typeof onError === 'function' ? onError : function () {};

    // Chrome/Edge (Chromium) expose this prefixed; some newer
    // builds may eventually expose the unprefixed name too, so we
    // check both, preferring the unprefixed standard name first.
    var SpeechRecognitionImpl = global.SpeechRecognition || global.webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      // Firefox and Safari land here — there is no polyfill for
      // this API, so we degrade gracefully via the error callback
      // instead of throwing, letting the calling page show a
      // friendly "voice input not supported" message.
      global.isRecording = false;
      onError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    // If a previous recognition session is still active, stop it
    // first to avoid the "recognition already started" error some
    // browsers throw when start() is called twice in a row.
    if (_recognition && global.isRecording) {
      try {
        _recognition.stop();
      } catch (e) {
        // Ignore — we're about to create a fresh instance anyway.
      }
    }

    _recognition = new SpeechRecognitionImpl();
    _recognition.lang = resolveLocale(
      (typeof localStorage !== 'undefined' && localStorage.getItem('mnemo_language')) || 'English'
    );
    _recognition.interimResults = false;
    _recognition.maxAlternatives = 1;
    // continuous = false: we want one phrase per call, matching
    // the "press mic, speak, get text" pattern used across
    // chat.html / journal.html / future.html.
    _recognition.continuous = false;

    _recognition.onstart = function () {
      global.isRecording = true;
    };

    _recognition.onresult = function (event) {
      try {
        var transcript = event.results[0][0].transcript;
        onResult(transcript);
      } catch (e) {
        onError('Could not read the recognized speech.');
      }
    };

    _recognition.onerror = function (event) {
      global.isRecording = false;

      // event.error gives a machine-readable code; we translate
      // the common ones into something a user can actually act on.
      var message;
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          message = 'Microphone access was denied. Please allow microphone permission and try again.';
          break;
        case 'no-speech':
          message = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          message = 'No microphone was found on this device.';
          break;
        case 'network':
          message = 'A network error interrupted voice recognition.';
          break;
        default:
          message = 'Voice input error: ' + event.error;
      }
      onError(message);
    };

    _recognition.onend = function () {
      // Fires after a successful result, an error, OR a manual
      // stop() — so this is the single reliable place to reset
      // the recording flag no matter how the session ended.
      global.isRecording = false;
    };

    try {
      _recognition.start();
    } catch (e) {
      // start() can throw synchronously in rare cases (e.g.
      // calling start() while already starting). Surface it the
      // same way as any other recognition error.
      global.isRecording = false;
      onError('Could not start voice input: ' + e.message);
    }
  }

  /**
   * Speaks the given text aloud using the browser's
   * SpeechSynthesis API. Any speech currently in progress
   * (from this module or elsewhere on the page) is cancelled
   * first, so calls never overlap or queue up unexpectedly.
   *
   * Silently does nothing if the browser doesn't support speech
   * synthesis at all — text-to-speech is considered a
   * progressive enhancement, not a required feature, so this
   * intentionally does not require an onError callback.
   *
   * @param {string} text - the text to speak aloud
   * @param {string} [lang] - a Mnemo language label, e.g.
   *        "Tamil", "Hindi", "English" (defaults to "English"/
   *        en-US if omitted or unrecognized)
   */
  function speakText(text, lang) {
    if (!text) return;

    if (!global.speechSynthesis || !global.SpeechSynthesisUtterance) {
      // No console.error spam in production — speech synthesis
      // is an enhancement; pages should keep working silently
      // without it.
      return;
    }

    // Cancel anything currently speaking (or queued) before
    // starting a new utterance, so responses never overlap.
    stopSpeaking();

    var utterance = new global.SpeechSynthesisUtterance(text);
    utterance.lang = resolveLocale(lang);
    utterance.rate = 1;
    utterance.pitch = 1;

    // NOTE: utterance.voice is intentionally left unset. Setting
    // it requires enumerating speechSynthesis.getVoices() and
    // finding a voice whose .lang matches — but voice lists differ
    // wildly across OS/browser combinations, and many systems
    // simply don't ship voices for languages like Tamil or Telugu.
    // Leaving `voice` unset and only setting `lang` lets the
    // browser pick its own best available voice (or fall back to
    // a default one) rather than failing silently when no exact
    // match exists.

    global.speechSynthesis.speak(utterance);
  }

  /**
   * Immediately stops any speech currently playing or queued via
   * speechSynthesis. Safe to call even if nothing is speaking.
   */
  function stopSpeaking() {
    if (global.speechSynthesis) {
      global.speechSynthesis.cancel();
    }
  }

  // ----------------------------------------------------------
  // Expose as plain globals — no ES module export, no bundler.
  // Pages include this file via a simple <script src="..."></script>
  // tag and call these functions directly.
  // ----------------------------------------------------------
  global.startVoiceInput = startVoiceInput;
  global.speakText = speakText;
  global.stopSpeaking = stopSpeaking;
  global.isVoiceSupported = isVoiceSupported;

})(window);