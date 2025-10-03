import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, Plus, X } from 'lucide-react';

const FuelDispenserDetails = () => {
  const navigate = useNavigate();
  const { dispenserId } = useParams();
  
  // State for form data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    time: new Date().toTimeString().slice(0, 5), // Current time in HH:MM format
    product: '',
    productTypes: {},
    customProducts: [], // Empty - no default products
    creditSale: '',
    digitalPayments: '', // HP Pay / Paytm / Gpay / Phonepe / Other
    fuelCards: '', // DT Plus / Fleet Card / Xtrapower / Other
    discounts: '',
    expenses: '',
    lubes: '',
    cashOnHand: ''
  });

  // State for add product modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  // State for add party modal
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [newPartyData, setNewPartyData] = useState({
    partyName: '',
    vehicleNo: ''
  });

  // State for add payment modal
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  // State for available parties (for dropdowns)
  const [availableParties, setAvailableParties] = useState([]);

  // State for credit sale parties
  const [creditSaleParties, setCreditSaleParties] = useState([]); // Empty - no default credit sales

  // State for digital payment methods
  const [digitalPayments, setDigitalPayments] = useState([]); // Empty - no default payment methods

  // State for expense entries
  const [expenseEntries, setExpenseEntries] = useState([]); // Empty - no default expenses

  // State for lube entries
  const [lubeEntries, setLubeEntries] = useState([]); // Empty - no default lubes

  // State for add lube modal
  const [showAddLubeModal, setShowAddLubeModal] = useState(false);
  const [newLubeData, setNewLubeData] = useState({
    lubeName: '',
    quantity: '',
    rate: ''
  });

  // State for delete confirmation modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState({
    type: '', // 'product', 'party', 'payment', 'expense', or 'lube'
    index: null,
    name: ''
  });

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

  const cancelAddProduct = () => {
    setNewProductName('');
    setShowAddProductModal(false);
  };

  const addNewParty = () => {
    setShowAddPartyModal(true);
  };

  const saveNewParty = () => {
    if (newPartyData.partyName.trim() && newPartyData.vehicleNo.trim()) {
      // Add to available parties for dropdowns
      const newParty = {
        id: Date.now(),
        partyName: newPartyData.partyName.trim(),
        vehicleNo: newPartyData.vehicleNo.trim()
      };
      
      setAvailableParties(prev => [...prev, newParty]);
      
      // Add to credit sale parties
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

  const cancelAddParty = () => {
    setNewPartyData({ partyName: '', vehicleNo: '' });
    setShowAddPartyModal(false);
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

  const cancelAddPayment = () => {
    setNewPaymentMethod('');
    setShowAddPaymentModal(false);
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

  const handleCreditSalePartyChange = (index, field, value) => {
    setCreditSaleParties(prev => {
      const newParties = [...prev];
      newParties[index] = {
        ...newParties[index],
        [field]: value
      };
      return newParties;
    });
  };

  const handleDigitalPaymentChange = (index, field, value) => {
    setDigitalPayments(prev => {
      const newPayments = [...prev];
      newPayments[index] = {
        ...newPayments[index],
        [field]: value
      };
      return newPayments;
    });
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

  const confirmDelete = () => {
    if (deleteAction.type === 'product') {
      setFormData(prev => ({
        ...prev,
        customProducts: prev.customProducts.filter((_, i) => i !== deleteAction.index)
      }));
    } else if (deleteAction.type === 'party') {
      setCreditSaleParties(prev => prev.filter((_, i) => i !== deleteAction.index));
    } else if (deleteAction.type === 'payment') {
      setDigitalPayments(prev => prev.filter((_, i) => i !== deleteAction.index));
    } else if (deleteAction.type === 'expense') {
      setExpenseEntries(prev => prev.filter((_, i) => i !== deleteAction.index));
    } else if (deleteAction.type === 'lube') {
      setLubeEntries(prev => prev.filter((_, i) => i !== deleteAction.index));
    }
    
    setShowDeleteConfirmModal(false);
    setDeleteAction({ type: '', index: null, name: '' });
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setDeleteAction({ type: '', index: null, name: '' });
  };

  // Expense management functions
  const addNewExpense = () => {
    const newExpense = {
      id: Date.now() + Math.random(),
      expenseName: '',
      amount: ''
    };
    setExpenseEntries(prev => [...prev, newExpense]);
  };

  const handleExpenseChange = (index, field, value) => {
    setExpenseEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeExpense = (index) => {
    const expense = expenseEntries[index];
    setDeleteAction({
      type: 'expense',
      index: index,
      name: expense.expenseName || 'Expense Entry'
    });
    setShowDeleteConfirmModal(true);
  };

  const calculateTotalExpenses = () => {
    return expenseEntries.reduce((sum, expense) => 
      sum + parseFloat(expense.amount || 0), 0
    ).toFixed(2);
  };

  // Lube management functions
  const addNewLube = () => {
    setShowAddLubeModal(true);
  };

  const saveNewLube = () => {
    if (newLubeData.lubeName.trim()) {
      const newLube = {
        id: Date.now() + Math.random(),
        lubeName: newLubeData.lubeName.trim(),
        quantity: newLubeData.quantity,
        rate: newLubeData.rate
      };
      
      setLubeEntries(prev => [...prev, newLube]);
      setNewLubeData({ lubeName: '', quantity: '', rate: '' });
      setShowAddLubeModal(false);
    }
  };

  const cancelAddLube = () => {
    setNewLubeData({ lubeName: '', quantity: '', rate: '' });
    setShowAddLubeModal(false);
  };

  const handleLubeChange = (index, field, value) => {
    setLubeEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeLube = (index) => {
    const lube = lubeEntries[index];
    setDeleteAction({
      type: 'lube',
      index: index,
      name: lube.lubeName || 'Lube Entry'
    });
    setShowDeleteConfirmModal(true);
  };

  const calculateTotalLubes = () => {
    return lubeEntries.reduce((sum, lube) => 
      sum + parseFloat(lube.rate || 0), 0
    ).toFixed(2);
  };

  const handleConfirmAndSave = () => {
    // Handle confirm and save logic here
    console.log('Confirming and saving data for dispenser', dispenserId, formData);
    // You can add API call here
    navigate('/fuel-dispenser');
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving data for dispenser', dispenserId, formData);
    // You can add API call here
    navigate('/fuel-dispenser');
  };

  const handleEdit = () => {
    // Handle edit logic here
    console.log('Edit mode for dispenser', dispenserId);
  };

  const handleCancel = () => {
    // Navigate back to fuel dispenser page
    navigate('/fuel-dispenser');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            console.log('FuelDispenserDetails back arrow clicked - navigating to Fuel Dispenser screen');
            navigate('/fuel-dispenser');
          }}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <h1 className="text-white font-semibold text-base">Dispenser {dispenserId}</h1>
        
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">Date</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white h-8"
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">Time</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white h-8"
                />
              </CardContent>
            </Card>
          </div>

          {/* Product Section with Types */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center justify-between">
                Product
                <Button
                  type="button"
                  onClick={addNewProduct}
                  className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Product
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Custom Products */}
                {formData.customProducts.map((product, index) => (
                  <div key={index} className="relative border border-slate-600 rounded-lg p-4">
                    <Button
                      type="button"
                      onClick={() => removeCustomProduct(index)}
                      variant="outline"
                      className="absolute -top-2 -right-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-6 w-6 p-0 bg-slate-800 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="mb-3">
                      <h3 className="text-white text-sm font-medium">{product.name}</h3>
                    </div>
                    <div className="space-y-3">
                      {/* First row - 2 boxes */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Opening Meter</label>
                          <Input
                            type="number"
                            placeholder="Opening"
                            value={product.openingMeter}
                            onChange={(e) => handleCustomProductChange(index, 'openingMeter', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Closing Meter</label>
                          <Input
                            type="number"
                            placeholder="Closing"
                            value={product.closingMeter}
                            onChange={(e) => handleCustomProductChange(index, 'closingMeter', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                      </div>
                      {/* Second row - 2 boxes */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Total Sales In Ltr</label>
                          <Input
                            type="number"
                            placeholder="Total Sales In Ltr"
                            value={product.totalSale}
                            onChange={(e) => handleCustomProductChange(index, 'totalSale', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Rate</label>
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={product.rate}
                            onChange={(e) => handleCustomProductChange(index, 'rate', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                      </div>
                      {/* Third row - 1 box */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Total Sales Amount</label>
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={product.totalSalesAmount}
                            onChange={(e) => handleCustomProductChange(index, 'totalSalesAmount', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                        <div></div> {/* Empty space */}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Plus icon to add more products instantly */}
                <div className="flex justify-center pt-3 mt-3 border-t border-slate-600">
                  <Button
                    type="button"
                    onClick={addNewProduct}
                    variant="ghost"
                    className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 px-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="text-sm">Add More Product</span>
                  </Button>
                </div>

                {/* Total Sales Amount Summary - Always at bottom */}
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <h3 className="text-white text-sm font-medium mb-3">Total Sales Amount</h3>
                  <div className="w-full">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Total Sales Amount</label>
                      <Input
                        type="number"
                        placeholder="Total Amount"
                        value={
                          (formData.customProducts.reduce((sum, product) => sum + parseFloat(product.totalSalesAmount || 0), 0)).toFixed(2)
                        }
                        readOnly
                        className="bg-slate-600 border-slate-500 text-white h-8 font-medium w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Sale */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center justify-between">
                Credit Sale
                <Button
                  type="button"
                  onClick={addNewParty}
                  className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add New Party
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Credit Sale Parties */}
                {creditSaleParties.map((party, index) => (
                  <div key={party.id} className="relative border border-slate-600 rounded-lg p-4">
                    <Button
                      type="button"
                      onClick={() => removeCreditSaleParty(index)}
                      variant="outline"
                      className="absolute -top-2 -right-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-6 w-6 p-0 bg-slate-800 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="mb-3">
                      <h3 className="text-white text-sm font-medium">
                        {party.partyName && party.vehicleNo 
                          ? `Party: ${party.partyName} - ${party.vehicleNo}` 
                          : 'Credit Sale Entry'
                        }
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {/* First row - 2 boxes */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Party Name</label>
                          <select
                            value={party.partyName}
                            onChange={(e) => handleCreditSalePartyChange(index, 'partyName', e.target.value)}
                            className="bg-slate-700 border border-slate-600 text-white h-8 w-full rounded px-2 text-sm"
                          >
                            <option value="">Select Party</option>
                            {availableParties.map((availableParty) => (
                              <option key={availableParty.id} value={availableParty.partyName}>
                                {availableParty.partyName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Vehicle No</label>
                          <select
                            value={party.vehicleNo}
                            onChange={(e) => handleCreditSalePartyChange(index, 'vehicleNo', e.target.value)}
                            className="bg-slate-700 border border-slate-600 text-white h-8 w-full rounded px-2 text-sm"
                          >
                            <option value="">Select Vehicle</option>
                            {availableParties.map((availableParty) => (
                              <option key={availableParty.id} value={availableParty.vehicleNo}>
                                {availableParty.vehicleNo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Second row - 2 boxes */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Product Selection</label>
                          <select
                            value={party.productSelection}
                            onChange={(e) => handleCreditSalePartyChange(index, 'productSelection', e.target.value)}
                            className="bg-slate-700 border border-slate-600 text-white h-8 w-full rounded px-2 text-sm"
                          >
                            <option value="">Select Product</option>
                            {formData.customProducts.map((product, productIndex) => (
                              <option key={productIndex} value={product.name}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Ltr</label>
                          <Input
                            type="number"
                            placeholder="Litres"
                            value={party.ltr}
                            onChange={(e) => handleCreditSalePartyChange(index, 'ltr', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                      </div>
                      {/* Third row - 2 boxes */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Rate</label>
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={party.rate}
                            onChange={(e) => handleCreditSalePartyChange(index, 'rate', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Total Credit Sales Amount</label>
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={party.totalCreditSalesAmount}
                            onChange={(e) => handleCreditSalePartyChange(index, 'totalCreditSalesAmount', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Credit Sales Amount Summary - Always at bottom */}
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <h3 className="text-white text-sm font-medium mb-3">Total Credit Sales Amount</h3>
                  <div className="w-full">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Total Credit Sales Amount</label>
                      <Input
                        type="number"
                        placeholder="Total Amount"
                        value={
                          (creditSaleParties.reduce((sum, party) => sum + parseFloat(party.totalCreditSalesAmount || 0), 0)).toFixed(2)
                        }
                        readOnly
                        className="bg-slate-600 border-slate-500 text-white h-8 font-medium w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HP Pay / Paytm / Gpay / Phonepe / Other */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center justify-between">
                HP Pay / Paytm / Gpay / Phonepe / Other
                <Button
                  type="button"
                  onClick={addNewPayment}
                  className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Payment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Digital Payment Methods */}
                {digitalPayments.map((payment, index) => (
                  <div key={payment.id} className="relative border border-slate-600 rounded-lg p-4">
                    <Button
                      type="button"
                      onClick={() => removeDigitalPayment(index)}
                      variant="outline"
                      className="absolute -top-2 -right-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-6 w-6 p-0 bg-slate-800 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="mb-3">
                      <h3 className="text-white text-sm font-medium">{payment.method}</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">Amount</label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={payment.amount}
                          onChange={(e) => handleDigitalPaymentChange(index, 'amount', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white h-8"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Online Amount Summary - Always at bottom */}
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <h3 className="text-white text-sm font-medium mb-3">Total Online Amount</h3>
                  <div className="w-full">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Total Online Amount</label>
                      <Input
                        type="number"
                        placeholder="Total Amount"
                        value={
                          (digitalPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)).toFixed(2)
                        }
                        readOnly
                        className="bg-slate-600 border-slate-500 text-white h-8 font-medium w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DT Plus / Fleet Card / Xtrapower / Other */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium">DT Plus / Fleet Card / Xtrapower / Other</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter fuel card amount"
                value={formData.fuelCards}
                onChange={(e) => handleInputChange('fuelCards', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </CardContent>
          </Card>

          {/* Discounts */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium">Discounts</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter discounts amount"
                value={formData.discounts}
                onChange={(e) => handleInputChange('discounts', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center justify-between">
                Expenses
                <Button
                  type="button"
                  onClick={addNewExpense}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-3"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Expenses
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Expense Entries */}
                {expenseEntries.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-4xl mb-2">💰</div>
                    <div className="text-sm">No expense entries</div>
                    <div className="text-xs mt-1">Click "Add Expenses" to get started</div>
                  </div>
                ) : (
                  expenseEntries.map((expense, index) => (
                    <div key={expense.id} className="relative border border-slate-600 rounded-lg p-4">
                      <Button
                        type="button"
                        onClick={() => removeExpense(index)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 p-0 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="mb-3">
                        <h3 className="text-white text-sm font-medium">
                          {expense.expenseName ? `Expense ${index + 1}: ${expense.expenseName}` : `Expense ${index + 1}`}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Text</label>
                          <Input
                            type="text"
                            placeholder="Enter expense name"
                            value={expense.expenseName}
                            onChange={(e) => handleExpenseChange(index, 'expenseName', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Amount</label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={expense.amount}
                            onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-8"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Total Expenses Amount - only show if there are expenses */}
                {expenseEntries.length > 0 && (
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white text-sm font-medium">Total Expenses Amount</h3>
                      <div className="text-white font-bold text-lg">
                        ₹{calculateTotalExpenses()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lubes */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center justify-between">
                Lubes
                <Button
                  type="button"
                  onClick={() => addNewLube()}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-3"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Lubes
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Lube Entries */}
                {lubeEntries.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-4xl mb-2">🛢️</div>
                    <div className="text-sm">No lube entries</div>
                    <div className="text-xs mt-1">Click "Add Lubes" to get started</div>
                  </div>
                ) : (
                  lubeEntries.map((lube, index) => (
                    <div key={lube.id} className="relative border border-slate-600 rounded-lg p-4">
                      <Button
                        type="button"
                        onClick={() => removeLube(index)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 p-0 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="mb-3">
                        <h3 className="text-white text-sm font-medium">
                          {lube.lubeName ? `Lube ${index + 1}: ${lube.lubeName}` : `Lube Entry ${index + 1}`}
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-400 text-xs mb-1 block">Lube</label>
                            <Input
                              type="text"
                              placeholder="Lube name"
                              value={lube.lubeName}
                              onChange={(e) => handleLubeChange(index, 'lubeName', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white h-8"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 text-xs mb-1 block">Ltr/ml</label>
                            <Input
                              type="text"
                              placeholder="Enter quantity"
                              value={lube.quantity}
                              onChange={(e) => handleLubeChange(index, 'quantity', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white h-8"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1">
                          <div>
                            <label className="text-slate-400 text-xs mb-1 block">Rate</label>
                            <Input
                              type="number"
                              placeholder="Enter rate"
                              value={lube.rate}
                              onChange={(e) => handleLubeChange(index, 'rate', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white h-8"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Plus icon removed - using modal instead */}
                    </div>
                  ))
                )}
                
                {/* Total Lubes Amount - only show if there are lubes */}
                {lubeEntries.length > 0 && (
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white text-sm font-medium">Total Lubes Amount</h3>
                      <div className="text-white font-bold text-lg">
                        ₹{calculateTotalLubes()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cash on Hand */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium">Cash on Hand</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter cash on hand amount"
                value={formData.cashOnHand}
                onChange={(e) => handleInputChange('cashOnHand', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="p-4 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-3 max-w-6xl mx-auto">
          <Button
            onClick={handleConfirmAndSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm & Save
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Save
          </Button>
          <Button
            onClick={handleEdit}
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            Edit
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Add New Payment Modal */}
      <Dialog open={showAddPaymentModal} onOpenChange={setShowAddPaymentModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-slate-200 text-sm font-medium mb-2 block">Payment Method</label>
              <Input
                type="text"
                placeholder="Enter payment method (e.g., Gpay, PhonePe, Other)"
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveNewPayment();
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={saveNewPayment}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newPaymentMethod.trim()}
              >
                Save
              </Button>
              <Button
                onClick={cancelAddPayment}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Party Modal */}
      <Dialog open={showAddPartyModal} onOpenChange={setShowAddPartyModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Party</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-slate-200 text-sm font-medium mb-2 block">Party Name</label>
              <Input
                type="text"
                placeholder="Enter party name"
                value={newPartyData.partyName}
                onChange={(e) => setNewPartyData(prev => ({ ...prev, partyName: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-slate-200 text-sm font-medium mb-2 block">Vehicle No</label>
              <Input
                type="text"
                placeholder="Enter vehicle number"
                value={newPartyData.vehicleNo}
                onChange={(e) => setNewPartyData(prev => ({ ...prev, vehicleNo: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveNewParty();
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={saveNewParty}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newPartyData.partyName.trim() || !newPartyData.vehicleNo.trim()}
              >
                Save
              </Button>
              <Button
                onClick={cancelAddParty}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-slate-200 text-sm font-medium mb-2 block">Product Name</label>
              <Input
                type="text"
                placeholder="Enter product name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveNewProduct();
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={saveNewProduct}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newProductName.trim()}
              >
                Save
              </Button>
              <Button
                onClick={cancelAddProduct}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Lube Modal */}
      <Dialog open={showAddLubeModal} onOpenChange={setShowAddLubeModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Lube</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Lubes</label>
              <Input
                type="text"
                placeholder="Enter lube name"
                value={newLubeData.lubeName}
                onChange={(e) => setNewLubeData(prev => ({...prev, lubeName: e.target.value}))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">LTR/ml</label>
              <Input
                type="text"
                placeholder="Enter quantity (e.g., 5L, 500ml)"
                value={newLubeData.quantity}
                onChange={(e) => setNewLubeData(prev => ({...prev, quantity: e.target.value}))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Rate</label>
              <Input
                type="number"
                placeholder="Enter rate amount"
                value={newLubeData.rate}
                onChange={(e) => setNewLubeData(prev => ({...prev, rate: e.target.value}))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              onClick={cancelAddLube}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveNewLube}
              disabled={!newLubeData.lubeName.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add Lube
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-200">
              Are you sure you want to delete "{deleteAction.name}"?
            </p>
            <p className="text-slate-400 text-sm">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
              <Button
                onClick={cancelDelete}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
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

export default FuelDispenserDetails;