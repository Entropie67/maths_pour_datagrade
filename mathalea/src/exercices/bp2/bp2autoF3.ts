import NotationScientifiqueQCM from '../QCMBrevet/A2020/AGS20E2Q4'

export const titre = 'Identifier une notation scientifique (QCM)'
export const interactifReady = true

export const dateDePublication = '12/4/2025'

export const uuid = '80f5f'
export const refs = {
  'fr-fr': ['BP2AutoF3'],
  'fr-ch': [],
}

export default class NotationQCM extends NotationScientifiqueQCM {
  constructor() {
    super()
  }
}
