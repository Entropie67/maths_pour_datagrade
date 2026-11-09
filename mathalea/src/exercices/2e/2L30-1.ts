import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { texPrix, texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { bleuMathalea } from '../../lib/colors'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { deDevant, sp } from '../../lib/outils/outilString'
import { prenomF } from '../../lib/outils/Personne'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Exercice from '../Exercice'

import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { itemize, listeQuestionsToContenu, randint } from '../../modules/outils'
export const interactifReady = true

export const titre = 'Modéliser un problème par une inéquation'
export const dateDePublication = '14/02/2023'
export const dateDeModifImportante = '03/04/2025'
/**
 *
 * @author Gilles Mora

*/
export const uuid = 'd2084'

export const refs = {
  'fr-fr': ['2L30-1', 'BP2RES18'],
  'fr-ch': [],
}
export default class ModeliseInequations extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      4,
      '1 : Situation concrète\n2 : Situation géométrique\n3 : Programme de calcul\n4 : Mélange des cas précédents',
    ]

    this.nbQuestions = 1

    this.sup = 4

    this.spacing = 1.5 // Interligne des questions
    this.spacingCorr = 1.5 // Interligne des réponses
  }

  nouvelleVersion() {
    let typeDeQuestionsDisponibles
    if (this.sup === 1) {
      typeDeQuestionsDisponibles = ['typeE1', 'typeE2', 'typeE3'] //
    } else if (this.sup === 2) {
      typeDeQuestionsDisponibles = ['typeE4', 'typeE5', 'typeE6'] //
    } else if (this.sup === 3) {
      typeDeQuestionsDisponibles = ['typeE7', 'typeE8'] //
    } else {
      typeDeQuestionsDisponibles = [
        'typeE1',
        'typeE2',
        'typeE3',
        'typeE4',
        'typeE5',
        'typeE6',
        'typeE7',
        'typeE8',
      ]
    }
    //
    const listeTypeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      // Boucle principale où i+1 correspond au numéro de la question
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'typeE1': //
          {
            const a = randint(20, 30) //
            const b = randint(a + 5, 50) //
            const c = randint(20, 35) / 100
            const d = randint(14, 19) / 100

            texte = ` Une société de location de véhicules particuliers propose deux tarifs${sp()}:<br>
              $\\bullet$ Tarif A${sp()}: un forfait de $${a}$ € et $${texNombre(c, 2)}$ € par $\\text{km}$ parcouru ;<br>
              $\\bullet$ Tarif B${sp()}: un forfait de $${b}$ € et $${texNombre(d, 2)}$ € par $\\text{km}$ parcouru ;<br>
                      À partir de combien de $\\text{km}$ (arrondi à l'unité), le tarif B est-il plus intéressant que le tarif A${sp()}?<br>`
            texteCorr = `En notant $x$, le nombre de $\\text{km}$ parcourus, on a${sp()}:<br>
              $\\bullet$ Avec le tarif A, le prix à payer est${sp()}: $${reduireAxPlusB(c, a)}$ ;<br>
              $\\bullet$ Avec le tarif B, le prix à payer est${sp()}: $${reduireAxPlusB(d, b)}$ ;<br>
                       Le tarif B est plus avantageux que le tarif A lorsque $x$ vérifie${sp()}: $${reduireAxPlusB(d, b)} < ${reduireAxPlusB(c, a)}$.<br>
                       On résout cette inéquation${sp()}: <br>
              $\\begin{aligned}
              ${texNombre(d, 2)}x+${b}&<${texNombre(c, 2)}x+${a}\\\\
              ${texNombre(d, 2)}x+${b}-${miseEnEvidence(texNombre(c, 2), bleuMathalea)}${miseEnEvidence('\\textit{x}', bleuMathalea)}&< ${texNombre(c, 2)}x-${miseEnEvidence(texNombre(c, 2), bleuMathalea)}${miseEnEvidence('\\textit{x}', bleuMathalea)}+${a}\\\\
                     ${texNombre(d - c)}x+${b}&<${a}\\\\
              ${texNombre(d - c, 2)}x+${b}-${miseEnEvidence(texNombre(b), bleuMathalea)}&<${a}-${b}\\\\
              ${texNombre(d - c, 2)}x&<${a - b}\\\\
      \\dfrac{${texNombre(d - c, 2)}x}{${miseEnEvidence(texNombre(d - c, 2), bleuMathalea)}}&>\\dfrac{${a - b}}{${miseEnEvidence(texNombre(d - c, 2), bleuMathalea)}}${sp(7)} \\text{On divise par } ${texNombre(d - c, 2)} <0\\\\
      x&>\\dfrac{${abs(a - b)}}{${texNombre(abs(d - c), 2)}}
      \\end{aligned}$<br>`
            if (Math.round((a - b) / (d - c)) === (a - b) / (d - c)) {
              texteCorr += `Comme $\\dfrac{${abs(a - b)}}{${texNombre(abs(d - c), 2)}}= ${texNombre((a - b) / (d - c), 2)}$, c'est donc pour une distance minimale de $${miseEnEvidence(texNombre(Math.ceil((a - b) / (d - c)) + 1, 0))}\\text{ km}$ que le tarif B est plus intéressant que le tarif A.
             `
              reponse = texNombre(Math.ceil((a - b) / (d - c)) + 1, 0)
            } else {
              texteCorr += ` Comme $\\dfrac{${abs(a - b)}}{${texNombre(abs(d - c), 2)}}\\approx ${texNombre((a - b) / (d - c), 2)}$, c'est donc pour une distance minimale de $${miseEnEvidence(Math.ceil((a - b) / (d - c)))}\\text{ km}$ que le tarif B est plus intéressant que le tarif A.
                            `
              reponse = texNombre(Math.ceil((a - b) / (d - c)), 0)
            }

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteApres: '$\\text{ km}$' },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break

        case 'typeE2':
          {
            const quidam = prenomF()
            const b = randint(90, 120) //
            const a = randint(15, 25) / 100
            const budget = randint(20, 35) * 10 //

            texte = ` Pour la location mensuelle d'un véhicule, une entreprise propose le tarif suivant${sp()}:<br>
            Forfait de $${b}$ € quel que soit le nombre de $\\text{km}$ parcourus, puis un supplément par kilomètre parcouru de $${texNombre(a, 2)}$ €. <br>
            
            ${quidam} loue une voiture à cette société. Elle a un budget de $${budget}$ € et ne veut pas le dépasser.<br>
                      Quel nombre maximum de $\\text{km}$ (arrondi à l'unité) pourra-t-elle parcourir sans dépasser son budget ?
                                   `
            texteCorr = `En notant $x$, le nombre de $\\text{km}$ parcourus, le coût pour la location mensuelle est donné par${sp()}: $${reduireAxPlusB(a, b)}$.<br>
            Le budget ${deDevant(quidam)} étant de $${budget}$ €, le nombre de $\\text{km}$ $x$ qu'elle pourra parcourir doit vérifier $${reduireAxPlusB(a, b)}<${budget}$.<br>
            $\\begin{aligned}
            ${reduireAxPlusB(a, b)}&\\leqslant${budget}\\\\
            ${texNombre(a, 2)}x+${b}-${miseEnEvidence(b, bleuMathalea)}&\\leqslant ${budget}x-${miseEnEvidence(b, bleuMathalea)}\\\\
            ${texNombre(a, 2)}x&\\leqslant${budget - b}\\\\
            x&\\leqslant\\dfrac{${budget - b}}{${texNombre(a, 2)}}
    \\end{aligned}$<br>`

            texteCorr += `Comme $\\dfrac{${budget - b}}{${texNombre(a, 2)}}${Math.round((budget - b) / a) === (budget - b) / a ? '=' : '\\approx'} ${texNombre((budget - b) / a, 2)}$, ${quidam} pourra faire au maximum $${miseEnEvidence(texNombre(Math.floor((budget - b) / a)))}\\text{ km}$ pendant le mois avec son budget de $${budget}$ €.
       `
            reponse = texNombre(Math.floor((budget - b) / a), 0)

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteApres: '$\\text{ km}$' },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break
        case 'typeE3':
          {
            const PB = randint(7, 25, [10, 20]) / 2 // prix billet
            const EM = randint(70, 150) // nombre entrée matin
            const RT = randint(200, 400) * 10 // recette totale
            texte = ` À la mi-journée, la recette d'un musée s'élève à $${texNombre(PB * EM, 2)}$ € pour $${EM}$ entrées. Le prix de l'entrée est unique.<br>
                Quel doit être le minimum d'entrées en deuxième partie de journée pour que la recette de la journée soit au moins égale à $${texNombre(RT)}$ €${sp()}?<br>
                Résoudre ce problème en écrivant et résolvant une inéquation modélisant la situation.
                                       `
            texteCorr = `Le montant du billet d'entrée est donné par $${texNombre(PB * EM, 2)}${sp(1)} € \\div ${EM}=${texPrix(PB)}$ €.<br>

                En notant $x$ le nombre d'entrées en deuxième partie de journée, on obtient${sp()}: $${texNombre(PB * EM, 2)} +${texNombre(PB, 2)}\\times x\\geqslant ${texNombre(RT)}$.<br>

                $\\begin{aligned}
                ${texNombre(PB * EM, 2)} +${texNombre(PB, 2)} x&\\geqslant ${texNombre(RT)}\\\\
                ${texNombre(PB * EM, 2)} +${texNombre(PB, 2)}x-${miseEnEvidence(texNombre(PB * EM, 2), bleuMathalea)}&\\geqslant ${texNombre(RT)}-${miseEnEvidence(texNombre(PB * EM, 2), bleuMathalea)}\\\\
                ${texNombre(PB, 2)}x&\\geqslant ${texNombre(RT - PB * EM, 2)}\\\\
                x&\\geqslant \\dfrac{${texNombre(RT - PB * EM, 2)}}{${texNombre(PB, 2)}}\\\\
    \\end{aligned}$<br>
  Comme $\\dfrac{${texNombre(RT - PB * EM, 2)}}{${texNombre(PB, 2)}}${Math.round((RT - PB * EM) / PB) === (RT - PB * EM) / PB ? '=' : '\\approx'} ${texNombre((RT - PB * EM) / PB, 1)}$,
  il faudra au minimum ${Math.round((RT - PB * EM) / PB) === (RT - PB * EM) / PB ? `$${miseEnEvidence(texNombre((RT - PB * EM) / PB, 0))}$` : `$${miseEnEvidence(texNombre(Math.floor((RT - PB * EM) / PB) + 1, 0))}$`} entrées pour que la recette de la journée soit au moins égale à $${texNombre(RT)}$ €.
                            `
            reponse =
              Math.round((RT - PB * EM) / PB) === (RT - PB * EM) / PB
                ? texNombre((RT - PB * EM) / PB, 0)
                : texNombre(Math.floor((RT - PB * EM) / PB) + 1, 0)

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteApres: 'entrées', texteAvant: '<br>' },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break

        case 'typeE4':
          {
            const choix = choice([true, false])
            const l = randint(3, 10) // largeur
            const L = l + randint(3, 10) // longueur

            const P: [string, number] = choice([
              ['au tiers', 3],
              ['au quart', 4],
              ['à la moitié', 2],
              ['au dixième', 10],
              ['au cinquième', 5],
            ])
            const f = new FractionEtendue(
              (L * l) / 2,
              (P[1] * l) / 2 + l / 2,
            ).simplifie()
            const f2 = new FractionEtendue(l * L, l * P[1] + l).simplifie()
            const A = pointAbstrait(0, 0, 'A', 'below')
            const B = pointAbstrait(10, 0, 'B', 'below')
            const C = pointAbstrait(10, 6, 'C')
            const M = pointAbstrait(4, 0, 'M', 'below')
            const D = pointAbstrait(0, 6, 'D')
            const objets = []
            const poly1 = polygone([A, M, D], 'black')
            const poly2 = polygone([C, M, B], 'black')
            poly1.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            poly2.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            objets.push(
              segment(A, B),
              segment(B, C),
              segment(D, A),
              segment(C, D),
              labelPoint(A, B, C, D, M),
              poly1,
              poly2,
            )
            objets.push(
              texteParPosition(
                'x',
                milieu(A, M).x,
                milieu(A, M).y - 0.7,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(l)}`,
                milieu(A, D).x - 0.5,
                milieu(A, D).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(L)}`,
                milieu(C, D).x,
                milieu(C, D).y + 0.5,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )

            texte = ` Soit $ABCD$ un rectangle tel que $AD=${l}$ et $DC=${L}$.<br>
            $M$ est un point du segment $[AB]$. On note $AM=x$.<br>
            Pour quelles valeurs de $x$ l'aire du triangle $AMD$ est-elle ${choix ? 'au plus' : 'au moins'} égale ${P[0]} de l'aire du triangle $CMB$${sp()}?<br>
              `
            texte += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 8,
                pixelsParCm: 20,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.5,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = ` L'aire du triangle $AMD$ est${sp()}: ${l % 2 === 0 ? `$\\dfrac{x\\times ${l}}{2}=${texNombre(l / 2, 0)}x$` : `$\\dfrac{x\\times ${l}}{2}$`}. <br>
            Comme $MB=${L}-x$, l'aire du triangle $CMB$ est${sp()}: ${l % 2 === 0 ? `$\\dfrac{(${L}-x)\\times ${l}}{2}=${texNombre(l / 2, 0)}(${L}-x)$` : `$\\dfrac{(${L}-x)\\times ${l}}{2}$`}. <br>
            Le problème revient donc à déterminer les valeurs de $x$ telles que${sp()}: $${l % 2 === 0 ? `${texNombre(l / 2, 0)}x` : `\\dfrac{${l}x}{2}`} ${choix ? '\\leqslant' : '\\geqslant'} ${l % 2 === 0 ? `\\dfrac{1}{${P[1]}}\\times ${texNombre(l / 2, 0)}(${L}-x)` : `\\dfrac{1}{${P[1]}}\\times \\dfrac{${l}(${L}-x)}{2}`}$. <br>`
            if (l % 2 === 0) {
              texteCorr += `$\\begin{aligned}
            ${texNombre(l / 2, 0)}x &${choix ? '\\leqslant' : '\\geqslant'} \\dfrac{${texNombre(l / 2, 0)}(${L}-x)}{${P[1]}}${sp(7)}\\\\`
              texteCorr += ` ${texNombre(l / 2, 0)}x \\times ${P[1]}&${choix ? '\\leqslant' : '\\geqslant'} \\dfrac{${texNombre(l / 2, 0)}(${L}-x)}{${P[1]}}\\times ${P[1]} ${sp(7)}\\text{ On multiplie par ${P[1]}, le sens de l'inéquation ne change pas.}\\\\`
              texteCorr += ` ${texNombre((P[1] * l) / 2, 0)}x &${choix ? '\\leqslant' : '\\geqslant'} ${texNombre(l / 2, 0)}(${L}-x)\\\\`
              texteCorr += ` ${texNombre((P[1] * l) / 2, 0)}x &${choix ? '\\leqslant' : '\\geqslant'} ${texNombre((L * l) / 2, 0)}-${texNombre(l / 2, 0)}x\\\\`
              texteCorr += ` ${texNombre((P[1] * l) / 2, 0)}x +${texNombre(l / 2, 0)}x&${choix ? '\\leqslant' : '\\geqslant'} ${texNombre((L * l) / 2, 0)}\\\\`
              texteCorr += ` ${texNombre((P[1] * l) / 2 + l / 2, 0)}x &${choix ? '\\leqslant' : '\\geqslant'} ${texNombre((L * l) / 2, 0)}\\\\`
              texteCorr += ` x &${choix ? '\\leqslant' : '\\geqslant'} ${f.texFraction}\\\\`

              texteCorr += '\\end{aligned}$<br>'
              texteCorr += `L'aire du triangle $AMD$ est ${choix ? 'au plus' : 'au moins'} égale ${P[0]} de l'aire du triangle $CMB$ pour $x\\in ${choix ? `${miseEnEvidence(`\\left[0\\,;\\,${f.texFraction}\\right]`)}` : `${miseEnEvidence(`\\left[${f.texFraction}\\,;\\,${L}\\right]`)}`}$`
              reponse = choix
                ? `[0;${f.texFraction}]`
                : `[${f.texFraction};${L}]`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierEnsemble,
              )
            } else {
              texteCorr += `$\\begin{aligned}
              \\dfrac{${l} x}{2} &${choix ? '\\leqslant' : '\\geqslant'} \\dfrac{${l}(${L}-x)}{${2 * P[1]}}\\\\`
              texteCorr += `\\dfrac{${l} x}{2} \\times ${2 * P[1]}&${choix ? '\\leqslant' : '\\geqslant'} \\dfrac{${l}(${L}-x)}{${texNombre(P[1] * 2, 0)}}\\times ${2 * P[1]} ${sp(7)}\\text{ On multiplie par ${2 * P[1]}, le sens des inégalités ne change pas.}\\\\`
              texteCorr += ` ${texNombre(l * P[1], 0)}x &${choix ? '\\leqslant' : '\\geqslant'} ${l}(${L}-x)\\\\`
              texteCorr += ` ${texNombre(l * P[1], 0)}x &${choix ? '\\leqslant' : '\\geqslant'} ${l * L}-${l}x\\\\`
              texteCorr += ` ${texNombre(l * P[1], 0)}x +${l}x&${choix ? '\\leqslant' : '\\geqslant'} ${l * L}\\\\`
              texteCorr += ` ${texNombre(l * P[1] + l, 0)}x &${choix ? '\\leqslant' : '\\geqslant'} ${l * L}\\\\`
              texteCorr += ` x &${choix ? '\\leqslant' : '\\geqslant'} ${f2.texFraction}\\\\`
              texteCorr += '\\end{aligned}$<br>'
              texteCorr += `L'aire du triangle $AMD$ est ${choix ? 'au plus' : 'au moins'} égale ${P[0]} de l'aire du triangle $CMB$ pour $x\\in ${choix ? `${miseEnEvidence(`\\left[0\\,;\\,${f.texFraction}\\right]`)}` : `${miseEnEvidence(`\\left[${f.texFraction}\\,;\\,${L}\\right]`)}`}$`
              reponse = choix
                ? `[0;${f.texFraction}]`
                : `[${f.texFraction};${L}]`
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierEnsemble,
                  { texteAvant: '<br>' },
                )
            }
            handleAnswers(this, i, {
              reponse: { value: reponse, options: { intervalle: true } },
            })
          }
          break

        case 'typeE5':
          {
            const a = randint(8, 15) // longueur en bas
            const b = randint(2, 6) // longueur ajoutée à x
            const P = randint(50, 70)
            const A = pointAbstrait(0, 0, 'A')
            const B = pointAbstrait(10, 0, 'B')
            const C = pointAbstrait(10, 6, 'C')
            const D = pointAbstrait(0, 6, 'D')
            const E = pointAbstrait(0, 2, 'E')
            const F = pointAbstrait(-2, 2, 'F')
            const G = pointAbstrait(-2, 0, 'G')
            const segmentEA = segment(A, E)
            segmentEA.pointilles = 2
            const objets = []
            const poly = polygone([A, B, C, D, E, F, G], 'black')

            poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')

            objets.push(poly, segmentEA)
            objets.push(
              texteParPosition(
                'x',
                milieu(G, F).x - 0.5,
                milieu(G, F).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                'x',
                milieu(G, A).x,
                milieu(G, A).y - 0.5,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `x+${texNombre(b)}`,
                milieu(B, C).x + 1,
                milieu(B, C).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(a)}`,
                milieu(A, B).x,
                milieu(A, B).y - 0.5,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )

            texte = ` On considère la figure ci-dessous (l'unité est le centimètre). <br>
            Quelles sont les valeurs possibles de $x$ pour que le périmètre de la figure soit supérieur à $${P}\\text{ cm}$.<br>
              `
            texte += mathalea2d(
              {
                xmin: -3,
                ymin: -1,
                xmax: 12,
                ymax: 8,
                pixelsParCm: 20,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.5,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `Le périmètre de la figure est${sp()}: $x+${a}+(x+${b})+${a}+${b}+x+x=4x+${2 * b + 2 * a}$.<br>
            Le périmètre de la figure doit être supérieur à $${P}$, on cherche $x$ tel que${sp()}: <br>

             `
            texteCorr += `$\\begin{aligned}
            4x+${2 * b + 2 * a} &>${P}\\\\
            4x &>${P}-${2 * b + 2 * a}\\\\
            4x&>${P - 2 * b - 2 * a}\\\\
            x&>\\dfrac{${P - 2 * b - 2 * a}}{4}`
            texteCorr += '\\end{aligned}$<br>'

            texteCorr += `Comme $\\dfrac{${P - 2 * b - 2 * a}}{4}=${texNombre((P - 2 * b - 2 * a) / 4, 2)}$, $x$ doit être supérieur à $${miseEnEvidence(texNombre((P - 2 * b - 2 * a) / 4, 2))}\\text{ cm}$ pour que le périmètre de la figure soit supérieur à $${P}\\text{ cm}$.

             `
            reponse = new FractionEtendue(P - 2 * b - 2 * a, 4).texFraction

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: '<br>$x>$' },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break

        case 'typeE6':
          {
            const a = randint(1, 3) // côté carré
            const b = choice([6, 8, 10, 12]) // hauteur triangle
            const Aire = randint(50, 70)
            const f = new FractionEtendue(Aire - a ** 2, a + b / 2).simplifie()
            const A = pointAbstrait(0, 0, 'A')
            const B = pointAbstrait(8, 0, 'B')
            const C = pointAbstrait(10, 0, 'C')
            const D = pointAbstrait(10, 2, 'D')
            const E = pointAbstrait(8, 2, 'E')
            const F = pointAbstrait(4, 8, 'F')
            const G = pointAbstrait(0, 2, 'G')
            const H = pointAbstrait(4, 2, 'H')
            const segmentFH = segment(F, H)
            segmentFH.pointilles = 2
            const objets = []
            const poly1 = polygone([A, B, E, G], 'black')
            poly1.couleurDeRemplissage = colorToLatexOrHTML('#7dbdd8')
            const poly2 = polygone([B, C, D, E], 'black')
            poly2.couleurDeRemplissage = colorToLatexOrHTML('#e1ac66')
            const poly3 = polygone([G, E, F], 'black')
            poly3.couleurDeRemplissage = colorToLatexOrHTML('#75ee7e')
            objets.push(
              poly1,
              poly2,
              poly3,
              segmentFH,
              codageAngleDroit(F, H, E),
            )
            objets.push(
              texteParPosition(
                'x',
                milieu(A, B).x,
                milieu(A, B).y - 0.7,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(a)}`,
                milieu(G, A).x - 0.8,
                milieu(G, A).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(a)}`,
                milieu(B, C).x,
                milieu(B, C).y - 0.7,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(b)}`,
                milieu(F, H).x + 0.5,
                milieu(F, H).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )

            texte = ` On considère la figure ci-dessous sur laquelle les longueurs sont en cm. <br>
            Quelles sont les valeurs possibles de $x$ pour que l'aire de cette figure dépasse $${Aire}\\text{ cm}^2$${sp()}?<br>
            Résoudre ce problème en le modélisant par une inéquation.<br>
              `
            texte += mathalea2d(
              {
                xmin: -3,
                ymin: -1,
                xmax: 12,
                ymax: 9,
                pixelsParCm: 20,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.5,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `La figure est constituée d'un rectangle, d'un carré et d'un triangle.<br>
           $\\bullet$ L'aire du rectangle est${sp()}: $${a}\\times x=${rienSi1(a)}x$.<br>
           $\\bullet$ L'aire du carré est${sp()}: $${a}\\times ${a}=${a ** 2}$.<br>
           $\\bullet$ L'aire du triangle est${sp()}: $\\dfrac{${b}\\times x}{2}=${texNombre(b / 2, 0)}x$.<br>
Le problème revient donc à trouver les valeurs de $x$ vérifiant${sp()}: $${rienSi1(a)}x+${a ** 2}+${texNombre(b / 2, 0)}x>${Aire}$, soit $${texNombre(a + b / 2, 0)}x+${a ** 2}>${Aire}$.<br>

             `
            texteCorr += `$\\begin{aligned}
            ${texNombre(a + b / 2, 0)}x+${a ** 2} &>${Aire}\\\\
            ${texNombre(a + b / 2, 0)}x &>${Aire}-${a ** 2}\\\\
            ${texNombre(a + b / 2, 0)}x &>${Aire - a ** 2}\\\\
            x&>\\dfrac{${Aire - a ** 2}}{${texNombre(a + b / 2, 0)}}`
            texteCorr += '\\end{aligned}$<br>'
            if (pgcd(Aire - a ** 2, a + b / 2) === 1) {
              texteCorr += `$x$ doit être supérieur à $${miseEnEvidence(`\\dfrac{${Aire - a ** 2}}{${texNombre(a + b / 2, 0)}}`)}\\text{ cm}$ pour que l'aire de la figure dépasse $${Aire}\\text{ cm}^2$.
            `

              reponse = new FractionEtendue(Aire - a ** 2, a + b / 2)
                .texFraction
            } else {
              texteCorr += `Comme $\\dfrac{${Aire - a ** 2}}{${texNombre(a + b / 2, 0)}}=${f.texFraction}$, $x$ doit être supérieur à $${miseEnEvidence(f.texFraction)}\\text{ cm}$ pour que l'aire de la figure dépasse $${Aire}\\text{ cm}^2$.
             `
              reponse = f.texFraction
            }
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: '<br>$x>$' },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break

        case 'typeE7':
          {
            const a = randint(-10, 10, [-1, 0, 1])
            const b = randint(-10, 10, [-1, 0, 1])
            const c = randint(2, 10)
            const res = randint(-20, 20, 0)
            const f = new FractionEtendue(res - b * c, c * a).simplifie()
            const choix = choice([
              ['strictement supérieur', '>', '<'],
              ['strictement inférieur', '<', '>'],
              ['inférieur ou égal ', '\\leqslant', '\\geqslant'],
              ['supérieur ou égal ', '\\geqslant', '\\leqslant'],
            ])
            texte = ` ${texteGras(`Voici un programme de calcul${sp()}:`)} `
            texte += itemize([
              'Choisir un nombre',
              `Multiplier ce nombre par $${a}$`,
              `Ajouter $${b}$`,
              `Multiplier le résultat par $${c}$`,
            ])
            texte += `Quels nombres doit-on choisir au départ pour obtenir un nombre ${choix[0]} à $${res}$.<br>
               `

            texteCorr = `En notant $x$ le nombre choisi au départ, on obtient :<br>
          $\\bullet$ Multiplier ce nombre par $${a}$${sp()}: ${sp(6)}$${a}\\times x=${a}x$ ;<br>
          $\\bullet$ Ajouter $${b}$${sp()}: ${sp(6)}$${a}x${ecritureAlgebrique(b)}$ ; <br>
          $\\bullet$ Multiplier le résultat par $${c}$${sp()}:${sp(6)}$${c}\\times (${a}x${ecritureAlgebrique(b)})=${texNombre(c * a)}x${ecritureAlgebrique(b * c)}$.<br>
          On cherche $x$ tel que${sp()}: <br>`
            texteCorr += `$\\begin{aligned}
         ${texNombre(c * a)}x${ecritureAlgebrique(b * c)} &${choix[1]}${res}\\\\
         ${texNombre(c * a)}x &${choix[1]}${res}${ecritureAlgebrique(-b * c)}\\\\`
            texteCorr += ` x &${c * a > 0 ? `${choix[1]}` : `${choix[2]}`}\\dfrac{${res - b * c}}{${texNombre(c * a)}}\\\\`
            texteCorr += '\\end{aligned}$<br>'
            if (pgcd(res - b * c, c * a) === 1) {
              texteCorr += `On doit choisir $x${c * a > 0 ? `${choix[1]}` : `${choix[2]}`}${miseEnEvidence(f.texFraction)}$ pour obtenir un nombre ${choix[0]} à $${res}$.
            `
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                {
                  texteAvant:
                    c * a > 0 ? `<br>$x${choix[1]}$` : `<br>$x${choix[2]}$`,
                },
              )
            } else {
              texteCorr += `Comme $\\dfrac{${res - b * c}}{${texNombre(c * a)}}=${f.texFraction}$, on doit choisir $x${c * a > 0 ? `${choix[1]}` : `${choix[2]}`}${miseEnEvidence(f.texFraction)}$ pour obtenir un nombre ${choix[0]} à $${res}$.
             `
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                {
                  texteAvant:
                    c * a > 0 ? `<br>$x${choix[1]}$` : `<br>$x${choix[2]}$`,
                },
              )
            }
            reponse = f.texFraction
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break

        case 'typeE8':
          {
            const a = randint(-10, 10, 0)

            const b = randint(-10, 10, 0)
            const f = new FractionEtendue(b * b, a - 2 * b).simplifie()
            const choix = choice([
              ['strictement supérieur', '>', '<'],
              ['strictement inférieur', '<', '>'],
              ['inférieur ou égal ', '\\leqslant', '\\geqslant'],
              ['supérieur ou égal ', '\\geqslant', '\\leqslant'],
            ])
            texte = `On donne les deux programmes de calcul suivants${sp()}:<br>
            ${texteGras(`Programme $\\mathbf{1}$${sp()}:`)}<br>
                   `
            texte += itemize([
              'Choisir un nombre',
              `Ajouter $${a}$`,
              'Multiplier le résultat par le nombre choisi au départ',
            ])
            texte += `<br>
            ${texteGras(`Programme $\\mathbf{2}$${sp()}:`)}<br>
                        `
            texte += itemize([
              'Choisir un nombre',
              `Ajouter $${b}$`,
              'Prendre le carré du résultat',
            ])
            texte += `<br>Déterminer les nombres que l'on doit entrer dans ces deux programmes pour qu'au final le résultat obtenu
            avec le programme $1$ soit ${choix[0]} à celui obtenu avec le programme $2$.<br><br>`
            texteCorr = `En notant $x$ le nombre choisi au départ${sp()}: <br>
            On obtient avec le ${texteGras(`programme $\\mathbf{1}$${sp()}:`)} <br>
            $\\bullet$ Ajouter $${a}$${sp()}: ${sp(5)} $x+${ecritureParentheseSiNegatif(a)}$ ;<br>
            $\\bullet$ Multiplier le résultat par le nombre choisi au départ${sp()}: ${sp(5)} $x\\times(x${ecritureAlgebrique(a)})=x^2${a > 0 ? '+' : '-'}${rienSi1(abs(a))}x$.<br>
                   On obtient avec le ${texteGras(`programme $\\mathbf{2}$${sp()}:`)} <br>
        $\\bullet$ Ajouter $${b}$${sp()}:${sp(5)} $x+${ecritureParentheseSiNegatif(b)}$ ;<br>
        $\\bullet$ Prendre le carré du résultat${sp()}:${sp(5)} $(x${ecritureAlgebrique(b)})^2=x^2${ecritureAlgebrique(2 * b)}x+${b * b}$.<br>
        
        Les nombres $x$ que l'on doit entrer dans les deux programmes pour qu'au final le résultat obtenu avec le programme $1$ soit ${choix[0]} à celui obtenu avec le programme $2$ vérifient${sp()}: <br>
        $\\begin{aligned}
        x^2${a > 0 ? '+' : '-'}${rienSi1(abs(a))}x & ${choix[1]} x^2${ecritureAlgebrique(2 * b)}x+${b * b}\\\\
 ${rienSi1(a)}x & ${choix[1]} ${ecritureAlgebrique(2 * b)}x+${b * b}\\\\
 ${2 * b > 0 ? `${rienSi1(a)}x- ${2 * b}x` : `${rienSi1(a)}x- (${2 * b}x)`}& ${choix[1]} ${b * b}\\\\
 ${rienSi1(a - 2 * b)}x& ${choix[1]} ${b * b}\\\\`
            if (a - 2 * b === 1) {
              texteCorr += ''
            } else {
              texteCorr += ` x &${a - 2 * b > 0 ? `${choix[1]}` : `${choix[2]}`}\\dfrac{${b * b}}{${a - 2 * b}}\\\\`
            }
            texteCorr += '\\end{aligned}$<br>'
            if (pgcd(b * b, a - 2 * b) === 1) {
              texteCorr += `On doit choisir $x${a - 2 * b > 0 ? `${choix[1]}` : `${choix[2]}`}${miseEnEvidence(f.texFraction)}$ pour que le résultat obtenu
  avec le programme $1$ soit ${choix[0]} à celui obtenu avec le programme $2$.
`
            } else {
              texteCorr += `Comme $\\dfrac{${b * b}}{${a - 2 * b}}=${f.texFraction}$, on doit choisir $x${a - 2 * b > 0 ? `${choix[1]}` : `${choix[2]}`}${miseEnEvidence(f.texFraction)}$ pour que le résultat obtenu
  avec le programme $1$ soit ${choix[0]} à celui obtenu avec le programme $2$.`
            }
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteAvant: a - 2 * b > 0 ? `$x${choix[1]}$` : `$x${choix[2]}$`,
              },
            )
            reponse = f.texFraction
            handleAnswers(this, i, { reponse: { value: reponse } })
          }

          break
      }

      if (this.questionJamaisPosee(i, reponse)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
