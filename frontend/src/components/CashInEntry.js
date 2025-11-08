import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

const CashInEntry = ({ onBack }) => {
  const API = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  const [amount, setAmount] = useState('0');
  // POS multi-customer slots
  const initialSlots = Array.from({ length: 6 }, (_, i) => ({ 
    id: i, 
    label: `C${i + 1}`, 
    amount: '0',
    paymentMode: 'Cash',
    selectedItems: {},
    invoiceNumber: null,
    invoiceDate: null,
    invoiceTime: null
  }));
  const [slots, setSlots] = useState(initialSlots);
  const [activeSlot, setActiveSlot] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(new Date().toTimeString().slice(0, 5));
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedItems, setSelectedItems] = useState({});

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
  
  const [selectedCategory, setSelectedCategory] = useState('');
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
        const { slots, activeSlot } = savedData;
        
        if (slots && Array.isArray(slots) && slots.length > 0) {
          setSlots(slots);
        }
        
        if (typeof activeSlot === 'number' && activeSlot >= 0 && activeSlot < slots.length) {
          setActiveSlot(activeSlot);
        }
      } catch (e) {
        console.error('Failed to parse saved slots:', e);
      }
    }
  }, [activeBusiness.id, getData]); // reload when business changes

  // persist slots and active slot to business-specific storage
  useEffect(() => {
    setData('cashin_data', { slots, activeSlot });
  }, [slots, activeSlot, setData]);

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

  // Generate PDF from invoice
  const generateInvoicePDF = async () => {
    try {
      const invoiceElement = document.getElementById('invoice-content');
      if (!invoiceElement) {
        throw new Error('Invoice element not found');
      }

      // Create canvas from invoice HTML
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const slot = slots[selectedSlotForBill];
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], `Invoice_${slot?.invoiceNumber || 'INV'}.pdf`, { type: 'application/pdf' });
      
      return pdfFile;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  // Sample data
  const quickAmounts = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const [products, setProducts] = useState([]); // Empty - no default products
  const businessCategories = [
    { name: 'Customers / Debtors (देनदार)', icon: Users, selectable: true },
    { name: 'Suppliers / Creditors (लेनदार)', icon: Building, selectable: true },
    { name: 'Staff', icon: Users, selectable: true }
  ];
  const financeSubcategories = [
    { name: 'Rent', icon: Building, selectable: true },
    { name: 'Other', icon: FileText, selectable: true }
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
    // Set the selected customer directly for business and finance options
    setSelectedCustomer(category);
    setShowBusinessModal(false);
    
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
  const handleSave = () => {
    // Reset current active slot after saving
    setSlots(prev => prev.map((slot, idx) => 
      idx === activeSlot ? { ...slot, amount: '0' } : slot
    ));
    setAmount('0');
    
    // You can add actual transaction save logic here
    console.log('Transaction saved, slot reset');
  };

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

        {/* Fuel, Customer & Product Dropdowns */}
        <div className="flex gap-2">
          {/* Fuel Button */}
          <Button
            variant="outline"
            className="bg-orange-600 border-orange-700 text-white hover:bg-orange-500 w-12 h-12 p-0 flex items-center justify-center flex-shrink-0"
            onClick={() => navigate('/fuel-dispenser')}
          >
            <Fuel className="w-5 h-5" />
          </Button>
          
          {/* Customer Selection */}
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white justify-start h-auto py-1 flex-1"
            onClick={() => setShowBusinessModal(true)}
          >
            <div className="text-left">
              <div className="text-xs text-slate-400">Customer</div>
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
        <div className="grid grid-cols-6 gap-1">
          {slots.map((slot, idx) => (
            <button
              key={slot.id}
              onClick={() => {
                if (activeSlot === idx) {
                  // If clicking on the currently active slot, open bill/invoice
                  generateInvoiceForSlot(idx);
                  setSelectedSlotForBill(idx);
                  setShowBillModal(true);
                } else {
                  // If clicking on a different slot, switch to it
                  setActiveSlot(idx);
                  setAmount(slot.amount);
                  setPaymentMode(slot.paymentMode || 'Cash');
                  setSelectedItems(slot.selectedItems || {});
                }
              }}
              onMouseDown={() => handleSlotMouseDown(idx)}
              onMouseUp={handleSlotMouseUp}
              onMouseLeave={handleSlotMouseUp}
              onTouchStart={() => handleSlotTouchStart(idx)}
              onTouchEnd={handleSlotTouchEnd}
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
            <DialogTitle className="text-white">Customer Selection</DialogTitle>
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
            {products
              .filter(product => 
                product.toLowerCase().includes(productSearchQuery.toLowerCase())
              )
              .map((product) => (
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
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl w-full mx-auto my-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-green-400" />
              Bill / Invoice - {selectedSlotForBill !== null ? slots[selectedSlotForBill]?.customName || slots[selectedSlotForBill]?.label : ''}
            </DialogTitle>
          </DialogHeader>
          
          {/* Tax Selection Box */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 space-y-3">
            <div className="text-white text-sm font-semibold mb-2">GST Configuration</div>
            
            {/* Tax Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-300 mb-1 block">Tax Type</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="CGST+SGST">CGST + SGST</option>
                  <option value="IGST">IGST</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-slate-300 mb-1 block">Tax Rate (%)</label>
                <select
                  value={taxSlab}
                  onChange={(e) => setTaxSlab(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
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
            <div className="bg-slate-800/50 border border-slate-600 rounded p-2 flex justify-between items-center text-xs">
              <span className="text-slate-300">
                {taxType === 'CGST+SGST' && parseFloat(taxSlab) > 0 
                  ? `CGST: ${parseFloat(taxSlab) / 2}% + SGST: ${parseFloat(taxSlab) / 2}%` 
                  : parseFloat(taxSlab) > 0 
                    ? `IGST: ${taxSlab}%` 
                    : 'No Tax Applied'}
              </span>
              <span className="text-cyan-400 font-semibold">
                Total: {parseFloat(taxSlab)}%
              </span>
            </div>
          </div>
          
          {selectedSlotForBill !== null && (
            <div id="invoice-content" className="space-y-3 bg-white p-4 rounded">
              {/* GST Invoice Header */}
              <div className="text-center border-2 border-black p-3">
                <div className="text-2xl font-bold text-black mb-1">{activeBusiness?.name || 'BUSINESS NAME'}</div>
                {activeBusiness?.address && (
                  <div className="text-sm text-black">{activeBusiness.address}</div>
                )}
                <div className="flex justify-center gap-6 mt-2 text-sm text-black">
                  {activeBusiness?.phone && (
                    <span><span className="font-semibold">Phone:</span> {activeBusiness.phone}</span>
                  )}
                  {activeBusiness?.gst && (
                    <span><span className="font-semibold">GSTIN:</span> {activeBusiness.gst}</span>
                  )}
                </div>
                <div className="mt-2 text-lg font-bold text-black border-t-2 border-black pt-2">
                  TAX INVOICE
                </div>
              </div>

              {/* Invoice Details - Two Columns */}
              <div className="grid grid-cols-2 gap-0 border-2 border-black">
                {/* Left Column - Invoice Details */}
                <div className="p-3 border-r border-black">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Invoice No:</span>
                      <span className="text-black font-semibold">{slots[selectedSlotForBill]?.invoiceNumber || `INV-${selectedSlotForBill + 1}-${String(Date.now()).slice(-6)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Date:</span>
                      <span className="text-black">{slots[selectedSlotForBill]?.invoiceDate || new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Time:</span>
                      <span className="text-black">{slots[selectedSlotForBill]?.invoiceTime || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Customer Details */}
                <div className="p-3">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Customer:</span>
                      <span className="text-black font-semibold">{slots[selectedSlotForBill]?.customName || slots[selectedSlotForBill]?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Payment Mode:</span>
                      <span className="text-black">{slots[selectedSlotForBill]?.paymentMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">State:</span>
                      <span className="text-black">Maharashtra</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table - GST Format */}
              <div className="border-2 border-black">
                {/* Table Header */}
                <div className="bg-gray-100 px-2 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-black border-b-2 border-black">
                  <span className="col-span-1 text-center">S.No</span>
                  <span className="col-span-4 pl-3">Item Details</span>
                  <span className="col-span-2 text-center">HSN</span>
                  <span className="col-span-1 text-center">Qty</span>
                  <span className="col-span-2 text-right">Rate</span>
                  <span className="col-span-2 text-right">Amount</span>
                </div>
                
                {/* Table Body */}
                {parseFloat(slots[selectedSlotForBill]?.amount) > 0 ? (
                  <div className="px-2 py-2 grid grid-cols-12 gap-2 text-xs bg-white">
                    <span className="col-span-1 text-center text-black">1</span>
                    <span className="col-span-4 pl-3 text-black">
                      {Object.entries(slots[selectedSlotForBill]?.selectedItems || {}).length > 0
                        ? Object.keys(slots[selectedSlotForBill]?.selectedItems).join(', ')
                        : 'Service/Product'}
                    </span>
                    <span className="col-span-2 text-center text-gray-700">9954</span>
                    <span className="col-span-1 text-center text-gray-700">1</span>
                    <span className="col-span-2 text-right text-gray-700">₹{slots[selectedSlotForBill]?.amount}</span>
                    <span className="col-span-2 text-right text-black font-semibold">₹{slots[selectedSlotForBill]?.amount}</span>
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center text-gray-500 text-xs bg-white">
                    No items added to this invoice
                  </div>
                )}
              </div>

                {/* Total Section - GST Format */}
                <div className="border-2 border-black">
                  <div className="bg-white p-2 space-y-1">
                    <div className="flex justify-between text-xs text-black">
                      <span className="font-semibold">Taxable Amount:</span>
                      <span className="font-semibold">₹{parseFloat(slots[selectedSlotForBill]?.amount || 0).toFixed(2)}</span>
                    </div>
                    {(() => {
                      const subtotal = parseFloat(slots[selectedSlotForBill]?.amount || 0);
                      const taxRate = parseFloat(taxSlab);
                      const taxAmount = (subtotal * taxRate) / 100;
                      
                      if (taxType === 'CGST+SGST' && taxRate > 0) {
                        const halfTax = taxAmount / 2;
                        return (
                          <>
                            <div className="flex justify-between text-xs text-black">
                              <span>CGST @ {taxRate / 2}%:</span>
                              <span>₹{halfTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-black">
                              <span>SGST @ {taxRate / 2}%:</span>
                              <span>₹{halfTax.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      } else if (taxRate > 0) {
                        return (
                          <div className="flex justify-between text-xs text-black">
                            <span>IGST @ {taxRate}%:</span>
                            <span>₹{taxAmount.toFixed(2)}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  <div className="bg-gray-100 border-t-2 border-black p-2">
                    <div className="flex justify-between text-sm font-bold text-black">
                      <span>TOTAL AMOUNT:</span>
                      <span className="text-lg text-black">₹{(() => {
                        const subtotal = parseFloat(slots[selectedSlotForBill]?.amount || 0);
                        const taxRate = parseFloat(taxSlab);
                        const taxAmount = (subtotal * taxRate) / 100;
                        return (subtotal + taxAmount).toFixed(2);
                      })()}</span>
                    </div>
                    <div className="text-xs text-black mt-1">
                      <span className="font-semibold">Amount in Words:</span> {(() => {
                        const total = parseFloat(slots[selectedSlotForBill]?.amount || 0) * (1 + parseFloat(taxSlab) / 100);
                        return `Rupees ${Math.floor(total)} Only`;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions Footer */}
                <div className="border-2 border-black p-2 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-black text-xs">Terms & Conditions:</div>
                    {!isEditingTerms ? (
                      <Button
                        onClick={() => {
                          setTempTermsText(termsText);
                          setIsEditingTerms(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button onClick={saveTerms} size="sm" className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white">
                          Save
                        </Button>
                        <Button onClick={cancelTermsEdit} variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-600">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-black">
                    {isEditingTerms ? (
                      <textarea
                        value={tempTermsText}
                        onChange={(e) => setTempTermsText(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-black text-xs p-2 rounded min-h-[80px] focus:outline-none focus:border-blue-500"
                        placeholder="Enter terms and conditions..."
                      />
                    ) : (
                      <div className="whitespace-pre-line">
                        {termsText}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right mt-3">
                    <div className="text-xs text-black">For <span className="font-semibold text-black">{activeBusiness?.name || 'BUSINESS NAME'}</span></div>
                    <div className="mt-8 text-xs text-black border-t border-black pt-1 inline-block">Authorized Signatory</div>
                  </div>
                </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    try {
                      // Print functionality
                      window.print();
                    } catch (error) {
                      console.error('Print error:', error);
                    }
                  }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowShareOptions(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowBillModal(false)}
                >
                  <X className="w-4 h-4 mr-2" />
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
                      const slot = slots[selectedSlotForBill];
                      const subtotal = parseFloat(slot?.amount || 0);
                      const taxRate = parseFloat(taxSlab);
                      const taxAmount = (subtotal * taxRate) / 100;
                      const total = subtotal + taxAmount;
                      
                      const invoiceText = `
📄 TAX INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━

🏢 ${activeBusiness?.name || 'BUSINESS NAME'}
${activeBusiness?.address || ''}
📞 Phone: ${activeBusiness?.phone || 'N/A'}
🆔 GSTIN: ${activeBusiness?.gst || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━

📋 Invoice Details:
Invoice No: ${slot?.invoiceNumber || 'N/A'}
Date: ${slot?.invoiceDate || 'N/A'}
Time: ${slot?.invoiceTime || 'N/A'}

👤 Customer: ${slot?.customName || slot?.label}
💳 Payment: ${slot?.paymentMode}

━━━━━━━━━━━━━━━━━━━━━━━━

📦 Items:
${Object.entries(slot?.selectedItems || {}).length > 0 
  ? Object.keys(slot?.selectedItems).join(', ') 
  : 'Service/Product'}

━━━━━━━━━━━━━━━━━━━━━━━━

💰 Amount Details:
Taxable Amount: ₹${subtotal.toFixed(2)}
${taxType === 'CGST+SGST' && taxRate > 0 
  ? `CGST @ ${taxRate / 2}%: ₹${(taxAmount / 2).toFixed(2)}\nSGST @ ${taxRate / 2}%: ₹${(taxAmount / 2).toFixed(2)}`
  : taxRate > 0 
    ? `IGST @ ${taxRate}%: ₹${taxAmount.toFixed(2)}`
    : 'No Tax Applied'}

━━━━━━━━━━━━━━━━━━━━━━━━

💵 TOTAL AMOUNT: ₹${total.toFixed(2)}
In Words: Rupees ${Math.floor(total)} Only

━━━━━━━━━━━━━━━━━━━━━━━━

📝 ${termsText || 'Terms & Conditions Apply'}

✍️ For ${activeBusiness?.name || 'BUSINESS NAME'}
Authorized Signatory
                      `.trim();

                      // Send message via chat API
                      const token = localStorage.getItem('token');
                      await axios.post(`${API}/api/chat/send`, {
                        peer_id: contact.id,
                        message: invoiceText,
                        type: 'text'
                      }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      
                      alert(`Invoice sent to ${contact.name}!`);
                    } catch (error) {
                      console.error('Error sending invoice:', error);
                      alert('Failed to send invoice. Please try again.');
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
                setShowShareOptions(false);
                try {
                  // Generate PDF
                  const pdfFile = await generateInvoicePDF();
                  const slot = slots[selectedSlotForBill];
                  
                  // Share using Web Share API
                  const invoiceText = `
📄 TAX INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━

🏢 ${activeBusiness?.name || 'BUSINESS NAME'}
${activeBusiness?.address || ''}
📞 Phone: ${activeBusiness?.phone || 'N/A'}
🆔 GSTIN: ${activeBusiness?.gst || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━

📋 Invoice Details:
Invoice No: ${slot?.invoiceNumber || 'N/A'}
Date: ${slot?.invoiceDate || 'N/A'}
Time: ${slot?.invoiceTime || 'N/A'}

👤 Customer: ${slot?.customName || slot?.label}
💳 Payment: ${slot?.paymentMode}

━━━━━━━━━━━━━━━━━━━━━━━━

📦 Items:
${Object.entries(slot?.selectedItems || {}).length > 0 
  ? Object.keys(slot?.selectedItems).join(', ') 
  : 'Service/Product'}

━━━━━━━━━━━━━━━━━━━━━━━━

💰 Amount Details:
Taxable Amount: ₹${subtotal.toFixed(2)}
${taxType === 'CGST+SGST' && taxRate > 0 
  ? `CGST @ ${taxRate / 2}%: ₹${(taxAmount / 2).toFixed(2)}\nSGST @ ${taxRate / 2}%: ₹${(taxAmount / 2).toFixed(2)}`
  : taxRate > 0 
    ? `IGST @ ${taxRate}%: ₹${taxAmount.toFixed(2)}`
    : 'No Tax Applied'}

━━━━━━━━━━━━━━━━━━━━━━━━

💵 TOTAL AMOUNT: ₹${total.toFixed(2)}
In Words: Rupees ${Math.floor(total)} Only

━━━━━━━━━━━━━━━━━━━━━━━━

📝 ${termsText || 'Terms & Conditions Apply'}

✍️ For ${activeBusiness?.name || 'BUSINESS NAME'}
Authorized Signatory
                  `.trim();

                  if (navigator.share) {
                    await navigator.share({
                      title: `Invoice ${slot?.invoiceNumber}`,
                      text: invoiceText
                    });
                  } else {
                    // Fallback: Copy to clipboard
                    await navigator.clipboard.writeText(invoiceText);
                    alert('Invoice copied to clipboard!');
                  }
                } catch (error) {
                  console.error('Share error:', error);
                  alert('Failed to share invoice');
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
