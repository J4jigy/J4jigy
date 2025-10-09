import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, globalStyles } from '../styles/globalStyles';
import Modal from '../components/Modal';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

export default function FuelDispenserDetailsScreen({ route, navigation }) {
  const { dispenserId } = route.params;

  // Handle hardware back button - navigate to FuelDispenser
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('FuelDispenser');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [navigation])
  );

  // Storage keys for persistence
  const STORAGE_KEYS = {
    CUSTOM_PRODUCTS: `@fuel_products_${dispenserId}`,
    CREDIT_PARTIES: `@credit_parties_${dispenserId}`,
    DIGITAL_PAYMENTS: `@digital_payments_${dispenserId}`,
    AVAILABLE_PARTIES: '@available_parties',
    FORM_DATA: `@form_data_${dispenserId}`
  };

  // State for form data - starts completely empty
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    customProducts: [], // Always starts empty
    creditSale: '',
    digitalPayments: '',
    fuelCards: '',
    discounts: '',
    expenses: '',
    lubes: '',
    cashOnHand: ''
  });

  // All states start completely empty
  const [creditSaleParties, setCreditSaleParties] = useState([]);
  const [digitalPayments, setDigitalPayments] = useState([]);
  const [availableParties, setAvailableParties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simple data loading - always respects storage state (including empty arrays)
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      console.log(`=== LOADING DATA FOR DISPENSER ${dispenserId} ===`);

      // Load products - if storage exists, load it (even if empty array)
      const savedProducts = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS);
      if (savedProducts !== null) {
        const products = JSON.parse(savedProducts);
        console.log(`Loaded ${products.length} products from storage (empty is valid)`);
        setFormData(prev => ({ ...prev, customProducts: products }));
      } else {
        console.log('No products in storage - keeping empty array');
        // Keep empty array - no defaults
      }

      // Load credit parties - if storage exists, load it (even if empty array)
      const savedCreditParties = await AsyncStorage.getItem(STORAGE_KEYS.CREDIT_PARTIES);
      if (savedCreditParties !== null) {
        const creditParties = JSON.parse(savedCreditParties);
        console.log(`Loaded ${creditParties.length} credit parties from storage`);
        setCreditSaleParties(creditParties);
      } else {
        console.log('No credit parties in storage - keeping empty array');
        // Keep empty array - no defaults
      }

      // Load digital payments - if storage exists, load it (even if empty array)
      const savedDigitalPayments = await AsyncStorage.getItem(STORAGE_KEYS.DIGITAL_PAYMENTS);
      if (savedDigitalPayments !== null) {
        const payments = JSON.parse(savedDigitalPayments);
        console.log(`Loaded ${payments.length} digital payments from storage`);
        setDigitalPayments(payments);
      } else {
        console.log('No digital payments in storage - keeping empty array');
        // Keep empty array - no defaults
      }

      // Load available parties
      const savedAvailableParties = await AsyncStorage.getItem(STORAGE_KEYS.AVAILABLE_PARTIES);
      if (savedAvailableParties !== null) {
        const availParties = JSON.parse(savedAvailableParties);
        console.log(`Loaded ${availParties.length} available parties`);
        setAvailableParties(availParties);
      } else {
        console.log('No available parties in storage - keeping empty array');
      }

      console.log('=== DATA LOADING COMPLETE - RESPECTING EMPTY STATE ===');
      setIsLoading(false);

    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, [dispenserId]);

  // Save data to storage whenever state changes
  const saveCustomProducts = async (products) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving custom products:', error);
    }
  };

  const saveCreditParties = async (parties) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CREDIT_PARTIES, JSON.stringify(parties));
    } catch (error) {
      console.error('Error saving credit parties:', error);
    }
  };

  const saveDigitalPayments = async (payments) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DIGITAL_PAYMENTS, JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving digital payments:', error);
    }
  };

  const saveAvailableParties = async (parties) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AVAILABLE_PARTIES, JSON.stringify(parties));
    } catch (error) {
      console.error('Error saving available parties:', error);
    }
  };

  // Debug function to clear all storage (for testing)
  const clearAllStorage = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CUSTOM_PRODUCTS,
        STORAGE_KEYS.CREDIT_PARTIES,
        STORAGE_KEYS.DIGITAL_PAYMENTS,
        STORAGE_KEYS.AVAILABLE_PARTIES,
        STORAGE_KEYS.FORM_DATA
      ]);
      console.log(`Cleared all storage for dispenser ${dispenserId}`);
      
      // Reset all state to empty
      setFormData(prev => ({
        ...prev,
        customProducts: []
      }));
      setCreditSaleParties([]);
      setDigitalPayments([]);
      setAvailableParties([]);
      
      // Force refresh
      forceRefresh();
      
      Alert.alert('Debug', 'All storage cleared - app is now completely empty.');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  // State for modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // State for modal inputs
  const [newProductName, setNewProductName] = useState('');
  const [newPartyData, setNewPartyData] = useState({ partyName: '', vehicleNo: '' });
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  // State for delete confirmation
  const [deleteAction, setDeleteAction] = useState({
    type: '',
    index: null,
    name: ''
  });

  // State for forcing re-renders
  const [refreshKey, setRefreshKey] = useState(0);

  // Force component refresh
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // State for available parties (for dropdowns)
  const [availableParties, setAvailableParties] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAvailableProducts = () => {
    return formData.customProducts.filter(product => product && product.name && product.name.trim());
  };

  const getAvailableParties = () => {
    return availableParties.filter(party => party && party.partyName && party.vehicleNo);
  };

  const handleCustomProductChange = (index, field, value) => {
    const updatedProducts = [...formData.customProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      customProducts: updatedProducts
    }));
    
    // Save to storage (debounced to avoid too many writes)
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
      saveCustomProducts(updatedProducts);
    }, 1000);
  };

  const handleCreditSalePartyChange = (index, field, value) => {
    const newParties = [...creditSaleParties];
    newParties[index] = {
      ...newParties[index],
      [field]: value
    };
    setCreditSaleParties(newParties);
    
    // Save to storage (debounced)
    clearTimeout(window.saveCreditTimeout);
    window.saveCreditTimeout = setTimeout(() => {
      saveCreditParties(newParties);
    }, 1000);
  };

  const handleDigitalPaymentChange = (index, field, value) => {
    const newPayments = [...digitalPayments];
    newPayments[index] = {
      ...newPayments[index],
      [field]: value
    };
    setDigitalPayments(newPayments);
    
    // Save to storage (debounced)
    clearTimeout(window.savePaymentTimeout);
    window.savePaymentTimeout = setTimeout(() => {
      saveDigitalPayments(newPayments);
    }, 1000);
  };

  const addNewProduct = () => {
    setShowAddProductModal(true);
  };

  const saveNewProduct = async () => {
    if (newProductName.trim()) {
      const newProduct = {
        name: newProductName.trim(),
        openingMeter: '',
        closingMeter: '',
        totalSale: '',
        rate: '',
        totalSalesAmount: ''
      };
      
      const updatedProducts = [...formData.customProducts, newProduct];
      
      setFormData(prev => ({
        ...prev,
        customProducts: updatedProducts
      }));
      
      // Save to persistent storage
      await saveCustomProducts(updatedProducts);
      
      setNewProductName('');
      setShowAddProductModal(false);
    }
  };

  const removeCustomProduct = (index) => {
    const productName = formData.customProducts[index].name;
    setDeleteAction({
      type: 'product',
      index: index,
      name: productName
    });
    setShowDeleteConfirmModal(true);
  };

  const removeCreditSaleParty = (index) => {
    const party = creditSaleParties[index];
    const partyName = `${party.partyName} - ${party.vehicleNo}`;
    setDeleteAction({
      type: 'party',
      index: index,
      name: partyName
    });
    setShowDeleteConfirmModal(true);
  };

  const removeDigitalPayment = (index) => {
    const payment = digitalPayments[index];
    setDeleteAction({
      type: 'payment',
      index: index,
      name: payment.method
    });
    setShowDeleteConfirmModal(true);
  };

  const removePartyFromAvailable = (partyToRemove) => {
    // Remove party from available parties list completely
    setAvailableParties(prev => 
      prev.filter(party => 
        !(party.partyName === partyToRemove.partyName && party.vehicleNo === partyToRemove.vehicleNo)
      )
    );
    
    // Clear any credit sale parties that reference this deleted party
    setCreditSaleParties(prev => 
      prev.map(party => {
        if (party.partyName === partyToRemove.partyName && party.vehicleNo === partyToRemove.vehicleNo) {
          return {
            ...party,
            partyName: '',
            vehicleNo: '',
            productSelection: '',
            ltr: '',
            rate: '',
            totalCreditSalesAmount: ''
          };
        }
        return party;
      })
    );
  };

  const addNewParty = () => {
    setShowAddPartyModal(true);
  };

  const saveNewParty = async () => {
    if (newPartyData.partyName.trim() && newPartyData.vehicleNo.trim()) {
      const newParty = {
        id: Date.now(),
        partyName: newPartyData.partyName.trim(),
        vehicleNo: newPartyData.vehicleNo.trim()
      };
      
      const updatedAvailableParties = [...availableParties, newParty];
      setAvailableParties(updatedAvailableParties);
      await saveAvailableParties(updatedAvailableParties);
      
      const newCreditParty = {
        id: newParty.id,
        partyName: newParty.partyName,
        vehicleNo: newParty.vehicleNo,
        productSelection: '',
        ltr: '',
        rate: '',
        totalCreditSalesAmount: ''
      };
      
      const updatedCreditParties = [...creditSaleParties, newCreditParty];
      setCreditSaleParties(updatedCreditParties);
      await saveCreditParties(updatedCreditParties);
      
      setNewPartyData({ partyName: '', vehicleNo: '' });
      setShowAddPartyModal(false);
    }
  };

  const addNewPayment = () => {
    setShowAddPaymentModal(true);
  };

  const saveNewPayment = async () => {
    if (newPaymentMethod.trim()) {
      const newPayment = {
        id: Date.now(),
        method: newPaymentMethod.trim(),
        amount: ''
      };
      
      const updatedPayments = [...digitalPayments, newPayment];
      setDigitalPayments(updatedPayments);
      await saveDigitalPayments(updatedPayments);
      
      setNewPaymentMethod('');
      setShowAddPaymentModal(false);
    }
  };

  const confirmDelete = async () => {
    console.log(`DELETING: ${deleteAction.type} at index ${deleteAction.index} - ${deleteAction.name}`);
    
    if (deleteAction.type === 'product') {
      const deletedProduct = formData.customProducts[deleteAction.index];
      console.log(`Deleting product: ${deletedProduct.name}`);
      
      // Permanently delete product from customProducts array
      const updatedProducts = formData.customProducts.filter((_, i) => i !== deleteAction.index);
      console.log(`Products after deletion: ${updatedProducts.length} items`);
      
      setFormData(prev => ({
        ...prev,
        customProducts: updatedProducts
      }));
      
      // Save to persistent storage
      await saveCustomProducts(updatedProducts);
      console.log(`Saved ${updatedProducts.length} products to storage for ${dispenserId}`);
      
      // Clear product selection in ALL credit sale parties if it matches deleted product
      const updatedCreditParties = creditSaleParties.map(party => {
        if (party.productSelection === deletedProduct.name) {
          return {
            ...party,
            productSelection: '', // Clear the selection since product is deleted
          };
        }
        return party;
      });
      setCreditSaleParties(updatedCreditParties);
      await saveCreditParties(updatedCreditParties);
      
    } else if (deleteAction.type === 'party') {
      console.log(`Deleting party at index ${deleteAction.index}`);
      
      // Permanently delete party from creditSaleParties array
      const updatedParties = creditSaleParties.filter((_, i) => i !== deleteAction.index);
      console.log(`Parties after deletion: ${updatedParties.length} items`);
      
      setCreditSaleParties(updatedParties);
      await saveCreditParties(updatedParties);
      console.log(`Saved ${updatedParties.length} parties to storage for ${dispenserId}`);
      
    } else if (deleteAction.type === 'payment') {
      console.log(`Deleting payment method: ${deleteAction.name}`);
      
      // Permanently delete payment method from digitalPayments array
      const updatedPayments = digitalPayments.filter((_, i) => i !== deleteAction.index);
      console.log(`Payments after deletion: ${updatedPayments.length} items`);
      
      setDigitalPayments(updatedPayments);
      await saveDigitalPayments(updatedPayments);
      console.log(`Saved ${updatedPayments.length} payments to storage for ${dispenserId}`);
    }
    
    // Force component re-render by updating refresh key
    forceRefresh();
    
    // Clear modal and reset state - NO RECOVERY POSSIBLE
    setShowDeleteConfirmModal(false);
    setDeleteAction({ type: '', index: null, name: '' });
    
    // Show confirmation that item is permanently deleted
    Alert.alert(
      'Permanently Deleted', 
      `${deleteAction.name} has been permanently removed and will NEVER appear in the app again, even after restarting.`, 
      [{ text: 'OK' }]
    );
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setDeleteAction({ type: '', index: null, name: '' });
  };

  const calculateTotalSalesAmount = () => {
    return formData.customProducts.reduce((sum, product) => 
      sum + parseFloat(product.totalSalesAmount || 0), 0
    ).toFixed(2);
  };

  const calculateTotalCreditSalesAmount = () => {
    return creditSaleParties.reduce((sum, party) => 
      sum + parseFloat(party.totalCreditSalesAmount || 0), 0
    ).toFixed(2);
  };

  const calculateTotalOnlineAmount = () => {
    return digitalPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.amount || 0), 0
    ).toFixed(2);
  };

  const renderProductSection = (product, index) => (
    <View key={index} style={styles.productSection}>
      <TouchableOpacity
        style={globalStyles.deleteButton}
        onPress={() => removeCustomProduct(index)}
      >
        <Ionicons name="close" size={16} color={colors.red400} />
      </TouchableOpacity>
      
      <Text style={styles.productTitle}>{product.name}</Text>
      
      <View style={styles.inputGrid}>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Text style={globalStyles.label}>Opening Meter</Text>
            <TextInput
              style={globalStyles.input}
              value={product.openingMeter}
              onChangeText={(value) => handleCustomProductChange(index, 'openingMeter', value)}
              placeholder="Opening"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.gridItemLast}>
            <Text style={globalStyles.label}>Closing Meter</Text>
            <TextInput
              style={globalStyles.input}
              value={product.closingMeter}
              onChangeText={(value) => handleCustomProductChange(index, 'closingMeter', value)}
              placeholder="Closing"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Text style={globalStyles.label}>Total Sales In Ltr</Text>
            <TextInput
              style={globalStyles.input}
              value={product.totalSale}
              onChangeText={(value) => handleCustomProductChange(index, 'totalSale', value)}
              placeholder="Total Sales In Ltr"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.gridItemLast}>
            <Text style={globalStyles.label}>Rate</Text>
            <TextInput
              style={globalStyles.input}
              value={product.rate}
              onChangeText={(value) => handleCustomProductChange(index, 'rate', value)}
              placeholder="Rate"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Text style={globalStyles.label}>Total Sales Amount</Text>
            <TextInput
              style={globalStyles.input}
              value={product.totalSalesAmount}
              onChangeText={(value) => handleCustomProductChange(index, 'totalSalesAmount', value)}
              placeholder="Amount"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.gridItemLast}></View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea} key={refreshKey}>
      {isLoading ? (
        <View style={[globalStyles.container, globalStyles.center]}>
          <Text style={globalStyles.text}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={globalStyles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
          {/* Date and Time Selection */}
          <View style={styles.dateTimeSection}>
            <View style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>Date</Text>
              <TextInput
                style={globalStyles.input}
                value={formData.date}
                onChangeText={(value) => handleInputChange('date', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.slate400}
              />
            </View>
            
            <View style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>Time</Text>
              <TextInput
                style={globalStyles.input}
                value={formData.time}
                onChangeText={(value) => handleInputChange('time', value)}
                placeholder="HH:MM"
                placeholderTextColor={colors.slate400}
              />
            </View>
          </View>

          {/* Product Section */}
          <View style={globalStyles.card}>
            <View style={[globalStyles.row, globalStyles.spaceBetween]}>
              <Text style={globalStyles.cardTitle}>Product</Text>
              <TouchableOpacity
                onPress={addNewProduct}
                style={[globalStyles.button, globalStyles.buttonSuccess, styles.addButton]}
              >
                <Ionicons name="add" size={16} color={colors.white} />
                <Text style={[globalStyles.buttonText, { marginLeft: 4 }]}>Add Product</Text>
              </TouchableOpacity>
            </View>
            
            {/* Show empty state if no products */}
            {formData.customProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color={colors.slate600} />
                <Text style={styles.emptyStateText}>No products added</Text>
                <Text style={styles.emptyStateSubtext}>Click "Add Product" to get started</Text>
              </View>
            ) : (
              formData.customProducts.map(renderProductSection)
            )}
            
            {/* Total Sales Amount - only show if there are products */}
            {formData.customProducts.length > 0 && (
              <View style={globalStyles.summaryBox}>
                <Text style={styles.summaryTitle}>Total Sales Amount</Text>
                <TextInput
                  style={[globalStyles.input, styles.totalInput]}
                  value={calculateTotalSalesAmount()}
                  editable={false}
                  placeholder="Total Amount"
                  placeholderTextColor={colors.slate400}
                />
              </View>
            )}
          </View>

          {/* Credit Sale Section */}
          <View style={globalStyles.card}>
            <View style={[globalStyles.row, globalStyles.spaceBetween]}>
              <Text style={globalStyles.cardTitle}>Credit Sale</Text>
              <TouchableOpacity
                onPress={addNewParty}
                style={[globalStyles.button, globalStyles.buttonSuccess, styles.addButton]}
              >
                <Ionicons name="add" size={16} color={colors.white} />
                <Text style={[globalStyles.buttonText, { marginLeft: 4 }]}>Add New Party</Text>
              </TouchableOpacity>
            </View>
            
            {/* Show empty state if no credit parties */}
            {creditSaleParties.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.slate600} />
                <Text style={styles.emptyStateText}>No credit sale parties</Text>
                <Text style={styles.emptyStateSubtext}>Click "Add New Party" to get started</Text>
              </View>
            ) : (
              creditSaleParties.map((party, index) => (
                <View key={party.id} style={styles.partySection}>
                  <TouchableOpacity
                    style={globalStyles.deleteButton}
                    onPress={() => removeCreditSaleParty(index)}
                  >
                    <Ionicons name="close" size={16} color={colors.red400} />
                  </TouchableOpacity>
                  
                  <Text style={styles.partyTitle}>
                    {party.partyName && party.vehicleNo 
                      ? `Party: ${party.partyName} - ${party.vehicleNo}` 
                      : 'Credit Sale Entry'
                    }
                  </Text>
                  
                  <View style={styles.inputGrid}>
                    <View style={styles.gridRow}>
                      <View style={styles.gridItem}>
                        <Text style={globalStyles.label}>Party Name</Text>
                        <RNPickerSelect
                          onValueChange={(value) => handleCreditSalePartyChange(index, 'partyName', value)}
                          items={getAvailableParties().map(party => ({
                            label: party.partyName,
                            value: party.partyName
                          }))}
                          placeholder={{ label: "Select Party", value: null }}
                          style={pickerSelectStyles}
                          value={party.partyName}
                        />
                      </View>
                      <View style={styles.gridItemLast}>
                        <Text style={globalStyles.label}>Vehicle No</Text>
                        <RNPickerSelect
                          onValueChange={(value) => handleCreditSalePartyChange(index, 'vehicleNo', value)}
                          items={getAvailableParties().map(party => ({
                            label: party.vehicleNo,
                            value: party.vehicleNo
                          }))}
                          placeholder={{ label: "Select Vehicle", value: null }}
                          style={pickerSelectStyles}
                          value={party.vehicleNo}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.gridRow}>
                      <View style={styles.gridItem}>
                        <Text style={globalStyles.label}>Product Selection</Text>
                        <RNPickerSelect
                          onValueChange={(value) => handleCreditSalePartyChange(index, 'productSelection', value)}
                          items={getAvailableProducts().map(product => ({ 
                            label: product.name, 
                            value: product.name 
                          }))}
                          placeholder={{ label: "Select Product", value: null }}
                          style={pickerSelectStyles}
                          value={party.productSelection}
                        />
                      </View>
                      <View style={styles.gridItemLast}>
                        <Text style={globalStyles.label}>Ltr</Text>
                        <TextInput
                          style={globalStyles.input}
                          value={party.ltr}
                          onChangeText={(value) => handleCreditSalePartyChange(index, 'ltr', value)}
                          placeholder="Litres"
                          placeholderTextColor={colors.slate400}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.gridRow}>
                      <View style={styles.gridItem}>
                        <Text style={globalStyles.label}>Rate</Text>
                        <TextInput
                          style={globalStyles.input}
                          value={party.rate}
                          onChangeText={(value) => handleCreditSalePartyChange(index, 'rate', value)}
                          placeholder="Rate"
                          placeholderTextColor={colors.slate400}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.gridItemLast}>
                        <Text style={globalStyles.label}>Total Credit Sales Amount</Text>
                        <TextInput
                          style={globalStyles.input}
                          value={party.totalCreditSalesAmount}
                          onChangeText={(value) => handleCreditSalePartyChange(index, 'totalCreditSalesAmount', value)}
                          placeholder="Amount"
                          placeholderTextColor={colors.slate400}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
            
            {/* Total Credit Sales Amount - only show if there are parties */}
            {creditSaleParties.length > 0 && (
              <View style={globalStyles.summaryBox}>
                <Text style={styles.summaryTitle}>Total Credit Sales Amount</Text>
                <TextInput
                  style={[globalStyles.input, styles.totalInput]}
                  value={calculateTotalCreditSalesAmount()}
                  editable={false}
                  placeholder="Total Amount"
                  placeholderTextColor={colors.slate400}
                />
              </View>
            )}
          </View>

          {/* HP Pay / Paytm / Gpay / Phonepe / Other */}
          <View style={globalStyles.card}>
            <View style={[globalStyles.row, globalStyles.spaceBetween]}>
              <Text style={globalStyles.cardTitle}>HP Pay / Paytm / Gpay / Phonepe / Other</Text>
              <TouchableOpacity
                onPress={addNewPayment}
                style={[globalStyles.button, globalStyles.buttonSuccess, styles.addButton]}
              >
                <Ionicons name="add" size={16} color={colors.white} />
                <Text style={[globalStyles.buttonText, { marginLeft: 4 }]}>Add Payment</Text>
              </TouchableOpacity>
            </View>
            
            {/* Show empty state if no digital payments */}
            {digitalPayments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color={colors.slate600} />
                <Text style={styles.emptyStateText}>No payment methods added</Text>
                <Text style={styles.emptyStateSubtext}>Click "Add Payment" to get started</Text>
              </View>
            ) : (
              digitalPayments.map((payment, index) => (
                <View key={payment.id} style={styles.paymentSection}>
                  <TouchableOpacity
                    style={globalStyles.deleteButton}
                    onPress={() => removeDigitalPayment(index)}
                  >
                    <Ionicons name="close" size={16} color={colors.red400} />
                  </TouchableOpacity>
                  
                  <Text style={styles.paymentTitle}>{payment.method}</Text>
                  
                  <Text style={globalStyles.label}>Amount</Text>
                  <TextInput
                    style={globalStyles.input}
                    value={payment.amount}
                    onChangeText={(value) => handleDigitalPaymentChange(index, 'amount', value)}
                    placeholder="Enter amount"
                    placeholderTextColor={colors.slate400}
                    keyboardType="numeric"
                  />
                </View>
              ))
            )}
            
            {/* Total Online Amount - only show if there are payments */}
            {digitalPayments.length > 0 && (
              <View style={globalStyles.summaryBox}>
                <Text style={styles.summaryTitle}>Total Online Amount</Text>
                <TextInput
                  style={[globalStyles.input, styles.totalInput]}
                  value={calculateTotalOnlineAmount()}
                  editable={false}
                  placeholder="Total Amount"
                  placeholderTextColor={colors.slate400}
                />
              </View>
            )}
          </View>

          {/* Other Sections */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>DT Plus / Fleet Card / Xtrapower / Other</Text>
            <TextInput
              style={globalStyles.input}
              value={formData.fuelCards}
              onChangeText={(value) => handleInputChange('fuelCards', value)}
              placeholder="Enter fuel card amount"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>

          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Discounts</Text>
            <TextInput
              style={globalStyles.input}
              value={formData.discounts}
              onChangeText={(value) => handleInputChange('discounts', value)}
              placeholder="Enter discounts amount"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>

          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Expenses</Text>
            <TextInput
              style={globalStyles.input}
              value={formData.expenses}
              onChangeText={(value) => handleInputChange('expenses', value)}
              placeholder="Enter expenses amount"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>

          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Lubes</Text>
            <TextInput
              style={globalStyles.input}
              value={formData.lubes}
              onChangeText={(value) => handleInputChange('lubes', value)}
              placeholder="Enter lubes amount"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>

          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Cash on Hand</Text>
            <TextInput
              style={globalStyles.input}
              value={formData.cashOnHand}
              onChangeText={(value) => handleInputChange('cashOnHand', value)}
              placeholder="Enter cash on hand amount"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonPrimary, styles.actionButton]}
              onPress={() => {
                Alert.alert('Success', 'Data confirmed and saved!');
                navigation.goBack();
              }}
            >
              <Text style={globalStyles.buttonText}>Confirm & Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonSuccess, styles.actionButton]}
              onPress={() => {
                Alert.alert('Success', 'Data saved!');
                navigation.goBack();
              }}
            >
              <Text style={globalStyles.buttonText}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[globalStyles.button, styles.buttonSecondary, styles.actionButton]}
              onPress={() => Alert.alert('Edit', 'Edit mode activated')}
            >
              <Text style={globalStyles.buttonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[globalStyles.button, styles.buttonSecondary, styles.actionButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={globalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Debug Button - Remove in production */}
          <View style={styles.debugSection}>
            <TouchableOpacity
              style={[globalStyles.button, styles.debugButton, styles.actionButton]}
              onPress={() => {
                Alert.alert(
                  'Debug Storage', 
                  'Clear all storage for this dispenser?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: clearAllStorage }
                  ]
                );
              }}
            >
              <Text style={globalStyles.buttonText}>🐛 Debug: Clear Storage</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      )}

      {/* Modals */}
      <Modal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        title="Add New Product"
      >
        <Text style={globalStyles.label}>Product Name</Text>
        <TextInput
          style={globalStyles.input}
          value={newProductName}
          onChangeText={setNewProductName}
          placeholder="Enter product name"
          placeholderTextColor={colors.slate400}
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonSuccess, styles.modalButton]}
            onPress={saveNewProduct}
            disabled={!newProductName.trim()}
          >
            <Text style={globalStyles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, styles.buttonSecondary, styles.modalButton]}
            onPress={() => {
              setNewProductName('');
              setShowAddProductModal(false);
            }}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={showAddPartyModal}
        onClose={() => setShowAddPartyModal(false)}
        title="Add New Party"
      >
        <Text style={globalStyles.label}>Party Name</Text>
        <TextInput
          style={globalStyles.input}
          value={newPartyData.partyName}
          onChangeText={(value) => setNewPartyData(prev => ({ ...prev, partyName: value }))}
          placeholder="Enter party name"
          placeholderTextColor={colors.slate400}
        />
        
        <Text style={[globalStyles.label, { marginTop: 16 }]}>Vehicle No</Text>
        <TextInput
          style={globalStyles.input}
          value={newPartyData.vehicleNo}
          onChangeText={(value) => setNewPartyData(prev => ({ ...prev, vehicleNo: value }))}
          placeholder="Enter vehicle number"
          placeholderTextColor={colors.slate400}
        />
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonSuccess, styles.modalButton]}
            onPress={saveNewParty}
            disabled={!newPartyData.partyName.trim() || !newPartyData.vehicleNo.trim()}
          >
            <Text style={globalStyles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, styles.buttonSecondary, styles.modalButton]}
            onPress={() => {
              setNewPartyData({ partyName: '', vehicleNo: '' });
              setShowAddPartyModal(false);
            }}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        title="Add New Payment Method"
      >
        <Text style={globalStyles.label}>Payment Method</Text>
        <TextInput
          style={globalStyles.input}
          value={newPaymentMethod}
          onChangeText={setNewPaymentMethod}
          placeholder="Enter payment method (e.g., Gpay, PhonePe, Other)"
          placeholderTextColor={colors.slate400}
        />
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonSuccess, styles.modalButton]}
            onPress={saveNewPayment}
            disabled={!newPaymentMethod.trim()}
          >
            <Text style={globalStyles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, styles.buttonSecondary, styles.modalButton]}
            onPress={() => {
              setNewPaymentMethod('');
              setShowAddPaymentModal(false);
            }}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={showDeleteConfirmModal}
        onClose={cancelDelete}
        title="⚠️ Permanent Delete"
        showCloseButton={false}
      >
        <Text style={globalStyles.text}>
          Are you sure you want to permanently delete "{deleteAction.name}"?
        </Text>
        <Text style={[globalStyles.textMuted, { marginTop: 8, fontWeight: 'bold', color: colors.red400 }]}>
          ⚠️ This item will be permanently removed and will NEVER reappear, even after restarting the app.
        </Text>
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonDanger, styles.modalButton]}
            onPress={confirmDelete}
          >
            <Text style={globalStyles.buttonText}>Delete Permanently</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, styles.buttonSecondary, styles.modalButton]}
            onPress={cancelDelete}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dateTimeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 12,
  },
  productSection: {
    borderWidth: 1,
    borderColor: colors.slate600,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  partySection: {
    borderWidth: 1,
    borderColor: colors.slate600,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  paymentSection: {
    borderWidth: 1,
    borderColor: colors.slate600,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  productTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  partyTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  paymentTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  inputGrid: {
    marginTop: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    marginRight: 8,
  },
  gridItemLast: {
    flex: 1,
    marginRight: 0,
  },
  summaryTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  totalInput: {
    backgroundColor: colors.slate600,
    borderColor: colors.slate500,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    width: (screenWidth - 48) / 2,
    marginBottom: 12,
    height: 44,
  },
  buttonSecondary: {
    backgroundColor: colors.slate600,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  debugSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.slate700,
  },
  debugButton: {
    backgroundColor: colors.red600,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    color: colors.slate400,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: colors.slate500,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.slate600,
    borderRadius: 4,
    color: colors.white,
    backgroundColor: colors.slate700,
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.slate600,
    borderRadius: 4,
    color: colors.white,
    backgroundColor: colors.slate700,
    paddingRight: 30,
  },
});