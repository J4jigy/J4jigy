import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useBusiness } from '../contexts/BusinessContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import BarcodeScanner from './BarcodeScanner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  Receipt,
  Share2,
  FileBarChart,
  Fuel,
  Printer,
  Edit2,
  Save,
  X,
  Landmark,
  Mic,
  Pencil
} from 'lucide-react';

const CashInEntry = ({ onBack }) => {
  const API = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  const [amount, setAmount] = useState('0');
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
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
  const initialSlots = Array.from({ length: 6 }, (_, i) => ({ 
    id: i, 
    label: `C${i + 1}`, 
    amount: '0',
    paymentMode: 'Cash',
    selectedItems: {},
    invoiceNumber: null,
    invoiceDate: null,
    invoiceTime: null,
    creditPeriod: ''
  }));
  const [slots, setSlots] = useState(initialSlots);
  const [activeSlot, setActiveSlot] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(new Date().toTimeString().slice(0, 5));
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  
  // Challan preview state
  const [showChallanPreview, setShowChallanPreview] = useState(false);
  const [challanVehicleNumber, setChallanVehicleNumber] = useState('');
  
  // Swipe detection state for slots
  const [slotsTouchStart, setSlotsTouchStart] = useState(null);
  const [slotsTouchEnd, setSlotsTouchEnd] = useState(null);
  const [slotsTouchStartY, setSlotsTouchStartY] = useState(null);
  const [slotsTouchEndY, setSlotsTouchEndY] = useState(null);
  
  // Gate Pass state
  const [showGatePass, setShowGatePass] = useState(false);
  const [gatePassVehicleNumber, setGatePassVehicleNumber] = useState('');
  const [gatePassDriverName, setGatePassDriverName] = useState('');
  const [selectedSlotForGatePass, setSelectedSlotForGatePass] = useState(null);

  // Double-click detection state
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedSlot, setLastClickedSlot] = useState(null);
  const doubleClickDelay = 300; // 300ms window for double-click

  // Contact list state
  const [contactList, setContactList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showContactListModal, setShowContactListModal] = useState(false);

  // Sub-section fields are now part of each slot

  const incQty = (name) => {
    // Update selectedItems for current view
    setSelectedItems(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    
    // Update the active slot's selectedItems
    setSlots(prev => prev.map((slot, idx) => 
      idx === activeSlot 
        ? { ...slot, selectedItems: { ...slot.selectedItems, [name]: (slot.selectedItems[name] || 0) + 1 } }
        : slot
    ));
  };
  
  const decQty = (name) => {
    // Update selectedItems for current view
    setSelectedItems(prev => {
      const curr = prev[name] || 0;
      if (curr <= 1) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: curr - 1 };
    });
    
    // Update the active slot's selectedItems
    setSlots(prev => prev.map((slot, idx) => {
      if (idx === activeSlot) {
        const curr = slot.selectedItems[name] || 0;
        if (curr <= 1) {
          const copy = { ...slot.selectedItems };
          delete copy[name];
          return { ...slot, selectedItems: copy };
        }
        return { ...slot, selectedItems: { ...slot.selectedItems, [name]: curr - 1 } };
      }
      return slot;
    }));
  };
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
  
  // Add New Product Modal States
  const [newProductName, setNewProductName] = useState('');
  const [newProductSellingPrice, setNewProductSellingPrice] = useState('');
  const [newProductCostPrice, setNewProductCostPrice] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState(1);
  const [newProductMeasurement, setNewProductMeasurement] = useState('Piece');
  const [newProductHsn, setNewProductHsn] = useState('');
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  
  // Barcode scanning
  const [scannedBarcode, setScannedBarcode] = useState('');
  
  // Search states
  const [productSearchQuery, setProductSearchQuery] = useState('');
  
  // Bill/Invoice modal states
  const [showBillModal, setShowBillModal] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showContactsList, setShowContactsList] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedSlotForBill, setSelectedSlotForBill] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  // Tax states
  const [taxType, setTaxType] = useState('CGST+SGST'); // CGST+SGST or IGST
  const [taxSlab, setTaxSlab] = useState('0'); // 0, 5, 18, 28
  
  // Custom taxes array - editable and dynamic
  const [customTaxes, setCustomTaxes] = useState([
    { id: 1, name: 'Cess', rate: '0', isEditing: false }
  ]);
  const [nextTaxId, setNextTaxId] = useState(2);
  
  // Custom Tax Management Functions
  const handleAddNewTax = () => {
    const newTax = {
      id: nextTaxId,
      name: `Tax ${nextTaxId - 2}`,
      rate: '0',
      isEditing: false
    };
    setCustomTaxes([...customTaxes, newTax]);
    setNextTaxId(nextTaxId + 1);
  };

  const handleTaxNameEdit = (id) => {
    setCustomTaxes(customTaxes.map(tax => 
      tax.id === id ? { ...tax, isEditing: true } : tax
    ));
  };

  const handleTaxNameChange = (id, newName) => {
    setCustomTaxes(customTaxes.map(tax => 
      tax.id === id ? { ...tax, name: newName } : tax
    ));
  };

  const handleTaxNameSave = (id) => {
    setCustomTaxes(customTaxes.map(tax => 
      tax.id === id ? { ...tax, isEditing: false } : tax
    ));
  };

  const handleTaxRateChange = (id, rate) => {
    setCustomTaxes(customTaxes.map(tax => 
      tax.id === id ? { ...tax, rate: rate } : tax
    ));
  };

  const handleRemoveTax = (id) => {
    setCustomTaxes(customTaxes.filter(tax => tax.id !== id));
  };

  // Terms & Conditions states
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [termsText, setTermsText] = useState(
    getData('terms_conditions', 
      '• Goods once sold will not be taken back\n• Subject to jurisdiction\n• Payment due within 30 days'
    )
  );
  const [tempTermsText, setTempTermsText] = useState('');
  
  // Save Terms & Conditions
  const saveTerms = () => {
    setTermsText(tempTermsText);
    setData('terms_conditions', tempTermsText);
    setIsEditingTerms(false);
  };
  
  // Cancel Terms editing
  const cancelTermsEdit = () => {
    setTempTermsText(termsText);
    setIsEditingTerms(false);
  };
  
  // Handle barcode scan from camera
  const handleBarcodeScan = (barcode) => {
    console.log('Barcode scanned:', barcode);
    
    // Get all products from localStorage
    const allProducts = getData('all_products', []);
    
    // Find product with matching barcode
    const foundProduct = allProducts.find(product => 
      product.barcode && product.barcode.toLowerCase() === barcode.toLowerCase()
    );
    
    if (foundProduct) {
      // Product found - add to cart
      incQty(foundProduct.name);
      setShowBarcodeModal(false);
      alert(`✅ Product "${foundProduct.name}" added to cart!`);
    } else {
      // Product not found - open add product modal with barcode pre-filled
      console.log('Product not found, opening Add Product modal');
      setNewProductBarcode(barcode);
      setShowBarcodeModal(false);
      setShowAddProductModal(true);
    }
  };
  
  // Cheque modal states
  const [showChequeModal, setShowChequeModal] = useState(false);
  const [chequeBankName, setChequeBankName] = useState('');
  const [chequeIfscCode, setChequeIfscCode] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [darkTheme, setDarkTheme] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [defaultPaymentMode, setDefaultPaymentMode] = useState('Cash');

  // load slots from business-specific storage
  useEffect(() => {
    const savedData = getData('cashin_data', null);
    if (savedData) {
      try {
        const { slots: savedSlots, activeSlot: savedActiveSlot } = savedData;
        
        if (savedSlots && Array.isArray(savedSlots) && savedSlots.length > 0) {
          setSlots(savedSlots);
          
          // Sync amount state with the active slot's amount
          const activeSlotIndex = typeof savedActiveSlot === 'number' && savedActiveSlot >= 0 && savedActiveSlot < savedSlots.length 
            ? savedActiveSlot 
            : 0;
          
          setActiveSlot(activeSlotIndex);
          setAmount(savedSlots[activeSlotIndex]?.amount || '0');
          setPaymentMode(savedSlots[activeSlotIndex]?.paymentMode || 'Cash');
          setSelectedItems(savedSlots[activeSlotIndex]?.selectedItems || {});
        }
      } catch (e) {
        console.error('Failed to parse saved slots:', e);
      }
    }
  }, [activeBusiness.id, getData]); // reload when business changes

  // persist slots and active slot to business-specific storage with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setData('cashin_data', { slots, activeSlot });
    }, 500); // Debounce for 500ms to reduce frequent saves
    
    return () => clearTimeout(timeoutId);
  }, [slots, activeSlot, setData]);

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

  // Fetch contacts for sharing
  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    }
  };

  // Generate complete, clear, and visible PDF
  const generateInvoicePDF = async () => {
    try {
      const invoiceElement = document.getElementById('invoice-content');
      if (!invoiceElement) {
        throw new Error('Invoice element not found');
      }

      // Capture full invoice with good quality
      const canvas = await html2canvas(invoiceElement, {
        scale: 1.5, // Good balance between quality and speed
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: invoiceElement.scrollWidth,
        windowHeight: invoiceElement.scrollHeight
      });

      // Create PDF with proper dimensions
      const imgData = canvas.toDataURL('image/jpeg', 0.92); // High quality JPEG
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
        compress: true
      });

      // Add image to fit entire page
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      
      const slot = slots[selectedSlotForBill];
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], `Invoice_${slot?.invoiceNumber || 'INV'}.pdf`, { type: 'application/pdf' });
      
      return pdfFile;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  };

  // Sample data
  const quickAmounts = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const [products, setProducts] = useState([]); // Empty - no default products
  const businessCategories = [
    { name: 'Customers / Debtors (देनदार)', icon: Users, selectable: true },
    { name: 'Suppliers / Creditors (लेनदार)', icon: Building, selectable: true }
  ];
  const financeSubcategories = [
    { name: 'Bank', icon: Landmark, selectable: true },
    { name: 'Cash', icon: Coins, selectable: true },
    { name: 'Rent Received', icon: Building, selectable: true }
  ];
  const financeCategories = [
    { name: 'Bills / Recharge', icon: FileText },
    { name: 'Rent', icon: Building },
    { name: 'Company Purchase', icon: Package },
    { name: 'Other Expenses', icon: FileText }
  ];
  
  // Update amount should reflect active slot as well
  const setAmountForActive = (val) => {
    setAmount(val);
    setSlots(prev => prev.map((s, idx) => idx === activeSlot ? { ...s, amount: val } : s));
  };

  // Update payment mode for active slot
  const setPaymentModeForActive = (mode) => {
    setPaymentMode(mode);
    setSlots(prev => prev.map((s, idx) => idx === activeSlot ? { ...s, paymentMode: mode } : s));
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
    setPaymentModeForActive('Credit');
    // Save credit period to the active slot
    setSlots(prev => prev.map((s, idx) => 
      idx === activeSlot ? { ...s, creditPeriod: term } : s
    ));
  };

  const handleChequeSave = () => {
    if (chequeBankName.trim() && chequeIfscCode.trim() && chequeNumber.trim()) {
      setPaymentModeForActive('Cheque');
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
      setPaymentModeForActive(mode);
      setShowCreditTermsDropdown(false);
    }
  };

  const sampleNames = []; // Empty - no default staff names

  const handleCalculatorInput = (value) => {
    // Get current amount from the active slot
    const currentAmount = slots[activeSlot]?.amount || '0';
    
    if (value === 'clear') {
      setAmountForActive('0');
    } else if (value === 'back') {
      if (currentAmount.length <= 1 || currentAmount === '0') {
        setAmountForActive('0');
      } else {
        const newAmount = currentAmount.slice(0, -1) || '0';
        setAmountForActive(newAmount);
      }
    } else if (value === '=') {
      try {
        // Safe evaluation for basic math operations
        const sanitizedAmount = currentAmount.replace(/[^0-9+\-*/().]/g, '');
        if (sanitizedAmount && sanitizedAmount !== '0') {
          const result = Function(`"use strict"; return (${sanitizedAmount})`)();
          setAmountForActive(result.toString());
        }
      } catch (error) {
        setAmountForActive('Error');
        setTimeout(() => setAmountForActive('0'), 1000);
      }
    } else {
      // Handle number and operator input
      let newAmount;
      if (currentAmount === '0' || currentAmount === 'Error') {
        if (value !== '.') {
          newAmount = value;
        } else {
          newAmount = '0.';
        }
      } else {
        newAmount = currentAmount + value;
      }
      setAmountForActive(newAmount);
    }
  };

  const handleQuickAmount = (quickAmount) => {
    // Get current amount from the active slot to ensure we're adding to the correct total
    const currentSlotAmount = parseFloat(slots[activeSlot]?.amount) || 0;
    const newTotal = currentSlotAmount + quickAmount;
    setAmountForActive(newTotal.toString());
  };

  const handleProductSelect = (product) => {
    incQty(product);
  };

  // Generate unique invoice details for a slot
  const generateInvoiceForSlot = (slotIndex) => {
    const now = new Date();
    const timestamp = Date.now();
    const invoiceNumber = `INV-${slotIndex + 1}-${String(timestamp).slice(-6)}`;
    const invoiceDate = now.toLocaleDateString('en-GB');
    const invoiceTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    // Update slot with invoice details
    const updatedSlots = [...slots];
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      invoiceNumber,
      invoiceDate,
      invoiceTime
    };
    setSlots(updatedSlots);
  };

  // Long press handling for bill/invoice
  const handleSlotMouseDown = (slotIndex) => {
    const timer = setTimeout(() => {
      generateInvoiceForSlot(slotIndex);
      setSelectedSlotForBill(slotIndex);
      setShowBillModal(true);
    }, 800); // 800ms for long press
    setLongPressTimer(timer);
  };

  const handleSlotMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleSlotTouchStart = (slotIndex) => {
    const timer = setTimeout(() => {
      generateInvoiceForSlot(slotIndex);
      setSelectedSlotForBill(slotIndex);
      setShowBillModal(true);
    }, 800); // 800ms for long press
    setLongPressTimer(timer);
  };

  const handleSlotTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Swipe detection handlers for slots - more sensitive for smooth experience
  const minSwipeDistance = 40; // Reduced from 50 to 40 for easier swiping

  const onSlotsTouchStart = (e) => {
    // Don't prevent default to allow smooth touch
    setSlotsTouchEnd(null);
    setSlotsTouchStart(e.targetTouches[0].clientX);
    setSlotsTouchEndY(null);
    setSlotsTouchStartY(e.targetTouches[0].clientY);
  };

  const onSlotsTouchMove = (e) => {
    setSlotsTouchEnd(e.targetTouches[0].clientX);
    setSlotsTouchEndY(e.targetTouches[0].clientY);
  };

  const onSlotsTouchEnd = () => {
    if (!slotsTouchStart || !slotsTouchEnd || !slotsTouchStartY || !slotsTouchEndY) return;
    
    const distanceX = slotsTouchStart - slotsTouchEnd;
    const distanceY = slotsTouchStartY - slotsTouchEndY;
    const absDeltaX = Math.abs(distanceX);
    const absDeltaY = Math.abs(distanceY);
    
    // Improved swipe detection with better thresholds
    const isLeftSwipe = distanceX > minSwipeDistance && absDeltaY < (minSwipeDistance * 1.5);
    const isRightSwipe = distanceX < -minSwipeDistance && absDeltaY < (minSwipeDistance * 1.5);
    const isUpSwipe = distanceY > minSwipeDistance && absDeltaX < (minSwipeDistance * 1.5);
    
    // Only trigger if a clear swipe direction is detected
    if (isLeftSwipe) {
      // Swipe left detected - show Gate Pass
      console.log('Swipe LEFT detected - Opening Gate Pass');
      const slot = slots[activeSlot];
      setSelectedSlotForGatePass(activeSlot);
      setGatePassVehicleNumber('');
      setGatePassDriverName(slot.customName || '');
      setShowGatePass(true);
    } else if (isRightSwipe) {
      // Swipe right detected - show Challan preview
      console.log('Swipe RIGHT detected - Opening Challan');
      setShowChallanPreview(true);
    } else if (isUpSwipe) {
      // Swipe up detected - show Invoice preview
      console.log('Swipe UP detected - Opening Invoice');
      generateInvoiceForSlot(activeSlot);
      setSelectedSlotForBill(activeSlot);
      setShowBillModal(true);
    }
    
    // Reset touch state
    setSlotsTouchStart(null);
    setSlotsTouchEnd(null);
    setSlotsTouchStartY(null);
    setSlotsTouchEndY(null);
  };

  // Generate Challan function
  const generateChallan = () => {
    // Use data from active slot
    const slot = slots[activeSlot];
    
    // Get party name
    const partyName = slot.customName || selectedCustomer;
    
    // Validate required data
    if (!partyName || partyName === slot.label) {
      alert('Please add a customer name to this slot before generating challan');
      return;
    }
    
    if (parseFloat(slot.amount) <= 0) {
      alert('Please enter an amount greater than 0');
      return;
    }

    // Generate challan number
    const challanNumber = `DC-${String(Date.now()).slice(-6)}`;
    
    // Get current date
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Create challan object using invoice data
    const newChallan = {
      id: challanNumber,
      party: partyName,
      vehicleNumber: challanVehicleNumber || 'N/A',
      type: 'delivery',
      amount: parseFloat(slot.amount),
      date: currentDate,
      status: 'pending',
      items: Object.keys(slot.selectedItems || {}).length,
      itemDetails: slot.selectedItems || {},
      paymentMode: slot.paymentMode || 'Cash',
      createdAt: new Date().toISOString(),
      slotId: slot.id,
      slotLabel: slot.customName || slot.label,
      invoiceNumber: slot.invoiceNumber
    };

    // Get existing challans from localStorage
    const existingChallans = getData('challans', []);
    
    // Add new challan
    const updatedChallans = [newChallan, ...existingChallans];
    
    // Save to localStorage
    setData('challans', updatedChallans);
    
    // Show success message
    alert(`Challan ${challanNumber} generated successfully for ${partyName}${challanVehicleNumber ? ` (Vehicle: ${challanVehicleNumber})` : ''}`);
    
    // Close challan preview
    setShowChallanPreview(false);
    
    // Reset vehicle number
    setChallanVehicleNumber('');
    
    console.log('Challan generated:', newChallan);
  };

  // Generate Gate Pass function
  const generateGatePass = () => {
    const slot = slots[selectedSlotForGatePass];
    
    // Validate required data
    if (!gatePassVehicleNumber.trim()) {
      alert('Please enter vehicle number');
      return;
    }
    
    // Check if slot and amount exist and are valid
    const amount = slot?.amount ? parseFloat(slot.amount) : 0;
    if (!slot || amount <= 0 || isNaN(amount)) {
      alert('Please add an amount to the slot before generating gate pass');
      return;
    }

    // Generate gate pass number
    const gatePassNumber = `GP-${String(Date.now()).slice(-6)}`;
    
    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    // Create gate pass object
    const newGatePass = {
      id: gatePassNumber,
      vehicleNumber: gatePassVehicleNumber.toUpperCase(),
      driverName: gatePassDriverName || 'N/A',
      customerName: slot.customName || slot.label,
      amount: parseFloat(slot.amount),
      date: currentDate,
      time: currentTime,
      status: 'active',
      items: Object.keys(slot.selectedItems || {}).length,
      itemDetails: slot.selectedItems || {},
      paymentMode: slot.paymentMode || 'Cash',
      createdAt: now.toISOString(),
      slotId: slot.id,
      slotLabel: slot.customName || slot.label,
      invoiceNumber: slot.invoiceNumber,
      exitTime: null
    };

    // Get existing gate passes from localStorage
    const existingGatePasses = getData('gate_passes', []);
    
    // Add new gate pass
    const updatedGatePasses = [newGatePass, ...existingGatePasses];
    
    // Save to localStorage
    setData('gate_passes', updatedGatePasses);
    
    // Show success message
    alert(`Gate Pass ${gatePassNumber} generated successfully!\nVehicle: ${gatePassVehicleNumber.toUpperCase()}\nAmount: ₹${slot.amount}`);
    
    // Close gate pass dialog
    setShowGatePass(false);
    
    // Reset fields
    setGatePassVehicleNumber('');
    setGatePassDriverName('');
    setSelectedSlotForGatePass(null);
    
    console.log('Gate Pass generated:', newGatePass);
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

  const handleCategorySelect = async (category) => {
    // Check if "Customers / Debtors (देनदार)" is selected
    if (category === 'Customers / Debtors (देनदार)') {
      setShowBusinessModal(false);
      setShowCustomerDebtorModal(true);
      return;
    }
    
    // Check if "Suppliers / Creditors (लेनदार)" is selected
    if (category === 'Suppliers / Creditors (लेनदार)') {
      setShowBusinessModal(false);
      setShowSupplierCreditorModal(true);
      return;
    }
    
    // Determine contact type based on category
    let contactType = 'customer'; // default
    if (category.includes('Supplier') || category.includes('Creditor')) {
      contactType = 'supplier';
    } else if (category.includes('Staff')) {
      contactType = 'staff';
    } else if (category === 'Debtors (देनदार)') {
      contactType = 'debtor';
    } else if (category === 'Customers') {
      contactType = 'customer';
    }
    
    // Fetch contacts from backend filtered by category/type
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contacts?type=${contactType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const contacts = await response.json();
        
        if (contacts && contacts.length > 0) {
          // Show contact list dialog
          setContactList(contacts);
          setSelectedCategory(category);
          setShowBusinessModal(false);
          setShowContactListModal(true);
        } else {
          // No contacts found, allow direct category selection
          setSelectedCustomer(category);
          setShowBusinessModal(false);
          createContact(category, contactType);
        }
      } else {
        // Fallback: use category name directly if API fails
        setSelectedCustomer(category);
        setShowBusinessModal(false);
        createContact(category, contactType);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Fallback: use category name directly
      setSelectedCustomer(category);
      setShowBusinessModal(false);
      createContact(category, contactType);
    }
  };

  const handleNameSelect = (name) => {
    setSelectedCustomer(name);
    setShowCategoryList(false);
    
    // Create contact as customer type for individual names
    createContact(name, 'customer');
  };

  const resetAmount = () => {
    setAmountForActive('0');
  };

  const resetQuantities = () => {
    setSelectedItems({});
    // Also clear the active slot's selectedItems
    setSlots(prev => prev.map((slot, idx) => 
      idx === activeSlot ? { ...slot, selectedItems: {} } : slot
    ));
  };

  const confirmDeleteProduct = (productToDelete) => {
    setDeleteAction({
      type: 'individual',
      item: productToDelete,
      message: `Are you sure you want to delete "${productToDelete}"?`
    });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAllProducts = () => {
    setDeleteAction({
      type: 'all',
      message: 'Are you sure you want to delete all products?'
    });
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteAction?.type === 'individual') {
      // Delete individual product
      const productToDelete = deleteAction.item;
      setProducts(prev => prev.filter(product => product !== productToDelete));
      setSelectedItems(prev => {
        const updated = { ...prev };
        delete updated[productToDelete];
        return updated;
      });
    } else if (deleteAction?.type === 'all') {
      // Delete all products
      setProducts([]);
      setSelectedItems({});
    }
    setShowDeleteConfirm(false);
    setDeleteAction(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteAction(null);
  };

  const deleteProduct = (productToDelete) => {
    setProducts(prev => prev.filter(product => product !== productToDelete));
    // Also remove from selected items if it was selected
    setSelectedItems(prev => {
      const updated = { ...prev };
      delete updated[productToDelete];
      return updated;
    });
  };

  // Enhanced Modal Functions
  const saveNewProduct = () => {
    if (!newProductName.trim() || !newProductSellingPrice.trim()) {
      return; // Don't save if required fields are empty
    }

    // Create product object
    const productName = newProductName.trim();
    const newProduct = {
      name: productName,
      sellingPrice: parseFloat(newProductSellingPrice),
      costPrice: parseFloat(newProductCostPrice) || 0,
      measurement: newProductMeasurement,
      hsn: newProductHsn,
      barcode: newProductBarcode.trim(),
      createdAt: new Date().toISOString()
    };
    
    // Save to global products list in localStorage
    const allProducts = getData('all_products', []);
    allProducts.push(newProduct);
    setData('all_products', allProducts);
    
    // Add product to the products list
    setProducts(prev => [...prev, productName]);
    
    // Add to selected items with quantity for active slot
    if (activeSlot !== null && newProductQuantity > 0) {
      incQty(productName);
      for (let i = 1; i < newProductQuantity; i++) {
        incQty(productName);
      }
    }

    // Calculate and add to current amount
    const sellingPrice = parseFloat(newProductSellingPrice) || 0;
    if (sellingPrice > 0 && newProductQuantity > 0 && activeSlot !== null) {
      const totalProductValue = sellingPrice * newProductQuantity;
      const currentAmount = parseFloat(slots[activeSlot]?.amount || 0);
      setSlots(prev => prev.map((slot, idx) => 
        idx === activeSlot ? { ...slot, amount: (currentAmount + totalProductValue).toFixed(2) } : slot
      ));
    }

    // Reset form
    setNewProductName('');
    setNewProductSellingPrice('');
    setNewProductCostPrice('');
    setNewProductQuantity(1);
    setNewProductMeasurement('Piece');
    setNewProductHsn('');
    setNewProductBarcode('');
    
    // Close modal and show success
    setShowAddProductModal(false);
    alert(`Product "${productName}" added successfully!`);
  };

  // Persist selected items to business-specific storage
  useEffect(() => {
    setData('cashin_selected_items', selectedItems);
  }, [selectedItems, setData]);

  // Load selected items from business-specific storage
  useEffect(() => {
    const savedItems = getData('cashin_selected_items', {});
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
        description: `Cash In - ${selectedCustomer || currentSlot.label} - ${itemsDesc} - ${currentSlot.paymentMode}${currentSlot.creditPeriod ? ' (' + currentSlot.creditPeriod + ')' : ''}`,
        amount: parseFloat(currentSlot.amount),
        debit_account: selectedCustomer || currentSlot.label || 'Customer',
        credit_account: activeBusiness?.name || 'Cash'
      };

      console.log('Saving transaction:', transactionData);

      // Save to backend
      const response = await axios.post(`${API}/transactions/cash-in`, transactionData);
      
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
          paymentMode: 'Cash',
          creditPeriod: ''
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

  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [products, productSearchQuery]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col max-h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-green-500/20 backdrop-blur-sm border-b border-green-500/30 px-4 py-2 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { 
            console.log('Cash In back arrow clicked - navigating to Home page');
            resetAmount(); 
            navigate('/'); // Navigate directly to home page
          }}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <h1 className="text-white font-semibold text-base">Add Cash In Entry</h1>
        
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
        <div className="flex gap-2">
          {/* Party Selection */}
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white justify-start h-auto py-1 flex-1"
            onClick={() => setShowBusinessModal(true)}
          >
            <div className="text-left">
              <div className="text-xs text-slate-400">Party</div>
              <div className="text-xs">{selectedCustomer || 'Select...'}</div>
            </div>
          </Button>
          
          {/* Products Selection */}
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white justify-start h-auto py-1 flex-1"
            onClick={() => setShowProductModal(true)}
          >
            <div className="text-left">
              <div className="text-xs text-slate-400">Products</div>
              <div className="text-xs truncate">{Object.keys(selectedItems).length > 0 
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
        <div 
          className="grid grid-cols-6 gap-1"
        >
          {slots.map((slot, idx) => (
            <button
              key={slot.id}
              onClick={() => {
                const currentTime = Date.now();
                const timeSinceLastClick = currentTime - lastClickTime;
                
                // Check for double-click on any slot
                if (lastClickedSlot === idx && timeSinceLastClick < doubleClickDelay) {
                  // Double-click detected - open invoice
                  console.log(`Double-click on slot ${idx} - opening invoice`);
                  generateInvoiceForSlot(idx);
                  setSelectedSlotForBill(idx);
                  setShowBillModal(true);
                  // Reset double-click tracking
                  setLastClickTime(0);
                  setLastClickedSlot(null);
                } else {
                  // Single click - switch to this slot
                  console.log(`Single click on slot ${idx} - switching`);
                  setActiveSlot(idx);
                  setAmount(slot.amount || '0');
                  setPaymentMode(slot.paymentMode || 'Cash');
                  setSelectedItems(slot.selectedItems || {});
                  // Track this click for double-click detection
                  setLastClickTime(currentTime);
                  setLastClickedSlot(idx);
                }
              }}
              onMouseDown={() => handleSlotMouseDown(idx)}
              onMouseUp={handleSlotMouseUp}
              onMouseLeave={handleSlotMouseUp}
              onTouchStart={(e) => {
                handleSlotTouchStart(idx);
                onSlotsTouchStart(e);
              }}
              onTouchMove={onSlotsTouchMove}
              onTouchEnd={(e) => {
                handleSlotTouchEnd();
                onSlotsTouchEnd();
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
                  <div className="absolute -bottom-4 text-[11px] bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-lg font-bold whitespace-nowrap border border-blue-400 shadow-lg">
                    Total: ₹{slot.amount || '0'}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Challan Preview - Shows when swiped right on slots */}
        {showChallanPreview && (
          <div className="bg-white border-2 border-cyan-500 rounded-lg p-3 space-y-2 animate-in slide-in-from-right duration-300 ease-out">
            {/* Challan Header */}
            <div className="flex items-center justify-between border-b-2 border-cyan-500 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                <h3 className="text-cyan-600 font-bold text-sm">DELIVERY CHALLAN</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChallanPreview(false)}
                className="h-6 w-6 p-0 text-slate-600 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Challan Quick Info */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-100 p-2 rounded border border-slate-300">
                  <div className="text-slate-600 text-[10px]">Challan No.</div>
                  <div className="text-black font-semibold">DC-{String(Date.now()).slice(-4)}</div>
                </div>
                <div className="bg-slate-100 p-2 rounded border border-slate-300">
                  <div className="text-slate-600 text-[10px]">Date</div>
                  <div className="text-black font-semibold">{new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              <div className="bg-slate-100 p-2 rounded border border-slate-300 text-xs">
                <div className="text-slate-600 text-[10px]">Party Name</div>
                <div className="text-black font-semibold">{slots[activeSlot]?.customName || selectedCustomer || slots[activeSlot]?.label}</div>
              </div>

              {/* Vehicle Number Input */}
              <div className="bg-slate-100 p-2 rounded border border-slate-300">
                <div className="text-slate-600 text-[10px] mb-1">Vehicle Number</div>
                <input
                  type="text"
                  value={challanVehicleNumber}
                  onChange={(e) => setChallanVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., MH12AB1234"
                  className="w-full bg-white border border-slate-300 text-black h-7 text-xs px-2 rounded placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-100 p-2 rounded border border-slate-300 text-xs">
                <div className="text-slate-600 text-[10px]">Amount</div>
                <div className="text-green-600 font-bold text-base">₹{slots[activeSlot]?.amount || amount}</div>
              </div>

              {/* Items Preview */}
              {Object.keys(slots[activeSlot]?.selectedItems || {}).length > 0 && (
                <div className="bg-slate-100 p-2 rounded border border-slate-300 text-xs">
                  <div className="text-slate-600 text-[10px] mb-1">Items ({Object.keys(slots[activeSlot]?.selectedItems || {}).length})</div>
                  <div className="text-black space-y-1">
                    {Object.entries(slots[activeSlot]?.selectedItems || {}).map(([name, qty]) => (
                      <div key={name} className="flex justify-between py-0.5 border-b border-slate-200 last:border-0">
                        <span className="text-[10px]">{name}</span>
                        <span className="text-slate-600 text-[10px]">x{qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
                  onClick={generateChallan}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Generate
                </Button>
                <Button
                  size="sm"
                  className="bg-slate-600 hover:bg-slate-700 text-white h-8 text-xs"
                  onClick={() => navigate('/challan')}
                >
                  View All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Gate Pass Dialog - Shows when swiped up on slots */}
        {showGatePass && selectedSlotForGatePass !== null && (
          <div className="bg-white border-2 border-green-500 rounded-lg p-3 space-y-2 animate-in slide-in-from-left duration-300 ease-out">
            {/* Gate Pass Header */}
            <div className="flex items-center justify-between border-b-2 border-green-500 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-green-600 font-bold text-sm">GATE PASS - EXIT</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGatePass(false)}
                className="h-6 w-6 p-0 text-slate-600 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Gate Pass Info */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-100 p-2 rounded border border-slate-300">
                  <div className="text-slate-600 text-[10px]">Gate Pass No.</div>
                  <div className="text-black font-semibold">GP-{String(Date.now()).slice(-4)}</div>
                </div>
                <div className="bg-slate-100 p-2 rounded border border-slate-300">
                  <div className="text-slate-600 text-[10px]">Date & Time</div>
                  <div className="text-black font-semibold text-[10px]">
                    {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 p-2 rounded border border-slate-300 text-xs">
                <div className="text-slate-600 text-[10px]">Customer Name</div>
                <div className="text-black font-semibold">{slots[selectedSlotForGatePass]?.customName || slots[selectedSlotForGatePass]?.label}</div>
              </div>

              {/* Vehicle Number Input - Required */}
              <div className="bg-yellow-50 p-2 rounded border-2 border-green-500">
                <div className="text-green-700 text-[10px] font-semibold mb-1 flex items-center gap-1">
                  <span className="text-red-500">*</span> Vehicle Number (Required)
                </div>
                <input
                  type="text"
                  value={gatePassVehicleNumber}
                  onChange={(e) => setGatePassVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., MH12AB1234"
                  className="w-full bg-white border-2 border-green-400 text-black h-8 text-sm font-bold px-2 rounded placeholder:text-slate-400 focus:border-green-600 focus:outline-none uppercase"
                />
              </div>

              {/* Driver Name Input - Optional */}
              <div className="bg-slate-100 p-2 rounded border border-slate-300">
                <div className="text-slate-600 text-[10px] mb-1">Driver Name (Optional)</div>
                <input
                  type="text"
                  value={gatePassDriverName}
                  onChange={(e) => setGatePassDriverName(e.target.value)}
                  placeholder="Enter driver name"
                  className="w-full bg-white border border-slate-300 text-black h-7 text-xs px-2 rounded placeholder:text-slate-400 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="bg-green-50 p-2 rounded border border-green-300 text-xs">
                <div className="text-green-700 text-[10px]">Total Amount</div>
                <div className="text-green-600 font-bold text-base">₹{slots[selectedSlotForGatePass]?.amount || '0'}</div>
              </div>

              {/* Items Preview */}
              {Object.keys(slots[selectedSlotForGatePass]?.selectedItems || {}).length > 0 && (
                <div className="bg-slate-100 p-2 rounded border border-slate-300 text-xs">
                  <div className="text-slate-600 text-[10px] mb-1">Items ({Object.keys(slots[selectedSlotForGatePass]?.selectedItems || {}).length})</div>
                  <div className="text-black space-y-1">
                    {Object.entries(slots[selectedSlotForGatePass]?.selectedItems || {}).map(([name, qty]) => (
                      <div key={name} className="flex justify-between py-0.5 border-b border-slate-200 last:border-0">
                        <span className="text-[10px]">{name}</span>
                        <span className="text-slate-600 text-[10px]">x{qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white h-9 text-xs font-semibold"
                  onClick={generateGatePass}
                  disabled={!gatePassVehicleNumber.trim()}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Generate Pass
                </Button>
                <Button
                  size="sm"
                  className="bg-slate-600 hover:bg-slate-700 text-white h-9 text-xs"
                  onClick={() => setShowGatePass(false)}
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>

              {/* Helper Text */}
              <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-200">
                ← Swipe LEFT on slot to open Gate Pass | Double-click for Invoice
              </div>
            </div>
          </div>
        )}

        {/* Amount Display */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-1 text-center">
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

        {/* Action Buttons - increased size for better tap targets */}
        <div className="flex gap-1">
          <Button 
            onClick={() => setShowBarcodeModal(true)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 h-10 text-sm rounded-md text-white"
          >
            <Barcode className="w-4 h-4 mr-2" />
            Scan Barcode
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
            className="flex-1 bg-sky-500 hover:bg-sky-600 h-10 text-sm rounded-md"
          >
            Save
          </Button>
        </div>

        {/* Calculator */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-2">
            <div className="grid grid-cols-4 gap-1">
              {/* Row 1 */}
              <Button onClick={() => handleCalculatorInput('7')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">7</Button>
              <Button onClick={() => handleCalculatorInput('8')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">8</Button>
              <Button onClick={() => handleCalculatorInput('9')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">9</Button>
              <Button onClick={() => handleCalculatorInput('/')} className="bg-orange-600 hover:bg-orange-700 text-white h-10 text-base font-semibold">÷</Button>
              
              {/* Row 2 */}
              <Button onClick={() => handleCalculatorInput('4')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">4</Button>
              <Button onClick={() => handleCalculatorInput('5')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">5</Button>
              <Button onClick={() => handleCalculatorInput('6')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">6</Button>
              <Button onClick={() => handleCalculatorInput('*')} className="bg-orange-600 hover:bg-orange-700 text-white h-10 text-base font-semibold">×</Button>
              
              {/* Row 3 */}
              <Button onClick={() => handleCalculatorInput('1')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">1</Button>
              <Button onClick={() => handleCalculatorInput('2')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">2</Button>
              <Button onClick={() => handleCalculatorInput('3')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">3</Button>
              <Button onClick={() => handleCalculatorInput('-')} className="bg-orange-600 hover:bg-orange-700 text-white h-10 text-base font-semibold">−</Button>
              
              {/* Row 4 */}
              <Button onClick={() => handleCalculatorInput('0')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">0</Button>
              <Button onClick={() => handleCalculatorInput('.')} className="bg-slate-700 hover:bg-slate-600 text-white h-10 text-base font-semibold">.</Button>
              <Button onClick={() => handleCalculatorInput('clear')} className="bg-red-600 hover:bg-red-700 text-white h-10 text-sm font-semibold">C</Button>
              <Button onClick={() => handleCalculatorInput('+')} className="bg-orange-600 hover:bg-orange-700 text-white h-10 text-base font-semibold">+</Button>
              
              {/* Row 5 */}
              <Button onClick={() => handleCalculatorInput('=')} className="bg-green-600 hover:bg-green-700 text-white h-10 text-base font-semibold col-span-3">=</Button>
              <Button onClick={() => handleCalculatorInput('back')} className="bg-slate-600 hover:bg-slate-500 text-white h-10">
                <Delete className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      
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

      {/* Business Modal */}
      <Dialog open={showBusinessModal} onOpenChange={setShowBusinessModal}>
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

      {/* Contact List Modal */}
      <Dialog open={showContactListModal} onOpenChange={setShowContactListModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedCategory} - Select Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {contactList.length > 0 ? (
              contactList.map((contact) => (
                <Button
                  key={contact.id || contact._id}
                  onClick={() => {
                    setSelectedCustomer(contact.name);
                    setShowContactListModal(false);
                  }}
                  className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white text-sm py-3"
                >
                  <Users className="w-4 h-4 mr-2" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{contact.name}</span>
                    {contact.phone && (
                      <span className="text-xs text-slate-400">{contact.phone}</span>
                    )}
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No contacts found in this category</p>
                <p className="text-xs mt-2">Add contacts from the Customers/Suppliers page</p>
              </div>
            )}
          </div>
          <div className="border-t border-slate-700 pt-3 mt-3">
            <Button
              onClick={() => {
                setSelectedCustomer(selectedCategory);
                setShowContactListModal(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Use "{selectedCategory}" (No Contact)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Finance Modal */}
      <Dialog open={showFinanceModal} onOpenChange={setShowFinanceModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Finance Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {financeCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.name}
                  onClick={() => handleCategorySelect(category.name)}
                  className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white"
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
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
            <DialogTitle className="text-white text-lg">Select Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {/* Search Box */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="bg-slate-700 border-slate-600 text-white pl-10 h-8 text-sm"
              />
            </div>
            {filteredProducts.map((product) => (
              <div key={product} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                <span className="text-white text-sm">{product}</span>
                <div className="flex items-center gap-1">
                  <Button onClick={() => decQty(product)} className="bg-slate-600 w-7 h-7" size="sm">−</Button>
                  <span className="text-white text-sm min-w-[20px] text-center">{selectedItems[product] || 0}</span>
                  <Button onClick={() => incQty(product)} className="bg-green-600 w-7 h-7" size="sm">+</Button>
                  <Button onClick={() => confirmDeleteProduct(product)} className="bg-red-500 hover:bg-red-600 w-7 h-7" size="sm">✕</Button>
                </div>
              </div>
            ))}
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
            <DialogTitle className="text-white">Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-slate-200 text-sm">Product Name *</Label>
              <Input 
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                placeholder="Enter product name" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-200 text-sm">Selling Price *</Label>
                <Input 
                  value={newProductSellingPrice}
                  onChange={(e) => setNewProductSellingPrice(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                  placeholder="₹0" 
                  type="number"
                />
              </div>
              <div>
                <Label className="text-slate-200 text-sm">Cost Price</Label>
                <Input 
                  value={newProductCostPrice}
                  onChange={(e) => setNewProductCostPrice(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                  placeholder="₹0" 
                  type="number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-200 text-sm">Quantity</Label>
                <div className="flex items-center gap-1">
                  <Button 
                    onClick={() => setNewProductQuantity(q => Math.max(1, q - 1))} 
                    className="bg-slate-600 w-7 h-7" 
                    size="sm"
                  >
                    −
                  </Button>
                  <span className="text-white text-sm min-w-[32px] text-center">{newProductQuantity}</span>
                  <Button 
                    onClick={() => setNewProductQuantity(q => q + 1)} 
                    className="bg-green-600 w-7 h-7" 
                    size="sm"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-slate-200 text-sm">Measurement</Label>
                <Select value={newProductMeasurement} onValueChange={setNewProductMeasurement}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kg">Kg</SelectItem>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Grams">Grams</SelectItem>
                    <SelectItem value="Ltr">Ltr</SelectItem>
                    <SelectItem value="mm">mm</SelectItem>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="meter">meter</SelectItem>
                    <SelectItem value="feet">feet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-200 text-sm">HSN Code</Label>
              <Input 
                value={newProductHsn}
                onChange={(e) => setNewProductHsn(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                placeholder="Enter HSN code" 
              />
            </div>
            <div>
              <Label className="text-slate-200 text-sm flex items-center gap-2">
                <Barcode className="w-3 h-3" />
                Barcode Number
              </Label>
              <Input 
                value={newProductBarcode}
                onChange={(e) => setNewProductBarcode(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm h-8" 
                placeholder="Enter or scan barcode" 
              />
              {newProductBarcode && (
                <p className="text-xs text-green-400 mt-1">✓ Barcode: {newProductBarcode}</p>
              )}
            </div>
            {/* Total Value Display */}
            {newProductSellingPrice && newProductQuantity > 0 && (
              <div className="bg-blue-600/20 border border-blue-500 rounded p-2">
                <div className="text-xs text-blue-300">Total Value</div>
                <div className="text-lg font-bold text-blue-100">
                  ₹{(parseFloat(newProductSellingPrice) * newProductQuantity || 0).toFixed(2)}
                </div>
              </div>
            )}
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-sm">
              <Barcode className="w-3 h-3 mr-2" />
              Add Barcode
            </Button>
            <Button 
              onClick={saveNewProduct}
              className="w-full bg-green-600 hover:bg-green-700 h-8 text-sm"
              disabled={!newProductName.trim() || !newProductSellingPrice.trim()}
            >
              Save Product & Add to Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner with Camera */}
      <BarcodeScanner
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        onScan={handleBarcodeScan}
        title="Scan Product Barcode"
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

      {/* Bill/Invoice Modal */}
      <Dialog open={showBillModal} onOpenChange={setShowBillModal}>
        <DialogContent className="bg-slate-800 border-slate-700 w-[98vw] max-w-[850px] mx-auto my-2 max-h-[95vh] overflow-y-auto flex flex-col items-center p-3">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-base">
              <FileBarChart className="w-5 h-5 text-green-400" />
              Bill / Invoice - {selectedSlotForBill !== null ? slots[selectedSlotForBill]?.customName || slots[selectedSlotForBill]?.label : ''}
            </DialogTitle>
          </DialogHeader>
          
          {/* Tax Selection Box */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 space-y-2 w-full">
            <div className="text-white text-sm font-semibold mb-2">GST Configuration</div>
            
            {/* Tax Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-300 mb-0.5 block">Tax Type</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="CGST+SGST">CGST + SGST</option>
                  <option value="IGST">IGST</option>
                </select>
              </div>
              
              <div>
                <label className="text-[10px] text-slate-300 mb-0.5 block">Tax Rate (%)</label>
                <select
                  value={taxSlab}
                  onChange={(e) => setTaxSlab(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="0">0% (No Tax)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>
            
            {/* Tax Preview */}
            <div className="bg-slate-800/50 border border-slate-600 rounded p-1.5 flex justify-between items-center text-[10px]">
              <span className="text-slate-300">
                {taxType === 'CGST+SGST' && parseFloat(taxSlab) > 0 
                  ? `CGST: ${parseFloat(taxSlab) / 2}% + SGST: ${parseFloat(taxSlab) / 2}%` 
                  : parseFloat(taxSlab) > 0 
                    ? `IGST: ${taxSlab}%` 
                    : 'No Tax Applied'}
              </span>
              <span className="text-cyan-400 font-semibold">
                GST: {parseFloat(taxSlab)}%
              </span>
            </div>
            
            {/* Custom Taxes - Editable and Dynamic */}
            <div className="mt-2 space-y-2">
              {customTaxes.map((tax, index) => (
                <div key={tax.id} className="bg-slate-800/30 border border-slate-600 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    {tax.isEditing ? (
                      <input
                        type="text"
                        value={tax.name}
                        onChange={(e) => handleTaxNameChange(tax.id, e.target.value)}
                        onBlur={() => handleTaxNameSave(tax.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTaxNameSave(tax.id)}
                        className="bg-slate-700 border border-blue-500 text-white rounded px-2 py-0.5 text-[10px] w-24 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-300 font-medium">{tax.name}</span>
                        <button
                          onClick={() => handleTaxNameEdit(tax.id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {customTaxes.length > 1 && (
                      <button
                        onClick={() => handleRemoveTax(tax.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <select
                    value={tax.rate}
                    onChange={(e) => handleTaxRateChange(tax.id, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="0">0% (No {tax.name})</option>
                    <option value="0.5">0.5%</option>
                    <option value="1">1%</option>
                    <option value="2">2%</option>
                    <option value="3">3%</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                  </select>
                </div>
              ))}
              
              {/* Add New Tax Button */}
              <button
                onClick={handleAddNewTax}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1.5 text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add New Tax
              </button>
            </div>
            
            {/* Total Tax Summary */}
            <div className="bg-slate-800/50 border border-slate-600 rounded p-1.5 text-[10px] space-y-1 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-300">GST:</span>
                <span className="text-white">{parseFloat(taxSlab)}%</span>
              </div>
              {customTaxes.map(tax => (
                parseFloat(tax.rate) > 0 && (
                  <div key={tax.id} className="flex justify-between">
                    <span className="text-slate-300">{tax.name}:</span>
                    <span className="text-white">{parseFloat(tax.rate)}%</span>
                  </div>
                )
              ))}
              <div className="flex justify-between border-t border-slate-600 pt-1 mt-1">
                <span className="text-cyan-400 font-semibold">Total Tax Rate:</span>
                <span className="text-cyan-400 font-semibold">
                  {(parseFloat(taxSlab) + customTaxes.reduce((sum, tax) => sum + parseFloat(tax.rate), 0)).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          
          {selectedSlotForBill !== null && (
            <div id="invoice-content" className="bg-white w-full" style={{ maxWidth: '210mm', minHeight: '297mm', margin: '0 auto', padding: '5mm', fontSize: '10px' }}>
              {/* Header with Logo and Company Details */}
              <div className="border border-black mb-1">
                <div className="flex items-start p-2 gap-2">
                  {/* Logo */}
                  <div className="w-16 h-16 border border-gray-400 flex items-center justify-center bg-white flex-shrink-0">
                    <span className="text-[8px] text-gray-500 font-bold">LOGO</span>
                  </div>
                  
                  {/* Company Details */}
                  <div className="flex-1">
                    <div className="text-sm font-bold text-black uppercase">{activeBusiness?.name || 'BUSINESS NAME'}</div>
                    <div className="text-[8px] text-black mt-0.5">{activeBusiness?.address || 'Address Line 1, Address Line 2'}</div>
                    <div className="text-[8px] text-black mt-1">
                      <span className="font-bold">Registered Office:</span> {activeBusiness?.address || 'Registered Address'}
                    </div>
                    <div className="text-[8px] text-black mt-0.5">
                      <span className="font-bold">CIN:</span> {activeBusiness?.cin || 'L23109MH1952GOI008858'} | 
                      <span className="font-bold ml-2">TIN(VAT):</span> {activeBusiness?.tin || '27000000000'} | 
                      <span className="font-bold ml-2">PAN:</span> {activeBusiness?.pan || 'AAACH0000A'}
                    </div>
                    {activeBusiness?.phone && (
                      <div className="text-[8px] text-black mt-0.5">
                        <span className="font-bold">Phone:</span> {activeBusiness.phone}
                        {activeBusiness?.email && <span className="ml-2"><span className="font-bold">Email:</span> {activeBusiness.email}</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Location/Branch */}
                <div className="border-t border-black px-2 py-0.5 bg-gray-50">
                  <div className="text-[9px] font-bold text-black">{activeBusiness?.branch || 'LOCATION / BRANCH NAME'}</div>
                </div>
              </div>

              {/* Sold To and Ship To Section */}
              <div className="border border-black border-t-0 grid grid-cols-2">
                {/* Sold To */}
                <div className="border-r border-black p-1.5">
                  <div className="font-bold text-[8px] mb-0.5">SOLD TO:</div>
                  <div className="text-[8px]">
                    <div><span className="font-bold">Code:</span> {String(Date.now()).slice(-8)}</div>
                    <div className="font-bold mt-0.5">{slots[selectedSlotForBill]?.customName || slots[selectedSlotForBill]?.label}</div>
                    <div className="mt-0.5">{activeBusiness?.customerAddress || 'Customer Address Line 1'}</div>
                    <div>{activeBusiness?.customerAddress2 || 'Customer Address Line 2'}</div>
                    <div className="mt-0.5"><span className="font-bold">State:</span> Maharashtra <span className="font-bold ml-2">State Code:</span> 27</div>
                  </div>
                </div>
                
                {/* Ship To */}
                <div className="p-1.5">
                  <div className="font-bold text-[8px] mb-0.5">SHIP TO:</div>
                  <div className="text-[8px]">
                    <div>Same as SOLD TO address</div>
                    <div className="mt-1"><span className="font-bold">Payment Mode:</span> {slots[selectedSlotForBill]?.paymentMode}</div>
                    {slots[selectedSlotForBill]?.paymentMode === 'Credit' && slots[selectedSlotForBill]?.creditPeriod && (
                      <div className="mt-0.5"><span className="font-bold">Credit Period:</span> {slots[selectedSlotForBill]?.creditPeriod}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Details Row */}
              <div className="border border-black border-t-0 grid grid-cols-4 text-[8px]">
                <div className="border-r border-black p-1">
                  <div className="font-bold">INVOICE:</div>
                  <div>{slots[selectedSlotForBill]?.invoiceNumber || `INV-${selectedSlotForBill + 1}-${String(Date.now()).slice(-6)}`}</div>
                </div>
                <div className="border-r border-black p-1">
                  <div className="font-bold">DATE:</div>
                  <div>{slots[selectedSlotForBill]?.invoiceDate || new Date().toLocaleDateString('en-GB')}</div>
                </div>
                <div className="border-r border-black p-1">
                  <div className="font-bold">TIME:</div>
                  <div>{slots[selectedSlotForBill]?.invoiceTime || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="p-1">
                  <div className="font-bold">SHIPMENT NO:</div>
                  <div>SHIP-{String(Date.now()).slice(-8)}</div>
                </div>
              </div>

              {/* Vehicle Details Row */}
              <div className="border border-black border-t-0 grid grid-cols-3 text-[8px]">
                <div className="border-r border-black p-1">
                  <div className="font-bold">VEHICLE NO:</div>
                  <div>{activeBusiness?.vehicleNo || 'MH-01-AB-1234'}</div>
                </div>
                <div className="border-r border-black p-1">
                  <div className="font-bold">DRIVER:</div>
                  <div>{activeBusiness?.driverName || 'Driver Name'}</div>
                </div>
                <div className="p-1">
                  <div className="font-bold">LOAD NO:</div>
                  <div>LD-{String(Date.now()).slice(-6)}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-black border-t-0">
                {/* Table Header */}
                <div className="bg-gray-100 grid grid-cols-12 border-b border-black" style={{fontSize: '8px'}}>
                  <div className="col-span-1 p-0.5 text-center border-r border-black font-bold">SR.NO.</div>
                  <div className="col-span-3 p-0.5 border-r border-black font-bold">DESCRIPTION</div>
                  <div className="col-span-1 p-0.5 text-center border-r border-black font-bold">ITEM CODE</div>
                  <div className="col-span-1 p-0.5 text-center border-r border-black font-bold">ST.CD</div>
                  <div className="col-span-2 p-0.5 text-center border-r border-black font-bold">QTY.VOLUME</div>
                  <div className="col-span-1 p-0.5 text-center border-r border-black font-bold">UT</div>
                  <div className="col-span-2 p-0.5 text-right border-r border-black font-bold">RATE PER UNIT</div>
                  <div className="col-span-1 p-0.5 text-right font-bold">EXTENDED AMOUNT</div>
                </div>
                
                {/* Table Body */}
                {parseFloat(slots[selectedSlotForBill]?.amount) > 0 ? (
                  <>
                    <div className="grid grid-cols-12 border-b border-black" style={{fontSize: '8px'}}>
                      <div className="col-span-1 p-1 text-center border-r border-black">1</div>
                      <div className="col-span-3 p-1 border-r border-black">
                        <div className="font-bold">
                          {Object.entries(slots[selectedSlotForBill]?.selectedItems || {}).length > 0
                            ? Object.keys(slots[selectedSlotForBill]?.selectedItems).join(', ')
                            : 'Product/Service'}
                        </div>
                      </div>
                      <div className="col-span-1 p-1 text-center border-r border-black">9954</div>
                      <div className="col-span-1 p-1 text-center border-r border-black">27</div>
                      <div className="col-span-2 p-1 text-right border-r border-black">1.00</div>
                      <div className="col-span-1 p-1 text-center border-r border-black">PCS</div>
                      <div className="col-span-2 p-1 text-right border-r border-black">{parseFloat(slots[selectedSlotForBill]?.amount).toFixed(2)}</div>
                      <div className="col-span-1 p-1 text-right">{parseFloat(slots[selectedSlotForBill]?.amount).toFixed(2)}</div>
                    </div>
                    
                    {/* Tax Rows */}
                    {(() => {
                      const subtotal = parseFloat(slots[selectedSlotForBill]?.amount || 0);
                      const taxRate = parseFloat(taxSlab);
                      const taxAmount = (subtotal * taxRate) / 100;
                      
                      return (
                        <>
                          {taxType === 'CGST+SGST' && taxRate > 0 && (
                            <>
                              <div className="grid grid-cols-12 border-b border-black" style={{fontSize: '8px'}}>
                                <div className="col-span-1 p-0.5 text-center border-r border-black"></div>
                                <div className="col-span-3 p-0.5 border-r border-black pl-4">CGST @ {(taxRate / 2).toFixed(2)}%</div>
                                <div className="col-span-1 p-0.5 border-r border-black"></div>
                                <div className="col-span-1 p-0.5 border-r border-black"></div>
                                <div className="col-span-2 p-0.5 border-r border-black"></div>
                                <div className="col-span-1 p-0.5 border-r border-black"></div>
                                <div className="col-span-2 p-0.5 border-r border-black"></div>
                                <div className="col-span-1 p-0.5 text-right">{(taxAmount / 2).toFixed(2)}</div>
                              </div>
                              <div className="grid grid-cols-12 border-b border-black" style={{fontSize: '8px'}}>
                                <div className="col-span-1 p-0.5 text-center border-r border-black"></div>
                                <div className="col-span-3 p-0.5 border-r border-black pl-4">SGST @ {(taxRate / 2).toFixed(2)}%</div>
                                <div className="col-span-1 p-0.5 border-r border-black"></div>
                                <div className="col-span-1 p-0.5 border-r border-black"></div>
                                <div className="col-span-2 p-0.5 border-r border-black"></div>
                                <div className="col-span-1 p-0.5 border-r border-black"></div>
                                <div className="col-span-2 p-0.5 border-r border-black"></div>
                                <div className="col-span-1 p-0.5 text-right">{(taxAmount / 2).toFixed(2)}</div>
                              </div>
                            </>
                          )}
                          
                          {taxType === 'IGST' && taxRate > 0 && (
                            <div className="grid grid-cols-12 border-b border-black" style={{fontSize: '8px'}}>
                              <div className="col-span-1 p-0.5 text-center border-r border-black"></div>
                              <div className="col-span-3 p-0.5 border-r border-black pl-4">IGST @ {taxRate}%</div>
                              <div className="col-span-1 p-0.5 border-r border-black"></div>
                              <div className="col-span-1 p-0.5 border-r border-black"></div>
                              <div className="col-span-2 p-0.5 border-r border-black"></div>
                              <div className="col-span-1 p-0.5 border-r border-black"></div>
                              <div className="col-span-2 p-0.5 border-r border-black"></div>
                              <div className="col-span-1 p-0.5 text-right">{taxAmount.toFixed(2)}</div>
                            </div>
                          )}
                          
                          {/* Custom Taxes */}
                          {customTaxes.map(tax => {
                            const customTaxAmount = (subtotal * parseFloat(tax.rate)) / 100;
                            return parseFloat(tax.rate) > 0 ? (
                              <div key={tax.id} className="grid grid-cols-12 border-b border-black" style={{fontSize: '8px'}}>
                                <div className="col-span-1 p-0.5 text-center border-r border-black"></div>
                                <div className="col-span-3 p-0.5 border-r border-black pl-4">{tax.name} @ {tax.rate}%</div>
                                <div className="col-span-1 p-0.5 border-r border-black"></div>
                                <div className="col-span-1 p-0.5 border-r border-black"></div>
                                <div className="col-span-2 p-0.5 border-r border-black"></div>
                                <div className="col-span-1 p-0.5 border-r border-black"></div>
                                <div className="col-span-2 p-0.5 border-r border-black"></div>
                                <div className="col-span-1 p-0.5 text-right">{customTaxAmount.toFixed(2)}</div>
                              </div>
                            ) : null;
                          })}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <div className="p-2 text-center text-gray-500 text-[8px]">
                    No items added
                  </div>
                )}
              </div>

              {/* Total Section */}
              <div className="border border-black border-t-0">
                <div className="flex justify-between items-center p-1.5 bg-gray-50">
                  <div className="text-[8px]">
                    <span className="font-bold">Value in words:</span> {(() => {
                      const subtotal = parseFloat(slots[selectedSlotForBill]?.amount || 0);
                      const taxRate = parseFloat(taxSlab);
                      const customTaxTotal = customTaxes.reduce((sum, tax) => sum + parseFloat(tax.rate), 0);
                      const totalTaxRate = taxRate + customTaxTotal;
                      const total = subtotal * (1 + totalTaxRate / 100);
                      const rupees = Math.floor(total);
                      
                      const convertToWords = (num) => {
                        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
                        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
                        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
                        
                        if (num === 0) return 'Zero';
                        if (num < 10) return ones[num];
                        if (num >= 10 && num < 20) return teens[num - 10];
                        if (num >= 20 && num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
                        if (num >= 100 && num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertToWords(num % 100) : '');
                        if (num >= 1000 && num < 100000) return convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convertToWords(num % 1000) : '');
                        if (num >= 100000) return convertToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convertToWords(num % 100000) : '');
                      };
                      
                      return `Rupees ${convertToWords(rupees)} Only`;
                    })()}
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-bold">TOTAL VALUE</div>
                    <div className="text-sm font-bold">₹ {(() => {
                      const subtotal = parseFloat(slots[selectedSlotForBill]?.amount || 0);
                      const taxRate = parseFloat(taxSlab);
                      const customTaxTotal = customTaxes.reduce((sum, tax) => sum + parseFloat(tax.rate), 0);
                      const totalTaxRate = taxRate + customTaxTotal;
                      return (subtotal * (1 + totalTaxRate / 100)).toFixed(2);
                    })()}</div>
                  </div>
                </div>
              </div>

              {/* Quality Testing Section - Optional */}
              <div className="border border-black border-t-0 mt-1">
                <div className="grid grid-cols-6 text-[8px]">
                  <div className="border-r border-black p-0.5">
                    <div className="font-bold">Comp N Dip</div>
                  </div>
                  <div className="border-r border-black p-0.5">
                    <div className="font-bold">PL</div>
                  </div>
                  <div className="border-r border-black p-0.5">
                    <div className="font-bold">Vol</div>
                  </div>
                  <div className="border-r border-black p-0.5">
                    <div className="font-bold">Sample No</div>
                  </div>
                  <div className="border-r border-black p-0.5">
                    <div className="font-bold">Density</div>
                  </div>
                  <div className="p-0.5">
                    <div className="font-bold">Temp</div>
                  </div>
                </div>
              </div>

              {/* Received in Good Condition Section */}
              <div className="border border-black border-t-0 mt-1 p-1.5">
                <div className="text-[9px] font-bold mb-1">Received the products in good condition</div>
                <div className="grid grid-cols-2 gap-2 text-[7px]">
                  <div>
                    <div className="mb-2">
                      <span className="font-bold">VIDE:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div><span className="font-bold">INVOICE No:</span> {slots[selectedSlotForBill]?.invoiceNumber}</div>
                      <div><span className="font-bold">DATE:</span> {slots[selectedSlotForBill]?.invoiceDate}</div>
                      <div><span className="font-bold">CONT:</span></div>
                      <div><span className="font-bold">Time:</span> {slots[selectedSlotForBill]?.invoiceTime}</div>
                      <div><span className="font-bold">Shipment No:</span> SHIP-{String(Date.now()).slice(-8)}</div>
                      <div><span className="font-bold">DELIVERED TO:</span> {slots[selectedSlotForBill]?.customName}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-2">
                      <div className="font-bold mb-1">Signature & Seal of Customer / Consignee</div>
                      <div className="border border-gray-400 h-12 mb-2"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[7px]">
                      <div><span className="font-bold">Cheque/DD No.</span></div>
                      <div><span className="font-bold">DATED</span></div>
                      <div><span className="font-bold">AMOUNT</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Signature Note */}
              <div className="text-[7px] text-gray-600 italic mt-1 text-center">
                This is a computer-generated invoice
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-2 mt-4 w-full">
                <Button
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 text-xs"
                  onClick={async () => {
                    try {
                      // Print functionality
                      window.print();
                    } catch (error) {
                      console.error('Print error:', error);
                    }
                  }}
                >
                  <Printer className="w-3 h-3 mr-1" />
                  Print
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs"
                  onClick={() => setShowShareOptions(true)}
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs"
                  onClick={() => setShowBillModal(false)}
                >
                  <X className="w-3 h-3 mr-1" />
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner with Camera */}
      <BarcodeScanner
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        onScan={handleBarcodeScan}
        title="Scan Product Barcode"
      />

      {/* Contacts List Dialog */}
      <Dialog open={showContactsList} onOpenChange={setShowContactsList}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Select Contact to Share Invoice
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No contacts found</p>
                <p className="text-xs mt-1">Add contacts from the Chat section</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <Button
                  key={contact.id}
                  className="w-full bg-slate-700 hover:bg-slate-600 h-16 text-left justify-start"
                  onClick={async () => {
                    setShowContactsList(false);
                    try {
                      // Generate PDF
                      const pdfFile = await generateInvoicePDF();
                      const slot = slots[selectedSlotForBill];
                      
                      // Convert PDF to base64
                      const reader = new FileReader();
                      reader.readAsDataURL(pdfFile);
                      reader.onloadend = async () => {
                        try {
                          const base64data = reader.result;
                          
                          // Send PDF via chat API
                          const token = localStorage.getItem('token');
                          await axios.post(`${API}/api/chat/send`, {
                            peer_id: contact.id,
                            message: `Invoice ${slot?.invoiceNumber} - ${activeBusiness?.name || 'Business'}`,
                            type: 'file',
                            file_data: base64data,
                            file_name: `Invoice_${slot?.invoiceNumber}.pdf`,
                            file_type: 'application/pdf'
                          }, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          
                          alert(`Invoice PDF sent to ${contact.name}!`);
                        } catch (error) {
                          console.error('Error sending invoice:', error);
                          alert('Failed to send invoice. Please try again.');
                        }
                      };
                    } catch (error) {
                      console.error('Error generating PDF:', error);
                      alert('Failed to generate invoice PDF. Please try again.');
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-full">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{contact.name}</div>
                      {contact.phone && (
                        <div className="text-xs text-slate-400">{contact.phone}</div>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            )}
            
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 mt-4"
              onClick={() => setShowContactsList(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Options Dialog */}
      <Dialog open={showShareOptions} onOpenChange={setShowShareOptions}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-400" />
              Share Invoice
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* Share Within App Chat */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-left justify-start"
              onClick={async () => {
                setShowShareOptions(false);
                await fetchContacts();
                setShowContactsList(true);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Share within App Chat</div>
                  <div className="text-xs text-blue-200">Send invoice to contacts in app</div>
                </div>
              </div>
            </Button>

            {/* Share Outside App */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 h-14 text-left justify-start"
              onClick={async () => {
                try {
                  setShowShareOptions(false);
                  
                  // Generate PDF (fast - optimized)
                  const pdfFile = await generateInvoicePDF();
                  const slot = slots[selectedSlotForBill];
                  
                  // Try to share with Web Share API
                  if (navigator.share) {
                    try {
                      // Check if files can be shared
                      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                        await navigator.share({
                          title: `Invoice ${slot?.invoiceNumber}`,
                          text: `Invoice from ${activeBusiness?.name || 'Business'}`,
                          files: [pdfFile]
                        });
                        console.log('PDF shared successfully via Web Share API');
                      } else {
                        // If files not supported, download instead
                        throw new Error('File sharing not supported');
                      }
                    } catch (shareError) {
                      if (shareError.name === 'AbortError') {
                        console.log('Share cancelled by user');
                        return;
                      }
                      throw shareError;
                    }
                  } else {
                    // Fallback: Download PDF
                    console.log('Web Share API not available, downloading PDF...');
                    const url = URL.createObjectURL(pdfFile);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Invoice_${slot?.invoiceNumber}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    alert('Invoice PDF downloaded! Check your downloads folder.');
                  }
                } catch (error) {
                  console.error('Share error:', error);
                  alert(`Error: ${error.message || 'Failed to generate/share invoice PDF. Please try again.'}`);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Share Outside App</div>
                  <div className="text-xs text-green-200">WhatsApp, SMS, Email, etc.</div>
                </div>
              </div>
            </Button>

            {/* Cancel Button */}
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => setShowShareOptions(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashInEntry;
