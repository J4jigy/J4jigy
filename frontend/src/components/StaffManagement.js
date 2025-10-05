import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useRole } from '../contexts/RoleContext';
import { useBusiness } from '../contexts/BusinessContext';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  Crown,
  Eye,
  EyeOff
} from 'lucide-react';

const StaffManagement = () => {
  const { activeBusiness } = useBusiness();
  const { 
    hasPermission, 
    businessStaff, 
    inviteStaff, 
    removeStaff, 
    updateStaffRole, 
    standardRoles,
    userRole 
  } = useRole();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    whatsapp: '',
    email: '',
    name: '',
    role: 'staff'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check if user can manage staff
  if (!hasPermission('staff_manage') && !hasPermission('staff_invite')) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">You don't have permission to manage staff.</p>
        </CardContent>
      </Card>
    );
  }

  // Handle staff invitation
  const handleInviteStaff = async () => {
    if (!inviteForm.email || !inviteForm.name || !inviteForm.role) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const result = await inviteStaff(inviteForm.email, inviteForm.name, inviteForm.role);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Invitation sent to ${inviteForm.email}` 
        });
        setInviteForm({ email: '', name: '', role: 'staff' });
        setShowInviteDialog(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send invitation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  // Handle role update
  const handleUpdateRole = () => {
    if (!selectedStaff) return;
    
    try {
      const success = updateStaffRole(selectedStaff.id, selectedStaff.newRole);
      if (success) {
        setMessage({ 
          type: 'success', 
          text: `${selectedStaff.name}'s role updated to ${standardRoles[selectedStaff.newRole].name}` 
        });
        setShowRoleDialog(false);
        setSelectedStaff(null);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // Handle staff removal
  const handleRemoveStaff = (staff) => {
    if (confirm(`Remove ${staff.name} from ${activeBusiness.name}?`)) {
      try {
        const success = removeStaff(staff.id);
        if (success) {
          setMessage({ 
            type: 'success', 
            text: `${staff.name} removed from business` 
          });
          // Clear message after 3 seconds
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } else {
          setMessage({ type: 'error', text: 'Failed to remove staff member' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      }
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const roleConfig = standardRoles[role];
    if (!roleConfig) return 'bg-gray-600';
    
    const colorMap = {
      'text-purple-400': 'bg-purple-600',
      'text-blue-400': 'bg-blue-600',
      'text-green-400': 'bg-green-600',
      'text-yellow-400': 'bg-yellow-600',
      'text-gray-400': 'bg-gray-600'
    };
    
    return colorMap[roleConfig.color] || 'bg-gray-600';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'invited':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Staff Management
          </h2>
          <p className="text-slate-400 mt-1">
            Manage staff access and roles for {activeBusiness.name}
          </p>
        </div>
        
        {hasPermission('staff_invite') && (
          <Button
            onClick={() => setShowInviteDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Staff
          </Button>
        )}
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-900/20 border-green-700/50 text-green-300' 
            : 'bg-red-900/20 border-red-700/50 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current User Role */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Your Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              {standardRoles[userRole]?.icon 
                ? React.createElement(standardRoles[userRole].icon, { 
                    className: `w-8 h-8 ${standardRoles[userRole].color}` 
                  })
                : <User className="w-8 h-8 text-gray-400" />
              }
            </div>
            <div>
              <div className="font-medium text-white">
                {standardRoles[userRole]?.name || 'Unknown Role'}
              </div>
              <div className="text-sm text-slate-400">
                {standardRoles[userRole]?.description || 'No description'}
              </div>
            </div>
            <Badge className={`ml-auto ${getRoleBadgeColor(userRole)} text-white`}>
              {userRole}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            Business Staff ({businessStaff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {businessStaff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No staff members yet</p>
              {hasPermission('staff_invite') && (
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite First Staff Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {businessStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center">
                      {standardRoles[staff.role]?.icon 
                        ? React.createElement(standardRoles[staff.role].icon, { 
                            className: `w-8 h-8 ${standardRoles[staff.role].color}` 
                          })
                        : <User className="w-8 h-8 text-gray-400" />
                      }
                    </div>
                    <div>
                      <div className="font-medium text-white">{staff.name}</div>
                      <div className="text-sm text-slate-400">{staff.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(staff.status)}
                        <span className="text-xs text-slate-400 capitalize">
                          {staff.status}
                        </span>
                        {staff.invitedAt && (
                          <span className="text-xs text-slate-500">
                            • Invited {new Date(staff.invitedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`${getRoleBadgeColor(staff.role)} text-white`}>
                      {standardRoles[staff.role]?.name || staff.role}
                    </Badge>

                    {hasPermission('staff_roles') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStaff({ ...staff, newRole: staff.role });
                          setShowRoleDialog(true);
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-600"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}

                    {hasPermission('staff_remove') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveStaff(staff)}
                        className="border-red-600 text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Reference */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Role Permissions Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(standardRoles).map(([roleKey, role]) => (
              <div key={roleKey} className="p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {React.createElement(role.icon, { 
                    className: `w-5 h-5 ${role.color}` 
                  })}
                  <span className="font-medium text-white">{role.name}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{role.description}</p>
                <div className="space-y-1">
                  {Object.entries(role.permissions)
                    .filter(([, hasPermission]) => hasPermission)
                    .slice(0, 4)
                    .map(([permission]) => (
                      <div key={permission} className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-slate-300">
                          {permission.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  {Object.values(role.permissions).filter(p => p).length > 4 && (
                    <div className="text-xs text-slate-500">
                      +{Object.values(role.permissions).filter(p => p).length - 4} more...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Staff Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Invite Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Email Address</Label>
              <Input
                type="email"
                placeholder="staff@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Full Name</Label>
              <Input
                placeholder="John Doe"
                value={inviteForm.name}
                onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Role</Label>
              <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(standardRoles).map(([roleKey, role]) => (
                    <SelectItem key={roleKey} value={roleKey}>
                      <div className="flex items-center gap-2">
                        {React.createElement(role.icon, { 
                          className: `w-4 h-4 ${role.color}` 
                        })}
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/50 p-3 rounded-lg">
              <p className="text-sm text-blue-300">
                <Mail className="w-4 h-4 inline mr-1" />
                An invitation email will be sent to the staff member with instructions to join {activeBusiness.name}.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowInviteDialog(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteStaff}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Change Role</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="text-slate-300">
                Changing role for <strong>{selectedStaff.name}</strong>
              </div>

              <div>
                <Label className="text-slate-300">New Role</Label>
                <Select 
                  value={selectedStaff.newRole} 
                  onValueChange={(value) => setSelectedStaff(prev => ({ ...prev, newRole: value }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(standardRoles).map(([roleKey, role]) => (
                      <SelectItem key={roleKey} value={roleKey}>
                        <div className="flex items-center gap-2">
                          {React.createElement(role.icon, { 
                          className: `w-4 h-4 ${role.color}` 
                        })}
                          <span>{role.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowRoleDialog(false);
                    setSelectedStaff(null);
                  }}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateRole}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Update Role
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;