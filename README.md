# How to Write Good Test Assertions

Companion code for the Autonoma blog post 'How to Write Good Test Assertions'. Side-by-side bad vs good test assertions in plain JavaScript, no runtime dependencies.

> Companion code for the Autonoma blog post: **[How to Write Good Test Assertions](https://getautonoma.com/blog/how-to-write-good-test-assertions)**

## Requirements

None. Plain JavaScript files, dependency-free. Node 18+ if you want to run `node --check`.

## Quickstart

```bash
git clone https://github.com/Autonoma-Tools/how-to-write-good-test-assertions.git
cd how-to-write-good-test-assertions
# Read the files alongside the blog post. They are illustrative jest-style
# examples and are not wired to a test runner.
```

## Project structure

```
.
├── LICENSE
├── README.md
├── package.json
└── src
    ├── rule1-observable-vs-implementation.test.js
    └── rule4-real-values-vs-mock-roundtrip.test.js
```

- `src/` — primary source files for the snippets referenced in the blog post.

## What each example demonstrates

- **`src/rule1-observable-vs-implementation.test.js`** — Rule 1: assert observable behavior, not implementation. A **BAD** test spies on an internal helper and asserts it was called (it stays green even when the discount math is broken) sitting next to a **GOOD** test that asserts the actual returned total for a concrete input (it goes red the moment the output is wrong).
- **`src/rule4-real-values-vs-mock-roundtrip.test.js`** — Rule 4: assert real values, not the mock round-trip. A **BAD** test asserts the function returns exactly what the mock was configured to hand back (tautological, always passes) sitting next to a **GOOD** test that asserts the real summed and currency-converted value the function produces (it fails if the processing logic breaks).

## About

This repository is maintained by [Autonoma](https://getautonoma.com) as reference material for the linked blog post. Autonoma builds autonomous AI agents that plan, execute, and maintain end-to-end tests directly from your codebase.

If something here is wrong, out of date, or unclear, please [open an issue](https://github.com/Autonoma-Tools/how-to-write-good-test-assertions/issues/new).

## License

Released under the [MIT License](./LICENSE) © 2026 Autonoma Labs.
