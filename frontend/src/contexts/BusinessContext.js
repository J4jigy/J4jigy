import React, { createContext, useContext, useState, useEffect } from 'react';

// Business Context for managing active business and data isolation
const BusinessContext = createContext();

// Custom hook to use business context
export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

// Business Data Manager - handles all business-specific data operations
export class BusinessDataManager {
  static getBusinessKey(businessId, dataType) {
    return `business_${businessId}_${dataType}`;
  }

  // Get data for specific business and data type
  static getData(businessId, dataType, defaultValue = []) {
    try {
      const key = this.getBusinessKey(businessId, dataType);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${dataType} for business ${businessId}:`, error);
      return defaultValue;
    }
  }

  // Set data for specific business and data type
  static setData(businessId, dataType, data) {
    try {
      const key = this.getBusinessKey(businessId, dataType);
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving ${dataType} for business ${businessId}:`, error);
      return false;
    }
  }

  // Get all data for a business (for export)
  static getAllBusinessData(businessId) {
    const dataTypes = [
      'cash_entries', 'bank_entries', 'customers', 'suppliers', 
      'products', 'expenses', 'fuel_data', 'credit_sales', 
      'dt_plus_entries', 'lubes', 'staff', 'invoices'
    ];
    
    const businessData = {
      businessId,
      exportedAt: new Date().toISOString(),
      data: {}
    };

    dataTypes.forEach(dataType => {
      businessData.data[dataType] = this.getData(businessId, dataType);
    });

    return businessData;
  }

  // Import all data for a business
  static importBusinessData(businessId, importData) {
    try {
      if (!importData.data) {
        throw new Error('Invalid import data format');
      }

      Object.keys(importData.data).forEach(dataType => {
        this.setData(businessId, dataType, importData.data[dataType]);
      });

      return true;
    } catch (error) {
      console.error(`Error importing data for business ${businessId}:`, error);
      return false;
    }
  }

  // Clear all data for a business
  static clearBusinessData(businessId) {
    const keys = Object.keys(localStorage);
    const businessPrefix = `business_${businessId}_`;
    
    keys.forEach(key => {
      if (key.startsWith(businessPrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get data size for a business (for cloud sync)
  static getBusinessDataSize(businessId) {
    const keys = Object.keys(localStorage);
    const businessPrefix = `business_${businessId}_`;
    let totalSize = 0;
    
    keys.forEach(key => {
      if (key.startsWith(businessPrefix)) {
        totalSize += localStorage.getItem(key).length;
      }
    });
    
    return totalSize;
  }
}

// Business Provider Component
export const BusinessProvider = ({ children }) => {
  // Calculate profile strength based on filled fields
  const calculateProfileStrength = (business) => {
    const fields = ['name', 'type', 'gst', 'phone', 'email', 'address', 'website', 'pan'];
    const filledFields = fields.filter(field => business[field] && business[field].toString().trim() !== '');
    const percentage = (filledFields.length / fields.length) * 100;
    
    if (percentage <= 30) return { level: 'Low', color: 'text-red-400', percentage };
    if (percentage <= 70) return { level: 'Medium', color: 'text-yellow-400', percentage };
    return { level: 'Strong', color: 'text-green-400', percentage };
  };

  // Load businesses from localStorage or use defaults
  const loadBusinesses = () => {
    try {
      const saved = localStorage.getItem('app_businesses');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
    
    // Default business (fallback)
    return [
      { id: 1, name: 'My Business', type: 'Retail', createdAt: new Date().toISOString() }
    ];
  };

  const [businesses, setBusinesses] = useState(loadBusinesses);
  const [activeBusiness, setActiveBusiness] = useState(() => {
    try {
      const savedActiveId = localStorage.getItem('app_active_business_id');
      if (savedActiveId) {
        const business = businesses.find(b => b.id === parseInt(savedActiveId));
        if (business) return business;
      }
    } catch (error) {
      console.error('Error loading active business:', error);
    }
    return businesses[0];
  });

  // Save businesses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('app_businesses', JSON.stringify(businesses));
    } catch (error) {
      console.error('Error saving businesses:', error);
    }
  }, [businesses]);

  // Save active business ID whenever it changes
  useEffect(() => {
    try {
      if (activeBusiness) {
        localStorage.setItem('app_active_business_id', activeBusiness.id.toString());
      }
    } catch (error) {
      console.error('Error saving active business:', error);
    }
  }, [activeBusiness]);

  // Switch to a different business
  const switchBusiness = (business) => {
    setActiveBusiness(business);
  };

  // Add new business
  const addBusiness = (name, type = 'Business') => {
    const newBusiness = {
      id: Date.now(), // Simple ID generation
      name: name.trim(),
      type: type.trim(),
      createdAt: new Date().toISOString()
    };
    
    const updatedBusinesses = [...businesses, newBusiness];
    setBusinesses(updatedBusinesses);
    
    // Save to localStorage immediately
    try {
      localStorage.setItem('app_businesses', JSON.stringify(updatedBusinesses));
    } catch (error) {
      console.error('Error saving new business:', error);
    }
    
    return newBusiness;
  };

  // Update/Edit business
  const updateBusiness = (businessId, updates) => {
    const updatedBusinesses = businesses.map(b => 
      b.id === businessId ? { ...b, ...updates } : b
    );
    setBusinesses(updatedBusinesses);
    
    // Save to localStorage immediately to ensure persistence
    try {
      localStorage.setItem('app_businesses', JSON.stringify(updatedBusinesses));
      console.log('✅ Business data saved successfully:', updates);
    } catch (error) {
      console.error('❌ Error saving business immediately:', error);
    }
    
    // Update active business if it's the one being edited
    if (activeBusiness.id === businessId) {
      const updatedActiveBusiness = { ...activeBusiness, ...updates };
      setActiveBusiness(updatedActiveBusiness);
      
      // Also save active business ID to ensure it persists
      try {
        localStorage.setItem('app_active_business_id', updatedActiveBusiness.id.toString());
      } catch (error) {
        console.error('❌ Error saving active business ID:', error);
      }
    }
  };

  // Delete business
  const deleteBusiness = (businessId) => {
    if (businesses.length <= 1) {
      throw new Error('Cannot delete the last business');
    }

    // Clear business data
    BusinessDataManager.clearBusinessData(businessId);
    
    // Remove business from list
    const updatedBusinesses = businesses.filter(b => b.id !== businessId);
    setBusinesses(updatedBusinesses);
    
    // Switch to first business if deleting active business
    if (activeBusiness.id === businessId) {
      setActiveBusiness(updatedBusinesses[0]);
    }
  };

  // Export business data
  const exportBusiness = (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const exportData = {
      business: business,
      ...BusinessDataManager.getAllBusinessData(businessId)
    };

    return exportData;
  };

  // Import business data
  const importBusiness = (importData, options = {}) => {
    try {
      let targetBusinessId;
      
      if (options.createNew) {
        // Create new business
        const newBusiness = addBusiness(
          importData.business?.name || 'Imported Business',
          importData.business?.type || 'Business'
        );
        targetBusinessId = newBusiness.id;
      } else {
        // Use active business
        targetBusinessId = activeBusiness.id;
      }

      // Import data
      const success = BusinessDataManager.importBusinessData(targetBusinessId, importData);
      
      if (success && options.switchTo) {
        const business = businesses.find(b => b.id === targetBusinessId);
        if (business) {
          switchBusiness(business);
        }
      }

      return success;
    } catch (error) {
      console.error('Error importing business:', error);
      return false;
    }
  };

  // Get data for current business
  const getData = (dataType, defaultValue) => {
    return BusinessDataManager.getData(activeBusiness.id, dataType, defaultValue);
  };

  // Set data for current business
  const setData = (dataType, data) => {
    return BusinessDataManager.setData(activeBusiness.id, dataType, data);
  };

  const contextValue = {
    // Business state
    businesses,
    activeBusiness,
    
    // Business management
    switchBusiness,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    
    // Data management
    getData,
    setData,
    
    // Import/Export
    exportBusiness,
    importBusiness,
    
    // Utilities
    getDataSize: () => BusinessDataManager.getBusinessDataSize(activeBusiness.id),
    calculateProfileStrength
  };

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
};

export default BusinessContext;