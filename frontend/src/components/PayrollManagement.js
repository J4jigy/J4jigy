import React, { useState, useEffect } from 'react';
import { ArrowLeft, IndianRupee, Calendar, Users, Plus, Edit, Trash2, Download, Eye, Calculator, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useRole } from '../contexts/RoleContext';
import { useBusiness } from '../contexts/BusinessContext';

const PayrollManagement = () => {
  const navigate = useNavigate();
  const { hasPermission, businessStaff } = useRole();
  const { activeBusiness, getData, setData } = useBusiness();
  
  const [activeSection, setActiveSection] = useState('overview'); // overview, salary, payments, attendance
  const [showAddSalaryDialog, setShowAddSalaryDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  
  const [salaryForm, setSalaryForm] = useState({
    staffId: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
    paymentType: 'monthly' // monthly, weekly, daily
  });

  const [paymentForm, setPaymentForm] = useState({
    staffId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });

  const [attendanceForm, setAttendanceForm] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present', // present, absent, half_day, late
    checkIn: '',
    checkOut: '',
    notes: ''
  });

  // Load payroll data
  useEffect(() => {
    const businessPayroll = getData('payroll_data', []);
    const businessPayments = getData('payment_history', []);
    const businessAttendance = getData('attendance_data', []);
    setPayrollData(businessPayroll);
    setPaymentHistory(businessPayments);
    setAttendanceData(businessAttendance);
  }, [activeBusiness.id, getData]);

  // Save payroll data
  const savePayrollData = (newPayroll) => {
    setPayrollData(newPayroll);
    setData('payroll_data', newPayroll);
  };

  const savePaymentHistory = (newPayments) => {
    setPaymentHistory(newPayments);
    setData('payment_history', newPayments);
  };

  const saveAttendanceData = (newAttendance) => {
    setAttendanceData(newAttendance);
    setData('attendance_data', newAttendance);
  };

  // Check permissions
  if (!hasPermission('payroll_manage') && !hasPermission('payroll_view')) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/staff')} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-base font-semibold">PayRoll Management</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <IndianRupee className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
              <p className="text-slate-400 mb-4">You don't have permission to access payroll management.</p>
              <p className="text-sm text-slate-500">Contact your business owner for payroll access.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Add salary structure
  const handleAddSalary = () => {
    if (!salaryForm.staffId || !salaryForm.basicSalary) {
      alert('Please fill in required fields');
      return;
    }

    const staff = businessStaff.find(s => s.id === parseInt(salaryForm.staffId));
    if (!staff) return;

    const newSalary = {
      id: Date.now(),
      staffId: parseInt(salaryForm.staffId),
      staffName: staff.name,
      basicSalary: parseFloat(salaryForm.basicSalary),
      allowances: parseFloat(salaryForm.allowances || 0),
      deductions: parseFloat(salaryForm.deductions || 0),
      totalSalary: parseFloat(salaryForm.basicSalary) + parseFloat(salaryForm.allowances || 0) - parseFloat(salaryForm.deductions || 0),
      paymentType: salaryForm.paymentType,
      createdAt: new Date().toISOString()
    };

    const existingIndex = payrollData.findIndex(p => p.staffId === parseInt(salaryForm.staffId));
    let updatedPayroll;
    
    if (existingIndex >= 0) {
      updatedPayroll = [...payrollData];
      updatedPayroll[existingIndex] = newSalary;
    } else {
      updatedPayroll = [...payrollData, newSalary];
    }

    savePayrollData(updatedPayroll);
    setSalaryForm({ staffId: '', basicSalary: '', allowances: '', deductions: '', paymentType: 'monthly' });
    setShowAddSalaryDialog(false);
  };

  // Record payment
  const handleRecordPayment = () => {
    if (!paymentForm.staffId || !paymentForm.amount) {
      alert('Please fill in required fields');
      return;
    }

    const staff = businessStaff.find(s => s.id === parseInt(paymentForm.staffId));
    if (!staff) return;

    const newPayment = {
      id: Date.now(),
      staffId: parseInt(paymentForm.staffId),
      staffName: staff.name,
      amount: parseFloat(paymentForm.amount),
      paymentDate: paymentForm.paymentDate,
      paymentMethod: paymentForm.paymentMethod,
      notes: paymentForm.notes,
      recordedAt: new Date().toISOString()
    };

    const updatedPayments = [...paymentHistory, newPayment];
    savePaymentHistory(updatedPayments);
    setPaymentForm({ 
      staffId: '', 
      amount: '', 
      paymentDate: new Date().toISOString().split('T')[0], 
      paymentMethod: 'cash', 
      notes: '' 
    });
    setShowPaymentDialog(false);
  };

  // Calculate total monthly payroll
  const totalMonthlyPayroll = payrollData
    .filter(p => p.paymentType === 'monthly')
    .reduce((sum, p) => sum + p.totalSalary, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/staff')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-base font-semibold">PayRoll Management</h1>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Payroll Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{payrollData.length}</div>
              <div className="text-sm text-slate-400">Staff on Payroll</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">₹{totalMonthlyPayroll.toLocaleString()}</div>
              <div className="text-sm text-slate-400">Monthly Payroll</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{paymentHistory.length}</div>
              <div className="text-sm text-slate-400">Payments Made</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Calculator className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                ₹{paymentHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Total Paid</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {hasPermission('payroll_manage') && (
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddSalaryDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Salary Structure
            </Button>
            <Button
              onClick={() => setShowPaymentDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        )}

        {/* Salary Structures */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Salary Structures</CardTitle>
          </CardHeader>
          <CardContent>
            {payrollData.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No salary structures configured</p>
                {hasPermission('payroll_manage') && (
                  <Button
                    onClick={() => setShowAddSalaryDialog(true)}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    Add First Salary Structure
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {payrollData.map((salary) => (
                  <div key={salary.id} className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{salary.staffName}</h4>
                        <p className="text-sm text-slate-400">Basic: ₹{salary.basicSalary.toLocaleString()}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-green-400">+₹{salary.allowances}</span>
                          <span className="text-xs text-red-400">-₹{salary.deductions}</span>
                          <Badge className="bg-blue-600 text-white text-xs">
                            {salary.paymentType}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ₹{salary.totalSalary.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-400">Total</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.slice(-5).reverse().map((payment) => (
                  <div key={payment.id} className="p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-white">{payment.staffName}</h5>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>{payment.paymentDate}</span>
                          <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                            {payment.paymentMethod}
                          </Badge>
                        </div>
                        {payment.notes && (
                          <p className="text-xs text-slate-500 mt-1">{payment.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">₹{payment.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Salary Dialog */}
        <Dialog open={showAddSalaryDialog} onOpenChange={setShowAddSalaryDialog}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add Salary Structure</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Staff Member</Label>
                <Select value={salaryForm.staffId} onValueChange={(value) => setSalaryForm(prev => ({ ...prev, staffId: value }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">Basic Salary *</Label>
                  <Input
                    type="number"
                    placeholder="25000"
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm(prev => ({ ...prev, basicSalary: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Payment Type</Label>
                  <Select value={salaryForm.paymentType} onValueChange={(value) => setSalaryForm(prev => ({ ...prev, paymentType: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">Allowances</Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={salaryForm.allowances}
                    onChange={(e) => setSalaryForm(prev => ({ ...prev, allowances: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Deductions</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={salaryForm.deductions}
                    onChange={(e) => setSalaryForm(prev => ({ ...prev, deductions: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddSalaryDialog(false)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSalary}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Add Salary Structure
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Staff Member</Label>
                <Select value={paymentForm.staffId} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, staffId: value }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">Amount *</Label>
                  <Input
                    type="number"
                    placeholder="25000"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Payment Date</Label>
                  <Input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Payment Method</Label>
                <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Notes (Optional)</Label>
                <Input
                  placeholder="Monthly salary payment..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPaymentDialog(false)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecordPayment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Record Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PayrollManagement;