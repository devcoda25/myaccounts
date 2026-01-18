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
import AddStationDialog from './components/dialogs/AddStationDialog';
import {
  ChildStatus, Channel, AppKey, SchedulePreset, AgeTemplate, Place, GeoFences, Curfew, ChargingControls, ChildProfile, ActivityEvent, ApprovalKind, PendingApproval, HouseholdRole, HouseholdMember, ApprovalMode, GuardianContext
} from './types';
import { getStyles, EVZONE } from './styles';
import { calcAge, makeInviteCode } from './utils';
import { useThemeStore } from "@/stores/themeStore";
import {
  SunIcon, MoonIcon, GlobeIcon, ShieldIcon, UsersIcon, UserIcon, WalletIcon, CalendarIcon, LayoutIcon, XCircleIcon, CheckCircleIcon, LockIcon, ClockIcon, BellIcon, SchoolIcon, ShoppingBagIcon, PinIcon, ZapIcon, PlusIcon, LinkIcon, KeypadIcon, SmsIcon, WhatsAppIcon
} from './components/icons/ParentalIcons';
import { api } from "@/utils/api";

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
// Component logic moved to state
// -----------------------------


// redundant code removed



export default function ParentalControls() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const selectedChild = useMemo(() => children.find((c) => c.id === selectedChildId) || children[0] || null, [children, selectedChildId]);

  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  const [tab, setTab] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(0);

  // Household
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>("Any guardian");

  // Guardian context
  const [activeContextId, setActiveContextId] = useState<string>("ctx_personal");
  const contexts = useMemo(() => [
    { id: "ctx_personal", label: "Personal", subtitle: "Your personal account" },
    { id: "ctx_work", label: "Work", subtitle: "Work/Organization context" },
  ], []);
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
  const [addStationOpen, setAddStationOpen] = useState(false);

  // Step-up
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [stepUpTitle, setStepUpTitle] = useState("Confirm");
  const [stepUpSubtitle, setStepUpSubtitle] = useState("");
  const stepUpActionRef = useRef<null | (() => void)>(null);

  const fetchData = async () => {
    try {
      const [childData, householdData, approvalData, activityData] = await Promise.all([
        api<ChildProfile[]>('/parental/children'),
        api<{ members: HouseholdMember[], approvalMode: ApprovalMode }>('/parental/household'),
        api<PendingApproval[]>('/parental/approvals'),
        api<ActivityEvent[]>('/parental/activity')
      ]);
      setChildren(childData);
      if (childData.length > 0 && !selectedChildId) {
        setSelectedChildId(childData[0].id);
      }
      setHouseholdMembers(householdData.members);
      setApprovalMode(householdData.approvalMode);
      setApprovals(approvalData);
      setActivity(activityData);
    } catch (err) {
      console.error("Failed to fetch parental data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeContextId]);

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

  const { evOrangeContainedSx, evOrangeOutlinedSx, cardSx, EVZONE = { green: "#03CD8C", orange: "#F97316" } } = getStyles(theme, mode);
  const consentBanner = useMemo(() => children.some((c) => !c.guardianVerified), [children]);

  const summary = useMemo(() => {
    const supervised = children.length;
    const pendingApprovals = approvals.filter((a) => a.status === "Pending").length;
    const blocked = activity.filter((e) => e.kind === "Blocked").length;
    const unverified = children.filter((c) => !c.guardianVerified).length;
    return { supervised, pendingApprovals, blocked, unverified };
  }, [children, approvals, activity]);

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

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: pageBg }}>
        <Typography variant="h5" color="text.secondary">Loading Parental Controls...</Typography>
      </Box>
    );
  }


  const childAge = selectedChild ? calcAge(selectedChild.dob) : 0;

  const updateChild = async (id: string, patch: Partial<ChildProfile>, event?: Omit<ActivityEvent, "id" | "at" | "childId">) => {
    try {
      await api<void>(`/parental/children/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ patch, audit: event })
      });
      await fetchData();
    } catch (err) {
      setSnack({ open: true, severity: "error", msg: "Failed to update child settings." });
    }
  };

  const approveRequest = (id: string, approve: boolean) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    requestStepUp(
      approve ? "Approve request" : "Decline request",
      approve ? "This will allow the child to continue." : "This will decline the request.",
      async () => {
        try {
          await api<void>(`/parental/approvals/${id}/decide`, {
            method: 'POST',
            body: JSON.stringify({ approve })
          });
          await fetchData();
          setSnack({ open: true, severity: approve ? "success" : "info", msg: approve ? "Approved." : "Declined." });
        } catch (err) {
          setSnack({ open: true, severity: "error", msg: "Failed to process approval." });
        }
      }
    );
  };

  const openLink = () => {
    setLinkOpen(true);
  };

  const submitLink = (code: string) => {
    requestStepUp("Link child account", "Linking changes supervision and privacy settings.", async () => {
      try {
        await api<void>('/parental/children/link', {
          method: 'POST',
          body: JSON.stringify({ code })
        });
        await fetchData();
        setLinkOpen(false);
        setSnack({ open: true, severity: "success", msg: "Child account linked." });
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Failed to link child account." });
      }
    });
  };

  const openCreate = () => {
    setCreateOpen(true);
  };

  const submitCreate = (name: string, dob: string, school: string) => {
    requestStepUp("Create supervised child", "Creating a child sets you as the guardian.", async () => {
      try {
        await api<void>('/parental/children/create', {
          method: 'POST',
          body: JSON.stringify({ name, dob, school: school || "EVzone School" })
        });
        await fetchData();
        setCreateOpen(false);
        setSnack({ open: true, severity: "success", msg: "Child created." });
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Failed to create child." });
      }
    });
  };

  const openInvite = (role: HouseholdRole) => {
    setInviteRole(role);
    setInviteOpen(true);
  };

  const submitInvite = (name: string, email: string, phone: string, channels: Record<Channel, boolean>) => {
    requestStepUp("Invite household member", "Inviting a guardian changes supervision permissions.", async () => {
      try {
        await api<void>('/parental/household/members', {
          method: 'POST',
          body: JSON.stringify({ name, email, phone, role: inviteRole, channels })
        });
        await fetchData();
        setInviteOpen(false);
        setSnack({ open: true, severity: "success", msg: "Invite sent." });
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Failed to invite member." });
      }
    });
  };

  const removeMember = (id: string) => {
    requestStepUp("Remove household member", "This removes access and disables alerts for that member.", async () => {
      try {
        await api<void>(`/parental/household/members/${id}`, {
          method: 'DELETE'
        });
        await fetchData();
        setSnack({ open: true, severity: "success", msg: "Removed." });
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Failed to remove member." });
      }
    });
  };

  const openPlaceEditor = (target: "Home" | "School") => {
    if (!selectedChild) return;
    setPlaceTarget(target);
    // Address/Radius logic moved to component
    setPlaceOpen(true);
  };

  const savePlace = (id: string, type: "Home" | "School", place: Place) => {
    const patch: Partial<ChildProfile> = {
      geofences: {
        ...selectedChild?.geofences,
        [type.toLowerCase() as "home" | "school"]: place,
        enabled: true,
      } as GeoFences,
    };
    updateChild(id, patch, { kind: "Safety Updated", summary: `Updated ${type} location: ${place.address}`, severity: "info" });
    setPlaceOpen(false);
  };

  const applyTemplate = (template: AgeTemplate) => {
    if (!selectedChild) return;
    const patch = getTemplatePatch(template, selectedChild);
    updateChild(selectedChild.id, patch, { kind: "Template Applied", summary: `Applied ${template} constraints`, severity: "info" });
  };

  const updateApprovalMode = (mode: ApprovalMode) => {
    requestStepUp("Update approval mode", "This changes who can approve requests.", async () => {
      try {
        await api<void>('/parental/household/mode', {
          method: 'PATCH',
          body: JSON.stringify({ mode })
        });
        await fetchData();
        setSnack({ open: true, severity: "success", msg: "Approval mode updated." });
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Failed to update approval mode." });
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
    setAddStationOpen(true);
  };

  const submitAddStation = (name: string) => {
    if (!selectedChild) return;
    requestStepUp("Add allowed station", "This changes where charging is allowed.", () => {
      const next = Array.from(new Set([...(selectedChild.charging.allowedStations || []), name]));
      updateChild(
        selectedChild.id,
        { charging: { ...selectedChild.charging, enabled: true, allowedStations: next } },
        { kind: "Charging Updated", summary: "Added allowed charging station", severity: "info" }
      );
      setSnack({ open: true, severity: "success", msg: "Station added." });
      setAddStationOpen(false);
    });
  };





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
        currentPlace={(selectedChild?.geofences.home || selectedChild?.geofences.school) || undefined}
        onSave={(p: Place) => {
          if (selectedChild) savePlace(selectedChild.id, placeTarget, p);
        }}
      />

      <AddStationDialog
        open={addStationOpen}
        setOpen={setAddStationOpen}
        onSubmit={submitAddStation}
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

