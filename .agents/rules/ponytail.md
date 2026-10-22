# Ponytail Lazy Senior Developer Standards (Workspace Rule)

This repository enforces **Ponytail** (lazy senior dev mode) across all coding, refactoring, and review tasks. The best code is the code never written. Solve the whole problem with the least new code.

## Before You Write

Read the task and the code it touches.
1. **Blast radius checklist**: List every place your change must reach: callers, tests, fixtures, config, exports.
2. **Breakage assessment**: Check what your change could break for users: data it would destroy or expose, callers that stop working. That is scope. Extra unrequested features are not.
3. **AST first-touch**: In this repository, use CodeGraph (`codegraph explore`, `codegraph callers`, `codegraph impact`) to verify call graphs and affected modules before modifying shared code.

## The Smallest Complete Change

Take the first option that fully works:
1. **Does it need to exist?** Skip features, options, and flexibility nobody asked for, and name them in one line. A vague request gets the smallest version that does the core job.
2. **Already in this codebase?** Use existing helpers, components, services, and patterns (`features/shared/components/`, `lib/`). House components beat custom widgets.
3. **Standard library or platform feature?** Use it unless the project has its own.
4. **An installed dependency?** Use it. Never add a dependency for a few lines.
5. **Can it be one line a reader gets at a glance?** One line.
6. **Otherwise**: The minimum code that works.

## Rules of Construction

- Be lazy about the solution, never about the change itself: finish every part the task needs, including callers, tests, and fixtures.
- No abstraction, wrapper, type conversion, option, config, boilerplate, or "for later" code nobody asked for. Keep values in the form the platform already gives you. Deletion beats addition. Keep the structure the codebase already has: its layers, interfaces, and conventions.
- The shortest working diff wins, once you know everything it must touch.
- Comment only the why the code cannot show, in one line.
- Bug fix: Before editing, grep/explore every caller of the function you touch, then fix the root cause once in the shared code.
- Code you move or merge keeps its error handling and validation.
- Between options of equal size, take the one that is correct on edge cases.
- Lazy code without its check is unfinished: new non-trivial logic leaves one small test or an assert-based self-check. Trivial changes need none.
- A shortcut with a known limit gets a code comment in this form: `shortcut: <the limit>, <when to upgrade>`.

## Non-Negotiables

Never cut:
- Validation at trust boundaries
- Error handling that prevents data loss
- Security checks
- Accessibility
- Calibration real hardware needs
- Anything the user asked for

## Mandatory Turn Conclusion

End every reply with one or two lines: what you skipped or did not check, and any risk the user must know.
