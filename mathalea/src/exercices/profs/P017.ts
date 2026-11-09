import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { vecteur } from '../../lib/2d/Vecteur'
import { cercle } from '../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { polygone } from '../../lib/2d/polygones'
import { symetrieAxiale, translation } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'
export const titre = "Encadrer l'aire d'un disque"

export const refs = {
  'fr-fr': ['P017'],
  'fr-ch': ['NR'],
}
export const uuid = '0ff0f'

/**
 * Encadre l'aire d'un disque par des aires de figures composées que de carrés de même taille
 * @author Éric Elter

*/
export default class EncadrerAireDisque extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = ["Nombre d'étapes (entre 1 et 50)", 50]
    this.besoinFormulaire2Numerique = [
      'Rayon du disque (nombre entier entre 1 et 20)',
      20,
    ]

    this.spacing = context.isHtml ? 2 : 1

    this.nbQuestions = 1
    this.sup = 10
    this.sup2 = 10
  }

  nouvelleVersion() {
    let texte = ''

    this.listeCorrections = [''] // Liste de questions corrigées
    let objets: NestedObjetMathalea2dArray = []

    const centre = pointAbstrait(0, 0)
    const rayon = this.sup2
    const paramsEnonce = {
      xmin: -rayon - 1,
      ymin: -rayon - 1,
      xmax: rayon + 1,
      ymax: rayon + 1,
      pixelsParCm: 30,
      scale: 0.7,
      mainlevee: false,
    }
    const cerc = cercle(centre, rayon, 'red')
    cerc.epaisseur = 2
    const cote = rayon
    let D = centre
    let A = D
    let B = D
    let C = D
    let Kre, Kre2, abscisse1, abscisse2, ordonnee1, ordonnee2, aireCarre
    let compteurExterieur
    let compteurInterieur
    let longueurCoteCarreRef

    texte += `Le disque a pour rayon $${texNombre(rayon)}\\text{ cm}$.<br>
    Pour chaque étape, encadrons le disque entre une figure basée sur un maximum de carrés et une figure basée sur un minimum de carrés.
    Encadrons ensuite l'aire du disque par l'aire de chaque figure.<br>`
    for (let Nmax = 1; Nmax <= this.sup; Nmax++) {
      texte += texteEnCouleurEtGras(` Étape ${Nmax} :`)
      compteurExterieur = 0
      compteurInterieur = 0
      objets = [cerc]
      D = centre
      A = D
      B = D
      C = D
      longueurCoteCarreRef = new FractionEtendue(cote, Nmax)
      abscisse1 = new FractionEtendue(0, Nmax)
      abscisse2 = new FractionEtendue(cote, Nmax)
      aireCarre = arrondi(abscisse2.toNumber() * abscisse2.toNumber(), 4)
      ordonnee1 = new FractionEtendue(0, Nmax)
      ordonnee2 = longueurCoteCarreRef

      // Carres exterieurs
      for (let i = 1; i <= Nmax; i++) {
        while (longueur(centre, D) < rayon) {
          A = D
          B = translation(
            centre,
            vecteur(
              abscisse2.num / abscisse2.den,
              ordonnee1.num / ordonnee1.den,
            ),
          )
          C = translation(
            centre,
            vecteur(
              abscisse2.num / abscisse2.den,
              ordonnee2.num / ordonnee2.den,
            ),
          )
          D = translation(
            centre,
            vecteur(
              abscisse1.num / abscisse1.den,
              ordonnee2.num / ordonnee2.den,
            ),
          )
          Kre = polygone([A, B, C, D], 'green')
          Kre2 = symetrieAxiale(
            Kre,
            droite(centre, pointAbstrait(centre.x, centre.y + 1)),
          )
          Kre.couleurDeRemplissage = colorToLatexOrHTML('green')
          Kre.opaciteDeRemplissage = 0.5
          Kre2.color = colorToLatexOrHTML('green')
          Kre2.couleurDeRemplissage = colorToLatexOrHTML('green')
          Kre2.opaciteDeRemplissage = 0.5
          objets.push(Kre, Kre2)
          Kre = symetrieAxiale(
            Kre,
            droite(centre, pointAbstrait(centre.x + 1, centre.y)),
          )
          Kre2 = symetrieAxiale(
            Kre2,
            droite(centre, pointAbstrait(centre.x + 1, centre.y)),
          )
          compteurExterieur = compteurExterieur + 4
          Kre.color = colorToLatexOrHTML('green')
          Kre.couleurDeRemplissage = colorToLatexOrHTML('green')
          Kre.opaciteDeRemplissage = 0.5
          Kre2.color = colorToLatexOrHTML('green')
          Kre2.couleurDeRemplissage = colorToLatexOrHTML('green')
          Kre2.opaciteDeRemplissage = 0.5
          objets.push(Kre, Kre2)
          ordonnee1 = ordonnee2
          ordonnee2 = ordonnee2.sommeFraction(longueurCoteCarreRef)
        }
        ordonnee1 = new FractionEtendue(0, Nmax)
        ordonnee2 = longueurCoteCarreRef
        abscisse1 = abscisse2
        abscisse2 = abscisse2.sommeFraction(longueurCoteCarreRef)
        D = translation(
          centre,
          vecteur(abscisse1.num / abscisse1.den, ordonnee1.num / ordonnee1.den),
        )
        A = D
        B = D
        C = D
      }

      // Carres interieurs
      D = centre
      ordonnee1 = new FractionEtendue(0, Nmax)
      ordonnee2 = longueurCoteCarreRef
      abscisse1 = new FractionEtendue(0, Nmax)
      abscisse2 = new FractionEtendue(cote, Nmax)
      for (let i = 1; i <= Nmax; i++) {
        A = D
        B = translation(
          centre,
          vecteur(abscisse2.num / abscisse2.den, ordonnee1.num / ordonnee1.den),
        )
        C = translation(
          centre,
          vecteur(abscisse2.num / abscisse2.den, ordonnee2.num / ordonnee2.den),
        )
        D = translation(
          centre,
          vecteur(abscisse1.num / abscisse1.den, ordonnee2.num / ordonnee2.den),
        )
        while (
          longueur(centre, B) <= rayon &&
          longueur(centre, C) <= rayon &&
          longueur(centre, D) <= rayon
        ) {
          Kre = polygone([A, B, C, D], bleuMathalea)
          Kre2 = symetrieAxiale(
            Kre,
            droite(centre, pointAbstrait(centre.x, centre.y + 1)),
          )
          Kre.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea)
          Kre.opaciteDeRemplissage = 0.5
          Kre2.color = colorToLatexOrHTML(bleuMathalea)
          Kre2.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea)
          Kre2.opaciteDeRemplissage = 0.5
          objets.push(Kre, Kre2)
          Kre = symetrieAxiale(
            Kre,
            droite(centre, pointAbstrait(centre.x + 1, centre.y)),
          )
          Kre2 = symetrieAxiale(
            Kre2,
            droite(centre, pointAbstrait(centre.x + 1, centre.y)),
          )
          compteurInterieur = compteurInterieur + 4
          Kre.color = colorToLatexOrHTML(bleuMathalea)
          Kre.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea)
          Kre.opaciteDeRemplissage = 0.5
          Kre2.color = colorToLatexOrHTML(bleuMathalea)
          Kre2.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea)
          Kre2.opaciteDeRemplissage = 0.5
          objets.push(Kre, Kre2)
          ordonnee1 = ordonnee2
          ordonnee2 = ordonnee2.sommeFraction(longueurCoteCarreRef)
          A = D
          B = translation(
            centre,
            vecteur(
              abscisse2.num / abscisse2.den,
              ordonnee1.num / ordonnee1.den,
            ),
          )
          C = translation(
            centre,
            vecteur(
              abscisse2.num / abscisse2.den,
              ordonnee2.num / ordonnee2.den,
            ),
          )
          D = translation(
            centre,
            vecteur(
              abscisse1.num / abscisse1.den,
              ordonnee2.num / ordonnee2.den,
            ),
          )
        }
        ordonnee1 = new FractionEtendue(0, Nmax)
        ordonnee2 = longueurCoteCarreRef
        abscisse1 = abscisse2
        abscisse2 = abscisse2.sommeFraction(longueurCoteCarreRef)
        D = translation(
          centre,
          vecteur(abscisse1.num / abscisse1.den, ordonnee1.num / ordonnee1.den),
        )
        A = D
        B = D
        C = D
      }
      texte += mathalea2d(paramsEnonce, objets)
      texte += `<br>$${compteurInterieur}$ carrés < Aire du disque < $${compteurExterieur}$ carrés<br>`
      texte += `Or l'aire d'un carré est $${texNombre(aireCarre)}\\text{ cm}^2$ (ou environ).<br>`
      texte += `$${texNombre(compteurInterieur * aireCarre)}\\text{ cm}^2$ < Aire du disque < $${texNombre(compteurExterieur * aireCarre)}\\text{ cm}^2$<br>`
      texte += context.isHtml ? '<br>' : '\\newpage'
    }
    this.listeQuestions.push(texte)

    listeQuestionsToContenu(this)
  }
}
