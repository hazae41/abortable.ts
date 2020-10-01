import type { Abortable } from "../mod.ts"

import { gen } from "./gen.ts"

/**
 * This should test how we can manipulate an abortable
 * just like a promise, only with the type definition
 * @param abortable An object that implements the abortable type
 */
export function test<T>(abortable: Abortable<T>) {
  const test = abortable
    .then(it => "Modified!", e => new Error("Catched!"))
    .then(it => console.log("Resolved", it))
    .catch((e) => console.error("Rejected", e))
    .finally(() => console.log("Done"))
    .abort() // Comment this to test the resolve part
}

test(gen())