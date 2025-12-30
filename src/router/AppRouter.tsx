import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from '../components/errors/ErrorBoundary'
import RouteLoader from '../components/loading/RouteLoader'

const App = lazy(() => import('../pages/app/Index'))
const AppApps = lazy(() => import('../pages/app/apps/Apps'))
const AppAppsPermissions = lazy(() => import('../pages/app/apps/AppsPermissions'))
const AppDeveloper = lazy(() => import('../pages/app/developer/Index'))
const AppDeveloperAudit = lazy(() => import('../pages/app/developer/DeveloperAudit'))
const AppDeveloperDocs = lazy(() => import('../pages/app/developer/DeveloperDocs'))
const AppNotifications = lazy(() => import('../pages/app/notifications/Index'))
const AppOrgs = lazy(() => import('../pages/app/orgs/Orgs'))
const AppOrgsOrgId = lazy(() => import('../pages/app/orgs/OrgsOrgId'))
const AppOrgsOrgIdDomainVerification = lazy(() => import('../pages/app/orgs/OrgsOrgIdDomainVerification'))
const AppOrgsOrgIdInvite = lazy(() => import('../pages/app/orgs/OrgsOrgIdInvite'))
const AppOrgsOrgIdMembers = lazy(() => import('../pages/app/orgs/OrgsOrgIdMembers'))
const AppOrgsOrgIdProvisioning = lazy(() => import('../pages/app/orgs/OrgsOrgIdProvisioning'))
const AppOrgsOrgIdRolesPermissions = lazy(() => import('../pages/app/orgs/OrgsOrgIdRolesPermissions'))
const AppOrgsOrgIdSettings = lazy(() => import('../pages/app/orgs/OrgsOrgIdSettings'))
const AppOrgsOrgIdSso = lazy(() => import('../pages/app/orgs/OrgsOrgIdSso'))
const AppOrgsSwitch = lazy(() => import('../pages/app/orgs/OrgsSwitch'))
const AppParentalControls = lazy(() => import('../pages/app/parental/Index'))
const AppPrivacyConsents = lazy(() => import('../pages/app/privacy/PrivacyConsents'))
const AppPrivacyDataRequests = lazy(() => import('../pages/app/privacy/PrivacyDataRequests'))
const AppPrivacyDeleteAccount = lazy(() => import('../pages/app/privacy/PrivacyDeleteAccount'))
const AppPrivacyDownload = lazy(() => import('../pages/app/privacy/PrivacyDownload'))
const AppProfile = lazy(() => import('../pages/app/profile/Profile'))
const AppProfileContact = lazy(() => import('../pages/app/profile/ProfileContact'))
const AppProfileLinkedAccounts = lazy(() => import('../pages/app/profile/ProfileLinkedAccounts'))
const AppSecurity = lazy(() => import('../pages/app/security/Security'))
const AppSecurity2fa = lazy(() => import('../pages/app/security/Security2fa'))
const AppSecurity2faSetup = lazy(() => import('../pages/app/security/Security2faSetup'))
const AppSecurityActivity = lazy(() => import('../pages/app/security/SecurityActivity'))
const AppSecurityChangePassword = lazy(() => import('../pages/app/security/SecurityChangePassword'))
const AppSecurityPasskeys = lazy(() => import('../pages/app/security/SecurityPasskeys'))
const AppSecurityRecoveryCodes = lazy(() => import('../pages/app/security/SecurityRecoveryCodes'))
const AppSecuritySessions = lazy(() => import('../pages/app/security/SecuritySessions'))
const AppSettings = lazy(() => import('../pages/app/Settings'))
const AppSupport = lazy(() => import('../pages/app/support/Support'))
const AppSupportSecurity = lazy(() => import('../pages/app/support/SupportSecurity'))
const AppWallet = lazy(() => import('../pages/app/wallet/Wallet'))
const AppWalletAddFunds = lazy(() => import('../pages/app/wallet/WalletAddFunds')) // Assuming this file was moved
const AppWalletDisputes = lazy(() => import('../pages/app/wallet/WalletDisputes'))
const AppWalletKyc = lazy(() => import('../pages/app/wallet/WalletKyc'))
const AppWalletKycDetails = lazy(() => import('../pages/app/wallet/WalletKycDetails'))
const AppWalletKycStatus = lazy(() => import('../pages/app/wallet/WalletKycStatus'))
const AppWalletKycUpload = lazy(() => import('../pages/app/wallet/WalletKycUpload'))
const AppWalletLimits = lazy(() => import('../pages/app/wallet/WalletLimits'))
const AppWalletPaymentMethods = lazy(() => import('../pages/app/wallet/WalletPaymentMethods'))
const AppWalletPaymentMethodsAdd = lazy(() => import('../pages/app/wallet/WalletPaymentMethodsAdd'))
const AppWalletTransactions = lazy(() => import('../pages/app/wallet/WalletTransactions'))
const AppWalletTransactionsTxnId = lazy(() => import('../pages/app/wallet/WalletTransactionsTxnId'))
const AppWalletWithdraw = lazy(() => import('../pages/app/wallet/WalletWithdraw'))
const AuthAccountRecoveryHelp = lazy(() => import('../pages/auth/account-recovery-help/Index'))
const AuthChooseAccount = lazy(() => import('../pages/auth/choose-account/Index'))
const AuthConsent = lazy(() => import('../pages/auth/consent/Index'))
const AuthContinue = lazy(() => import('../pages/auth/continue/Index'))
const AuthError = lazy(() => import('../pages/auth/error/Index'))
const AuthForgotPassword = lazy(() => import('../pages/auth/forgot-password/Index'))
const AuthMfa = lazy(() => import('../pages/auth/mfa/Index'))
const NotFound = React.lazy(() => import('../pages/errors/NotFound'));
const AdminRouter = React.lazy(() => import('./AdminRouter'));
const AdminAuthRouter = lazy(() => import('./AdminAuthRouter'));
const AuthPasskey = lazy(() => import('../pages/auth/passkey/Index'))
const AuthReAuth = lazy(() => import('../pages/auth/re-auth/Index'))
const AuthRecoveryCode = lazy(() => import('../pages/auth/recovery-code/Index'))
const AuthResetPassword = lazy(() => import('../pages/auth/reset-password/Index'))
const AuthSetPassword = lazy(() => import('../pages/auth/set-password/Index'))
const AuthSignIn = lazy(() => import('../pages/auth/sign-in/Index'))
const AuthSignInOtp = lazy(() => import('../pages/auth/sign-in/Otp'))
const AuthSignUp = lazy(() => import('../pages/auth/sign-up/Index'))
const AuthSignedOut = lazy(() => import('../pages/auth/signed-out/Index'))
const AuthVerifyEmail = lazy(() => import('../pages/auth/verify-email/Index'))
const AuthVerifyPhone = lazy(() => import('../pages/auth/verify-phone/Index'))
const Errors403 = lazy(() => import('../pages/errors/Error403'))
const Errors404 = lazy(() => import('../pages/errors/Error404'))
const Errors429 = lazy(() => import('../pages/errors/Error429'))
const Errors500 = lazy(() => import('../pages/errors/Error500'))
const LegalCookies = lazy(() => import('../pages/legal/Cookies'))
const LegalPrivacy = lazy(() => import('../pages/legal/Privacy'))
const LegalTerms = lazy(() => import('../pages/legal/Terms'))
const OrgInviteAccept = lazy(() => import('../pages/org-invite/Accept'))
const Status = lazy(() => import('../pages/status/Index'))
const StatusMaintenance = lazy(() => import('../pages/status/Maintenance'))
import SidebarLayout from '../layouts/SidebarLayout'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />

            {/* Authenticated App Routes with Sidebar */}
            <Route element={<SidebarLayout />}>
              <Route path="/app" element={<App />} />
              <Route path="/app/apps" element={<AppApps />} />
              {/* ... other app routes ... */}
              <Route path="/app/apps/permissions" element={<AppAppsPermissions />} />
              <Route path="/app/developer" element={<AppDeveloper />} />
              <Route path="/app/developer/audit" element={<AppDeveloperAudit />} />
              <Route path="/app/developer/docs" element={<AppDeveloperDocs />} />
              <Route path="/app/notifications" element={<AppNotifications />} />
              <Route path="/app/orgs" element={<AppOrgs />} />
              <Route path="/app/orgs/:orgId" element={<AppOrgsOrgId />} />
              <Route path="/app/orgs/:orgId/domain-verification" element={<AppOrgsOrgIdDomainVerification />} />
              <Route path="/app/orgs/:orgId/invite" element={<AppOrgsOrgIdInvite />} />
              <Route path="/app/orgs/:orgId/members" element={<AppOrgsOrgIdMembers />} />
              <Route path="/app/orgs/:orgId/provisioning" element={<AppOrgsOrgIdProvisioning />} />
              <Route path="/app/orgs/:orgId/roles-permissions" element={<AppOrgsOrgIdRolesPermissions />} />
              <Route path="/app/orgs/:orgId/settings" element={<AppOrgsOrgIdSettings />} />
              <Route path="/app/orgs/:orgId/sso" element={<AppOrgsOrgIdSso />} />
              <Route path="/app/orgs/switch" element={<AppOrgsSwitch />} />
              <Route path="/app/parental-controls" element={<AppParentalControls />} />
              <Route path="/app/privacy/consents" element={<AppPrivacyConsents />} />
              <Route path="/app/privacy/data-requests" element={<AppPrivacyDataRequests />} />
              <Route path="/app/privacy/delete-account" element={<AppPrivacyDeleteAccount />} />
              <Route path="/app/privacy/download" element={<AppPrivacyDownload />} />
              <Route path="/app/profile" element={<AppProfile />} />
              <Route path="/app/profile/contact" element={<AppProfileContact />} />
              <Route path="/app/profile/linked-accounts" element={<AppProfileLinkedAccounts />} />
              <Route path="/app/security" element={<AppSecurity />} />
              <Route path="/app/security/2fa" element={<AppSecurity2fa />} />
              <Route path="/app/security/2fa/setup" element={<AppSecurity2faSetup />} />
              <Route path="/app/security/activity" element={<AppSecurityActivity />} />
              <Route path="/app/security/change-password" element={<AppSecurityChangePassword />} />
              <Route path="/app/security/passkeys" element={<AppSecurityPasskeys />} />
              <Route path="/app/security/recovery-codes" element={<AppSecurityRecoveryCodes />} />
              <Route path="/app/security/sessions" element={<AppSecuritySessions />} />
              <Route path="/app/settings" element={<AppSettings />} />
              <Route path="/app/support" element={<AppSupport />} />
              <Route path="/app/support/security" element={<AppSupportSecurity />} />
              <Route path="/app/wallet" element={<AppWallet />} />
              <Route path="/app/wallet/add-funds" element={<AppWalletAddFunds />} />
              <Route path="/app/wallet/disputes" element={<AppWalletDisputes />} />
              <Route path="/app/wallet/kyc" element={<AppWalletKyc />} />
              <Route path="/app/wallet/kyc/details" element={<AppWalletKycDetails />} />
              <Route path="/app/wallet/kyc/status" element={<AppWalletKycStatus />} />
              <Route path="/app/wallet/kyc/upload" element={<AppWalletKycUpload />} />
              <Route path="/app/wallet/limits" element={<AppWalletLimits />} />
              <Route path="/app/wallet/payment-methods" element={<AppWalletPaymentMethods />} />
              <Route path="/app/wallet/payment-methods/add" element={<AppWalletPaymentMethodsAdd />} />
              <Route path="/app/wallet/transactions" element={<AppWalletTransactions />} />
              <Route path="/app/wallet/transactions/:txnId" element={<AppWalletTransactionsTxnId />} />
              <Route path="/app/wallet/withdraw" element={<AppWalletWithdraw />} />
            </Route> { /* End Sidebar Layout */}

            <Route path="/auth/account-recovery-help" element={<AuthAccountRecoveryHelp />} />
            <Route path="/auth/choose-account" element={<AuthChooseAccount />} />
            <Route path="/auth/consent" element={<AuthConsent />} />
            <Route path="/auth/continue" element={<AuthContinue />} />
            <Route path="/auth/error" element={<AuthError />} />
            <Route path="/auth/forgot-password" element={<AuthForgotPassword />} />
            <Route path="/auth/mfa" element={<AuthMfa />} />
            <Route path="/auth/passkey" element={<AuthPasskey />} />
            <Route path="/auth/re-auth" element={<AuthReAuth />} />
            <Route path="/auth/recovery-code" element={<AuthRecoveryCode />} />
            <Route path="/auth/reset-password" element={<AuthResetPassword />} />
            <Route path="/auth/set-password" element={<AuthSetPassword />} />
            <Route path="/auth/sign-in" element={<AuthSignIn />} />
            <Route path="/auth/sign-in/otp" element={<AuthSignInOtp />} />
            <Route path="/auth/sign-up" element={<AuthSignUp />} />
            <Route path="/admin/auth/*" element={<AdminAuthRouter />} />
            <Route path="/auth/signed-out" element={<AuthSignedOut />} />
            <Route path="/auth/verify-email" element={<AuthVerifyEmail />} />
            <Route path="/auth/verify-phone" element={<AuthVerifyPhone />} />
            <Route path="/errors/403" element={<Errors403 />} />
            <Route path="/errors/404" element={<Errors404 />} />
            <Route path="/errors/429" element={<Errors429 />} />
            <Route path="/errors/500" element={<Errors500 />} />
            <Route path="/legal/cookies" element={<LegalCookies />} />
            <Route path="/legal/privacy" element={<LegalPrivacy />} />
            <Route path="/legal/terms" element={<LegalTerms />} />
            <Route path="/org-invite/accept" element={<OrgInviteAccept />} />
            <Route path="/status" element={<Status />} />
            <Route path="/status/maintenance" element={<StatusMaintenance />} />
            <Route path="/admin/*" element={<AdminRouter />} />
            <Route path="*" element={<Errors404 />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}