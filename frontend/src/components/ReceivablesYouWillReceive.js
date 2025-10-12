import React, { useState } from 'react';
import { ArrowLeft, Download, Search, Plus, Phone, Mail, TrendingUp, AlertCircle, Clock, DollarSign, Filter, Users, BarChart3, PieChart, Calendar, Star, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useBusiness } from '../contexts/BusinessContext';

export default function ReceivablesYouWillReceive() {
  return (
    <div className="h-screen bg-white">
      {/* Completely empty - no header, no content, nothing */}
    </div>
  );
}