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
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: any) => void;
            error_callback?: (error: any) => void;
            prompt?: string;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          initCodeClient?: (config: any) => any;
        };
      };
    };
  }
}

export const getGoogleClientId = (): string => {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("custom_google_client_id");
    if (custom && custom.trim() && custom !== "YOUR_GOOGLE_CLIENT_ID") {
      return custom.trim();
    }
  }
  const envId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";
  if (envId && envId.trim() && envId !== "YOUR_GOOGLE_CLIENT_ID") {
    return envId.trim();
  }
  return "";
};

export const setCustomGoogleClientId = (clientId: string) => {
  if (typeof window !== "undefined") {
    if (clientId.trim()) {
      localStorage.setItem("custom_google_client_id", clientId.trim());
    } else {
      localStorage.removeItem("custom_google_client_id");
    }
  }
};

export const GOOGLE_CLIENT_ID = getGoogleClientId();

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
 * Checks whether a real Google Client ID is configured in the environment or localStorage.
 */
export function isGoogleAuthAvailable(): boolean {
  return Boolean(getGoogleClientId());
}

/**
 * Triggers native Google OAuth 2.0 Account Chooser (GIS SDK).
 * Pops up Google's official account selector with prompt=select_account.
 */
export function promptGoogleLogin(): Promise<GoogleUserInfo> {
  return new Promise((resolve, reject) => {
    const clientId = getGoogleClientId();
    if (!clientId) {
      reject(new Error("No Google Client ID configured"));
      return;
    }

    // Modern Google OAuth 2.0 Token Client with prompt: select_account
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          prompt: "select_account",
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              reject(new Error(tokenResponse.error_description || tokenResponse.error));
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (res.ok) {
                  const data = await res.json();
                  resolve({
                    email: data.email,
                    name: data.name || data.email?.split("@")[0],
                    avatar: data.picture,
                    sub: data.sub || data.id,
                    idToken: tokenResponse.access_token
                  });
                  return;
                }
              } catch (fetchErr: any) {
                console.warn("Failed to fetch userinfo from Google endpoint:", fetchErr.message);
              }
            }
            reject(new Error("Failed to receive Google access credential"));
          },
          error_callback: (err: any) => {
            reject(new Error(err?.message || "Google OAuth popup dismissed"));
          }
        });

        client.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (oauthErr: any) {
        console.warn("Falling back to GIS One Tap / ID Token:", oauthErr.message);
      }
    }

    // Google Identity Services id token fallback
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
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
            console.warn("Google One Tap skipped:", notification.getNotDisplayedReason());
          }
        });
      } catch (err) {
        reject(err);
      }
    } else {
      reject(new Error("Google Identity SDK is not loaded. Please check internet connection."));
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
  const clientId = getGoogleClientId();
  if (!window.google?.accounts?.id || !clientId) {
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
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
