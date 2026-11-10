import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Déterminer la moyenne et la médiane d'une série statistique"
export const interactifReady = true

export const dateDePublication = '6/1/2022'
export const dateDeModifImportante = '06/11/2026'

export const uuid = '9a575'
export const refs = {
  'fr-fr': ['4S11-2', 'BP1AUTO043'],
  'fr-ch': [],
}

/**
 * @author Rémi Angot
 */
export default class MoyenneEtMediane extends Exercice {
  onlyMoyenne: boolean = false
  constructor() {
    super()
    this.sup = 1
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Effectif total',
      3,
      '1 : Impair\n2 : Pair\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      "Demander l'interprétation pour la médiane",
    ]
    this.sup2 = false
    this.comment =
      "La demande d'interprétation ne peut pas être satisfaite si l'exercice est interactif."
  }

  nouvelleVersion() {
    // Le tirage n'a lieu que pour « Mélange » : les graines publiées de 1 et 2 ne changent pas.
    const parites =
      this.sup === 3 ? combinaisonListes([1, 2], this.nbQuestions) : []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texteCorr = ''
      let mediane = 0
      const nbTemperatures = 2 * randint(3, 5) + (parites[i] ?? this.sup)
      const temperatures = generateTemperatures(nbTemperatures)
      let texte = `Voici les températures, en degré Celsius, relevées sur une période de $${nbTemperatures}$ jours : ${stringList(temperatures)}.<br>`
      const moyenne = getMoyenne(temperatures)
      let isExact = false
      if ((moyenne * 10) % 1 === 0) {
        isExact = true
      }
      const question1 = `Calculer la température moyenne${isExact ? '' : ', au dixième près, '} de cette série. `
      let correction1 = stringCalculMoyenne(temperatures)
      correction1 += `<br><br> La température moyenne est de $${miseEnEvidence(texNombre(getMoyenne(temperatures), 1))}^{\\circ}\\text{C}$.`

      let question2 = ''
      let correction2 = ''
      if (this.onlyMoyenne === false) {
        question2 += 'Calculer la température médiane de cette série'
        if (this.sup2 && !this.interactif) {
          question2 += ' et interpréter le résultat. '
        } else {
          question2 += '. '
        }
        correction2 = `On réordonne les températures par ordre croissant : ${sortedStringList(temperatures)}.<br>`
        mediane = getMedianne(temperatures)
        correction2 +=
          stringCalculMediane(temperatures) +
          `$${miseEnEvidence(texNombre(mediane))}^{\\circ}\\text{C}$.`
        if (this.sup2 && !this.interactif) {
          correction2 += `<br>Cela signifie que la moitié au moins des températures est supérieure ou égale à $${texNombre(mediane)}^{\\circ}\\text{C}$.`
        }
      }
      texte += addMultiMathfield(this, i, {
        dataTemplate: `a) ${question1} ${this.interactif ? ` $M ${isExact ? '=' : '\\approx'} $` : ''} %{champ1}\n${!this.onlyMoyenne ? `b) ${question2}${this.interactif ? ' Médiane : ' : ''} %{champ2}` : ''}`,
        dataOptions: {
          champ1: {
            keyboard: KeyboardType.clavierDeBase,
            texteApres: '$^{\\circ}\\text{C}$',
            ldots: false,
          },
          champ2: {
            keyboard: KeyboardType.clavierDeBase,
            texteApres: '$^{\\circ}\\text{C}$',
            ldots: false,
          },
        },
      })
      const sortedList = temperatures.sort((a, b) => a - b)
      const n = sortedList.length

      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          ...Object.assign(
            {
              champ1: {
                value: arrondi(moyenne, 1),
                options: { nombreDecimalSeulement: true },
              },
            },
            !this.onlyMoyenne
              ? {
                  champ2:
                    n % 2 === 0 && sortedList[n / 2 - 1] !== sortedList[n / 2]
                      ? {
                          value: `]${sortedList[n / 2 - 1]};${sortedList[n / 2]}[`,
                          options: { estDansIntervalle: true },
                        }
                      : {
                          value: mediane,
                          options: { nombreDecimalSeulement: true },
                        },
                }
              : {},
          ),
        },
        { formatInteractif: 'multi-mathfield' },
      )
      texteCorr += correction1
      if (!this.onlyMoyenne) {
        texteCorr += '<br><br>' + correction2
      }
      if (this.questionJamaisPosee(i, moyenne, mediane)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}

function generateTemperatures(nbTemperatures: number): number[] {
  const temperatures = [randint(0, 20)]
  for (let i = 1; i < nbTemperatures; i++) {
    temperatures.push(temperatures[i - 1] + randint(-3, 3))
  }
  return temperatures
}

function stringList(list: number[]): string {
  let result = ''
  for (const item of list) {
    result += `$${item}$ ; `
  }
  return result.slice(0, -3)
}

function sortedStringList(list: number[]): string {
  const sortedList = list.sort((a, b) => a - b)
  return stringList(sortedList)
}

function stringCalculMoyenne(list: number[], arrondi = 1): string {
  let result = '$M = \\dfrac{'
  for (const item of list) {
    result += `${ecritureParentheseSiNegatif(item)} + `
  }
  result = result.slice(0, -3)
  result += `}{${list.length}}`
  const m = getMoyenne(list)
  if ((m * 10 ** arrondi) % 1 === 0) {
    result += ` = ${texNombre(m, arrondi)}$`
  } else {
    result += ` \\approx ${texNombre(m, arrondi)}$`
  }
  return result
}

function getMoyenne(list: number[]): number {
  return list.reduce((a, b) => a + b, 0) / list.length
}

function stringCalculMediane(list: number[]): string {
  const sortedList = list.sort((a, b) => a - b)
  const n = sortedList.length
  let result = `L'effectif total est de $${list.length}$, `
  if (n % 2 === 0) {
    result += `la médiane est donc une valeur comprise entre le ${n / 2}e et le ${n / 2 + 1}e élément de la série ordonnée soit, par exemple `
  } else {
    result += `la médiane est donc le ${Math.ceil(n / 2)}e élément de la série ordonnée soit `
  }
  return result
}

function getMedianne(list: number[]): number {
  const sortedList = list.sort((a, b) => a - b)
  const n = sortedList.length
  if (n % 2 === 0) {
    return (sortedList[n / 2 - 1] + sortedList[n / 2]) / 2
  } else {
    return sortedList[Math.ceil(n / 2) - 1]
  }
}
