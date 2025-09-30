import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ArrowLeft } from 'lucide-react';

const FuelDispenserDetails = () => {
  const navigate = useNavigate();
  const { dispenserId } = useParams();
  
  // State for form data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    time: new Date().toTimeString().slice(0, 5), // Current time in HH:MM format
    product: '',
    productTypes: {
      petrol: '',
      diesel: '',
      powerPetrol: '',
      turboDiesel: '',
      newProduct: ''
    },
    productGrid: Array(5).fill().map(() => Array(5).fill('')), // 5x5 grid of empty strings
    creditSale: '',
    digitalPayments: '', // HP Pay / Paytm / Gpay / Phonepe / Other
    fuelCards: '', // DT Plus / Fleet Card / Xtrapower / Other
    discounts: '',
    expenses: '',
    lubes: '',
    cashOnHand: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          onClick={() => navigate('/fuel-dispenser')}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <h1 className="text-white font-semibold text-base">Dispenser {dispenserId}</h1>
        
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm font-medium">Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm font-medium">Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </CardContent>
            </Card>
          </div>

          {/* Product */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium">Product</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter product amount"
                value={formData.product}
                onChange={(e) => handleInputChange('product', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </CardContent>
          </Card>

          {/* Credit Sale */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium">Credit Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter credit sale amount"
                value={formData.creditSale}
                onChange={(e) => handleInputChange('creditSale', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </CardContent>
          </Card>

          {/* HP Pay / Paytm / Gpay / Phonepe / Other */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium">HP Pay / Paytm / Gpay / Phonepe / Other</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter digital payment amount"
                value={formData.digitalPayments}
                onChange={(e) => handleInputChange('digitalPayments', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
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
              <CardTitle className="text-white text-sm font-medium">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter expenses amount"
                value={formData.expenses}
                onChange={(e) => handleInputChange('expenses', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </CardContent>
          </Card>

          {/* Lubes */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium">Lubes</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter lubes amount"
                value={formData.lubes}
                onChange={(e) => handleInputChange('lubes', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
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
        <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
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
    </div>
  );
};

export default FuelDispenserDetails;