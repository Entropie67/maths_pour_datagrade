import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { translation } from '../../lib/2d/transformations'
import { vecteur } from '../../lib/2d/Vecteur'
import {
  point3d,
  polygone3d,
  vecteur3d,
} from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { prisme3d } from '../../lib/3d/3dProjectionMathalea2d/Prisme3dPerspectiveCavaliere'
import { createList } from '../../lib/format/lists'
import { centrage, deuxColonnesResp } from '../../lib/format/miseEnPage'
import { choice } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras, texteItalique, miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '4beb9'
export const refs = {
  'fr-fr': ['3G30DNB0', '3Z1DNB-03'],
  'fr-ch': ['1mT-10'],
}
export const titre = 'Se préparer au DNB : Pythagore, trigonométrie, aire, volume'
export const dateDePublication = '05/12/2024'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé (à partir des sources Latex de l'APMEP)
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class Exercice3G2DNB0 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.spacingCorr = 2.5
    this.sup = false

    this.versionAleatoire()
    this.introduction = texteItalique(
      "D'après l'exercice $4$ du brevet Amérique du Sud 2024.",
    ) + '<br>'
  }

  private appliquerLesValeurs(
    hauteur: number,
    hypo: number,
    profondeur: number,
  ): void {
    const base = Math.round(Math.sqrt(hypo ** 2 - hauteur ** 2) * 10) / 10
    const ppcm = 25
    const sc = 0.5
    const C = pointAbstrait(0, 0, 'C', 'below left')
    const A = pointAbstrait(0, 4, 'A', 'above')
    const B = pointAbstrait(7, 0, 'B', 'above right')
    const terrain = polygone(
      pointAbstrait(-6, 4),
      pointAbstrait(0, 4),
      A,
      C,
      pointAbstrait(12, 0),
      pointAbstrait(12, -2),
      pointAbstrait(-6, -2),
    )
    terrain.hachures = 'dots'
    // terrain.couleurDeRemplissage = colorToLatexOrHTML('green')
    terrain.color = colorToLatexOrHTML('black')
    terrain.couleurDesHachures = colorToLatexOrHTML('gray')
    terrain.epaisseurDesHachures = 0.7
    terrain.distanceDesHachures = 10
    const maison = polygone(
      pointAbstrait(-1, 4),
      pointAbstrait(-4, 4),
      pointAbstrait(-4, 7),
      pointAbstrait(-2.5, 8.5),
      pointAbstrait(-1, 7),
    )
    const maison2 = translation(maison, vecteur(12, -4))
    const triangle = polygone(C, A, B)
    triangle.pointilles = 2
    triangle.opacite = 0.5
    triangle.color = colorToLatexOrHTML('gray')
    triangle.hachures = 'north east lines'
    triangle.couleurDesHachures = colorToLatexOrHTML('gray')
    maison.couleurDeRemplissage = colorToLatexOrHTML('gray')
    const labels = labelPoint(C, A, B)
    const angDroit = codageAngleDroit(A, C, B)
    const objets = [triangle, terrain, maison, maison2, labels, angDroit]
    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: ppcm, scale: sc },
        fixeBordures(objets, { rxmin: 0.5, rymin: 0.5 }),
      ),
      objets,
    )
    context.anglePerspective = 60
    const ABC = polygone3d(
      point3d(0, 0, 0, true, 'C', 'below left'),
      point3d(7, -4, 0, true, 'B', 'below right'),
      point3d(0, 0, 3, true, 'A', 'above left'),
    )
    const CF = vecteur3d(8, 14, 0)
    const prisme = prisme3d(ABC, CF, 'black', true, 'FED', [
      'below',
      'right',
      'above',
    ])
    const carre1 = polygone3d(
      point3d(0, 0, 0),
      point3d(0.7, -0.4, 0),
      point3d(0.7, -0.4, 0.6),
      point3d(0, 0, 0.6),
    )
    const listeSommets1 = carre1.listePoints2d
    const ang1 = polygone(...listeSommets1)
    ang1.epaisseur = 0
    ang1.couleurDeRemplissage = colorToLatexOrHTML('gray')
    const carre2 = polygone3d(
      point3d(8, 14, 0),
      point3d(8.7, 13.6, 0),
      point3d(8.7, 13.6, 0.6),
      point3d(8, 14, 0.6),
    )
    const listeSommets2 = carre2.listePoints2d
    const ang2 = polygone(...listeSommets2)
    ang2.epaisseur = 0
    ang2.couleurDeRemplissage = colorToLatexOrHTML('gray')
    const haut = latex2d(`${texNombre(hauteur, 2)}\\text{ m}`, -0.5, 1.5, {
      orientation: 90,
    })
    const prof = latex2d(`${texNombre(profondeur, 2)}\\text{ m}`, 5.3, 6.4, {
      orientation: 30,
    })
    const long = latex2d(`${texNombre(hypo, 2)}\\text{ m}`, 14.5, 7.4, {
      orientation: -40,
    })
    const objets2 = [
      ...prisme.c2d,
      carre1.c2d,
      carre2.c2d,
      ang1,
      ang2,
      haut,
      prof,
      long,
    ]

    const figure2 = mathalea2d(
      Object.assign({ pixelsParCm: ppcm, scale: sc }, fixeBordures(objets2)),
      objets2,
    )
    context.anglePerspective = 30
    // enoncé
    let enonce = `On dispose d'un terrain en pente sur lequel on souhaite construire une maison.<br>
    Il faut pour cela enlever de la terre afin d'obtenir un terrain horizontal.<br>
On dispose des informations suivantes${sp()}:<br><br>

  ${deuxColonnesResp(
    `${centrage(texteEnCouleurEtGras('Vue en coupe du terrain', 'black'))}${figure}`,
    `La maison sera construite sur le terrain horizontal représenté par le segment $[BC]$.<br>
    Le triangle $ABC$ est rectangle en $C$ et${sp()}:<br>
    ${createList({
      items: [
        `$AC = ${texNombre(hauteur, 2)}\\text{ m}$;`,
        `$AB = ${texNombre(hypo, 2)}\\text{ m}$.`,
      ],
      style: 'fleches',
    })}`,
    {
      eleId: 'figure1',
      largeur1: 60,
      widthmincol1: '360px',
      widthmincol2: '240px',
      stylecol2: 'vertical-align: center;',
    },
  )}`
    enonce += createList({
      items: [
        `Justifier que la longueur $CB$ est égale à $${texNombre(base, 2)}\\text{ m}$.`,
        `Le coût des travaux pour enlever la terre dépend de la mesure de l'angle $\\widehat{ABC}$.<br>
Si la mesure de l'angle $\\widehat{ABC}$ est supérieure à $8,5°$, cela entraînera un surcoût des travaux (c'est-à-dire que les traveaux pour enlever la terre coûteront plus cher).<br>
Est-ce le cas pour ce terrain${sp()}?`,
        `On admet que le volume de terre enlevée correspond au prisme droit $CBAFED$ de hauteur $[CF]$ et de bases $ABC$ et $DEF$comme représenté ci-dessous.<br>
 On rappelle que les longueurs CF et AD sont égales.<br>${figure2}\n
 Déterminer le volume de terre à enlever en $\\text{ m}^3$.<br>
On rappelle la volume de formule${sp()}:
 ${centrage(`Volume d'un prisme droit = ${texteItalique("aire d'une base du prisme × hauteur du prisme")}.`)}`,
      ],
      style: 'nombres',
    })
    const correction = createList({
      items: [
        `Le triangle $ABC$ est rectangle en $C$ donc d'après le théorème de Pythagore${sp()}:<br>
        $AB^2 = AC^2 + BC^2$<br>
        En remplaçant par les valeurs numériques, on a${sp()}:<br>
        $${texNombre(hypo, 2)}^2 = ${texNombre(hauteur, 2)}^2 + BC^2$, soit${sp()}: $${texNombre(hypo ** 2, 4)} = ${texNombre(hauteur ** 2, 4)} + BC^2$.<br>
        On en déduit${sp()}: $BC^2 = ${texNombre(hypo ** 2, 4)} - ${texNombre(hauteur ** 2, 4)}=${texNombre(hypo ** 2 - hauteur ** 2, 4)}$<br>
        D'où $BC = \\sqrt{${texNombre(hypo ** 2 - hauteur ** 2, 4)}}= ${miseEnEvidence(texNombre(base, 2))}$<br>
        Donc $[CB]$ mesure bien $${texNombre(base, 2)}\\text{ m}$.`,
        `On a dans le triangle $ABC$ rectangle en $C$${sp()}:<br>
        $\\sin(\\widehat{ABC}) = \\dfrac{AC}{AB}$.<br>
        $\\sin(\\widehat{ABC}) = \\dfrac{${texNombre(hauteur, 2)}}{${texNombre(hypo, 2)}}$<br>
        $\\sin(\\widehat{ABC}) ${egalOuApprox(hauteur / hypo, 3)} ${texNombre(hauteur / hypo, 3)}$<br>
        $\\widehat{ABC} \\approx ${miseEnEvidence(texNombre((Math.asin(hauteur / hypo) * 180) / Math.PI, 1))}^{\\circ}$<br>
        Or ${
          (Math.asin(hauteur / hypo) * 180) / Math.PI > 8.5
            ? ` $\\widehat{ABC} > 8,5°$, donc ${texteEnCouleurEtGras('le surcoût des travaux est à prévoir')}.`
            : ` $\\widehat{ABC} \\leqslant 8,5°$, donc ${texteEnCouleurEtGras("il n'y aura pas de surcoût")}.`
        }`,
        `Le volume du prisme droit $CBAFED$ est égal à l'aire de la base $ABC$ multipliée par la hauteur $CF$ du prisme.<br>
        $V = \\mathscr{A}_{ABC} \\times CF$<br>
        $V = \\dfrac{AC \\times BC}{2} \\times CF$<br>
        $V = \\dfrac{${texNombre(hauteur, 2)} \\times ${texNombre(base, 2)}}{2} \\times ${texNombre(profondeur, 1)}$<br>
        $V = ${miseEnEvidence(texNombre((hauteur * base * profondeur) / 2, 5))}\\text{ m}^3$`,
      ],
      style: 'nombres',
    })

    this.enonce = enonce
    this.correction = correction
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2.6, 17, 30)
  }

  versionAleatoire: () => void = () => {
    const triplets = [
      { a: 15, b: 112, c: 113 }, // a/c ≈ 0.1327
      { a: 21, b: 220, c: 221 }, // a/c ≈ 0.1380
      { a: 33, b: 544, c: 545 }, // a/c ≈ 0.1349
      { a: 45, b: 336, c: 339 }, // a/c ≈ 0.1327
      { a: 77, b: 294, c: 305 }, // a/c ≈ 0.1484
      { a: 105, b: 1408, c: 1413 }, // a/c ≈ 0.1484
      { a: 135, b: 1792, c: 1797 }, // a/c ≈ 0.1501
      { a: 153, b: 2176, c: 2185 }, // a/c ≈ 0.1397
    ]
    const triplet = choice(triplets) as { a: number; b: number; c: number }
    if (triplet.a > 40) {
      if (triplet.a < 100) {
        const hypo = triplet.c / 20
        const hauteur = triplet.a / 20
        const profondeur = randint(Math.ceil(hypo) + 2, Math.ceil(hypo) + 15)
        this.appliquerLesValeurs(hauteur, hypo, profondeur)
      } else {
        const hypo = triplet.c / 50
        const hauteur = triplet.a / 50
        const profondeur = randint(Math.ceil(hypo) + 2, Math.ceil(hypo) + 15)
        this.appliquerLesValeurs(hauteur, hypo, profondeur)
      }
    } else {
      const hypo = triplet.c / 10
      const hauteur = triplet.a / 10
      const profondeur = randint(Math.ceil(hypo) + 2, Math.ceil(hypo) + 15)
      this.appliquerLesValeurs(hauteur, hypo, profondeur)
    }
  }
}
