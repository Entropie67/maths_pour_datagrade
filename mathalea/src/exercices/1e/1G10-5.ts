import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import {
  representant,
  representantNomme,
} from '../../lib/2d/representantVecteur'
import { latex2d } from '../../lib/2d/textes'
import { vecteur } from '../../lib/2d/Vecteur'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = 'Calculer un produit scalaire avec des coordonnées'
export const dateDePublication = '29/04/2025'
export const dateDeModifImportante = '13/03/2026'

/**
 *
 * @author Gilles Mora

 */
export const uuid = '747df'

export const refs = {
  'fr-fr': ['1G10-5'],
  'fr-ch': ['3G95-5'],
}

export default class ProduitScalaireCoordonnees extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    // this.nbQuestionsModifiable= false
    this.sup = 5
    this.spacing = 1.5
    this.besoinFormulaire2CaseACocher = ['Rappel de la formule de cours', false]
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Avec les coordonnées des points',
        '2 : Avec les coordonnées des vecteurs (calculs simples)',
        '3 : Avec les coordonnées des vecteurs (calculs plus difficiles)',
        '4 : Avec un graphique',
        '5 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0, texte, texteCorr, reponse, objets, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const cours = `Dans un repère orthonormé, si $\\overrightarrow{u}\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\overrightarrow{u}\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$ alors 
      $\\vec{u}\\cdot\\vec{v}=xx'+yy'$.<br>`

      switch (
        listeTypeDeQuestions[i] // listeTypeDeQuestions[i]
      ) {
        case 1: //
          {
            const choixb = choice([true, false])
            const choixa = choice([true, false])
            const xA = randint(-10, 10)
            const yA = randint(-10, 10, 0)
            const xB = randint(-10, 10, 0)
            const yB = randint(-10, 10)
            const xC = randint(-10, 10, 0)
            const yC = randint(-10, 10)
            texte = `Dans un repère orthonormé, on considère les points $A(${xA}\\,;\\,${yA})$, $B(${xB}\\,;\\,${yB})$ et $C(${xC}\\,;\\,${yC})$.<br>
          Calculer $${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}$. `
            if (this.sup2) {
              texteCorr = `${cours}`
            } else {
              texteCorr = ''
            }
            texteCorr += `On commence par calculer les coordonnées des vecteurs ${choixa ? `$\\overrightarrow{AB}$ et ${choixb ? '$\\overrightarrow{AC}$' : '$\\overrightarrow{CA}$'}` : `$\\overrightarrow{BA}$ et ${choixb ? '$\\overrightarrow{AC}$' : '$\\overrightarrow{CA}$'}`}<br>
                ${choixa ? `$\\overrightarrow{AB}\\begin{pmatrix}${xB}-${ecritureParentheseSiNegatif(xA)}\\\\${yB}-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$` : `$\\overrightarrow{BA}\\begin{pmatrix}${xA}-${ecritureParentheseSiNegatif(xB)}\\\\${yA}-${ecritureParentheseSiNegatif(yB)}\\end{pmatrix}$`},
                 soit ${choixa ? `$\\overrightarrow{AB}\\begin{pmatrix}${xB - xA}\\\\${yB - yA}\\end{pmatrix}$` : `$\\overrightarrow{BA}\\begin{pmatrix}${xA - xB}\\\\${yA - yB}\\end{pmatrix}$`}.<br><br>
                ${choixb ? `$\\overrightarrow{AC}\\begin{pmatrix}${xC}-${ecritureParentheseSiNegatif(xA)}\\\\${yC}-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$` : `$\\overrightarrow{CA}\\begin{pmatrix}${xA}-${ecritureParentheseSiNegatif(xC)}\\\\${yA}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$`},
                 soit ${choixb ? `$\\overrightarrow{AC}\\begin{pmatrix}${xC - xA}\\\\${yC - yA}\\end{pmatrix}$` : `$\\overrightarrow{CA}\\begin{pmatrix}${xA - xC}\\\\${yA - yC}\\end{pmatrix}$`}.<br><br>
                Ainsi, $${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}
                =${choixa ? `${xB - xA}\\times ${choixb ? `${ecritureParentheseSiNegatif(xC - xA)}` : `${ecritureParentheseSiNegatif(xA - xC)}`}` : `${xA - xB}\\times ${choixb ? `${ecritureParentheseSiNegatif(xC - xA)}` : `${ecritureParentheseSiNegatif(xA - xC)}`}`}
               +${choixa ? `${ecritureParentheseSiNegatif(yB - yA)}\\times ${choixb ? `${ecritureParentheseSiNegatif(yC - yA)}` : `${ecritureParentheseSiNegatif(yA - yC)}`}` : `${ecritureParentheseSiNegatif(yA - yB)}\\times ${choixb ? `${ecritureParentheseSiNegatif(yC - yA)}` : `${ecritureParentheseSiNegatif(yA - yC)}`}`}
                =${choixa ? `${choixb ? miseEnEvidence((xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)) : miseEnEvidence(-((xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)))}` : ` ${choixb ? miseEnEvidence(-((xB - xA) * (xC - xA) + (yB - yA) * (yC - yA))) : miseEnEvidence((xB - xA) * (xC - xA) + (yB - yA) * (yC - yA))}`}$.`
            reponse = `${choixa ? `${choixb ? (xB - xA) * (xC - xA) + (yB - yA) * (yC - yA) : -((xB - xA) * (xC - xA) + (yB - yA) * (yC - yA))}` : ` ${choixb ? -((xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)) : (xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)}`}`
            handleAnswers(this, i, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              {
                texteAvant: `<br>$${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}=$`,
              },
            )
          }
          break

        case 2: //
          {
            const xu = randint(-10, 10)
            const yu = randint(-10, 10, 0)
            const xv = randint(-10, 10, 0)
            const yv = randint(-10, 10)
            texte = `Dans un repère orthonormé, on considère les vecteurs $\\overrightarrow{u}\\begin{pmatrix}${xu}\\\\${yu}\\end{pmatrix}$ et $\\overrightarrow{v}\\begin{pmatrix}${xv}\\\\${yv}\\end{pmatrix}$.<br>
          Calculer $\\vec{u}\\cdot\\vec{v}$.`
            if (this.sup2) {
              texteCorr = `${cours}`
            } else {
              texteCorr = ''
            }
            texteCorr += `$\\vec{u}\\cdot\\vec{v}=${xu}\\times ${ecritureParentheseSiNegatif(xv)}+${ecritureParentheseSiNegatif(yu)}\\times ${ecritureParentheseSiNegatif(yv)}=${miseEnEvidence(xu * xv + yu * yv)}$`
            reponse = xu * xv + yu * yv
            handleAnswers(this, i, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              { texteAvant: '<br>$\\vec{u}\\cdot\\vec{v}=$' },
            )
          }
          break
        case 3: //
          {
            const choix = choice([true, false])
            const xu = randint(-5, 5)
            const yu = randint(-5, 7, 0)
            const xv = randint(-10, 10, 0)
            const yv = randint(-10, 10)
            const xw = randint(-10, 10, 0)
            const yw = randint(-10, 10)
            const k = randint(-9, 9, [0, 1])
            switch (randint(1, 2)) {
              case 1:
                texte = `Dans un repère orthonormé, on considère les vecteurs $\\overrightarrow{u}\\begin{pmatrix}${xu}\\\\${yu}\\end{pmatrix}$ et $\\overrightarrow{v}\\begin{pmatrix}${xv}\\\\${yv}\\end{pmatrix}$.<br>
                Calculer $(${rienSi1(k)}\\vec{u})\\cdot\\vec{v}$.`
                if (this.sup2) {
                  texteCorr = `${cours}`
                } else {
                  texteCorr = ''
                }
                texteCorr += `On a : $${k}\\overrightarrow{u}\\begin{pmatrix}${k}\\times ${ecritureParentheseSiNegatif(xu)}\\\\${k}\\times ${ecritureParentheseSiNegatif(yu)}\\end{pmatrix}$, soit 
                  $${k}\\overrightarrow{u}\\begin{pmatrix}${k * xu}\\\\${k * yu}\\end{pmatrix}$.<br>
                  Ainsi, 
                  $(${rienSi1(k)}\\vec{u})\\cdot\\vec{v}=${k * xu}\\times ${ecritureParentheseSiNegatif(xv)}+${ecritureParentheseSiNegatif(k * yu)}\\times ${ecritureParentheseSiNegatif(yv)}=${miseEnEvidence(k * xu * xv + k * yu * yv)}$`
                reponse = k * xu * xv + k * yu * yv
                handleAnswers(this, i, { reponse: { value: reponse } })
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteAvant: `<br>$(${rienSi1(k)}\\vec{u})\\cdot\\vec{v}=$`,
                  },
                )
                break
              case 2:
              default:
                texte = `Dans un repère orthonormé, on considère les vecteurs $\\overrightarrow{u}\\begin{pmatrix}${xu}\\\\${yu}\\end{pmatrix}$, $\\overrightarrow{v}\\begin{pmatrix}${xv}\\\\${yv}\\end{pmatrix}$ et $\\overrightarrow{w}\\begin{pmatrix}${xw}\\\\${yw}\\end{pmatrix}$.<br>
                  Calculer ${choix ? '$\\vec{u}\\cdot(\\vec{v}+\\vec{w})$' : '$\\vec{u}\\cdot(\\vec{v}-\\vec{w})$'}.`
                if (this.sup2) {
                  texteCorr = `${cours}`
                } else {
                  texteCorr = ''
                }
                texteCorr += `On a : $\\vec{v}${choix ? '+' : '-'}\\vec{w}\\begin{pmatrix}${xv}${choix ? '+' : '-'} ${ecritureParentheseSiNegatif(xw)}\\\\${yv}${choix ? '+' : '-'} ${ecritureParentheseSiNegatif(yw)}\\end{pmatrix}$, soit 
                $\\vec{v}${choix ? '+' : '-'}\\vec{w}\\begin{pmatrix} ${choix ? `${xv + xw}` : `${xv - xw}`} \\\\${choix ? `${yv + yw}` : `${yv - yw}`} \\end{pmatrix}$.<br>
                    Ainsi, 
                    $${choix ? '\\vec{u}\\cdot(\\vec{v}+\\vec{w})' : '\\vec{u}\\cdot(\\vec{v}-\\vec{w})'}=${xu}\\times ${choix ? `${ecritureParentheseSiNegatif(xv + xw)}` : `${ecritureParentheseSiNegatif(xv - xw)}`}+${ecritureParentheseSiNegatif(yu)}\\times ${choix ? ` ${ecritureParentheseSiNegatif(yv + yw)}` : `${ecritureParentheseSiNegatif(yv - yw)}`}=${choix ? `${xu * (xv + xw)} + ${ecritureParentheseSiNegatif(yu * (yv + yw))}` : `${xu * (xv - xw)} + ${ecritureParentheseSiNegatif(yu * (yv - yw))}`}=${choix ? `${miseEnEvidence(xu * (xv + xw) + yu * (yv + yw))}` : `${miseEnEvidence(xu * (xv - xw) + yu * (yv - yw))}`}$.`
                reponse = choix
                  ? xu * (xv + xw) + yu * (yv + yw)
                  : xu * (xv - xw) + yu * (yv - yw)
                handleAnswers(this, i, { reponse: { value: reponse } })
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteAvant: `<br>$${choix ? '\\vec{u}\\cdot(\\vec{v}+\\vec{w})' : '\\vec{u}\\cdot(\\vec{v}-\\vec{w})'}=$`,
                  },
                )
                break
            }
          }
          break
        case 4:
        default:
          {
            objets = []
            const xA = randint(-3, -1)
            const yA = randint(-1, 1)
            const A = pointAbstrait(xA, yA)
            const xu = randint(-2, 2, 0)
            const yu = randint(-5, 5)
            const u = vecteur(xu, yu)
            const xB = randint(1, 2)
            const yB = randint(-1, 0)
            const B = pointAbstrait(xB, yB)
            const xv = randint(-2, 2)
            const yv = randint(-5, 5, 0)
            const v = vecteur(xv, yv)
            const nomvu = representantNomme(u, A, 'u', 1.5, bleuMathalea)
            const vecu = representant(u, A)
            vecu.color = colorToLatexOrHTML(bleuMathalea)
            vecu.epaisseur = 2
            const nomvv = representantNomme(v, B, 'v', 1.5, 'red')
            const vecv = representant(v, B)
            vecv.color = colorToLatexOrHTML('red')
            vecv.epaisseur = 2
            const r = repere({
              xMin: Math.min(xA + xu, xB + xv, -3),
              xMax: Math.max(xA + xu, xB + xv, 3),
              xUnite: 1,
              yMin: Math.min(yA + yu, yB + yv, -3),
              yMax: Math.max(yA + yu, yB + yv, 3),
              yUnite: 1,
              thickHauteur: 0.1,
              yLabelEcart: 0.6,
              xLabelEcart: 0.6,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: Math.min(yA + yu, yB + yv, -3) - 0.1,
              grilleSecondaireYMax: Math.max(yA + yu, yB + yv, 3) + 0.1,
              grilleSecondaireXMin: Math.min(xA + xu, xB + xv, -3) - 0.1,
              grilleSecondaireXMax: Math.max(xA + xu, xB + xv, 3) + 0.1,
            })
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            objets.push(r, o, nomvu, vecu, vecv, nomvv)
            texte = `Dans un repère orthonormé, on considère les vecteurs $\\overrightarrow{u}$ et $\\overrightarrow{v}$.<br>
                Calculer $\\vec{u}\\cdot\\vec{v}$.`
            texte += mathalea2d(
              Object.assign(
                { scale: 0.7, pixelsParCm: 30, display: 'inline' } as const,
                fixeBordures(objets),
              ),
              objets,
            )
            if (this.sup2) {
              texteCorr = `${cours}`
            } else {
              texteCorr = ''
            }
            texteCorr += `On lit graphiquement les coordonnées des vecteurs $\\vec{u}$ et $\\vec{v}$.<br>
            On obtient $\\vec{u}\\begin{pmatrix}${xu}\\\\${yu}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${xv}\\\\${yv}\\end{pmatrix}$.<br>`

            texteCorr += `Ainsi, $\\vec{u}\\cdot\\vec{v}=${xu}\\times ${ecritureParentheseSiNegatif(xv)}+${ecritureParentheseSiNegatif(yu)}\\times ${ecritureParentheseSiNegatif(yv)}=${miseEnEvidence(xu * xv + yu * yv)}$`
            reponse = xu * xv + yu * yv
            handleAnswers(this, i, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              { texteAvant: '<br>$\\vec{u}\\cdot\\vec{v}=$' },
            )
          }
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
