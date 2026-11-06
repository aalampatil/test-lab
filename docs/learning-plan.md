# Your study plan

The goal is to explain and protect behavior in your own code, not to memorize matcher names. You do not need to finish all 40 concepts before trying a test.

## A session that works

1. Read one concept and explain it in your own words.
2. Predict the function or user journey’s result before running anything.
3. Write the test yourself, using Arrange–Act–Assert.
4. Run it and read the complete failure if it fails.
5. Introduce one deliberate bug and prove your assertion catches it.
6. Restore the correct implementation and get a passing run.
7. Record what the test establishes, and one thing it does not establish.

Keep sessions manageable: one lesson is a useful unit of practice. Return to earlier exercises when you cannot yet explain why an assertion passes.

## Suggested order

| Stage             | What you practice                                                                                 | Ready to move on when…                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Foundations       | Testing purpose, levels, assertions, cases, coverage                                              | You can distinguish an expected value from an actual result.                             |
| Start small       | Addition, strings, shipping boundaries, cart arrays                                               | You can write a useful assertion without copying the example.                            |
| Strong unit tests | Objects, invalid inputs, permissions, rounding, mutation, exceptions, regressions                 | Your tests catch a deliberate implementation bug and include a meaningful negative case. |
| Async and doubles | Promises, rejections, dependency injection, mocks, spies, fake timers                             | You know what stays real and why the test must await its result.                         |
| Components        | Accessible controls, typing, submitting, validation, loading, recovery                            | You can verify what a user sees and does without inspecting private React state.         |
| Services          | File storage, HTTP round trips, rejected writes, schemas                                          | You can check status and body, inspect side effects, and isolate resources.              |
| Real browser      | Smoke, complete journeys, reload, keyboard, axe, screenshots                                      | You can test a real journey without fixed sleeps or unreviewed baselines.                |
| Advanced strategy | Generated properties, measured budgets, mutations, coverage, type checks, CI, exploratory testing | You can choose the right test layer and state the limits of its evidence.                |

The Testing glossary is a reference, not another memorization task. Search terms such as fixture, oracle, shrinking, authorization, and flaky test when they come up.

## Use your own application

After each stage, choose one behavior in your application:

- **Unit:** a price rule, transformation, validator, or permission decision.
- **Async:** successful and failed loading, retries, cancellation, or a timer.
- **Component:** a user can complete a form and understand an error.
- **API:** a request creates the right data; an invalid or unauthorized one does not.
- **Integration:** real serialization or a real disposable storage boundary works.
- **End-to-end:** one critical journey works through the real UI and API.

Write down the requirement, inputs, expected outcome, and risk first. Use the cheapest test level that can reliably expose the failure. Avoid moving every assertion into an expensive browser journey.

## Keep a personal learning log

Create a note containing:

```text
Behavior:
Risk if it breaks:
Test level and why:
Where the test file lives:
Command:
Expected result:
Failure I observed:
Fix and passing evidence:
What this test does not prove:
```

For repository labs, TestLab records your own practice report after a knowledge check and checklist. It cannot inspect your local terminal or certify an external test run. Keep your actual test files and results as evidence.

## Terminology still worth exploring later

The course introduces the common categories and explains nearby terms, including load/stress/soak testing and consumer contracts. A production database integration suite, distributed consumer-contract deployment, sustained load infrastructure, full security assessment, and manual assistive-technology audit need deeper projects and their own environments. Completing this course gives you a base to tackle those; it does not make every application fully tested.
