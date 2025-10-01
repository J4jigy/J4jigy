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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { colors, globalStyles } from '../styles/globalStyles';
import Modal from '../components/Modal';

export default function CashOutEntryScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedExpense, setSelectedExpense] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showChequeModal, setShowChequeModal] = useState(false);

  const [chequeDetails, setChequeDetails] = useState({
    bankName: '',
    ifscCode: '',
    chequeNo: ''
  });

  const suppliers = []; // Empty - no default suppliers

  const expenses = []; // Empty - no default expenses

  const businessCategories = []; // Empty - no default categories

  const paymentModes = ['Cash', 'Card', 'UPI', 'Cheque'];

  const handleChequePayment = () => {
    setShowChequeModal(true);
  };

  const saveChequeDetails = () => {
    if (chequeDetails.bankName && chequeDetails.ifscCode && chequeDetails.chequeNo) {
      setShowChequeModal(false);
      setPaymentMode('Cheque');
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
      supplier: selectedSupplier,
      expense: selectedExpense,
      paymentMode,
      date: new Date(),
    };

    Alert.alert('Success', 'Cash Out entry saved successfully!');
    
    // Reset form
    setAmount('');
    setDescription('');
    setSelectedSupplier('');
    setSelectedExpense('');
    setPaymentMode('Cash');
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Supplier and Expense Selection */}
          <View style={styles.selectionSection}>
            <View style={styles.selectionItem}>
              <Text style={globalStyles.label}>Supplier</Text>
              {suppliers.length === 0 ? (
                <View style={styles.emptyDropdown}>
                  <Text style={styles.emptyDropdownText}>No suppliers available</Text>
                </View>
              ) : (
                <RNPickerSelect
                  onValueChange={setSelectedSupplier}
                  items={suppliers.slice(1)}
                  placeholder={suppliers[0]}
                  style={pickerSelectStyles}
                  value={selectedSupplier}
                />
              )}
            </View>

            <View style={styles.selectionItem}>
              <Text style={globalStyles.label}>Expense</Text>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonPrimary, styles.expenseButton]}
                onPress={() => setShowExpenseModal(true)}
              >
                <Text style={globalStyles.buttonText}>Select Expenses</Text>
              </TouchableOpacity>
            </View>
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

          {/* Expense Categories */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Expense Categories</Text>
            {businessCategories.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={colors.slate600} />
                <Text style={styles.emptyStateText}>No categories available</Text>
                <Text style={styles.emptyStateSubtext}>Categories will appear here when added</Text>
              </View>
            ) : (
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
            )}
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
            style={[globalStyles.button, globalStyles.buttonDanger, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={globalStyles.buttonText}>Save Cash Out Entry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Expense Selection Modal */}
      <Modal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Select Expenses"
      >
        {expenses.length === 0 ? (
          <View style={styles.emptyModalState}>
            <Ionicons name="receipt-outline" size={48} color={colors.slate600} />
            <Text style={styles.emptyStateText}>No expenses available</Text>
            <Text style={styles.emptyStateSubtext}>Expenses will appear here when added</Text>
          </View>
        ) : (
          <View style={styles.expenseList}>
            {expenses.map((expense, index) => (
              <TouchableOpacity
                key={index}
                style={styles.expenseItem}
                onPress={() => {
                  setSelectedExpense(expense.value);
                  setShowExpenseModal(false);
                }}
              >
                <Text style={globalStyles.text}>{expense.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  selectionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectionItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  expenseButton: {
    height: 32,
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
  expenseList: {
    marginTop: 8,
  },
  expenseItem: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.slate400,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.slate500,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyModalState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyDropdown: {
    backgroundColor: colors.slate700,
    borderWidth: 1,
    borderColor: colors.slate600,
    borderRadius: 4,
    height: 32,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  emptyDropdownText: {
    color: colors.slate500,
    fontSize: 14,
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