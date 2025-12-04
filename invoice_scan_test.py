#!/usr/bin/env python3
"""
Test script for invoice scanning functionality
"""
import requests
import base64
import json
import os

# Test configuration
BACKEND_URL = "http://localhost:8001"
TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpass123"

def create_test_image():
    """Create a simple test image (1x1 pixel PNG) for testing"""
    # Minimal PNG data (1x1 transparent pixel)
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    return base64.b64encode(png_data).decode('utf-8')

def test_invoice_scan():
    """Test the invoice scanning endpoint"""
    print("🧪 Testing Invoice Scanning Functionality")
    print("=" * 50)
    
    # Step 1: Register/Login user
    print("1. Registering test user...")
    register_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD,
        "mobile": "9876543210"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/auth/register", json=register_data)
        if response.status_code == 200:
            print("✅ User registered successfully")
        elif response.status_code == 400 and "already exists" in response.text:
            print("ℹ️  User already exists, proceeding with login")
        else:
            print(f"❌ Registration failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return False
    
    # Step 2: Login to get token
    print("2. Logging in...")
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json().get("access_token")
            print("✅ Login successful")
        else:
            print(f"❌ Login failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Step 3: Test invoice scan endpoint
    print("3. Testing invoice scan endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create test image data
    test_image_base64 = create_test_image()
    
    scan_data = {
        "image_base64": test_image_base64
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/invoice/scan", json=scan_data, headers=headers)
        print(f"Response status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Invoice scan endpoint is working!")
            print(f"Response structure: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ Invoice scan failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Invoice scan error: {e}")
        return False

def test_frontend_integration():
    """Test if frontend can access the backend"""
    print("\n4. Testing frontend-backend integration...")
    
    try:
        # Check if frontend is running
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running on port 3000")
        else:
            print("❌ Frontend not accessible")
            return False
            
        # Check if backend is accessible from frontend's perspective
        response = requests.get(f"{BACKEND_URL}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is accessible")
            return True
        else:
            print("❌ Backend not accessible")
            return False
            
    except Exception as e:
        print(f"❌ Integration test error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Invoice Scanning Tests")
    print("=" * 50)
    
    # Test backend functionality
    backend_success = test_invoice_scan()
    
    # Test frontend integration
    frontend_success = test_frontend_integration()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"Backend Invoice Scan: {'✅ PASS' if backend_success else '❌ FAIL'}")
    print(f"Frontend Integration: {'✅ PASS' if frontend_success else '❌ FAIL'}")
    
    if backend_success and frontend_success:
        print("\n🎉 All tests passed! Invoice scanning functionality is ready.")
    else:
        print("\n⚠️  Some tests failed. Check the logs above for details.")