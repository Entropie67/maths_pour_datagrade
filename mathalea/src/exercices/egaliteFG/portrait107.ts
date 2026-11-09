import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Muriel Boulakia'
export const dateDePublication = '24/07/2026'
export const uuid = '34b5c'
export const refs = {
  'fr-fr': ['Portraits-107'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait107 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Muriel Boulakia'
    this.photoSrc = '/alea/images/egalite/boulakia-livret.jpg'
    this.photoAlt = 'Portrait de Muriel Boulakia'
    this.source = 'Christophe Peus, http://www.chrispeus.com/ — Exposition «\u00a0Just Do Maths!\u00a0», Université Paris-Saclay'
    this.superPouvoir = 'Modélise le cœur humain avec des équations'
    this.ceQuElleFait =
      "Elle s'intéresse aux modèles mathématiques capables de reproduire des phénomènes biologiques complexes, comme la circulation du sang dans les veines ou le fonctionnement électrique du cœur. Elle perfectionne les techniques de modélisation numérique pour concevoir des simulations 3D précises, qui reproduisent les données d'un électrocardiogramme. Grâce à ses travaux, elle aide les médecins à poser des diagnostics plus précis en transformant des mesures médicales en informations concrètes sur l'état d'un cœur. Elle travaille également en pharmacologie pour tester virtuellement l'effet de médicaments sur les cellules cardiaques, ce qui permet de limiter le recours aux tests sur les animaux."
    this.leTrucStyle =
      "Grâce à ses recherches, Muriel Boulakia montre que les mathématiques ne sont pas seulement une science abstraite, mais un outil puissant pour inventer la médecine de demain."
    this.parcours = 'Professeure des universités, Laboratoire de mathématiques de Versailles'
    this.mentionLivret = true
  }
}
