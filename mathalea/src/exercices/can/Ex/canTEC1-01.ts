import { amcConvert } from '../../../lib/amc/amcBuilders'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { Complexe } from '../../../lib/mathFonctions/Complexe'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Somme de nombres complexes'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '26/10/2021'

/**
 * Question de can : calcul de la somme de deux nombres complexes
 * @author Jean-claude Lhote, améliorations par Stéphane Guyon

*/
export const uuid = '71292'

export const refs = {
  'fr-fr': ['canTEC1-01'],
  'fr-ch': ['3mNC-1'],
}

function ecritureComplexe(partieReelle: number, partieImaginaire: number) {
  if (partieImaginaire === 0) return texNombre(partieReelle)
  const partieImaginaireTex = `${rienSi1(partieImaginaire)}\\mathrm{i}`
  if (partieReelle === 0) return partieImaginaireTex
  return `${texNombre(partieReelle)}${partieImaginaire > 0 ? '+' : ''}${partieImaginaireTex}`
}

export default class SommeDeComplexes extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.complexes
  }

  nouvelleVersion() {
    const a = randint(-5, 5, 0)
    const b = randint(-5, 5, 0)
    const c = randint(-5, 5, 0)
    const d = randint(-5, 5, 0)
    const z1 = new Complexe(a, b)
    const z2 = new Complexe(c, d)
    const somme = z1.add(z2)
    const z1Tex = ecritureComplexe(a, b)
    const z2Tex = ecritureComplexe(c, d)
    const sommeTex = ecritureComplexe(a + c, b + d)
    this.question = `Soit $z_1$ et $z_2$ deux nombres complexes définis par $z_1=${z1Tex}$ et $z_2=${z2Tex}$.<br>Calculer $z_1+z_2$.`
    this.correction = `$\\begin{aligned}
z_1+z_2
&=(${z1Tex})+(${z2Tex})\\\\
&=(${a}${c >= 0 ? '+' : ''}${c})+(${b}${d >= 0 ? '+' : ''}${d})\\mathrm{i}\\\\
&=${miseEnEvidence(sommeTex)}.
\\end{aligned}$`
    this.reponse = somme
    this.autoCorrectionAMC[0] = {
      enonce: this.question,
      propositions: [
        {
          type: 'AMCNum',
          propositions: [
            {
              texte: this.correction,
              reponse: {
                valeur: Number(somme.re),
                param: {
                  digits: 2,
                  decimals: 0,
                  signe: true,
                  approx: 0,
                },
              },
            },
          ],
        },
        {
          type: 'AMCNum',
          propositions: [
            {
              texte: '',
              reponse: {
                valeur: Number(somme.im),
                param: {
                  digits: 2,
                  decimals: 0,
                  signe: true,
                  approx: 0,
                },
              },
            },
          ],
        },
      ],
    }
    this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
  }
}
