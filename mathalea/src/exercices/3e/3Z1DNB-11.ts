import { arc } from '../../lib/2d/Arc'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { cone, ellipse } from '../../lib/2d/projections3d'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { createList } from '../../lib/format/lists'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { choice } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { prenomM } from '../../lib/outils/Personne'
import {
  premierMultipleInferieur,
  premierMultipleSuperieur,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { deDevant, sp } from '../../lib/outils/outilString'

export const uuid = 'fb6ee'
export const refs = {
  'fr-fr': ['3Z1DNB-11'],
  'fr-ch': [],
}
export const titre =
  'Préparation DNB : Volume, Pythagore, périmètre, agrandissement-réduction'
export const dateDePublication = '10/04/2025'

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
      "D'après l'exercice $5$ du brevet centres étrangers 2024.",
    ) + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    r: number,
    h: number,
    tt: number,
    rapport: FractionEtendue,
    pourcentage: number,
    quidam: string,
  ): void {
    const niveau = rapport.isEqual(fraction(1, 2))
      ? 'la moitié'
      : rapport.isEqual(fraction(2, 3))
        ? 'les deux tiers'
        : rapport.isEqual(fraction(3, 4))
          ? 'les trois quarts'
          : rapport.isEqual(fraction(1, 3))
            ? 'le tiers'
            : 'les trois cinquièmes'

    this.enonce = texteGras('Les deux parties sont indépendantes.')
    this.enonce += '<br>'
    this.enonce += texteGras('Partie A')
    this.enonce += '<br>'
    const O = pointAbstrait(0, 0, 'O', 'below')
    const M = pointAbstrait(2, 0, 'M', 'right')
    const S = pointAbstrait(0, 6, 'S', 'above')
    const os = segment(O, S)
    os.pointilles = 2
    const om = segment(O, M)
    const angDr = codageAngleDroit(S, O, M)
    const labels = labelPoint(O, M, S)
    const cone1 = cone({ centre: O, rx: 2, hauteur: 6 })
    const SM = Math.round(Math.sqrt(r * r + h * h) * 10) / 10

    const objets = [os, om, angDr, labels, cone1]
    const figure1 = mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 1 }, fixeBordures(objets)),
      objets,
    )
    const intro = deuxColonnesResp(
      `
      
      ${quidam} veut fabriquer un chapeau en forme de cône pour se déguiser en sorcier lors de la fête d'Halloween.<br>
        Voici la représentation de ce chapeau en perspective cavalière.<br>
        Le rayon $OM$ de la base de ce cône mesure $${texNombre(r, 1)}\\text{ cm}$ et la hauteur $OS$ mesure $${texNombre(h, 1)}\\text{ cm}$.`,
      figure1,
      { largeur1: 60, widthmincol1: '400px', widthmincol2: '200px' },
    )
    this.enonce += intro
    const S2 = pointAbstrait(0, 0, 'S', 'below')
    const M1 = pointAbstrait(3, 2, 'M', 'right')
    const M2 = pointAbstrait(-3, 2, "M'", 'left')
    const labels2 = labelPoint(S2, M1, M2)
    const secteur = arc(M1, S2, M2, true)
    const circo2 = Math.round(2 * Math.PI * SM * 10) / 10
    const circo1 = Math.round(2 * Math.PI * r * 10) / 10
    const latexOM = placeLatexSurSegment(
      `${texNombre(SM, 1)}\\text{~cm}`,
      M1,
      S2,
      { distance: 0.3, letterSize: 'footnotesize' },
    )
    const longArc = latex2d(`${texNombre(circo1, 1)}\\text{~cm}`, 0, 4, {
      letterSize: 'footnotesize',
    })
    const objets2 = [secteur, labels2, latexOM, longArc]
    const figure2 = mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 1 }, fixeBordures(objets2)),
      objets2,
    )
    const question1 = `Démontrer que la longueur $MS$, arrondie au dixième de centimètre, est $${texNombre(SM, 1)}\\text{ cm}$.`
    const correction1 = `Le triangle $OMS$ est rectangle en $O$, donc d'après le théorème de Pythagore, on a${sp()}:<br>
    On a $MS^2 = OM^2 + OS^2=${texNombre(r, 1)}^2+${texNombre(h, 1)}^2$ donc $MS^2 =${texNombre(r * r, 2)}+${texNombre(h * h, 2)} = ${texNombre(r * r + h * h, 2)}$.<br>
    Donc $MS = \\sqrt{${texNombre(r * r + h * h, 2)}}\\approx ${miseEnEvidence(texNombre(SM, 1))}$ ${texteEnCouleurEtGras('cm')}.<br>`
    const question2 = `${quidam} souhaite vérifier que le chapeau sera adapté à son tour de tête qui mesure $${texNombre(tt, 1)}\\text{ cm}$.<br>
    Les dimensions choisies pour concevoir le chapeau sont-elles adaptées au tour de tête ${deDevant(quidam)}${sp()}?`
    const correction2 = `La base du cône est un cercle de rayon $${texNombre(r, 1)}\\text{ cm}$, donc de circonférence${sp()}:<br>
    $2 \\times \\pi \\times ${texNombre(r, 1)}\\text{ cm}$ $\\approx ${miseEnEvidence(texNombre(circo1, 1))}\\text{ cm}$.<br>
    Puisque son tour de tête mesure $${texNombre(tt, 1)}\\text{ cm}$, les dimensions choisies sont adaptées${sp()}: la circonférence du cône est à peine plus grande que le tour de tête ${deDevant(quidam)}, donc le chapeau sera assez grand, mais pas trop grand.`

    const introQuestion3b = `Pour dessiner en grandeur réelle son chapeau, il a besoin de calculer la mesure de l'angle $\\widehat{MSM'}$ qui est proportionnelle à la longueur de l'arc de cercle $\\overset{\\displaystyle\\frown}{M'M}$.<br>
    Il décide de représenter cette situation par le tableau de proportionnalité donné ci-dessous.<br>
    $\\begin{array}{|c|c|c|}
\\hline
\\text{Mesure de l'angle } \\widehat{M'SM} \\text{(en degrés)} & 360 & \\ldots\\\\
\\hline
 \\rule[-2ex]{0pt} {6ex} \\text{Longueur de l'arc } \\overset{\\displaystyle\\frown}{M'M} \\text{(en centimètres)} & \\ldots & ${texNombre(circo1, 1)}\\\\
\\hline
 \\end{array}$`
    const tableauCorrection = `$\\begin{array}{|c|c|c|}
\\hline
\\text{Mesure de l'angle } \\widehat{M'SM} \\text{(en degrés)} & 360 & ${texNombre((360 * circo1) / circo2, 0)}\\\\
\\hline
\\text{Longueur de l'arc } \\overset{\\displaystyle\\frown}{M'M} \\text{(en centimètres)} & ${texNombre(circo2, 1)} & ${texNombre(circo1, 1)}\\\\
\\hline
\\end{array}$`
    const O3 = pointAbstrait(0, 0)
    const S3 = pointAbstrait(0, -6)
    const M3 = pointAbstrait(2, 0)
    const cone3 = cone({ centre: O3, rx: 2, hauteur: -6 })
    const O2 = pointAbstrait(0, -6 * (1 - rapport.num / rapport.den))

    const cone2 = cone({
      centre: O2,
      rx: (2 * rapport.num) / rapport.den,
      hauteur: (-6 * rapport.num) / rapport.den,
      couleurDeRemplissage: 'lightgray',
      opaciteDeRemplissage: 1,
    })
    const base = ellipse(O3, 2, 2 / 3)
    const N2 = pointAbstrait(
      (2 * rapport.num) / rapport.den,
      -6 * (1 - rapport.num / rapport.den),
    )
    const M4 = pointAbstrait(
      (-2 * rapport.num) / rapport.den,
      -6 * (1 - rapport.num / rapport.den),
    )
    const s3 = segment(O3, M3)
    const h3 = segment(O3, S3)
    const s2 = segment(O2, N2)
    s2.pointilles = 2
    s3.pointilles = 2
    h3.pointilles = 2
    const angDr3 = codageAngleDroit(S3, O3, M3)
    const angDr2 = codageAngleDroit(S3, O2, N2)
    const tri34 = polygone(pointAbstrait(0, -6), N2, M4)
    tri34.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
    tri34.epaisseur = 0
    const fl1G = pointAbstrait(0, 1)
    const fl1D = pointAbstrait(2, 1)
    const fl2H = pointAbstrait(2.5, 0)
    const fl2B = pointAbstrait(2.5, -6)
    const fl3H = pointAbstrait(1.5, -6 * (1 - rapport.num / rapport.den))
    const fl3B = pointAbstrait(1.5, -6)
    const fl1 = segment(fl1G, fl1D)
    const fl2 = segment(fl2H, fl2B)
    const fl3 = segment(fl3H, fl3B)
    fl1.styleExtremites = '<->'
    fl2.styleExtremites = '<->'
    fl3.styleExtremites = '<->'
    const leg1 = placeLatexSurSegment(
      `${texNombre(r, 1)}\\text{~cm}`,
      fl1G,
      fl1D,
      { distance: 0.3, letterSize: 'footnotesize' },
    )
    const leg2 = placeLatexSurSegment(
      `${texNombre(h, 1)}\\text{~cm}`,
      fl2H,
      fl2B,
      { distance: 0.3, letterSize: 'footnotesize' },
    )
    const leg3 = placeLatexSurSegment(
      `${texNombre((h * rapport.num) / rapport.den, 1)}\\text{~cm}`,
      fl3H,
      fl3B,
      { distance: 0.3, letterSize: 'footnotesize' },
    )
    const objets3 = [
      tri34,
      cone3,
      base,
      cone2,
      s3,
      s2,
      h3,
      angDr2,
      angDr3,
      fl1,
      fl2,
      fl3,
      leg1,
      leg2,
      leg3,
    ]
    const figure3 = mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 1 }, fixeBordures(objets3)),
      objets3,
    )
    const question3a = `Démontrer que la longueur du cercle de centre $S$ et de rayon $SM$, arrondie au dixième de centimètre, est égale à $${texNombre(circo2, 1)}\\text{ cm}$.`
    const correction3a = `La longueur du cercle de centre $S$ et de rayon $SM$ est donnée par la formule${sp()}:<br>
    $2 \\times \\pi \\times SM\\text{ cm}$ $\\approx 2 \\times \\pi \\times ${texNombre(SM, 1)}$ soit environ $${miseEnEvidence(texNombre(circo2, 1))}$ ${texteEnCouleurEtGras('cm')}.`
    const question3b = `Placer la valeur $${texNombre(circo2, 1)}\\text{ cm}$ obtenue à la question précédente dans le tableau donné ci-dessus à rendre avec la copie.`
    const correction3b = `Voici le tableau complété${sp()}:<br>
    ${tableauCorrection}`
    const correction3c = `Calculons la mesure de l'angle, en utilisant le tableau de proportionnalité${sp()}:<br>
    $\\widehat{M'SM} = \\dfrac{360 \\times ${texNombre(circo1, 1)}}{${texNombre(circo2, 1)}} =\\dfrac{${texNombre(360 * circo1, 0)}}{${texNombre(circo2, 1)}} \\approx ${texNombre((360 * circo1) / circo2, 1)}^\\circ$.<br>
    Au degré près, l'angle correspondant à une longueur d'arc de $${texNombre(circo1, 1)}\\text{ cm}$ permettant à ${quidam} de tracer le patron de son chapeau est de $${miseEnEvidence(`${texNombre(Math.round((360 * circo1) / circo2), 0)}^\\circ`)}$.`
    const correction3 = createList({
      items: [correction3a, correction3b, correction3c],
      style: 'alpha',
    })
    const listeCorrectionsA = createList({
      items: [correction1, correction2, correction3],
      style: 'nombres',
    })
    const question3c = `Calculer la mesure de l'angle $\\widehat{MSM'}$ correspondant à une longueur d'arc de $${texNombre(circo1, 1)}\\text{ cm}$ qui permettra à ${quidam} de tracer le patron de son chapeau. Donner le résultat arrondi au degré.`
    const question4 = deuxColonnesResp(
      `
      Montrer que le volume total du chapeau, arrondi au cm$^3$, est de $${texNombre((Math.PI * r * r * h) / 3, 0)}\\text{ cm}^3$.<br>
    On rappelle que la formule du volume d'un cône de rayon $R$ et de hauteur $h$ est${sp()}:<br>
    $V=\\dfrac{1}{3} \\times\\left(\\pi \\times R^{2}\\right) \\times h$`,
      figure3,
      { largeur1: 65, widthmincol1: '500px', widthmincol2: '200px' },
    )
    const correction4 = `Le volume total du chapeau est donné par${sp()}:<br>
    $V_{chapeau} = \\dfrac{1}{3} \\times \\pi\\times ${texNombre(r, 1)}^2 \\times ${texNombre(h, 1)}\\text{ cm}$ $\\approx ${texNombre((Math.PI * r * r * h) / 3, 1)}\\text{ cm}^3$.<br>
    En arrondissant au cm$^3$, on a donc bien un volume total d'environ $${miseEnEvidence(texNombre((Math.PI * r * r * h) / 3, 0))}$ ${texteEnCouleurEtGras('cm$^3$')}.`

    const question5 = `${quidam} décide d'utiliser son chapeau pour transporter les bonbons qu'il a récoltés pendant la fête d'Halloween.<br>
    En arrivant chez lui, il constate que les bonbons atteignent ${niveau} de la hauteur de son chapeau.<br>
    Il estime que sa récolte de bonbons n'a pas été bonne car il pense que le volume occupé par les bonbons représente moins de $${pourcentage}\\,\\%$ du volume total de son chapeau.<br>
    Son estimation est-elle correcte${sp()}?`
    const percent = rapport.puissanceFraction(3).valeurDecimale * 100
    const inf = percent < pourcentage
    const correction5 = `Si les bonbons atteignent ${niveau} de la hauteur de son chapeau, cela signifie que la partie remplie de bonbons (celle qui est grisée sur la figure) est l'image du chapeau complet par une homothétie de rapport $${rapport.texFraction}$, et de centre $S$, le sommet du chapeau.<br>
    Une homothétie de rapport $${rapport.texFraction}$ multiplie toutes les longueurs par $${rapport.texFraction}$ et les volumes par $\\left(${rapport.texFraction}\\right)^3 = \\dfrac{${rapport.num}^3}{${rapport.den}^3}=${rapport.puissanceFraction(3).texFraction}${egalOuApprox(percent / 100, 3)}${texNombre(percent / 100, 3)}$.<br>
    Si le volume de bonbons est obtenu en multipliant le volume du chapeau par $${texNombre(percent / 100, 3)}$ ; cela signifie que le volume de bonbons est de $${texNombre(percent, 1)}\\,\\%$ du volume total de chapeau.<br>
    Or $${texNombre(percent, 1)}\\,\\% ${inf ? '<' : '>'} ${pourcentage}\\,\\%$.<br>
   ${
     inf
       ? `Il a donc raison dans son estimation${sp()}: si la hauteur de bonbons n'atteint que ${niveau} de la hauteur du chapeau, alors le volume de bonbons est inférieur à $${pourcentage}\\,\\%$ du volume total de son chapeau.`
       : `Il a donc tort dans son estimation${sp()}: si la hauteur de bonbons atteint ${niveau} de la hauteur du chapeau, alors le volume de bonbons est supérieur à $${pourcentage}\\,\\%$ du volume total de son chapeau.`
   }`

    const listeCorrectionsB = createList({
      items: [correction4, correction5],
      style: 'nombres',
    })
    const question3bc = createList(
      {
        items: [question3b, question3c],
        style: 'alpha',
      },
      undefined,
      2,
    )
    const question3 =
      `${quidam} a représenté ci-contre le patron de son chapeau.<br>
    ${deuxColonnesResp(
      `Il a reporté dessus les mesures des longueurs qu'il connaît et nommé $\\overset{\\displaystyle\\frown}{M'M}$ l'arc de cercle de longueur $${texNombre(circo1, 1)}\\text{ cm}$.<br>
    ${createList({
      items: [question3a],
      style: 'alpha',
    })}`,
      figure2,
      { largeur1: 50, widthmincol1: '200px', widthmincol2: '200px' },
    )}` + introQuestion3b

    const listeQuestionsA = createList({
      items: [question1, question2, question3 + question3bc],
      style: 'nombres',
    })
    const listeQuestionsB = createList({
      items: [
        `${context.isHtml ? '<br><br>' : '\\medskip\n'}${question4}`,
        question5,
      ],
      style: 'nombres',
    })
    this.enonce += listeQuestionsA
    this.enonce += texteGras('Partie B')
    this.enonce += '<br>'
    this.enonce += `On rappelle que la hauteur du chapeau mesure $${texNombre(h, 1)}\\text{ cm}$.`
    this.enonce += '<br>'
    this.enonce += listeQuestionsB
    this.correction = `${texteGras('Partie A')}<br>${listeCorrectionsA}<br><br>${texteGras('Partie B')}<br>${listeCorrectionsB}`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(9, 30, 56, fraction(1, 2), 15, 'Léo')
  }

  versionAleatoire: () => void = () => {
    const quidam = prenomM()
    const h = randint(6, 10) * 5
    const r = randint(16, 22) / 2
    const circo1 = 2 * Math.PI * r
    const max = Math.floor(circo1)
    const min = Math.floor(circo1 - 2)
    const tt = randint(min, max)
    const rapport = choice([
      fraction(1, 2),
      fraction(2, 3),
      fraction(3, 4),
      fraction(3, 5),
      fraction(1, 3),
    ])
    const coeff = rapport.puissanceFraction(3).valeurDecimale * 100
    const pourcentage = choice([true, false])
      ? premierMultipleInferieur(5, coeff)
      : premierMultipleSuperieur(5, coeff)
    this.appliquerLesValeurs(
      r,
      h,
      tt,
      rapport,
      pourcentage,
      Array.isArray(quidam) ? quidam[0] : quidam,
    )
  }
}
