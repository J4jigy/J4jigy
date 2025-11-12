import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, UserPlus, Shield, Edit2, Trash2, Mail, Phone, Key, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

const StaffManagement