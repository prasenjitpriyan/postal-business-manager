'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  UserCheck,
  ShieldAlert,
  Users,
  Search,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Eye,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Viewer';
  createdAt: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const { user: currentUser, login, token } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const { data, isLoading, error } = useQuery<{ data: UserRecord[] }>({
    queryKey: ['usersList'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    enabled: isAdmin,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: 'Super Admin' | 'Admin' | 'Viewer';
    }) => {
      setUpdatingId(userId);
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to update user role');
      }
      return resData;
    },
    onSuccess: (resData, variables) => {
      toast.success(resData.message || 'User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['usersList'] });

      // If updating current user's role in the store
      if (currentUser && currentUser._id === variables.userId && token) {
        login({ ...currentUser, role: variables.newRole }, token);
      }
      setUpdatingId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update user role');
      setUpdatingId(null);
    },
  });

  const claimSuperAdminMutation = useMutation({
    mutationFn: async () => {
      setIsClaiming(true);
      const res = await fetch('/api/users/claim-super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to claim Super Admin role');
      }
      return resData;
    },
    onSuccess: (resData) => {
      toast.success(resData.message || 'Super Admin privileges granted!');
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      if (currentUser && token && resData.data) {
        login(
          {
            _id: resData.data._id,
            name: resData.data.name,
            email: resData.data.email,
            role: resData.data.role,
          },
          token
        );
      }
      setIsClaiming(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to claim Super Admin role');
      setIsClaiming(false);
    },
  });

  useGSAP(
    () => {
      if (!isLoading && data?.data && data.data.length > 0) {
        gsap.fromTo(
          '.user-card-item',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
        );
      }
    },
    { scope: containerRef, dependencies: [data, isLoading] }
  );

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
        <p className="text-slate-400 max-w-md">
          User Access Control is restricted to Administrators &amp; Super Admins only. You are currently logged in as a Viewer.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const usersList = data?.data || [];
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = usersList.length;
  const superAdminCount = usersList.filter((u) => u.role === 'Super Admin').length;
  const adminCount = usersList.filter((u) => u.role === 'Admin').length;
  const viewerCount = usersList.filter((u) => u.role === 'Viewer').length;

  return (
    <div ref={containerRef} className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="user-card-item flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Crown className="w-4 h-4 text-emerald-400" />
            <span>3-Tier Access Control & Handover</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Management & Project Roles
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage permissions across Super Admin (Project Owner), Admin, and Viewer roles in real-time.
          </p>
        </div>

        {/* Claim Super Admin button for Project Creator */}
        {!isSuperAdmin && (
          <Button
            onClick={() => claimSuperAdminMutation.mutate()}
            disabled={isClaiming}
            className="bg-linear-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-purple-500/20 text-xs cursor-pointer flex items-center gap-2 hover:scale-102 transition-all"
          >
            {isClaiming ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Crown className="w-4 h-4 text-amber-300" />
            )}
            <span>Claim Super Admin (Creator Role)</span>
          </Button>
        )}
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="user-card-item bg-slate-950/50 backdrop-blur-md border border-white/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Accounts</p>
              <p className="text-2xl font-black text-white mt-1 font-mono">{isLoading ? '--' : totalUsers}</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="user-card-item bg-slate-950/50 backdrop-blur-md border border-emerald-500/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400">Super Admins (Owners)</p>
              <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{isLoading ? '--' : superAdminCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Crown className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="user-card-item bg-slate-950/50 backdrop-blur-md border border-amber-500/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Administrators</p>
              <p className="text-2xl font-black text-amber-400 mt-1 font-mono">{isLoading ? '--' : adminCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="user-card-item bg-slate-950/50 backdrop-blur-md border border-white/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Viewers (Read Only)</p>
              <p className="text-2xl font-black text-indigo-400 mt-1 font-mono">{isLoading ? '--' : viewerCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Eye className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="user-card-item space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-slate-950/60 border-white/10 text-white rounded-xl focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{filteredUsers.length}</span> of {totalUsers} accounts
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 backdrop-blur-md overflow-x-auto shadow-xl">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-slate-300 font-bold text-xs uppercase tracking-wider">User Details</TableHead>
                <TableHead className="text-slate-300 font-bold text-xs uppercase tracking-wider">Email Address</TableHead>
                <TableHead className="text-slate-300 font-bold text-xs uppercase tracking-wider">Current Role</TableHead>
                <TableHead className="text-slate-300 font-bold text-xs uppercase tracking-wider">Joined Date</TableHead>
                <TableHead className="text-right text-slate-300 font-bold text-xs uppercase tracking-wider">Role Actions &amp; Handover</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      <span>Loading registered accounts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 text-center text-red-400">
                    {(error as Error).message}
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 text-center text-slate-400">
                    No users matching &quot;{search}&quot; found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => {
                  const isUpdating = updatingId === u._id;
                  const isSelf = currentUser?._id === u._id;

                  return (
                    <TableRow key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md ${
                            u.role === 'Super Admin'
                              ? 'bg-linear-to-tr from-purple-600 via-indigo-600 to-emerald-500 ring-2 ring-emerald-500/40'
                              : u.role === 'Admin'
                              ? 'bg-linear-to-tr from-amber-600 to-orange-600'
                              : 'bg-linear-to-tr from-blue-600 to-indigo-600'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white flex items-center gap-1.5">
                              {u.name}
                              {isSelf && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">{u.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            u.role === 'Super Admin'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                              : u.role === 'Admin'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10'
                              : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {u.role === 'Super Admin' ? (
                            <Crown className="w-3.5 h-3.5 text-emerald-400" />
                          ) : u.role === 'Admin' ? (
                            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs font-mono">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Super Admin Handover / Upgrade options */}
                          {isSuperAdmin && u.role !== 'Super Admin' && (
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() =>
                                updateRoleMutation.mutate({ userId: u._id, newRole: 'Super Admin' })
                              }
                              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              ) : (
                                <Crown className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                              )}
                              Handover Super Admin
                            </Button>
                          )}

                          {/* Admin Upgrade option */}
                          {u.role === 'Viewer' && (
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() =>
                                updateRoleMutation.mutate({ userId: u._id, newRole: 'Admin' })
                              }
                              className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-amber-400" />
                              )}
                              Upgrade to Admin
                            </Button>
                          )}

                          {/* Demote option */}
                          {u.role !== 'Viewer' && (isSuperAdmin || (currentUser?.role === 'Admin' && u.role === 'Admin' && !isSelf)) && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isUpdating}
                              onClick={() =>
                                updateRoleMutation.mutate({ userId: u._id, newRole: 'Viewer' })
                              }
                              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/10 hover:text-slate-100 rounded-xl text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              ) : (
                                <ArrowDownRight className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                              )}
                              Demote to Viewer
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
