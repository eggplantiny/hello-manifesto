<script setup lang="ts">
import type { HelloDomain } from './domain/hello.domain'
import { createManifesto } from '@manifesto-ai/sdk'
import { onUnmounted, ref } from 'vue'
import HelloMel from './domain/hello.mel'

const {
  subscribe,
  MEL,
  dispatchAsync,
  createIntent,
  getSnapshot,
  getAvailableActions,
} = createManifesto<HelloDomain>(HelloMel, {}).activate()

// Initial values from snapshot — not hardcoded
const snapshot = getSnapshot()
const counter = ref(snapshot.data.counter)
const doubled = ref(snapshot.computed.doubled)
const canDecrement = ref(snapshot.computed.canDecrement)
const availableActions = ref(getAvailableActions())

// Subscribe — each returns an unsubscribe function
const unsubs = [
  subscribe(s => s.data.counter, v => counter.value = v),
  subscribe(s => s.computed.doubled, v => doubled.value = v),
  subscribe(s => s.computed.canDecrement, v => canDecrement.value = v),
  subscribe(() => getAvailableActions(), v => availableActions.value = v),
]

onUnmounted(() => unsubs.forEach(fn => fn()))

function increment() {
  dispatchAsync(createIntent(MEL.actions.increment))
}

function decrement() {
  dispatchAsync(createIntent(MEL.actions.decrement))
}
</script>

<template>
  <div>
    <h1>Hello Mel Counter</h1>

    <p>Available Actions: {{ availableActions.join(', ') }}</p>

    <p>
      <button @click="increment">
        +
      </button>
    </p>

    <p>Counter: {{ counter }}</p>
    <p>Doubled: {{ doubled }}</p>

    <p>
      <button :disabled="!canDecrement" @click="decrement">
        -
      </button>
    </p>
  </div>
</template>
