import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBusiness } from './BusinessContext';
import { Crown, UserCheck, Coins, BarChart3, User } from 'lucide-react';

// Role Context for managing user roles and permissions
const RoleContext = createContext();

// Custom hook to use role context
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// Standard role definitions with permissions
export const STANDARD_ROLES = {
  owner: {
    name: 'Owner',
    description: 'Full access to all features including staff management',
    permissions: {
      // Business Management
      business_create: true,
      business_edit: true,
      business_delete: true,
      business_export: true,
      business_import: true,
      
      // Staff Management
      staff_invite: true,
      staff_manage: true,
      staff_roles: true,
      staff_remove: true,
      payroll_manage: true,
      
      // Financial Operations
      cash_in: true,
      cash_out: true,
      cash_view: true,
      bank_manage: true,
      expenses_manage: true,
      
      // Inventory & Operations
      fuel_manage: true,
      inventory_manage: true,
      suppliers_manage: true,
      customers_manage: true,
      
      // Reports & Analytics
      reports_view: true,
      reports_export: true,
      analytics_view: true,
      
      // System Settings
      settings_manage: true,
      audit_view: true
    },
    color: 'text-purple-400',
    icon: Crown
  },
  
  manager: {
    name: 'Manager',
    description: 'Access to most features except staff management',
    permissions: {
      // Business Management (limited)
      business_edit: true,
      business_export: true,
      
      // Financial Operations
      cash_in: true,
      cash_out: true,
      cash_view: true,
      bank_manage: true,
      expenses_manage: true,
      
      // Inventory & Operations
      fuel_manage: true,
      inventory_manage: true,
      suppliers_manage: true,
      customers_manage: true,
      
      // Reports & Analytics
      reports_view: true,
      reports_export: true,
      analytics_view: true,
      
      // System Settings (limited)
      audit_view: true
    },
    color: 'text-blue-400',
    icon: UserCheck
  },
  
  cashier: {
    name: 'Cashier',
    description: 'Cash operations and POS system access only',
    permissions: {
      // Financial Operations (limited)
      cash_in: true,
      cash_out: true,
      cash_view: true,
      
      // Basic Operations
      customers_view: true,
      
      // Limited Reports
      reports_view: false, // Only cash reports
      cash_reports: true
    },
    color: 'text-green-400',
    icon: Coins
  },
  
  accountant: {
    name: 'Accountant',
    description: 'Financial reports and expense management, no cash handling',
    permissions: {
      // Financial Operations (view only)
      cash_view: true,
      bank_manage: true,
      expenses_manage: true,
      
      // Inventory (view only)
      inventory_view: true,
      suppliers_view: true,
      customers_view: true,
      
      // Reports & Analytics (full access)
      reports_view: true,
      reports_export: true,
      analytics_view: true,
      
      // System
      audit_view: true
    },
    color: 'text-yellow-400',
    icon: BarChart3
  },
  
  staff: {
    name: 'Staff',
    description: 'Basic access to assigned operations',
    permissions: {
      // Basic Operations
      customers_view: true,
      
      // Limited Reports
      reports_view: false
    },
    color: 'text-gray-400',
    icon: User
  }
};

// Business Staff Manager - handles staff assignments to businesses
export class BusinessStaffManager {
  // Get all staff for a business
  static getBusinessStaff(businessId) {
    try {
      const staffKey = `business_${businessId}_staff`;
      const staff = localStorage.getItem(staffKey);
      return staff ? JSON.parse(staff) : [];
    } catch (error) {
      console.error('Error loading business staff:', error);
      return [];
    }
  }

  // Add staff member to business
  static addStaffToBusiness(businessId, staffData) {
    try {
      const currentStaff = this.getBusinessStaff(businessId);
      const newStaff = {
        id: Date.now(),
        email: staffData.email,
        name: staffData.name,
        role: staffData.role,
        whatsapp: staffData.whatsapp || '',
        permissions: staffData.permissions || STANDARD_ROLES[staffData.role]?.permissions,
        invitedAt: new Date().toISOString(),
        status: 'invited', // invited, active, suspended
        invitedBy: staffData.invitedBy
      };
      
      const updatedStaff = [...currentStaff, newStaff];
      const staffKey = `business_${businessId}_staff`;
      localStorage.setItem(staffKey, JSON.stringify(updatedStaff));
      
      return newStaff;
    } catch (error) {
      console.error('Error adding staff to business:', error);
      return null;
    }
  }

  // Remove staff from business
  static removeStaffFromBusiness(businessId, staffId) {
    try {
      const currentStaff = this.getBusinessStaff(businessId);
      const updatedStaff = currentStaff.filter(staff => staff.id !== staffId);
      
      const staffKey = `business_${businessId}_staff`;
      localStorage.setItem(staffKey, JSON.stringify(updatedStaff));
      
      return true;
    } catch (error) {
      console.error('Error removing staff from business:', error);
      return false;
    }
  }

  // Update staff role/permissions
  static updateStaffRole(businessId, staffId, newRole, customPermissions = null) {
    try {
      const currentStaff = this.getBusinessStaff(businessId);
      const staffIndex = currentStaff.findIndex(staff => staff.id === staffId);
      
      if (staffIndex === -1) return false;
      
      currentStaff[staffIndex] = {
        ...currentStaff[staffIndex],
        role: newRole,
        permissions: customPermissions || STANDARD_ROLES[newRole]?.permissions,
        updatedAt: new Date().toISOString()
      };
      
      const staffKey = `business_${businessId}_staff`;
      localStorage.setItem(staffKey, JSON.stringify(currentStaff));
      
      return true;
    } catch (error) {
      console.error('Error updating staff role:', error);
      return false;
    }
  }

  // Get user's businesses (for staff users)
  static getUserBusinesses(userEmail) {
    try {
      const userBusinesses = [];
      const allBusinesses = JSON.parse(localStorage.getItem('app_businesses') || '[]');
      
      allBusinesses.forEach(business => {
        const staff = this.getBusinessStaff(business.id);
        const userStaff = staff.find(s => s.email === userEmail);
        
        if (userStaff) {
          userBusinesses.push({
            ...business,
            userRole: userStaff.role,
            userPermissions: userStaff.permissions,
            userStatus: userStaff.status
          });
        }
      });
      
      return userBusinesses;
    } catch (error) {
      console.error('Error getting user businesses:', error);
      return [];
    }
  }
}

// Email Invitation Manager
export class EmailInvitationManager {
  // Send invitation (simulated - in real app would use email service)
  static async sendInvitation(businessName, inviterName, recipientEmail, role, businessId, whatsapp = '') {
    try {
      // In production, this would integrate with email service
      console.log(`Invitation sent:
        Email: ${recipientEmail}
        WhatsApp: ${whatsapp || 'Not provided'}
        From: ${inviterName}
        Business: ${businessName}
        Role: ${role}
        Business ID: ${businessId}
      `);
      
      // Store pending invitation
      const invitations = JSON.parse(localStorage.getItem('pending_invitations') || '[]');
      const invitation = {
        id: Date.now(),
        businessId,
        businessName,
        recipientEmail,
        role,
        inviterName,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };
      
      invitations.push(invitation);
      localStorage.setItem('pending_invitations', JSON.stringify(invitations));
      
      return { success: true, invitationId: invitation.id };
    } catch (error) {
      console.error('Error sending invitation:', error);
      return { success: false, error: error.message };
    }
  }

  // Get pending invitations for a business
  static getPendingInvitations(businessId) {
    try {
      const invitations = JSON.parse(localStorage.getItem('pending_invitations') || '[]');
      return invitations.filter(inv => inv.businessId === businessId && inv.status === 'sent');
    } catch (error) {
      console.error('Error getting pending invitations:', error);
      return [];
    }
  }

  // Accept invitation (for demo purposes)
  static acceptInvitation(invitationId, userData) {
    try {
      const invitations = JSON.parse(localStorage.getItem('pending_invitations') || '[]');
      const invitationIndex = invitations.findIndex(inv => inv.id === invitationId);
      
      if (invitationIndex === -1) return false;
      
      const invitation = invitations[invitationIndex];
      
      // Add staff to business
      BusinessStaffManager.addStaffToBusiness(invitation.businessId, {
        email: invitation.recipientEmail,
        name: userData.name || invitation.recipientEmail,
        role: invitation.role,
        invitedBy: invitation.inviterName
      });
      
      // Mark invitation as accepted
      invitations[invitationIndex].status = 'accepted';
      invitations[invitationIndex].acceptedAt = new Date().toISOString();
      localStorage.setItem('pending_invitations', JSON.stringify(invitations));
      
      return true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  }
}

// Role Provider Component
export const RoleProvider = ({ children, currentUser }) => {
  const { activeBusiness } = useBusiness();
  const [userRole, setUserRole] = useState('owner'); // Default for demo
  const [userPermissions, setUserPermissions] = useState(STANDARD_ROLES.owner.permissions);
  const [businessStaff, setBusinessStaff] = useState([]);

  // Load user role for current business
  useEffect(() => {
    if (activeBusiness) {
      console.log('RoleContext: Loading role for business:', activeBusiness.name);
      
      // Default to Owner role for all users (business owner experience)
      console.log('RoleContext: Setting user as owner (default)');
      setUserRole('owner');
      setUserPermissions(STANDARD_ROLES.owner.permissions);
      
      // Load business staff (for staff management interface)
      setBusinessStaff(BusinessStaffManager.getBusinessStaff(activeBusiness.id));
    }
  }, [activeBusiness, currentUser]);

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return userPermissions[permission] === true;
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Invite staff member
  const inviteStaff = async (email, name, role, additionalData = {}) => {
    try {
      if (!hasPermission('staff_invite')) {
        throw new Error('No permission to invite staff');
      }

      const staffData = {
        email,
        name,
        role,
        whatsapp: additionalData.whatsapp || '',
        permissions: additionalData.permissions,
        invitedBy: currentUser?.name || currentUser?.email || 'Admin'
      };

      const newStaff = BusinessStaffManager.addStaffToBusiness(activeBusiness.id, staffData);
      
      if (newStaff) {
        // Send invitation (email + WhatsApp)
        const result = await EmailInvitationManager.sendInvitation(
          activeBusiness.name,
          currentUser?.name || currentUser?.email || 'Admin',
          email,
          role,
          activeBusiness.id,
          additionalData.whatsapp
        );
        
        // Refresh staff list
        setBusinessStaff(BusinessStaffManager.getBusinessStaff(activeBusiness.id));
        
        return { success: true, staff: newStaff, invitation: result };
      }
      
      return { success: false, error: 'Failed to add staff' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Remove staff member
  const removeStaff = (staffId) => {
    if (!hasPermission('staff_remove')) {
      throw new Error('No permission to remove staff');
    }

    const success = BusinessStaffManager.removeStaffFromBusiness(activeBusiness.id, staffId);
    if (success) {
      setBusinessStaff(BusinessStaffManager.getBusinessStaff(activeBusiness.id));
    }
    return success;
  };

  // Update staff role
  const updateStaffRole = (staffId, newRole, customPermissions = null) => {
    if (!hasPermission('staff_roles')) {
      throw new Error('No permission to modify staff roles');
    }

    const success = BusinessStaffManager.updateStaffRole(activeBusiness.id, staffId, newRole, customPermissions);
    if (success) {
      setBusinessStaff(BusinessStaffManager.getBusinessStaff(activeBusiness.id));
    }
    return success;
  };

  const contextValue = {
    // User role and permissions
    userRole,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    
    // Business staff management
    businessStaff,
    inviteStaff,
    removeStaff,
    updateStaffRole,
    
    // Role definitions
    standardRoles: STANDARD_ROLES,
    
    // Utilities
    BusinessStaffManager,
    EmailInvitationManager
  };

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleContext;