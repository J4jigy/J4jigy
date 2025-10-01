# Fuel Dispenser Mobile App

A comprehensive React Native mobile application for fuel dispenser management and financial transactions.

## Features

- **Dashboard**: Overview of financial summary with business, finance, and personal tabs
- **Fuel Dispenser Management**: 
  - Grid view of 20 dispensers (D1-D20)
  - Detailed data entry for each dispenser
  - Product management with custom product addition
  - Credit sale tracking with party management
  - Digital payment tracking (HP Pay, Paytm, GPay, PhonePe, etc.)
- **Cash In/Out Entry**: Transaction management with multiple payment modes
- **Multi-Customer POS**: Support for multiple customer slots
- **List Views**: Customers, suppliers, payables, receivables management

## Technology Stack

- **React Native** with Expo
- **React Navigation** for navigation
- **React Native Picker Select** for dropdown selections
- **Expo Vector Icons** for icons
- **React Native Modal** for modal dialogs

## Project Structure

```
mobile/
├── App.js                          # Main app component
├── src/
│   ├── screens/                    # All screen components
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── FuelDispenserScreen.js
│   │   ├── FuelDispenserDetailsScreen.js
│   │   ├── CashInEntryScreen.js
│   │   ├── CashOutEntryScreen.js
│   │   └── ListViewScreen.js
│   ├── components/                 # Reusable components
│   │   └── Modal.js
│   └── styles/                     # Style definitions
│       └── globalStyles.js
├── package.json
├── babel.config.js
└── app.json
```

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   cd mobile
   npm install
   # or
   yarn install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   # or
   yarn start
   ```

3. **Run on Device/Emulator**:
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   ```

## Key Features

### Fuel Dispenser Management
- **Grid Layout**: 4x5 grid of 20 dispensers
- **Product Management**: Default products (Petrol, Diesel, Power Petrol, Turbo Diesel) with ability to add custom products
- **Delete Functionality**: All products deletable with confirmation dialogs
- **Credit Sales**: Party management with vehicle tracking and product selection
- **Digital Payments**: Multiple payment method tracking with auto-calculation
- **Data Entry**: 2-2-1 layout for efficient data input

### Financial Management
- **Cash In/Out**: Complete transaction recording
- **POS System**: Multi-customer slot management
- **Payment Modes**: Cash, Card, UPI, Cheque support
- **Business Categories**: Predefined categories in English and Hindi

### User Interface
- **Dark Theme**: Consistent dark theme across all screens
- **Responsive Design**: Optimized for mobile devices
- **Native Components**: Platform-specific UI elements
- **Modal Dialogs**: Confirmation dialogs for important actions
- **Tab Navigation**: Easy switching between different sections

## Screens Overview

1. **Login Screen**: Simple authentication with username/password
2. **Dashboard**: Financial summary with feature tiles organized by tabs
3. **Fuel Dispenser**: Grid view of dispensers leading to detailed management
4. **Fuel Dispenser Details**: Comprehensive data entry with product and payment tracking
5. **Cash In/Out Entry**: Transaction recording with POS slot management
6. **List View**: Generic list view for customers, suppliers, and financial records

## Customization

- **Colors**: All colors defined in `globalStyles.js` for easy theme customization
- **Layout**: Responsive grid systems and flexible layouts
- **Business Logic**: Modular structure for easy feature additions

## Backend Integration

The app is designed to work with the existing FastAPI backend. Update the API endpoints in the components to connect to your backend server.

## Building for Production

1. **Android**:
   ```bash
   eas build --platform android
   ```

2. **iOS**:
   ```bash
   eas build --platform ios
   ```

## Notes

- All UI designs match the original web application
- Maintains the same functionality and user experience
- Ready for both Android and iOS deployment
- Optimized for mobile touch interactions
- Includes proper error handling and user feedback