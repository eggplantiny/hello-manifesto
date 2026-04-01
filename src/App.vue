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
} = createManifesto<HelloDomain>(HelloMel, {})
  .activate()

const snapshot = getSnapshot()
const counter = ref(snapshot.data.counter)
const doubled = ref(snapshot.computed.doubled)
const canDecrement = ref(snapshot.computed.canDecrement)
const availableActions = ref(getAvailableActions())

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
  <main class="hello-app">
    <h1>Hello Mel Counter</h1>
    <p class="intro">
      This sample shows how UI events become intents in Manifesto.
    </p>

    <div class="snapshot">
      <p><strong>Available Actions</strong>: {{ availableActions.join(', ') }}</p>
      <p><strong>Counter</strong>: {{ counter }}</p>
      <p><strong>Doubled</strong>: {{ doubled }}</p>
    </div>

    <div class="actions">
      <button @click="increment">
        +
      </button>
      <button :disabled="!canDecrement" @click="decrement">
        -
      </button>
    </div>
  </main>
</template>
