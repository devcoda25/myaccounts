import { AuthProviderProps } from "react-oidc-context";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import { OIDC_AUTHORITY } from "../config";

export const oidcConfig: AuthProviderProps = {
  authority: OIDC_AUTHORITY,
  client_id: "evzone-portal",
  redirect_uri: `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: `${window.location.origin}/auth/signed-out`,
  response_type: "code",
  scope: "openid profile email offline_access",
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
};

export const userManager = new UserManager({
  authority: oidcConfig.authority!,
  client_id: oidcConfig.client_id!,
  redirect_uri: oidcConfig.redirect_uri!,
  post_logout_redirect_uri: oidcConfig.post_logout_redirect_uri!,
  response_type: oidcConfig.response_type!,
  scope: oidcConfig.scope!,
  userStore: oidcConfig.userStore as any,
  automaticSilentRenew: true,
});
