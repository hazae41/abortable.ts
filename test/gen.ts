import { Abortable } from "../mod.ts";

export function gen() {
  return Abortable.create((ok, err) => {
    const id = setTimeout(ok, 1000, "Hello")
    return () => clearTimeout(id)
  })
}