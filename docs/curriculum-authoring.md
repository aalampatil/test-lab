# Writing and maintaining course content

## Add an in-browser exercise

1. Add a lesson to `src/lib/curriculum/interactive-lessons.ts` with a stable ID, stage, difficulty, numeric order, objective, explanation, hint, JS source, typed source, and meaningful example cases.
2. Register its allowlisted subject and deliberately incorrect variants in `src/lib/testing/additional-subjects.ts`.
3. Add a required-input check. Count values that feed assertions, not unrelated calls merely appearing in the file.
4. Keep syntax support narrow. Do not introduce eval, generic function execution, network, filesystem access, or subprocess execution into the interpreter.
5. Verify a correct worked test completes, trivial assertions do not complete, and deliberate wrong implementations are detected.

The existing curriculum integrity suite discovers added in-browser lessons automatically. A matcher is useful only when its semantics match the behavior being taught.

## Add a real-project lab

Add an entry to `repository-lessons.ts` using the `lab` helper. Include:

- Prerequisite stage and realistic difficulty.
- An explanation of the test’s purpose and limits.
- Exact target filename, source files, run command, and expected output.
- Specific actions the learner must perform, including a deliberate failure.
- A complete worked example that runs with the practice project’s actual dependencies.
- A knowledge question with one correct answer and an explanation.
- An honest self-reported completion checklist.

Do not route these examples through the local interpreter or present fabricated results. TestLab cannot verify a private local terminal run.

## Keep TaskBoard source consistent

`src/lib/curriculum/practice-project.ts` is the canonical starter representation used by source panels and verification. `practice-project/` is the actual learner workspace.

```sh
node scripts/materialize-practice-project.mjs
```

This is a maintainer command. **It overwrites starter source/config files.** Do not run it over your personal practice changes without preserving them. It does not populate lab solutions into the normal tests folder.

After changing a starter source, update the canonical representation, regenerate intentionally, inspect the diff, and run example verification. Installed dependencies and generated verification fixtures must never be committed.

## Add concepts and terminology

Append concepts to `src/lib/curriculum/concepts.ts`. Give each a concrete explanation, example, question, three plausible choices, and an unambiguous answer. Distinguish overlapping labels: a smoke or regression test describes a purpose, while unit or end-to-end describes scope.

Keep glossary entries short but precise, including a concrete example. Avoid claiming that coverage, automated scanning, a schema, or a green build proves complete correctness.

Preserve the order of existing concepts because progress uses append-only indices. A future migration can replace these with explicit immutable slugs.

## Documentation and commits

Update `docs/README.md`, the root README, and the study plan when the course changes materially. Commit content, execution support, interface changes, tests, and minor fixes separately as requested by the project owner.
