/**
 * Rule 4: Assert real values, not the mock round-trip.
 *
 * The function under test fetches raw invoice line items from an API
 * client and turns them into a single total in a target currency.
 * The API client is mocked. There are two ways to write the assertion:
 *
 *   BAD  - assert that the function returns exactly what the mock was
 *          configured to hand back. This is tautological: you told the
 *          mock to return X, then asserted you got X. The function's
 *          own logic (summation, currency conversion) is never tested.
 *          Delete the entire body and replace it with `return mockData`
 *          and the test still passes.
 *
 *   GOOD - assert the concrete value the function PRODUCES from the
 *          mocked input: the summed, converted total. This fails if the
 *          summation, the conversion rate, or the rounding regresses,
 *          which is the actual business logic worth protecting.
 *
 * Syntax is jest-style. The file is illustrative and has no runtime
 * dependencies; it is meant to be read alongside the blog post.
 */

// --- subject under test -----------------------------------------------------

// Static FX table. In production this would itself come from a source;
// here it is a constant so the example stays dependency-free.
const USD_PER_EUR = 1.1;

// `apiClient.getInvoiceLines(id)` returns line items priced in EUR.
// `fetchInvoiceTotal` sums them and converts the total to USD.
async function fetchInvoiceTotal(apiClient, invoiceId) {
  const lines = await apiClient.getInvoiceLines(invoiceId);
  const totalEur = lines.reduce(
    (sum, line) => sum + line.amountEur * line.quantity,
    0
  );
  const totalUsd = totalEur * USD_PER_EUR;
  return Math.round(totalUsd * 100) / 100;
}

// --- fixtures ---------------------------------------------------------------

// What the mocked API client is configured to return.
const MOCK_LINES = [
  { sku: 'seat', amountEur: 50, quantity: 2 }, // 100 EUR
  { sku: 'support', amountEur: 30, quantity: 1 }, // 30 EUR
];
// totalEur = 130, converted at 1.1 => 143.00 USD

describe('fetchInvoiceTotal', () => {
  // BAD: asserts the function returns exactly the mock's payload.
  //
  // Why it is bad: the expected value is the mock's configured return,
  // restructured by hand. The test proves only that the mock was wired
  // up, not that `fetchInvoiceTotal` sums or converts anything. If the
  // conversion factor is dropped, or the quantities are ignored, this
  // assertion still passes because it never computes the real answer.
  it('BAD: asserts the function echoes the mocked lines', async () => {
    const apiClient = {
      getInvoiceLines: jest.fn().mockResolvedValue(MOCK_LINES),
    };

    const lines = await apiClient.getInvoiceLines('inv-1');

    // Tautology: we configured the mock to return MOCK_LINES, then
    // assert we got MOCK_LINES back. The unit under test is bypassed.
    expect(lines).toEqual(MOCK_LINES);
  });

  // GOOD: asserts the value the function PRODUCES from the mocked input.
  //
  // Why it is good: 143.00 is not something the mock returns; it is the
  // result of the function's own summation and currency conversion.
  // Break the conversion (or the reduce) and this expectation no longer
  // holds, so the test fails and names the regression.
  it('GOOD: asserts the summed, converted total in USD', async () => {
    const apiClient = {
      getInvoiceLines: jest.fn().mockResolvedValue(MOCK_LINES),
    };

    const total = await fetchInvoiceTotal(apiClient, 'inv-1');

    expect(total).toBe(143.0);
    expect(apiClient.getInvoiceLines).toHaveBeenCalledWith('inv-1');
  });

  it('GOOD: an empty invoice converts to a zero total', async () => {
    const apiClient = {
      getInvoiceLines: jest.fn().mockResolvedValue([]),
    };

    const total = await fetchInvoiceTotal(apiClient, 'inv-empty');

    expect(total).toBe(0);
  });
});

module.exports = { fetchInvoiceTotal };
