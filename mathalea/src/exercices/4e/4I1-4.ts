import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'

export const titre = 'Associer un script Scratch à un calcul de puissance'
export const interactifReady = true
export const dateDePublication = '12/10/2026'
export const uuid = '3f359'

export const refs = {
  'fr-fr': ['4I1-4'],
  'fr-ch': [],
}

/**
 * Quatre scripts Scratch calculent chacun une puissance en répétant une
 * multiplication (et, pour un exposant négatif, en affichant l'inverse).
 * L'élève associe chaque calcul $a^b$, $b^a$, $(-b)^a$ et $a^{-b}$ au bon
 * script. Les scripts sont présentés dans un ordre mélangé.
 *
 * Une question vaut toujours 4 points : un par calcul à associer.
 *
 * @author Rémi Angot
 */

type Script = {
  /** Nombre de répétitions de la boucle. */
  repetitions: number
  /** Facteur par lequel on multiplie à chaque tour. */
  facteur: number
  /** Le lutin dit l'inverse de la variable plutôt que la variable. */
  inverse: boolean
}

type Calcul = {
  /** Écriture LaTeX de la puissance. */
  tex: string
  script: Script
  explication: string
}

const NOMBRE_DE_CALCULS = 4

/**
 * Code Scratch (LaTeX) du script : « mettre a à 1, répéter n fois
 * mettre a à a × facteur, dire a (ou 1 / a) pendant 2 secondes ».
 * Les retours à la ligne sont indispensables à l'affichage HTML.
 */
function codeScratch({ repetitions, facteur, inverse }: Script): string {
  const aDire = inverse
    ? '\\ovaloperator{\\ovalnum{1} / \\ovalvariable{a}}'
    : '\\ovalvariable{a}'
  return `\\begin{scratch}[print,fill,blocks,scale=0.5]
\\blockinit{quand \\greenflag est cliqué}
\\blockvariable{mettre \\selectmenu{a} à \\ovalnum{1}}
\\blockrepeat{répéter \\ovalnum{${repetitions}} fois}{
\\blockvariable{mettre \\selectmenu{a} à \\ovaloperator{\\ovalvariable{a} * \\ovalnum{${facteur}}}}
}
\\blocklook{dire ${aDire} pendant \\ovalnum{2} secondes}
\\end{scratch}`
}

/** Les quatre calculs, dans l'ordre d'affichage des consignes. */
function creeLesCalculs(a: number, b: number): Calcul[] {
  return [
    {
      tex: `${a}^{${b}}`,
      script: { repetitions: b, facteur: a, inverse: false },
      explication: `on multiplie $${b}$ fois par $${a}$ en partant de $1$`,
    },
    {
      tex: `${b}^{${a}}`,
      script: { repetitions: a, facteur: b, inverse: false },
      explication: `on multiplie $${a}$ fois par $${b}$ en partant de $1$`,
    },
    {
      tex: `(-${b})^{${a}}`,
      script: { repetitions: a, facteur: -b, inverse: false },
      explication: `on multiplie $${a}$ fois par $-${b}$ en partant de $1$`,
    },
    {
      tex: `${a}^{-${b}}`,
      script: { repetitions: b, facteur: a, inverse: true },
      explication: `on calcule $${a}^{${b}}$ (en multipliant $${b}$ fois par $${a}$) puis on affiche son inverse $\\dfrac{1}{${a}^{${b}}}$`,
    },
  ]
}

/** Affiche les scripts numérotés côte à côte (tableau HTML ou LaTeX). */
function tableauDesScripts(scripts: Script[]): string {
  const cellules = scripts.map((script, index) => ({
    numero: `${index + 1})`,
    code: String(scratchblock(codeScratch(script))),
  }))
  if (context.isHtml) {
    return `<table class="border-collapse border border-coopmaths-struct"><tr>${cellules
      .map(
        ({ numero, code }) =>
          `<td class="border border-coopmaths-struct align-top p-2">${numero}<br>${code}</td>`,
      )
      .join('')}</tr></table>`
  }
  const colonne = `p{${(0.97 / NOMBRE_DE_CALCULS).toFixed(2)}\\linewidth}`
  return `\\begin{tabular}{|${`${colonne}|`.repeat(NOMBRE_DE_CALCULS)}}
\\hline
${cellules.map(({ numero, code }) => `${numero}\\par ${code}`).join(' & ')} \\\\
\\hline
\\end{tabular}`
}

export default class AssocierScriptPuissance extends Exercice {
  constructor() {
    super()
    this.consigne =
      'Associer chacun des scripts ci-dessous au calcul qu’il permet d’effectuer.'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const a = randint(2, 5)
      const b = randint(2, 5, [a])
      // 2^4 = 4^2 : deux scripts différents donneraient le même résultat.
      if (a + b === 6 && a * b === 8) continue
      if (!this.questionJamaisPosee(i, a, b)) continue

      const calculs = creeLesCalculs(a, b)
      // ordre dans lequel les scripts sont présentés : ordreScripts[k] est
      // l'indice du calcul dont le script porte le numéro k + 1.
      const ordreScripts = shuffle([0, 1, 2, 3])
      const numeroDuScript = calculs.map(
        (_, indiceCalcul) => ordreScripts.indexOf(indiceCalcul) + 1,
      )

      const dataTemplate = calculs
        .map(
          ({ tex }, indiceCalcul) =>
            `$${tex}$ avec le script N° %{field${indiceCalcul}}`,
        )
        .join('\n\n')
      // Le premier choix sert de valeur d'attente : il reste vide.
      const choices = [
        { label: '', value: '' },
        ...[1, 2, 3, 4].map((numero) => ({
          label: String(numero),
          value: String(numero),
        })),
      ]
      const dataOptions: DataOptionsMultiMathfield = {}
      calculs.forEach((_, indiceCalcul) => {
        dataOptions[`field${indiceCalcul}` as 'field0'] = {
          choices,
          ldots: true,
          // Sans interactivité, les numéros proposés tiennent sur une ligne.
          vertical: false,
        }
      })

      this.listeQuestions[i] =
        tableauDesScripts(ordreScripts.map((k) => calculs[k].script)) +
        '<br><br>' +
        addMultiMathfield(this, i, { dataTemplate, dataOptions })

      const reponses: Record<string, { value: string }> = {}
      calculs.forEach((_, indiceCalcul) => {
        reponses[`field${indiceCalcul}`] = {
          value: String(numeroDuScript[indiceCalcul]),
        }
      })
      handleAnswers(this, i, reponses, { formatInteractif: 'multi-mathfield' })

      this.listeCorrections[i] = calculs
        .map(
          ({ tex, explication }, indiceCalcul) =>
            `Pour $${tex}$, ${explication} : c'est le script N° $${miseEnEvidence(numeroDuScript[indiceCalcul])}$.`,
        )
        .join('<br>')

      i++
    }
    listeQuestionsToContenu(this)
  }
}
