import pytest

from routes.check_password import check_password


def test_check_password():
    assert check_password(None) == None