# Abortable promises for Deno

Promises with an abort() method and a cleanup function.

## Install 

    deno cache -r https://deno.land/x/abortable/mod.ts

## Test

Catch

    deno run https://deno.land/x/abortable/test/catch.ts

Race

    deno run https://deno.land/x/abortable/test/race.ts

## Simple usage

```typescript
import { Abortable } from "https://deno.land/x/abortable/mod.ts"

const timeout = new Abortable((ok, err) => {
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

## Usage with fetch

```typescript
import { Abort, Abortable } from "https://deno.land/x/abortable/mod.ts"

const request = Abort.fetch("...", { ... })
request.abort()
```

## Usage with race

```typescript
import { Abort, Abortable } from "https://deno.land/x/abortable/mod.ts"

const first = new Abortable((ok, err) => {
  const id = setTimeout(ok, 1000)
  return () => clearTimeout(id) // Abort function
})

const second = new Abortable((ok, err) => {
  const id = setTimeout(ok, 2000)
  return () => clearTimeout(id) // Abort function
})

// Wait for the first promise to settle
// Then call the abort function of the other
await Abort.race([first, second])
```