# hello-manifesto

![hello-manifesto banner](./banner.png)

Welcome to hello-manifesto.
This repository is an onboarding project for beginners who want to try Manifesto MEL with a minimal Vue 3 app.

## What this project teaches

By the end of this sample, you should understand:

- How to define state, computed values, and actions in MEL.
- How to create and activate a Manifesto runtime.
- How the UI reads runtime snapshots instead of mutating data directly.
- How to dispatch intents (increment, decrement) from UI actions.

## 1) Prerequisites

- Node.js installed (recent LTS recommended)
- `pnpm` installed

## 2) Install and run

```bash
pnpm install
pnpm dev
```

Then open the local dev URL shown by Vite (usually `http://localhost:5173`).

### Quick checks

- Press `+` and watch `Counter` increase.
- Confirm `Doubled` updates automatically.
- Confirm `-` is disabled when `Counter` is `0`.

## 3) Core files

```text
.
├─ src/
│  ├─ App.vue                  # Connects Vue UI and Manifesto snapshot
│  ├─ main.ts                  # Vue app entry point
│  ├─ style.css                # Basic styles
│  └─ domain/
│     ├─ hello.mel             # Domain model written in MEL
│     └─ hello.domain.ts       # Manually provided domain typing
└─ README.md
```

## 4) How it works (step-by-step)

### Step 1. Define the domain in MEL

`src/domain/hello.mel`:

```mel
domain HelloDomain {
    state {
        hello: string = "Hello, World!"
        counter: number = 0
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

### Step 2. Activate runtime and read the first snapshot

In `App.vue`, runtime is created and activated, and the first snapshot is read for initial UI values.

```ts
const {
  subscribe,
  MEL,
  dispatchAsync,
  createIntent,
  getSnapshot,
  getAvailableActions,
} = createManifesto<HelloDomain>(HelloMel, {}).activate()

const snapshot = getSnapshot()
const counter = ref(snapshot.data.counter)
const doubled = ref(snapshot.computed.doubled)
const canDecrement = ref(snapshot.computed.canDecrement)
const availableActions = ref(getAvailableActions())
```

### Step 3. Subscribe and keep UI in sync

```ts
const unsubs = [
  subscribe(s => s.data.counter, v => counter.value = v),
  subscribe(s => s.computed.doubled, v => doubled.value = v),
  subscribe(s => s.computed.canDecrement, v => canDecrement.value = v),
  subscribe(() => getAvailableActions(), v => availableActions.value = v),
]
```

When the component unmounts, the unsubscribe functions are called.

### Step 4. Dispatch intents from UI events

```ts
dispatchAsync(createIntent(MEL.actions.increment))
dispatchAsync(createIntent(MEL.actions.decrement))
```

## 5) Recommended first onboarding exercises

1. Change initial value in `hello.mel` and observe how snapshot updates.
2. Add a new computed value (ex. `isEven`).
3. Add a new action that increments by 2.
4. Add one safety guard using `available when`.

## 6) Notes

- This is intentionally small and educational.
