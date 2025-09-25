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
  Barcode
} from 'lucide-react';

const CashOutEntry = ({ onBack }) => {
  const [amount, setAmount] = useState('0');
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
  
  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [darkTheme, setDarkTheme] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [defaultPaymentMode, setDefaultPaymentMode] = useState('Cash');

  // Sample data
  // load slots from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cashout_slots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setSlots(parsed);
          const activeIndex = parseInt(localStorage.getItem('cashout_active') || '0', 10) || 0;
          setActiveSlot(activeIndex);
          setAmount(parsed[activeIndex]?.amount || '0');
        }
      } catch {}
    }
  }, []);

  // persist slots and active slot
  useEffect(() => {
    localStorage.setItem('cashout_slots', JSON.stringify(slots));
    localStorage.setItem('cashout_active', String(activeSlot));
  }, [slots, activeSlot]);

  const quickAmounts = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const products = ['Groceries', 'T-Shirts', 'Rice', 'Wheat', 'Sugar', 'Oil', 'Milk', 'Bread'];
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
  
  const sampleNames = [
    'Aarav Sharma', 'Vivaan Patel', 'Aditya Kumar', 'Vihaan Singh', 'Arjun Gupta',
    'Sai Krishna', 'Reyansh Agarwal', 'Ayaan Shah', 'Krishna Reddy', 'Ishaan Jain',
    'Shaurya Yadav', 'Atharv Mehta', 'Rudra Verma', 'Aadhya Mishra', 'Kiara Nair'
  ];

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
    setAmount('0');
  };

  const resetQuantities = () => {
    setSelectedItems({});
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col max-h-screen overflow-hidden">
      {/* Header - Red theme for Cash Out */}
      <div className="bg-red-500/20 backdrop-blur-sm border-b border-red-500/30 px-4 py-2 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { resetAmount(); onBack(); }}
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
              <div className="text-xs text-slate-400">Vendor</div>
              <div className="text-xs">{selectedCustomer || 'Select...'}</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white justify-start h-auto py-1"
            onClick={() => setShowProductModal(true)}
          >
            <div className="text-left">
              <div className="text-xs text-slate-400">Expenses</div>
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
        <div className="flex gap-1 justify-center flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAmount(quickAmount)}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 rounded-full px-2 py-0.5 text-xs h-5 whitespace-nowrap"
            >
              ₹{quickAmount}
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
                <span className="text-[10px] text-slate-100 mt-0.5">{slot.label}</span>
                {parseFloat(slot.amount) > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-emerald-600 text-white px-1 py-[1px] rounded">
                    ₹{slot.amount}
                  </span>
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

        {/* Scan Barcode Button */}
        <Button
          onClick={() => setShowBarcodeModal(true)}
          variant="outline"
          className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 h-6 text-xs"
        >
          <Barcode className="w-3 h-3 mr-1" />
          Scan Barcode
        </Button>

        {/* Payment Mode Tabs - enlarged buttons, full width across screen */}
        <div className="grid grid-cols-3 gap-2">
          {['Credit', 'Cash', 'Online'].map((mode) => (
            <Button
              key={mode}
              onClick={() => setPaymentMode(mode)}
              className={`w-full h-10 text-xs sm:text-sm rounded-md ${
                paymentMode === mode
                  ? mode === 'Credit' ? 'bg-orange-900 hover:bg-orange-950 ring-1 ring-orange-700' 
                    : mode === 'Cash' ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {mode}
            </Button>
          ))}
        </div>

        {/* Action Buttons - match Cash In sizes */}
        <div className="flex gap-1">
          <Button className="flex-1 bg-red-500 hover:bg-red-600 h-10 text-sm rounded-md">
            Save &amp; Add New
          </Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600 h-10 text-sm rounded-md">
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
              <Button onClick={() => handleCalculatorInput('clear')} className="bg-red-600 hover:bg-red-700 text-white h-10 text-xs font-semibold">C</Button>
              <Button onClick={() => handleCalculatorInput('+')} className="bg-orange-600 hover:bg-orange-700 text-white h-10 text-base font-semibold">+</Button>
              
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
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Select Expenses</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => {
                  setShowProductModal(false);
                  setShowAddProductModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Expense
              </Button>
            </div>
            {products.map((product) => (
              <div key={product} className="flex items-center justify-between">
                <span className="text-white">{product}</span>
                <div className="flex items-center gap-2">
                  <Button onClick={() => decQty(product)} className="bg-slate-600" size="sm">−</Button>
                  <span className="text-white text-sm min-w-[24px] text-center">{selectedItems[product] || 0}</span>
                  <Button onClick={() => incQty(product)} className="bg-red-600 hover:bg-red-700" size="sm">+</Button>
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
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-200">Expense Name</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Enter expense name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200">Amount</Label>
                <Input className="bg-slate-700 border-slate-600 text-white" placeholder="₹0" />
              </div>
              <div>
                <Label className="text-slate-200">Category</Label>
                <Select defaultValue="General">
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200">Measurement</Label>
                <Select value={expenseMeasurement} onValueChange={setExpenseMeasurement}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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
                <Label className="text-slate-200">Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setExpenseQty(q => Math.max(0, q - 1))} className="bg-slate-600" size="sm">−</Button>
                  <span className="text-white text-sm">{expenseQty}</span>
                  <Button onClick={() => setExpenseQty(q => q + 1)} className="bg-slate-600" size="sm">+</Button>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-slate-200">Description</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Enter description" />
            </div>
            <div>
              <Label className="text-slate-200">Reference Number</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Enter reference number" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Scan className="w-4 h-4 mr-2" />
              Add Receipt
            </Button>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              Save Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Modal */}
      <Dialog open={showBarcodeModal} onOpenChange={setShowBarcodeModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Receipt Scanner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-900 h-64 rounded-lg flex items-center justify-center relative">
              <div className="w-48 h-48 border-4 border-red-500 rounded-lg"></div>
              <div className="absolute inset-0 bg-red-500/10 rounded-lg"></div>
              <span className="absolute text-white text-sm">Position receipt in the frame</span>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-red-600 hover:bg-red-700">
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
    </div>
  );
};

export default CashOutEntry;