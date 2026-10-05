"""Checkout test: the prompt drives, the code verifies."""

from jev_browser_tests.runner import run_test

URL = "https://www.saucedemo.com"
GOAL = (
    "Log in with username standard_user and password secret_sauce, "
    "add the Sauce Labs Backpack to the cart, open the cart, "
    "check out with first name Test, last name User, zip code 12345, and finish. "
    "Stop at the order confirmation page."
)


def verify(page):
    assert "Thank you for your order" in page.get("text", ""), (
        "order confirmation not visible"
    )


def test_checkout():
    assert run_test("checkout", URL, GOAL, verify)
