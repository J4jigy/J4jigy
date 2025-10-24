from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Query, Header
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, validator, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from enum import Enum
import pyotp
import qrcode
import io
import base64
from PIL import Image
from cryptography.fernet import Fernet
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY', Fernet.generate_key().decode())
cipher_suite = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'fintracker_db')
db = client[db_name]

# Create the main app without a prefix
app = FastAPI(
    title="Secure Financial Dashboard API",
    description="High-security financial management system",
    version="2.0.0"
)

# Security Middleware
app.add_middleware(SlowAPIMiddleware)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"]  # Configure for production
)

# CORS (allow frontend hosts)
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000,https://petrolpump-finance.preview.emergentagent.com').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins if o.strip()],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Global CORS safety net to ensure headers on all responses and handle OPTIONS
@app.middleware("http")
async def cors_safety_net(request: Request, call_next):
    origin = request.headers.get("origin")
    # Handle preflight universally
    if request.method == "OPTIONS":
        resp = Response(status_code=204)
        if origin:
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Methods"] = request.headers.get("access-control-request-method", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        resp.headers["Access-Control-Allow-Headers"] = request.headers.get("access-control-request-headers", "Authorization, Content-Type, *")
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        return resp

    response = await call_next(request)
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"

class TransactionType(str, Enum):
    CASH_IN = "cash_in"
    CASH_OUT = "cash_out"

class AccountType(str, Enum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    INCOME = "income"
    EXPENSE = "expense"

class AuditAction(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    TRANSACTION = "transaction"
    ADMIN_ACTION = "admin_action"

# Enhanced Security Models
class PasswordPolicy(BaseModel):
    min_length: int = 12
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special: bool = True
    max_age_days: int = 90

class SecuritySettings(BaseModel):
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 30
    session_timeout_minutes: int = 120
    require_2fa: bool = False
    password_policy: PasswordPolicy = PasswordPolicy()

# Enhanced User Model
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    business_name: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    password_changed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    two_factor_enabled: bool = False
    two_factor_secret: Optional[str] = None
    permissions: List[str] = []

    @validator('username')
    def username_validator(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', v):
            raise ValueError('Username must be 3-20 characters, alphanumeric and underscore only')
        return v

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    business_name: str
    invite_code: str

    @validator('password')
    def password_validator(cls, v):
        if len(v) < 12:
            raise ValueError('Password must be at least 12 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letters')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letters')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain numbers')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain special characters')
        return v

class UserLogin(BaseModel):
    username: str
    password: str
    totp_code: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User

# Audit Log Model
class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    action: AuditAction
    resource: str
    details: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    success: bool = True

# Security Event Model
class SecurityEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved: bool = False

# Enhanced Models
class InviteCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    used_by: Optional[str] = None
    used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True
    usage_limit: int = 1
    usage_count: int = 0

class Account(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    account_type: AccountType
    balance: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    description: str
    amount: float
    transaction_type: TransactionType
    debit_account: str
    credit_account: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_by: Optional[str] = None
    status: str = "completed"

# Dashboard Analytics Models
class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_transactions: int
    total_revenue: float
    security_events: int
    failed_logins: int

class SystemHealth(BaseModel):
    uptime: str
    cpu_usage: float
    memory_usage: float
    database_status: str
    api_response_time: float

# Security Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_tokens(user_id: str) -> Dict[str, Any]:
    # Access Token
    access_payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access"
    }
    access_token = jwt.encode(access_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    # Refresh Token
    refresh_payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        "type": "refresh"
    }
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

def generate_2fa_secret() -> str:
    return pyotp.random_base32()

def generate_qr_code(user_email: str, secret: str) -> str:
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user_email,
        issuer_name="Secure FinDash"
    )
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode()

def verify_2fa_token(secret: str, token: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=1)

def encrypt_sensitive_data(data: str) -> str:
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_sensitive_data(encrypted_data: str) -> str:
    return cipher_suite.decrypt(encrypted_data.encode()).decode()

async def log_audit_event(
    action: AuditAction,
    resource: str,
    user_id: Optional[str] = None,
    details: Dict[str, Any] = {},
    request: Optional[Request] = None,
    success: bool = True
):
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        details=details,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("User-Agent") if request else None,
        success=success
    )
    await db.audit_logs.insert_one(audit_log.dict())

async def log_security_event(
    event_type: str,
    severity: str,
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    details: Dict[str, Any] = {}
):
    security_event = SecurityEvent(
        event_type=event_type,
        severity=severity,
        user_id=user_id,
        ip_address=ip_address,
        details=details
    )
    await db.security_events.insert_one(security_event.dict())

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        token_type = payload.get("type")
        
        if token_type != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user_doc = await db.users.find_one({"id": user_id})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        
        user = User(**{k: v for k, v in user_doc.items() if k != "password"})
        
        if not user.is_active:
            raise HTTPException(status_code=401, detail="User account is deactivated")
        
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Account is temporarily locked")
        
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(required_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=403, 
                detail=f"Required role: {required_roles}. Current role: {current_user.role}"
            )
        return current_user
    return role_checker

def require_permission(permission: str):
    def permission_checker(current_user: User = Depends(get_current_user)):
        if permission not in current_user.permissions and current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(status_code=403, detail=f"Permission required: {permission}")
        return current_user
    return permission_checker

# Initialize default accounts and admin user
async def create_default_accounts(user_id: str):
    default_accounts = [
        Account(user_id=user_id, name="Cash", account_type=AccountType.ASSET),
        Account(user_id=user_id, name="Accounts Receivable", account_type=AccountType.ASSET),
        Account(user_id=user_id, name="Inventory", account_type=AccountType.ASSET),
        Account(user_id=user_id, name="Accounts Payable", account_type=AccountType.LIABILITY),
        Account(user_id=user_id, name="Business Equity", account_type=AccountType.EQUITY),
        Account(user_id=user_id, name="Sales Revenue", account_type=AccountType.INCOME),
        Account(user_id=user_id, name="Operating Expenses", account_type=AccountType.EXPENSE),
        Account(user_id=user_id, name="Rent Expense", account_type=AccountType.EXPENSE),
    ]
    
    await db.accounts.insert_many([a.dict() for a in default_accounts])

# ===================== List Endpoints =====================
from fastapi import Header

@api_router.options("/{path:path}")
async def api_options_catch_all(path: str):
    return Response(status_code=204)

@api_router.options("/auth/send-otp")
async def options_send_otp(
    origin: Optional[str] = Header(default=None),
    access_control_request_headers: Optional[str] = Header(default=None),
    access_control_request_method: Optional[str] = Header(default=None),
):
    from fastapi.responses import Response
    resp = Response(status_code=204)
    if origin:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Methods"] = access_control_request_method or "POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = access_control_request_headers or "Authorization, Content-Type, *"
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    return resp

@api_router.options("/auth/verify-otp")
async def options_verify_otp(
    origin: Optional[str] = Header(default=None),
    access_control_request_headers: Optional[str] = Header(default=None),
    access_control_request_method: Optional[str] = Header(default=None),
):
    from fastapi.responses import Response
    resp = Response(status_code=204)
    if origin:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Methods"] = access_control_request_method or "POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = access_control_request_headers or "Authorization, Content-Type, *"
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    return resp

@api_router.options("/auth/login")
async def options_login(
    origin: Optional[str] = Header(default=None),
    access_control_request_headers: Optional[str] = Header(default=None),
    access_control_request_method: Optional[str] = Header(default=None),
):
    resp = Response(status_code=204)
    if origin:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Methods"] = access_control_request_method or "POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = access_control_request_headers or "Authorization, Content-Type, *"
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    return resp

# Helper function for fetching list data
async def fetch_list(collection_name: str, user_id: str, search: Optional[str], sort: str, page: int, page_size: int):
    """Fetch paginated list data from specified collection"""
    try:
        collection = db[collection_name]
        
        # Build query
        query = {"user_id": user_id}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        # Calculate total count
        total = await collection.count_documents(query)
        
        # Build sort criteria
        sort_field, sort_direction = ("name", 1) if sort == "name_asc" else ("name", -1)
        if sort == "date_desc":
            sort_field, sort_direction = ("created_at", -1)
        elif sort == "date_asc":
            sort_field, sort_direction = ("created_at", 1)
        
        # Get paginated results
        skip = (page - 1) * page_size
        cursor = collection.find(query).sort(sort_field, sort_direction).skip(skip).limit(page_size)
        items = await cursor.to_list(length=None)
        
        # Convert ObjectId to string for JSON serialization
        for item in items:
            if "_id" in item:
                item["id"] = str(item["_id"])
                del item["_id"]
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
        
    except Exception as e:
        print(f"Error in fetch_list: {e}")
        # Return empty result for collections that don't exist yet
        return {
            "items": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "total_pages": 0
        }

@api_router.get("/lists/{list_name}")
async def list_items(
    list_name: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(default=None),
    sort: str = Query(default='name_asc'),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200)
):
    allowed = {
        'customers': 'customers',
        'suppliers': 'suppliers',
        'staff': 'staff',
        'purchases': 'purchases',
        'bills': 'bills',
        'expenses': 'expenses',
        'invoices': 'invoices',
        'ratings': 'ratings'
    }
    if list_name not in allowed:
        raise HTTPException(status_code=404, detail="List not found")

    data = await fetch_list(allowed[list_name], current_user.id, search, sort, page, page_size)
    await log_audit_event(AuditAction.READ, f"list:{list_name}", current_user.id, {"search": search, "sort": sort}, request, True)
    return data

# ===================== Auth + Summary Endpoints =====================
class LoginRequest(BaseModel):
    username: str
    password: str

@api_router.post("/auth/login", response_model=TokenResponse)
async def auth_login(request: Request):
    content_type = request.headers.get('content-type', '')
    username = None
    password = None
    if content_type.startswith('application/x-www-form-urlencoded'):
        form = await request.form()
        username = form.get('username')
        password = form.get('password')
    else:
        data = await request.json()
        username = data.get('username')
        password = data.get('password')

    if not username or not password:
        raise HTTPException(status_code=400, detail="Missing credentials")

    user_doc = await db.users.find_one({"username": username})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    hashed = user_doc.get("password")
    if not hashed or not verify_password(password, hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = User(**{k: v for k, v in user_doc.items() if k != "password"})
    tokens = generate_tokens(user.id)

    await log_audit_event(AuditAction.LOGIN, "auth:login", user.id, {"username": user.username}, request, True)

    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        expires_in=tokens["expires_in"],
        user=user
    )

# In-memory OTP storage (in production, use Redis or database)
otp_storage = {}

class SendOTPRequest(BaseModel):
    mobile: str

class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str

@api_router.post("/auth/send-otp")
@limiter.limit("5/minute")
async def send_otp(payload: SendOTPRequest, request: Request):
    """Send OTP to mobile number"""
    mobile = payload.mobile.strip()
    
    # Validate mobile number format (10 digits)
    if not re.match(r'^\d{10}$', mobile):
        raise HTTPException(status_code=400, detail="Invalid mobile number format")
    
    # Check if user exists with this mobile number
    user_doc = await db.users.find_one({"phone": mobile})
    if not user_doc:
        # For now, allow OTP for any mobile (can be changed to require registration)
        # Create a temporary user entry or just send OTP
        pass
    
    # Generate 6-digit OTP
    otp = str(secrets.randbelow(900000) + 100000)
    
    # Store OTP with expiry (5 minutes)
    otp_storage[mobile] = {
        'otp': otp,
        'expires_at': datetime.now(timezone.utc) + timedelta(minutes=5),
        'attempts': 0
    }
    
    # In production, send SMS via Twilio, AWS SNS, or other SMS provider
    # For development, just log it
    print(f"OTP for {mobile}: {otp}")
    
    await log_audit_event(AuditAction.LOGIN, "auth:send-otp", None, {"mobile": mobile}, request, True)
    
    return {"message": "OTP sent successfully", "mobile": mobile}

@api_router.post("/auth/verify-otp", response_model=TokenResponse)
@limiter.limit("10/minute")
async def verify_otp(payload: VerifyOTPRequest, request: Request):
    """Verify OTP and login"""
    mobile = payload.mobile.strip()
    otp = payload.otp.strip()
    
    # Check if OTP exists
    if mobile not in otp_storage:
        raise HTTPException(status_code=400, detail="OTP not found or expired")
    
    stored_data = otp_storage[mobile]
    
    # Check if OTP is expired
    if datetime.now(timezone.utc) > stored_data['expires_at']:
        del otp_storage[mobile]
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Check attempts
    if stored_data['attempts'] >= 3:
        del otp_storage[mobile]
        raise HTTPException(status_code=400, detail="Too many failed attempts")
    
    # Verify OTP
    if stored_data['otp'] != otp:
        stored_data['attempts'] += 1
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # OTP verified successfully, remove from storage
    del otp_storage[mobile]
    
    # Find or create user
    user_doc = await db.users.find_one({"phone": mobile})
    
    if not user_doc:
        # Create new user with mobile number
        user_id = str(uuid.uuid4())
        user_doc = {
            "id": user_id,
            "username": f"user_{mobile}",
            "phone": mobile,
            "email": f"{mobile}@temp.com",
            "role": "owner",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    user = User(**{k: v for k, v in user_doc.items() if k != "password"})
    tokens = generate_tokens(user.id)
    
    await log_audit_event(AuditAction.LOGIN, "auth:verify-otp", user.id, {"mobile": mobile}, request, True)
    
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        expires_in=tokens["expires_in"],
        user=user
    )

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    business_name: str
    invite_code: str

@api_router.options("/auth/register")
async def options_register(
    origin: Optional[str] = Header(default=None),
    access_control_request_headers: Optional[str] = Header(default=None),
    access_control_request_method: Optional[str] = Header(default=None),
):
    resp = Response(status_code=204)
    if origin:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Methods"] = access_control_request_method or "POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = access_control_request_headers or "Authorization, Content-Type, *"
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    return resp

@api_router.post("/auth/register", response_model=TokenResponse)
async def auth_register(payload: RegisterRequest, request: Request):
    # Check if username exists
    existing = await db.users.find_one({"username": payload.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Validate invite code, if present. Allow fallback 'OPEN' for testing
    invite = await db.invite_codes.find_one({"code": payload.invite_code})
    if not invite and payload.invite_code != 'OPEN':
        raise HTTPException(status_code=400, detail="Invalid invite code")
    if invite:
        if not invite.get('is_active', True):
            raise HTTPException(status_code=400, detail="Invite code is inactive")
        limit = invite.get('usage_limit', 1)
        count = invite.get('usage_count', 0)
        if count >= limit and payload.invite_code != 'OPEN':
            raise HTTPException(status_code=400, detail="Invite code usage exceeded")

    hashed = hash_password(payload.password)
    user = User(
        username=payload.username,
        email=payload.email,
        business_name=payload.business_name,
        role=UserRole.USER,
        is_active=True
    )
    user_doc = user.dict()
    user_doc['password'] = hashed

    await db.users.insert_one(user_doc)

    # Update invite usage
    if invite:
        await db.invite_codes.update_one(
            {"code": payload.invite_code},
            {"$set": {"used_by": user.id, "used_at": datetime.now(timezone.utc)}, "$inc": {"usage_count": 1}}
        )

    # Create default accounts for user
    await create_default_accounts(user.id)

    tokens = generate_tokens(user.id)
    await log_audit_event(AuditAction.CREATE, "auth:register", user.id, {"username": user.username}, request, True)

    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        expires_in=tokens["expires_in"],
        user=user
    )

class DashboardSummary(BaseModel):
    you_will_give: float = 0.0
    you_will_receive: float = 0.0
    net_position: float = 0.0

@api_router.get("/dashboard/summary", response_model=DashboardSummary)
async def dashboard_summary(current_user: User = Depends(get_current_user)):
    # Compute sums from transactions collection if available
    you_will_give = 0.0
    you_will_receive = 0.0
    try:
        pipeline = [
            {"$match": {"user_id": current_user.id}},
            {"$group": {"_id": "$transaction_type", "total": {"$sum": "$amount"}}}
        ]
        cursor = db.transactions.aggregate(pipeline)
        async for doc in cursor:
            if doc["_id"] == TransactionType.CASH_OUT:
                you_will_give = float(doc["total"] or 0)
            elif doc["_id"] == TransactionType.CASH_IN:
                you_will_receive = float(doc["total"] or 0)
    except Exception:
        # Fallback to zeros if collection missing
        pass

    net = you_will_receive - you_will_give
    return DashboardSummary(you_will_give=you_will_give, you_will_receive=you_will_receive, net_position=net)

# ===================== Transaction Endpoints =====================

class TransactionCreate(BaseModel):
    description: str
    amount: float
    transaction_type: TransactionType
    debit_account: str = "Cash"
    credit_account: str = "General"

class CashTransactionCreate(BaseModel):
    description: str
    amount: float
    debit_account: str = "Cash"
    credit_account: str = "General"

class Contact(BaseModel):
    id: str
    user_id: str
    name: str
    type: str  # 'customer', 'supplier', 'staff'
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str = 'offline'  # 'online', 'offline'
    last_seen: Optional[str] = None
    avatar: str = '👤'
    created_at: datetime
    updated_at: datetime

class ContactCreate(BaseModel):
    name: str
    type: str
    email: Optional[str] = None
    phone: Optional[str] = None

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(
    transaction: TransactionCreate,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Create a new transaction"""
    try:
        # Create transaction document
        transaction_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "description": transaction.description,
            "amount": transaction.amount,
            "transaction_type": transaction.transaction_type,
            "debit_account": transaction.debit_account,
            "credit_account": transaction.credit_account,
            "created_at": datetime.now(timezone.utc),
            "status": "completed"
        }
        
        # Insert into database
        await db.transactions.insert_one(transaction_doc)
        
        # Log audit event
        await log_audit_event(
            AuditAction.CREATE,
            "transaction",
            current_user.id,
            {"amount": transaction.amount, "type": transaction.transaction_type},
            request,
            True
        )
        
        return Transaction(**transaction_doc)
        
    except Exception as e:
        await log_audit_event(
            AuditAction.CREATE,
            "transaction",
            current_user.id,
            {"error": str(e)},
            request,
            False
        )
        raise HTTPException(status_code=500, detail="Failed to create transaction")

@api_router.get("/transactions")
async def get_transactions(
    current_user: User = Depends(get_current_user),
    transaction_type: Optional[TransactionType] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200)
):
    """Get user's transactions with pagination"""
    try:
        # Build query
        query = {"user_id": current_user.id}
        if transaction_type:
            query["transaction_type"] = transaction_type
        
        # Get total count
        total = await db.transactions.count_documents(query)
        
        # Get paginated results
        skip = (page - 1) * page_size
        cursor = db.transactions.find(query).sort("created_at", -1).skip(skip).limit(page_size)
        transactions = await cursor.to_list(length=None)
        
        # Convert ObjectId to string
        for transaction in transactions:
            if "_id" in transaction:
                del transaction["_id"]
        
        return {
            "transactions": transactions,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")

@api_router.post("/transactions/cash-in", response_model=Transaction)
async def create_cash_in(
    transaction: CashTransactionCreate,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Create a cash-in transaction"""
    # Create TransactionCreate with the transaction_type set
    transaction_data = TransactionCreate(
        description=transaction.description,
        amount=transaction.amount,
        transaction_type=TransactionType.CASH_IN,
        debit_account=transaction.debit_account,
        credit_account=transaction.credit_account
    )
    return await create_transaction(transaction_data, request, current_user)

@api_router.post("/transactions/cash-out", response_model=Transaction)
async def create_cash_out(
    transaction: CashTransactionCreate,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Create a cash-out transaction"""
    # Create TransactionCreate with the transaction_type set
    transaction_data = TransactionCreate(
        description=transaction.description,
        amount=transaction.amount,
        transaction_type=TransactionType.CASH_OUT,
        debit_account=transaction.debit_account,
        credit_account=transaction.credit_account
    )
    return await create_transaction(transaction_data, request, current_user)

# ===================== Admin Endpoints =====================

@api_router.get("/admin/users")
async def get_admin_users(
    current_user: User = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200)
):
    """Get all users (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get total count
        total = await db.users.count_documents({})
        
        # Get paginated results
        skip = (page - 1) * page_size
        cursor = db.users.find({}).sort("created_at", -1).skip(skip).limit(page_size)
        users = await cursor.to_list(length=None)
        
        # Remove sensitive data and convert ObjectId
        for user in users:
            if "_id" in user:
                del user["_id"]
            if "password_hash" in user:
                del user["password_hash"]
        
        return {
            "users": users,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@api_router.get("/admin/invites")
async def get_admin_invites(
    current_user: User = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200)
):
    """Get all invite codes (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get total count
        total = await db.invite_codes.count_documents({})
        
        # Get paginated results
        skip = (page - 1) * page_size
        cursor = db.invite_codes.find({}).sort("created_at", -1).skip(skip).limit(page_size)
        invites = await cursor.to_list(length=None)
        
        # Convert ObjectId to string
        for invite in invites:
            if "_id" in invite:
                invite["id"] = str(invite["_id"])
                del invite["_id"]
        
        return {
            "invites": invites,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch invites")

@api_router.post("/admin/invites")
async def create_invite(
    current_user: User = Depends(get_current_user),
    expires_in_days: int = Query(default=30, ge=1, le=365)
):
    """Create a new invite code (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        invite_code = {
            "id": str(uuid.uuid4()),
            "code": str(uuid.uuid4())[:8].upper(),
            "created_by": current_user.id,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(days=expires_in_days),
            "max_uses": 1,
            "current_uses": 0,
            "is_active": True
        }
        
        await db.invite_codes.insert_one(invite_code)
        
        # Remove ObjectId for response
        if "_id" in invite_code:
            del invite_code["_id"]
        
        return invite_code
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create invite")

# ===================== Account Management Endpoints =====================

@api_router.get("/accounts")
async def get_accounts(
    current_user: User = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200)
):
    """Get user's accounts"""
    try:
        # Get total count
        query = {"user_id": current_user.id}
        total = await db.accounts.count_documents(query)
        
        # Get paginated results
        skip = (page - 1) * page_size
        cursor = db.accounts.find(query).sort("created_at", -1).skip(skip).limit(page_size)
        accounts = await cursor.to_list(length=None)
        
        # Convert ObjectId to string
        for account in accounts:
            if "_id" in account:
                account["id"] = str(account["_id"])
                del account["_id"]
        
        return {
            "accounts": accounts,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch accounts")

@api_router.post("/accounts")
async def create_account(
    account_data: dict,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Create a new account"""
    try:
        account_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "name": account_data.get("name", ""),
            "account_type": account_data.get("account_type", "asset"),
            "balance": account_data.get("balance", 0.0),
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.accounts.insert_one(account_doc)
        
        # Log audit event
        await log_audit_event(
            AuditAction.CREATE,
            "account",
            current_user.id,
            {"name": account_doc["name"]},
            request,
            True
        )
        
        # Remove ObjectId for response
        if "_id" in account_doc:
            del account_doc["_id"]
        
        return account_doc
        
    except Exception as e:
        await log_audit_event(
            AuditAction.CREATE,
            "account",
            current_user.id,
            {"error": str(e)},
            request,
            False
        )
        raise HTTPException(status_code=500, detail="Failed to create account")

# Contact management endpoints
@api_router.get("/contacts")
async def get_contacts(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Get all contacts for current user"""
    try:
        contacts = await db.contacts.find({"user_id": current_user.id}).to_list(length=None)
        return [Contact(**contact) for contact in contacts]
    except Exception as e:
        print(f"Error fetching contacts: {e}")
        return []

@api_router.post("/contacts", response_model=Contact)
async def create_contact(
    contact: ContactCreate,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Create or update a contact"""
    try:
        # Check if contact already exists by name and type
        existing = await db.contacts.find_one({
            "user_id": current_user.id,
            "name": contact.name,
            "type": contact.type
        })
        
        if existing:
            # Update existing contact
            updated_doc = {
                **existing,
                "email": contact.email,
                "phone": contact.phone,
                "updated_at": datetime.now(timezone.utc)
            }
            await db.contacts.update_one(
                {"id": existing["id"]}, 
                {"$set": updated_doc}
            )
            return Contact(**updated_doc)
        else:
            # Create new contact
            contact_doc = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                "name": contact.name,
                "type": contact.type,
                "email": contact.email,
                "phone": contact.phone,
                "status": "offline",
                "last_seen": None,
                "avatar": "👤" if contact.type == "customer" else "🏢" if contact.type == "supplier" else "👥",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            
            await db.contacts.insert_one(contact_doc)
            return Contact(**contact_doc)
    except Exception as e:
        print(f"Error creating contact: {e}")
        raise HTTPException(status_code=500, detail="Failed to create contact")

@api_router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Delete a contact"""
    try:
        result = await db.contacts.delete_one({
            "id": contact_id,
            "user_id": current_user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Contact not found")
        
        return {"message": "Contact deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting contact: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete contact")

# Health/Ping endpoint
@api_router.get("/ping")
async def ping():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}

# Mount the router
app.include_router(api_router)