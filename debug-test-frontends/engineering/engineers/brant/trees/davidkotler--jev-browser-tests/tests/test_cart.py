"""Add-to-cart test: the prompt drives, the code verifies."""

from jev_browser_tests.runner import run_test

URL = "https://www.saucedemo.com"
GOAL = (
    "Log in with username standard_user and password secret_sauce, "
    "then add the Sauce Labs Backpack to the cart. "
    "Stop when the cart badge shows 1."
)


def verify(page):
    labels = [a.get("label", "") for a in page.get("actions", [])]
    assert any(label.strip() == "1" for label in labels), (
        "cart badge '1' not found. labels seen: " + str(labels[:25])
    )


def test_cart():
    assert run_test("add-to-cart", URL, GOAL, verify)
