import { Abortable, isAbortable } from "./type.ts"

export function create<T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void,
    signal?: AbortSignal
  ) => (() => void) | void
) {
  const aborter = new AbortController()
  const signal = aborter.signal

  const promise = new Promise<T>((resolve, reject) => {
    const clean = executor(resolve, reject, signal)

    signal.onabort = () => {
      if (clean) clean();
      reject(signal);
    }
  }).finally(() => {
    signal.onabort = null
  })

  return new Abortable(promise, aborter)
}

export function race<T>(promises: Promise<T>[]) {
  return Promise.race(promises)
    .finally(() => abort(promises))
}

export function abort(promises: Promise<unknown>[]) {
  for (const promise of promises)
    if (isAbortable(promise)) promise.abort()
}

export function fetch(input: string | URL | Request, init?: RequestInit) {
  const aborter = new AbortController()
  const signal = aborter.signal
  const promise = window.fetch(input, { signal, ...init })
  return new Abortable(promise, aborter)
}