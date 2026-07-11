# App Review reply — build 39 (Guideline 2.1a, Sign In)

Coller ce message dans le Resolution Center AU MOMENT de re-soumettre le build 39
(onglet Vérification de l'app → Répondre à l'équipe de vérification).

---

Hello, and thank you for the detailed report on build 38.

We reproduced the "no further action when tapping Sign In" behavior and fixed
two root causes in build 39 (1.0.3):

1. The primary button used an interactive Liquid Glass effect
   (`glassEffect(.interactive())`) whose hit-testing could intercept the tap on
   some devices. The Sign In button now uses an opaque fill with an explicit
   tappable content shape, so the tap always reaches the action.

2. The sign-in network request had no timeout. If the authentication call
   stalled, the button appeared unresponsive. Build 39 adds a hard 15-second
   timeout that surfaces a clear, localized error instead of hanging.

Verification steps we ran on iPad (iPadOS 26.5, en_US):
- Tapping Sign In with empty fields now shows an inline message:
  "Please enter your email and password." — confirming the button responds.
- Signing in with the review credentials below returns HTTP 200 and loads the
  main tab bar.

Review account (unchanged):
- Username: review@purrly.app
- Password: AppReview2026!

If you still see no response, please note the device may have cached a prior
build — deleting the app and reinstalling build 39 before testing avoids that.

We're happy to provide a screen recording or answer any question here. Thank you
for your time.
