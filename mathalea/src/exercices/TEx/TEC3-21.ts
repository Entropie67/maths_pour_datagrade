import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  listePour2PiSur3,
  listePour3PiSur4,
  listePour5PiSur6,
  listePourMoins2PiSur3,
  listePourMoins3PiSur4,
  listePourMoins5PiSur6,
  listePourMoinsPiSur3,
  listePourMoinsPiSur4,
  listePourMoinsPiSur6,
  listePourPiSur3,
  listePourPiSur4,
  listePourPiSur6,
} from '../../lib/mathFonctions/Complexe'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Travailler sur différentes écritures d'un nombre complexe"
export const interactifReady = true

export const uuid = '9c8d5'
export const refs = {
  'fr-fr': ['TEC3-21'],
  'fr-ch': [],
}
export const dateDePublication = '20/08/2024'
export const dateDeModifImportante = '07/04/2026'

/**
 * Écrire un complexe sous différentes formes
 * @author Jean-claude Lhote
 */

export default class AcosOmegaTPlusBSinOmegaT extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacingCorr = 3
    this.sup = '1'
    this.besoinFormulaireTexte = [
      'Type de questions',
      ' Nombres séparés par des tirets :\n1 : Algébrique vers trigonométrique\n2 : Trigonométrique vers algébrique\n3 : Algébrique vers exponentielle\n4 : Exponentielle vers algébrique\n5 : Mélange',
    ]
  }

  nouvelleVersion() {
    const listeDeValeurs = combinaisonListes(
      [
        ...listePourPiSur3,
        ...listePourPiSur4,
        ...listePourPiSur6,
        ...listePour2PiSur3,
        ...listePour3PiSur4,
        ...listePour5PiSur6,
        ...listePourMoinsPiSur3,
        ...listePourMoinsPiSur4,
        ...listePourMoinsPiSur6,
        ...listePourMoins2PiSur3,
        ...listePourMoins3PiSur4,
        ...listePourMoins5PiSur6,
      ],
      this.nbQuestions,
    )

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      const { a, b, A, aSurA, bSurA, phi } = listeDeValeurs[i]
      let texte = 'Soit le nombre complexe '
      let texteCorr: string
      let value: string

      switch (Number(listeTypeDeQuestions[i])) {
        case 1: // algébrique vers trigo
          texte += `$z=${a}${b === '1' ? '+' : b === '-1' ? '-' : b.startsWith('-') ? b : `+${b}`}\\mathrm{i}$.<br>`
          texte += "Donner l'écriture trigonométrique de $z$."
          texteCorr = `$z=${a}${b === '1' ? '+' : b === '-1' ? '-' : b.startsWith('-') ? b : `+${b}`}\\mathrm{i}$ est de la forme $a+b\\mathrm{i}$ avec $a=${a}$ et $b=${b}$.<br>`
          texteCorr += `Calculons le module de $z$ : $|z|=\\sqrt{${a.startsWith('-') || a.includes('frac') || a.includes('sqrt') ? `\\left(${a}\\right)^2` : `${a}^2`}+${b.startsWith('-') || b.includes('frac') || b.includes('sqrt') ? `\\left(${b}\\right)^2` : `${b}^2`}}=${A}$.<br>`
          texteCorr += `Factorisons $|z|$ : $z=${A}\\left(${aSurA}${bSurA.startsWith('-') ? `${bSurA}` : `+${bSurA}`}\\mathrm{i}\\right)$.<br>`
          texteCorr += `Nous reconnaissons ici :<br>d'une part, $\\cos\\left(${phi}\\right)=${aSurA}$ et<br>d'autre part, $\\sin\\left(${phi}\\right)=${bSurA}$.<br>`
          value = `${A}\\left(\\cos\\left(${phi}\\right)+\\mathrm{i}\\sin\\left(${phi}\\right)\\right)`
          break
        case 2: // trigo vers algébrique
          texte += `$z=${A}\\left(\\cos\\left(${phi}\\right)+\\mathrm{i}\\sin\\left(${phi}\\right)\\right)$.<br>`
          texte += "Donner l'écriture algébrique de $z$."
          texteCorr = `Nous savons que $\\cos\\left(${phi}\\right)=${aSurA}$ et $\\sin\\left(${phi}\\right)=${bSurA}$, donc en substituant dans l'expression de $z$, nous obtenons :<br>`
          texteCorr += `$z=${A}\\left(${aSurA}${bSurA.startsWith('-') ? `${bSurA}` : `+${bSurA}`}\\mathrm{i}\\right)$.<br>`
          texteCorr += `En développant : $z=${A}\\times ${aSurA.startsWith('-') ? `\\left(${aSurA}\\right)` : aSurA}${bSurA.startsWith('-') ? `-${A}\\times ${bSurA.substring(1)}` : `+${A}\\times ${bSurA}`}\\mathrm{i}$.<br>`
          value = `${a}${b.startsWith('-') ? `${b}` : `+${b}`}\\mathrm{i}`

          break
        case 3:
          texte += `$z=${a}${b === '1' ? '+' : b === '-1' ? '-' : b.startsWith('-') ? b : `+${b}`}\\mathrm{i}$.<br>`
          texte += "Donner l'écriture de $z$ sous la forme $ke^{i\\theta}$."
          texteCorr = `$z=${a}${b === '1' ? '+' : b === '-1' ? '-' : b.startsWith('-') ? b : `+${b}`}\\mathrm{i}$ est de la forme $a+b\\mathrm{i}$ avec $a=${a}$ et $b=${b}$.<br>`
          texteCorr += `Calculons le module de $z$ : $|z|=\\sqrt{${a.startsWith('-') || a.includes('frac') || a.includes('sqrt') ? `\\left(${a}\\right)^2` : `${a}^2`}+${b.startsWith('-') || b.includes('frac') || b.includes('sqrt') ? `\\left(${b}\\right)^2` : `${b}^2`}}=${A}$.<br>`
          texteCorr += `Factorisons $|z|$ : $z=${A}\\left(${aSurA}${bSurA.startsWith('-') ? `${bSurA}` : `+${bSurA}`}\\mathrm{i}\\right)$.<br>`
          texteCorr += `Nous reconnaissons ici :<br>d'une part, $\\cos\\left(${phi}\\right)=${aSurA}$ et<br>d'autre part, $\\sin\\left(${phi}\\right)=${bSurA}$.<br>`
          value = `${A}\\mathrm{e}^{${phi.replace('\\dfrac', '\\mathrm{i}\\frac')}}`

          break
        default: // k.e^{i\\theta} vers écriture algébrique
          texte += `$z=${A}\\mathrm{e}^{${phi.replace('\\dfrac', '\\mathrm{i}\\frac')}}$.<br>`
          texte += "Donner l'écriture algébrique de $z$."
          texteCorr = `Nous savons que $\\mathrm{e}^{${phi.replace('\\dfrac', '\\mathrm{i}\\frac')}}=\\cos\\left(${phi}\\right)+\\mathrm{i}\\sin\\left(${phi}\\right)=${aSurA}${bSurA.startsWith('-') ? `${bSurA}` : `+${bSurA}`}\\mathrm{i}$.<br>`
          texteCorr += `Donc $z=${A}\\left(${aSurA}${bSurA.startsWith('-') ? `${bSurA}` : `+${bSurA}`}\\mathrm{i}\\right)$.<br>`
          texteCorr += `Developpons : $z=${A}\\times ${aSurA.startsWith('-') ? `\\left(${aSurA}\\right)` : aSurA}${bSurA.startsWith('-') ? `-${A}\\times ${bSurA.substring(1)}` : `+${A}\\times ${bSurA}`}\\mathrm{i}$.<br>`
          value = `${a}${b.startsWith('-') ? `${b}` : `+${b}`}\\mathrm{i}`
      }
      texteCorr += `Par conséquent, $z=${miseEnEvidence(value)}$.`

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
            texteAvant: '<br>$z=$',
          })

        this.listeCorrections[i] = texteCorr
        handleAnswers(this, i, {
          reponse: { value, options: { calculFormel: true } },
        })
        i++
      }
      cpt++
    }
  }
}
