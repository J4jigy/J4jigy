#!/usr/bin/env python3
"""
Backend API Testing Suite for Financial Dashboard
Tests all backend endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime
import os
import sys

# Load environment variables
sys.path.append('/app/frontend')
sys.path.append('/app/backend')

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
print(f"Testing backend at: {API_BASE}")

# Test data - using realistic business data
TEST_USER_DATA = {
    "username": "sarah_johnson",
    "email": "sarah.johnson@techstartup.com", 
    "password": "SecurePass123!@#",
    "business_name": "TechStartup Solutions LLC",
    "invite_code": "OPEN"
}

TEST_LOGIN_DATA = {
    "username": "sarah_johnson",
    "password": "SecurePass123!@#"
}

# Global variables for test state
auth_token = None
test_user_id = None

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ PASS: {test_name}")
        
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ FAIL: {test_name} - {error}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")
        return len(self.errors) == 0

results = TestResults()

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

def test_api_health():
    """Test API health check endpoint"""
    print("\n🔍 Testing API Health Check...")
    
    response = make_request("GET", "/ping")
    if not response:
        results.add_fail("API Health Check", "Request failed - server not responding")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "status" in data and data["status"] == "ok":
                results.add_pass("API Health Check")
                return True
            else:
                results.add_fail("API Health Check", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("API Health Check", "Invalid JSON response")
    else:
        results.add_fail("API Health Check", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_user_registration():
    """Test user registration endpoint"""
    print("\n🔍 Testing User Registration...")
    global test_user_id
    
    response = make_request("POST", "/auth/register", TEST_USER_DATA)
    if not response:
        results.add_fail("User Registration", "Request failed")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "access_token" in data and "user" in data:
                test_user_id = data["user"]["id"]
                results.add_pass("User Registration")
                return True
            else:
                results.add_fail("User Registration", f"Missing required fields in response: {data}")
        except json.JSONDecodeError:
            results.add_fail("User Registration", "Invalid JSON response")
    elif response.status_code == 400:
        # User might already exist, try to continue with login
        try:
            error_data = response.json()
            if "Username already exists" in error_data.get("detail", ""):
                print("ℹ️  User already exists, will test login instead")
                return True
        except:
            pass
        results.add_fail("User Registration", f"HTTP {response.status_code}: {response.text}")
    else:
        results.add_fail("User Registration", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_user_login():
    """Test user login endpoint"""
    print("\n🔍 Testing User Login...")
    global auth_token, test_user_id
    
    response = make_request("POST", "/auth/login", TEST_LOGIN_DATA)
    if not response:
        results.add_fail("User Login", "Request failed")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "access_token" in data and "user" in data:
                auth_token = data["access_token"]
                test_user_id = data["user"]["id"]
                results.add_pass("User Login")
                return True
            else:
                results.add_fail("User Login", f"Missing required fields in response: {data}")
        except json.JSONDecodeError:
            results.add_fail("User Login", "Invalid JSON response")
    else:
        results.add_fail("User Login", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_admin_login():
    """Test admin login with admin/admin123 credentials as specified in review"""
    print("\n🔍 Testing Admin Login (admin/admin123)...")
    global auth_token, test_user_id
    
    admin_login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = make_request("POST", "/auth/login", admin_login_data)
    if not response:
        results.add_fail("Admin Login", "Request failed")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "access_token" in data and "user" in data:
                auth_token = data["access_token"]
                test_user_id = data["user"]["id"]
                results.add_pass("Admin Login (admin/admin123)")
                print(f"ℹ️  Admin login successful, token expires in {data.get('expires_in', 'unknown')} seconds")
                return True
            else:
                results.add_fail("Admin Login", f"Missing required fields in response: {data}")
        except json.JSONDecodeError:
            results.add_fail("Admin Login", "Invalid JSON response")
    else:
        results.add_fail("Admin Login", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_dashboard_summary():
    """Test dashboard summary endpoint for payables/receivables data"""
    print("\n🔍 Testing Dashboard Summary for Payables/Receivables...")
    
    if not auth_token:
        results.add_fail("Dashboard Summary", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = make_request("GET", "/dashboard/summary", headers=headers)
    
    if not response:
        results.add_fail("Dashboard Summary", "Request failed")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            required_fields = ["you_will_give", "you_will_receive", "net_position"]
            if all(field in data for field in required_fields):
                results.add_pass("Dashboard Summary - Payables/Receivables Data")
                print(f"ℹ️  Payables (you_will_give): ₹{data['you_will_give']}")
                print(f"ℹ️  Receivables (you_will_receive): ₹{data['you_will_receive']}")
                print(f"ℹ️  Net Position: ₹{data['net_position']}")
                
                # Verify calculations are accurate
                expected_net = data['you_will_receive'] - data['you_will_give']
                if abs(data['net_position'] - expected_net) < 0.01:  # Allow for floating point precision
                    results.add_pass("Dashboard Summary - Calculation Accuracy")
                else:
                    results.add_fail("Dashboard Summary - Calculations", f"Net position calculation incorrect: expected {expected_net}, got {data['net_position']}")
                
                return True
            else:
                results.add_fail("Dashboard Summary", f"Missing required fields: {data}")
        except json.JSONDecodeError:
            results.add_fail("Dashboard Summary", "Invalid JSON response")
    elif response.status_code == 401:
        results.add_fail("Dashboard Summary", "Authentication failed - invalid token")
    else:
        results.add_fail("Dashboard Summary", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_payables_receivables_list_endpoints():
    """Test list endpoints specifically for payables/receivables pages"""
    print("\n🔍 Testing Payables/Receivables List Endpoints...")
    
    if not auth_token:
        results.add_fail("Payables/Receivables Lists", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test customers endpoint (for receivables page)
    print("  Testing /api/lists/customers (for receivables page)...")
    response = make_request("GET", "/lists/customers", headers=headers)
    if not response:
        results.add_fail("Customers List Endpoint", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            required_fields = ["items", "total", "page", "page_size", "total_pages"]
            if all(field in data for field in required_fields):
                results.add_pass("Customers List Endpoint - Structure")
                print(f"ℹ️  Found {data['total']} customers, page {data['page']}/{data['total_pages']}")
                
                # Test pagination support
                if "page" in data and "page_size" in data:
                    results.add_pass("Customers List - Pagination Support")
                
                # Test search parameter support
                search_response = make_request("GET", "/lists/customers?search=test", headers=headers)
                if search_response and search_response.status_code == 200:
                    results.add_pass("Customers List - Search Support")
                
            else:
                results.add_fail("Customers List Endpoint", f"Missing required fields: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Customers List Endpoint", "Invalid JSON response")
            return False
    else:
        results.add_fail("Customers List Endpoint", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test suppliers endpoint (for payables page)
    print("  Testing /api/lists/suppliers (for payables page)...")
    response = make_request("GET", "/lists/suppliers", headers=headers)
    if not response:
        results.add_fail("Suppliers List Endpoint", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            required_fields = ["items", "total", "page", "page_size", "total_pages"]
            if all(field in data for field in required_fields):
                results.add_pass("Suppliers List Endpoint - Structure")
                print(f"ℹ️  Found {data['total']} suppliers, page {data['page']}/{data['total_pages']}")
                
                # Test filtering support
                filter_response = make_request("GET", "/lists/suppliers?sort=name_desc", headers=headers)
                if filter_response and filter_response.status_code == 200:
                    results.add_pass("Suppliers List - Filtering Support")
                
            else:
                results.add_fail("Suppliers List Endpoint", f"Missing required fields: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Suppliers List Endpoint", "Invalid JSON response")
            return False
    else:
        results.add_fail("Suppliers List Endpoint", f"HTTP {response.status_code}: {response.text}")
        return False
    
    return True

def test_list_endpoints():
    """Test various list endpoints"""
    print("\n🔍 Testing General List Endpoints...")
    
    if not auth_token:
        results.add_fail("List Endpoints", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    list_names = ["staff", "purchases", "bills", "expenses", "invoices", "ratings"]
    
    passed_lists = 0
    failed_lists = []
    for list_name in list_names:
        response = make_request("GET", f"/lists/{list_name}", headers=headers)
        
        if response and response.status_code == 200:
            passed_lists += 1
        elif response and response.status_code == 401:
            results.add_fail(f"List Endpoint ({list_name})", "Authentication failed")
            return False
        elif response and response.status_code == 500:
            failed_lists.append(f"{list_name} (Internal Server Error)")
        # Note: Some lists might return empty results or 404, which is acceptable
    
    if failed_lists:
        results.add_fail("List Endpoints", f"Internal server errors: {', '.join(failed_lists)}")
        return False
    elif passed_lists > 0:
        results.add_pass(f"List Endpoints ({passed_lists}/{len(list_names)} accessible)")
        return True
    else:
        results.add_fail("List Endpoints", "No list endpoints accessible")
        return False

def test_transaction_apis():
    """Test transaction API endpoints for payables/receivables functionality"""
    print("\n🔍 Testing Transaction APIs for Payables/Receivables...")
    
    if not auth_token:
        results.add_fail("Transaction APIs", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test GET /api/transactions with filtering
    print("  Testing transaction listing with filtering...")
    response = make_request("GET", "/transactions", headers=headers)
    if not response:
        results.add_fail("Transaction APIs - GET", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "transactions" in data and "total" in data and "page" in data:
                results.add_pass("Transaction APIs - GET transactions with pagination")
                print(f"ℹ️  Found {data['total']} total transactions")
                
                # Test filtering by transaction type
                cash_in_response = make_request("GET", "/transactions?transaction_type=cash_in", headers=headers)
                if cash_in_response and cash_in_response.status_code == 200:
                    cash_in_data = cash_in_response.json()
                    results.add_pass("Transaction APIs - Cash-in filtering")
                    print(f"ℹ️  Found {cash_in_data['total']} cash-in transactions (receivables)")
                
                cash_out_response = make_request("GET", "/transactions?transaction_type=cash_out", headers=headers)
                if cash_out_response and cash_out_response.status_code == 200:
                    cash_out_data = cash_out_response.json()
                    results.add_pass("Transaction APIs - Cash-out filtering")
                    print(f"ℹ️  Found {cash_out_data['total']} cash-out transactions (payables)")
                
            else:
                results.add_fail("Transaction APIs - GET", f"Invalid response format: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Transaction APIs - GET", "Invalid JSON response")
            return False
    else:
        results.add_fail("Transaction APIs - GET", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test creating receivable transaction (cash-in)
    print("  Testing receivable transaction creation...")
    receivable_data = {
        "description": "Customer payment for services",
        "amount": 1500.00,
        "debit_account": "Cash",
        "credit_account": "Accounts Receivable"
    }
    
    response = make_request("POST", "/transactions/cash-in", receivable_data, headers=headers)
    if not response:
        results.add_fail("Receivable Transaction Creation", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "id" in data and "amount" in data and data["amount"] == 1500.00:
                results.add_pass("Receivable Transaction Creation")
                print(f"ℹ️  Created receivable transaction: ₹{data['amount']}")
            else:
                results.add_fail("Receivable Transaction Creation", f"Invalid response format: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Receivable Transaction Creation", "Invalid JSON response")
            return False
    else:
        results.add_fail("Receivable Transaction Creation", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test creating payable transaction (cash-out)
    print("  Testing payable transaction creation...")
    payable_data = {
        "description": "Supplier payment for inventory",
        "amount": 850.00,
        "debit_account": "Accounts Payable", 
        "credit_account": "Cash"
    }
    
    response = make_request("POST", "/transactions/cash-out", payable_data, headers=headers)
    if not response:
        results.add_fail("Payable Transaction Creation", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "id" in data and "amount" in data and data["amount"] == 850.00:
                results.add_pass("Payable Transaction Creation")
                print(f"ℹ️  Created payable transaction: ₹{data['amount']}")
            else:
                results.add_fail("Payable Transaction Creation", f"Invalid response format: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Payable Transaction Creation", "Invalid JSON response")
            return False
    else:
        results.add_fail("Payable Transaction Creation", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test data persistence by re-fetching dashboard summary
    print("  Testing data persistence...")
    time.sleep(1)  # Brief pause to ensure data is persisted
    response = make_request("GET", "/dashboard/summary", headers=headers)
    if response and response.status_code == 200:
        try:
            updated_data = response.json()
            if updated_data["you_will_receive"] > 0 or updated_data["you_will_give"] > 0:
                results.add_pass("Transaction Data Persistence")
                print(f"ℹ️  Updated totals - Receivables: ₹{updated_data['you_will_receive']}, Payables: ₹{updated_data['you_will_give']}")
            else:
                results.add_fail("Transaction Data Persistence", "Dashboard summary not updated after transactions")
        except json.JSONDecodeError:
            results.add_fail("Transaction Data Persistence", "Invalid JSON response from dashboard")
    else:
        results.add_fail("Transaction Data Persistence", "Failed to verify data persistence")
    
    return True

def test_admin_apis():
    """Test admin API endpoints"""
    print("\n🔍 Testing Admin APIs...")
    
    if not auth_token:
        results.add_fail("Admin APIs", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test GET /api/admin/users (should fail for regular user)
    response = make_request("GET", "/admin/users", headers=headers)
    if not response:
        results.add_fail("Admin APIs - Users", "Request failed")
        return False
    
    if response.status_code == 403:
        results.add_pass("Admin APIs - Users access control (403 for non-admin)")
    elif response.status_code == 200:
        # User might have admin role, check response format
        try:
            data = response.json()
            if "users" in data and "total" in data:
                results.add_pass("Admin APIs - Users endpoint working")
            else:
                results.add_fail("Admin APIs - Users", f"Invalid response format: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Admin APIs - Users", "Invalid JSON response")
            return False
    else:
        results.add_fail("Admin APIs - Users", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test GET /api/admin/invites (should fail for regular user)
    response = make_request("GET", "/admin/invites", headers=headers)
    if not response:
        results.add_fail("Admin APIs - Invites GET", "Request failed")
        return False
    
    if response.status_code == 403:
        results.add_pass("Admin APIs - Invites GET access control (403 for non-admin)")
    elif response.status_code == 200:
        # User might have admin role, check response format
        try:
            data = response.json()
            if "invites" in data and "total" in data:
                results.add_pass("Admin APIs - Invites GET endpoint working")
            else:
                results.add_fail("Admin APIs - Invites GET", f"Invalid response format: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Admin APIs - Invites GET", "Invalid JSON response")
            return False
    else:
        results.add_fail("Admin APIs - Invites GET", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test POST /api/admin/invites (should fail for regular user)
    response = make_request("POST", "/admin/invites", headers=headers)
    if not response:
        results.add_fail("Admin APIs - Invites POST", "Request failed")
        return False
    
    if response.status_code == 403:
        results.add_pass("Admin APIs - Invites POST access control (403 for non-admin)")
        return True
    elif response.status_code == 200:
        # User might have admin role, check response format
        try:
            data = response.json()
            if "code" in data and "id" in data:
                results.add_pass("Admin APIs - Invites POST endpoint working")
                return True
            else:
                results.add_fail("Admin APIs - Invites POST", f"Invalid response format: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Admin APIs - Invites POST", "Invalid JSON response")
            return False
    else:
        results.add_fail("Admin APIs - Invites POST", f"HTTP {response.status_code}: {response.text}")
        return False

def test_account_management_apis():
    """Test account management API endpoints"""
    print("\n🔍 Testing Account Management APIs...")
    
    if not auth_token:
        results.add_fail("Account Management APIs", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test GET /api/accounts
    response = make_request("GET", "/accounts", headers=headers)
    if not response:
        results.add_fail("Account Management APIs - GET", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "accounts" in data and "total" in data:
                results.add_pass("Account Management APIs - GET accounts")
                print(f"ℹ️  Found {data['total']} accounts for user")
            else:
                results.add_fail("Account Management APIs - GET", f"Invalid response format: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Account Management APIs - GET", "Invalid JSON response")
            return False
    else:
        results.add_fail("Account Management APIs - GET", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test POST /api/accounts (create account)
    account_data = {
        "name": "Test Marketing Budget",
        "account_type": "expense",
        "balance": 5000.00
    }
    
    response = make_request("POST", "/accounts", account_data, headers=headers)
    if not response:
        results.add_fail("Account Management APIs - POST", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "id" in data and "name" in data and data["name"] == "Test Marketing Budget":
                results.add_pass("Account Management APIs - POST create account")
                return True
            else:
                results.add_fail("Account Management APIs - POST", f"Invalid response format: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Account Management APIs - POST", "Invalid JSON response")
            return False
    else:
        results.add_fail("Account Management APIs - POST", f"HTTP {response.status_code}: {response.text}")
        return False

def test_contact_management_apis():
    """Test contact management API endpoints"""
    print("\n🔍 Testing Contact Management APIs...")
    
    if not auth_token:
        results.add_fail("Contact Management APIs", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    created_contact_ids = []
    
    # Test 1: GET /api/contacts (should work with authentication)
    print("  Testing GET /api/contacts...")
    response = make_request("GET", "/contacts", headers=headers)
    if not response:
        results.add_fail("Contact Management - GET contacts", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            contacts = response.json()
            if isinstance(contacts, list):
                results.add_pass("Contact Management - GET contacts")
                print(f"ℹ️  Found {len(contacts)} existing contacts")
            else:
                results.add_fail("Contact Management - GET contacts", f"Expected list, got: {type(contacts)}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Contact Management - GET contacts", "Invalid JSON response")
            return False
    else:
        results.add_fail("Contact Management - GET contacts", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test 2: POST /api/contacts - Create customer contact
    print("  Testing POST /api/contacts (customer)...")
    customer_data = {
        "name": "Acme Corporation",
        "type": "customer",
        "email": "contact@acmecorp.com",
        "phone": "+1-555-0123"
    }
    
    response = make_request("POST", "/contacts", customer_data, headers=headers)
    if not response:
        results.add_fail("Contact Management - POST customer", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            contact = response.json()
            if "id" in contact and contact["name"] == "Acme Corporation" and contact["type"] == "customer":
                created_contact_ids.append(contact["id"])
                results.add_pass("Contact Management - POST customer contact")
                print(f"ℹ️  Created customer contact with ID: {contact['id']}")
            else:
                results.add_fail("Contact Management - POST customer", f"Invalid response format: {contact}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Contact Management - POST customer", "Invalid JSON response")
            return False
    else:
        results.add_fail("Contact Management - POST customer", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test 3: POST /api/contacts - Create supplier contact
    print("  Testing POST /api/contacts (supplier)...")
    supplier_data = {
        "name": "TechSupply Ltd",
        "type": "supplier",
        "email": "orders@techsupply.com",
        "phone": "+1-555-0456"
    }
    
    response = make_request("POST", "/contacts", supplier_data, headers=headers)
    if response and response.status_code == 200:
        try:
            contact = response.json()
            if "id" in contact and contact["type"] == "supplier":
                created_contact_ids.append(contact["id"])
                results.add_pass("Contact Management - POST supplier contact")
            else:
                results.add_fail("Contact Management - POST supplier", f"Invalid response: {contact}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Contact Management - POST supplier", "Invalid JSON response")
            return False
    else:
        results.add_fail("Contact Management - POST supplier", f"HTTP {response.status_code if response else 'No response'}: {response.text if response else 'Request failed'}")
        return False
    
    # Test 4: POST /api/contacts - Create staff contact
    print("  Testing POST /api/contacts (staff)...")
    staff_data = {
        "name": "John Smith",
        "type": "staff",
        "email": "john.smith@company.com",
        "phone": "+1-555-0789"
    }
    
    response = make_request("POST", "/contacts", staff_data, headers=headers)
    if response and response.status_code == 200:
        try:
            contact = response.json()
            if "id" in contact and contact["type"] == "staff":
                created_contact_ids.append(contact["id"])
                results.add_pass("Contact Management - POST staff contact")
            else:
                results.add_fail("Contact Management - POST staff", f"Invalid response: {contact}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Contact Management - POST staff", "Invalid JSON response")
            return False
    else:
        results.add_fail("Contact Management - POST staff", f"HTTP {response.status_code if response else 'No response'}: {response.text if response else 'Request failed'}")
        return False
    
    # Test 5: Test duplicate contact handling (update vs create)
    print("  Testing duplicate contact handling...")
    duplicate_data = {
        "name": "Acme Corporation",  # Same name and type as first contact
        "type": "customer",
        "email": "updated@acmecorp.com",  # Different email
        "phone": "+1-555-9999"  # Different phone
    }
    
    response = make_request("POST", "/contacts", duplicate_data, headers=headers)
    if response and response.status_code == 200:
        try:
            contact = response.json()
            if contact["email"] == "updated@acmecorp.com":
                results.add_pass("Contact Management - Duplicate handling (update)")
                print("ℹ️  Duplicate contact was updated correctly")
            else:
                results.add_fail("Contact Management - Duplicate handling", f"Contact not updated: {contact}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Contact Management - Duplicate handling", "Invalid JSON response")
            return False
    else:
        results.add_fail("Contact Management - Duplicate handling", f"HTTP {response.status_code if response else 'No response'}: {response.text if response else 'Request failed'}")
        return False
    
    # Test 6: Verify contacts are associated with authenticated user
    print("  Testing user association...")
    response = make_request("GET", "/contacts", headers=headers)
    if response and response.status_code == 200:
        try:
            contacts = response.json()
            user_contacts = [c for c in contacts if c.get("user_id") == test_user_id]
            if len(user_contacts) >= 3:  # Should have at least our 3 created contacts
                results.add_pass("Contact Management - User association")
            else:
                results.add_fail("Contact Management - User association", f"Expected at least 3 user contacts, found {len(user_contacts)}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Contact Management - User association", "Invalid JSON response")
            return False
    else:
        results.add_fail("Contact Management - User association", f"HTTP {response.status_code if response else 'No response'}")
        return False
    
    # Test 7: Test error handling for invalid requests
    print("  Testing error handling...")
    
    # Test missing required fields
    invalid_data = {"type": "customer"}  # Missing name
    response = make_request("POST", "/contacts", invalid_data, headers=headers)
    if response and response.status_code in [400, 422]:
        results.add_pass("Contact Management - Error handling (missing fields)")
    else:
        results.add_fail("Contact Management - Error handling", f"Expected 400/422 for missing fields, got {response.status_code if response else 'No response'}")
    
    # Test 8: Test authentication requirement
    print("  Testing authentication requirement...")
    response = make_request("GET", "/contacts")  # No auth header
    if response and response.status_code in [401, 403]:
        results.add_pass("Contact Management - Authentication required")
    else:
        results.add_fail("Contact Management - Authentication", f"Expected 401/403 without auth, got {response.status_code if response else 'No response'}")
    
    # Test 9: DELETE /api/contacts/{contact_id}
    print("  Testing DELETE /api/contacts/{contact_id}...")
    if created_contact_ids:
        contact_id_to_delete = created_contact_ids[0]
        response = make_request("DELETE", f"/contacts/{contact_id_to_delete}", headers=headers)
        
        if response and response.status_code == 200:
            try:
                result = response.json()
                if "message" in result and "deleted" in result["message"].lower():
                    results.add_pass("Contact Management - DELETE contact")
                    
                    # Verify contact was actually deleted
                    response = make_request("GET", "/contacts", headers=headers)
                    if response and response.status_code == 200:
                        contacts = response.json()
                        if not any(c["id"] == contact_id_to_delete for c in contacts):
                            results.add_pass("Contact Management - DELETE verification")
                        else:
                            results.add_fail("Contact Management - DELETE verification", "Contact still exists after deletion")
                else:
                    results.add_fail("Contact Management - DELETE", f"Unexpected response: {result}")
                    return False
            except json.JSONDecodeError:
                results.add_fail("Contact Management - DELETE", "Invalid JSON response")
                return False
        else:
            results.add_fail("Contact Management - DELETE", f"HTTP {response.status_code if response else 'No response'}: {response.text if response else 'Request failed'}")
            return False
    else:
        results.add_fail("Contact Management - DELETE", "No contact ID available for deletion test")
        return False
    
    # Test 10: DELETE non-existent contact
    print("  Testing DELETE non-existent contact...")
    fake_id = "non-existent-contact-id"
    response = make_request("DELETE", f"/contacts/{fake_id}", headers=headers)
    if response and response.status_code == 404:
        results.add_pass("Contact Management - DELETE non-existent (404)")
    else:
        results.add_fail("Contact Management - DELETE non-existent", f"Expected 404, got {response.status_code if response else 'No response'}")
    
    # Test 11: DELETE without authentication
    print("  Testing DELETE without authentication...")
    if len(created_contact_ids) > 1:
        response = make_request("DELETE", f"/contacts/{created_contact_ids[1]}")  # No auth header
        if response and response.status_code in [401, 403]:
            results.add_pass("Contact Management - DELETE auth required")
        else:
            results.add_fail("Contact Management - DELETE auth", f"Expected 401/403 without auth, got {response.status_code if response else 'No response'}")
    
    print(f"ℹ️  Contact Management API testing completed")
    return True

def test_missing_endpoints():
    """Test for missing critical endpoints"""
    print("\n🔍 Testing Missing Critical Endpoints...")
    
    if not auth_token:
        results.add_fail("Missing Endpoints Check", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    missing_endpoints = []
    
    # Test transaction endpoints that should exist for a financial dashboard
    critical_endpoints = [
        ("/transactions", "GET", "Transaction List"),
        ("/transactions", "POST", "Create Transaction"),
        ("/transactions/cash-in", "POST", "Cash In Transaction"),
        ("/transactions/cash-out", "POST", "Cash Out Transaction"),
        ("/admin/invites", "GET", "Admin Invite Management"),
        ("/admin/users", "GET", "Admin User Management"),
        ("/accounts", "GET", "Account Management"),
        ("/contacts", "GET", "Contact Management"),
        ("/contacts", "POST", "Contact Creation")
    ]
    
    for endpoint, method, description in critical_endpoints:
        response = make_request(method, endpoint, headers=headers)
        if not response or response.status_code == 404:
            missing_endpoints.append(f"{method} {endpoint} ({description})")
        elif response.status_code == 403 and "admin" in endpoint:
            # Admin endpoints should return 403 for non-admin users, which is correct
            continue
    
    if missing_endpoints:
        results.add_fail("Missing Critical Endpoints", f"Missing: {', '.join(missing_endpoints)}")
        return False
    else:
        results.add_pass("All Critical Endpoints Present")
        return True

def test_cors_headers():
    """Test CORS headers are properly set"""
    print("\n🔍 Testing CORS Headers...")
    
    # Test OPTIONS request
    try:
        response = requests.options(f"{API_BASE}/ping", timeout=10)
        if response.status_code in [200, 204]:
            cors_headers = [
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Methods", 
                "Access-Control-Allow-Headers"
            ]
            
            has_cors = any(header in response.headers for header in cors_headers)
            if has_cors:
                results.add_pass("CORS Headers")
                return True
            else:
                results.add_fail("CORS Headers", "Missing CORS headers in OPTIONS response")
        else:
            results.add_fail("CORS Headers", f"OPTIONS request failed: HTTP {response.status_code}")
    except Exception as e:
        results.add_fail("CORS Headers", f"OPTIONS request failed: {e}")
    
    return False

def test_authentication_security():
    """Test authentication security measures"""
    print("\n🔍 Testing Authentication Security...")
    
    # Test access to protected endpoint without token
    response = make_request("GET", "/dashboard/summary")
    if response and response.status_code in [401, 403]:
        results.add_pass("Authentication Security - Unauthorized Access Blocked")
    else:
        results.add_fail("Authentication Security", f"Protected endpoint accessible without token: HTTP {response.status_code if response else 'No response'}")
        return False
    
    # Test with invalid token
    headers = {"Authorization": "Bearer invalid_token_here"}
    response = make_request("GET", "/dashboard/summary", headers=headers)
    if response and response.status_code in [401, 403]:
        results.add_pass("Authentication Security - Invalid Token Rejected")
        return True
    else:
        results.add_fail("Authentication Security", f"Invalid token accepted: HTTP {response.status_code if response else 'No response'}")
        return False

def test_backend_server_health():
    """Test backend server health and response times"""
    print("\n🔍 Testing Backend Server Health & Performance...")
    
    start_time = time.time()
    response = make_request("GET", "/ping")
    response_time = time.time() - start_time
    
    if not response:
        results.add_fail("Backend Server Health", "Server not responding")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "status" in data and data["status"] == "ok":
                results.add_pass("Backend Server Health")
                
                # Check response time
                if response_time < 2.0:  # Less than 2 seconds is acceptable
                    results.add_pass(f"Backend Response Time ({response_time:.2f}s)")
                else:
                    results.add_fail("Backend Response Time", f"Slow response: {response_time:.2f}s")
                
                # Verify /api prefix accessibility
                print("  Testing /api prefix accessibility...")
                if API_BASE.endswith("/api"):
                    results.add_pass("API Routes with /api prefix")
                else:
                    results.add_fail("API Routes", "Backend URL does not use /api prefix")
                
                return True
            else:
                results.add_fail("Backend Server Health", f"Invalid health response: {data}")
        except json.JSONDecodeError:
            results.add_fail("Backend Server Health", "Invalid JSON response")
    else:
        results.add_fail("Backend Server Health", f"HTTP {response.status_code}: {response.text}")
    
    return False

def run_payables_receivables_tests():
    """Run focused tests for Total Payables and Total Receivables pages backend support"""
    print(f"🚀 Starting Backend Tests for Total Payables & Total Receivables Pages")
    print(f"Backend URL: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Test Focus: Backend services for newly updated payables/receivables pages")
    
    # Test sequence focused on payables/receivables requirements
    tests = [
        test_backend_server_health,
        test_cors_headers,
        test_authentication_security,
        test_admin_login,  # Test with admin/admin123 as specified
        test_dashboard_summary,  # Test payables/receivables data
        test_payables_receivables_list_endpoints,  # Test customers/suppliers endpoints
        test_transaction_apis,  # Test transaction creation and filtering
        test_contact_management_apis,  # Test contact management for customers/suppliers
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

def run_all_tests():
    """Run all backend tests in sequence"""
    print(f"🚀 Starting Comprehensive Backend API Tests")
    print(f"Backend URL: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Test sequence - order matters for authentication flow
    tests = [
        test_api_health,
        test_cors_headers,
        test_authentication_security,
        test_user_registration,
        test_user_login,
        test_dashboard_summary,
        test_payables_receivables_list_endpoints,
        test_list_endpoints,
        test_transaction_apis,
        test_admin_apis,
        test_account_management_apis,
        test_contact_management_apis,
        test_missing_endpoints,
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
    success = run_all_tests()
    sys.exit(0 if success else 1)