/**
 * Rule 1: Assert observable behavior, not implementation details.
 *
 * The function under test computes a cart total after applying a
 * tier-based discount. There are two ways to test it:
 *
 *   BAD  - spy on an internal helper and assert it was called.
 *          This couples the test to HOW the function works, not WHAT
 *          it returns. The assertion stays green even when the math
 *          is wrong, as long as the internal helper still runs.
 *
 *   GOOD - assert the actual returned total for a concrete input.
 *          This tests WHAT the caller observes. It goes red the
 *          moment the output is wrong, which is the only thing the
 *          rest of the system actually depends on.
 *
 * Syntax is jest-style (`describe` / `it` / `expect`). The file is
 * illustrative and has no runtime dependencies; it is meant to be
 * read alongside the blog post, not executed.
 */

// --- subject under test -----------------------------------------------------

const DISCOUNT_RATES = {
  standard: 0,
  silver: 0.1,
  gold: 0.2,
};

// Internal helper. Note: this is an implementation detail. Callers do
// not care that it exists; they only care about the total they get back.
function discountRateFor(tier) {
  return DISCOUNT_RATES[tier] ?? 0;
}

function applyDiscount(cart, tier) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const rate = discountRateFor(tier);
  return Math.round(subtotal * (1 - rate) * 100) / 100;
}

// --- the helpers module the BAD test reaches into ---------------------------
// In a real codebase `discountRateFor` would be imported from a module so a
// spy could replace it. We expose it here to mirror that shape.
const helpers = { discountRateFor };

function applyDiscountViaHelpers(cart, tier) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const rate = helpers.discountRateFor(tier);
  return Math.round(subtotal * (1 - rate) * 100) / 100;
}

// --- fixtures ---------------------------------------------------------------

const cart = {
  items: [
    { name: 'keyboard', price: 80, quantity: 1 },
    { name: 'mouse', price: 20, quantity: 2 },
  ],
};
// subtotal = 80 + (20 * 2) = 120
// gold tier => 20% off => 96.00

describe('applyDiscount', () => {
  // BAD: spies on the internal helper and asserts it was called.
  //
  // Why it is bad: this passes as long as `discountRateFor` is invoked,
  // even if `applyDiscount` later multiplies by the wrong factor, drops
  // a line item, or returns `subtotal` untouched. The discount could be
  // completely broken and this test would still be green, because it
  // never looks at the number the caller receives.
  it('BAD: asserts the internal helper was called', () => {
    const spy = jest.spyOn(helpers, 'discountRateFor');

    applyDiscountViaHelpers(cart, 'gold');

    expect(spy).toHaveBeenCalledWith('gold');
    expect(spy).toHaveBeenCalledTimes(1);
    // No assertion on the returned total. If the math regresses, this
    // test does not notice.

    spy.mockRestore();
  });

  // GOOD: asserts the observable result for a concrete input.
  //
  // Why it is good: it pins the exact value the caller depends on.
  // If anyone breaks the discount math (wrong rate, missing item,
  // off-by-one rounding), the expected total no longer matches and
  // the test fails loudly, pointing straight at the regression.
  it('GOOD: asserts the returned total for a gold-tier cart', () => {
    const total = applyDiscount(cart, 'gold');

    expect(total).toBe(96.0);
  });

  it('GOOD: standard tier returns the full subtotal', () => {
    const total = applyDiscount(cart, 'standard');

    expect(total).toBe(120.0);
  });
});

module.exports = { applyDiscount };
