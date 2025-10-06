import React from 'react';
import { ArrowLeft, Users, Shield, UserPlus, IndianRupee, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useRole } from '../contexts/RoleContext';
import { useBusiness } from '../contexts/BusinessContext';

const StaffPage = () => {
  const navigate = useNavigate();
  const { hasPermission, businessStaff } = useRole();
  const { activeBusiness } = useBusiness();

  // Staff management options
  const staffOptions = [
    {
      name: 'Staff Management',
      subtitle: 'Roles & Invites',
      icon: Shield,
      iconColor: 'text-purple-400',
      description: 'Invite staff, assign roles, and manage permissions',
      onClick: () => navigate('/staff-management'),
      permission: 'staff_manage'
    },
    {
      name: 'PayRoll Management',
      subtitle: 'Salary & Benefits',
      icon: IndianRupee,
      iconColor: 'text-green-400',
      description: 'Manage salaries, payments, and employee benefits',
      onClick: () => navigate('/payroll-management'),
      permission: 'payroll_manage'
    },
    {
      name: 'Staff Directory',
      subtitle: 'Contact List', 
      icon: Users,
      iconColor: 'text-blue-400',
      description: 'View all staff members and their contact information',
      onClick: () => {}, // Future implementation
      permission: 'staff_view'
    },
    {
      name: 'Performance',
      subtitle: 'Reports',
      icon: BarChart3,
      iconColor: 'text-yellow-400', 
      description: 'View staff performance and activity reports',
      onClick: () => {}, // Future implementation
      permission: 'staff_view'
    }
  ];

  // Filter options based on permissions
  const availableOptions = staffOptions.filter(option => 
    !option.permission || hasPermission(option.permission) || hasPermission('staff_invite')
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-base font-semibold">Staff</h1>
      </div>
      
      {/* Staff Overview */}
      <div className="p-4 space-y-6">
        {/* Business Staff Summary */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">
                {activeBusiness.name} Staff
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-white">{businessStaff.length}</div>
                <div className="text-sm text-slate-400">Total Staff</div>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {businessStaff.filter(staff => staff.status === 'active').length}
                </div>
                <div className="text-sm text-slate-400">Active</div>
              </div>
            </div>
            
            {businessStaff.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <p className="text-sm text-slate-400">
                  Recent: {businessStaff.slice(-2).map(staff => staff.name).join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Management Options */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Staff Management</h3>
          
          {availableOptions.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Access</h3>
                <p className="text-slate-400">
                  You don't have permission to manage staff.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Contact your business owner for staff management access.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {availableOptions.map((option, idx) => {
                const IconComponent = option.icon;
                return (
                  <Card 
                    key={idx} 
                    onClick={option.onClick}
                    className="bg-slate-700/80 border border-slate-600 hover:bg-slate-600 transition-all duration-200 cursor-pointer shadow-xl"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-slate-800 border border-slate-600`}>
                          <IconComponent className={`w-6 h-6 ${option.iconColor}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold">{option.name}</h4>
                            {option.subtitle && (
                              <span className="text-slate-300 text-sm">{option.subtitle}</span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm">{option.description}</p>
                        </div>

                        {option.name === 'Staff Management' && (
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              hasPermission('staff_manage') 
                                ? 'bg-green-600/20 text-green-300 border border-green-600/30' 
                                : 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                            }`}>
                              {hasPermission('staff_manage') ? 'Full Access' : 'Invite Only'}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions (if has permissions) */}
        {hasPermission('staff_invite') && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid gap-3">
              <Card 
                onClick={() => navigate('/staff-management')}
                className="bg-blue-900/20 border border-blue-600/30 hover:bg-blue-900/30 transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-blue-300 font-medium">Invite New Staff</h4>
                      <p className="text-blue-400/70 text-sm">Add team members to {activeBusiness.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPage;