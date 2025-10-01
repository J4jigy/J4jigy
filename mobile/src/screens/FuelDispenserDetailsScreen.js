import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { colors, globalStyles } from '../styles/globalStyles';
import Modal from '../components/Modal';

const { width: screenWidth } = Dimensions.get('window');

export default function FuelDispenserDetailsScreen({ route, navigation }) {
  const { dispenserId } = route.params;

  // State for form data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    customProducts: [
      {
        name: 'Petrol',
        openingMeter: '',
        closingMeter: '',
        totalSale: '',
        rate: '',
        totalSalesAmount: ''
      },
      {
        name: 'Diesel',
        openingMeter: '',
        closingMeter: '',
        totalSale: '',
        rate: '',
        totalSalesAmount: ''
      },
      {
        name: 'Power Petrol',
        openingMeter: '',
        closingMeter: '',
        totalSale: '',
        rate: '',
        totalSalesAmount: ''
      },
      {
        name: 'Turbo Diesel',
        openingMeter: '',
        closingMeter: '',
        totalSale: '',
        rate: '',
        totalSalesAmount: ''
      }
    ],
    creditSale: '',
    digitalPayments: '',
    fuelCards: '',
    discounts: '',
    expenses: '',
    lubes: '',
    cashOnHand: ''
  });

  // State for credit sale parties
  const [creditSaleParties, setCreditSaleParties] = useState([
    {
      id: Date.now(),
      partyName: '',
      vehicleNo: '',
      productSelection: '',
      ltr: '',
      rate: '',
      totalCreditSalesAmount: ''
    }
  ]);

  // State for digital payment methods
  const [digitalPayments, setDigitalPayments] = useState([
    {
      id: Date.now() + 1,
      method: 'HP Pay',
      amount: ''
    },
    {
      id: Date.now() + 2,
      method: 'Paytm',
      amount: ''
    }
  ]);

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

  // State for available parties (for dropdowns)
  const [availableParties, setAvailableParties] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomProductChange = (index, field, value) => {
    setFormData(prev => {
      const newCustomProducts = [...prev.customProducts];
      newCustomProducts[index] = {
        ...newCustomProducts[index],
        [field]: value
      };
      return {
        ...prev,
        customProducts: newCustomProducts
      };
    });
  };

  const addNewProduct = () => {
    setShowAddProductModal(true);
  };

  const saveNewProduct = () => {
    if (newProductName.trim()) {
      setFormData(prev => ({
        ...prev,
        customProducts: [
          ...prev.customProducts,
          {
            name: newProductName.trim(),
            openingMeter: '',
            closingMeter: '',
            totalSale: '',
            rate: '',
            totalSalesAmount: ''
          }
        ]
      }));
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

  const saveNewParty = () => {
    if (newPartyData.partyName.trim() && newPartyData.vehicleNo.trim()) {
      const newParty = {
        id: Date.now(),
        partyName: newPartyData.partyName.trim(),
        vehicleNo: newPartyData.vehicleNo.trim()
      };
      
      setAvailableParties(prev => [...prev, newParty]);
      
      setCreditSaleParties(prev => [
        ...prev,
        {
          id: newParty.id,
          partyName: newParty.partyName,
          vehicleNo: newParty.vehicleNo,
          productSelection: '',
          ltr: '',
          rate: '',
          totalCreditSalesAmount: ''
        }
      ]);
      
      setNewPartyData({ partyName: '', vehicleNo: '' });
      setShowAddPartyModal(false);
    }
  };

  const addNewPayment = () => {
    setShowAddPaymentModal(true);
  };

  const saveNewPayment = () => {
    if (newPaymentMethod.trim()) {
      setDigitalPayments(prev => [
        ...prev,
        {
          id: Date.now(),
          method: newPaymentMethod.trim(),
          amount: ''
        }
      ]);
      setNewPaymentMethod('');
      setShowAddPaymentModal(false);
    }
  };

  const confirmDelete = () => {
    if (deleteAction.type === 'product') {
      const deletedProduct = formData.customProducts[deleteAction.index];
      
      // Permanently delete product from customProducts array
      setFormData(prev => ({
        ...prev,
        customProducts: prev.customProducts.filter((_, i) => i !== deleteAction.index)
      }));
      
      // Clear product selection in credit sale parties if it matches deleted product
      setCreditSaleParties(prev => 
        prev.map(party => {
          if (party.productSelection === deletedProduct.name) {
            return {
              ...party,
              productSelection: '', // Clear the selection since product is deleted
            };
          }
          return party;
        })
      );
      
    } else if (deleteAction.type === 'party') {
      // Permanently delete party from creditSaleParties array
      setCreditSaleParties(prev => prev.filter((_, i) => i !== deleteAction.index));
      
    } else if (deleteAction.type === 'payment') {
      // Permanently delete payment method from digitalPayments array
      setDigitalPayments(prev => prev.filter((_, i) => i !== deleteAction.index));
    }
    
    // Clear modal and reset state - NO RECOVERY POSSIBLE
    setShowDeleteConfirmModal(false);
    setDeleteAction({ type: '', index: null, name: '' });
    
    // Show confirmation that item is permanently deleted
    Alert.alert('Permanently Deleted', `${deleteAction.name} has been permanently removed from the app and will no longer appear anywhere.`, [{ text: 'OK' }]);
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
    <SafeAreaView style={globalStyles.safeArea}>
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
            
            {formData.customProducts.map(renderProductSection)}
            
            {/* Total Sales Amount */}
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
            
            {/* Credit Sale Parties */}
            {creditSaleParties.map((party, index) => (
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
                        onValueChange={(value) => {
                          const newParties = [...creditSaleParties];
                          newParties[index] = { ...newParties[index], partyName: value };
                          setCreditSaleParties(newParties);
                        }}
                        items={availableParties
                          .filter(availableParty => availableParty && availableParty.partyName) // Only show existing parties
                          .map((availableParty) => ({
                            label: availableParty.partyName,
                            value: availableParty.partyName
                          }))
                        }
                        placeholder={{ label: "Select Party", value: null }}
                        style={pickerSelectStyles}
                        value={party.partyName}
                      />
                    </View>
                    <View style={styles.gridItemLast}>
                      <Text style={globalStyles.label}>Vehicle No</Text>
                      <RNPickerSelect
                        onValueChange={(value) => {
                          const newParties = [...creditSaleParties];
                          newParties[index] = { ...newParties[index], vehicleNo: value };
                          setCreditSaleParties(newParties);
                        }}
                        items={availableParties
                          .filter(availableParty => availableParty && availableParty.vehicleNo) // Only show existing parties
                          .map((availableParty) => ({
                            label: availableParty.vehicleNo,
                            value: availableParty.vehicleNo
                          }))
                        }
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
                        onValueChange={(value) => {
                          const newParties = [...creditSaleParties];
                          newParties[index] = { ...newParties[index], productSelection: value };
                          setCreditSaleParties(newParties);
                        }}
                        items={formData.customProducts
                          .filter(product => product && product.name) // Only show existing products
                          .map(product => ({ 
                            label: product.name, 
                            value: product.name 
                          }))
                        }
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
                        onChangeText={(value) => {
                          const newParties = [...creditSaleParties];
                          newParties[index] = { ...newParties[index], ltr: value };
                          setCreditSaleParties(newParties);
                        }}
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
                        onChangeText={(value) => {
                          const newParties = [...creditSaleParties];
                          newParties[index] = { ...newParties[index], rate: value };
                          setCreditSaleParties(newParties);
                        }}
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
                        onChangeText={(value) => {
                          const newParties = [...creditSaleParties];
                          newParties[index] = { ...newParties[index], totalCreditSalesAmount: value };
                          setCreditSaleParties(newParties);
                        }}
                        placeholder="Amount"
                        placeholderTextColor={colors.slate400}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
            
            {/* Total Credit Sales Amount */}
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
            
            {/* Digital Payment Methods */}
            {digitalPayments.map((payment, index) => (
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
                  onChangeText={(value) => {
                    const newPayments = [...digitalPayments];
                    newPayments[index] = { ...newPayments[index], amount: value };
                    setDigitalPayments(newPayments);
                  }}
                  placeholder="Enter amount"
                  placeholderTextColor={colors.slate400}
                  keyboardType="numeric"
                />
              </View>
            ))}
            
            {/* Total Online Amount */}
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
        </View>
      </ScrollView>

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
          ⚠️ This action CANNOT be undone. The item will be permanently removed.
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