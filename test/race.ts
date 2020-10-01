import { Abort, Abortable } from "../mod.ts";

const first = Abortable.create((ok, err) => {
  const id = setTimeout(ok, 1000, "first")

  return () => {
    clearTimeout(id)
    console.log("Aborted first")
  }
})

const second = Abortable.create((ok, err) => {
  const id = setTimeout(ok, 2000, "second")

  return () => {
    clearTimeout(id)
    console.log("Aborted second")
  }
})

// When one of them win the race, the other should be aborted
const result = await Abort.race([first, second])
console.log("Done", result)