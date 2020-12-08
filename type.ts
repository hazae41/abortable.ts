export function isAbortable<T>(promise: Promise<T>): promise is Abortable<T> {
  return typeof (promise as any).abort === "function"
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

export class Abortable<T> implements Abortable<T> {
  constructor(
    readonly promise: Promise<T>,
    readonly aborter: AbortController
  ) { }

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