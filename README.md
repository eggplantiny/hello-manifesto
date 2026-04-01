# hello-manifesto

A minimal counter example that connects a Manifesto MEL domain to a Vue 3 UI.

This repository is intentionally small. Its job is to show the core loop clearly: define state and actions in MEL, create a runtime with `createManifesto()`, and let Vue subscribe to the Snapshot and render the result.

## What This Shows

- `src/domain/hello.mel` defines state, computed values, and actions.
- `src/App.vue` activates a Manifesto instance and subscribes to the Snapshot.
- `increment` and `decrement` are dispatched as intents.
- Computed values like `doubled` and `canDecrement` flow directly into the UI.
- `decrement()` is guarded by `available when canDecrement`, so the counter never goes below zero.

## Stack

| Area | Choice |
| --- | --- |
| UI | Vue 3 |
| Build | Vite |
| Language | TypeScript |
| Domain | MEL |
| Runtime | `@manifesto-ai/sdk` |
| Lineage wrapper | `@manifesto-ai/lineage` |
| Codegen experiment | `@manifesto-ai/compiler`, `@manifesto-ai/codegen` |

## Quick Start

```bash
pnpm install
pnpm dev
```

Once the Vite dev server is running, you can immediately verify the behavior:

1. Click `+` to increase `counter` by 1.
2. `doubled` updates automatically as `counter * 2`.
3. The `-` button is only enabled while `counter > 0`.

Production build and preview:

```bash
pnpm build
pnpm preview
```

## How It Works

### 1. Define the MEL domain

`src/domain/hello.mel` declares the domain state and rules.

```mel
domain HelloDomain {
    state {
        hello: string
        counter: number
    }

    computed doubled = mul(counter, 2)
    computed canDecrement = gt(counter, 0)

    action increment() {
        onceIntent {
            patch counter = add(counter, 1)
        }
    }

    action decrement() available when canDecrement {
        onceIntent {
            patch counter = sub(counter, 1)
        }
    }
}
```

Key points:

- State changes happen through `patch`.
- Action bodies are wrapped in `onceIntent`, so they run once per intent.
- Button enablement comes from the computed value `canDecrement`, not from ad hoc UI logic.

### 2. Activate the Manifesto instance

In `src/App.vue`, the app creates the Manifesto runtime from the MEL source and exposes the runtime API through `withLineage(...).activate()`.

```ts
const { subscribe, MEL, dispatchAsync, createIntent } = withLineage(
  createManifesto<HelloDomain>(HelloMel, {}),
  {},
).activate()
```

The important point is that Vue does not own the business state directly. It reacts to Manifesto Snapshot updates.

### 3. Subscribe to Snapshot and dispatch intents

The UI subscribes to `data` and `computed` values from the Snapshot.

```ts
subscribe(snapshot => snapshot.data.counter, value => counter.value = value)
subscribe(snapshot => snapshot.computed.doubled, value => doubled.value = (value as number))
subscribe(snapshot => snapshot.computed.canDecrement, value => canDecrement.value = (value as boolean))
```

Button clicks dispatch intents instead of calling mutation logic directly.

```ts
dispatchAsync(createIntent(MEL.actions.increment))
dispatchAsync(createIntent(MEL.actions.decrement))
```

In short: the UI reads Snapshot state, user input becomes intents, and the domain rules live in MEL.

## Project Structure

```text
.
├─ src/
│  ├─ App.vue                  # Connects the Vue UI to the Manifesto runtime
│  ├─ main.ts                  # App entry point
│  ├─ style.css                # App styles
│  └─ domain/
│     ├─ hello.mel             # MEL domain definition
│     └─ hello.domain.ts       # Manual type definition used by this example
├─ generated/
│  └─ types.ts                 # Codegen experiment output
├─ scripts/
│  └─ codegen.mjs              # Compiler/codegen experiment script
└─ README.md
```

## Notes

- This is a small learning example focused on Snapshot-based flow, not a full application.
- The example currently uses a manual type definition in `src/domain/hello.domain.ts`.
- `generated/types.ts` and `scripts/codegen.mjs` are experiment artifacts and are not part of the default runtime path.

## Where To Extend Next

- Connect the `hello` state to an actual greeting in the UI
- Add an effect and flow asynchronous input back into the Snapshot
- Replace the manual type with generated types
- Expand the example from a single counter into a richer domain with more actions and flows
