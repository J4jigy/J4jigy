#!/usr/bin/env python3
"""
PayRoll Management Backend API Testing Suite
Tests specifically for payroll management functionality as requested in the review
"""

import requests
import json
import time
from datetime import datetime
import os
import sys

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

API_BASE = f"{BACKEND_URL}/api"
print(f"Testing PayRoll Management backend at: {API_BASE}")

# Test data for admin login as requested
ADMIN_LOGIN_DATA = {
    "username": "admin",
    "password": "admin123"
}

# Global variables for test state
auth_token = None
test_user_id = None

class PayrollTestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.warnings = []
        
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ PASS: {test_name}")
        
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ FAIL: {test_name} - {error}")
        
    def add_warning(self, test_name, warning):
        self.warnings.append(f"{test_name}: {warning}")
        print(f"⚠️  WARNING: {test_name} - {warning}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*80}")
        print(f"PAYROLL MANAGEMENT BACKEND TEST SUMMARY")
        print(f"{'='*80}")
        print(f"✅ PASSED: {self.passed}/{total} tests")
        print(f"❌ FAILED: {self.failed}/{total} tests")
        print(f"⚠️  WARNINGS: {len(self.warnings)} warnings")
        
        if self.errors:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for error in self.errors:
                print(f"  - {error}")
                
        if self.warnings:
            print(f"\n⚠️  WARNINGS:")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        print(f"{'='*80}")
        return len(self.errors) == 0

results = PayrollTestResults()

def make_request(method, endpoint, data=None, headers=None, expected_status=200):
    """Make HTTP request with error handling"""
    url = f"{API_BASE}{endpoint}"
    default_headers = {"Content-Type": "application/json"}
    if headers:
        default_headers.update(headers)
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=default_headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=default_headers, timeout=30)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=default_headers, timeout=30)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=default_headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_admin_authentication():
    """Test admin/admin123 login as specifically requested"""
    print("\n🔍 Testing Admin Authentication (admin/admin123)...")
    global auth_token, test_user_id
    
    response = make_request("POST", "/auth/login", ADMIN_LOGIN_DATA)
    if not response:
        results.add_fail("Admin Authentication", "Request failed - server not responding")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "access_token" in data and "user" in data:
                auth_token = data["access_token"]
                test_user_id = data["user"]["id"]
                user_role = data["user"].get("role", "unknown")
                results.add_pass(f"Admin Authentication (Role: {user_role})")
                print(f"ℹ️  Admin user authenticated successfully with role: {user_role}")
                return True
            else:
                results.add_fail("Admin Authentication", f"Missing required fields in response: {data}")
        except json.JSONDecodeError:
            results.add_fail("Admin Authentication", "Invalid JSON response")
    elif response.status_code == 401:
        results.add_fail("Admin Authentication", "Invalid admin credentials - admin/admin123 not working")
    else:
        results.add_fail("Admin Authentication", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_payroll_api_endpoints():
    """Test for PayRoll Management API endpoints"""
    print("\n🔍 Testing PayRoll Management API Endpoints...")
    
    if not auth_token:
        results.add_fail("PayRoll API Endpoints", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # List of expected payroll endpoints based on the review request
    payroll_endpoints = [
        ("/payroll/salary-structures", "GET", "Salary Structures List"),
        ("/payroll/salary-structures", "POST", "Create Salary Structure"),
        ("/payroll/payments", "GET", "Payment History"),
        ("/payroll/payments", "POST", "Record Payment"),
        ("/payroll/attendance", "GET", "Attendance Records"),
        ("/payroll/attendance", "POST", "Record Attendance"),
        ("/payroll/summary", "GET", "Payroll Summary"),
        ("/staff/payroll", "GET", "Staff Payroll Data"),
        ("/staff/payroll/{staff_id}", "GET", "Individual Staff Payroll"),
    ]
    
    missing_endpoints = []
    existing_endpoints = []
    
    for endpoint, method, description in payroll_endpoints:
        print(f"  Testing {method} {endpoint} ({description})...")
        response = make_request(method, endpoint, headers=headers)
        
        if not response:
            missing_endpoints.append(f"{method} {endpoint} ({description}) - Request failed")
        elif response.status_code == 404:
            missing_endpoints.append(f"{method} {endpoint} ({description}) - Not Found")
        elif response.status_code in [200, 201, 403]:
            # 403 might be expected for some endpoints based on permissions
            existing_endpoints.append(f"{method} {endpoint} ({description})")
            if response.status_code == 403:
                results.add_warning(f"PayRoll API - {description}", "Access denied (403) - check permissions")
        else:
            # Other status codes might indicate the endpoint exists but has issues
            existing_endpoints.append(f"{method} {endpoint} ({description}) - Status: {response.status_code}")
    
    if missing_endpoints:
        results.add_fail("PayRoll API Endpoints", f"Missing critical payroll endpoints: {len(missing_endpoints)}/{len(payroll_endpoints)}")
        print(f"❌ Missing PayRoll Endpoints:")
        for endpoint in missing_endpoints:
            print(f"    - {endpoint}")
    
    if existing_endpoints:
        results.add_pass(f"PayRoll API Endpoints - Found {len(existing_endpoints)} endpoints")
        print(f"✅ Found PayRoll Endpoints:")
        for endpoint in existing_endpoints:
            print(f"    - {endpoint}")
    
    return len(existing_endpoints) > 0

def test_staff_management_apis():
    """Test Staff Management APIs that should support payroll system"""
    print("\n🔍 Testing Staff Management APIs for PayRoll Support...")
    
    if not auth_token:
        results.add_fail("Staff Management APIs", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test staff-related endpoints that should exist for payroll
    staff_endpoints = [
        ("/lists/staff", "GET", "Staff List"),
        ("/contacts", "GET", "Staff Contacts"),
        ("/staff", "GET", "Staff Management"),
        ("/staff/roles", "GET", "Staff Roles"),
        ("/staff/permissions", "GET", "Staff Permissions"),
    ]
    
    working_staff_apis = []
    failed_staff_apis = []
    
    for endpoint, method, description in staff_endpoints:
        print(f"  Testing {method} {endpoint} ({description})...")
        response = make_request(method, endpoint, headers=headers)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                working_staff_apis.append(f"{description}: Working")
                
                # Check if we have staff data
                if endpoint == "/lists/staff":
                    if isinstance(data, dict) and "items" in data:
                        staff_count = len(data["items"])
                        print(f"    ℹ️  Found {staff_count} staff members")
                    elif isinstance(data, list):
                        staff_count = len(data)
                        print(f"    ℹ️  Found {staff_count} staff members")
                        
                elif endpoint == "/contacts":
                    if isinstance(data, list):
                        staff_contacts = [c for c in data if c.get("type") == "staff"]
                        print(f"    ℹ️  Found {len(staff_contacts)} staff contacts")
                        
            except json.JSONDecodeError:
                failed_staff_apis.append(f"{description}: Invalid JSON response")
        elif response and response.status_code == 404:
            failed_staff_apis.append(f"{description}: Not Found (404)")
        elif response and response.status_code == 403:
            results.add_warning(f"Staff API - {description}", "Access denied (403) - check permissions")
        elif not response:
            failed_staff_apis.append(f"{description}: Request failed")
        else:
            failed_staff_apis.append(f"{description}: HTTP {response.status_code}")
    
    if working_staff_apis:
        results.add_pass(f"Staff Management APIs - {len(working_staff_apis)} working")
        for api in working_staff_apis:
            print(f"    ✅ {api}")
    
    if failed_staff_apis:
        results.add_fail("Staff Management APIs", f"{len(failed_staff_apis)} APIs not working")
        for api in failed_staff_apis:
            print(f"    ❌ {api}")
    
    return len(working_staff_apis) > 0

def test_business_context_isolation():
    """Test if payroll data is properly isolated per business"""
    print("\n🔍 Testing Business Context Data Isolation...")
    
    if not auth_token:
        results.add_fail("Business Context Isolation", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test endpoints that should show business-specific data
    business_endpoints = [
        ("/dashboard/summary", "Dashboard Summary"),
        ("/lists/staff", "Staff List"),
        ("/contacts", "Contacts"),
        ("/transactions", "Transactions"),
    ]
    
    business_isolation_working = []
    business_isolation_issues = []
    
    for endpoint, description in business_endpoints:
        print(f"  Testing business isolation for {description}...")
        response = make_request("GET", endpoint, headers=headers)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                
                # Check if data contains user_id or business_id fields indicating isolation
                if isinstance(data, dict):
                    if "items" in data:
                        items = data["items"]
                    elif "transactions" in data:
                        items = data["transactions"]
                    elif "accounts" in data:
                        items = data["accounts"]
                    else:
                        items = [data]
                elif isinstance(data, list):
                    items = data
                else:
                    items = []
                
                has_user_isolation = False
                if items:
                    # Check if items have user_id field
                    sample_item = items[0] if items else {}
                    if "user_id" in sample_item:
                        has_user_isolation = True
                        print(f"    ✅ {description} has user_id isolation")
                    else:
                        print(f"    ⚠️  {description} may not have user isolation")
                
                if has_user_isolation or endpoint == "/dashboard/summary":
                    business_isolation_working.append(description)
                else:
                    business_isolation_issues.append(f"{description}: No user_id field found")
                    
            except json.JSONDecodeError:
                business_isolation_issues.append(f"{description}: Invalid JSON response")
        elif response and response.status_code == 404:
            business_isolation_issues.append(f"{description}: Endpoint not found")
        elif not response:
            business_isolation_issues.append(f"{description}: Request failed")
        else:
            business_isolation_issues.append(f"{description}: HTTP {response.status_code}")
    
    if business_isolation_working:
        results.add_pass(f"Business Context Isolation - {len(business_isolation_working)} endpoints isolated")
    
    if business_isolation_issues:
        results.add_warning("Business Context Isolation", f"{len(business_isolation_issues)} potential issues")
        for issue in business_isolation_issues:
            print(f"    ⚠️  {issue}")
    
    return len(business_isolation_working) > 0

def test_role_based_access_control():
    """Test role-based access control for payroll management"""
    print("\n🔍 Testing Role-based Access Control for PayRoll...")
    
    if not auth_token:
        results.add_fail("Role-based Access Control", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test admin endpoints that should be accessible with admin role
    admin_endpoints = [
        ("/admin/users", "GET", "Admin User Management"),
        ("/admin/invites", "GET", "Admin Invite Management"),
        ("/admin/invites", "POST", "Create Invite Code"),
    ]
    
    # Test payroll management endpoints (if they exist)
    payroll_management_endpoints = [
        ("/payroll/salary-structures", "POST", "Create Salary Structure"),
        ("/payroll/payments", "POST", "Record Payment"),
        ("/staff/roles", "GET", "Staff Roles Management"),
    ]
    
    admin_access_working = []
    admin_access_issues = []
    payroll_access_results = []
    
    # Test admin endpoints
    for endpoint, method, description in admin_endpoints:
        print(f"  Testing admin access to {method} {endpoint}...")
        
        if method == "POST" and "invites" in endpoint:
            # For POST invite, we need some data
            test_data = {"expires_in_days": 30}
        else:
            test_data = None
            
        response = make_request(method, endpoint, test_data, headers=headers)
        
        if response and response.status_code == 200:
            admin_access_working.append(f"{description}: Full access")
        elif response and response.status_code == 403:
            admin_access_issues.append(f"{description}: Access denied (403)")
        elif response and response.status_code == 404:
            admin_access_issues.append(f"{description}: Endpoint not found (404)")
        elif not response:
            admin_access_issues.append(f"{description}: Request failed")
        else:
            admin_access_issues.append(f"{description}: HTTP {response.status_code}")
    
    # Test payroll management endpoints
    for endpoint, method, description in payroll_management_endpoints:
        print(f"  Testing payroll access to {method} {endpoint}...")
        response = make_request(method, endpoint, headers=headers)
        
        if response and response.status_code in [200, 201]:
            payroll_access_results.append(f"{description}: Accessible")
        elif response and response.status_code == 403:
            payroll_access_results.append(f"{description}: Access denied (403)")
        elif response and response.status_code == 404:
            payroll_access_results.append(f"{description}: Not implemented (404)")
        elif not response:
            payroll_access_results.append(f"{description}: Request failed")
        else:
            payroll_access_results.append(f"{description}: HTTP {response.status_code}")
    
    if admin_access_working:
        results.add_pass(f"Role-based Access - Admin access working ({len(admin_access_working)} endpoints)")
        for access in admin_access_working:
            print(f"    ✅ {access}")
    
    if admin_access_issues:
        results.add_fail("Role-based Access - Admin", f"{len(admin_access_issues)} admin access issues")
        for issue in admin_access_issues:
            print(f"    ❌ {issue}")
    
    if payroll_access_results:
        print(f"  PayRoll Management Access Results:")
        for result in payroll_access_results:
            print(f"    ℹ️  {result}")
    
    return len(admin_access_working) > 0

def test_payroll_data_structure():
    """Test if existing data structures support payroll functionality"""
    print("\n🔍 Testing Data Structures for PayRoll Support...")
    
    if not auth_token:
        results.add_fail("PayRoll Data Structure", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Check if staff contacts have fields that could support payroll
    print("  Checking staff contact data structure...")
    response = make_request("GET", "/contacts", headers=headers)
    
    payroll_support_found = []
    payroll_support_missing = []
    
    if response and response.status_code == 200:
        try:
            contacts = response.json()
            staff_contacts = [c for c in contacts if c.get("type") == "staff"]
            
            if staff_contacts:
                sample_staff = staff_contacts[0]
                print(f"    ℹ️  Found {len(staff_contacts)} staff contacts")
                print(f"    ℹ️  Sample staff contact fields: {list(sample_staff.keys())}")
                
                # Check for payroll-relevant fields
                payroll_fields = ["email", "phone", "user_id", "created_at", "id"]
                missing_fields = []
                
                for field in payroll_fields:
                    if field in sample_staff:
                        payroll_support_found.append(f"Staff contacts have {field} field")
                    else:
                        missing_fields.append(field)
                
                if missing_fields:
                    payroll_support_missing.append(f"Staff contacts missing: {', '.join(missing_fields)}")
                    
            else:
                payroll_support_missing.append("No staff contacts found to analyze")
                
        except json.JSONDecodeError:
            payroll_support_missing.append("Invalid JSON response from contacts endpoint")
    else:
        payroll_support_missing.append("Cannot access contacts endpoint")
    
    # Check if transactions could support payroll payments
    print("  Checking transaction data structure for payroll support...")
    response = make_request("GET", "/transactions", headers=headers)
    
    if response and response.status_code == 200:
        try:
            data = response.json()
            transactions = data.get("transactions", [])
            
            if transactions:
                sample_transaction = transactions[0]
                print(f"    ℹ️  Found {len(transactions)} transactions")
                print(f"    ℹ️  Sample transaction fields: {list(sample_transaction.keys())}")
                
                # Check if transactions have fields suitable for payroll
                if "description" in sample_transaction and "amount" in sample_transaction:
                    payroll_support_found.append("Transactions support payroll payments (description, amount)")
                
                if "transaction_type" in sample_transaction:
                    payroll_support_found.append("Transactions have type classification")
                    
            else:
                payroll_support_missing.append("No transactions found to analyze")
                
        except json.JSONDecodeError:
            payroll_support_missing.append("Invalid JSON response from transactions endpoint")
    else:
        payroll_support_missing.append("Cannot access transactions endpoint")
    
    if payroll_support_found:
        results.add_pass(f"PayRoll Data Structure Support - {len(payroll_support_found)} capabilities found")
        for support in payroll_support_found:
            print(f"    ✅ {support}")
    
    if payroll_support_missing:
        results.add_warning("PayRoll Data Structure", f"{len(payroll_support_missing)} limitations found")
        for missing in payroll_support_missing:
            print(f"    ⚠️  {missing}")
    
    return len(payroll_support_found) > 0

def run_payroll_tests():
    """Run all payroll-specific backend tests"""
    print(f"🚀 Starting PayRoll Management Backend API Tests")
    print(f"Backend URL: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Testing as requested: admin/admin123 login and payroll functionality")
    
    # Test sequence - order matters for authentication flow
    tests = [
        test_admin_authentication,
        test_payroll_api_endpoints,
        test_staff_management_apis,
        test_business_context_isolation,
        test_role_based_access_control,
        test_payroll_data_structure,
    ]
    
    for test_func in tests:
        try:
            test_func()
            time.sleep(0.5)  # Brief pause between tests
        except Exception as e:
            results.add_fail(test_func.__name__, f"Test execution error: {e}")
    
    # Final summary
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_payroll_tests()
    sys.exit(0 if success else 1)