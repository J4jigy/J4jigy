import React, { useState, useCallback } from 'react';
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
import { colors, globalStyles } from '../styles/globalStyles';
import Modal from '../components/Modal';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

export default function CashInEntryScreen({ navigation }) {
  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [navigation])
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [activeSlot, setActiveSlot] = useState(0);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showChequeModal, setShowChequeModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  const [posSlots, setPosSlots] = useState(Array(6).fill(null).map((_, i) => ({
    id: i,
    amount: '',
    items: [],
    total: 0,
    customerName: `Customer ${i + 1}` // Default name, can be renamed
  })));

  // State for slot management modals
  const [showSlotOptionsModal, setShowSlotOptionsModal] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [newSlotName, setNewSlotName] = useState('');

  const [chequeDetails, setChequeDetails] = useState({
    bankName: '',
    ifscCode: '',
    chequeNo: ''
  });

  const customers = []; // Empty - no default customers

  const products = []; // Empty - no default products

  const businessCategories = []; // Empty - no default categories

  const paymentModes = ['Cash', 'Card', 'UPI', 'Cheque'];

  const handleSlotPress = (index) => {
    if (index === activeSlot) {
      // Show bill for active slot
      setShowBillModal(true);
    } else {
      // Switch to clicked slot
      setActiveSlot(index);
    }
  };

  const handleSlotLongPress = (index) => {
    // Show slot management options on long press
    setSelectedSlotIndex(index);
    setShowSlotOptionsModal(true);
  };

  const clearCurrentSlot = () => {
    setShowSlotOptionsModal(false);
    setShowClearConfirmModal(true);
  };

  const confirmClearSlot = () => {
    // Permanently clear slot - NO RECOVERY
    const newSlots = [...posSlots];
    newSlots[selectedSlotIndex] = {
      id: selectedSlotIndex,
      amount: '',
      items: [],
      total: 0,
      customerName: `Customer ${selectedSlotIndex + 1}` // Reset to default name
    };
    setPosSlots(newSlots);
    setShowClearConfirmModal(false);
    setSelectedSlotIndex(null);
    
    Alert.alert('Permanently Cleared', `Slot has been permanently cleared and reset to default. All data has been permanently removed from the app.`);
  };

  const renameSlot = () => {
    setShowSlotOptionsModal(false);
    setNewSlotName(posSlots[selectedSlotIndex].customerName);
    setShowRenameModal(true);
  };

  const confirmRenameSlot = () => {
    if (newSlotName.trim()) {
      const newSlots = [...posSlots];
      newSlots[selectedSlotIndex] = {
        ...newSlots[selectedSlotIndex],
        customerName: newSlotName.trim()
      };
      setPosSlots(newSlots);
      setShowRenameModal(false);
      setNewSlotName('');
      setSelectedSlotIndex(null);
    }
  };

  const handleChequePayment = () => {
    setShowChequeModal(true);
  };

  const saveChequeDetails = () => {
    if (chequeDetails.bankName && chequeDetails.ifscCode && chequeDetails.chequeNo) {
      setShowChequeModal(false);
      Alert.alert('Success', 'Cheque details saved!');
    } else {
      Alert.alert('Error', 'Please fill all cheque details');
    }
  };

  const handleSave = () => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const newEntry = {
      amount: parseFloat(amount),
      description,
      customer: selectedCustomer,
      product: selectedProduct,
      paymentMode,
      date: new Date(),
      slot: activeSlot
    };

    // Update active slot
    const newSlots = [...posSlots];
    newSlots[activeSlot] = {
      ...newSlots[activeSlot],
      amount: amount,
      total: parseFloat(amount) + newSlots[activeSlot].total
    };
    setPosSlots(newSlots);

    Alert.alert('Success', 'Cash In entry saved successfully!');
    
    // Reset form
    setAmount('');
    setDescription('');
    setSelectedCustomer('');
    setSelectedProduct('');
    setPaymentMode('Cash');
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* POS Slots */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>POS Multi Customer Slots</Text>
            <View style={styles.slotsContainer}>
              {posSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.slot,
                    index === activeSlot && styles.activeSlot
                  ]}
                  onPress={() => handleSlotPress(index)}
                  onLongPress={() => handleSlotLongPress(index)}
                >
                  <Text style={[
                    styles.slotText,
                    index === activeSlot && styles.activeSlotText
                  ]}>
                    {slot.customerName || `C${index + 1}`}
                  </Text>
                  <Text style={[
                    styles.slotAmount,
                    index === activeSlot && styles.activeSlotText
                  ]}>
                    ₹{slot.total || 0}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Customer and Product Selection */}
          <View style={styles.selectionSection}>
            <View style={styles.selectionItem}>
              <Text style={globalStyles.label}>Customer</Text>
              <RNPickerSelect
                onValueChange={setSelectedCustomer}
                items={customers.slice(1)}
                placeholder={customers[0]}
                style={pickerSelectStyles}
                value={selectedCustomer}
              />
            </View>

            <View style={styles.selectionItem}>
              <Text style={globalStyles.label}>Product</Text>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonPrimary, styles.productButton]}
                onPress={() => setShowProductModal(true)}
              >
                <Text style={globalStyles.buttonText}>Select Products</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[globalStyles.button, styles.fuelButton]}
              onPress={() => navigation.navigate('FuelDispenser')}
            >
              <Ionicons name="car" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Amount</Text>
            <TextInput
              style={[globalStyles.input, styles.amountInput]}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
            />
          </View>

          {/* Description */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Description</Text>
            <TextInput
              style={[globalStyles.input, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description (optional)"
              placeholderTextColor={colors.slate400}
              multiline
            />
          </View>

          {/* Business Categories */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Business Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesContainer}>
                {businessCategories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.categoryChip}
                    onPress={() => setDescription(category)}
                  >
                    <Text style={styles.categoryText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Payment Mode */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Payment Mode</Text>
            <View style={styles.paymentModes}>
              {paymentModes.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.paymentMode,
                    paymentMode === mode && styles.selectedPaymentMode
                  ]}
                  onPress={() => {
                    if (mode === 'Cheque') {
                      handleChequePayment();
                    } else {
                      setPaymentMode(mode);
                    }
                  }}
                >
                  <Text style={[
                    styles.paymentModeText,
                    paymentMode === mode && styles.selectedPaymentModeText
                  ]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonSuccess, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={globalStyles.buttonText}>Save Cash In Entry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Product Selection Modal */}
      <Modal
        visible={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Select Products"
      >
        <View style={styles.productList}>
          {products.map((product, index) => (
            <TouchableOpacity
              key={index}
              style={styles.productItem}
              onPress={() => {
                setSelectedProduct(product.value);
                setShowProductModal(false);
              }}
            >
              <Text style={globalStyles.text}>{product.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Cheque Details Modal */}
      <Modal
        visible={showChequeModal}
        onClose={() => setShowChequeModal(false)}
        title="Cheque Details"
      >
        <Text style={globalStyles.label}>Bank Name</Text>
        <TextInput
          style={globalStyles.input}
          value={chequeDetails.bankName}
          onChangeText={(value) => setChequeDetails(prev => ({ ...prev, bankName: value }))}
          placeholder="Enter bank name"
          placeholderTextColor={colors.slate400}
        />
        
        <Text style={[globalStyles.label, { marginTop: 16 }]}>IFSC Code</Text>
        <TextInput
          style={globalStyles.input}
          value={chequeDetails.ifscCode}
          onChangeText={(value) => setChequeDetails(prev => ({ ...prev, ifscCode: value }))}
          placeholder="Enter IFSC code"
          placeholderTextColor={colors.slate400}
        />
        
        <Text style={[globalStyles.label, { marginTop: 16 }]}>Cheque No.</Text>
        <TextInput
          style={globalStyles.input}
          value={chequeDetails.chequeNo}
          onChangeText={(value) => setChequeDetails(prev => ({ ...prev, chequeNo: value }))}
          placeholder="Enter cheque number"
          placeholderTextColor={colors.slate400}
        />
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonPrimary, styles.modalButton]}
            onPress={saveChequeDetails}
          >
            <Text style={globalStyles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, styles.buttonSecondary, styles.modalButton]}
            onPress={() => setShowChequeModal(false)}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Bill Modal */}
      <Modal
        visible={showBillModal}
        onClose={() => setShowBillModal(false)}
        title={`Bill / Invoice - C${activeSlot + 1}`}
      >
        <View style={styles.billContent}>
          <View style={styles.billHeader}>
            <Text style={styles.businessName}>Your Business Name</Text>
            <Text style={globalStyles.textMuted}>Business Address</Text>
            <Text style={globalStyles.textMuted}>Phone: +91 XXXXXXXXXX</Text>
            <Text style={globalStyles.textMuted}>Email: business@email.com</Text>
          </View>
          
          <View style={styles.billDetails}>
            <Text style={globalStyles.text}>Bill No: INV-{Math.floor(Math.random() * 100000)}</Text>
            <Text style={globalStyles.text}>Date: {new Date().toLocaleDateString()}</Text>
            <Text style={globalStyles.text}>Customer: C{activeSlot + 1}</Text>
            <Text style={globalStyles.text}>Payment: {paymentMode}</Text>
          </View>
          
          <View style={styles.billTotal}>
            <Text style={styles.totalText}>Total: ₹{posSlots[activeSlot].total || 0}</Text>
          </View>
          
          <View style={styles.billButtons}>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonSuccess, styles.billButton]}
              onPress={() => Alert.alert('Print', 'Printing bill...')}
            >
              <Text style={globalStyles.buttonText}>Print</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonPrimary, styles.billButton]}
              onPress={() => Alert.alert('Share', 'Sharing bill...')}
            >
              <Text style={globalStyles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Slot Options Modal */}
      <Modal
        visible={showSlotOptionsModal}
        onClose={() => setShowSlotOptionsModal(false)}
        title={`Manage ${posSlots[selectedSlotIndex]?.customerName || 'Slot'}`}
      >
        <View style={styles.slotOptionsContainer}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonDanger, styles.optionButton]}
            onPress={clearCurrentSlot}
          >
            <Text style={globalStyles.buttonText}>Clear Current Slot</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonPrimary, styles.optionButton]}
            onPress={renameSlot}
          >
            <Text style={globalStyles.buttonText}>Rename Slot</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[globalStyles.button, styles.buttonSecondary, styles.optionButton]}
            onPress={() => setShowSlotOptionsModal(false)}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Clear Slot Confirmation Modal */}
      <Modal
        visible={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        title="⚠️ Permanently Clear Slot"
        showCloseButton={false}
      >
        <Text style={globalStyles.text}>
          Are you sure you want to permanently clear "{posSlots[selectedSlotIndex]?.customerName}"?
        </Text>
        <Text style={[globalStyles.textMuted, { marginTop: 8, fontWeight: 'bold', color: colors.red400 }]}>
          ⚠️ All data will be permanently lost and will NOT appear anywhere in the app.
        </Text>
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonDanger, styles.modalButton]}
            onPress={confirmClearSlot}
          >
            <Text style={globalStyles.buttonText}>Clear Permanently</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, styles.buttonSecondary, styles.modalButton]}
            onPress={() => setShowClearConfirmModal(false)}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Rename Slot Modal */}
      <Modal
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="Rename Slot"
      >
        <Text style={globalStyles.label}>Slot Name</Text>
        <TextInput
          style={globalStyles.input}
          value={newSlotName}
          onChangeText={setNewSlotName}
          placeholder="Enter new slot name"
          placeholderTextColor={colors.slate400}
        />
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonSuccess, styles.modalButton]}
            onPress={confirmRenameSlot}
            disabled={!newSlotName.trim()}
          >
            <Text style={globalStyles.buttonText}>Rename</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, styles.buttonSecondary, styles.modalButton]}
            onPress={() => {
              setShowRenameModal(false);
              setNewSlotName('');
            }}
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
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  slot: {
    backgroundColor: colors.slate700,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate600,
    padding: 12,
    width: (screenWidth - 64) / 3,
    alignItems: 'center',
    marginBottom: 8,
  },
  activeSlot: {
    backgroundColor: colors.blue600,
    borderColor: colors.blue500,
  },
  slotText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  slotAmount: {
    color: colors.slate400,
    fontSize: 12,
    marginTop: 4,
  },
  activeSlotText: {
    color: colors.white,
  },
  selectionSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  selectionItem: {
    flex: 1,
    marginRight: 8,
  },
  productButton: {
    height: 32,
    marginTop: 4,
  },
  fuelButton: {
    backgroundColor: colors.orange600,
    width: 44,
    height: 32,
    padding: 0,
    marginTop: 4,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    height: 44,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryChip: {
    backgroundColor: colors.slate700,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryText: {
    color: colors.white,
    fontSize: 12,
  },
  paymentModes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  paymentMode: {
    backgroundColor: colors.slate700,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPaymentMode: {
    backgroundColor: colors.blue600,
    borderColor: colors.blue500,
  },
  paymentModeText: {
    color: colors.slate300,
    fontSize: 14,
  },
  selectedPaymentModeText: {
    color: colors.white,
    fontWeight: '500',
  },
  saveButton: {
    height: 44,
    marginTop: 16,
    marginBottom: 32,
  },
  productList: {
    marginTop: 8,
  },
  productItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate600,
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
  buttonSecondary: {
    backgroundColor: colors.slate600,
  },
  billContent: {
    paddingVertical: 8,
  },
  billHeader: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate600,
    marginBottom: 16,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  billDetails: {
    marginBottom: 16,
  },
  billTotal: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.slate600,
    marginBottom: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  billButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  slotOptionsContainer: {
    marginTop: 8,
  },
  optionButton: {
    marginBottom: 12,
    height: 44,
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