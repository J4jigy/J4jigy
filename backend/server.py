from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, BackgroundTasks, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import hashlib
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
import json
import asyncio
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
db = client[os.environ['DB_NAME']]

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
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000,https://fintracker-56.preview.emergentagent.com').split(',')
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
from fastapi.responses import Response

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

# ===================== New List Endpoints =====================

class ListItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    subtitle: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None  # ISO date string
    status: Optional[str] = None


def prepare_for_mongo(item: Dict[str, Any]) -> Dict[str, Any]:
    data = item.copy()
    if isinstance(data.get('date'), datetime):
        data['date'] = data['date'].date().isoformat()
    return data


def serialize_item(doc: Dict[str, Any]) -> Dict[str, Any]:
    out = {k: v for k, v in doc.items() if k != '_id'}
    return out


async def fetch_list(collection_name: str, user_id: str, search: Optional[str], sort: str, page: int, page_size: int):
    query: Dict[str, Any] = {"user_id": user_id}
    if search:
        regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"name": regex},
            {"subtitle": regex}
        ]

    sort_map = {
        'name_asc': ("name", 1),
        'name_desc': ("name", -1),
        'amount_asc': ("amount", 1),
        'amount_desc': ("amount", -1),
        'newest': ("date", -1),
        'oldest': ("date", 1)
    }
    sort_key, sort_dir = sort_map.get(sort, ("name", 1))

    skip = max(0, (page - 1) * page_size)
    cursor = db[collection_name].find(query).sort(sort_key, sort_dir).skip(skip).limit(page_size)
    docs = await cursor.to_list(length=page_size)
    items = [serialize_item(d) for d in docs]
    total = await db[collection_name].count_documents(query)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@api_router.get("/lists/{list_name}")

@api_router.options("/{path:path}")
async def api_options_catch_all(path: str):
    return Response(status_code=204)

async def list_items(
    list_name: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(default=None),

from fastapi import Header

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

# Catch-all OPTIONS to satisfy any preflight
@app.options("/{path:path}")
async def catch_all_options(path: str):
    return Response(status_code=204)

        'invoices': 'invoices',
        'ratings': 'ratings'
    }
    if list_name not in allowed:
        raise HTTPException(status_code=404, detail="List not found")

    data = await fetch_list(allowed[list_name], current_user.id, search, sort, page, page_size)
    await log_audit_event(AuditAction.READ, f"list:{list_name}", current_user.id, {"search": search, "sort": sort}, request, True)
    return data


# ===================== Auth + Summary Minimal Endpoints (restore) =====================

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

# Mount the router
app.include_router(api_router)