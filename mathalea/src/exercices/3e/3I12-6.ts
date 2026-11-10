import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { listeDesDiviseurs, pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'

export const dateDeModifImportante = '07/11/2026'
export const interactifReady = true

export const dateDePublication = '25/02/2026'

export const titre = 'Comprendre un programme avec conditionnelle'
export const uuid = 'eacaf'

export const refs = {
  'fr-fr': ['3I12-6'],
  'fr-2016': [],
  'fr-ch': [],
}

const scratchSimulatorButtonAction = '3I12-6:scratch-simulator-button'

/**
 * @author Jean-claude Lhote
 * Cet exercice utilise le simulateur Scratch (ScratchSimulator) couplé à l'interpréteur Scratch (ScratchInterpreter) de la librairie maison.
 *  L'exercice génère aléatoirement les programmes et les résultats attendus.
 *  L'élève peut exécuter les programmes dans le simulateur pour vérifier leur fonctionnement.
 */

const trouver4NombresProportionnels = (): [number, number, number, number] => {
  const premiers = [2, 3, 5]
  const exposants = shuffle([0, 1, 2, 3])
  const produit = premiers.reduce((acc, p, i) => acc * p ** exposants[i], 1)
  const diviseurs = listeDesDiviseurs(produit)
  const a = choice(diviseurs.slice(1, Math.ceil(diviseurs.length / 2)))
  const b = choice(
    diviseurs.filter(
      (d) => d !== a && d !== 1 && d !== produit && d !== produit / a,
    ),
  )
  const c = produit / a
  const d = produit / b
  return [a, b, c, d]
}

const syracuseNumbers = rangeMinMax(2, 100)
  .map((n) => Object.assign({ n }, syracuse(n)))
  .filter((obj) => obj.stepCounter <= 10)
const choixSyracuse: Record<number, { n: number; listeNombres: number[] }[]> =
  {}
for (let i = 0; i < syracuseNumbers.length; i++) {
  const { n, stepCounter, listeNombres } = syracuseNumbers[i]
  if (!choixSyracuse[stepCounter]) {
    choixSyracuse[stepCounter] = []
  }
  choixSyracuse[stepCounter].push({ n, listeNombres })
}

export default class TrouverLeBonProgrammeConditionnelles extends Exercice {
  constructor() {
    super()
    registerScratchSimulatorButton()
    this.spacingCorr = 2.5
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Types de questions',
      "Nombres séparés par des tirets\n1 : Réciproque du théorème de Pythagore\n2 : Nombre de boucles dans la conjecture de Syracuse\n3 : Extraction de racine carrée par dichotomie\n4 : Trouver la 4e proportionnelle\n5 : Réciproque du théorème de Thalès\n6 : Résolution d'équation du type $ax + b = cx + d$\n7 : Résolution d'équation produit nul\n0 : Mélange",
    ]
    this.sup = '1'
  }

  nouvelleVersion(): void {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 0,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let q = 0, cpt = 0; q < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let reponse = ''
      switch (listeTypeDeQuestions[q]) {
        case 1:
          {
            const triplet = choice([
              [5, 12, 13],
              [6, 8, 10],
              [8, 15, 17],
              [9, 12, 15],
              [12, 16, 20],
              [15, 20, 25],
            ])
            const swap = choice([true, false])
            if (swap) {
              const temp = triplet[0]
              triplet[0] = triplet[1]
              triplet[1] = temp
            }
            texte =
              `On veut que le lutin dise que le triangle est rectangle en $B$. Quelle valeur doit-on saisir pour la longueur $AB$ ? ` +
              ajouteQuestionMathlive({
                exercice: this,
                question: q,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: triplet[0] } },
                typeInteractivite: 'mathlive',
              }) +
              '<br>'
            const codeScratch = programmeReciproquePythagore(triplet)
            reponse = String(triplet[0])
            if (context.isHtml) {
              texte += scratchblock(codeScratch)
            } else {
              texte += codeScratch
                .replaceAll('AB', '$AB$')
                .replaceAll('BC', '$BC$')
                .replaceAll('CA', '$CA$')
                .replaceAll('$AB$²', '$AB^2$')
                .replaceAll('$BC$²', '$BC^2$')
                .replaceAll('$CA$²', '$CA^2$')
            }

            this.listeCorrections[q] = `${
              context.isHtml
                ? createScratchSimulatorButton(codeScratch, 500) + '<br>'
                : ''
            }
              Pour que le programme dise que le triangle est rectangle en $B$, il faut saisir la valeur $${miseEnEvidence(triplet[0])}$ pour la longueur $AB$.<br>
                En effet, le programme vérifie si $AB^2 + BC^2 = CA^2$.<br>
                Or $${triplet[0]}^2 + ${triplet[1]}^2 = ${triplet[0] ** 2 + triplet[1] ** 2}$ et $${triplet[2]}^2 = ${triplet[2] ** 2}$.<br>
                $AB^2 + BC^2 \\neq CA^2$ donc, d'après la contraposée du théorème de Pythagore, le triangle n'est pas rectangle en $B$.`
          }
          break
        case 2:
          {
            const liste = choice(Object.entries(choixSyracuse))
            const nbBoucles = Number(liste[0])

            const nombreDeDepart = choice(liste[1])

            texte =
              `Quelle sera la valeur de la variable compteur dans le programme Scratch qui commence avec le nombre $${nombreDeDepart.n}$ ?` +
              ajouteQuestionMathlive({
                exercice: this,
                question: q,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: nbBoucles } },
                typeInteractivite: 'mathlive',
              }) +
              '<br>'
            reponse = String(nbBoucles)
            const codeScratch = programmeSiracuse(nombreDeDepart.n)
            if (context.isHtml) {
              texte += scratchblock(codeScratch)
            } else {
              texte += codeScratch
            }
            const suiteSyracuse = nombreDeDepart.listeNombres
            this.listeCorrections[q] = `${
              context.isHtml
                ? createScratchSimulatorButton(codeScratch, 1000) + '<br>'
                : ''
            }
              La variable compteur finira avec la valeur $${miseEnEvidence(nbBoucles)}$, car le programme va afficher successivement les nombres :<br>
              ${suiteSyracuse
                .map((n, i) => {
                  if (i === suiteSyracuse.length - 1) {
                    return `$${n}$.`
                  } else {
                    return `$${n} \\rarr ${n % 2 === 0 ? `${n}\\div 2 = ${n / 2}$` : `3 \\times ${n} + 1 = ${3 * n + 1}$`}`
                  }
                })
                .join('<br>')}`
          }
          break
        case 3:
          {
            const A = choice(rangeMinMax(2, 99), [4, 9, 16, 25, 36, 49, 64, 81])
            const precision = choice([1, 0.1, 0.01, 0.001])
            const nbRepetitions =
              precision === 1
                ? 4
                : precision === 0.1
                  ? 5
                  : precision === 0.01
                    ? 6
                    : 7
            texte =
              `On veut encadrer $\\sqrt{${A}}$ par deux nombres $b$ et $c$ tels que $c-b < ${texNombre(precision, 3)}$. Quel nombre de répétitions doit exécuter le programme ? ` +
              ajouteQuestionMathlive({
                exercice: this,
                question: q,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: nbRepetitions } },
                typeInteractivite: 'mathlive',
              }) +
              '<br>'
            reponse = String(nbRepetitions)
            const codeScratch = programmeDichotomie(A, precision)
            if (context.isHtml) {
              texte += scratchblock(codeScratch)
            } else {
              texte += codeScratch.replaceAll('r²', '$r^2$')
            }

            this.listeCorrections[q] = `${
              context.isHtml
                ? createScratchSimulatorButton(codeScratch, 500) + '<br>'
                : ''
            }
              Pour que le programme s'arrête lorsque $c-b < ${texNombre(precision, 3)}$, il faut que le programme exécute ${miseEnEvidence(nbRepetitions)} répétitions. En effet, à chaque répétition, l'intervalle $[b,c]$ est divisé par $2$, donc après $${nbRepetitions}$ répétitions, on a $c-b = \\dfrac{10}{2^{${nbRepetitions}}}=${texNombre(10 / 2 ** nbRepetitions, 5)}$.`
          }
          break
        case 4:
          {
            const [a, b, c, d] = trouver4NombresProportionnels()
            const produit = a * c
            texte =
              `On considère les nombres $a=${a}$, $b=${b}$ et $c=${c}$. Quel nombre doit-on saisir pour $x$ afin que le programme Scratch dise que les nombres sont proportionnels ?` +
              ajouteQuestionMathlive({
                exercice: this,
                question: q,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: d } },
                typeInteractivite: 'mathlive',
              }) +
              '<br>'
            reponse = String(d)
            const codeScratch = programme4eProportionnelle(a, b, c)
            if (context.isHtml) {
              texte += scratchblock(codeScratch)
            } else {
              texte += codeScratch
            }

            this.listeCorrections[q] = `${
              context.isHtml
                ? createScratchSimulatorButton(codeScratch, 500) + '<br>'
                : ''
            }
              Pour que le programme dise que les nombres sont proportionnels, il faut saisir la valeur $${miseEnEvidence(d)}$ pour $x$.<br>
              En effet, le programme vérifie l'égalité des produits en croix c'est à dire si $a \\times c = b \\times x$. Or $a \\times c = ${a} \\times ${c} = ${produit}$ et $b \\times d = ${b} \\times ${d} = ${produit}$.`
          }
          break
        case 5:
          {
            let [AD, AB, AC, AE] = trouver4NombresProportionnels()
            if (AD > AB) {
              const temp = AD
              const temp2 = AE
              AE = AC
              AC = temp2
              AD = AB
              AB = temp
            }
            texte =
              `On considère un triangle $ABC$, un point $D$ sur le segment $[AB]$ et un point $E$ sur le segment $[AC]$.<br>
        Quelle valeur doit-on saisir pour la longueur $AE$ afin que le programme Scratch dise que les droites $(BC)$ et $(DE)$ sont parallèles ?` +
              ajouteQuestionMathlive({
                exercice: this,
                question: q,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: AE } },
                typeInteractivite: 'mathlive',
              }) +
              '<br>'
            reponse = String(AE)
            const codeScratch = programmeReciproqueThales(AB, AC, AD)
            if (context.isHtml) {
              texte += scratchblock(codeScratch)
            } else {
              texte += codeScratch
                .replaceAll('AB', '$AB$')
                .replaceAll('AC', '$AC$')
                .replaceAll('AD', '$AD$')
                .replaceAll('AE', '$AE$')
            }
            this.listeCorrections[q] = `${
              context.isHtml
                ? createScratchSimulatorButton(codeScratch, 500) + '<br>'
                : ''
            }
            Pour que le programme dise que les droites $(BC)$ et $(DE)$ sont parallèles, il faut saisir la valeur $${miseEnEvidence(AE)}$ pour la longueur $AE$.<br>
            En effet, le programme vérifie si $\\dfrac{AB}{AD} = \\dfrac{AC}{AE}$.<br>
            Or $\\dfrac{AB}{AD} = \\dfrac{${AB}}{${AD}}${pgcd(AB, AD) !== 1 ? `=${fraction(AB, AD).texFractionSimplifiee}` : ''}$<br>
            et $\\dfrac{AC}{AE} = \\dfrac{${AC}}{${AE}}${pgcd(AC, AE) !== 1 ? `=${fraction(AC, AE).texFractionSimplifiee}` : ''}$.<br>
            $\\dfrac{AB}{AD} \\neq \\dfrac{AC}{AE}$ donc, d'après la contraposée du théorème de Thalès, les droites $(BC)$ et $(DE)$ ne sont pas parallèles.`
          }
          break
        case 6:
          {
            const c = randint(2, 7)
            const k = randint(2, 5)
            const a = c + k
            let b = randint(1, 5)
            const d = (randint(1, 10) + b) * k
            b *= k
            const codeScratch = programmeTestEquation(a, b, c, d)
            texte =
              `Quelle valeur doit-on saisir pour $x$ afin que le programme Scratch dise que l'équation est vérifiée ?` +
              ajouteQuestionMathlive({
                exercice: this,
                question: q,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: { value: String((d - b) / (a - c)) },
                },
                typeInteractivite: 'mathlive',
              }) +
              '<br>'
            reponse = String((d - b) / (a - c))
            if (context.isHtml) {
              texte += scratchblock(codeScratch)
            } else {
              texte += codeScratch
            }
            this.listeCorrections[q] = `${
              context.isHtml
                ? createScratchSimulatorButton(codeScratch, 500) + '<br>'
                : ''
            }
                Pour que le programme dise que l'équation est vérifiée, il faut saisir la valeur $${miseEnEvidence((d - b) / (a - c))}$ pour $x$.<br>
                En effet, le programme vérifie si $${a}x + ${b} = ${c}x + ${d}$.<br>
                En réarrangeant cette équation, on trouve que $${a - c}x = ${d} - ${b}$.
                Et donc $x = \\dfrac{${d - b}}{${a - c}} = ${(d - b) / (a - c)}$.`
          }
          break

        case 7:
          {
            const a = randint(2, 9)
            const b = randint(2, 9, [a])
            const codeScratch = programmeProduitNul(a, b)
            texte =
              `Quelle valeur peut-on saisir pour que le programme Scratch dise que le produit est nul ?` +
              ajouteQuestionMathlive({
                exercice: this,
                question: q,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: { value: [String(a), String(-b)] },
                },
                typeInteractivite: 'mathlive',
              }) +
              '<br>'
            reponse = String(-a).concat(' ou ', String(b))
            if (context.isHtml) {
              texte += scratchblock(codeScratch)
            } else {
              texte += codeScratch
            }
            this.listeCorrections[q] = `${
              context.isHtml
                ? createScratchSimulatorButton(codeScratch, 500) + '<br>'
                : ''
            }
              Pour que le programme dise que le produit est nul, il faut saisir la valeur $${miseEnEvidence(a)}$ ou $${miseEnEvidence(-b)}$.<br>
              En effet, le programme calcule le produit de $(nombre - ${a})$ et $(nombre + ${b})$.<br>
              Ce produit est nul si $nombre - ${a} = 0$ ou $nombre + ${b} = 0$, c'est à dire si $nombre = ${a}$ ou $nombre = ${-b}$.`
          }
          break
      }

      if (this.questionJamaisPosee(q, listeTypeDeQuestions[q], reponse)) {
        this.listeQuestions[q] = texte
        q++
      }
      cpt++
    }
  }
}

function createScratchSimulatorButton(codeScratch: string, delai: number) {
  return DomReadyActionElement.create({
    action: scratchSimulatorButtonAction,
    payload: {
      codeScratch,
      delai,
      insertProgramme: false,
    },
  })
}

let scratchSimulatorButtonRegistered = false

function registerScratchSimulatorButton() {
  if (scratchSimulatorButtonRegistered) return
  scratchSimulatorButtonRegistered = true
  DomReadyActionElement.registerCallback<{
    codeScratch: string
    delai: number
    insertProgramme: boolean
  }>(scratchSimulatorButtonAction, ({ element, payload }) => {
    element.innerHTML = ''
    element.classList.add('my-4', 'block')
    const button = document.createElement('button')
    const simulatorContainer = document.createElement('div')
    button.type = 'button'
    button.textContent = 'Lancer le simulateur'
    button.className =
      'inline-flex items-center px-4 py-2 bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas font-medium text-sm rounded shadow-md hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest focus:bg-coopmaths-action-lightest dark:focus:bg-coopmathsdark-action-lightest focus:outline-none transition duration-150 ease-in-out'

    const onClick = () => {
      simulatorContainer.innerHTML = createScratchSimulatorElement(
        payload.codeScratch,
        payload.delai,
        payload.insertProgramme,
      )
    }

    button.addEventListener('click', onClick)
    element.append(button, simulatorContainer)

    return () => {
      button.removeEventListener('click', onClick)
      element.innerHTML = ''
    }
  })
}

function programmeReciproquePythagore(triplet: number[]): string {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blocksensing{demander \\ovalnum{longueur AB} et attendre}
\\blockvariable{mettre \\selectmenu{AB} à \\ovalsensing{réponse}}
\\blockvariable{mettre \\selectmenu{BC} à \\ovalnum{${triplet[1]}}}
\\blockvariable{mettre \\selectmenu{CA} à \\ovalnum{${triplet[2]}}}
\\blockvariable{mettre \\selectmenu{AB²} à \\ovaloperator{\\ovalvariable{AB} * \\ovalvariable{AB}}}
\\blockvariable{mettre \\selectmenu{BC²} à \\ovaloperator{\\ovalvariable{BC} * \\ovalvariable{BC}}}
\\blockvariable{mettre \\selectmenu{CA²} à \\ovaloperator{\\ovalvariable{CA} * \\ovalvariable{CA}}}
\\blockifelse{si \\booloperator{\\ovaloperator{\\ovalvariable{AB²} + \\ovalvariable{BC²}} = \\ovalvariable{CA²}} alors}{
    \\blocklook{dire \\ovalnum{Le triangle est rectangle en B.}}
}{
    \\blocklook{dire \\ovalnum{Le triangle n'est pas rectangle en B.}}
}
\\end{scratch}`
  return codeScratch
}

function syracuse(n: number): { stepCounter: number; listeNombres: number[] } {
  let stepCounter = 1
  const listeNombres = [n]
  while (n !== 1 && stepCounter < 20) {
    n = syracuseStep(n)
    listeNombres.push(n)
    stepCounter++
  }
  return { stepCounter, listeNombres }
}
function syracuseStep(n: number): number {
  if (n % 2 === 0) {
    return n / 2
  } else {
    return 3 * n + 1
  }
}

function programmeSiracuse(n: number): string {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
    \\blockvariable{mettre \\selectmenu{n} à \\ovalnum{${n}}}
    \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnim{0}}
    \\blockrepeat{répéter \\ovalnum{20} fois}{
        \\blockvariable{ajouter \\ovalnum{1} à \\selectmenu{compteur}}
        \\blocklook{dire \\ovalvariable{n}}
        \\blockif{si \\booloperator{\\ovalmove{n} = \\ovalnum{1}} alors}{
          \\blocklook{dire \\ovaloperator{regrouper \\ovalnum{compteur est à } et \\ovaloperator{regrouper \\ovalvariable{compteur} et \\ovalnum{.} }}}
            \\blockcontrol{stop \\selectmenu{tout}}
        }
        \\blockifelse{si \\booloperator{\\ovalmove{n} modulo \\ovalnum{2} = 0} alors}{
            \\blockvariable{mettre \\selectmenu{n} à \\ovaloperator{\\ovalmove{n} / \\ovalnum{2}}}
        }
        {
            \\blockvariable{ajouter \\ovalnum{1} à \\selectmenu{n}}
        }
    }
         \\blocklook{dire \\ovaloperator{regrouper \\ovalnum{compteur est à } et \\ovaloperator{regrouper \\ovalvariable{compteur} et \\ovalnum{.} }}}
\\end{scratch}`
  return codeScratch
}

function programmeDichotomie(A: number, precision: number): string {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockvariable{mettre \\selectmenu{A} à \\ovalnum{${A}}}
  \\blockvariable{mettre \\ovalvariable{b} à \\ovalnum{0}}
  \\blockvariable{mettre \\ovalvariable{c} à \\ovalnum{10}}
  \\blocksensing{demander \\ovalnum{nombre de répétitions} et attendre}
  \\blockrepeat{répéter \\ovalsensing{réponse} fois}{
  \\blockvariable{mettre \\ovalvariable{r} à \\ovaloperator{\\ovaloperator{\\ovalvariable{b} + \\ovalvariable{c}} / \\ovalnum{2}}}
  \\blockvariable{mettre \\ovalvariable{r²} à \\ovaloperator{\\ovalvariable{r} * \\ovalvariable{r}}}
  \\blockifelse{si \\booloperator{\\ovalvariable{r²} < \\ovalvariable{A}} alors}{
    \\blockvariable{mettre \\ovalvariable{b} à \\ovalvariable{r}}
}{
    \\blockvariable{mettre \\ovalvariable{c} à \\ovalvariable{r}}
}
}
\\blocklook{dire \\ovaloperator{regrouper \\ovalnum{écart entre b et c : } et \\ovaloperator{regrouper \\ovaloperator{\\ovalvariable{c} - \\ovalvariable{b}} et \\ovalnum{.}}}}
\\end{scratch}`
  return codeScratch
}

function programme4eProportionnelle(a: number, b: number, c: number): string {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockvariable{mettre \\selectmenu{a} à \\ovalnum{${a}}}
  \\blockvariable{mettre \\selectmenu{b} à \\ovalnum{${b}}}
  \\blockvariable{mettre \\selectmenu{c} à \\ovalnum{${c}}}
  \\blocksensing{demander \\ovalnum{Nombre d ?} et attendre}
  \\blockvariable{mettre \\selectmenu{x} à \\ovalsensing{réponse}}
  \\blockvariable{mettre \\selectmenu{ac} à \\ovaloperator{\\ovalvariable{a} * \\ovalvariable{c}}}
  \\blockvariable{mettre \\selectmenu{bx} à \\ovaloperator{\\ovalvariable{b} * \\ovalvariable{x}}}
  \\blockifelse{si \\booloperator{\\ovalvariable{ac} = \\ovalvariable{bx}} alors}{
    \\blocklook{dire \\ovalnum{Proportionnel.}}
}{  
  \\blocklook{dire \\ovalnum{Non proportionnel.}}
}
\\end{scratch}`
  return codeScratch
}

function programmeReciproqueThales(AB: number, AC: number, AD: number): string {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x: \\ovalnum{-100} y: \\ovalnum{0}}
  \\blocklook{dire \\ovalnum{A, D et B sont alignés}}
  \\blocklook{dire \\ovalnum{A, E et C sont alignés dans le même ordre}}
  \\blockvariable{mettre \\selectmenu{AB} à \\ovalnum{${AB}}}
  \\blockvariable{mettre \\selectmenu{AC} à \\ovalnum{${AC}}}
  \\blockvariable{mettre \\selectmenu{AD} à \\ovalnum{${AD}}}
  \\blocksensing{demander \\ovalnum{longueur AE} et attendre}
  \\blockvariable{mettre \\selectmenu{AE} à \\ovalsensing{réponse}}
  \\blockifelse{si \\booloperator{\\ovaloperator{\\ovalvariable{AB} / \\ovalvariable{AD}} = \\ovaloperator{\\ovalvariable{AC} / \\ovalvariable{AE}}} alors}{
    \\blocklook{dire \\ovalnum{Les droites (BC) et (DE) sont parallèles.}}
}{
    \\blocklook{dire \\ovalnum{Les droites (BC) et (DE) ne sont pas parallèles.}}
}
\\end{scratch}`
  return codeScratch
}

function programmeTestEquation(
  a: number,
  b: number,
  c: number,
  d: number,
): string {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockevent{quand \\greenflag est cliqué}
  \\blocksensing{demander \\ovalnum{Nombre x ?} et attendre}
  \\blockvariable{mettre \\selectmenu{x} à \\ovalsensing{réponse}}
  \\blockvariable{mettre \\selectmenu{gauche} à \\ovaloperator{\\ovaloperator{\\ovalnum{${a}} * \\ovalvariable{x}} + \\ovalnum{${b}}}}
  \\blockvariable{mettre \\selectmenu{droite} à \\ovaloperator{\\ovaloperator{\\ovalnum{${c}} * \\ovalvariable{x}} + \\ovalnum{${d}}}}
  \\blockifelse{si \\booloperator{\\ovalvariable{gauche} = \\ovalvariable{droite}} alors}{
    \\blocklook{dire \\ovalnum{L'équation est vérifiée.}}
}{
    \\blocklook{dire \\ovalnum{L'équation n'est pas vérifiée.}}
}
\\end{scratch}`
  return codeScratch
}

function programmeProduitNul(a: number, b: number): string {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockevent{quand la touche \\selectmenu{espace} est pressée}
  \\blocksensing{demander \\ovalnum{Nombre ?} et attendre}
  \\blockvariable{mettre \\selectmenu{nombre de départ} à \\ovalsensing{réponse}}
  \\blockvariable{mettre \\selectmenu{nombre 1} à \\ovaloperator{\\ovalvariable{nombre de départ} - \\ovalnum{${a}}}}
  \\blockvariable{mettre \\selectmenu{nombre 2} à \\ovaloperator{\\ovalvariable{nombre de départ} + \\ovalnum{${b}}}}
  \\blockvariable{mettre \\selectmenu{produit} à \\ovaloperator{\\ovalvariable{nombre 1} * \\ovalvariable{nombre 2}}}
  \\blockifelse{si \\booloperator{\\ovalvariable{produit} = 0} alors}{
    \\blocklook{penser à \\ovalnum{Le produit est nul.}}
}{
    \\blocklook{penser à \\ovalnum{Le produit n'est pas nul.} pendant \\ovalnum{2} secondes}
}
\\end{scratch}`
  return codeScratch
}
