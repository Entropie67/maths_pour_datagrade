import type { InterfaceParams } from './types'

export function getMockInterfacesParams(interfaceParamsNb: number) {
  const interfacesParams: InterfaceParams[] = []
  for (let i = 0; i < interfaceParamsNb; i++) {
    interfacesParams.push({ uuid: `uuid${i}` })
  }
  return interfacesParams
}
