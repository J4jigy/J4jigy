import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
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
  Coins
} from 'lucide-react';

const CashInEntry = ({ onBack }) => {
  const [amount, setAmount] = useState('0');
  // POS multi-customer slots
  const initialSlots = Array.from({ length: 6 }, (_, i) => ({ 
    id: i, 
    label: `C${i + 1}`, 
    amount: '0',
    paymentMode: 'Cash'
  }));
  const [slots, setSlots] = useState(initialSlots);
  const [activeSlot, setActiveSlot] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(new Date().toTimeString().slice(0, 5));
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedItems, setSelectedItems] = useState({});

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [darkTheme, setDarkTheme] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [defaultPaymentMode, setDefaultPaymentMode] = useState('Cash');

  // load slots from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cashin_slots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          // Ensure each slot has paymentMode property
          const slotsWithPaymentMode = parsed.map(slot => ({
            ...slot,
            paymentMode: slot.paymentMode || 'Cash'
          }));
          setSlots(slotsWithPaymentMode);
          const activeIndex = parseInt(localStorage.getItem('cashin_active') || '0', 10) || 0;
          setActiveSlot(activeIndex);
          setAmount(slotsWithPaymentMode[activeIndex]?.amount || '0');
          setPaymentMode(slotsWithPaymentMode[activeIndex]?.paymentMode || 'Cash');
        }
      } catch {}
    }
  }, []);

  // persist slots and active slot
  useEffect(() => {
    localStorage.setItem('cashin_slots', JSON.stringify(slots));
    localStorage.setItem('cashin_active', String(activeSlot));
  }, [slots, activeSlot]);

  // Sample data
  const quickAmounts = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const [products, setProducts] = useState(['Groceries', 'T-Shirts', 'Rice', 'Wheat', 'Sugar', 'Oil', 'Milk', 'Bread']);
  const businessCategories = [
    { name: 'Customers / Debtors', icon: Users },
    { name: 'Suppliers / Creditors', icon: Building },
    { name: 'Staff', icon: Users }
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

  const handlePaymentModeClick = (mode) => {
    if (mode === 'Credit') {
      setShowCreditTermsDropdown(true);
    } else {
      setPaymentModeForActive(mode);
      setShowCreditTermsDropdown(false);
    }
  };

  const sampleNames = [
    'Aarav Sharma', 'Vivaan Patel', 'Aditya Kumar', 'Vihaan Singh', 'Arjun Gupta',
    'Sai Krishna', 'Reyansh Agarwal', 'Ayaan Shah', 'Krishna Reddy', 'Ishaan Jain',
    'Shaurya Yadav', 'Atharv Mehta', 'Rudra Verma', 'Aadhya Mishra', 'Kiara Nair'
  ];

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

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setNewEntryTitle(
      financeCategories.some(cat => cat.name === category) 
        ? 'Add New Expense' 
        : `Add New ${category.split(' / ')[0]}`
    );
    setShowBusinessModal(false);
    setShowFinanceModal(false);
    setShowCategoryList(true);
  };

  const handleNameSelect = (name) => {
    setSelectedCustomer(name);
    setShowCategoryList(false);
  };

  const resetAmount = () => {
    setAmountForActive('0');
  };

  const resetQuantities = () => {
    setSelectedItems({});
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

    // Add product to the products list
    const productName = newProductName.trim();
    setProducts(prev => [...prev, productName]);
    
    // Add to selected items with quantity
    if (newProductQuantity > 0) {
      setSelectedItems(prev => ({
        ...prev,
        [productName]: newProductQuantity
      }));
    }

    // Calculate and add to current amount
    const sellingPrice = parseFloat(newProductSellingPrice) || 0;
    if (sellingPrice > 0 && newProductQuantity > 0) {
      const totalProductValue = sellingPrice * newProductQuantity;
      const currentAmount = parseFloat(amount) || 0;
      setAmountForActive((currentAmount + totalProductValue).toString());
    }

    // Reset form
    setNewProductName('');
    setNewProductSellingPrice('');
    setNewProductCostPrice('');
    setNewProductQuantity(1);
    setNewProductMeasurement('Piece');
    setNewProductHsn('');
    
    // Close modal
    setShowAddProductModal(false);
  };

  // Persist selected items to localStorage
  useEffect(() => {
    localStorage.setItem('cashin_selected_items', JSON.stringify(selectedItems));
  }, [selectedItems]);

  // Load selected items from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('cashin_selected_items');
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems);
        setSelectedItems(parsed);
      } catch {}
    }
  }, []);

  // Coin sound effect function
  const playCoinSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create oscillator for the coin "ting" sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure the sound - high frequency metallic "ting"
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.01);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      
      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
    } catch (error) {
      // Silently fail if Web Audio API is not supported
      console.log('Audio not supported:', error);
    }
  };

  // Handle coin click with sound
  const handleCoinClick = (amount) => {
    playCoinSound();
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
          onClick={() => { resetAmount(); onBack(); }}
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
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white justify-start h-auto py-1"
            onClick={() => setShowBusinessModal(true)}
          >
            <div className="text-left">
              <div className="text-xs text-slate-400">Customer</div>
              <div className="text-xs">{selectedCustomer || 'Select...'}</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white justify-start h-auto py-1"
            onClick={() => setShowProductModal(true)}
          >
            <div className="text-left">
              <div className="text-xs text-slate-400">Products</div>
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
        {/* Quick Amount Icons */}
        <div className="space-y-2">
          {/* Coin Icons (Golden with Rupee Symbol) */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 5, 10, 20].map((amount) => (
              <div
                key={amount}
                onClick={() => handleCoinClick(amount)}
                className="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform group"
              >
                {/* Coin Design - Flat Golden Circle with Border */}
                <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-yellow-600 group-hover:bg-yellow-300 group-hover:border-yellow-500 flex items-center justify-center shadow-md">
                  {/* Inner Circle */}
                  <div className="w-8 h-8 rounded-full bg-yellow-500 group-hover:bg-yellow-400 flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-800 group-hover:text-yellow-700">
                      ₹{amount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Currency Note Icons (Green with Rupee Symbol) */}
          <div className="flex gap-3 justify-center">
            {[50, 100, 200, 500].map((amount) => (
              <div
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                className="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform group"
              >
                {/* Currency Note Design - Rectangular with Central Circle */}
                <div className="w-14 h-8 rounded bg-green-200 border-2 border-green-600 group-hover:bg-green-100 group-hover:border-green-500 shadow-md flex items-center justify-center relative">
                  {/* Side Dots */}
                  <div className="absolute left-1 w-1 h-1 rounded-full bg-green-600 group-hover:bg-green-500"></div>
                  <div className="absolute right-1 w-1 h-1 rounded-full bg-green-600 group-hover:bg-green-500"></div>
                  {/* Central Circle with Rupee Symbol */}
                  <div className="w-5 h-5 rounded-full bg-green-600 group-hover:bg-green-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      ₹{amount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POS multi-customer boxes */}
        <div className="grid grid-cols-6 gap-1">
          {slots.map((slot, idx) => (
            <button
              key={slot.id}
              onClick={() => {
                setActiveSlot(idx);
                setAmount(slot.amount);
                setPaymentMode(slot.paymentMode || 'Cash');
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

        {/* Amount Display */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-1 text-center">
            <div className="text-lg font-bold text-white">
              ₹{amount}
            </div>
          </CardContent>
        </Card>

        {/* Payment Mode Tabs - enlarged buttons, full width across screen */}
        <div className="grid grid-cols-3 gap-2">
          {['Credit', 'Cash', 'Online'].map((mode) => (
            <Button
              key={mode}
              onClick={() => handlePaymentModeClick(mode)}
              className={`w-full h-10 text-xs sm:text-sm rounded-md ${
                paymentMode === mode
                  ? mode === 'Credit' ? 'bg-orange-900 hover:bg-orange-950 ring-1 ring-orange-700' 
                    : mode === 'Cash' ? 'bg-green-600 hover:bg-green-700'
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
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700 h-10 text-sm rounded-md text-white">
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
            <DialogTitle className="text-white">Business Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {businessCategories.map((category) => {
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
            <div className="flex flex-col gap-2 mb-3">
              <Button
                onClick={() => {
                  setShowProductModal(false);
                  setShowAddProductModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white h-8 text-sm"
              >
                <Plus className="w-3 h-3 mr-2" />
                Add New Product
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={resetQuantities}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex-1 h-8 text-sm"
                >
                  Reset Quantity
                </Button>
                <Button
                  onClick={confirmDeleteAllProducts}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1 h-8 text-sm"
                >
                  Delete Product
                </Button>
              </div>
            </div>
            {products.map((product) => (
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
              Save Product & Add to Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Modal */}
      <Dialog open={showBarcodeModal} onOpenChange={setShowBarcodeModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Barcode Scanner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-900 h-64 rounded-lg flex items-center justify-center relative">
              <div className="w-48 h-48 border-4 border-green-500 rounded-lg"></div>
              <div className="absolute inset-0 bg-green-500/10 rounded-lg"></div>
              <span className="absolute text-white text-sm">Position barcode in the frame</span>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Capture
              </Button>
              <Button 
                onClick={() => setShowBarcodeModal(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-500"
              >
                Cancel
              </Button>
            </div>
          </div>
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
    </div>
  );
};

export default CashInEntry;