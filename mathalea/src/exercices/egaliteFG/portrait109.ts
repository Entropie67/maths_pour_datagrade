import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Camille Coron'
export const dateDePublication = '24/07/2026'
export const uuid = '3b7e8'
export const refs = {
  'fr-fr': ['Portraits-109'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait109 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Camille Coron'
    this.photoSrc = '/alea/images/egalite/coron.jpg'
    this.photoAlt = 'Portrait de Camille Coron'
    this.source = 'Christophe Peus, http://www.chrispeus.com/ — Exposition «\u00a0Just Do Maths!\u00a0», Université Paris-Saclay'
    this.superPouvoir = 'Utilise les maths pour lutter contre les moustiques et protéger la biodiversité'
    this.ceQuElleFait =
      "Elle utilise les calculs, l'informatique et les modèles mathématiques pour répondre à des questions concrètes en biologie, en écologie et en santé publique, dans le but de comprendre et prédire des phénomènes, pour aider les responsables à prendre des décisions. Grâce à ses travaux, elle aide à lutter contre les moustiques (sans utiliser les pesticides), à cartographier la pollution de l'air pour alerter la population en cas de pic de pollution, à cartographier les populations d'oiseaux. Elle s'intéresse aussi à la génétique des populations : elle étudie la manière dont les gènes se transmettent d'une génération à l'autre et aux phénomènes de mutations de ceux-ci."
    this.leTrucStyle =
      "«\u00a0Aujourd'hui encore, je me réveille le matin avec l'idée que le métier d'enseignante-chercheuse est génial. Nul autre métier n'offre autant de liberté : choisir sur quoi et avec qui on travaille.\u00a0»"
    this.parcours = 'Professeure junior INRAE, Laboratoire Mathématiques et informatique appliquées'
    this.mentionLivret = true
  }
}
