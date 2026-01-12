import { describe, it, afterEach, vi, beforeAll } from 'vitest'
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {}
  return {
    getItem: function (key: string) {
      return store[key] || null
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString()
    },
    clear: function () {
      store = {}
    },
    removeItem: function (key: string) {
      delete store[key]
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Correctly define MatchMedia which is also often missing in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock react-oidc-context
vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    activeNavigator: undefined,
    signinRedirect: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import AppComp from '../features/dashboard/Index'
import AppAppsComp from '../features/apps/Apps'
import AppAppsPermissionsComp from '../features/apps/AppsPermissions'
import AppDeveloperComp from '../features/developer/Index'
import AppNotificationsComp from '../features/notifications/Index'
import AppOrgsComp from '../features/orgs/Orgs'
// Org sub-pages removed
import AppOrgsSwitchComp from '../features/orgs/OrgsSwitch'
import AppParentalControlsComp from '../features/parental/Index'
import AppPrivacyConsentsComp from '../features/privacy/PrivacyConsents'
import AppPrivacyDeleteAccountComp from '../features/privacy/PrivacyDeleteAccount'
import AppPrivacyDownloadComp from '../features/privacy/PrivacyDownload'
import AppProfileComp from '../features/profile/Profile'
import AppProfileContactComp from '../features/profile/ProfileContact'
import AppProfileLinkedAccountsComp from '../features/profile/ProfileLinkedAccounts'
import AppSecurityComp from '../features/security/Security'
import AppSecurity2faComp from '../features/security/Security2fa'
import AppSecurity2faSetupComp from '../features/security/Security2faSetup'
import AppSecurityActivityComp from '../features/security/SecurityActivity'
import AppSecurityChangePasswordComp from '../features/security/SecurityChangePassword'
import AppSecurityPasskeysComp from '../features/security/SecurityPasskeys'
import AppSecurityRecoveryCodesComp from '../features/security/SecurityRecoveryCodes'
import AppSecuritySessionsComp from '../features/security/SecuritySessions'
import AppSupportComp from '../features/support/Support'
import AppSupportSecurityComp from '../features/support/SupportSecurity'
import AppWalletComp from '../features/wallet/Wallet'
// Wallet sub-pages removed
import AuthAccountRecoveryHelpComp from '../features/auth/account-recovery-help/Index'
import AuthCallbackComp from '../features/auth/Callback'
import AuthChooseAccountComp from '../features/auth/choose-account/Index'
import AuthConsentComp from '../features/auth/consent/Index'
import AuthContinueComp from '../features/auth/continue/Index'
import AuthErrorComp from '../features/auth/error/Index'
import AuthForgotPasswordComp from '../features/auth/forgot-password/Index'
import AuthMfaComp from '../features/auth/mfa/Index'
import AuthPasskeyComp from '../features/auth/passkey/Index'
import AuthReAuthComp from '../features/auth/re-auth/Index'
import AuthRecoveryCodeComp from '../features/auth/recovery-code/Index'
import AuthResetPasswordComp from '../features/auth/reset-password/Index'
import AuthSetPasswordComp from '../features/auth/set-password/Index'
import AuthSignInComp from '../features/auth/sign-in/Index'
import AuthSignInOtpComp from '../features/auth/sign-in/Otp'
import AuthSignUpComp from '../features/auth/sign-up/Index'
import AuthSignedOutComp from '../features/auth/signed-out/Index'
import AuthVerifyEmailComp from '../features/auth/verify-email/Index'
import AuthVerifyPhoneComp from '../features/auth/verify-phone/Index'
import Errors403Comp from '../features/errors/Error403'
import Errors404Comp from '../features/errors/Error404'
import Errors429Comp from '../features/errors/Error429'
import Errors500Comp from '../features/errors/Error500'
import LegalCookiesComp from '../features/legal/Cookies'
import LegalPrivacyComp from '../features/legal/Privacy'
import LegalTermsComp from '../features/legal/Terms'
import OrgInviteAcceptComp from '../features/org-invite/Accept'
import StatusComp from '../features/status/Index'
import StatusMaintenanceComp from '../features/status/Maintenance'

afterEach(() => cleanup())

const PAGES: Array<[string, React.ComponentType<unknown>]> = [
  ['/app', AppComp],
  ['/app/apps', AppAppsComp],
  ['/app/apps/permissions', AppAppsPermissionsComp],
  ['/app/developer', AppDeveloperComp],
  ['/app/notifications', AppNotificationsComp],
  ['/app/orgs', AppOrgsComp],
  // ['/app/orgs/:orgId', AppOrgsOrgIdComp],
  // ['/app/orgs/:orgId/domain-verification', AppOrgsOrgIdDomainVerificationComp],
  // ['/app/orgs/:orgId/invite', AppOrgsOrgIdInviteComp],
  // ['/app/orgs/:orgId/members', AppOrgsOrgIdMembersComp],
  // ['/app/orgs/:orgId/provisioning', AppOrgsOrgIdProvisioningComp],
  // ['/app/orgs/:orgId/roles-permissions', AppOrgsOrgIdRolesPermissionsComp],
  // ['/app/orgs/:orgId/settings', AppOrgsOrgIdSettingsComp],
  // ['/app/orgs/:orgId/sso', AppOrgsOrgIdSsoComp],
  ['/app/orgs/switch', AppOrgsSwitchComp],
  ['/app/parental-controls', AppParentalControlsComp],
  ['/app/privacy/consents', AppPrivacyConsentsComp],
  ['/app/privacy/delete-account', AppPrivacyDeleteAccountComp],
  ['/app/privacy/download', AppPrivacyDownloadComp],
  ['/app/profile', AppProfileComp],
  ['/app/profile/contact', AppProfileContactComp],
  ['/app/profile/linked-accounts', AppProfileLinkedAccountsComp],
  ['/app/security', AppSecurityComp],
  ['/app/security/2fa', AppSecurity2faComp],
  ['/app/security/2fa/setup', AppSecurity2faSetupComp],
  ['/app/security/activity', AppSecurityActivityComp],
  ['/app/security/change-password', AppSecurityChangePasswordComp],
  ['/app/security/passkeys', AppSecurityPasskeysComp],
  ['/app/security/recovery-codes', AppSecurityRecoveryCodesComp],
  ['/app/security/sessions', AppSecuritySessionsComp],
  ['/app/support', AppSupportComp],
  ['/app/support/security', AppSupportSecurityComp],
  ['/app/wallet', AppWalletComp],
  // Wallet sub-pages removed
  // ['/app/wallet/add-funds', AppWalletAddFundsComp],
  // ['/app/wallet/disputes', AppWalletDisputesComp],
  // ['/app/wallet/kyc', AppWalletKycComp],
  // ['/app/wallet/kyc/details', AppWalletKycDetailsComp],
  // ['/app/wallet/kyc/status', AppWalletKycStatusComp],
  // ['/app/wallet/kyc/upload', AppWalletKycUploadComp],
  // ['/app/wallet/limits', AppWalletLimitsComp],
  // ['/app/wallet/payment-methods', AppWalletPaymentMethodsComp],
  // ['/app/wallet/payment-methods/add', AppWalletPaymentMethodsAddComp],
  // ['/app/wallet/transactions', AppWalletTransactionsComp],
  // ['/app/wallet/transactions/:txnId', AppWalletTransactionsTxnIdComp],
  // ['/app/wallet/withdraw', AppWalletWithdrawComp],
  ['/auth/account-recovery-help', AuthAccountRecoveryHelpComp],
  ['/auth/callback', AuthCallbackComp],
  ['/auth/choose-account', AuthChooseAccountComp],
  ['/auth/consent', AuthConsentComp],
  ['/auth/continue', AuthContinueComp],
  ['/auth/error', AuthErrorComp],
  ['/auth/forgot-password', AuthForgotPasswordComp],
  ['/auth/mfa', AuthMfaComp],
  ['/auth/passkey', AuthPasskeyComp],
  ['/auth/re-auth', AuthReAuthComp],
  ['/auth/recovery-code', AuthRecoveryCodeComp],
  ['/auth/reset-password', AuthResetPasswordComp],
  ['/auth/set-password', AuthSetPasswordComp],
  ['/auth/sign-in', AuthSignInComp],
  ['/auth/sign-in/otp', AuthSignInOtpComp],
  ['/auth/sign-up', AuthSignUpComp],
  ['/auth/signed-out', AuthSignedOutComp],
  ['/auth/verify-email', AuthVerifyEmailComp],
  ['/auth/verify-phone', AuthVerifyPhoneComp],
  ['/errors/403', Errors403Comp],
  ['/errors/404', Errors404Comp],
  ['/errors/429', Errors429Comp],
  ['/errors/500', Errors500Comp],
  ['/legal/cookies', LegalCookiesComp],
  ['/legal/privacy', LegalPrivacyComp],
  ['/legal/terms', LegalTermsComp],
  ['/org-invite/accept', OrgInviteAcceptComp],
  ['/status', StatusComp],
  ['/status/maintenance', StatusMaintenanceComp],
]

describe('EVzone My Accounts pages', () => {
  it.each(PAGES)('%s renders without crashing', (_route, Comp) => {
    render(
      <MemoryRouter>
        <Comp />
      </MemoryRouter>
    )
  })
})