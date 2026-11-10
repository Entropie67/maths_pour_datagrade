class Store<T> {
  private store: Record<string, T> = {}

  set(key: string, value: T): void {
    this.store[key] = value
  }

  get(key: string): T | undefined {
    return this.store[key]
  }
}

export const store = new Store<unknown>()
