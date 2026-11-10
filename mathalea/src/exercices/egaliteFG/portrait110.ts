import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Aline Lefebvre-Lepot (livret Versailles)'
export const dateDePublication = '24/07/2026'
export const uuid = '5039b'
export const refs = {
  'fr-fr': ['Portraits-110'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait110 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Aline Lefebvre-Lepot'
    this.photoSrc = '/alea/images/egalite/lefebvre-lepot-livret.jpg'
    this.photoAlt = "Portrait d'Aline Lefebvre-Lepot"
    this.source = 'Christophe Peus, http://www.chrispeus.com/ — Exposition «\u00a0Just Do Maths!\u00a0», Université Paris-Saclay'
    this.superPouvoir = 'Modélise le comportement du sable et des grains'
    this.ceQuElleFait =
      "Elle est spécialiste de la modélisation et de la simulation des écoulements granulaires, c'est-à-dire de matériaux composés de nombreux grains, comme le sable, le riz ou des particules plongées dans un fluide visqueux. Son travail consiste à concevoir les bons modèles mathématiques et les bons algorithmes pour simuler et comprendre le comportement de ces milieux complexes. Ces problématiques concernent de nombreux domaines comme l'industrie des matériaux, le stockage des céréales dans les silos agricoles ou encore des phénomènes environnementaux tels que l'érosion des dunes ou le transport des sédiments dans les rivières."
    this.leTrucStyle =
      "Qui n'a jamais versé du riz dans un entonnoir et observé que les grains peuvent soudain se bloquer ?"
    this.parcours = 'Directrice de recherche CNRS, fédération de mathématiques de CentraleSupélec'
    this.mentionLivret = true
  }
}
