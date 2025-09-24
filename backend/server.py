from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, BackgroundTasks
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
    
    for account in default_accounts:
        await db.accounts.insert_one(account.dict())

async def create_super_admin():
    existing_admin = await db.users.find_one({"role": UserRole.SUPER_ADMIN})
    if not existing_admin:
        admin_user = User(
            username="superadmin",
            email="admin@finsecure.com",
            business_name="System Administration",
            role=UserRole.SUPER_ADMIN,
            is_active=True,
            is_verified=True,
            permissions=["*"]  # All permissions
        )
        
        admin_password = hash_password("SecureAdmin@2024!")
        admin_dict = admin_user.dict()
        admin_dict["password"] = admin_password
        
        await db.users.insert_one(admin_dict)
        await create_default_accounts(admin_user.id)
        
        # Create initial invite codes
        invite_codes = [
            InviteCode(code="SECURE2024", created_by=admin_user.id, usage_limit=100),
            InviteCode(code="ADMIN2024", created_by=admin_user.id, usage_limit=10),
            InviteCode(code="VIP2024", created_by=admin_user.id, usage_limit=5)
        ]
        
        for invite in invite_codes:
            await db.invite_codes.insert_one(invite.dict())

# API Routes - Enhanced Authentication
@api_router.post("/auth/register", response_model=TokenResponse)
@limiter.limit("5/minute")
async def register_user(request: Request, user_data: UserCreate, background_tasks: BackgroundTasks):
    try:
        # Check invite code
        invite = await db.invite_codes.find_one({
            "code": user_data.invite_code, 
            "is_active": True,
            "$or": [
                {"expires_at": {"$gt": datetime.now(timezone.utc)}},
                {"expires_at": None}
            ]
        })
        
        if not invite or invite["usage_count"] >= invite["usage_limit"]:
            background_tasks.add_task(
                log_security_event,
                "invalid_invite_code",
                "MEDIUM",
                None,
                request.client.host,
                {"invite_code": user_data.invite_code}
            )
            raise HTTPException(status_code=400, detail="Invalid or expired invite code")
        
        # Check existing user
        existing_user = await db.users.find_one({
            "$or": [{"username": user_data.username}, {"email": user_data.email}]
        })
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create user
        hashed_password = hash_password(user_data.password)
        user = User(
            username=user_data.username,
            email=user_data.email,
            business_name=user_data.business_name
        )
        
        user_dict = user.dict()
        user_dict["password"] = hashed_password
        await db.users.insert_one(user_dict)
        
        # Update invite code usage
        await db.invite_codes.update_one(
            {"code": user_data.invite_code},
            {
                "$inc": {"usage_count": 1},
                "$push": {"used_by": {"user_id": user.id, "used_at": datetime.now(timezone.utc)}}
            }
        )
        
        # Create accounts and generate tokens
        await create_default_accounts(user.id)
        tokens = generate_tokens(user.id)
        
        background_tasks.add_task(log_audit_event, AuditAction.CREATE, "user", user.id, {"action": "registration"}, request)
        
        return TokenResponse(**tokens, user=user)
        
    except HTTPException:
        raise
    except Exception as e:
        background_tasks.add_task(
            log_security_event,
            "registration_error",
            "HIGH",
            None,
            request.client.host,
            {"error": str(e)}
        )
        raise HTTPException(status_code=500, detail="Registration failed")

@api_router.post("/auth/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login_user(request: Request, login_data: UserLogin, background_tasks: BackgroundTasks):
    user_doc = await db.users.find_one({"username": login_data.username})
    
    if not user_doc or not verify_password(login_data.password, user_doc["password"]):
        # Log failed attempt
        if user_doc:
            await db.users.update_one(
                {"username": login_data.username},
                {"$inc": {"failed_login_attempts": 1}}
            )
            
            # Lock account after 5 failed attempts
            if user_doc.get("failed_login_attempts", 0) >= 4:  # Will be 5 after increment
                lock_until = datetime.now(timezone.utc) + timedelta(minutes=30)
                await db.users.update_one(
                    {"username": login_data.username},
                    {"$set": {"locked_until": lock_until}}
                )
        
        background_tasks.add_task(
            log_security_event,
            "failed_login",
            "MEDIUM",
            user_doc.get("id") if user_doc else None,
            request.client.host,
            {"username": login_data.username}
        )
        
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_doc.items() if k != "password"})
    
    # Check if account is locked
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        raise HTTPException(status_code=423, detail="Account is temporarily locked")
    
    # Check 2FA if enabled
    if user.two_factor_enabled:
        if not login_data.totp_code:
            raise HTTPException(status_code=428, detail="2FA code required")
        
        if not verify_2fa_token(user.two_factor_secret, login_data.totp_code):
            background_tasks.add_task(
                log_security_event,
                "failed_2fa",
                "HIGH",
                user.id,
                request.client.host,
                {"username": login_data.username}
            )
            raise HTTPException(status_code=401, detail="Invalid 2FA code")
    
    # Reset failed attempts and update last login
    await db.users.update_one(
        {"username": login_data.username},
        {
            "$set": {
                "last_login": datetime.now(timezone.utc),
                "failed_login_attempts": 0,
                "locked_until": None
            }
        }
    )
    
    tokens = generate_tokens(user.id)
    background_tasks.add_task(log_audit_event, AuditAction.LOGIN, "user", user.id, request=request)
    
    return TokenResponse(**tokens, user=user)

# Admin Dashboard APIs
@api_router.get("/admin/dashboard/stats", response_model=DashboardStats)
async def get_admin_dashboard_stats(current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})
    total_transactions = await db.transactions.count_documents({})
    
    # Calculate total revenue
    revenue_pipeline = [
        {"$match": {"transaction_type": "cash_in"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.transactions.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Security events count (last 24 hours)
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    security_events = await db.security_events.count_documents({"timestamp": {"$gte": yesterday}})
    failed_logins = await db.security_events.count_documents({
        "event_type": "failed_login",
        "timestamp": {"$gte": yesterday}
    })
    
    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_transactions=total_transactions,
        total_revenue=total_revenue,
        security_events=security_events,
        failed_logins=failed_logins
    )

# Basic API Routes
@api_router.get("/")
async def root():
    return {"message": "Secure Financial Dashboard API"}

@api_router.get("/dashboard/summary", response_model=dict)
async def get_dashboard_summary(current_user: User = Depends(get_current_user)):
    # Calculate receivables (what others owe you)
    receivables_account = await db.accounts.find_one({"user_id": current_user.id, "name": "Accounts Receivable"})
    receivables = receivables_account["balance"] if receivables_account else 0.0
    
    # Calculate payables (what you owe others)
    payables_account = await db.accounts.find_one({"user_id": current_user.id, "name": "Accounts Payable"})
    payables = payables_account["balance"] if payables_account else 0.0
    
    return {
        "you_will_give": abs(payables),
        "you_will_receive": receivables,
        "net_position": receivables - abs(payables)
    }

# Transaction APIs
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction_data: dict, current_user: User = Depends(get_current_user)):
    # Get accounts based on transaction type
    if transaction_data.get("transaction_type") == "cash_in":
        cash_account = await db.accounts.find_one({"user_id": current_user.id, "name": "Cash"})
        revenue_account = await db.accounts.find_one({"user_id": current_user.id, "name": "Sales Revenue"})
        debit_account_id = cash_account["id"]
        credit_account_id = revenue_account["id"]
    else:  # CASH_OUT
        cash_account = await db.accounts.find_one({"user_id": current_user.id, "name": "Cash"})
        expense_account = await db.accounts.find_one({"user_id": current_user.id, "name": "Operating Expenses"})
        debit_account_id = expense_account["id"]
        credit_account_id = cash_account["id"]
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        description=transaction_data.get("description"),
        amount=transaction_data.get("amount"),
        transaction_type=transaction_data.get("transaction_type"),
        debit_account=debit_account_id,
        credit_account=credit_account_id
    )
    
    # Save transaction
    await db.transactions.insert_one(transaction.dict())
    
    # Update account balances (double-entry)
    if transaction_data.get("transaction_type") == "cash_in":
        await db.accounts.update_one({"id": debit_account_id}, {"$inc": {"balance": transaction_data.get("amount")}})
        await db.accounts.update_one({"id": credit_account_id}, {"$inc": {"balance": transaction_data.get("amount")}})
    else:
        await db.accounts.update_one({"id": debit_account_id}, {"$inc": {"balance": transaction_data.get("amount")}})
        await db.accounts.update_one({"id": credit_account_id}, {"$inc": {"balance": -transaction_data.get("amount")}})
    
    return transaction

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(current_user: User = Depends(get_current_user)):
    transactions = await db.transactions.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [Transaction(**transaction) for transaction in transactions]

@api_router.get("/accounts", response_model=List[Account])
async def get_accounts(current_user: User = Depends(get_current_user)):
    accounts = await db.accounts.find({"user_id": current_user.id}).to_list(100)
    return [Account(**account) for account in accounts]

# Admin Invite Code Management  
@api_router.post("/admin/invite-codes", response_model=InviteCode)
async def create_invite_code(current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    invite_code = InviteCode(
        code=str(uuid.uuid4())[:8].upper(),
        created_by=current_user.id
    )
    
    await db.invite_codes.insert_one(invite_code.dict())
    return invite_code

@api_router.get("/admin/invite-codes", response_model=List[InviteCode])
async def get_invite_codes(current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    invite_codes = await db.invite_codes.find({"created_by": current_user.id}).sort("created_at", -1).to_list(100)
    return [InviteCode(**invite_code) for invite_code in invite_codes]
async def get_dashboard_stats(current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))):
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})
    total_transactions = await db.transactions.count_documents({})
    
    # Calculate total revenue
    revenue_pipeline = [
        {"$match": {"transaction_type": "cash_in"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.transactions.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Security events count (last 24 hours)
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    security_events = await db.security_events.count_documents({"timestamp": {"$gte": yesterday}})
    failed_logins = await db.security_events.count_documents({
        "event_type": "failed_login",
        "timestamp": {"$gte": yesterday}
    })
    
    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_transactions=total_transactions,
        total_revenue=total_revenue,
        security_events=security_events,
        failed_logins=failed_logins
    )

@api_router.get("/admin/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    query = {}
    if search:
        query = {
            "$or": [
                {"username": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"business_name": {"$regex": search, "$options": "i"}}
            ]
        }
    
    users = await db.users.find(query, {"password": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {"users": users, "total": total}

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role_data: dict,
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    new_role = role_data.get("role")
    if new_role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": new_role}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    await log_audit_event(
        AuditAction.UPDATE,
        "user_role",
        current_user.id,
        {"target_user": user_id, "new_role": new_role}
    )
    
    return {"message": "Role updated successfully"}

@api_router.get("/admin/audit-logs")
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    query = {}
    if action:
        query["action"] = action
    if user_id:
        query["user_id"] = user_id
    
    logs = await db.audit_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.audit_logs.count_documents(query)
    
    return {"logs": logs, "total": total}

@api_router.get("/admin/security-events")
async def get_security_events(
    skip: int = 0,
    limit: int = 100,
    severity: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    query = {}
    if severity:
        query["severity"] = severity
    
    events = await db.security_events.find(query).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.security_events.count_documents(query)
    
    return {"events": events, "total": total}

# Include the router in the main app
app.include_router(api_router)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    return response

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await create_super_admin()
    logger.info("Secure Financial Dashboard API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()