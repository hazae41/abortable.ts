# Abortable promises for Deno

Promises with an abort() method and a cleanup function.

## Install 

    deno cache -r https://deno.land/x/abortable/mod.ts

## Test

Catch

    deno run https://deno.land/x/abortable/test/catch.ts

Race

    deno run https://deno.land/x/abortable/test/race.ts

## Usage with await

Abortables are just Promises but with an abort() method and an abort function

```typescript
import { Abort } from "https://deno.land/x/abortable/mod.ts"

const timeout = Abort.create((ok, err) => {
  const id = setTimeout(ok, 1000)
  return () => clearTimeout(id) // Abort function
})

timeout.abort() // Call the abort function and reject with AbortSignal

try{
  await timeout // Will throw AbortSignal because it has been aborted
} catch(e){
  if(e instanceof AbortSignal) // Check if it has been aborted
    // ...
}
```

## Usage with callbacks

Abortables fully implement the Promise interface and it works like a charm

```typescript
const test = abortable
    .then(it => "Modified!", e => new Error("Catched!"))
    .then(it => console.log("Resolved", it))
    .catch((e) => console.error("Rejected", e))
    .finally(() => console.log("Done"))
    .abort()
```

## Usage with fetch

Abortable comes with a shortcut for window.fetch that returns `Abortable<Response>`

```typescript
import { Abort, Abortable } from "https://deno.land/x/abortable/mod.ts"

// Shortcut for window.fetch with an abort controller
const request = Abort.fetch("...", { ... })
request.abort() // Will abort the request
```

## Usage with race

Abortable is very useful for racing strategies where we want to abort loosers

```typescript
import { Abort, Abortable } from "https://deno.land/x/abortable/mod.ts"

const first = Abort.create((ok, err) => {
  const id = setTimeout(ok, 1000)
  return () => clearTimeout(id) // Abort function
})

const second = Abort.create((ok, err) => {
  const id = setTimeout(ok, 2000)
  return () => clearTimeout(id) // Abort function
})

// Wait for the first promise to settle
// Then call the abort function of the other
await Abort.race([first, second])
```

## Usage with a custom abort signal receiver

The Abortable factory comes with an extra `signal` parameter that allows you to pass the signal to any third-party library that uses abort signals

```typescript
const abortable = Abort.create((ok, err, signal) => {
  fetch("...", { signal }).then(ok, err)
  // No cleanup function since window.fetch is aborted by the signal
})
```

## Usage with a custom AbortController

You can create custom Abortables with a promise and an abort controller

```typescript
const aborter = new AbortController()
const signal = aborter.signal

const promise = fetch("...", { signal })
const abortable = new Abortable(promise, aborter)
```