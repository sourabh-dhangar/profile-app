import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  Shield,
  Users,
  Film,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Lock,
  Play,
  Trash2,
  ExternalLink,
  Eye,
  Heart,
} from 'lucide-react';

const AdminPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [reels, setReels] = useState([]);
  const [activeTab, setActiveTab] = useState('reports'); // reports | users | reels
  const [loading, setLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState('all'); // all | pending | resolved
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | suspended
  const [reelSearch, setReelSearch] = useState('');
  const [reelStatusFilter, setReelStatusFilter] = useState('all'); // all | active | taken_down

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resAnalytics, resReports, resUsers, resReels] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/reports'),
        api.get('/admin/users'),
        api.get('/admin/reels?limit=100'),
      ]);

      if (resAnalytics.data.success) setAnalytics(resAnalytics.data.data);
      if (resReports.data.success) setReports(resReports.data.data.reports || []);
      if (resUsers.data.success) setUsers(resUsers.data.data.users || []);
      if (resReels.data.success) setReels(resReels.data.data.reels || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId, actionTaken) => {
    try {
      await api.put(`/admin/reports/${reportId}`, {
        status: 'resolved',
        actionTaken,
        adminNotes: `Action ${actionTaken} applied by admin`,
      });
      fetchAdminData();
    } catch (err) {
      alert('Failed to resolve report');
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, {
        accountStatus: newStatus,
      });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleUpdateReelStatus = async (reelId, newStatus) => {
    try {
      await api.put(`/admin/reels/${reelId}/status`, {
        status: newStatus,
        reason: `Admin moderation action: set status to ${newStatus}`,
      });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update reel status');
    }
  };

  const handleDeleteReel = async (reelId) => {
    if (!window.confirm('Permanently delete this reel from the platform? This action is irreversible.')) return;
    try {
      await api.delete(`/admin/reels/${reelId}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete reel');
    }
  };

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !userSearch.trim() ||
      (u.mobile && u.mobile.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u._id && u._id.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.profile?.name && u.profile.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.profile?.username && u.profile.username.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' || u.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredReels = reels.filter((r) => {
    const matchesSearch =
      !reelSearch.trim() ||
      (r.caption && r.caption.toLowerCase().includes(reelSearch.toLowerCase())) ||
      (r.profileId?.name && r.profileId.name.toLowerCase().includes(reelSearch.toLowerCase())) ||
      (r.profileId?.username && r.profileId.username.toLowerCase().includes(reelSearch.toLowerCase())) ||
      (r.profileId?.userId?.mobile && r.profileId.userId.mobile.includes(reelSearch.trim()));
    const matchesStatus =
      reelStatusFilter === 'all' || r.status === reelStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin & Moderation Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Administration</h1>
        </div>
        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <p className="text-xs font-medium text-slate-400">Total Users</p>
            <p className="text-2xl font-extrabold text-white mt-1">{analytics.users?.total || users.length}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <p className="text-xs font-medium text-slate-400">Live Profiles</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{analytics.profiles?.published || 0}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <p className="text-xs font-medium text-slate-400">Platform Reels</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-2xl font-extrabold text-cyan-400">{reels.length}</p>
              {analytics?.reels?.suspended > 0 && (
                <span className="text-[11px] font-bold text-rose-400 font-mono">
                  ({analytics.reels.suspended} suspended)
                </span>
              )}
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <p className="text-xs font-medium text-slate-400">Pending Reports</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{analytics.reports?.pending || 0}</p>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Reports & Moderation ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reels')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'reels'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Reels Moderation ({reels.length})</span>
        </button>
      </div>

      {/* TAB 1: Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs text-slate-400 font-medium">Filter Queue:</span>
            <div className="flex items-center space-x-2">
              {['all', 'pending', 'resolved'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReportFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    reportFilter === filter
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="glass-card p-10 rounded-2xl text-center text-slate-400 text-sm">
              No {reportFilter !== 'all' ? reportFilter : ''} reports in moderation queue.
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report._id}
                className="glass-card p-6 rounded-2xl border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono uppercase">
                      {report.targetType}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <span>Status:</span>
                      <strong className={`font-semibold capitalize ${report.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {report.status}
                      </strong>
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">{report.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Target ID: {report.targetId} • Reported at {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {report.status === 'pending' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResolveReport(report._id, 'takedown')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm"
                    >
                      Takedown Target
                    </button>
                    <button
                      onClick={() => handleResolveReport(report._id, 'none')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resolved: <strong className="text-white capitalize">{report.actionTaken || 'None'}</strong></span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl overflow-hidden border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/60 border-b border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search mobile, name, handle, role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-center space-x-2 self-end sm:self-auto text-xs">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
              >
                <option value="all">All Statuses ({users.length})</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
                <option value="deactivated">Deactivated Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No matching user accounts found.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Linked Profile</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-900/50">
                      <td className="p-4">
                        <p className="font-semibold text-white">{u.mobile}</p>
                        <p className="font-mono text-[10px] text-slate-500">{u._id}</p>
                      </td>
                      <td className="p-4">
                        {u.profile ? (
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                              {u.profile.photoUrl ? (
                                <img src={u.profile.photoUrl} alt={u.profile.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-emerald-400 font-bold">
                                  {u.profile.name?.[0] || 'U'}
                                </div>
                              )}
                            </div>
                            <div>
                              <Link
                                to={`/p/${u.profile.username}`}
                                className="text-white hover:text-emerald-400 font-bold flex items-center space-x-1"
                                target="_blank"
                              >
                                <span>{u.profile.name}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </Link>
                              <span className="text-[10px] text-slate-400">@{u.profile.username} • {u.profile.category || u.profile.profileType || 'Creator'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No profile linked</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.accountStatus === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.accountStatus === 'active' ? (
                          <button
                            onClick={() => handleUpdateUserStatus(u._id, 'suspended')}
                            disabled={u.role === 'admin'}
                            className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-[11px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateUserStatus(u._id, 'active')}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] transition-colors"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Reels Moderation Tab */}
      {activeTab === 'reels' && (
        <div className="glass-card rounded-2xl overflow-hidden border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/60 border-b border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search caption, creator handle, or phone..."
                value={reelSearch}
                onChange={(e) => setReelSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex items-center space-x-2 self-end sm:self-auto text-xs">
              <span className="text-slate-400 font-medium">Status Filter:</span>
              <select
                value={reelStatusFilter}
                onChange={(e) => setReelStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
              >
                <option value="all">All Reels ({reels.length})</option>
                <option value="active">Active Only</option>
                <option value="flagged">Flagged Only</option>
                <option value="taken_down">Suspended / Taken Down Only</option>
              </select>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {filteredReels.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No matching reels found for the current search/filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReels.map((reel) => (
                  <div
                    key={reel._id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3.5 hover:border-slate-700 transition-all shadow-lg"
                  >
                    {/* Media Preview & Caption */}
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-24 rounded-xl overflow-hidden bg-black flex-shrink-0 relative border border-slate-800">
                        <img
                          src={reel.thumbnailUrl || reel.videoUrl}
                          alt={reel.caption || 'Reel media'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[9px] font-mono text-white">
                          {reel.durationSeconds || 15}s
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              reel.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : reel.status === 'flagged'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {reel.status === 'active' ? 'Active' : reel.status === 'flagged' ? 'Flagged' : 'Suspended'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {reel.visibility}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                          {reel.caption || 'Untitled Reel'}
                        </p>

                        <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1 font-mono">
                          <span className="flex items-center space-x-0.5">
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>{reel.viewsCount || 0}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-0.5">
                            <Heart className="w-3 h-3 text-rose-400" />
                            <span>{reel.likesCount || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Creator Identity */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                          {reel.profileId?.photoUrl ? (
                            <img src={reel.profileId.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-emerald-400 font-bold">
                              {reel.profileId?.name?.[0] || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="truncate text-[11px]">
                          <Link
                            to={`/p/${reel.profileId?.username}`}
                            className="font-bold text-white hover:text-cyan-400 transition-colors truncate block"
                            target="_blank"
                          >
                            {reel.profileId?.name || 'Creator'}
                          </Link>
                          <span className="text-[10px] text-slate-400">@{reel.profileId?.username || 'unknown'}</span>
                        </div>
                      </div>

                      <div className="text-right text-[10px] text-slate-400 font-mono flex-shrink-0">
                        <span>{reel.profileId?.userId?.mobile || 'No phone'}</span>
                      </div>
                    </div>

                    {/* Moderation Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="flex items-center space-x-2">
                        {reel.status !== 'taken_down' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateReelStatus(reel._id, 'taken_down')}
                            className="px-3 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-xs border border-rose-500/30 transition-colors"
                          >
                            Suspend Reel
                          </button>
                        )}
                        {reel.status !== 'active' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateReelStatus(reel._id, 'active')}
                            className="px-3 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-colors"
                          >
                            {reel.status === 'flagged' ? 'Approve Reel' : 'Restore Reel'}
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteReel(reel._id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors"
                        title="Delete Reel Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
