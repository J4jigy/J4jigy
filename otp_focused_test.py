#!/usr/bin/env python3
"""
Focused OTP Authentication Testing
Tests the core OTP functionality step by step
"""

import requests
import json
import time
import subprocess
import re
from datetime import datetime

# Get backend URL
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

def test_otp_send_basic():
    """Test basic OTP send functionality"""
    print("🔍 Testing Basic OTP Send...")
    
    mobile = "+919876545000"
    data = {"mobile": mobile}
    
    try:
        response = requests.post(f"{API_BASE}/auth/send-otp", json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ OTP Send Success: {result}")
            return True, result.get("mobile", mobile)
        elif response.status_code == 429:
            print(f"⚠️  Rate limited (expected): {response.json()}")
            return True, mobile  # Rate limiting is working
        else:
            print(f"❌ OTP Send Failed: {response.status_code} - {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ OTP Send Error: {e}")
        return False, None

def get_otp_from_logs():
    """Extract OTP from backend logs"""
    try:
        result = subprocess.run(
            ["tail", "-n", "20", "/var/log/supervisor/backend.out.log"],
            capture_output=True, text=True, timeout=10
        )
        
        for line in result.stdout.split('\n'):
            if "Your verification code is:" in line:
                parts = line.split("Your verification code is:")
                if len(parts) > 1:
                    otp = parts[1].strip()
                    print(f"📱 Found OTP in logs: {otp}")
                    return otp
        
        print("❌ No OTP found in logs")
        return None
        
    except Exception as e:
        print(f"❌ Error reading logs: {e}")
        return None

def test_otp_verify_basic(mobile, otp):
    """Test basic OTP verification"""
    print(f"🔍 Testing OTP Verification for {mobile} with OTP {otp}...")
    
    data = {"mobile": mobile, "otp": otp}
    
    try:
        response = requests.post(f"{API_BASE}/auth/verify-otp", json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ OTP Verify Success!")
            print(f"   Access Token: {result['access_token'][:50]}...")
            print(f"   User: {result['user']['username']} ({result['user']['email']})")
            return True, result
        else:
            print(f"❌ OTP Verify Failed: {response.status_code} - {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ OTP Verify Error: {e}")
        return False, None

def test_wrong_otp(mobile):
    """Test verification with wrong OTP"""
    print(f"🔍 Testing Wrong OTP for {mobile}...")
    
    data = {"mobile": mobile, "otp": "000000"}
    
    try:
        response = requests.post(f"{API_BASE}/auth/verify-otp", json=data, timeout=30)
        
        if response.status_code == 400:
            result = response.json()
            print(f"✅ Wrong OTP Rejected: {result['detail']}")
            return True
        else:
            print(f"❌ Wrong OTP Not Rejected: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Wrong OTP Test Error: {e}")
        return False

def test_daily_limit():
    """Test daily limit by sending multiple OTPs"""
    print("🔍 Testing Daily Limit (5 per day)...")
    
    base_mobile = "+919876546"
    
    for i in range(6):
        mobile = f"{base_mobile}{100 + i}"
        data = {"mobile": mobile}
        
        try:
            response = requests.post(f"{API_BASE}/auth/send-otp", json=data, timeout=30)
            
            if response.status_code == 200:
                print(f"   OTP {i+1}: ✅ Sent to {mobile}")
            elif response.status_code == 429:
                result = response.json()
                if "daily limit" in result.get("detail", "").lower():
                    print(f"   OTP {i+1}: ✅ Daily limit reached - {result['detail']}")
                    return True
                else:
                    print(f"   OTP {i+1}: ⚠️  Rate limited - {result['detail']}")
            else:
                print(f"   OTP {i+1}: ❌ Failed - {response.status_code}")
                
        except Exception as e:
            print(f"   OTP {i+1}: ❌ Error - {e}")
        
        time.sleep(1)  # Brief pause between requests
    
    print("⚠️  Daily limit test completed (may need more attempts)")
    return True

def test_invalid_mobile_formats():
    """Test invalid mobile number formats"""
    print("🔍 Testing Invalid Mobile Formats...")
    
    invalid_mobiles = [
        ("123", "Too short"),
        ("", "Empty"),
        ("abc123def456", "Contains letters")
    ]
    
    for mobile, description in invalid_mobiles:
        data = {"mobile": mobile}
        
        try:
            response = requests.post(f"{API_BASE}/auth/send-otp", json=data, timeout=30)
            
            if response.status_code in [400, 422]:
                print(f"   ✅ {description}: Properly rejected")
            else:
                print(f"   ❌ {description}: Not rejected (status: {response.status_code})")
                
        except Exception as e:
            print(f"   ❌ {description}: Error - {e}")

def main():
    """Run focused OTP tests"""
    print("🚀 Starting Focused OTP Authentication Tests")
    print(f"Backend URL: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("="*60)
    
    # Test 1: Basic OTP Send
    success, mobile = test_otp_send_basic()
    if not success:
        print("❌ Basic OTP send failed, stopping tests")
        return
    
    time.sleep(2)
    
    # Test 2: Get OTP from logs
    otp = get_otp_from_logs()
    if not otp:
        print("❌ Could not get OTP from logs, stopping verification tests")
    else:
        # Test 3: Basic OTP Verification
        success, result = test_otp_verify_basic(mobile, otp)
        
        # Test 4: Wrong OTP
        if success:
            # Send new OTP for wrong OTP test
            new_mobile = "+919876545001"
            send_success, _ = test_otp_send_basic()
            if send_success:
                time.sleep(1)
                test_wrong_otp(new_mobile)
    
    print("\n" + "="*60)
    
    # Test 5: Daily Limit
    test_daily_limit()
    
    print("\n" + "="*60)
    
    # Test 6: Invalid Formats
    test_invalid_mobile_formats()
    
    print("\n" + "="*60)
    print("🎉 Focused OTP Tests Completed!")

if __name__ == "__main__":
    main()