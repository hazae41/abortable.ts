import { Abort } from "../mod.ts";

export function gen() {
  return Abort.create((ok, err) => {
    const id = setTimeout(ok, 1000, "Hello")
    return () => clearTimeout(id)
  })
}