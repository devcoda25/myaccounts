import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  MenuItem,
  Select,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useThemeStore } from "../../../../../stores/themeStore";
import { EVZONE } from "../../../../../theme/evzone";
import { api } from "../../../../../utils/api";
import { motion } from "framer-motion";

// Icons
function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}
function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}
function EditIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  )
}

type User = {
  id: string;
  email: string;
  firstName: string;
  otherNames: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
};

export default function AdminUsersPage() {
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" as "success" | "error" });

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit Role State
  const [editOpen, setEditOpen] = useState(false);
  const [editRole, setEditRole] = useState("USER");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const res = await api(`/users?skip=${skip}&take=${pageSize}&query=${encodeURIComponent(search)}`);
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: "Failed to load users", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]); // Re-fetch on page or search change

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await api(`/users/${selectedUser.id}`, { method: "DELETE" });
      setSnack({ open: true, msg: "User deleted successfully", severity: "success" });
      fetchUsers();
    } catch (err) {
      setSnack({ open: true, msg: "Failed to delete user", severity: "error" });
    } finally {
      setDeleteOpen(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await api(`/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: editRole })
      });
      setSnack({ open: true, msg: "Role updated", severity: "success" });
      fetchUsers();
    } catch (err) {
      setSnack({ open: true, msg: "Failed to update role", severity: "error" });
    } finally {
      setEditOpen(false);
    }
  }

  const openDelete = (u: User) => {
    setSelectedUser(u);
    setDeleteOpen(true);
  };

  const openEdit = (u: User) => {
    setSelectedUser(u);
    setEditRole(u.role);
    setEditOpen(true);
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>User Management</Typography>
      </Stack>

      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} // Reset page on search
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ maxWidth: 500 }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Card} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>Loading...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack>
                      <Typography variant="subtitle2" fontWeight={700}>{user.firstName} {user.otherNames}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'SUPER_ADMIN' ? 'error' : user.role === 'ADMIN' ? 'warning' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Chip label="Verified" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                    ) : (
                      <Chip label="Unverified" size="small" color="default" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Tooltip title="Edit Role">
                        <IconButton size="small" onClick={() => openEdit(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton size="small" color="error" onClick={() => openDelete(user)}>
                          <TrashIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              )))}
          </TableBody>
        </Table>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(total / pageSize)}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{selectedUser?.email}</b>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Update Role</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <Select fullWidth value={editRole} onChange={(e) => setEditRole(e.target.value)}>
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
