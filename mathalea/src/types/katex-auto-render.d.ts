declare module 'katex/contrib/auto-render' {
  type RenderMathInElement = (
    element: Element,
    options?: Record<string, unknown>,
  ) => void

  const renderMathInElement: RenderMathInElement
  export default renderMathInElement
}
