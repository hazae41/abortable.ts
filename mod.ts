export namespace Abort {
  export function race<T>(promises: Promise<T>[]) {
    return Promise.race(promises)
      .finally(() => Abort.abort(promises))
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
}

export interface Abortable<T> extends Promise<T> {
  readonly promise: Promise<T>
  readonly aborter: AbortController
  abort(): void

  then<TResult = T, TError = never>(
    onfullfilled?: ((value: T) => TResult | PromiseLike<TResult>) | null,
    onrejected?: ((reason: any) => TError | PromiseLike<TError>) | null
  ): Abortable<TResult | TError>

  catch<TError = never>(
    onrejected?: ((reason: any) => TError | PromiseLike<TError>) | null
  ): Abortable<TError>

  finally(
    onfinally?: (() => void) | null
  ): Abortable<T>
}

export function isAbortable<T>(promise: Promise<T>): promise is Abortable<T> {
  return typeof (promise as any).abort === "function"
}

export class Abortable<T> implements Abortable<T> {
  constructor(
    readonly promise: Promise<T>,
    readonly aborter: AbortController
  ) { }

  static create<T>(
    executor: (
      resolve: (value?: T | PromiseLike<T>) => void,
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

    return new this(promise, aborter)
  }

  abort() {
    this.aborter.abort()
  }

  get [Symbol.toStringTag]() {
    return this.promise[Symbol.toStringTag]
  }

  then<TResult = T, TError = never>(
    onfullfilled?: ((value: T) => TResult | PromiseLike<TResult>) | null,
    onrejected?: ((reason: any) => TError | PromiseLike<TError>) | null
  ) {
    const promise = this.promise.then(onfullfilled, onrejected)
    return new Abortable(promise, this.aborter)
  }

  catch<TError = never>(
    onrejected?: ((reason: any) => TError | PromiseLike<TError>) | null
  ) {
    const promise = this.promise.catch(onrejected)
    return new Abortable(promise, this.aborter)
  }

  finally(
    onfinally?: (() => void) | null
  ) {
    const promise = this.promise.finally(onfinally)
    return new Abortable(promise, this.aborter)
  }
}