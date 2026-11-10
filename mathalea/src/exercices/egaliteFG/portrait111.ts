import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Yilin Wang'
export const dateDePublication = '24/07/2026'
export const uuid = 'f72db'
export const refs = {
  'fr-fr': ['Portraits-111'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait111 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Yilin Wang'
    this.photoSrc = '/alea/images/egalite/wang-yilin.jpg'
    this.photoAlt = 'Portrait de Yilin Wang'
    this.source = 'Christophe Peus, http://www.chrispeus.com/ — Exposition «\u00a0Just Do Maths!\u00a0», Université Paris-Saclay'
    this.superPouvoir = 'Construit des ponts entre des mathématiques que tout oppose'
    this.ceQuElleFait =
      "Elle se découvre attirée par l'aspect théorique des mathématiques : «\u00a0La perfection du monde des mathématiques, en comparaison de notre monde réel imparfait où règnent les erreurs, m'a immédiatement fascinée\u00a0». Une part importante et passionnante de son travail consiste à créer des ponts entre deux communautés mathématiques qui ne se connaissent pas encore très bien, qui ne parlent pas forcément le même langage mais dont certains membres sentent qu'ils ont beaucoup à gagner de cet apport mutuel."
    this.leTrucStyle =
      "Elle montre que, même en mathématiques fondamentales, les découvertes viennent souvent du fait de relier des domaines que l'on pensait étrangers."
    this.parcours = "Professeure junior de mathématiques, Institut des Hautes Études Scientifiques (IHES)"
    this.mentionLivret = true
  }
}
