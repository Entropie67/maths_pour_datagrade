// Vite turns static asset imports such as SVG into public URL strings:
// https://vite.dev/guide/assets#importing-asset-as-url
declare module '*.svg' {
  const src: string
  export default src
}

// Vite returns the imported file contents as a string for `?raw` imports:
// https://vite.dev/guide/assets.html#importing-asset-as-string
declare module '*?raw' {
  const content: string
  export default content
}
