import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AlertColor,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import SummaryStats from './components/SummaryStats';
import HouseholdSnapshot from './components/HouseholdSnapshot';
import FamilySupervision from './components/FamilySupervision';
import StepUpDialog from './components/StepUpDialog';
import ContextSwitcher from './components/dialogs/ContextSwitcher';
import LinkChildDialog from './components/dialogs/LinkChildDialog';
import CreateChildDialog from './components/dialogs/CreateChildDialog';
import InviteHouseholdMemberDialog from './components/dialogs/InviteHouseholdMemberDialog';
import PlaceEditorDialog from './components/dialogs/PlaceEditorDialog';
import {
  ChildStatus, Channel, AppKey, SchedulePreset, AgeTemplate, Place, GeoFences, Curfew, ChargingControls, ChildProfile, ActivityEvent, ApprovalKind, PendingApproval, HouseholdRole, HouseholdMember, ApprovalMode, GuardianContext
} from './types';
import { getStyles, EVZONE } from './styles';
import { calcAge, makeInviteCode } from './utils';
import { useThemeContext } from '../../../theme/ThemeContext';
import {
  SunIcon, MoonIcon, GlobeIcon, ShieldIcon, UsersIcon, UserIcon, WalletIcon, CalendarIcon, LayoutIcon, XCircleIcon, CheckCircleIcon, LockIcon, ClockIcon, BellIcon, SchoolIcon, ShoppingBagIcon, PinIcon, ZapIcon, PlusIcon, LinkIcon, KeypadIcon, SmsIcon, WhatsAppIcon
} from './components/icons/ParentalIcons';

type Severity = AlertColor;

/**
 * EVzone My Accounts - Parental Controls (Enhanced)
 * Route: /app/parental-controls
 *
 * Improvements added:
 * 1) Household management: co-guardians + emergency contacts
 * 2) Age templates: Child/Teen/Young adult/Custom presets
 * 3) Safety controls: Curfew + Geofences
 * 4) Expanded approvals: Purchases + Rides/Trips/Service bookings
 * 5) Charging restrictions: EVzone Charging caps (kWh) when enabled
 * 6) Account context switcher (guardian context)
 */




// -----------------------------
// Helpers
// -----------------------------


function getTemplatePatch(template: AgeTemplate, c: ChildProfile): Partial<ChildProfile> {
  const baseBlocks = Array.from(new Set(["Adult", "Alcohol", "Gambling", ...(c.categoryBlocks || [])]));

  if (template === "Child (6-12)") {
    return {
      template,
      dailyLimit: Math.min(c.dailyLimit, 10000) || 10000,
      weeklyLimit: Math.min(c.weeklyLimit, 40000) || 40000,
      requireApprovalAbove: 5000,
      requireApprovalForAllPurchases: true,
      allowWithdrawals: false,
      allowPeerTransfers: false,
      allowSavedCards: false,
      allowUnknownContacts: false,
      allowAttachments: false,
      allowVoiceCalls: false,
      preset: "School days",
      dailyWindow: { start: "06:00", end: "20:00" },
      bedtimeLock: true,
      marketingOptOut: true,
      publicProfile: false,
      locationSharing: true,
      apps: {
        ...c.apps,
        "EVzone School": true,
        EduMart: true,
        "EVzone Marketplace": false,
        ShopNow: true,
        "EVzone Charging": false,
        ServiceMart: false,
        Properties: false,
        Fashion: false,
        Art: false,
      },
      categoryBlocks: baseBlocks,
      curfew: { ...c.curfew, enabled: true, start: "20:30", end: "06:00", hardLock: true, allowSchoolOnlyDuringCurfew: true },
      geofences: { ...c.geofences, enabled: true, alertsOnEnterLeave: true },
    };
  }

  if (template === "Teen (13-17)") {
    return {
      template,
      dailyLimit: Math.max(c.dailyLimit, 15000) || 15000,
      weeklyLimit: Math.max(c.weeklyLimit, 80000) || 80000,
      requireApprovalAbove: 15000,
      requireApprovalForAllPurchases: false,
      allowWithdrawals: false,
      allowPeerTransfers: false,
      allowSavedCards: false,
      allowUnknownContacts: false,
      allowAttachments: true,
      allowVoiceCalls: false,
      preset: c.preset === "Always allowed" ? "Custom" : c.preset,
      bedtimeLock: true,
      marketingOptOut: true,
      publicProfile: false,
      locationSharing: true,
      apps: {
        ...c.apps,
        "EVzone School": true,
        EduMart: true,
        "EVzone Marketplace": true,
        ShopNow: true,
      },
      categoryBlocks: baseBlocks,
      curfew: { ...c.curfew, enabled: true, start: "21:30", end: "06:00", hardLock: false, allowSchoolOnlyDuringCurfew: false },
      geofences: { ...c.geofences, enabled: true, alertsOnEnterLeave: true },
    };
  }

  if (template === "Young adult (18+)") {
    return {
      template,
      requireApprovalForAllPurchases: false,
      requireApprovalAbove: Math.max(20000, c.requireApprovalAbove || 0),
      allowWithdrawals: c.allowWithdrawals,
      allowPeerTransfers: c.allowPeerTransfers,
      allowSavedCards: c.allowSavedCards,
      allowUnknownContacts: c.allowUnknownContacts,
      allowAttachments: true,
      allowVoiceCalls: true,
      bedtimeLock: false,
      publicProfile: c.publicProfile,
      marketingOptOut: c.marketingOptOut,
      geofences: { ...c.geofences, enabled: false },
      curfew: { ...c.curfew, enabled: false },
    };
  }

  return { template };
}

// -----------------------------
// Demo data
// -----------------------------
function buildDemoChildren(): ChildProfile[] {
  const baseApps: Record<AppKey, boolean> = {
    "EVzone School": true,
    EduMart: true,
    "EVzone Marketplace": false,
    "EVzone Charging": false,
    ServiceMart: false,
    ShopNow: false,
    Properties: false,
    Fashion: false,
    Art: false,
  };

  return [
    {
      id: "c_1001",
      name: "Amina K.",
      dob: "2012-05-14",
      status: "Active",
      school: "EVzone School",
      grade: "P.6",
      country: "Uganda",
      guardianRelationship: "Parent",
      template: "Child (6-12)",
      currency: "UGX",
      dailyLimit: 15000,
      weeklyLimit: 60000,
      requireApprovalAbove: 10000,
      allowWithdrawals: false,
      allowPeerTransfers: false,
      allowSavedCards: false,
      apps: { ...baseApps, "EVzone Marketplace": true, ShopNow: true },
      categoryBlocks: ["Adult", "Alcohol", "Gambling"],
      sellerWhitelist: ["EVzone Official Store"],
      requireApprovalForAllPurchases: false,
      allowTeacherMentorChat: true,
      allowUnknownContacts: false,
      allowAttachments: true,
      allowVoiceCalls: false,
      preset: "School days",
      dailyWindow: { start: "06:00", end: "20:30" },
      bedtimeLock: true,
      geofences: {
        enabled: true,
        alertsOnEnterLeave: true,
        home: { label: "Home", address: "Nsambya, Kampala", radiusKm: 2 },
        school: { label: "School", address: "Elite High School", radiusKm: 2 },
      },
      curfew: { enabled: true, start: "20:30", end: "06:00", hardLock: true, allowSchoolOnlyDuringCurfew: true },
      charging: { enabled: false, dailyKwhCap: 0, sessionKwhCap: 0, requireApprovalAboveKwh: 0, allowedStations: [] },
      locationSharing: true,
      publicProfile: false,
      marketingOptOut: true,
      guardianChannels: { Email: true, SMS: true, WhatsApp: true },
      guardianVerified: true,
      consentVersion: "v1.0",
      consentAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    },
    {
      id: "c_1002",
      name: "Brian M.",
      dob: "2014-11-02",
      status: "Active",
      school: "Elite High School",
      grade: "S.1",
      country: "Uganda",
      guardianRelationship: "Guardian",
      template: "Child (6-12)",
      currency: "UGX",
      dailyLimit: 8000,
      weeklyLimit: 35000,
      requireApprovalAbove: 5000,
      allowWithdrawals: false,
      allowPeerTransfers: false,
      allowSavedCards: false,
      apps: { ...baseApps, EduMart: false, "EVzone Marketplace": false, ShopNow: true },
      categoryBlocks: ["Adult", "Alcohol", "Gambling", "Electronics"],
      sellerWhitelist: [],
      requireApprovalForAllPurchases: true,
      allowTeacherMentorChat: true,
      allowUnknownContacts: false,
      allowAttachments: false,
      allowVoiceCalls: false,
      preset: "Custom",
      dailyWindow: { start: "07:00", end: "19:00" },
      bedtimeLock: true,
      geofences: { enabled: false, alertsOnEnterLeave: false, home: null, school: null },
      curfew: { enabled: true, start: "19:30", end: "06:30", hardLock: true, allowSchoolOnlyDuringCurfew: true },
      charging: { enabled: false, dailyKwhCap: 0, sessionKwhCap: 0, requireApprovalAboveKwh: 0, allowedStations: [] },
      locationSharing: false,
      publicProfile: false,
      marketingOptOut: true,
      guardianChannels: { Email: true, SMS: true, WhatsApp: false },
      guardianVerified: false,
      consentVersion: "v1.0",
      consentAt: undefined,
    },
  ];
}

function buildDemoApprovals(children: ChildProfile[]): PendingApproval[] {
  const now = Date.now();
  return [
    {
      id: "ap_1001",
      childId: children[0]?.id || "c_1001",
      at: now - 1000 * 60 * 18,
      kind: "Purchase",
      title: "EduMart: Mathematics workbook",
      amount: 12000,
      currency: "UGX",
      reason: "Above approval threshold",
      vendor: "EduMart",
      app: "EduMart",
      details: "Workbook for Term 1",
      status: "Pending",
    },
    {
      id: "ap_1002",
      childId: children[1]?.id || "c_1002",
      at: now - 1000 * 60 * 55,
      kind: "Purchase",
      title: "ShopNow: Snacks and water",
      amount: 6000,
      currency: "UGX",
      reason: "All purchases require approval",
      vendor: "ShopNow",
      app: "ShopNow",
      details: "Delivery to school gate",
      status: "Pending",
    },
    {
      id: "ap_1003",
      childId: children[0]?.id || "c_1001",
      at: now - 1000 * 60 * 85,
      kind: "Trip",
      title: "School trip: Museum entry",
      amount: 20000,
      currency: "UGX",
      reason: "Trips require guardian approval",
      vendor: "EVzone School",
      app: "EVzone School",
      details: "Trip: Kampala Museum (Saturday)",
      status: "Pending",
    },
  ];
}

function buildDemoActivity(children: ChildProfile[]): ActivityEvent[] {
  const now = Date.now();
  const c1 = children[0]?.id || "c_1001";
  const c2 = children[1]?.id || "c_1002";
  return [
    { id: "ev_01", at: now - 1000 * 60 * 6, kind: "Login", summary: "Signed in to EVzone School", severity: "info", childId: c1 },
    { id: "ev_02", at: now - 1000 * 60 * 18, kind: "Approval Requested", summary: "Approval requested for EduMart workbook", severity: "warning", childId: c1 },
    { id: "ev_03", at: now - 1000 * 60 * 25, kind: "Blocked", summary: "Blocked category attempt: Adult", severity: "warning", childId: c1 },
    { id: "ev_04", at: now - 1000 * 60 * 55, kind: "Approval Requested", summary: "Approval requested for ShopNow order", severity: "warning", childId: c2 },
    { id: "ev_05", at: now - 1000 * 60 * 70, kind: "Schedule Updated", summary: "Updated schedule window", severity: "info", childId: c2 },
  ];
}

function buildDemoHousehold(): { members: HouseholdMember[]; approvalMode: ApprovalMode } {
  return {
    approvalMode: "Any guardian",
    members: [
      {
        id: "h_01",
        role: "Co-guardian",
        status: "Active",
        name: "Ronald Isabirye",
        email: "ronald.isabirye@gmail.com",
        phone: "+256761677709",
        channels: { Email: true, SMS: true, WhatsApp: true },
        isPrimary: true,
      },
      {
        id: "h_02",
        role: "Co-guardian",
        status: "Pending",
        name: "Co-guardian Invite",
        email: "guardian2@example.com",
        phone: "+256700000000",
        channels: { Email: true, SMS: true, WhatsApp: false },
      },
      {
        id: "h_03",
        role: "Emergency contact",
        status: "Active",
        name: "Aunt Mary",
        email: "mary@example.com",
        phone: "+256704169173",
        channels: { Email: false, SMS: true, WhatsApp: true },
      },
    ],
  };
}

function buildGuardianContexts(): GuardianContext[] {
  return [
    { id: "ctx_personal", label: "Personal", subtitle: "Your personal account" },
    { id: "ctx_work", label: "Work", subtitle: "Work/Organization context" },
  ];
}

// redundant code removed



export default function ParentalControls() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  const demoChildren = useMemo(() => buildDemoChildren(), []);
  const [children, setChildren] = useState<ChildProfile[]>(() => demoChildren);
  const [selectedChildId, setSelectedChildId] = useState<string>(() => demoChildren[0]?.id || "c_1001");

  const selectedChild = useMemo(() => children.find((c) => c.id === selectedChildId) || children[0] || null, [children, selectedChildId]);

  const [approvals, setApprovals] = useState<PendingApproval[]>(() => buildDemoApprovals(demoChildren));
  const [activity, setActivity] = useState<ActivityEvent[]>(() => buildDemoActivity(demoChildren));

  const [tab, setTab] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(0);

  // Household
  const householdSeed = useMemo(() => buildDemoHousehold(), []);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(() => householdSeed.members);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>(() => householdSeed.approvalMode);

  // Guardian context
  const contexts = useMemo(() => buildGuardianContexts(), []);
  const [activeContextId, setActiveContextId] = useState<string>(() => contexts[0]?.id || "ctx_personal");
  const activeContext = useMemo(() => contexts.find((c) => c.id === activeContextId) || contexts[0], [contexts, activeContextId]);

  // Dialogs
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const [linkOpen, setLinkOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);

  // Household invite
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<HouseholdRole>("Co-guardian");

  // Place editor
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeTarget, setPlaceTarget] = useState<"Home" | "School">("Home");

  // Step-up
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [stepUpTitle, setStepUpTitle] = useState("Confirm");
  const [stepUpSubtitle, setStepUpSubtitle] = useState("");
  const stepUpActionRef = useRef<null | (() => void)>(null);

  // redundant code removed

  // No local mode effect needed anymore


  const requestStepUp = (title: string, subtitle: string, onVerified: () => void) => {
    stepUpActionRef.current = onVerified;
    setStepUpTitle(title);
    setStepUpSubtitle(subtitle);
    setStepUpOpen(true);
  };

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const { evOrangeContainedSx, evOrangeOutlinedSx, cardSx, EVZONE } = getStyles(theme, mode);

  const consentBanner = useMemo(() => children.some((c) => !c.guardianVerified), [children]);

  const summary = useMemo(() => {
    const supervised = children.length;
    const pendingApprovals = approvals.filter((a) => a.status === "Pending").length;
    const blocked = activity.filter((e) => e.kind === "Blocked").length;
    const unverified = children.filter((c) => !c.guardianVerified).length;
    return { supervised, pendingApprovals, blocked, unverified };
  }, [children, approvals, activity]);

  const childAge = selectedChild ? calcAge(selectedChild.dob) : 0;

  const updateChild = (id: string, patch: Partial<ChildProfile>, event?: Omit<ActivityEvent, "id" | "at" | "childId">) => {
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (event) {
      setActivity((prev) => [
        { id: `ev_${Date.now()}`, at: Date.now(), childId: id, kind: event.kind, summary: event.summary, severity: event.severity },
        ...prev,
      ]);
    }
  };

  const approveRequest = (id: string, approve: boolean) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    requestStepUp(
      approve ? "Approve request" : "Decline request",
      approve ? "This will allow the child to continue." : "This will decline the request.",
      () => {
        setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: approve ? "Approved" : "Declined" } : a)));
        setActivity((prev) => [
          {
            id: `ev_${Date.now()}`,
            at: Date.now(),
            childId: item.childId,
            kind: approve ? "Approval Approved" : "Approval Declined",
            summary: approve ? `Approved: ${item.title}` : `Declined: ${item.title}`,
            severity: approve ? "info" : "warning",
          },
          ...prev,
        ]);
        setSnack({ open: true, severity: approve ? "success" : "info", msg: approve ? "Approved." : "Declined." });
      }
    );
  };

  const openLink = () => {
    setLinkOpen(true);
  };

  const submitLink = (code: string) => {
    // Logic handled by dialog validation if needed, but here we just process
    requestStepUp("Link child account", "Linking changes supervision and privacy settings.", () => {
      const newId = `c_${Math.floor(1000 + Math.random() * 8999)}`;
      const child = getTemplatePatch("Child (6-12)", {
        ...children[0],
        id: newId,
        name: "Linked Child",
        dob: "2013-06-01",
        school: "EVzone School",
        grade: "P.5",
        guardianVerified: true,
        consentAt: Date.now(),
      } as ChildProfile);

      const base: ChildProfile = {
        ...(children[0] as ChildProfile),
        id: newId,
        name: "Linked Child",
        dob: "2013-06-01",
        school: "EVzone School",
        grade: "P.5",
        guardianVerified: true,
        consentAt: Date.now(),
        template: "Child (6-12)",
      };

      const merged: ChildProfile = { ...base, ...(child as any) };

      setChildren((prev) => [merged, ...prev]);
      setSelectedChildId(newId);
      setLinkOpen(false);
      setSnack({ open: true, severity: "success", msg: "Child account linked." });
    });
  };

  const openCreate = () => {
    setCreateOpen(true);
  };

  const submitCreate = (name: string, dob: string, school: string) => {
    requestStepUp("Create supervised child", "Creating a child sets you as the guardian.", () => {
      const newId = `c_${Math.floor(1000 + Math.random() * 8999)}`;

      const baseApps: Record<AppKey, boolean> = {
        "EVzone School": true,
        EduMart: true,
        "EVzone Marketplace": false,
        "EVzone Charging": false,
        ServiceMart: false,
        ShopNow: false,
        Properties: false,
        Fashion: false,
        Art: false,
      };

      const child: ChildProfile = {
        id: newId,
        name: name.trim(),
        dob: dob,
        status: "Active",
        school: school || "EVzone School",
        grade: "",
        country: "Uganda",
        guardianRelationship: "Parent",
        template: "Child (6-12)",
        currency: "UGX",
        dailyLimit: 5000,
        weeklyLimit: 20000,
        requireApprovalAbove: 5000,
        allowWithdrawals: false,
        allowPeerTransfers: false,
        allowSavedCards: false,
        apps: baseApps,
        categoryBlocks: ["Adult", "Alcohol", "Gambling"],
        sellerWhitelist: [],
        requireApprovalForAllPurchases: true,
        allowTeacherMentorChat: true,
        allowUnknownContacts: false,
        allowAttachments: false,
        allowVoiceCalls: false,
        preset: "School days",
        dailyWindow: { start: "06:30", end: "19:30" },
        bedtimeLock: true,
        geofences: { enabled: false, alertsOnEnterLeave: false, home: null, school: null },
        curfew: { enabled: true, start: "19:30", end: "06:30", hardLock: true, allowSchoolOnlyDuringCurfew: true },
        charging: { enabled: false, dailyKwhCap: 0, sessionKwhCap: 0, requireApprovalAboveKwh: 0, allowedStations: [] },
        locationSharing: false,
        publicProfile: false,
        marketingOptOut: true,
        guardianChannels: { Email: true, SMS: true, WhatsApp: false },
        guardianVerified: false,
        consentVersion: "v1.0",
        consentAt: undefined,
      };

      setChildren((prev) => [child, ...prev]);
      setSelectedChildId(newId);
      setCreateOpen(false);
      setSnack({ open: true, severity: "success", msg: "Child created (demo)." });
    });
  };

  const openInvite = (role: HouseholdRole) => {
    setInviteRole(role);
    setInviteOpen(true);
  };

  const submitInvite = (name: string, email: string, phone: string, channels: Record<Channel, boolean>) => {
    requestStepUp("Invite household member", "Inviting a guardian changes supervision permissions.", () => {
      const id = `h_${Math.floor(100 + Math.random() * 900)}`;
      const member: HouseholdMember = {
        id,
        role: inviteRole,
        status: "Pending",
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        channels: channels,
      };
      setHouseholdMembers((prev) => [member, ...prev]);
      setInviteOpen(false);
      setSnack({ open: true, severity: "success", msg: "Invite sent (demo)." });

      if (selectedChild) {
        setActivity((prev) => [
          { id: `ev_${Date.now()}`, at: Date.now(), childId: selectedChild.id, kind: "Household Updated", summary: `Invited ${inviteRole}: ${member.name}`, severity: "info" },
          ...prev,
        ]);
      }
    });
  };

  const removeMember = (id: string) => {
    const m = householdMembers.find((x) => x.id === id);
    if (!m) return;

    requestStepUp("Remove household member", "This removes access and disables alerts for that member.", () => {
      setHouseholdMembers((prev) => prev.filter((x) => x.id !== id));
      setSnack({ open: true, severity: "success", msg: "Removed." });

      if (selectedChild) {
        setActivity((prev) => [
          { id: `ev_${Date.now()}`, at: Date.now(), childId: selectedChild.id, kind: "Household Updated", summary: `Removed ${m.role}: ${m.name}`, severity: "warning" },
          ...prev,
        ]);
      }
    });
  };

  const openPlaceEditor = (target: "Home" | "School") => {
    if (!selectedChild) return;
    setPlaceTarget(target);
    // Address/Radius logic moved to component
    setPlaceOpen(true);
  };

  const savePlace = (place: Place) => {
    if (!selectedChild) return;

    requestStepUp("Update geofence", "Geofences may trigger safety alerts.", () => {
      const nextGeo: GeoFences = {
        ...selectedChild.geofences,
        enabled: true,
        [placeTarget.toLowerCase()]: place,
      } as any;
      updateChild(selectedChild.id, { geofences: nextGeo }, { kind: "Safety Updated", summary: `Updated ${placeTarget} geofence`, severity: "info" });
      setPlaceOpen(false);
      setSnack({ open: true, severity: "success", msg: "Geofence saved." });
    });
  };

  const applyTemplate = (template: AgeTemplate) => {
    if (!selectedChild) return;

    requestStepUp("Apply age template", "This updates multiple restrictions based on age group.", () => {
      const patch = getTemplatePatch(template, selectedChild);
      updateChild(
        selectedChild.id,
        patch,
        {
          kind: "Template Applied",
          summary: `Applied template: ${template}`,
          severity: "info",
        }
      );
      setSnack({ open: true, severity: "success", msg: `Template applied: ${template}.` });
    });
  };

  const updateApprovalMode = (mode: ApprovalMode) => {
    requestStepUp("Update approval mode", "This changes who can approve requests.", () => {
      setApprovalMode(mode);
      setSnack({ open: true, severity: "success", msg: "Approval mode updated." });

      if (selectedChild) {
        setActivity((prev) => [
          { id: `ev_${Date.now()}`, at: Date.now(), childId: selectedChild.id, kind: "Household Updated", summary: `Approval mode: ${mode}`, severity: "info" },
          ...prev,
        ]);
      }
    });
  };

  const updateCharging = (patch: Partial<ChargingControls>) => {
    if (!selectedChild) return;
    requestStepUp("Update charging restrictions", "Charging restrictions can block sessions.", () => {
      updateChild(
        selectedChild.id,
        { charging: { ...selectedChild.charging, ...patch } },
        { kind: "Charging Updated", summary: "Updated charging restrictions", severity: "info" }
      );
      setSnack({ open: true, severity: "success", msg: "Charging restrictions updated." });
    });
  };

  const addAllowedStation = () => {
    if (!selectedChild) return;
    requestStepUp("Add allowed station", "This changes where charging is allowed.", () => {
      const next = Array.from(new Set([...(selectedChild.charging.allowedStations || []), "EVzone Station - Nsambya"]));
      updateChild(
        selectedChild.id,
        { charging: { ...selectedChild.charging, enabled: true, allowedStations: next } },
        { kind: "Charging Updated", summary: "Added allowed charging station", severity: "info" }
      );
      setSnack({ open: true, severity: "success", msg: "Station added (demo)." });
    });
  };

  // Quick: keep charging controls disabled unless EVzone Charging app is allowed
  useEffect(() => {
    if (!selectedChild) return;
    const shouldEnable = !!selectedChild.apps["EVzone Charging"];
    if (selectedChild.charging.enabled && !shouldEnable) {
      updateChild(selectedChild.id, { charging: { ...selectedChild.charging, enabled: false } }, { kind: "Charging Updated", summary: "Disabled charging controls because app is blocked", severity: "warning" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild?.apps["EVzone Charging"]]);



  const householdCounts = useMemo(() => {
    const co = householdMembers.filter((m) => m.role === "Co-guardian").length;
    const em = householdMembers.filter((m) => m.role === "Emergency contact").length;
    const pending = householdMembers.filter((m) => m.status === "Pending").length;
    return { co, em, pending };
  }, [householdMembers]);

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      <CssBaseline />

      {/* Body */}
      <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Stack spacing={2.2}>
            {consentBanner ? (
              <Alert severity="warning" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                Some supervised accounts do not have a verified guardian. Verify guardian identity to enable stronger protections.
              </Alert>
            ) : null}

            <SummaryStats summary={summary} />

            <HouseholdSnapshot
              householdCounts={householdCounts}
              approvalMode={approvalMode}
              householdMembers={householdMembers}
              openInvite={openInvite}
              updateApprovalMode={updateApprovalMode}
            />

            <FamilySupervision
              children={children}
              selectedChildId={selectedChildId}
              setSelectedChildId={setSelectedChildId}
              selectedChild={selectedChild}
              approvals={approvals}
              activity={activity}
              householdMembers={householdMembers}
              updateChild={updateChild}
              requestStepUp={requestStepUp}
              setSnack={setSnack}
              openLink={openLink}
              openCreate={openCreate}
              approveRequest={approveRequest}
              updateCharging={updateCharging}
              addAllowedStation={addAllowedStation}
              openPlaceEditor={openPlaceEditor}
              removeMember={removeMember}
              openInvite={openInvite}
              applyTemplate={applyTemplate}
            />
          </Stack>
        </motion.div>
      </Box>
      {/* Footer */}
      <Box sx={{ opacity: 0.92, pb: 4, mt: 4 }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Â© {new Date().getFullYear()} EVzone Group. Parental Controls v2.0</Typography>
      </Box>
      {/* Context dialog */}
      <ContextSwitcher
        open={contextOpen}
        setOpen={setContextOpen}
        contexts={contexts}
        activeContextId={activeContextId}
        setActiveContextId={setActiveContextId}
        setSnack={setSnack}
      />

      {/* Link child dialog */}
      <LinkChildDialog
        open={linkOpen}
        setOpen={setLinkOpen}
        onSubmit={submitLink}
      />

      {/* Create child dialog */}
      <CreateChildDialog
        open={createOpen}
        setOpen={setCreateOpen}
        onSubmit={submitCreate}
      />

      {/* Household invite dialog */}
      <InviteHouseholdMemberDialog
        open={inviteOpen}
        setOpen={setInviteOpen}
        role={inviteRole}
        onSend={submitInvite}
      />

      {/* Place editor */}
      <PlaceEditorDialog
        open={placeOpen}
        setOpen={setPlaceOpen}
        target={placeTarget}
        currentPlace={selectedChild?.geofences.home || selectedChild?.geofences.school}
        onSave={savePlace}
      />

      {/* Step-up */}
      < StepUpDialog
        open={stepUpOpen}
        title={stepUpTitle}
        subtitle={stepUpSubtitle}
        onCancel={() => {
          setStepUpOpen(false);
          stepUpActionRef.current = null;
        }}
        onVerified={() => {
          const fn = stepUpActionRef.current;
          setStepUpOpen(false);
          stepUpActionRef.current = null;
          if (fn) fn();
        }}
      />

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant={mode === "dark" ? "filled" : "standard"}
          sx={{
            borderRadius: "4px",
            border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
            backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96),
            color: theme.palette.text.primary,
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box >
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={1.1} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "4px",
            display: "grid",
            placeItems: "center",
            backgroundColor: "rgba(3,205,140,0.12)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
      </Stack>
      <Typography sx={{ fontWeight: 950, textAlign: "right" }}>{value}</Typography>
    </Stack>
  );
}

