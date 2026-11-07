from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint("user_id", "category", "period", name="uq_budget_user_category_period"),
        CheckConstraint("period IN ('weekly', 'monthly', 'annual')", name="ck_budget_period"),
        CheckConstraint("limit_amount > 0", name="ck_budget_limit_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    category: Mapped[str] = mapped_column(String(80))
    period: Mapped[str] = mapped_column(String(20), default="monthly")
    limit_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))

    user = relationship("User", back_populates="budgets")