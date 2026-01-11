import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from '../components/errors/ErrorBoundary'
import RouteLoader from '../components/loading/RouteLoader'

const App = lazy(() => import('../features/dashboard/Index'))
const AppApps = lazy(() => import('../features/apps/Apps'))
const AppAppsPermissions = lazy(() => import('../features/apps/AppsPermissions'))
const AppDeveloper = lazy(() => import('../features/developer/Index'))
const AppDeveloperAudit = lazy(() => import('../features/developer/DeveloperAudit'))
const AppDeveloperDocs = lazy(() => import('../features/developer/DeveloperDocs'))
const AppNotifications = lazy(() => import('../features/notifications/Index'))
const AppOrgs = lazy(() => import('../features/orgs/Orgs'))
const AppOrgsOrgId = lazy(() => import('../features/orgs/OrgsOrgId'))
const AppOrgsOrgIdDomainVerification = lazy(() => import('../features/orgs/OrgsOrgIdDomainVerification'))
const AppOrgsOrgIdInvite = lazy(() => import('../features/orgs/OrgsOrgIdInvite'))
const AppOrgsOrgIdMembers = lazy(() => import('../features/orgs/OrgsOrgIdMembers'))
const AppOrgsOrgIdProvisioning = lazy(() => import('../features/orgs/OrgsOrgIdProvisioning'))
const AppOrgsOrgIdRolesPermissions = lazy(() => import('../features/orgs/OrgsOrgIdRolesPermissions'))
const AppOrgsOrgIdSettings = lazy(() => import('../features/orgs/OrgsOrgIdSettings'))
const AppOrgsOrgIdSso = lazy(() => import('../features/orgs/OrgsOrgIdSso'))
const AppOrgsSwitch = lazy(() => import('../features/orgs/OrgsSwitch'))
const AppParentalControls = lazy(() => import('../features/parental/Index'))
const AppPrivacyConsents = lazy(() => import('../features/privacy/PrivacyConsents'))
const AppPrivacyDataRequests = lazy(() => import('../features/privacy/PrivacyDataRequests'))
const AppPrivacyDeleteAccount = lazy(() => import('../features/privacy/PrivacyDeleteAccount'))
const AppPrivacyDownload = lazy(() => import('../features/privacy/PrivacyDownload'))
const AppProfile = lazy(() => import('../features/profile/Profile'))
const AppProfileContact = lazy(() => import('../features/profile/ProfileContact'))
const AppProfileLinkedAccounts = lazy(() => import('../features/profile/ProfileLinkedAccounts'))
const AppSecurity = lazy(() => import('../features/security/Security'))
const AppSecurity2fa = lazy(() => import('../features/security/Security2fa'))
const AppSecurity2faSetup = lazy(() => import('../features/security/Security2faSetup'))
const AppSecurityActivity = lazy(() => import('../features/security/SecurityActivity'))
const AppSecurityChangePassword = lazy(() => import('../features/security/SecurityChangePassword'))
const AppSecurityPasskeys = lazy(() => import('../features/security/SecurityPasskeys'))
const AppSecurityRecoveryCodes = lazy(() => import('../features/security/SecurityRecoveryCodes'))
const AppSecuritySessions = lazy(() => import('../features/security/SecuritySessions'))
const AppSettings = lazy(() => import('../features/settings/Settings'))
const AppSupport = lazy(() => import('../features/support/Support'))
const AppSupportSecurity = lazy(() => import('../features/support/SupportSecurity'))
const AppWallet = lazy(() => import('../features/wallet/Wallet'))
const AppWalletAddFunds = lazy(() => import('../features/wallet/WalletAddFunds')) // Assuming this file was moved
const AppWalletDisputes = lazy(() => import('../features/wallet/WalletDisputes'))
const AppWalletKyc = lazy(() => import('../features/wallet/WalletKyc'))
const AppWalletKycDetails = lazy(() => import('../features/wallet/WalletKycDetails'))
const AppWalletKycStatus = lazy(() => import('../features/wallet/WalletKycStatus'))
const AppWalletKycUpload = lazy(() => import('../features/wallet/WalletKycUpload'))
const AppWalletLimits = lazy(() => import('../features/wallet/WalletLimits'))
const AppWalletPaymentMethods = lazy(() => import('../features/wallet/WalletPaymentMethods'))
const AppWalletPaymentMethodsAdd = lazy(() => import('../features/wallet/WalletPaymentMethodsAdd'))
const AppWalletTransactions = lazy(() => import('../features/wallet/WalletTransactions'))
const AppWalletTransactionsTxnId = lazy(() => import('../features/wallet/WalletTransactionsTxnId'))
const AppWalletWithdraw = lazy(() => import('../features/wallet/WalletWithdraw'))
const AuthAccountRecoveryHelp = lazy(() => import('../features/auth/account-recovery-help/Index'))
const AuthChooseAccount = lazy(() => import('../features/auth/choose-account/Index'))
const AuthConsent = lazy(() => import('../features/auth/consent/Index'))
const AuthContinue = lazy(() => import('../features/auth/continue/Index'))
const AuthError = lazy(() => import('../features/auth/error/Index'))
const AuthForgotPassword = lazy(() => import('../features/auth/forgot-password/Index'))
const AuthMfa = lazy(() => import('../features/auth/mfa/Index'))
const NotFound = React.lazy(() => import('../features/errors/NotFound'));
const AdminRouter = React.lazy(() => import('./AdminRouter'));
const AdminAuthRouter = lazy(() => import('./AdminAuthRouter'));
const AuthPasskey = lazy(() => import('../features/auth/passkey/Index'))
const AuthReAuth = lazy(() => import('../features/auth/re-auth/Index'))
const AuthRecoveryCode = lazy(() => import('../features/auth/recovery-code/Index'))
const AuthResetPassword = lazy(() => import('../features/auth/reset-password/Index'))
const AuthSetPassword = lazy(() => import('../features/auth/set-password/Index'))
const AuthCallback = lazy(() => import('../features/auth/Callback'))
const AuthSignIn = lazy(() => import('../features/auth/sign-in/Index'))
const AuthSignInOtp = lazy(() => import('../features/auth/sign-in/Otp'))
const AuthSignUp = lazy(() => import('../features/auth/sign-up/Index'))
const AuthSignedOut = lazy(() => import('../features/auth/signed-out/Index'))
const AuthVerifyEmail = lazy(() => import('../features/auth/verify-email/Index'))
const AuthVerifyPhone = lazy(() => import('../features/auth/verify-phone/Index'))
const Errors403 = lazy(() => import('../features/errors/Error403'))
const Errors404 = lazy(() => import('../features/errors/Error404'))
const Errors429 = lazy(() => import('../features/errors/Error429'))
const Errors500 = lazy(() => import('../features/errors/Error500'))
const LegalCookies = lazy(() => import('../features/legal/Cookies'))
const LegalPrivacy = lazy(() => import('../features/legal/Privacy'))
const LegalTerms = lazy(() => import('../features/legal/Terms'))
const OrgInviteAccept = lazy(() => import('../features/org-invite/Accept'))
const Status = lazy(() => import('../features/status/Index'))
const StatusMaintenance = lazy(() => import('../features/status/Maintenance'))
import SidebarLayout from '../layouts/SidebarLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminProtectedRoute from '../components/auth/AdminProtectedRoute'

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />

          {/* Authenticated App Routes with Sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/app" element={<App />} />
              <Route path="/app/apps" element={<AppApps />} />
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
            </Route>
          </Route> { /* End Sidebar Layout */}

          <Route path="/auth/account-recovery-help" element={<AuthAccountRecoveryHelp />} />
          <Route path="/auth/choose-account" element={<AuthChooseAccount />} />
          <Route path="/auth/consent" element={<ProtectedRoute><AuthConsent /></ProtectedRoute>} />
          <Route path="/auth/continue" element={<AuthContinue />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="/auth/forgot-password" element={<AuthForgotPassword />} />
          <Route path="/auth/mfa" element={<AuthMfa />} />
          <Route path="/auth/passkey" element={<AuthPasskey />} />
          <Route path="/auth/re-auth" element={<AuthReAuth />} />
          <Route path="/auth/recovery-code" element={<AuthRecoveryCode />} />
          <Route path="/auth/reset-password" element={<AuthResetPassword />} />
          <Route path="/auth/set-password" element={<AuthSetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
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
          <Route path="/accept-invite" element={<StartRedirect to="/org-invite/accept" />} />
          <Route path="/status" element={<Status />} />
          <Route path="/status/maintenance" element={<StatusMaintenance />} />
          <Route path="/admin/*" element={<AdminProtectedRoute><AdminRouter /></AdminProtectedRoute>} />
          <Route path="*" element={<Errors404 />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>

  )
}

function StartRedirect({ to }: { to: string }) {
  // Preserve query params
  const { search } = window.location;
  if (typeof window === "undefined") return <Navigate to={to} replace />;
  return <Navigate to={to + search} replace />;
}