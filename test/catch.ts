import { Abort } from "../mod.ts"

const timeout = Abort.create((ok, err) => {
  const id = setTimeout(ok, 1000)
  return () => clearTimeout(id) // Abort function
})

timeout.abort() // Call the abort function and reject with AbortSignal

try {
  await timeout // Will throw AbortSignal because it has been aborted
} catch (e) {
  if (e instanceof AbortSignal) // Check if it has been aborted or if it's a normal error
    console.error("Aborted!")
}