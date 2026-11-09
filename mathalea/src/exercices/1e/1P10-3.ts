import { fixeBordures } from '../../lib/2d/fixeBordures'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { Arbre, texProba } from '../../modules/arbres'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Calculer une probabilité avec un arbre'
export const interactifReady = true

export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora
 */
export const dateDeModifImportante = '31/10/2026'

export const uuid = '233ef'

export const refs = {
  'fr-fr': ['1P10-3'],
  'fr-ch': ['4mProbStat-14'],
}
export default class CalculerProbaArbre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 4
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        "1 : Probabilité d'une intersection",
        '2 : Probabilité totale',
        '3 : Probabilité conditionnelle',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Proba rationnelle', true]
    this.sup2 = false
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const rationnel = this.sup2
    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0,
        texte,
        texteCorr,
        reponse,
        cpt = 0,
        pA,
        pB,
        pBb,
        omega,
        pAsachantB,
        pAbsachantBb,
        pAbsachantB,
        pAsachantBb,
        pBsachantA,
        pAbinterBb,
        pAbinterB,
        pAinterBb,
        pAinterB,
        pBsachantAb,
        pAb,
        pBbsachantA,
        pBbsachantAb,
        objets,
        listeEV,
        ev,
        texteProbaTotaleB,
        texteProbaTotaleBb;
      i < this.nbQuestions && cpt < 50;
    ) {
      listeEV = [
        ['A', 'B'],
        ['A', 'C'],
        ['R', 'T'],
        ['K', 'L'],
      ]
      ev = choice(listeEV)
      pA = new FractionEtendue(randint(1, 9), 10)
      pAb = pA.ajouteEntier(-1).oppose()
      pBsachantA = new FractionEtendue(randint(1, 19), 20)
      pBbsachantA = pBsachantA.ajouteEntier(-1).oppose()
      pBsachantAb = new FractionEtendue(randint(1, 19), 20)
      pBbsachantAb = pBsachantAb.ajouteEntier(-1).oppose()
      pAinterB = pA.produitFraction(pBsachantA)
      pAinterBb = pA.produitFraction(pBbsachantA)
      pAbinterB = pAb.produitFraction(pBsachantAb)
      pAbinterBb = pAb.produitFraction(pBbsachantAb)
      pB = pAinterB.sommeFraction(pAbinterB)
      pBb = pAinterBb.sommeFraction(pAbinterBb)
      pAsachantB = pAinterB.diviseFraction(pB)
      pAsachantBb = pAinterBb.diviseFraction(pBb)
      pAbsachantB = pAbinterB.diviseFraction(pB)
      pAbsachantBb = pAbinterBb.diviseFraction(pBb)
      texteProbaTotaleB = `$${ev[0]}$ et $\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}$ forment une partition de l'univers. Donc, d'après la formule des probabilités totales : <br>
                $\\begin{aligned}
                P(${ev[1]})&=P(${ev[0]}\\cap ${ev[1]})+P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}\\cap ${ev[1]})\\\\
                &=P(${ev[0]})\\times P_{${ev[0]}}(${ev[1]})+P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})\\times P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}}(${ev[1]})\\\\
                &=${this.sup2 === true ? `${texProba(pA)}\\times ${texProba(pBsachantA)}` : `${texNombre(pA.valeurDecimale)}\\times ${texNombre(pBsachantA.valeurDecimale, 2)}`}+${this.sup2 === true ? `${texProba(pAb)}\\times ${texProba(pBsachantAb)}` : `${texNombre(pAb.valeurDecimale)}\\times ${texNombre(pBsachantAb.valeurDecimale, 2)}`}\\\\
                &=${this.sup2 === true ? `${pB.simplifie().texFraction}` : `${texNombre(pB.valeurDecimale, 4)}`}
                \\end{aligned}$<br>`
      texteProbaTotaleBb = `$${ev[0]}$ et $\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}$ forment une partition de l'univers. Donc, d'après la formule des probabilités totales : <br>
                $\\begin{aligned}
                P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})&=P(${ev[0]}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})+P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})\\\\
                &=P(${ev[0]})\\times P_{${ev[0]}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})+P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})\\times P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})\\\\
                &=${this.sup2 === true ? `${texProba(pA)}\\times ${texProba(pBbsachantA)}` : `${texNombre(pA.valeurDecimale)}\\times ${texNombre(pBbsachantA.valeurDecimale, 2)}`}+${this.sup2 === true ? `${texProba(pAb)}\\times ${texProba(pBbsachantAb)}` : `${texNombre(pAb.valeurDecimale)}\\times ${texNombre(pBbsachantAb.valeurDecimale, 2)}`}\\\\
                &=${this.sup2 === true ? `${pBb.simplifie().texFraction}` : `${texNombre(pBb.valeurDecimale, 4)}`}
                \\end{aligned}$<br>`
      // On définit l'arbre complet
      omega = new Arbre({
        racine: true,
        rationnel,
        nom: '',
        proba: 1,
        visible: false,
        alter: '',
        enfants: [
          new Arbre({
            rationnel,
            nom: `${ev[0]}`,
            proba: pA,
            enfants: [
              new Arbre({
                rationnel,
                nom: `${ev[1]}`,
                proba: pBsachantA,
              }),
              new Arbre({
                rationnel,
                nom: `\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}`,
                proba: pBbsachantA,
              }),
            ],
          }),
          new Arbre({
            rationnel,
            nom: `\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}`,
            proba: pAb,
            enfants: [
              new Arbre({
                rationnel,
                nom: `${ev[1]}`,
                proba: pBsachantAb,
              }),
              new Arbre({
                rationnel,
                nom: `\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}`,
                proba: pBbsachantAb,
              }),
            ],
          }),
        ],
      })

      omega.setTailles() // On calcule les tailles des arbres.
      objets = omega.represente(0, 9, 0, rationnel ? 3.8 : 2, true, 1, 2) // Arbre complet : échelle plus grande (angle d'ouverture) pour les fractions
      switch (
        listeTypeDeQuestions[i] // listeTypeDeQuestions[i]
      ) {
        case 1: // intersection
          texte = "On donne l'arbre de probabilités :<br><br>"
          texte +=
            mathalea2d(
              Object.assign(
                { scale: 0.7, display: 'inline' } as const,
                fixeBordures(objets),
              ),
              objets,
            ) + '<br>'
          switch (randint(1, 4)) {
            case 1: // PAinterB
              texte += `Calculer $P(${ev[0]}\\cap ${ev[1]})$.`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                { texteAvant: `<br>$P(${ev[0]}\\cap ${ev[1]})=$` },
              )
              reponse = pAinterB.texFraction
              handleAnswers(this, i, { reponse: { value: reponse } })
              texteCorr = `On a : <br>
              $\\begin{aligned}
              P(${ev[0]}\\cap ${ev[1]})&=P(${ev[0]})\\times P_{${ev[0]}}(${ev[1]})\\\\
              &=${this.sup2 === true ? `${texProba(pA)}\\times ${texProba(pBsachantA)}` : `${texNombre(pA.valeurDecimale)}\\times ${texNombre(pBsachantA.valeurDecimale, 2)}`}\\\\
              &=${this.sup2 === true ? `${miseEnEvidence(`${pAinterB.simplifie().texFraction}`)}` : `${miseEnEvidence(`${texNombre(pAinterB.valeurDecimale, 4)}`)}`}
              \\end{aligned}$`
              break
            case 2: // PAinterBb
              texte += `Calculer $P(${ev[0]}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})$.`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                {
                  texteAvant: `<br>$P(${ev[0]}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})=$`,
                },
              )
              reponse = pAinterBb.texFraction
              handleAnswers(this, i, { reponse: { value: reponse } })
              texteCorr = `On a : <br>
              $\\begin{aligned}
              P(${ev[0]}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})&=P(${ev[0]})\\times P_{${ev[0]}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})\\\\
              &=${this.sup2 === true ? `${texProba(pA)}\\times ${texProba(pBbsachantA)}` : `${texNombre(pA.valeurDecimale)}\\times ${texNombre(pBbsachantA.valeurDecimale, 2)}`}\\\\
              &=${this.sup2 === true ? `${miseEnEvidence(`${pAinterBb.simplifie().texFraction}`)}` : `${miseEnEvidence(`${texNombre(pAinterBb.valeurDecimale, 4)}`)}`}
              \\end{aligned}$`
              break
            case 3: // PAbinterB
              texte += `Calculer $P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}\\cap ${ev[1]})$.`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                {
                  texteAvant: `<br>$P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}\\cap ${ev[1]})=$`,
                },
              )
              reponse = pAbinterB.texFraction
              handleAnswers(this, i, { reponse: { value: reponse } })
              texteCorr = `On a : <br>
              $\\begin{aligned}
              P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}\\cap ${ev[1]})&=P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})\\times P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}}(${ev[1]})\\\\
              &=${this.sup2 === true ? `${texProba(pAb)}\\times ${texProba(pBsachantAb)}` : `${texNombre(pAb.valeurDecimale)}\\times ${texNombre(pBsachantAb.valeurDecimale, 2)}`}\\\\
              &=${this.sup2 === true ? `${miseEnEvidence(`${pAbinterB.simplifie().texFraction}`)}` : `${miseEnEvidence(`${texNombre(pAbinterB.valeurDecimale, 4)}`)}`}
              \\end{aligned}$`
              break
            case 4: // PAbinterBb
            default:
              texte += `Calculer $P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})$.`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                {
                  texteAvant: `<br>$P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})=$`,
                },
              )
              reponse = pAbinterBb.texFraction
              handleAnswers(this, i, { reponse: { value: reponse } })
              texteCorr = `On a : <br>
              $\\begin{aligned}
              P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})&=P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})\\times P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})\\\\
              &=${this.sup2 === true ? `${texProba(pAb)}\\times ${texProba(pBbsachantAb)}` : `${texNombre(pAb.valeurDecimale)}\\times ${texNombre(pBbsachantAb.valeurDecimale, 2)}`}\\\\
              &=${this.sup2 === true ? `${miseEnEvidence(`${pAbinterBb.simplifie().texFraction}`)}` : `${miseEnEvidence(`${texNombre(pAbinterBb.valeurDecimale, 4)}`)}`}
              \\end{aligned}$`
              break
          }

          break

        case 2: // proba totale
          texte = "On donne l'arbre de probabilités :<br><br>"
          texte +=
            mathalea2d(
              Object.assign(
                { scale: 0.7, display: 'inline' } as const,
                fixeBordures(objets),
              ),
              objets,
            ) + '<br>'
          switch (randint(1, 2)) {
            case 1: // pB
              texte += `Calculer $P(${ev[1]})$.`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                { texteAvant: `<br>$P(${ev[1]})=$` },
              )
              reponse = pB.texFraction
              handleAnswers(this, i, { reponse: { value: reponse } })
              texteCorr = texteProbaTotaleB
              texteCorr += `Ainsi, ${this.sup2 === true ? `$P(${ev[1]})=${miseEnEvidence(`${pB.simplifie().texFraction}`)}` : `$P(${ev[1]})=${miseEnEvidence(`${texNombre(pB.valeurDecimale, 4)}`)}`}$.`
              break
            case 2:
            default:
              texte += `Calculer $P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})$.`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                {
                  texteAvant: `<br>$P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})=$`,
                },
              )
              reponse = pBb.texFraction
              handleAnswers(this, i, { reponse: { value: reponse } })
              texteCorr = texteProbaTotaleBb
              texteCorr += `Ainsi, ${this.sup2 === true ? `$P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})=${miseEnEvidence(`${pBb.simplifie().texFraction}`)}$.` : `$P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})=${miseEnEvidence(`${texNombre(pBb.valeurDecimale, 4)}`)}$.`}`

              break
          }
          break
        case 3: // conditionnelle inversée
        default:
          texte = "On donne l'arbre de probabilités :<br><br>"
          texte +=
            mathalea2d(
              Object.assign(
                { scale: 0.7, display: 'inline' } as const,
                fixeBordures(objets),
              ),
              objets,
            ) + '<br>'
          switch (randint(1, 4)) {
            case 1: // PAsachantB
              texte += `Calculer $P_{${ev[1]}}(${ev[0]})$.`
              reponse =
                this.sup2 === true
                  ? pAsachantB.texFraction
                  : arrondi(pAsachantB.valeurDecimale, 3)
              if (this.sup2 === true) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: `<br>$P_{${ev[1]}}(${ev[0]})=$`,
                    texteApres: '(résultat en fraction)',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              } else {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: `<br>$P_{${ev[1]}}(${ev[0]})\\approx$`,
                    texteApres: '(valeur décimale arrondie à $0,001$)',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              texteCorr = `On utilise la formule : $P_{${ev[1]}}(${ev[0]})=\\dfrac{P(${ev[1]}\\cap ${ev[0]})}{P(${ev[1]})}$.<br> 
              On commence par calculer $P(${ev[1]})$.<br>`
              texteCorr += texteProbaTotaleB
              texteCorr += `On obtient donc :<br>
              $\\begin{aligned}
              P_{${ev[1]}}(${ev[0]})&=\\dfrac{P(${ev[1]}\\cap ${ev[0]})}{P(${ev[1]})}\\\\
              &=\\dfrac{P(${ev[0]})\\times P_{${ev[0]}}(${ev[1]})}{P(${ev[1]})}\\\\
              &=${this.sup2 === true ? `\\left(${texProba(pA)}\\times ${texProba(pBsachantA)}\\right) \\div ${texProba(pB)}` : `\\dfrac{${texNombre(pA.valeurDecimale, 4)}\\times ${texNombre(pBsachantA.valeurDecimale, 4)}}{${texNombre(pB.valeurDecimale, 4)}}`}\\\\
               &=${this.sup2 === true ? `${texProba(pAinterB)}\\div ${texProba(pB)}` : `\\dfrac{${texNombre(pAinterB.valeurDecimale, 4)}}{${texNombre(pB.valeurDecimale, 4)}}`}\\\\
              &${this.sup2 === true ? `=${miseEnEvidence(`${pAsachantB.simplifie().texFraction}`)}` : `\\approx${miseEnEvidence(`${texNombre(pAsachantB.valeurDecimale, 3)}`)}`}
              \\end{aligned}$`
              break
            case 2: // PAsachantBb
              texte += `Calculer $P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(${ev[0]})$.`
              reponse =
                this.sup2 === true
                  ? pAsachantBb.texFraction
                  : arrondi(pAsachantBb.valeurDecimale, 3)
              if (this.sup2 === true) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: `<br>$P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(${ev[0]})=$`,
                    texteApres: '(résultat en fraction)',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              } else {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: `<br>$P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(${ev[0]})\\approx$`,
                    texteApres: '(valeur décimale arrondie à $0,001$)',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              texteCorr = `On utilise la formule : $P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(${ev[0]})=\\dfrac{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}\\cap ${ev[0]})}{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})}$.<br> 
            On commence par calculer $P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})$.<br>`
              texteCorr += texteProbaTotaleBb
              texteCorr += `On obtient donc :<br>
            $\\begin{aligned}
            P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(${ev[0]})&=\\dfrac{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}\\cap ${ev[0]})}{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})}\\\\
            &=\\dfrac{P(${ev[0]})\\times P_{${ev[0]}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})}{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})}\\\\
            &=${this.sup2 === true ? `\\left(${texProba(pA)}\\times ${texProba(pBbsachantA)}\\right) \\div ${texProba(pBb)}` : `\\dfrac{${texNombre(pA.valeurDecimale, 4)}\\times ${texNombre(pBbsachantA.valeurDecimale, 4)}}{${texNombre(pBb.valeurDecimale, 4)}}`}\\\\
             &=${this.sup2 === true ? `${texProba(pAinterBb)}\\div ${texProba(pBb)}` : `\\dfrac{${texNombre(pAinterBb.valeurDecimale, 4)}}{${texNombre(pBb.valeurDecimale, 4)}}`}\\\\
            &${this.sup2 === true ? `=${miseEnEvidence(`${pAsachantBb.simplifie().texFraction}`)}` : `\\approx${miseEnEvidence(`${texNombre(pAsachantBb.valeurDecimale, 3)}`)}`}
            \\end{aligned}$`
              break
            case 3: // PAbsachantB
              texte += `Calculer $P_{${ev[1]}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})$.`
              reponse =
                this.sup2 === true
                  ? pAbsachantB.texFraction
                  : arrondi(pAbsachantB.valeurDecimale, 3)
              if (this.sup2 === true) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: `<br>$P_{${ev[1]}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})=$`,
                    texteApres: '(résultat en fraction)',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              } else {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: `<br>$P_{${ev[1]}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})\\approx$`,
                    texteApres: '(valeur décimale arrondie à $0,001$)',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              texteCorr = `On utilise la formule : $P_{${ev[1]}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})=\\dfrac{P(${ev[1]}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})}{P(${ev[1]})}$.<br> 
          On commence par calculer $P(${ev[1]})$.<br>`
              texteCorr += texteProbaTotaleB
              texteCorr += `On obtient donc :<br>
          $\\begin{aligned}
          P_{${ev[1]}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})&=\\dfrac{P(${ev[1]}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})}{P(${ev[1]})}\\\\
          &=\\dfrac{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})\\times P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}}(${ev[1]})}{P(${ev[1]})}\\\\
          &=${this.sup2 === true ? `\\left(${texProba(pAb)}\\times ${texProba(pBsachantAb)}\\right) \\div ${texProba(pB)}` : `\\dfrac{${texNombre(pAb.valeurDecimale, 4)}\\times ${texNombre(pBsachantAb.valeurDecimale, 4)}}{${texNombre(pB.valeurDecimale, 4)}}`}\\\\
           &=${this.sup2 === true ? `${texProba(pAbinterB)}\\div ${texProba(pB)}` : `\\dfrac{${texNombre(pAbinterB.valeurDecimale, 4)}}{${texNombre(pB.valeurDecimale, 4)}}`}\\\\
          &${this.sup2 === true ? `=${miseEnEvidence(`${pAbsachantB.simplifie().texFraction}`)}` : `\\approx${miseEnEvidence(`${texNombre(pAbsachantB.valeurDecimale, 3)}`)}`}
          \\end{aligned}$`
              break
            case 4: // PAbsachantBb
            default:
              texte += `Calculer $P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})$.`
              reponse =
                this.sup2 === true
                  ? pAbsachantBb.texFraction
                  : arrondi(pAbsachantBb.valeurDecimale, 3)
              if (this.sup2 === true) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: `<br>$P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})=$`,
                    texteApres: '(résultat en fraction)',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              } else {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: `<br>$P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})\\approx$`,
                    texteApres: '(valeur décimale arrondie à $0,001$)',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              texteCorr = `On utilise la formule : $P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})=\\dfrac{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})}{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]})}}$.<br> 
          On commence par calculer $P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})$.<br>`
              texteCorr += texteProbaTotaleBb
              texteCorr += `On obtient donc :<br>
          $\\begin{aligned}
          P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})&=\\dfrac{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}}\\cap \\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})}{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})}\\\\
          &=\\dfrac{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}})\\times P_{\\overset{\\rule{0.8em}{0.08em}}{${ev[0]}}}(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})}{P(\\overset{\\rule{0.8em}{0.08em}}{${ev[1]}})}\\\\
          &=${this.sup2 === true ? `\\left(${texProba(pAb)}\\times ${texProba(pBbsachantAb)}\\right) \\div ${texProba(pBb)}` : `\\dfrac{${texNombre(pAb.valeurDecimale, 4)}\\times ${texNombre(pBbsachantAb.valeurDecimale, 4)}}{${texNombre(pBb.valeurDecimale, 4)}}`}\\\\
           &=${this.sup2 === true ? `${texProba(pAbinterBb)}\\div ${texProba(pBb)}` : `\\dfrac{${texNombre(pAbinterBb.valeurDecimale, 4)}}{${texNombre(pBb.valeurDecimale, 4)}}`}\\\\
          &${this.sup2 === true ? `=${miseEnEvidence(`${pAbsachantBb.simplifie().texFraction}`)}` : `\\approx${miseEnEvidence(`${texNombre(pAbsachantBb.valeurDecimale, 3)}`)}`}
          \\end{aligned}$`
              break
          }

          break
      }

      if (this.questionJamaisPosee(i, pA)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
