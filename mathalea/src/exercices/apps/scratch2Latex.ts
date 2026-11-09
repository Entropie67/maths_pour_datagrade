import ExternalApp from './_ExternalApp'

export const uuid = 'scratch2Latex'
export const titre = 'Convertir du code Scratch vers LaTeX'
/**
 * @author Jean-claude Lhote
 */
class Scratch2Latex extends ExternalApp {
  constructor() {
    super('https://coopmaths.forge.apps.education.fr/scratch2latex/')
  }
}

export default Scratch2Latex
