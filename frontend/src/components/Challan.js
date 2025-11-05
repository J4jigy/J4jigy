import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Truck, Package, DollarSign, Calendar, User, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const Challan = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState(null);

  // Challan sub-sections
  const challanSections = [
    {
      id: 'delivery',
      name: 'Delivery Challan',
      subtitle: 'Goods Dispatch',
      icon: Truck,
      color: 'bg-blue-500',
      description: 'Track goods dispatched to customers'
    },
    {
      id: 'purchase',
      name: 'Purchase Challan',
      subtitle: 'Goods Received',
      icon: Package,
      color: 'bg-green-500',
      description: 'Record goods received from suppliers'
    },
    {
      id: 'payment',
      name: 'Payment Challan',
      subtitle: 'Tax & Payments',
      icon: DollarSign,
      color: 'bg-purple-500',
      description: 'Manage tax payments and challans'
    },
    {
      id: 'gate',
      name: 'Gate Pass',
      subtitle: 'Entry/Exit',
      icon: Building,
      color: 'bg-orange-500',
      description: 'Issue gate passes for material movement'
    }
  ];

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className="text-slate-300 hover:text-white p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold">Challan Management</h1>
        </div>
      </div>

      {/* Main Content */}
      {!selectedSection ? (
        <>
          {/* Overview Section */}
          <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold mb-2 text-cyan-400">About Challans</h2>
            <p className="text-slate-300 text-sm">
              Manage all types of challans including delivery challans for goods dispatch, 
              purchase challans for goods received, payment challans for taxes, and gate passes 
              for material movement. Keep track of all documentation efficiently.
            </p>
          </div>

          {/* Challan Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {challanSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.id}
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
                  onClick={() => handleSectionClick(section)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`${section.color} p-3 rounded-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {section.name}
                        </h3>
                        <p className="text-sm text-cyan-400 mb-2">
                          {section.subtitle}
                        </p>
                        <p className="text-sm text-slate-400">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400 mb-1">Total Challans</div>
                <div className="text-2xl font-bold text-white">0</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400 mb-1">Pending</div>
                <div className="text-2xl font-bold text-yellow-400">0</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400 mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-400">0</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400 mb-1">This Month</div>
                <div className="text-2xl font-bold text-cyan-400">0</div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Section Detail View */}
          <Button
            onClick={() => setSelectedSection(null)}
            variant="ghost"
            className="mb-4 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challans
          </Button>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className={`${selectedSection.color} p-2 rounded-lg`}>
                  {React.createElement(selectedSection.icon, { className: 'w-6 h-6 text-white' })}
                </div>
                {selectedSection.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-300">{selectedSection.description}</p>
                
                {/* Coming Soon Message */}
                <div className="mt-8 p-8 bg-slate-700/50 rounded-lg text-center">
                  <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedSection.name} - Coming Soon
                  </h3>
                  <p className="text-slate-400">
                    This feature is under development. You'll be able to create, manage, 
                    and track {selectedSection.name.toLowerCase()}s here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Challan;
