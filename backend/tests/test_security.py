import pytest

from app.core.security import (
    WeakPasswordError,
    get_password_hash,
    validate_password_strength,
    verify_password,
)


def test_validate_password_strength_accepts_long_password():
    validate_password_strength("ValidPassword123!")
    validate_password_strength("x" * 12)


def test_validate_password_strength_rejects_short_password():
    with pytest.raises(WeakPasswordError):
        validate_password_strength("short")
    with pytest.raises(WeakPasswordError):
        validate_password_strength("11charsXXxx")


def test_get_password_hash_produces_verifiable_hash():
    password = "ValidPassword123!"
    hashed = get_password_hash(password)
    assert hashed and hashed != password
    assert verify_password(password, hashed) is True


def test_verify_password_rejects_wrong_password():
    hashed = get_password_hash("ValidPassword123!")
    assert verify_password("WrongPassword456!", hashed) is False


def test_verify_password_returns_false_for_invalid_hash():
    assert verify_password("ValidPassword123!", "not-a-bcrypt-hash") is False


def test_get_password_hash_uses_unique_salt():
    a = get_password_hash("ValidPassword123!")
    b = get_password_hash("ValidPassword123!")
    assert a != b
    assert verify_password("ValidPassword123!", a)
    assert verify_password("ValidPassword123!", b)
