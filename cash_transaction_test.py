#!/usr/bin/env python3
"""
Cash Transaction Testing Suite
Tests Cash In and Cash Out transaction saving functionality as requested in review
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
print(f"Testing Cash Transactions at: {API_BASE}")

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
        print(f"CASH TRANSACTION TEST SUMMARY: {self.passed}/{total} tests passed")
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
            response = requests.get(url, headers=default_headers, timeout=60)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=default_headers, timeout=60)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=default_headers, timeout=60)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=default_headers, timeout=60)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except requests.exceptions.Timeout:
        print(f"Request timeout for {method} {url}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Request failed for {method} {url}: {e}")
        return None

def test_mobile_login():
    """Test mobile login with test user (mobile: 9999999999) as specified in review"""
    print("\n🔍 Testing Mobile Login (mobile: 9999999999)...")
    global auth_token, test_user_id
    
    mobile_login_data = {
        "mobile": "9999999999",
        "name": "Test User"
    }
    
    response = make_request("POST", "/auth/mobile-login", mobile_login_data)
    if not response:
        results.add_fail("Mobile Login", "Request failed")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "access_token" in data and "user" in data:
                auth_token = data["access_token"]
                test_user_id = data["user"]["id"]
                results.add_pass("Mobile Login (9999999999)")
                print(f"ℹ️  Login successful, user ID: {test_user_id}")
                return True
            else:
                results.add_fail("Mobile Login", f"Missing required fields in response: {data}")
        except json.JSONDecodeError:
            results.add_fail("Mobile Login", "Invalid JSON response")
    else:
        results.add_fail("Mobile Login", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_cash_in_transaction_save():
    """Test Cash In Transaction Save as specified in review"""
    print("\n🔍 Testing Cash In Transaction Save...")
    
    if not auth_token:
        results.add_fail("Cash In Transaction Save", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test data as specified in review
    cash_in_data = {
        "amount": 5000,
        "description": "Cash In - Test Customer - Test Item - Cash",
        "debit_account": "Test Customer",
        "credit_account": "Cash"
    }
    
    print(f"  Creating cash-in transaction: ₹{cash_in_data['amount']}")
    response = make_request("POST", "/transactions/cash-in", cash_in_data, headers=headers)
    
    if not response:
        results.add_fail("Cash In Transaction Save", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            
            # Verify transaction has correct fields as specified in review
            required_fields = ["id", "user_id", "amount", "description", "transaction_type"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                results.add_fail("Cash In Transaction Save", f"Missing required fields: {missing_fields}")
                return False
            
            # Verify field values
            if data["amount"] != 5000:
                results.add_fail("Cash In Transaction Save", f"Amount mismatch: expected 5000, got {data['amount']}")
                return False
            
            if data["transaction_type"] != "cash_in":
                results.add_fail("Cash In Transaction Save", f"Transaction type mismatch: expected 'cash_in', got {data['transaction_type']}")
                return False
            
            if data["user_id"] != test_user_id:
                results.add_fail("Cash In Transaction Save", f"User ID mismatch: expected {test_user_id}, got {data['user_id']}")
                return False
            
            if data["description"] != cash_in_data["description"]:
                results.add_fail("Cash In Transaction Save", f"Description mismatch")
                return False
            
            results.add_pass("Cash In Transaction Save - Correct Fields")
            print(f"ℹ️  Transaction created with ID: {data['id']}")
            print(f"ℹ️  Amount: ₹{data['amount']}, Type: {data['transaction_type']}")
            
            # Store transaction ID for later verification
            global cash_in_transaction_id
            cash_in_transaction_id = data["id"]
            
            return True
            
        except json.JSONDecodeError:
            results.add_fail("Cash In Transaction Save", "Invalid JSON response")
    else:
        results.add_fail("Cash In Transaction Save", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_cash_out_transaction_save():
    """Test Cash Out Transaction Save as specified in review"""
    print("\n🔍 Testing Cash Out Transaction Save...")
    
    if not auth_token:
        results.add_fail("Cash Out Transaction Save", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test data as specified in review
    cash_out_data = {
        "amount": 3000,
        "description": "Cash Out - Test Vendor - Test Expense - Cash",
        "debit_account": "Cash",
        "credit_account": "Test Vendor"
    }
    
    print(f"  Creating cash-out transaction: ₹{cash_out_data['amount']}")
    response = make_request("POST", "/transactions/cash-out", cash_out_data, headers=headers)
    
    if not response:
        results.add_fail("Cash Out Transaction Save", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            
            # Verify transaction has correct fields
            required_fields = ["id", "user_id", "amount", "description", "transaction_type"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                results.add_fail("Cash Out Transaction Save", f"Missing required fields: {missing_fields}")
                return False
            
            # Verify field values
            if data["amount"] != 3000:
                results.add_fail("Cash Out Transaction Save", f"Amount mismatch: expected 3000, got {data['amount']}")
                return False
            
            if data["transaction_type"] != "cash_out":
                results.add_fail("Cash Out Transaction Save", f"Transaction type mismatch: expected 'cash_out', got {data['transaction_type']}")
                return False
            
            if data["user_id"] != test_user_id:
                results.add_fail("Cash Out Transaction Save", f"User ID mismatch: expected {test_user_id}, got {data['user_id']}")
                return False
            
            results.add_pass("Cash Out Transaction Save - Correct Fields")
            print(f"ℹ️  Transaction created with ID: {data['id']}")
            print(f"ℹ️  Amount: ₹{data['amount']}, Type: {data['transaction_type']}")
            
            # Store transaction ID for later verification
            global cash_out_transaction_id
            cash_out_transaction_id = data["id"]
            
            return True
            
        except json.JSONDecodeError:
            results.add_fail("Cash Out Transaction Save", "Invalid JSON response")
    else:
        results.add_fail("Cash Out Transaction Save", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_validation_zero_amount():
    """Test validation with zero amount (should fail)"""
    print("\n🔍 Testing Validation - Zero Amount (should fail)...")
    
    if not auth_token:
        results.add_fail("Validation - Zero Amount", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    zero_amount_data = {
        "amount": 0,
        "description": "Test zero amount",
        "debit_account": "Test",
        "credit_account": "Cash"
    }
    
    response = make_request("POST", "/transactions/cash-in", zero_amount_data, headers=headers)
    
    if not response:
        results.add_fail("Validation - Zero Amount", "Request failed")
        return False
    
    # Should fail with 400 or 422 status code
    if response.status_code in [400, 422]:
        results.add_pass("Validation - Zero Amount Rejected")
        print("ℹ️  Zero amount correctly rejected")
        return True
    elif response.status_code == 200:
        results.add_fail("Validation - Zero Amount", "Zero amount was accepted (should be rejected)")
        return False
    else:
        results.add_fail("Validation - Zero Amount", f"Unexpected status code: {response.status_code}")
        return False

def test_validation_negative_amount():
    """Test validation with negative amount"""
    print("\n🔍 Testing Validation - Negative Amount...")
    
    if not auth_token:
        results.add_fail("Validation - Negative Amount", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    negative_amount_data = {
        "amount": -1000,
        "description": "Test negative amount",
        "debit_account": "Test",
        "credit_account": "Cash"
    }
    
    response = make_request("POST", "/transactions/cash-in", negative_amount_data, headers=headers)
    
    if not response:
        results.add_fail("Validation - Negative Amount", "Request failed")
        return False
    
    # Should either fail with 400/422 or handle appropriately
    if response.status_code in [400, 422]:
        results.add_pass("Validation - Negative Amount Rejected")
        print("ℹ️  Negative amount correctly rejected")
        return True
    elif response.status_code == 200:
        # If accepted, check if it's handled appropriately
        try:
            data = response.json()
            if data["amount"] == -1000:
                results.add_pass("Validation - Negative Amount Handled")
                print("ℹ️  Negative amount accepted and stored correctly")
                return True
            else:
                results.add_fail("Validation - Negative Amount", f"Amount modified unexpectedly: {data['amount']}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Validation - Negative Amount", "Invalid JSON response")
            return False
    else:
        results.add_fail("Validation - Negative Amount", f"Unexpected status code: {response.status_code}")
        return False

def test_validation_without_description():
    """Test without description (should work with defaults)"""
    print("\n🔍 Testing Validation - Without Description (should work with defaults)...")
    
    if not auth_token:
        results.add_fail("Validation - Without Description", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    no_description_data = {
        "amount": 1500,
        "debit_account": "Test",
        "credit_account": "Cash"
        # No description field
    }
    
    response = make_request("POST", "/transactions/cash-in", no_description_data, headers=headers)
    
    if not response:
        results.add_fail("Validation - Without Description", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "description" in data:
                results.add_pass("Validation - Without Description Works")
                print(f"ℹ️  Transaction created without description: '{data['description']}'")
                return True
            else:
                results.add_fail("Validation - Without Description", "Description field missing in response")
                return False
        except json.JSONDecodeError:
            results.add_fail("Validation - Without Description", "Invalid JSON response")
            return False
    elif response.status_code in [400, 422]:
        results.add_fail("Validation - Without Description", "Description appears to be required (unexpected)")
        return False
    else:
        results.add_fail("Validation - Without Description", f"Unexpected status code: {response.status_code}")
        return False

def test_data_persistence_mongodb():
    """Test that transactions are saved in MongoDB and can be retrieved"""
    print("\n🔍 Testing Data Persistence in MongoDB...")
    
    if not auth_token:
        results.add_fail("Data Persistence", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Get all transactions to verify our created transactions exist
    response = make_request("GET", "/transactions", headers=headers)
    
    if not response:
        results.add_fail("Data Persistence", "Failed to retrieve transactions")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            
            if "transactions" not in data:
                results.add_fail("Data Persistence", "Invalid response format - missing transactions")
                return False
            
            transactions = data["transactions"]
            
            # Look for our created transactions
            cash_in_found = False
            cash_out_found = False
            
            for transaction in transactions:
                if transaction.get("user_id") == test_user_id:
                    if (transaction.get("amount") == 5000 and 
                        transaction.get("transaction_type") == "cash_in" and
                        "Test Customer" in transaction.get("description", "")):
                        cash_in_found = True
                    
                    if (transaction.get("amount") == 3000 and 
                        transaction.get("transaction_type") == "cash_out" and
                        "Test Vendor" in transaction.get("description", "")):
                        cash_out_found = True
            
            if cash_in_found and cash_out_found:
                results.add_pass("Data Persistence - Transactions Saved in MongoDB")
                print(f"ℹ️  Found both cash-in (₹5000) and cash-out (₹3000) transactions")
                return True
            elif cash_in_found:
                results.add_fail("Data Persistence", "Cash-in transaction found but cash-out missing")
                return False
            elif cash_out_found:
                results.add_fail("Data Persistence", "Cash-out transaction found but cash-in missing")
                return False
            else:
                results.add_fail("Data Persistence", "Neither cash-in nor cash-out transactions found")
                return False
                
        except json.JSONDecodeError:
            results.add_fail("Data Persistence", "Invalid JSON response")
            return False
    else:
        results.add_fail("Data Persistence", f"HTTP {response.status_code}: {response.text}")
        return False

def test_data_persistence_multiple_saves():
    """Test that transactions persist across multiple saves"""
    print("\n🔍 Testing Data Persistence - Multiple Saves...")
    
    if not auth_token:
        results.add_fail("Data Persistence - Multiple Saves", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Get initial count
    response = make_request("GET", "/transactions", headers=headers)
    if not response or response.status_code != 200:
        results.add_fail("Data Persistence - Multiple Saves", "Failed to get initial count")
        return False
    
    initial_count = response.json().get("total", 0)
    print(f"  Initial transaction count: {initial_count}")
    
    # Create multiple transactions
    transactions_to_create = [
        {"amount": 1000, "description": "Persistence Test 1", "debit_account": "Test1", "credit_account": "Cash"},
        {"amount": 2000, "description": "Persistence Test 2", "debit_account": "Test2", "credit_account": "Cash"},
        {"amount": 1500, "description": "Persistence Test 3", "debit_account": "Test3", "credit_account": "Cash"}
    ]
    
    created_transactions = []
    for i, transaction_data in enumerate(transactions_to_create):
        print(f"  Creating transaction {i+1}/3: ₹{transaction_data['amount']}")
        response = make_request("POST", "/transactions/cash-in", transaction_data, headers=headers)
        
        if response and response.status_code == 200:
            created_transactions.append(response.json())
        else:
            results.add_fail("Data Persistence - Multiple Saves", f"Failed to create transaction {i+1}")
            return False
        
        time.sleep(0.5)  # Brief pause between creates
    
    # Verify all transactions were saved
    response = make_request("GET", "/transactions", headers=headers)
    if not response or response.status_code != 200:
        results.add_fail("Data Persistence - Multiple Saves", "Failed to get final count")
        return False
    
    final_count = response.json().get("total", 0)
    print(f"  Final transaction count: {final_count}")
    
    if final_count >= initial_count + 3:
        results.add_pass("Data Persistence - Multiple Saves")
        print(f"ℹ️  Successfully created and persisted {len(created_transactions)} transactions")
        return True
    else:
        results.add_fail("Data Persistence - Multiple Saves", f"Expected at least {initial_count + 3} transactions, got {final_count}")
        return False

def test_duplicate_transaction_handling():
    """Test if duplicate transactions are prevented or allowed"""
    print("\n🔍 Testing Duplicate Transaction Handling...")
    
    if not auth_token:
        results.add_fail("Duplicate Transaction Handling", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Create identical transaction twice
    duplicate_data = {
        "amount": 2500,
        "description": "Duplicate Test Transaction",
        "debit_account": "Duplicate Test",
        "credit_account": "Cash"
    }
    
    # First transaction
    print("  Creating first transaction...")
    response1 = make_request("POST", "/transactions/cash-in", duplicate_data, headers=headers)
    
    if not response1 or response1.status_code != 200:
        results.add_fail("Duplicate Transaction Handling", "Failed to create first transaction")
        return False
    
    transaction1_id = response1.json().get("id")
    
    # Second identical transaction
    print("  Creating identical transaction...")
    response2 = make_request("POST", "/transactions/cash-in", duplicate_data, headers=headers)
    
    if not response2:
        results.add_fail("Duplicate Transaction Handling", "Failed to create second transaction")
        return False
    
    if response2.status_code == 200:
        transaction2_id = response2.json().get("id")
        
        if transaction1_id != transaction2_id:
            results.add_pass("Duplicate Transaction Handling - Duplicates Allowed")
            print("ℹ️  Duplicate transactions are allowed (each gets unique ID)")
            return True
        else:
            results.add_fail("Duplicate Transaction Handling", "Same transaction ID returned for duplicate")
            return False
    elif response2.status_code in [400, 409]:
        results.add_pass("Duplicate Transaction Handling - Duplicates Prevented")
        print("ℹ️  Duplicate transactions are prevented")
        return True
    else:
        results.add_fail("Duplicate Transaction Handling", f"Unexpected status code: {response2.status_code}")
        return False

def test_transaction_filtering():
    """Test transaction filtering by type"""
    print("\n🔍 Testing Transaction Filtering...")
    
    if not auth_token:
        results.add_fail("Transaction Filtering", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test cash-in filtering
    print("  Testing cash-in filtering...")
    response = make_request("GET", "/transactions?transaction_type=cash_in", headers=headers)
    
    if not response or response.status_code != 200:
        results.add_fail("Transaction Filtering - Cash In", "Failed to filter cash-in transactions")
        return False
    
    try:
        data = response.json()
        cash_in_transactions = data.get("transactions", [])
        
        # Verify all returned transactions are cash_in type
        all_cash_in = all(t.get("transaction_type") == "cash_in" for t in cash_in_transactions)
        
        if all_cash_in:
            results.add_pass("Transaction Filtering - Cash In")
            print(f"ℹ️  Found {len(cash_in_transactions)} cash-in transactions")
        else:
            results.add_fail("Transaction Filtering - Cash In", "Non cash-in transactions in filtered results")
            return False
            
    except json.JSONDecodeError:
        results.add_fail("Transaction Filtering - Cash In", "Invalid JSON response")
        return False
    
    # Test cash-out filtering
    print("  Testing cash-out filtering...")
    response = make_request("GET", "/transactions?transaction_type=cash_out", headers=headers)
    
    if not response or response.status_code != 200:
        results.add_fail("Transaction Filtering - Cash Out", "Failed to filter cash-out transactions")
        return False
    
    try:
        data = response.json()
        cash_out_transactions = data.get("transactions", [])
        
        # Verify all returned transactions are cash_out type
        all_cash_out = all(t.get("transaction_type") == "cash_out" for t in cash_out_transactions)
        
        if all_cash_out:
            results.add_pass("Transaction Filtering - Cash Out")
            print(f"ℹ️  Found {len(cash_out_transactions)} cash-out transactions")
            return True
        else:
            results.add_fail("Transaction Filtering - Cash Out", "Non cash-out transactions in filtered results")
            return False
            
    except json.JSONDecodeError:
        results.add_fail("Transaction Filtering - Cash Out", "Invalid JSON response")
        return False

def run_cash_transaction_tests():
    """Run comprehensive cash transaction tests as specified in review"""
    print(f"🚀 Starting Cash In and Cash Out Transaction Testing")
    print(f"Backend URL: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Test Focus: Cash transaction saving functionality")
    
    # Test sequence as specified in review request
    tests = [
        test_mobile_login,                      # Login as test user (mobile: 9999999999)
        test_cash_in_transaction_save,          # Test Cash In Transaction Save
        test_cash_out_transaction_save,         # Test Cash Out Transaction Save
        test_validation_zero_amount,            # Test with zero amount (should fail)
        test_validation_negative_amount,        # Test with negative amount
        test_validation_without_description,    # Test without description (should work with defaults)
        test_data_persistence_mongodb,          # Verify transactions saved in MongoDB
        test_data_persistence_multiple_saves,   # Verify transactions persist across multiple saves
        test_duplicate_transaction_handling,    # Check if duplicate transactions are prevented or allowed
        test_transaction_filtering,             # Test transaction filtering by type
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
    success = run_cash_transaction_tests()
    sys.exit(0 if success else 1)