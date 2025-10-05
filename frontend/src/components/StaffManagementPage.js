import React from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import StaffManagement from './StaffManagement';
import { useRole } from '../contexts/RoleContext';

const StaffManagementPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useRole();

  // Check if user has staff management permission
  if (!hasPermission('staff_manage') && !hasPermission('staff_invite')) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/staff')} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-base font-semibold">Staff Management</h1>
        </div>
        
        {/* No Permission Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-4">
              You don't have permission to manage staff.
            </p>
            <p className="text-sm text-slate-500">
              Contact your business owner for staff management access.
            </p>
            <Button 
              onClick={() => navigate('/staff')} 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Back to Staff
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/staff')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-base font-semibold">Staff Management</h1>
      </div>
      
      {/* Staff Management Content */}
      <div className="p-4">
        <StaffManagement />
      </div>
    </div>
  );
};

export default StaffManagementPage;