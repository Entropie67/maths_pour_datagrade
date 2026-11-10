declare module 'instrumenpoche' {
  type IepOptions = Record<string, unknown>

  type IepLoader = (
    container: HTMLElement,
    xml: string,
    options?: IepOptions,
  ) => Promise<void>

  const iepLoadPromise: IepLoader
  export default iepLoadPromise
}
