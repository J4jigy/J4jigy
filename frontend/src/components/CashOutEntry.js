import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../contexts/BusinessContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import BarcodeScanner from './BarcodeScanner';
import { 
  ArrowLeft, 
  Settings, 
  Scan, 
  Barcode,
  Plus, 
  Delete,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
  Users,
  User,
  Building,
  FileText,
  Package,
  CircleDollarSign,
  Coins,
  Search,
  X,
  Landmark,
  Truck,
  Mic
} from 'lucide-react';

const CashOutEntry = ({ onBack }) => {
  const API = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  const [amount, setAmount] = useState('0');
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // Invoice scanning states
  const [showInvoiceScanModal, setShowInvoiceScanModal] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  
  // Auto-detect language from browser/system
  const getDetectedLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    const supportedLangs = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'mr': 'mr-IN',
      'pa': 'pa-IN'
    };
    
    const langCode = browserLang.split('-')[0];
    return supportedLangs[langCode] || 'en-IN';
  };
  
  const [selectedLanguage] = useState(getDetectedLanguage());
  
  // POS multi-customer slots
  const initialSlots = Array.from({ length: 6 }, (_, i) => ({ id: i, label: `C${i + 1}`, amount: '0' }));
  const [slots, setSlots] = useState(initialSlots);
  const [activeSlot, setActiveSlot] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(new Date().toTimeString().slice(0, 5));
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedItems, setSelectedItems] = useState({});

  // Measurement for Add New Expense modal
  const [expenseMeasurement, setExpenseMeasurement] = useState('Piece');

  const incQty = (name) => {
    setSelectedItems(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  };
  const decQty = (name) => {
    setSelectedItems(prev => {
      const curr = prev[name] || 0;
      if (curr <= 1) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: curr - 1 };
    });
  };
  const [expenseQty, setExpenseQty] = useState(1);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [showCreditTermsDropdown, setShowCreditTermsDropdown] = useState(false);
  const [selectedCreditTerm, setSelectedCreditTerm] = useState('');
  
  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [showCustomerDebtorModal, setShowCustomerDebtorModal] = useState(false);
  const [showSupplierCreditorModal, setShowSupplierCreditorModal] = useState(false);
  const [supplierCreditorTab, setSupplierCreditorTab] = useState('suppliers'); // Tab state
  
  // Add New Expense Modal States
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('General');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseReference, setNewExpenseReference] = useState('');
  const [newExpenseBarcode, setNewExpenseBarcode] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  
  // Barcode scanning states
  const [scannedBarcode, setScannedBarcode] = useState('');
  
  // Search states
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  
  // Cheque modal states
  const [showChequeModal, setShowChequeModal] = useState(false);
  const [chequeBankName, setChequeBankName] = useState('');
  const [chequeIfscCode, setChequeIfscCode] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [darkTheme, setDarkTheme] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [defaultPaymentMode, setDefaultPaymentMode] = useState('Cash');

  // Sample data
  // load slots from business-specific storage
  useEffect(() => {
    const savedData = getData('cashout_data', null);
    if (savedData) {
      try {
        const { slots, activeSlot } = savedData;
        
        if (slots && Array.isArray(slots) && slots.length > 0) {
          setSlots(slots);
          setAmount(slots[activeSlot]?.amount || '0');
        }
        
        if (typeof activeSlot === 'number' && activeSlot >= 0 && activeSlot < slots.length) {
          setActiveSlot(activeSlot);
        }
      } catch (e) {
        console.error('Failed to parse saved slots:', e);
      }
    }
  }, [activeBusiness.id, getData]); // reload when business changes
  // Initialize speech recognition with multi-language support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = selectedLanguage;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice input:', transcript);
        
        // Number words mapping for Indian languages
        const numberWords = {
          // English
          'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
          'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
          'twenty': '20', 'thirty': '30', 'forty': '40', 'fifty': '50',
          'sixty': '60', 'seventy': '70', 'eighty': '80', 'ninety': '90',
          'hundred': '00', 'thousand': '000',
          // Hindi numbers
          'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पांच': '5',
          'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9', 'दस': '10',
          'बीस': '20', 'तीस': '30', 'चालीस': '40', 'पचास': '50',
          'साठ': '60', 'सत्तर': '70', 'अस्सी': '80', 'नब्बे': '90',
          'सौ': '00', 'हजार': '000'
        };

        let detectedNumber = '';
        
        // First try to extract direct digits
        const numberMatch = transcript.match(/\d+/);
        if (numberMatch) {
          detectedNumber = numberMatch[0];
        } else {
          // Try to convert word to number
          const words = transcript.toLowerCase().split(' ');
          let tempNumber = '';
          
          for (const word of words) {
            if (numberWords[word]) {
              tempNumber += numberWords[word];
            }
          }
          
          if (tempNumber) {
            detectedNumber = tempNumber;
          }
        }

        if (detectedNumber) {
          handleCalculatorInput(detectedNumber);
          console.log('Amount set to:', detectedNumber);
        } else {
          console.log('No number detected in:', transcript);
          alert('कृपया संख्या बोलें / Please speak a number');
        }
        
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('माइक्रोफ़ोन अनुमति की आवश्यकता है / Microphone permission required');
        }
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.log('Speech recognition not supported in this browser');
    }
  }, [selectedLanguage]);

  // Handle voice input with auto-detected language
  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Voice recognition is not supported in your browser / आपके ब्राउज़र में वॉयस पहचान समर्थित नहीं है');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.lang = selectedLanguage;
        recognition.start();
        setIsListening(true);
        console.log('Listening for voice input in auto-detected language:', selectedLanguage);
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('कृपया पुनः प्रयास करें / Please try again');
      }
    }
  };

  // Available Indian languages for voice recognition (auto-detected)
  const indianLanguages = [
    { code: 'en-IN', name: 'English (India)', label: 'English' },
    { code: 'hi-IN', name: 'हिन्दी (Hindi)', label: 'हिन्दी' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)', label: 'தமிழ்' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)', label: 'తెలుగు' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)', label: 'ಕನ್ನಡ' },
    { code: 'ml-IN', name: 'മലയാളം (Malayalam)', label: 'മലയാളം' },
    { code: 'bn-IN', name: 'বাংলা (Bengali)', label: 'বাংলা' },
    { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)', label: 'ગુજરાતી' },
    { code: 'mr-IN', name: 'मराठी (Marathi)', label: 'मराठી' },
    { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)', label: 'ਪੰਜਾਬੀ' }
  ];

  // persist slots and active slot to business-specific storage
  useEffect(() => {
    setData('cashout_data', { slots, activeSlot });
  }, [slots, activeSlot, setData]);

  const quickAmounts = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const [expenses, setExpenses] = useState([]); // Empty - no default expenses
  const businessCategories = [
    { name: 'Customers / Debtors (देनदार)', icon: Users, selectable: true },
    { name: 'Suppliers / Creditors (लेनदार)', icon: Building, selectable: true },
    { name: 'Company Purchase', icon: Package, selectable: true },
    { name: 'Staff', icon: Users, selectable: true }
  ];
  const financeSubcategories = [
    { name: 'Bank', icon: Landmark, selectable: true },
    { name: 'Cash', icon: Coins, selectable: true },
    { name: 'Bills / Recharges Expenses', icon: FileText, selectable: true },
    { name: 'Rent Given', icon: Building, selectable: true },
    { name: 'Transport Expense', icon: Truck, selectable: true },
    { name: 'Other Expenses', icon: FileText, selectable: true }
  ];
  const financeCategories = [
    { name: 'Bills / Recharge', icon: FileText },
    { name: 'Rent', icon: Building },
    { name: 'Company Purchase', icon: Package },
    { name: 'Other Expenses', icon: FileText }
  ];
  
  const sampleNames = []; // Empty - no default staff names

  // Update amount should reflect active slot as well
  const setAmountForActive = (val) => {
    setAmount(val);
    setSlots(prev => prev.map((s, idx) => idx === activeSlot ? { ...s, amount: val } : s));
  };

  const handleCalculatorInput = (value) => {
    if (value === 'clear') {
      setAmountForActive('0');
      return;
    }
    if (value === 'back') {
      if (amount.length <= 1 || amount === '0' || amount === 'Error') {
        setAmountForActive('0');
      } else {
        setAmountForActive(amount.slice(0, -1));
      }
      return;
    }
    if (value === '=') {
      try {
        const sanitized = (amount || '0').replace(/[^0-9+\-*/().]/g, '');
        if (sanitized && sanitized !== '0') {
          // eslint-disable-next-line no-new-func
          let result = Function(`"use strict"; return (${sanitized})`)();
          if (typeof result === 'number' && isFinite(result)) {
            // round to 2 decimals for currency-like values
            const fixed = Math.round((result + Number.EPSILON) * 100) / 100;
            setAmountForActive(fixed.toString());
          } else {
            setAmountForActive('0');
          }
        }
      } catch (e) {
        setAmountForActive('Error');
        setTimeout(() => setAmountForActive('0'), 900);
      }
      return;
    }

    // default: append input
    if (amount === '0' || amount === 'Error') {
      if (value !== '.') {
        setAmountForActive(String(value));
      } else {
        setAmountForActive('0.');
      }
    } else {
      setAmountForActive(amount + String(value));
    }
  };

  const handleQuickAmount = (quickAmount) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmountForActive((currentAmount + quickAmount).toString());
  };

  const handleProductSelect = (product) => {
    incQty(product);
  };

  const createContact = async (name, type) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API}/contacts`, {
        name: name,
        type: type
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.log('Contact creation error (non-critical):', error);
      // Don't throw error as this is a background operation
    }
  };

  const handleCategorySelect = (category) => {
    // Check if "Customers / Debtors (देनदार)" is selected
    if (category === 'Customers / Debtors (देनदार)') {
      setShowBusinessModal(false);
      setShowFinanceModal(false);
      setShowCustomerDebtorModal(true);
      return;
    }
    
    // Check if "Suppliers / Creditors (लेनदार)" is selected
    if (category === 'Suppliers / Creditors (लेनदार)') {
      setShowBusinessModal(false);
      setShowFinanceModal(false);
      setShowSupplierCreditorModal(true);
      return;
    }
    
    setSelectedCategory(category);
    setNewEntryTitle(
      financeCategories.some(cat => cat.name === category) 
        ? 'Add New Expense' 
        : `Add New ${category.split(' / ')[0]}`
    );
    setShowBusinessModal(false);
    setShowFinanceModal(false);
    setShowCategoryList(true);

    // Auto-create contact based on category type
    let contactType = 'customer'; // default
    if (category.includes('Supplier') || category.includes('Creditor')) {
      contactType = 'supplier';
    } else if (category.includes('Staff')) {
      contactType = 'staff';
    }
    
    // Create contact in background
    createContact(category, contactType);
  };

  const handleNameSelect = (name) => {
    setSelectedCustomer(name);
    setShowCategoryList(false);
    
    // Create contact as customer type for individual names
    createContact(name, 'customer');
  };

  const resetAmount = () => {
    setAmount('0');
  };

  const resetQuantities = () => {
    setSelectedItems({});
  };

  // Credit terms options
  const creditTerms = [
    '0-5 days',
    '5-10 days', 
    '10-15 days',
    '15-30 days',
    '1 month',
    '2 months',
    'More days'
  ];

  const handleCreditTermSelect = (term) => {
    setSelectedCreditTerm(term);
    setShowCreditTermsDropdown(false);
    setPaymentMode('Credit');
  };

  const handleChequeSave = () => {
    if (chequeBankName.trim() && chequeIfscCode.trim() && chequeNumber.trim()) {
      setPaymentMode('Cheque');
      setShowChequeModal(false);
      setShowCreditTermsDropdown(false);
    } else {
      alert('Please fill all cheque details');
    }
  };

  const handleChequeCancel = () => {
    setShowChequeModal(false);
    // Clear the form fields
    setChequeBankName('');
    setChequeIfscCode('');
    setChequeNumber('');
  };

  const handlePaymentModeClick = (mode) => {
    if (mode === 'Credit') {
      setShowCreditTermsDropdown(true);
    } else if (mode === 'Cheque') {
      setShowChequeModal(true);
    } else {
      setPaymentMode(mode);
      setShowCreditTermsDropdown(false);
    }
  };

  const confirmDeleteExpense = (expenseToDelete) => {
    setDeleteAction({
      type: 'individual',
      item: expenseToDelete,
      message: `Are you sure you want to delete "${expenseToDelete}"?`
    });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAllExpenses = () => {
    setDeleteAction({
      type: 'all',
      message: 'Are you sure you want to delete all expenses?'
    });
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteAction?.type === 'individual') {
      // Delete individual expense
      const expenseToDelete = deleteAction.item;
      setExpenses(prev => prev.filter(expense => expense !== expenseToDelete));
      setSelectedItems(prev => {
        const updated = { ...prev };
        delete updated[expenseToDelete];
        return updated;
      });
    } else if (deleteAction?.type === 'all') {
      // Delete all expenses
      setExpenses([]);
      setSelectedItems({});
    }
    setShowDeleteConfirm(false);
    setDeleteAction(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteAction(null);
  };

  const deleteExpense = (expenseToDelete) => {
    setExpenses(prev => prev.filter(expense => expense !== expenseToDelete));
    // Also remove from selected items if it was selected
    setSelectedItems(prev => {
      const updated = { ...prev };
      delete updated[expenseToDelete];
      return updated;
    });
  };

  // Enhanced Modal Functions
  const saveNewExpense = () => {
    if (!newExpenseName.trim() || !newExpenseAmount.trim()) {
      return; // Don't save if required fields are empty
    }

    // Add expense to the expenses list with barcode
    const expenseName = newExpenseName.trim();
    const expenseData = {
      name: expenseName,
      amount: newExpenseAmount,
      category: newExpenseCategory,
      description: newExpenseDescription,
      reference: newExpenseReference,
      barcode: newExpenseBarcode.trim(),
      measurement: expenseMeasurement
    };
    
    // Update expenses list to store full expense objects
    setExpenses(prev => {
      const updatedExpenses = [...prev];
      const existingIndex = updatedExpenses.findIndex(exp => 
        (typeof exp === 'object' ? exp.name : exp) === expenseName
      );
      
      if (existingIndex !== -1) {
        updatedExpenses[existingIndex] = expenseData;
      } else {
        updatedExpenses.push(expenseData);
      }
      
      return updatedExpenses;
    });
    
    // Add to selected items with quantity
    if (expenseQty > 0) {
      setSelectedItems(prev => ({
        ...prev,
        [expenseName]: expenseQty
      }));
    }

    // Calculate and add to current amount
    const expenseAmount = parseFloat(newExpenseAmount) || 0;
    if (expenseAmount > 0 && expenseQty > 0) {
      const totalExpenseValue = expenseAmount * expenseQty;
      const currentAmount = parseFloat(amount) || 0;
      setAmountForActive((currentAmount + totalExpenseValue).toString());
    }

    // Reset form
    setNewExpenseName('');
    setNewExpenseAmount('');
    setNewExpenseCategory('General');
    setNewExpenseDescription('');
    setNewExpenseReference('');
    setNewExpenseBarcode('');
    setExpenseQty(1);
    
    // Close modal
    setShowAddProductModal(false);
  };

  // Handle barcode scan from camera for expenses
  const handleBarcodeScan = (barcode) => {
    console.log('Barcode scanned:', barcode);
    console.log('Current expenses:', expenses);

    // Find expense with matching barcode
    const foundExpense = expenses.find(expense => 
      typeof expense === 'object' && 
      expense.barcode && 
      expense.barcode.toLowerCase() === barcode.toLowerCase()
    );

    if (foundExpense) {
      // Expense found - add to cart
      console.log('Expense found:', foundExpense);
      incQty(foundExpense.name);
      setShowBarcodeModal(false);
      alert(`✅ Expense "${foundExpense.name}" added to cart!`);
    } else {
      // Expense not found - open add expense modal with barcode pre-filled
      console.log('Expense not found, opening Add Expense modal');
      setNewExpenseBarcode(barcode);
      setShowBarcodeModal(false);
      setShowAddProductModal(true);
    }
  };

  // Persist selected items to business-specific storage
  useEffect(() => {
    setData('cashout_selected_items', selectedItems);
  }, [selectedItems, setData]);

  // Load selected items from business-specific storage
  useEffect(() => {
    const savedItems = getData('cashout_selected_items', {});
    if (savedItems && Object.keys(savedItems).length > 0) {
      setSelectedItems(savedItems);
    }
  }, [activeBusiness.id, getData]);

  // Coin sound effect function
  const playActualCoinSound = () => {
    try {
      // Create audio element with actual coin sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYnBaKE2/LVfC4EKHjL8d4BBCPEhNTtx2wiBCaE0/HVcigEOHLX4MF9JwVfqMRrsowPBj+k3M84FZvdZeFdDq6ijN3xDuF/kI8dHEuq8Fs0Gc8rT8RtaURAcyeC4FpJPGeFpLFiKN9q5pKz7AGZaFbNxcupZayYhEOiuVFRb0C3iv+k4Nt1klN3hYzjSA8JUhH8ghU9pdfeWE8VTQdgvKusKCcYBY8mKtfbyHwcrRiPP0o2IDtF+UYdZhicC4WKqPrG8Ai5q+bo3hY=');
      audio.volume = 0.3;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Fallback to Web Audio API if file fails to load
        createCoinSound();
      });
    } catch (error) {
      // Fallback to programmatic sound
      createCoinSound();
    }
  };

  // Fallback coin sound using Web Audio API (more realistic)
  const createCoinSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create multiple oscillators for richer coin sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure realistic coin sound frequencies
      oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator1.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.02);
      oscillator1.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
      
      oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.01);
      oscillator2.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.12);
      
      // Configure volume envelope for coin drop effect
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      
      // Play the sound
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.25);
      oscillator2.stop(audioContext.currentTime + 0.25);
      
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // Handle coin click with sound
  const handleCoinClick = (amount) => {
    playActualCoinSound();
    handleQuickAmount(amount);
  };

  // Handle currency note click with sound
  const handleNoteClick = (amount) => {
    playActualCoinSound();
    handleQuickAmount(amount);
  };

  // Handle transaction save and reset current slot
  const handleSave = async () => {
    const currentSlot = slots[activeSlot];
    
    // Validate that there's data to save
    if (!currentSlot.amount || parseFloat(currentSlot.amount) === 0) {
      alert('Please enter an amount before saving');
      return;
    }

    try {
      // Prepare items description
      const itemsDesc = Object.keys(currentSlot.selectedItems || {}).length > 0 
        ? Object.keys(currentSlot.selectedItems).join(', ')
        : 'No items';
      
      // Prepare transaction data matching backend model
      const transactionData = {
        description: `Cash Out - ${selectedCustomer || currentSlot.label} - ${itemsDesc} - ${currentSlot.paymentMode || paymentMode}`,
        amount: parseFloat(currentSlot.amount),
        debit_account: activeBusiness?.name || 'Cash',
        credit_account: selectedCustomer || currentSlot.label || 'Vendor'
      };

      console.log('Saving transaction:', transactionData);

      // Save to backend
      const response = await axios.post(`${API}/transactions/cash-out`, transactionData);
      
      console.log('Transaction saved successfully:', response.data);
      
      // Reset current active slot after successful save
      setSlots(prev => prev.map((slot, idx) => 
        idx === activeSlot ? { 
          ...slot, 
          amount: '0',
          selectedItems: {},
          invoiceNumber: null,
          invoiceDate: null,
          invoiceTime: null,
          paymentMode: 'Cash'
        } : slot
      ));
      setAmount('0');
      setSelectedCustomer('');
      
      alert('✅ Transaction saved successfully to database!');
    } catch (error) {
      console.error('Error saving transaction:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
      alert(`❌ Failed to save transaction: ${errorMsg}`);
    }
  };

  // Compress and preprocess image for better OCR accuracy
  const preprocessImageForOCR = async (imageDataUrl, maxWidth = 1920) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Draw original image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get image data for preprocessing
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Convert to grayscale and enhance contrast
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Apply threshold for better text recognition (make text darker, background whiter)
          const threshold = 128;
          const value = gray > threshold ? 255 : Math.max(0, gray - 30);
          
          data[i] = value;     // Red
          data[i + 1] = value; // Green
          data[i + 2] = value; // Blue
        }
        
        // Put processed image back
        ctx.putImageData(imageData, 0, 0);
        
        // Sharpen the image
        ctx.filter = 'contrast(1.5) brightness(1.1)';
        ctx.drawImage(canvas, 0, 0);
        
        // Convert to base64
        const processedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(processedDataUrl);
      };
      img.src = imageDataUrl;
    });
  };
  
  // Compress image (for non-OCR use)
  const compressImage = async (imageDataUrl, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = imageDataUrl;
    });
  };

  // Parse invoice text to extract structured data with improved patterns
  const parseInvoiceText = (text) => {
    console.log('Parsing invoice text...');
    console.log('Full text:', text);
    
    // Clean up text - remove extra spaces and fix common OCR errors
    text = text.replace(/\s+/g, ' ').replace(/[|]/g, 'I').replace(/[0O]/g, (match, offset) => {
      // Smart replacement based on context
      const before = text.charAt(offset - 1);
      const after = text.charAt(offset + 1);
      if (/[A-Z]/i.test(before) || /[A-Z]/i.test(after)) {
        return 'O';
      }
      return '0';
    });
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Extract vendor name (first substantial line that's not a number/date)
    let vendor_name = null;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      // Look for company-like patterns (capitalized words, multiple words)
      if (line.length > 5 && line.length < 60 && 
          !/^\d+$/.test(line) && 
          !/^\d{2}[-\/]\d{2}[-\/]\d/.test(line) &&
          !/(invoice|bill|receipt|date|total|amount|qty|price)/i.test(line)) {
        vendor_name = line;
        break;
      }
    }
    
    // Extract GST number with multiple patterns
    const gstPatterns = [
      /\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z|z][A-Z\d])\b/i,
      /GST[:\s]*(\d{2}[A-Z0-9]{13})/i,
      /GSTIN[:\s]*(\d{2}[A-Z0-9]{13})/i
    ];
    let gst_number = null;
    for (const pattern of gstPatterns) {
      const match = text.match(pattern);
      if (match) {
        gst_number = match[1].toUpperCase();
        break;
      }
    }
    
    // Extract invoice number with multiple patterns
    const invoicePatterns = [
      /(?:invoice|inv|bill)[\s#:№]*([A-Z0-9]+-?\d+)/i,
      /(?:no|number|ref)[\s#:№]*([A-Z0-9]+-?\d+)/i,
      /\b(INV-?\d+)\b/i,
      /\b([A-Z]{2,4}\d{4,})\b/
    ];
    let invoice_number = null;
    for (const pattern of invoicePatterns) {
      const match = text.match(pattern);
      if (match) {
        invoice_number = match[1];
        break;
      }
    }
    
    // Extract date with multiple formats
    const datePatterns = [
      /(?:date|dated)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
      /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})\b/,
      /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/
    ];
    let invoice_date = null;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        invoice_date = match[1];
        break;
      }
    }
    
    // Extract total amount with comprehensive patterns
    let total_amount = null;
    const amountPatterns = [
      /(?:total|grand\s*total|net\s*amount|amount\s*payable)[:\s]*(?:rs\.?|₹|inr)?[\s]*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /(?:balance|due)[:\s]*(?:rs\.?|₹)?[\s]*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /₹[\s]*(\d{1,}(?:,\d+)*(?:\.\d{2})?)\s*$/im,
      /(?:^|\s)(?:rs\.?|₹)[\s]*(\d{1,}(?:,\d+)*(?:\.\d{2})?)/i
    ];
    
    // Find the largest amount (likely to be total)
    const amounts = [];
    for (const pattern of amountPatterns) {
      const matches = text.matchAll(new RegExp(pattern.source, pattern.flags + 'g'));
      for (const match of matches) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (amount > 0 && amount < 1000000) { // Reasonable range
          amounts.push(amount);
        }
      }
    }
    if (amounts.length > 0) {
      total_amount = Math.max(...amounts);
    }
    
    // Extract products with better patterns
    const products = [];
    const productPatterns = [
      /^(.{3,50}?)\s+(\d{1,4})\s+(?:₹|rs\.?)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s+(?:₹|rs\.?)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gim,
      /(.{3,50}?)\s+(?:qty[:\s]*)?(\d{1,4})\s+(?:@|x)?\s*(?:₹|rs\.?)?\s*(\d+(?:,\d+)*)/gi
    ];
    
    for (const pattern of productPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const name = match[1].trim();
        const qty = parseInt(match[2]);
        const price = parseFloat((match[3] || '0').replace(/,/g, ''));
        const total = match[4] ? parseFloat(match[4].replace(/,/g, '')) : qty * price;
        
        if (name.length > 2 && name.length < 100 && qty > 0 && price > 0) {
          products.push({
            name: name,
            quantity: qty,
            unit_price: price,
            total_price: total
          });
        }
      }
    }
    
    return {
      vendor_name,
      gst_number,
      invoice_number,
      invoice_date,
      total_amount,
      products,
      confidence: {
        vendor: vendor_name ? 'medium' : 'low',
        total: total_amount ? 'high' : 'low',
        products: products.length > 0 ? 'medium' : 'low'
      }
    };
  };

  // Invoice scanning functions using Tesseract.js (client-side OCR)
  const handleImageCapture = async (imageDataUrl) => {
    setIsScanning(true);
    setScanError(null);
    
    try {
      console.log('Starting OCR with Tesseract.js (client-side)...');
      
      // Import Tesseract dynamically
      const Tesseract = (await import('tesseract.js')).default;
      
      // Compress image to reduce processing time
      console.log('Compressing image...');
      const compressedImage = await compressImage(imageDataUrl);
      
      console.log('Running OCR on image...');
      
      // Run Tesseract OCR
      const { data: { text } } = await Tesseract.recognize(
        compressedImage,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      
      console.log('OCR Complete! Extracted text length:', text.length);
      console.log('Extracted text:', text.substring(0, 500)); // Log first 500 chars
      
      if (!text || text.trim().length < 10) {
        throw new Error('Could not extract text from image. Please use a clearer photo.');
      }
      
      // Parse the extracted text
      const extractedData = parseInvoiceText(text);
      console.log('Parsed data:', extractedData);
      
      // Create invoice data object
      const invoiceData = {
        vendor_name: extractedData.vendor_name,
        gst_number: extractedData.gst_number,
        invoice_number: extractedData.invoice_number,
        invoice_date: extractedData.invoice_date,
        total_amount: extractedData.total_amount,
        products: extractedData.products,
        raw_text: text,
        success: true
      };
      
      setInvoiceData(invoiceData);
      setShowInvoiceScanModal(false);
      setShowInvoicePreview(true);
      
    } catch (error) {
      console.error('Invoice scan error:', error);
      
      let errorMsg = 'Failed to scan invoice';
      
      if (error.message.includes('Could not extract text')) {
        errorMsg = error.message;
      } else if (error.message.includes('Failed to fetch')) {
        errorMsg = 'Failed to load OCR library. Please check your internet connection.';
      } else {
        errorMsg = 'OCR processing failed. Please try with a clearer image.';
      }
      
      setScanError(errorMsg);
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleCameraCapture = () => {
    // Create a temporary file input for camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera on mobile
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        setScanError('No image selected');
        return;
      }
      
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          await handleImageCapture(event.target.result);
        };
        reader.onerror = () => {
          setScanError('Failed to read image file');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Camera capture error:', error);
        setScanError('Camera access failed: ' + error.message);
      }
    };
    
    input.onerror = () => {
      setScanError('Camera access denied or not available');
    };
    
    // Trigger the file input
    input.click();
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      await handleImageCapture(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  const applyInvoiceData = () => {
    if (!invoiceData) return;
    
    // Set vendor/party name
    if (invoiceData.vendor_name) {
      setSelectedCustomer(invoiceData.vendor_name);
    }
    
    // Set total amount
    if (invoiceData.total_amount) {
      const amountStr = String(invoiceData.total_amount);
      setAmount(amountStr);
      setSlots(prev => prev.map((slot, idx) => 
        idx === activeSlot ? { ...slot, amount: amountStr } : slot
      ));
    }
    
    // Set products as selected items
    if (invoiceData.products && invoiceData.products.length > 0) {
      const items = {};
      invoiceData.products.forEach(product => {
        items[product.name] = {
          quantity: product.quantity || 1,
          price: product.unit_price || 0,
          total: product.total_price || 0
        };
      });
      
      setSlots(prev => prev.map((slot, idx) => 
        idx === activeSlot ? { ...slot, selectedItems: items } : slot
      ));
    }
    
    // Show success message
    alert('✅ Invoice data applied successfully!');
    setShowInvoicePreview(false);
    setInvoiceData(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col max-h-screen overflow-hidden">
      {/* Header - Red theme for Cash Out */}
      <div className="bg-red-500/20 backdrop-blur-sm border-b border-red-500/30 px-4 py-2 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { 
            console.log('Cash Out back arrow clicked - navigating to Home page');
            resetAmount(); 
            navigate('/'); 
          }}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <h1 className="text-white font-semibold text-base">Add Cash Out Entry</h1>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowSettings(true)}
          className="text-white hover:bg-white/10"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Primary Input Section */}
      <div className="px-2 pt-2 pb-[9px] space-y-1">
        {/* Date & Time (labels removed as requested) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              aria-label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white h-6 text-xs"
            />
          </div>
          <div>
            <Input
              aria-label="Time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white h-6 text-xs"
            />
          </div>
        </div>

        {/* Customer & Product Dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white justify-start h-auto py-1"
            onClick={() => setShowBusinessModal(true)}
          >
            <div className="text-left">
              <div className="text-xs text-slate-400">Party</div>
              <div className="text-xs">{selectedCustomer || 'Select...'}</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white justify-start h-auto py-1"
            onClick={() => setShowProductModal(true)}
          >
            <div className="text-left">
              <div className="text-xs text-slate-400">Product / Expense</div>
              <div className="text-xs truncate">
                {Object.keys(selectedItems).length > 0 
                  ? Object.entries(selectedItems).map(([name, qty]) => `${name} x${qty}`).join(', ')
                  : 'Select...'}
              </div>
            </div>
          </Button>
        </div>

        {/* Removed Business & Finance tabs as requested */}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-2 pt-0 pb-2 space-y-1 overflow-hidden">
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-0.5">
          {/* All amount buttons with green currency styling */}
          {[1, 2, 5, 10, 20, 50, 100, 200, 500].map((amount) => (
            <Button
              key={amount}
              onClick={() => amount <= 20 ? handleCoinClick(amount) : handleNoteClick(amount)}
              variant="outline"
              size="sm"
              className="bg-green-600 border-green-700 text-white hover:bg-green-500 h-6 text-xs font-medium px-1"
            >
              ₹{amount}
            </Button>
          ))}
        </div>
        {/* POS multi-customer boxes */}
        <div className="grid grid-cols-6 gap-1">
          {slots.map((slot, idx) => (
            <button
              key={slot.id}
              onClick={() => {
                setActiveSlot(idx);
                setAmount(slot.amount);
              }}
              className={`aspect-square rounded-md flex items-center justify-center border transition ${
                activeSlot === idx ? 'bg-blue-700 border-blue-500' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="relative flex flex-col items-center">
                <User className="w-5 h-5 text-slate-200" />
                <span className="text-[10px] text-slate-100 mt-0.5">
                  {slot.customName || slot.label}
                </span>
                {/* Amount Badge - Top Right */}
                {parseFloat(slot.amount) > 0 && (
                  <span className={`absolute -top-1 -right-1 text-[10px] px-1 py-[1px] rounded font-bold ${
                    activeSlot === idx 
                      ? 'bg-yellow-500 text-black text-xs' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    ₹{slot.amount}
                  </span>
                )}
                {/* Enhanced Total Amount Display for Active Slot - Always Visible */}
                {activeSlot === idx && (
                  <div className="absolute -bottom-4 text-[11px] bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-lg font-bold whitespace-nowrap border border-red-400 shadow-lg">
                    Total: ₹{slot.amount || '0'}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>


        {/* Amount Display */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-2 text-center">
            <div className="text-lg font-bold text-white">
              ₹{amount}
            </div>
          </CardContent>
        </Card>

        {/* Payment Mode Tabs - enlarged buttons, full width across screen */}
        <div className="grid grid-cols-4 gap-2">
          {['Credit', 'Cash', 'Online', 'Cheque'].map((mode) => (
            <Button
              key={mode}
              onClick={() => handlePaymentModeClick(mode)}
              className={`w-full h-10 text-xs sm:text-sm rounded-md ${
                paymentMode === mode
                  ? mode === 'Credit' ? 'bg-orange-900 hover:bg-orange-950 ring-1 ring-orange-700' 
                    : mode === 'Cash' ? 'bg-green-600 hover:bg-green-700'
                    : mode === 'Online' ? 'bg-orange-600 hover:bg-orange-700'
                    : mode === 'Cheque' ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {mode}
              {mode === 'Credit' && selectedCreditTerm && (
                <span className="ml-1 text-[10px] opacity-80">({selectedCreditTerm})</span>
              )}
            </Button>
          ))}
        </div>

        {/* Credit Terms Dropdown */}
        {showCreditTermsDropdown && (
          <div className="relative">
            <div className="absolute top-2 left-0 right-0 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              <div className="p-2">
                <div className="text-sm text-slate-200 mb-2 font-medium">Select Credit Terms:</div>
                {creditTerms.map((term) => (
                  <Button
                    key={term}
                    onClick={() => handleCreditTermSelect(term)}
                    className={`w-full mb-1 text-left justify-start h-8 text-sm ${
                      selectedCreditTerm === term
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - match Cash In sizes */}
        <div className="flex gap-1">
          <Button 
            onClick={() => setShowBarcodeModal(true)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 h-10 text-sm rounded-md text-white"
          >
            <Barcode className="w-4 h-4 mr-2" />
            Barcode
          </Button>
          <Button 
            onClick={() => setShowInvoiceScanModal(true)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 h-10 text-sm rounded-md text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Invoice
          </Button>
          <Button 
            onClick={handleVoiceInput}
            className={`w-10 h-10 rounded-md text-white flex items-center justify-center ${
              isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title={`Voice input (Auto-detected: ${selectedLanguage})`}
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button 
            onClick={handleSave}
            className="flex-1 bg-red-500 hover:bg-red-600 h-10 text-sm rounded-md"
          >
            Save
          </Button>
        </div>

        {/* Calculator - match Cash In sizes */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-2">
            <div className="grid grid-cols-4 gap-1">
              {/* Row 1 */}
              <Button onClick={() => handleCalculatorInput('7')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">7</Button>
              <Button onClick={() => handleCalculatorInput('8')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">8</Button>
              <Button onClick={() => handleCalculatorInput('9')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">9</Button>
              <Button onClick={() => handleCalculatorInput('/')} className="bg-sky-500 hover:bg-sky-600 text-white h-10 text-base font-semibold">÷</Button>
              
              {/* Row 2 */}
              <Button onClick={() => handleCalculatorInput('4')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">4</Button>
              <Button onClick={() => handleCalculatorInput('5')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">5</Button>
              <Button onClick={() => handleCalculatorInput('6')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">6</Button>
              <Button onClick={() => handleCalculatorInput('*')} className="bg-sky-500 hover:bg-sky-600 text-white h-10 text-base font-semibold">×</Button>
              
              {/* Row 3 */}
              <Button onClick={() => handleCalculatorInput('1')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">1</Button>
              <Button onClick={() => handleCalculatorInput('2')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">2</Button>
              <Button onClick={() => handleCalculatorInput('3')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">3</Button>
              <Button onClick={() => handleCalculatorInput('-')} className="bg-sky-500 hover:bg-sky-600 text-white h-10 text-base font-semibold">−</Button>
              
              {/* Row 4 */}
              <Button onClick={() => handleCalculatorInput('0')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">0</Button>
              <Button onClick={() => handleCalculatorInput('.')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">.</Button>
              <Button onClick={() => handleCalculatorInput('clear')} className="bg-red-600 hover:bg-red-700 text-white h-10 text-xs font-semibold">C</Button>
              <Button onClick={() => handleCalculatorInput('+')} className="bg-sky-500 hover:bg-sky-600 text-white h-10 text-base font-semibold">+</Button>
              
              {/* Row 5 */}
              <Button onClick={() => handleCalculatorInput('=')} className="bg-green-600 hover:bg-green-700 text-white h-10 text-base font-semibold col-span-3">=</Button>
              <Button onClick={() => handleCalculatorInput('back')} className="bg-slate-600 hover:bg-slate-500 text-white h-12">
                <Delete className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals - Same as Cash In Entry */}
      
      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-200">Theme</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => setDarkTheme(true)}
                  className={darkTheme ? 'bg-blue-600' : 'bg-slate-600'}
                >
                  Dark
                </Button>
                <Button
                  onClick={() => setDarkTheme(false)}
                  className={!darkTheme ? 'bg-blue-600' : 'bg-slate-600'}
                >
                  Light
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-slate-200">Notifications</Label>
              <Button
                onClick={() => setNotifications(!notifications)}
                className={notifications ? 'bg-green-600' : 'bg-slate-600'}
              >
                {notifications ? 'On' : 'Off'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-slate-200">Sound Effects</Label>
              <Button
                onClick={() => setSoundEffects(!soundEffects)}
                className={soundEffects ? 'bg-green-600' : 'bg-slate-600'}
              >
                {soundEffects ? 'On' : 'Off'}
              </Button>
            </div>
            
            <div>
              <Label className="text-slate-200">Default Payment Mode</Label>
              <Select value={defaultPaymentMode} onValueChange={setDefaultPaymentMode}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Party Selection Modal (Combined Business + Finance) */}
      <Dialog open={showBusinessModal || showFinanceModal} onOpenChange={(open) => {
        setShowBusinessModal(open);
        setShowFinanceModal(open);
      }}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Party</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Business Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Business
              </h3>
              <div className="space-y-1">
                {businessCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.name}
                      onClick={() => handleCategorySelect(category.name)}
                      className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white text-sm py-2"
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Finance Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                <Coins className="w-4 h-4 mr-2" />
                Finance
              </h3>
              <div className="space-y-1">
                {financeSubcategories.map((subcategory) => {
                  const IconComponent = subcategory.icon;
                  return (
                    <Button
                      key={subcategory.name}
                      onClick={() => handleCategorySelect(subcategory.name)}
                      className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white text-sm py-2"
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {subcategory.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer / Debtor Sub-Selection Modal */}
      <Dialog open={showCustomerDebtorModal} onOpenChange={setShowCustomerDebtorModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Select Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              onClick={() => {
                handleCategorySelect('Customers');
                setShowCustomerDebtorModal(false);
              }}
              className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white text-sm py-3"
            >
              <Users className="w-4 h-4 mr-2" />
              Customers
            </Button>
            <Button
              onClick={() => {
                handleCategorySelect('Debtors (देनदार)');
                setShowCustomerDebtorModal(false);
              }}
              className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white text-sm py-3"
            >
              <Users className="w-4 h-4 mr-2" />
              Debtors (देनदार)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supplier / Creditor Sub-Selection Modal */}
      <Dialog open={showSupplierCreditorModal} onOpenChange={setShowSupplierCreditorModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Select Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              onClick={() => {
                handleCategorySelect('Suppliers');
                setShowSupplierCreditorModal(false);
              }}
              className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white text-sm py-3"
            >
              <Building className="w-4 h-4 mr-2" />
              Suppliers
            </Button>
            <Button
              onClick={() => {
                handleCategorySelect('Creditors (लेनदार)');
                setShowSupplierCreditorModal(false);
              }}
              className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white text-sm py-3"
            >
              <Building className="w-4 h-4 mr-2" />
              Creditors (लेनदार)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category List Modal */}
      <Dialog open={showCategoryList} onOpenChange={setShowCategoryList}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md max-h-96">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedCategory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <Button
              onClick={() => {
                setShowCategoryList(false);
                setShowAddNewModal(true);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
            {sampleNames.map((name) => (
              <Button
                key={name}
                onClick={() => handleNameSelect(name)}
                className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white"
              >
                {name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-sm w-full mx-auto my-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Product / Expense Selection</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-2 mb-3">
              <Button
                onClick={() => {
                  setShowProductModal(false);
                  setShowAddProductModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white h-8 text-sm"
              >
                <Plus className="w-3 h-3 mr-2" />
                Add New Expense
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={resetQuantities}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex-1 h-8 text-sm"
                >
                  Reset Quantity
                </Button>
                <Button
                  onClick={confirmDeleteAllExpenses}
                  className="bg-sky-500 hover:bg-sky-600 text-white flex-1 h-8 text-sm"
                >
                  Delete Expense
                </Button>
              </div>
              
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  value={expenseSearchQuery}
                  onChange={(e) => setExpenseSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  className="bg-slate-700 border-slate-600 text-white pl-10 h-8 text-sm"
                />
              </div>
            </div>
            {expenses
              .filter(expense => {
                const expenseName = typeof expense === 'object' ? expense.name : expense;
                return expenseName.toLowerCase().includes(expenseSearchQuery.toLowerCase());
              })
              .map((expense) => {
                const expenseName = typeof expense === 'object' ? expense.name : expense;
                return (
              <div key={expenseName} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                <span className="text-white text-sm">{expenseName}</span>
                <div className="flex items-center gap-1">
                  <Button onClick={() => decQty(expenseName)} className="bg-slate-600 w-7 h-7" size="sm">−</Button>
                  <span className="text-white text-sm min-w-[20px] text-center">{selectedItems[expenseName] || 0}</span>
                  <Button onClick={() => incQty(expenseName)} className="bg-red-600 hover:bg-red-700 w-7 h-7" size="sm">+</Button>
                  <Button onClick={() => confirmDeleteExpense(expenseName)} className="bg-sky-500 hover:bg-sky-600 w-7 h-7" size="sm">✕</Button>
                </div>
              </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Entry Modal */}
      <Dialog open={showAddNewModal} onOpenChange={setShowAddNewModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{newEntryTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-200">Name</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input className="bg-slate-700 border-slate-600 text-white pl-10" placeholder="Enter name" />
              </div>
            </div>
            <div>
              <Label className="text-slate-200">Mobile Number</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Enter mobile number" />
            </div>
            <div>
              <Label className="text-slate-200">Aadhar Number (Optional)</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Enter Aadhar number" />
            </div>
            <div>
              <Label className="text-slate-200">GST Number (Optional)</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Enter GST number" />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-sm w-full mx-auto my-4">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-slate-200 text-sm">Expense Name *</Label>
              <Input 
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                placeholder="Enter expense name" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-200 text-sm">Amount *</Label>
                <Input 
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                  placeholder="₹0" 
                  type="number"
                />
              </div>
              <div>
                <Label className="text-slate-200 text-sm">Category</Label>
                <Select value={newExpenseCategory} onValueChange={setNewExpenseCategory}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-200 text-sm">Measurement</Label>
                <Select value={expenseMeasurement} onValueChange={setExpenseMeasurement}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Kg">Kg</SelectItem>
                    <SelectItem value="Grams">Grams</SelectItem>
                    <SelectItem value="Ltr">Ltr</SelectItem>
                    <SelectItem value="Meter">Meter</SelectItem>
                    <SelectItem value="Feet">Feet</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-200 text-sm">Quantity</Label>
                <div className="flex items-center gap-1">
                  <Button 
                    onClick={() => setExpenseQty(q => Math.max(1, q - 1))} 
                    className="bg-slate-600 w-7 h-7" 
                    size="sm"
                  >
                    −
                  </Button>
                  <span className="text-white text-sm min-w-[24px] text-center">{expenseQty}</span>
                  <Button 
                    onClick={() => setExpenseQty(q => q + 1)} 
                    className="bg-red-600 w-7 h-7" 
                    size="sm"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-slate-200 text-sm">Description</Label>
              <Input 
                value={newExpenseDescription}
                onChange={(e) => setNewExpenseDescription(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                placeholder="Enter description" 
              />
            </div>
            <div>
              <Label className="text-slate-200 text-sm">Reference Number</Label>
              <Input 
                value={newExpenseReference}
                onChange={(e) => setNewExpenseReference(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                placeholder="Enter reference number" 
              />
            </div>
            <div>
              <Label className="text-slate-200 text-sm flex items-center gap-2">
                <Barcode className="w-3 h-3" />
                Barcode Number
              </Label>
              <Input 
                value={newExpenseBarcode}
                onChange={(e) => setNewExpenseBarcode(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                placeholder="Enter or scan barcode" 
              />
              {newExpenseBarcode && (
                <p className="text-xs text-green-400 mt-1">✓ Barcode: {newExpenseBarcode}</p>
              )}
            </div>
            {/* Total Value Display */}
            {newExpenseAmount && expenseQty > 0 && (
              <div className="bg-red-600/20 border border-red-500 rounded p-2">
                <div className="text-xs text-red-300">Total Expense</div>
                <div className="text-lg font-bold text-red-100">
                  ₹{(parseFloat(newExpenseAmount) * expenseQty || 0).toFixed(2)}
                </div>
              </div>
            )}
            <Button 
              onClick={saveNewExpense}
              className="w-full bg-red-600 hover:bg-red-700 h-8 text-sm"
              disabled={!newExpenseName.trim() || !newExpenseAmount.trim()}
            >
              Save Expense & Add to Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner with Camera */}
      <BarcodeScanner
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        onScan={handleBarcodeScan}
        title="Scan Expense Barcode"
      />

      {/* Cheque Details Modal */}
      <Dialog open={showChequeModal} onOpenChange={setShowChequeModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-sm w-full mx-auto my-4">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Cheque Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Bank Name
              </label>
              <Input
                value={chequeBankName}
                onChange={(e) => setChequeBankName(e.target.value)}
                placeholder="Enter bank name"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                IFSC Code
              </label>
              <Input
                value={chequeIfscCode}
                onChange={(e) => setChequeIfscCode(e.target.value.toUpperCase())}
                placeholder="Enter IFSC code"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Cheque No.
              </label>
              <Input
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                placeholder="Enter cheque number"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleChequeSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save
              </Button>
              <Button
                onClick={handleChequeCancel}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Scan Modal */}
      <Dialog open={showInvoiceScanModal} onOpenChange={setShowInvoiceScanModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md w-full mx-auto my-4">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              Scan Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {scanError && (
              <div className="bg-red-500/20 border border-red-500 rounded p-3">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-200 text-sm">{scanError}</p>
                    <Button
                      onClick={() => setScanError(null)}
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCameraCapture}
                disabled={isScanning}
                className="bg-blue-600 hover:bg-blue-700 h-12 flex flex-col items-center justify-center"
              >
                <Scan className="w-5 h-5 mb-1" />
                <span className="text-xs">Camera</span>
              </Button>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isScanning}
                />
                <div className="bg-green-600 hover:bg-green-700 h-12 flex flex-col items-center justify-center rounded-md text-white">
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-xs">Upload</span>
                </div>
              </label>
            </div>
            
            {isScanning && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-slate-300 text-sm">Processing invoice...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md w-full mx-auto my-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Invoice Data Preview
            </DialogTitle>
          </DialogHeader>
          
          {invoiceData && (
            <div className="space-y-4">
              {/* Vendor Information */}
              {invoiceData.vendor_name && (
                <div className="bg-slate-700 rounded p-3">
                  <h3 className="text-sm font-medium text-slate-200 mb-2">Vendor</h3>
                  <p className="text-white">{invoiceData.vendor_name}</p>
                  {invoiceData.vendor_address && (
                    <p className="text-slate-300 text-sm mt-1">{invoiceData.vendor_address}</p>
                  )}
                </div>
              )}
              
              {/* Invoice Details */}
              <div className="bg-slate-700 rounded p-3">
                <h3 className="text-sm font-medium text-slate-200 mb-2">Invoice Details</h3>
                {invoiceData.invoice_number && (
                  <p className="text-slate-300 text-sm">Invoice #: {invoiceData.invoice_number}</p>
                )}
                {invoiceData.invoice_date && (
                  <p className="text-slate-300 text-sm">Date: {invoiceData.invoice_date}</p>
                )}
                {invoiceData.total_amount && (
                  <p className="text-white font-semibold">Total: ₹{invoiceData.total_amount}</p>
                )}
              </div>
              
              {/* Products */}
              {invoiceData.products && invoiceData.products.length > 0 && (
                <div className="bg-slate-700 rounded p-3">
                  <h3 className="text-sm font-medium text-slate-200 mb-2">Products</h3>
                  <div className="space-y-2">
                    {invoiceData.products.map((product, index) => (
                      <div key={index} className="bg-slate-600 rounded p-2">
                        <p className="text-white text-sm font-medium">{product.name}</p>
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Qty: {product.quantity || 1}</span>
                          <span>Price: ₹{product.unit_price || 0}</span>
                          <span>Total: ₹{product.total_price || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={applyInvoiceData}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Apply Data
                </Button>
                <Button
                  onClick={() => {
                    setShowInvoicePreview(false);
                    setInvoiceData(null);
                  }}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md w-full mx-auto my-4">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-200">
              {deleteAction?.message}
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={executeDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Yes, Delete
              </Button>
              <Button 
                onClick={cancelDelete}
                className="flex-1 bg-slate-600 hover:bg-slate-500"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Scan Modal */}
      <Dialog open={showInvoiceScanModal} onOpenChange={setShowInvoiceScanModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              Scan Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {scanError && (
              <div className="bg-red-500/20 border border-red-500 rounded p-3">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-200 text-sm">{scanError}</p>
                    <Button
                      onClick={() => setScanError(null)}
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCameraCapture}
                disabled={isScanning}
                className={`h-16 flex flex-col items-center justify-center gap-1 ${
                  isScanning 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Scan className="w-6 h-6" />
                <span className="text-sm">{isScanning ? 'Processing...' : 'Camera'}</span>
              </Button>
              
              <label className={`cursor-pointer ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isScanning}
                />
                <div className="bg-green-600 hover:bg-green-700 h-16 flex flex-col items-center justify-center gap-1 rounded-md text-white">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Gallery</span>
                </div>
              </label>
            </div>
            
            <div className="text-center text-xs text-slate-400 mt-2">
              📸 Take a clear photo of the invoice or select from gallery
            </div>
            
            {isScanning && (
              <div className="text-center py-6 bg-slate-700/50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
                <p className="text-white font-medium mb-1">Scanning Invoice...</p>
                <p className="text-slate-400 text-xs px-4">
                  🔍 Reading text from image (works offline)
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span>Processing locally on your device...</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="bg-slate-800 border-slate-700 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Invoice Data Preview
            </DialogTitle>
          </DialogHeader>
          
          {invoiceData && (
            <div className="space-y-4">
              {/* Vendor Information */}
              {invoiceData.vendor_name && (
                <div className="bg-slate-700 rounded p-3">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Vendor/Party</h3>
                  <p className="text-white font-medium">{invoiceData.vendor_name}</p>
                  {invoiceData.gst_number && (
                    <p className="text-slate-300 text-sm mt-1">GST: {invoiceData.gst_number}</p>
                  )}
                </div>
              )}
              
              {/* Invoice Details */}
              <div className="bg-slate-700 rounded p-3">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Invoice Details</h3>
                <div className="space-y-1">
                  {invoiceData.invoice_number && (
                    <p className="text-slate-300 text-sm">Number: <span className="text-white">{invoiceData.invoice_number}</span></p>
                  )}
                  {invoiceData.invoice_date && (
                    <p className="text-slate-300 text-sm">Date: <span className="text-white">{invoiceData.invoice_date}</span></p>
                  )}
                  {invoiceData.total_amount && (
                    <p className="text-lg font-bold text-green-400 mt-2">Total: ₹{invoiceData.total_amount.toLocaleString()}</p>
                  )}
                </div>
              </div>
              
              {/* Products */}
              {invoiceData.products && invoiceData.products.length > 0 && (
                <div className="bg-slate-700 rounded p-3">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Products ({invoiceData.products.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {invoiceData.products.map((product, idx) => (
                      <div key={idx} className="bg-slate-800 rounded p-2 text-sm">
                        <p className="text-white font-medium">{product.name}</p>
                        <div className="flex justify-between text-slate-300 text-xs mt-1">
                          <span>Qty: {product.quantity}</span>
                          <span>@ ₹{product.unit_price}</span>
                          <span className="text-white font-semibold">₹{product.total_price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setShowInvoicePreview(false);
                    setInvoiceData(null);
                  }}
                  className="flex-1 bg-slate-600 hover:bg-slate-500"
                >
                  Cancel
                </Button>
                <Button
                  onClick={applyInvoiceData}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Apply to Form
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashOutEntry;