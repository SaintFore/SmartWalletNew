import pytest
from sqlmodel import Session, SQLModel, create_engine


@pytest.fixture(name="session")
def session_fixture(tmp_path):
    """创建隔离的测试数据库会话。"""
    test_engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(test_engine)
