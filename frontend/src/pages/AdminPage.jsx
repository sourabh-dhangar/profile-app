import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';

const AdminPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('reports'); // reports | users
  const [loading, setLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState('all'); // all | pending | resolved
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | suspended

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resAnalytics, resReports, resUsers] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/reports'),
        api.get('/admin/users'),
      ]);

      if (resAnalytics.data.success) setAnalytics(resAnalytics.data.data);
      if (resReports.data.success) setReports(resReports.data.data.reports || []);
      if (resUsers.data.success) setUsers(resUsers.data.data.users || []);
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

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !userSearch.trim() ||
      (u.mobile && u.mobile.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u._id && u._id.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' || u.accountStatus === statusFilter;
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
            <span>Moderator Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Administration</h1>
        </div>
        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5"
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
            <p className="text-2xl font-extrabold text-white mt-1">{analytics.users?.total || 0}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <p className="text-xs font-medium text-slate-400">Live Profiles</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{analytics.profiles?.published || 0}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <p className="text-xs font-medium text-slate-400">Total Reels</p>
            <p className="text-2xl font-extrabold text-teal-400 mt-1">{analytics.reels?.total || 0}</p>
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
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' ? (
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
      ) : (
        /* Users Tab */
        <div className="glass-card rounded-2xl overflow-hidden border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/60 border-b border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by mobile or ID..."
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
                    <th className="p-4">User ID</th>
                    <th className="p-4">Mobile</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-900/50">
                      <td className="p-4 font-mono text-[11px] text-slate-400">{u._id}</td>
                      <td className="p-4 font-semibold text-white">{u.mobile}</td>
                      <td className="p-4 font-medium capitalize">{u.role}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.accountStatus === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.accountStatus === 'active' ? (
                          <button
                            onClick={() => handleUpdateUserStatus(u._id, 'suspended')}
                            className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-[11px]"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateUserStatus(u._id, 'active')}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[11px]"
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
    </div>
  );
};

export default AdminPage;
