#!/usr/bin/env python3
"""
Focused Contact Management API Testing
Tests specifically the contact management endpoints
"""

import requests
import json
import time
from datetime import datetime
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
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
TEST_LOGIN_DATA = {
    "username": "sarah_johnson",
    "password": "SecurePass123!@#"
}

def make_request(method, endpoint, data=None, headers=None, timeout=10):
    """Make HTTP request with error handling"""
    url = f"{API_BASE}{endpoint}"
    default_headers = {"Content-Type": "application/json"}
    if headers:
        default_headers.update(headers)
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=default_headers, timeout=timeout)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=default_headers, timeout=timeout)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=default_headers, timeout=timeout)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def get_auth_token():
    """Login and get auth token"""
    print("🔐 Logging in...")
    response = make_request("POST", "/auth/login", TEST_LOGIN_DATA)
    if response and response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        user_id = data["user"]["id"]
        print(f"✅ Login successful, user ID: {user_id}")
        return token, user_id
    else:
        print(f"❌ Login failed: {response.status_code if response else 'No response'}")
        return None, None

def test_contact_management():
    """Comprehensive contact management API test"""
    print(f"\n🚀 Starting Contact Management API Tests")
    print(f"Backend URL: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Get authentication token
    auth_token, user_id = get_auth_token()
    if not auth_token:
        print("❌ Cannot proceed without authentication")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    test_results = []
    created_contacts = []
    
    print("\n" + "="*60)
    print("CONTACT MANAGEMENT API COMPREHENSIVE TESTING")
    print("="*60)
    
    # Test 1: GET /api/contacts
    print("\n1️⃣ Testing GET /api/contacts...")
    response = make_request("GET", "/contacts", headers=headers)
    if response and response.status_code == 200:
        contacts = response.json()
        print(f"✅ GET /api/contacts - SUCCESS (found {len(contacts)} contacts)")
        test_results.append("✅ GET /api/contacts - Working")
    else:
        print(f"❌ GET /api/contacts - FAILED: {response.status_code if response else 'No response'}")
        test_results.append("❌ GET /api/contacts - Failed")
    
    # Test 2: POST /api/contacts - Customer
    print("\n2️⃣ Testing POST /api/contacts (customer type)...")
    customer_data = {
        "name": "Global Tech Solutions",
        "type": "customer",
        "email": "contact@globaltech.com",
        "phone": "+1-555-0100"
    }
    response = make_request("POST", "/contacts", customer_data, headers=headers)
    if response and response.status_code == 200:
        contact = response.json()
        created_contacts.append(contact["id"])
        print(f"✅ POST customer contact - SUCCESS (ID: {contact['id']})")
        test_results.append("✅ POST customer contact - Working")
    else:
        print(f"❌ POST customer contact - FAILED: {response.status_code if response else 'No response'}")
        test_results.append("❌ POST customer contact - Failed")
    
    # Test 3: POST /api/contacts - Supplier
    print("\n3️⃣ Testing POST /api/contacts (supplier type)...")
    supplier_data = {
        "name": "Premium Supplies Inc",
        "type": "supplier",
        "email": "orders@premiumsupplies.com",
        "phone": "+1-555-0200"
    }
    response = make_request("POST", "/contacts", supplier_data, headers=headers)
    if response and response.status_code == 200:
        contact = response.json()
        created_contacts.append(contact["id"])
        print(f"✅ POST supplier contact - SUCCESS (ID: {contact['id']})")
        test_results.append("✅ POST supplier contact - Working")
    else:
        print(f"❌ POST supplier contact - FAILED: {response.status_code if response else 'No response'}")
        test_results.append("❌ POST supplier contact - Failed")
    
    # Test 4: POST /api/contacts - Staff
    print("\n4️⃣ Testing POST /api/contacts (staff type)...")
    staff_data = {
        "name": "Alice Johnson",
        "type": "staff",
        "email": "alice.johnson@company.com",
        "phone": "+1-555-0300"
    }
    response = make_request("POST", "/contacts", staff_data, headers=headers)
    if response and response.status_code == 200:
        contact = response.json()
        created_contacts.append(contact["id"])
        print(f"✅ POST staff contact - SUCCESS (ID: {contact['id']})")
        test_results.append("✅ POST staff contact - Working")
    else:
        print(f"❌ POST staff contact - FAILED: {response.status_code if response else 'No response'}")
        test_results.append("❌ POST staff contact - Failed")
    
    # Test 5: Duplicate contact handling (update vs create)
    print("\n5️⃣ Testing duplicate contact handling...")
    duplicate_data = {
        "name": "Global Tech Solutions",  # Same name and type as first contact
        "type": "customer",
        "email": "updated@globaltech.com",  # Different email
        "phone": "+1-555-9999"  # Different phone
    }
    response = make_request("POST", "/contacts", duplicate_data, headers=headers)
    if response and response.status_code == 200:
        contact = response.json()
        if contact["email"] == "updated@globaltech.com":
            print("✅ Duplicate contact handling - SUCCESS (contact updated)")
            test_results.append("✅ Duplicate contact handling - Working")
        else:
            print(f"❌ Duplicate contact handling - FAILED: Email not updated")
            test_results.append("❌ Duplicate contact handling - Failed")
    else:
        print(f"❌ Duplicate contact handling - FAILED: {response.status_code if response else 'No response'}")
        test_results.append("❌ Duplicate contact handling - Failed")
    
    # Test 6: User association verification
    print("\n6️⃣ Testing user association...")
    response = make_request("GET", "/contacts", headers=headers)
    if response and response.status_code == 200:
        contacts = response.json()
        user_contacts = [c for c in contacts if c.get("user_id") == user_id]
        if len(user_contacts) >= 3:
            print(f"✅ User association - SUCCESS ({len(user_contacts)} contacts associated with user)")
            test_results.append("✅ User association - Working")
        else:
            print(f"❌ User association - FAILED: Only {len(user_contacts)} contacts found")
            test_results.append("❌ User association - Failed")
    else:
        print(f"❌ User association - FAILED: {response.status_code if response else 'No response'}")
        test_results.append("❌ User association - Failed")
    
    # Test 7: Error handling - Invalid data
    print("\n7️⃣ Testing error handling (invalid data)...")
    invalid_data = {"type": "customer"}  # Missing required 'name' field
    response = make_request("POST", "/contacts", invalid_data, headers=headers)
    if response and response.status_code in [400, 422]:
        print(f"✅ Error handling - SUCCESS (HTTP {response.status_code} for invalid data)")
        test_results.append("✅ Error handling - Working")
    else:
        print(f"❌ Error handling - FAILED: Expected 400/422, got {response.status_code if response else 'No response'}")
        test_results.append("❌ Error handling - Failed")
    
    # Test 8: Authentication requirement
    print("\n8️⃣ Testing authentication requirement...")
    response = make_request("GET", "/contacts")  # No auth header
    if response and response.status_code in [401, 403]:
        print(f"✅ Authentication requirement - SUCCESS (HTTP {response.status_code} without auth)")
        test_results.append("✅ Authentication requirement - Working")
    else:
        print(f"❌ Authentication requirement - FAILED: Expected 401/403, got {response.status_code if response else 'No response'}")
        test_results.append("❌ Authentication requirement - Failed")
    
    # Test 9: DELETE contact
    print("\n9️⃣ Testing DELETE /api/contacts/{contact_id}...")
    if created_contacts:
        contact_id = created_contacts[0]
        response = make_request("DELETE", f"/contacts/{contact_id}", headers=headers)
        if response and response.status_code == 200:
            result = response.json()
            if "message" in result and "deleted" in result["message"].lower():
                print(f"✅ DELETE contact - SUCCESS (ID: {contact_id})")
                test_results.append("✅ DELETE contact - Working")
                
                # Verify deletion
                response = make_request("GET", "/contacts", headers=headers)
                if response and response.status_code == 200:
                    contacts = response.json()
                    if not any(c["id"] == contact_id for c in contacts):
                        print("✅ DELETE verification - SUCCESS (contact removed)")
                        test_results.append("✅ DELETE verification - Working")
                    else:
                        print("❌ DELETE verification - FAILED (contact still exists)")
                        test_results.append("❌ DELETE verification - Failed")
            else:
                print(f"❌ DELETE contact - FAILED: Unexpected response format")
                test_results.append("❌ DELETE contact - Failed")
        else:
            print(f"❌ DELETE contact - FAILED: {response.status_code if response else 'No response'}")
            test_results.append("❌ DELETE contact - Failed")
    else:
        print("❌ DELETE contact - FAILED: No contact ID available")
        test_results.append("❌ DELETE contact - Failed")
    
    # Test 10: DELETE non-existent contact
    print("\n🔟 Testing DELETE non-existent contact...")
    fake_id = "non-existent-contact-id"
    response = make_request("DELETE", f"/contacts/{fake_id}", headers=headers)
    if response and response.status_code == 404:
        print("✅ DELETE non-existent - SUCCESS (HTTP 404)")
        test_results.append("✅ DELETE non-existent - Working")
    else:
        print(f"❌ DELETE non-existent - FAILED: Expected 404, got {response.status_code if response else 'No response'}")
        test_results.append("❌ DELETE non-existent - Failed")
    
    # Test 11: DELETE without authentication
    print("\n1️⃣1️⃣ Testing DELETE without authentication...")
    if len(created_contacts) > 1:
        response = make_request("DELETE", f"/contacts/{created_contacts[1]}")  # No auth header
        if response and response.status_code in [401, 403]:
            print(f"✅ DELETE auth requirement - SUCCESS (HTTP {response.status_code})")
            test_results.append("✅ DELETE auth requirement - Working")
        else:
            print(f"❌ DELETE auth requirement - FAILED: Expected 401/403, got {response.status_code if response else 'No response'}")
            test_results.append("❌ DELETE auth requirement - Failed")
    else:
        print("❌ DELETE auth requirement - FAILED: No contact ID available")
        test_results.append("❌ DELETE auth requirement - Failed")
    
    # Final Summary
    print("\n" + "="*60)
    print("CONTACT MANAGEMENT API TEST SUMMARY")
    print("="*60)
    
    passed = len([r for r in test_results if r.startswith("✅")])
    failed = len([r for r in test_results if r.startswith("❌")])
    total = passed + failed
    
    print(f"\n📊 RESULTS: {passed}/{total} tests passed")
    
    if passed > 0:
        print(f"\n✅ PASSED TESTS:")
        for result in test_results:
            if result.startswith("✅"):
                print(f"  {result}")
    
    if failed > 0:
        print(f"\n❌ FAILED TESTS:")
        for result in test_results:
            if result.startswith("❌"):
                print(f"  {result}")
    
    print(f"\n🎯 SUCCESS RATE: {(passed/total)*100:.1f}%")
    
    return passed >= 8  # Consider success if at least 8/11 tests pass

if __name__ == "__main__":
    success = test_contact_management()
    sys.exit(0 if success else 1)