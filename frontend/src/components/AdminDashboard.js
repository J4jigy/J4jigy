import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertTriangle, Users, Shield, Activity, TrendingUp, Lock, Eye, Search, Filter, Download, RefreshCw, UserX, UserCheck } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_transactions: 0,
    total_revenue: 0,
    security_events: 0,
    failed_logins: 0
  });
  
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [filters, setFilters] = useState({
    userRole: '',
    eventSeverity: '',
    auditAction: ''
  });

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchDashboardStats();
      fetchUsers();
      fetchAuditLogs();
      fetchSecurityEvents();
      fetchInviteCodes();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/users`, {
        params: { search: searchTerm, limit: 100 }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get(`${API}/admin/audit-logs`, {
        params: { limit: 50, action: filters.auditAction }
      });
      setAuditLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const fetchSecurityEvents = async () => {
    try {
      const response = await axios.get(`${API}/admin/security-events`, {
        params: { limit: 50, severity: filters.eventSeverity }
      });
      setSecurityEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    }
  };

  const fetchInviteCodes = async () => {
    try {
      const response = await axios.get(`${API}/admin/invite-codes`);
      setInviteCodes(response.data);
    } catch (error) {
      console.error('Failed to fetch invite codes:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/role`, { role: newRole });
      fetchUsers(); // Refresh users list
      setShowUserDialog(false);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/status`, { is_active: !isActive });
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const createInviteCode = async () => {
    try {
      await axios.post(`${API}/admin/invite-codes`);
      fetchInviteCodes();
    } catch (error) {
      console.error('Failed to create invite code:', error);
    }
  };

  const exportData = async (type) => {
    try {
      const response = await axios.get(`${API}/admin/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-600';
      case 'admin': return 'bg-red-600';
      case 'manager': return 'bg-blue-600';
      case 'user': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-red-700">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">Admin privileges required to access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Security Admin Dashboard</h1>
              <p className="text-slate-400">Complete system control and monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={`${getRoleColor(user.role)} text-white`}>
                {user.role.toUpperCase()}
              </Badge>
              <Button onClick={fetchDashboardStats} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-900 to-blue-800 border-blue-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-100">
                <Users className="w-5 h-5 mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.total_users}</div>
              <p className="text-blue-200 text-sm">Active: {stats.active_users}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-900 to-green-800 border-green-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-100">
                <TrendingUp className="w-5 h-5 mr-2" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.total_transactions}</div>
              <p className="text-green-200 text-sm">Revenue: Rs. {stats.total_revenue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-900 to-orange-800 border-orange-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-orange-100">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.security_events}</div>
              <p className="text-orange-200 text-sm">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-900 to-red-800 border-red-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-red-100">
                <Lock className="w-5 h-5 mr-2" />
                Failed Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.failed_logins}</div>
              <p className="text-red-200 text-sm">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="security">Security Events</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="invites">Invite Codes</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">User Management</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600"
                        onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                      />
                    </div>
                    <Button onClick={() => exportData('users')} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-slate-400">Loading users...</div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-white">{user.username}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                            <p className="text-xs text-slate-500">{user.business_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          
                          <Badge className={user.is_active ? 'bg-green-600' : 'bg-red-600'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                            >
                              {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Events Tab */}
          <TabsContent value="security">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Security Events</CardTitle>
                  <div className="flex items-center gap-4">
                    <Select value={filters.eventSeverity} onValueChange={(value) => setFilters({...filters, eventSeverity: value})}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                        <SelectValue placeholder="All Severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Severities</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchSecurityEvents} size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Apply Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <span className="font-semibold text-white">{event.event_type}</span>
                        </div>
                        <span className="text-sm text-slate-400">{formatDateTime(event.timestamp)}</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">IP: {event.ip_address}</p>
                      <pre className="text-xs text-slate-400 bg-slate-800 p-2 rounded overflow-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-600">{log.action}</Badge>
                          <span className="text-white">{log.resource}</span>
                        </div>
                        <span className="text-sm text-slate-400">{formatDateTime(log.timestamp)}</span>
                      </div>
                      <p className="text-slate-300 text-sm">User: {log.user_id || 'System'}</p>
                      <p className="text-slate-300 text-sm">IP: {log.ip_address}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invite Codes Tab */}
          <TabsContent value="invites">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Invite Code Management</CardTitle>
                  <Button onClick={createInviteCode}>
                    <span className="mr-2">+</span>
                    Create New Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {inviteCodes.map((invite) => (
                    <div key={invite.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-lg text-white">{invite.code}</p>
                          <p className="text-sm text-slate-400">
                            Usage: {invite.usage_count}/{invite.usage_limit}
                          </p>
                          <p className="text-xs text-slate-500">
                            Created: {formatDateTime(invite.created_at)}
                          </p>
                        </div>
                        <Badge className={invite.is_active ? 'bg-green-600' : 'bg-red-600'}>
                          {invite.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Health & Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Database</span>
                        <Badge className="bg-green-600">Connected</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">API Status</span>
                        <Badge className="bg-green-600">Online</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Security Monitoring</span>
                        <Badge className="bg-green-600">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Security Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Rate Limiting</span>
                        <Badge className="bg-blue-600">Enabled</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">2FA Enforcement</span>
                        <Badge className="bg-yellow-600">Optional</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Audit Logging</span>
                        <Badge className="bg-green-600">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Username</Label>
                    <p className="text-white">{selectedUser.username}</p>
                  </div>
                  <div>
                    <Label className="text-slate-200">Email</Label>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-slate-200">Business</Label>
                    <p className="text-white">{selectedUser.business_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-200">Created</Label>
                    <p className="text-white">{formatDateTime(selectedUser.created_at)}</p>
                  </div>
                </div>
                
                {user.role === 'super_admin' && (
                  <div>
                    <Label className="text-slate-200">Update Role</Label>
                    <Select 
                      value={selectedUser.role} 
                      onValueChange={(newRole) => updateUserRole(selectedUser.id, newRole)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        {user.role === 'super_admin' && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;