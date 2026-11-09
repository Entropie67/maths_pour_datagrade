export const doesImageExist = (path: string): boolean => {
  const http = new XMLHttpRequest()
  http.open('HEAD', path, false)
  http.send()
  return http.status !== 404
}
