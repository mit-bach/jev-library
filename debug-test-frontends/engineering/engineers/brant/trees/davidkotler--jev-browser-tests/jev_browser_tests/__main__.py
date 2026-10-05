"""Run the whole demo suite:  python -m jev_browser_tests  (from the project root)"""

import sys

from jev_browser_tests.runner import run_test

from tests.test_login import URL, GOAL as LOGIN_GOAL, verify as verify_login
from tests.test_cart import GOAL as CART_GOAL, verify as verify_cart
from tests.test_checkout import GOAL as CHECKOUT_GOAL, verify as verify_checkout


def main():
    results = [
        run_test("login", URL, LOGIN_GOAL, verify_login),
        run_test("add-to-cart", URL, CART_GOAL, verify_cart),
        run_test("checkout", URL, CHECKOUT_GOAL, verify_checkout),
    ]
    print(f"\n{sum(results)}/{len(results)} passed")
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main())
