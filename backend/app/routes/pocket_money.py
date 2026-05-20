from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import PocketMoneyAccount, Transaction, Participant
from app.schemas.schemas import (
    PocketMoneyAccountCreate,
    TransactionCreate,
    Transaction as TransactionSchema
)

router = APIRouter()

@router.post("/accounts/")
def create_pocket_money_account(
    account: PocketMoneyAccountCreate,
    db: Session = Depends(get_db)
):
    """Create a pocket money account for a participant."""
    existing = db.query(PocketMoneyAccount).filter(
        PocketMoneyAccount.participant_id == account.participant_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account already exists")

    db_account = PocketMoneyAccount(
        participant_id=account.participant_id,
        initial_balance=account.initial_balance,
        current_balance=account.initial_balance
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/accounts/")
def get_all_accounts(camp_id: int, db: Session = Depends(get_db)):
    """Get all pocket money accounts for a camp."""
    # Get all participants in camp, then their accounts
    participants = db.query(Participant).filter(Participant.camp_id == camp_id).all()
    accounts = db.query(PocketMoneyAccount).filter(
        PocketMoneyAccount.participant_id.in_([p.id for p in participants])
    ).all()
    return accounts

@router.get("/accounts/{participant_id}")
def get_account(participant_id: int, db: Session = Depends(get_db)):
    """Get pocket money account for a participant."""
    account = db.query(PocketMoneyAccount).filter(
        PocketMoneyAccount.participant_id == participant_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.post("/transactions/")
def create_transaction(
    transaction: TransactionCreate,
    ma_user_id: int,
    db: Session = Depends(get_db)
):
    """Create a transaction (scanner/shop)."""
    account = db.query(PocketMoneyAccount).filter(
        PocketMoneyAccount.participant_id == transaction.participant_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Check balance
    if account.current_balance < transaction.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Current: {account.current_balance}, Required: {transaction.amount}"
        )

    # Create transaction
    db_transaction = Transaction(
        participant_id=transaction.participant_id,
        account_id=account.id,
        product_name=transaction.product_name,
        amount=transaction.amount,
        description=transaction.description,
        ma_user_id=ma_user_id
    )
    db.add(db_transaction)

    # Update account balance
    account.current_balance -= transaction.amount
    db.add(account)

    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/transactions/{participant_id}")
def get_transactions(participant_id: int, db: Session = Depends(get_db)):
    """Get all transactions for a participant."""
    transactions = db.query(Transaction).filter(
        Transaction.participant_id == participant_id
    ).order_by(Transaction.created_at.desc()).all()
    return transactions

@router.post("/transactions/{transaction_id}/refund")
def refund_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Refund a transaction."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    account = db.query(PocketMoneyAccount).filter(
        PocketMoneyAccount.id == transaction.account_id
    ).first()

    # Reverse transaction
    account.current_balance += transaction.amount
    db.delete(transaction)
    db.commit()

    return {"message": "Transaction refunded", "new_balance": account.current_balance}

@router.post("/accounts/{participant_id}/set-balance")
def set_initial_balance(participant_id: int, balance: float, db: Session = Depends(get_db)):
    """Set initial balance for a participant."""
    account = db.query(PocketMoneyAccount).filter(
        PocketMoneyAccount.participant_id == participant_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    account.initial_balance = balance
    account.current_balance = balance
    db.commit()
    db.refresh(account)
    return account

@router.get("/statistics/{camp_id}")
def get_pocket_money_stats(camp_id: int, db: Session = Depends(get_db)):
    """Get pocket money statistics for a camp."""
    participants = db.query(Participant).filter(Participant.camp_id == camp_id).all()
    accounts = db.query(PocketMoneyAccount).filter(
        PocketMoneyAccount.participant_id.in_([p.id for p in participants])
    ).all()

    total_initial = sum(a.initial_balance for a in accounts)
    total_current = sum(a.current_balance for a in accounts)
    total_spent = total_initial - total_current

    return {
        "total_participants": len(participants),
        "total_initial": total_initial,
        "total_current": total_current,
        "total_spent": total_spent,
        "average_balance": total_current / len(accounts) if accounts else 0
    }
