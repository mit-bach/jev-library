"""Login test: the prompt drives, the code verifies."""

from jev_browser_tests.runner import run_test

URL = "https://www.saucedemo.com"
GOAL = (
    "Log in with username standard_user and password secret_sauce. "
    "Stop when the products page is visible."
)


def verify(page):
    assert "inventory.html" in page["url"], f"not on inventory page: {page['url']}"


def test_login():
    assert run_test("login", URL, GOAL, verify)
