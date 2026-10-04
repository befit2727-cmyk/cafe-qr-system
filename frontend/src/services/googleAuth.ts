/**
 * Google Identity Services (GIS) Native OAuth Service
 * Zero external dependencies: Uses Google's official GIS SDK + native browser base64 decoding.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export interface GoogleUserInfo {
  email: string;
  name: string;
  avatar?: string;
  sub: string;
  idToken?: string;
}

/**
 * Decodes the JWT credential returned by Google Identity Services.
 * Uses native browser atob without requiring third-party libraries.
 */
export function decodeGoogleJwt(credential: string): GoogleUserInfo | null {
  try {
    const base64Url = credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      email: parsed.email,
      name: parsed.name || parsed.email.split("@")[0],
      avatar: parsed.picture,
      sub: parsed.sub
    };
  } catch (err) {
    console.error("Failed to decode Google JWT credential", err);
    return null;
  }
}

/**
 * Checks whether a real Google Client ID is configured in the environment.
 */
export function isGoogleAuthAvailable(): boolean {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID");
}

/**
 * Triggers native Google One-Tap or Google Sign-In prompt.
 * Returns decoded user information upon successful authentication.
 */
export function promptGoogleLogin(): Promise<GoogleUserInfo> {
  return new Promise((resolve, reject) => {
    if (!isGoogleAuthAvailable()) {
      if (import.meta.env.PROD) {
        reject(
          new Error(
            "Google Sign-In is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in your deployment environment variables."
          )
        );
        return;
      }

      // Safe local development fallback only
      resolve({
        email: "customer@gmail.com",
        name: "Google Customer (Verified)",
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        sub: "demo-google-sub",
        idToken: "demo_google_id_token"
      });
      return;
    }

    if (!window.google?.accounts?.id) {
      reject(new Error("Google Identity Services SDK is not loaded. Please check your internet connection."));
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (!response?.credential) {
            reject(new Error("No credential returned by Google."));
            return;
          }
          const user = decodeGoogleJwt(response.credential);
          if (user) {
            resolve({ ...user, idToken: response.credential });
          } else {
            reject(new Error("Unable to parse Google credential token."));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn("Google One Tap was skipped or not displayed", notification.getNotDisplayedReason());
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Renders the official Google Sign-In button into a container element.
 */
export function renderGoogleButton(
  container: HTMLElement,
  onSuccess: (user: GoogleUserInfo) => void,
  onError?: (err: any) => void
): void {
  if (!window.google?.accounts?.id || !isGoogleAuthAvailable()) {
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        if (!response?.credential) {
          if (onError) onError(new Error("No credential received"));
          return;
        }
        const user = decodeGoogleJwt(response.credential);
        if (user) {
          onSuccess({ ...user, idToken: response.credential });
        } else if (onError) {
          onError(new Error("Could not decode Google token"));
        }
      }
    });

    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 280
    });
  } catch (e) {
    if (onError) onError(e);
  }
}
