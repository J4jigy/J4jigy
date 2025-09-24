from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import jwt
import bcrypt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
security = HTTPBearer()

# Enums
class TransactionType(str, Enum):
    CASH_IN = "cash_in"
    CASH_OUT = "cash_out"

class AccountType(str, Enum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    INCOME = "income"
    EXPENSE = "expense"

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    business_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_admin: bool = False

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    business_name: str
    invite_code: str

class UserLogin(BaseModel):
    username: str
    password: str

class InviteCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    used_by: Optional[str] = None
    used_at: Optional[datetime] = None
    is_active: bool = True

class Account(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    account_type: AccountType
    balance: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    description: str
    amount: float
    transaction_type: TransactionType
    debit_account: str
    credit_account: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    description: str
    amount: float
    transaction_type: TransactionType
    category: str

class DashboardSummary(BaseModel):
    total_receivables: float
    total_payables: float
    cash_balance: float
    monthly_income: float
    monthly_expenses: float

class FinancialSummary(BaseModel):
    you_will_give: float
    you_will_receive: float
    net_position: float

# Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {"user_id": user_id}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        user_doc = await db.users.find_one({"id": user_id})
        if not user_doc:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return User(**user_doc)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Initialize default accounts for new users
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

# API Routes - Authentication
@api_router.post("/auth/register")
async def register_user(user_data: UserCreate):
    # Check if invite code is valid
    invite = await db.invite_codes.find_one({"code": user_data.invite_code, "is_active": True, "used_by": None})
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid or expired invite code")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        business_name=user_data.business_name
    )
    
    # Save user to database
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    await db.users.insert_one(user_dict)
    
    # Mark invite code as used
    await db.invite_codes.update_one(
        {"code": user_data.invite_code},
        {"$set": {"used_by": user.id, "used_at": datetime.now(timezone.utc)}}
    )
    
    # Create default accounts for user
    await create_default_accounts(user.id)
    
    # Generate JWT token
    token = create_jwt_token(user.id)
    
    return {"access_token": token, "token_type": "bearer", "user": user}

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    user_doc = await db.users.find_one({"username": login_data.username})
    if not user_doc or not verify_password(login_data.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_doc.items() if k != "password"})
    token = create_jwt_token(user.id)
    
    return {"access_token": token, "token_type": "bearer", "user": user}

# Dashboard APIs
@api_router.get("/dashboard/summary", response_model=FinancialSummary)
async def get_dashboard_summary(current_user: User = Depends(get_current_user)):
    # Calculate receivables (what others owe you)
    receivables_account = await db.accounts.find_one({"user_id": current_user.id, "name": "Accounts Receivable"})
    receivables = receivables_account["balance"] if receivables_account else 0.0
    
    # Calculate payables (what you owe others)
    payables_account = await db.accounts.find_one({"user_id": current_user.id, "name": "Accounts Payable"})
    payables = payables_account["balance"] if payables_account else 0.0
    
    return FinancialSummary(
        you_will_give=abs(payables),
        you_will_receive=receivables,
        net_position=receivables - abs(payables)
    )

# Transaction APIs
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction_data: TransactionCreate, current_user: User = Depends(get_current_user)):
    # Get accounts based on transaction type
    if transaction_data.transaction_type == TransactionType.CASH_IN:
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
        description=transaction_data.description,
        amount=transaction_data.amount,
        transaction_type=transaction_data.transaction_type,
        debit_account=debit_account_id,
        credit_account=credit_account_id
    )
    
    # Save transaction
    await db.transactions.insert_one(transaction.dict())
    
    # Update account balances (double-entry)
    if transaction_data.transaction_type == TransactionType.CASH_IN:
        await db.accounts.update_one({"id": debit_account_id}, {"$inc": {"balance": transaction_data.amount}})
        await db.accounts.update_one({"id": credit_account_id}, {"$inc": {"balance": transaction_data.amount}})
    else:
        await db.accounts.update_one({"id": debit_account_id}, {"$inc": {"balance": transaction_data.amount}})
        await db.accounts.update_one({"id": credit_account_id}, {"$inc": {"balance": -transaction_data.amount}})
    
    return transaction

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(current_user: User = Depends(get_current_user)):
    transactions = await db.transactions.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [Transaction(**transaction) for transaction in transactions]

# Admin APIs
@api_router.post("/admin/invite-codes", response_model=InviteCode)
async def create_invite_code(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    invite_code = InviteCode(
        code=str(uuid.uuid4())[:8].upper(),
        created_by=current_user.id
    )
    
    await db.invite_codes.insert_one(invite_code.dict())
    return invite_code

@api_router.get("/admin/invite-codes", response_model=List[InviteCode])
async def get_invite_codes(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    invite_codes = await db.invite_codes.find({"created_by": current_user.id}).sort("created_at", -1).to_list(100)
    return [InviteCode(**invite_code) for invite_code in invite_codes]

# Basic API Routes
@api_router.get("/")
async def root():
    return {"message": "Financial Dashboard API"}

@api_router.get("/accounts", response_model=List[Account])
async def get_accounts(current_user: User = Depends(get_current_user)):
    accounts = await db.accounts.find({"user_id": current_user.id}).to_list(100)
    return [Account(**account) for account in accounts]

# Include the router in the main app
app.include_router(api_router)

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()