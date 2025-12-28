import React from 'react'
import { cleanup, render } from '@testing-library/react'

import AppComp from '../pages/app/Index'
import AppAppsComp from '../pages/app/apps/Apps'
import AppAppsPermissionsComp from '../pages/app/apps/AppsPermissions'
import AppDeveloperComp from '../pages/app/developer/Index'
import AppNotificationsComp from '../pages/app/notifications/Index'
import AppOrgsComp from '../pages/app/orgs/Orgs'
import AppOrgsOrgIdComp from '../pages/app/orgs/OrgsOrgId'
import AppOrgsOrgIdDomainVerificationComp from '../pages/app/orgs/OrgsOrgIdDomainVerification'
import AppOrgsOrgIdInviteComp from '../pages/app/orgs/OrgsOrgIdInvite'
import AppOrgsOrgIdMembersComp from '../pages/app/orgs/OrgsOrgIdMembers'
import AppOrgsOrgIdProvisioningComp from '../pages/app/orgs/OrgsOrgIdProvisioning'
import AppOrgsOrgIdRolesPermissionsComp from '../pages/app/orgs/OrgsOrgIdRolesPermissions'
import AppOrgsOrgIdSettingsComp from '../pages/app/orgs/OrgsOrgIdSettings'
import AppOrgsOrgIdSsoComp from '../pages/app/orgs/OrgsOrgIdSso'
import AppOrgsSwitchComp from '../pages/app/orgs/OrgsSwitch'
import AppParentalControlsComp from '../pages/app/parental/Index'
import AppPrivacyConsentsComp from '../pages/app/privacy/PrivacyConsents'
import AppPrivacyDeleteAccountComp from '../pages/app/privacy/PrivacyDeleteAccount'
import AppPrivacyDownloadComp from '../pages/app/privacy/PrivacyDownload'
import AppProfileComp from '../pages/app/profile/Profile'
import AppProfileContactComp from '../pages/app/profile/ProfileContact'
import AppProfileLinkedAccountsComp from '../pages/app/profile/ProfileLinkedAccounts'
import AppSecurityComp from '../pages/app/security/Security'
import AppSecurity2faComp from '../pages/app/security/Security2fa'
import AppSecurity2faSetupComp from '../pages/app/security/Security2faSetup'
import AppSecurityActivityComp from '../pages/app/security/SecurityActivity'
import AppSecurityChangePasswordComp from '../pages/app/security/SecurityChangePassword'
import AppSecurityPasskeysComp from '../pages/app/security/SecurityPasskeys'
import AppSecurityRecoveryCodesComp from '../pages/app/security/SecurityRecoveryCodes'
import AppSecuritySessionsComp from '../pages/app/security/SecuritySessions'
import AppSupportComp from '../pages/app/support/Support'
import AppSupportSecurityComp from '../pages/app/support/SupportSecurity'
import AppWalletComp from '../pages/app/wallet/Wallet'
import AppWalletAddFundsComp from '../pages/app/wallet/WalletAddFunds'
import AppWalletDisputesComp from '../pages/app/wallet/WalletDisputes'
import AppWalletKycComp from '../pages/app/wallet/WalletKyc'
import AppWalletKycDetailsComp from '../pages/app/wallet/WalletKycDetails'
import AppWalletKycStatusComp from '../pages/app/wallet/WalletKycStatus'
import AppWalletKycUploadComp from '../pages/app/wallet/WalletKycUpload'
import AppWalletLimitsComp from '../pages/app/wallet/WalletLimits'
import AppWalletPaymentMethodsComp from '../pages/app/wallet/WalletPaymentMethods'
import AppWalletPaymentMethodsAddComp from '../pages/app/wallet/WalletPaymentMethodsAdd'
import AppWalletTransactionsComp from '../pages/app/wallet/WalletTransactions'
import AppWalletTransactionsTxnIdComp from '../pages/app/wallet/WalletTransactionsTxnId'
import AppWalletWithdrawComp from '../pages/app/wallet/WalletWithdraw'
import AuthAccountRecoveryHelpComp from '../pages/auth/account-recovery-help/Index'
import AuthChooseAccountComp from '../pages/auth/choose-account/Index'
import AuthConsentComp from '../pages/auth/consent/Index'
import AuthContinueComp from '../pages/auth/continue/Index'
import AuthErrorComp from '../pages/auth/error/Index'
import AuthForgotPasswordComp from '../pages/auth/forgot-password/Index'
import AuthMfaComp from '../pages/auth/mfa/Index'
import AuthPasskeyComp from '../pages/auth/passkey/Index'
import AuthReAuthComp from '../pages/auth/re-auth/Index'
import AuthRecoveryCodeComp from '../pages/auth/recovery-code/Index'
import AuthResetPasswordComp from '../pages/auth/reset-password/Index'
import AuthSetPasswordComp from '../pages/auth/set-password/Index'
import AuthSignInComp from '../pages/auth/sign-in/Index'
import AuthSignInOtpComp from '../pages/auth/sign-in/Otp'
import AuthSignUpComp from '../pages/auth/sign-up/Index'
import AuthSignedOutComp from '../pages/auth/signed-out/Index'
import AuthVerifyEmailComp from '../pages/auth/verify-email/Index'
import AuthVerifyPhoneComp from '../pages/auth/verify-phone/Index'
import Errors403Comp from '../pages/errors/Error403'
import Errors404Comp from '../pages/errors/Error404'
import Errors429Comp from '../pages/errors/Error429'
import Errors500Comp from '../pages/errors/Error500'
import LegalCookiesComp from '../pages/legal/Cookies'
import LegalPrivacyComp from '../pages/legal/Privacy'
import LegalTermsComp from '../pages/legal/Terms'
import OrgInviteAcceptComp from '../pages/org-invite/Accept'
import StatusComp from '../pages/status/Index'
import StatusMaintenanceComp from '../pages/status/Maintenance'

afterEach(() => cleanup())

const PAGES: Array<[string, React.ComponentType<any>]> = [
  ['/app', AppComp],
  ['/app/apps', AppAppsComp],
  ['/app/apps/permissions', AppAppsPermissionsComp],
  ['/app/developer', AppDeveloperComp],
  ['/app/notifications', AppNotificationsComp],
  ['/app/orgs', AppOrgsComp],
  ['/app/orgs/:orgId', AppOrgsOrgIdComp],
  ['/app/orgs/:orgId/domain-verification', AppOrgsOrgIdDomainVerificationComp],
  ['/app/orgs/:orgId/invite', AppOrgsOrgIdInviteComp],
  ['/app/orgs/:orgId/members', AppOrgsOrgIdMembersComp],
  ['/app/orgs/:orgId/provisioning', AppOrgsOrgIdProvisioningComp],
  ['/app/orgs/:orgId/roles-permissions', AppOrgsOrgIdRolesPermissionsComp],
  ['/app/orgs/:orgId/settings', AppOrgsOrgIdSettingsComp],
  ['/app/orgs/:orgId/sso', AppOrgsOrgIdSsoComp],
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
  ['/app/wallet/add-funds', AppWalletAddFundsComp],
  ['/app/wallet/disputes', AppWalletDisputesComp],
  ['/app/wallet/kyc', AppWalletKycComp],
  ['/app/wallet/kyc/details', AppWalletKycDetailsComp],
  ['/app/wallet/kyc/status', AppWalletKycStatusComp],
  ['/app/wallet/kyc/upload', AppWalletKycUploadComp],
  ['/app/wallet/limits', AppWalletLimitsComp],
  ['/app/wallet/payment-methods', AppWalletPaymentMethodsComp],
  ['/app/wallet/payment-methods/add', AppWalletPaymentMethodsAddComp],
  ['/app/wallet/transactions', AppWalletTransactionsComp],
  ['/app/wallet/transactions/:txnId', AppWalletTransactionsTxnIdComp],
  ['/app/wallet/withdraw', AppWalletWithdrawComp],
  ['/auth/account-recovery-help', AuthAccountRecoveryHelpComp],
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
    render(<Comp />)
  })
})