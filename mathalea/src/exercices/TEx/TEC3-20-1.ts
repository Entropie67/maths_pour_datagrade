import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Écrire sous forme exponentielle des nombres complexes simples'
export const interactifReady = true

export const uuid = '1048e'
export const refs = {
  'fr-fr': ['TEC3-20-1'],
  'fr-ch': [],
}
export const dateDePublication = '05/11/2026'

/**
 * Forme exponentielle de complexes « faciles » : imaginaires purs, réels, ±1±i
 * @author Stéphane Guyon
 */
export default class FormeExponentielleSimple extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de nombres',
      'Nombres séparés par des tirets :\n1 : Imaginaire pur\n2 : Réel non nul\n3 : De la forme ±1±i\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      shuffle: true,
    })
    const expo = (theta: string) => `\\mathrm{e}^{\\mathrm{i}${theta}}`
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; ) {
      let z: string
      let module: string
      let theta: string
      let texteCorr: string
      switch (Number(types[i])) {
        case 1: {
          const positif = choice([true, false])
          const signe = positif ? '' : '-'
          const theta0 = positif ? '\\frac{\\pi}{2}' : '-\\frac{\\pi}{2}'
          const q = randint(1, 5)
          const p = q === 1 ? randint(2, 12) : randint(1, 9)
          if (pgcd(p, q) !== 1 || p === q) {
            cpt++
            continue
          }
          theta = theta0
          if (q === 1) {
            z = `${signe}${p}\\mathrm{i}`
            module = `${p}`
          } else {
            z = `${signe}\\dfrac{${p}\\mathrm{i}}{${q}}`
            module = `\\dfrac{${p}}{${q}}`
          }
          const dtheta = theta
          texteCorr = `On sait que $\\mathrm{e}^{\\mathrm{i}${dtheta}}=\\cos\\left(${dtheta}\\right)+\\mathrm{i}\\sin\\left(${dtheta}\\right)=${signe}\\mathrm{i}$.<br>`
          texteCorr += `Donc $z=${module}\\times\\left(${signe}\\mathrm{i}\\right)=${module}\\times\\mathrm{e}^{\\mathrm{i}${dtheta}}$.<br>`
          break
        }
        case 2: {
          const k = randint(2, 15)
          const positif = choice([true, false])
          z = `${positif ? '' : '-'}${k}`
          module = `${k}`
          theta = positif ? '0' : '\\pi'
          texteCorr = positif
            ? `On sait que $\\mathrm{e}^{\\mathrm{i}\\times 0}=\\mathrm{e}^0=1$.<br>Donc $z=${k}\\times 1=${k}\\mathrm{e}^{\\mathrm{i}\\times 0}$.<br>`
            : `On sait que $\\mathrm{e}^{\\mathrm{i}\\pi}=\\cos(\\pi)+\\mathrm{i}\\sin(\\pi)=-1$.<br>Donc $z=${k}\\times(-1)=${k}\\mathrm{e}^{\\mathrm{i}\\pi}$.<br>`
          break
        }
        default: {
          const a = choice([1, -1])
          const b = choice([1, -1])
          z = `${a === 1 ? '' : '-'}1${b === 1 ? '+' : '-'}\\mathrm{i}`
          module = '\\sqrt{2}'
          theta =
            a === 1
              ? b === 1
                ? '\\frac{\\pi}{4}'
                : '-\\frac{\\pi}{4}'
              : b === 1
                ? '\\frac{3\\pi}{4}'
                : '-\\frac{3\\pi}{4}'
          texteCorr = `Ici, $a=${a}$ et $b=${b}$.<br>`
          texteCorr += `$|z|=\\sqrt{(${a})^2+(${b})^2}=\\sqrt{2}$.<br>`
          const d = theta.replace('\\frac', '\\dfrac')
          const sa = a === 1 ? '' : '-'
          const sb = b === 1 ? '' : '-'
          const sb2 = b === 1 ? '+' : '-'
          texteCorr += `On sait que $\\cos\\left(${d}\\right)=${sa}\\dfrac{\\sqrt{2}}{2}$ et $\\sin\\left(${d}\\right)=${sb}\\dfrac{\\sqrt{2}}{2}$.<br>`
          texteCorr += `$\\begin{aligned}z&=\\sqrt{2}\\left(${sa}\\dfrac{1}{\\sqrt{2}}${sb2}\\dfrac{1}{\\sqrt{2}}\\mathrm{i}\\right)\\\\&=\\sqrt{2}\\left(${sa}\\dfrac{1\\times\\sqrt{2}}{\\sqrt{2}\\times\\sqrt{2}}${sb2}\\dfrac{1\\times\\sqrt{2}}{\\sqrt{2}\\times\\sqrt{2}}\\mathrm{i}\\right)\\\\&=\\sqrt{2}\\left(${sa}\\dfrac{\\sqrt{2}}{2}${sb2}\\dfrac{\\sqrt{2}}{2}\\mathrm{i}\\right)\\\\&=\\sqrt{2}\\left(\\cos\\left(${d}\\right)+\\mathrm{i}\\sin\\left(${d}\\right)\\right)\\\\&=\\sqrt{2}\\mathrm{e}^{\\mathrm{i}${theta}}\\end{aligned}$<br>`
        }
      }
      const reponse = `${module}${expo(theta)}`
      const texte = `Écrire sous forme exponentielle le nombre complexe $z=${z}$.`
      texteCorr += `Par conséquent, $z=${miseEnEvidence(reponse)}$.`
      if (this.questionJamaisPosee(i, z)) {
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
            texteAvant: '<br>$z=$',
          })
        this.listeCorrections[i] = texteCorr
        handleAnswers(this, i, {
          reponse: { value: reponse, options: { calculFormel: true } },
        })
        i++
      }
      cpt++
    }
  }
}
