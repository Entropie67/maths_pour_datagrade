import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint } from '../../lib/2d/textes'
import { homothetie, similitude } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { createList } from '../../lib/format/lists'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { texteItalique, miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'fb6ed'
export const refs = {
  'fr-fr': ['3Z1DNB-09'],
  'fr-ch': ['1mT-7'],
}
export const titre =
  'Préparation DNB : Trigo, Pythagore, agrandissement-réduction'
export const dateDePublication = '09/04/2025'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class ExercicePolynesie392024 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.introduction = texteItalique(
      "D'après l'exercice $5$ du brevet Polynésie 2024.",
    ) + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    ON: number,
    MON: number,
    PQ: number,
    OQ: number,
    OS: number,
    nom1: string,
    nom2: string,
    nom3: string,
  ): void {
    const triangle2 = `${nom1[0]}${nom2}`
    const triangle3 = `${nom1[0]}${nom3}`
    const N = pointAbstrait(0, 0, nom1[1], 'above left')
    const O = pointAbstrait(6, 0, nom1[0], 'above right')
    const M = pointAbstrait(
      0,
      -6 *
        Math.tan((MON * Math.PI) / 180) *
        (1 - (choice([-1, 1]) * randint(5, 7)) / 100),
      nom1[2],
      'left',
    )
    const P = homothetie(
      M,
      O,
      longueur(O, N) / longueur(O, M),
      nom2[0],
      'below',
    )
    const Q = similitude(
      O,
      P,
      -90,
      Math.tan((MON * Math.PI) / 180),
      nom2[1],
      'below',
    )
    const R = homothetie(Q, O, OS / OQ, nom3[0], 'below')
    const S = similitude(
      O,
      R,
      -90,
      Math.tan((MON * Math.PI) / 180),
      nom3[1],
      'below',
    )
    const tri1 = polygone([O, N, M])
    const tri2 = polygone([O, P, Q])
    const tri3 = polygone([O, R, S])
    const ad1 = codageAngleDroit(O, N, M)
    const ad2 = codageAngleDroit(O, P, Q)
    const ad3 = codageAngleDroit(O, R, S)
    const longON = placeLatexSurSegment(
      `${texNombre(ON, 1)}\\text{~cm}`,
      N,
      O,
      {},
    )
    const angNOM = afficheMesureAngle(N, O, M, 'black', 1, `${MON}^\\circ`)
    const labels = labelPoint(O, N, M, P, Q, R, S)
    const objets = [tri1, tri2, tri3, ad1, ad2, ad3, longON, angNOM, labels]

    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 1 }, fixeBordures(objets)),
      objets,
    )
    const ligne1 = `Le triangle $${nom1}$ est rectangle en $${nom1[1]}$,`
    const ligne2 = `le triangle $${triangle2}$ est rectangle en $${nom2[0]}$,`
    const ligne3 = `le triangle $${triangle3}$ est rectangle en $${nom3[0]}$,`
    const ligne4 = `$${nom1[0]}${nom1[1]}= ${texNombre(ON, 1)}\\text{ cm}$ et $\\widehat{\\text{${nom1[1]}${nom1[0]}${nom1[2]}}} = ${texNombre(MON, 0)}^\\circ$.`
    const ligne5 = `$${nom2[0]}$ est un point du segment $[${nom1[0]}${nom1[2]}]$ et $${nom3[0]}$ est un point du segment $[${nom1[0]}${nom2[1]}]$.`
    const listeDonnees = createList({
      items: [ligne1, ligne2, ligne3, ligne4, ligne5],
      style: 'puces',
    })
    this.enonce = deuxColonnesResp(
      `Sur la figure ci-contre, qui n'est pas à l'échelle,<br>
      ${listeDonnees}`,
      figure,
      { eleId: '', largeur1: 50, widthmincol1: '200px', widthmincol2: '200px' },
    )
    const question1 = `Calculer la mesure de la longueur $${nom1[1]}${nom1[2]}$. On donnera une valeur approchée au millimètre près.`
    const question2 = `On donne $${nom2[0]}${nom2[1]} = ${texNombre(PQ, 2)}\\text{ cm}$ et $${nom1[0]}${nom2[1]} = ${texNombre(OQ, 2)}\\text{ cm}$. Montrer que $${nom1[0]}${nom2[0]} = ${texNombre(ON, 2)}\\text{ cm}$.`
    const question3 = `Montrer que les triangles $${nom1}$ et $${triangle2}$ ne sont pas des triangles égaux.`
    const question4 = `Sachant que le triangle $${triangle2}$ est un agrandissement du triangle $${triangle3}$ et que $${nom1[0]}${nom3[1]} = ${texNombre(OS, 2)}\\text{ cm}$, calculer l'aire du triangle $${triangle3}$.`
    const listeQuestions = createList({
      items: [question1, question2, question3, question4],
      style: 'nombres',
    })
    this.enonce += `<br><br>${listeQuestions}`
    this.correction = deuxColonnesResp(
      `Sur la figure ci-contre, qui n'est pas à l'échelle,<br>
      ${listeDonnees}`,
      figure,
      { eleId: '', largeur1: 50, widthmincol1: '200px', widthmincol2: '200px' },
    )
    const MN = Math.round(Math.tan((MON * Math.PI) / 180) * ON * 10) / 10
    const question1Corr = `Dans le triangle $${nom1[0]}${nom1[1]}$ rectangle en $${nom1[1]}$, on a${sp()}:
    $\\tan\\left(\\widehat{${nom1[1]}${nom1[0]}${nom1[2]}}\\right)=\\dfrac{${nom1[1]}${nom1[2]}}{${nom1[0]}${nom1[1]}}$<br>
    donc $${nom1[1]}${nom1[2]}=${nom1[0]}${nom1[1]}\\times\\tan\\left(\\widehat{${nom1[1]}${nom1[0]}${nom1[2]}}\\right)=${texNombre(ON, 1)}\\times\\tan\\left(${texNombre(MON, 0)}\\right)\\approx ${miseEnEvidence(texNombre(MN, 1))}$.`
    const question2Corr = `On applique le théorème de Pythagore dans le triangle $${triangle2}$ rectangle en $${nom2[0]}$${sp()}:<br>
    $${nom1[0]}${nom2[0]}^2 + ${nom2[0]}${nom2[1]}^2 = ${nom1[0]}${nom2[1]}^2$ soit $${nom1[0]}${nom2[0]}^2 = ${nom1[0]}${nom2[1]}^2 - ${nom2[0]}${nom2[1]}^2$<br>
    $${nom1[0]}${nom2[0]}^2 = ${texNombre(OQ, 2)}^2-${texNombre(PQ, 2)}^2= ${texNombre(OQ * OQ, 4)}-${texNombre(PQ * PQ, 4)}= ${texNombre(OQ ** 2 - PQ ** 2, 4)}$<br>
    d'où $${nom1[0]}${nom2[0]} = \\sqrt{${texNombre(OQ ** 2 - PQ ** 2, 4)}}= ${texNombre(Math.sqrt(OQ ** 2 - PQ ** 2), 2)}$<br>
    donc $${nom1[0]}${nom2[0]} = ${miseEnEvidence(texNombre(Math.sqrt(OQ ** 2 - PQ ** 2), 2))}\\text{~cm}$.`
    const question3Corr = `$${nom1[0]}${nom1[1]}=${nom1[0]}${nom2[0]}=${texNombre(ON, 1)}\\text{~cm}$ mais $${nom1[1]}${nom1[2]} = ${texNombre(MN, 1)}\\text{~cm}$ et $${nom2}=${texNombre(PQ, 2)}\\text{~cm}$ donc $${nom1[1]}${nom1[2]}\\neq ${nom2}$.<br>
    Les triangles $${nom1}$ et $${triangle2}$ ${texteEnCouleurEtGras('ne sont pas des triangles égaux')} car ils n'ont pas les mêmes longueurs de côtés de l'angle droit.`
    const coeff = OQ / OS
    const question4Corr = `On sait que le triangle $${triangle2}$ est un agrandissement du triangle $${triangle3}$ et que $${nom1[0]}${nom3[1]}=${texNombre(OS, 2)}$.<br>
    $${nom1[0]}${nom3[1]}$ est l'hypoténuse du triangle $${triangle3}$ et $${nom1[0]}${nom3[1]}=${texNombre(OS, 2)}$;<br>
    $${nom1[0]}${nom2[1]}$ est l'hypoténuse du triangle $${triangle2}$ et $${nom1[0]}${nom2[1]}=${texNombre(OQ, 2)}$.<br>
Comme $${texNombre(OQ, 2)}=${texNombre(coeff, 1)}\\times ${texNombre(OS, 2)}$, On peut dire que le triangle $${triangle2}$ est un agrandissement du triangle $${triangle3}$ de facteur $${texNombre(coeff, 1)}$, et donc l'aire du triangle $${triangle2}$ est $${coeff * coeff}$ fois plus grande que l'aire du triangle $${triangle3}$.<br>
L'aire du triangle $${triangle2}$ est${sp()}: $\\dfrac{${nom1[0]}${nom2[0]}\\times ${nom2[0]}${nom2[1]}}{2} = \\dfrac{${texNombre(Math.sqrt(OQ ** 2 - PQ ** 2), 1)}\\times ${texNombre(PQ, 1)}}{2}= ${texNombre((Math.sqrt(OQ ** 2 - PQ ** 2) * PQ) / 2, 1)}$.<br>
L'aire du triangle $${triangle2}$ est $${texNombre(coeff * coeff, 1)}$ fois plus grande que l'aire du triangle $${triangle3}$ donc l'aire du triangle $${triangle3}$ est $${texNombre(coeff * coeff, 1)}$ fois plus petite que l'aire du triangle $${triangle2}$, donc est égale à${sp()}:
$\\dfrac{${texNombre((Math.sqrt(OQ ** 2 - PQ ** 2) * PQ) / 2, 1)}}{${texNombre(coeff * coeff, 1)}}$ c'est-à-dire $${miseEnEvidence(texNombre((Math.sqrt(OQ ** 2 - PQ ** 2) * PQ) / (2 * coeff * coeff), 1))}\\text{~cm}^2$.`
    const listeQuestionsCorr = createList({
      items: [question1Corr, question2Corr, question3Corr, question4Corr],
      style: 'nombres',
    })
    this.correction += `<br><br>${listeQuestionsCorr}`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(6, 32, 2.5, 6.5, 3.25, 'ONM', 'PQ', 'RS')
  }

  versionAleatoire: () => void = () => {
    const listeTripletsPythagoriciens = [
      [12, 5, 13],
      [15, 8, 17],
      [16, 12, 20],
    ]
    const triplet = choice(listeTripletsPythagoriciens)
    const coeff = randint(2, 5)
    const base = randint(1, 5)
    const [, , OS] = triplet.map((val) => (val * base) / 10)
    const [ON, PQ, OQ] = triplet.map((val) => (val * base * coeff) / 10)
    let MON: number
    do {
      MON = randint(25, 35)
    } while (Math.abs(Math.tan((MON * Math.PI) / 180) * ON - PQ) <= 0.1)

    const nom1 = choisitLettresDifferentes(3).join('')
    const nom2 = choisitLettresDifferentes(2, nom1).join('')
    const nom3 = choisitLettresDifferentes(2, nom1 + nom2).join('')
    this.appliquerLesValeurs(ON, MON, PQ, OQ, OS, nom1, nom2, nom3)
  }
}
