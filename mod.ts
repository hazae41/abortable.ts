export interface Abortable<T> extends Promise<T> {
  abort(): void
}

export namespace Abort {
  export function race<T>(promises: Promise<T>[]) {
    return Promise.race(promises)
      .finally(() => Abort.abort(promises))
  }

  export function abort(promises: Promise<unknown>[]) {
    for (const promise of promises)
      if (isAbortable(promise)) promise.abort()
  }

  export function isAbortable<T>(promise: Promise<T>): promise is Abortable<T> {
    return typeof (promise as any).abort === "function"
  }
}

export class Abortable<T> implements Promise<T> {
  private aborter = new AbortController()
  private promise: Promise<T>

  constructor(
    executor: (
      resolve: (value?: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => (() => void) | void
  ) {
    const { signal } = this.aborter
    this.promise = new Promise<T>((resolve, reject) => {
      const clean = executor(resolve, reject)

      signal.onabort = () => {
        if (clean) clean();
        reject(signal);
      }
    }).finally(() => {
      signal.onabort = null
    })
  }

  abort() {
    this.aborter.abort()
  }

  get [Symbol.toStringTag]() {
    return this.promise[Symbol.toStringTag]
  }

  then<TResult = T, TError = never>(
    onfullfilled?: ((value: T) => TResult | PromiseLike<TResult>) | null,
    onrejected?: ((reason: any) => PromiseLike<TError>) | null
  ) {
    return this.promise.then<TResult, TError>(onfullfilled, onrejected)
  }

  catch<TError = never>(
    onrejected?: ((reason: any) => PromiseLike<TError>) | null
  ) {
    return this.promise.catch<TError>(onrejected)
  }

  finally(
    onfinally?: (() => void) | null
  ) {
    return this.promise.finally(onfinally)
  }
}