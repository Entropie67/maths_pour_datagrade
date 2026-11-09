import { fixeBordures } from '../../lib/2d/fixeBordures'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { Arbre } from '../../modules/arbres'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre =
  'Calculer des probabilités lors de deux tirages sans remise'
export const interactifReady = true
export const interactifType = 'mathLive'

export const dateDePublication = '25/09/2026'

/**
 * Tirage successif sans remise de deux boules dans une urne contenant $n$ boules
 * (ou un nombre donné de boules) d'une couleur et un nombre fixé de boules d'une autre couleur.
 * Objectif : ne pas oublier que le nombre total de boules diminue de 1 au second tirage.
 * @author Gilles Mora
 */
export const uuid = '27c0f'

export const refs = {
  'fr-fr': ['2P20-4'],
  'fr-ch': [],
}

type Couleur = { nom: string; lettre: string }

export default class ProbabilitesTirageSansRemise extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
    this.sup = '5'
    this.besoinFormulaireTexte = [
      'Types de questions sur les probabilités',
      [
        'Nombres séparés par des tirets :',
        '1 : Conditionnelle (même couleur)',
        '2 : Conditionnelle (couleurs différentes)',
        '3 : Intersection (même couleur)',
        '4 : Intersection (couleurs différentes)',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = '1'
    this.besoinFormulaire2Texte = [
      'Nombre de boules',
      [
        'Nombres séparés par des tirets :',
        '1 : Littéral ($n$ boules d’une couleur)',
        '2 : Nombres donnés',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    // Trois questions, sauf si une seule catégorie est choisie : elle ne contient
    // que deux questions différentes, et le barème doit correspondre aux questions posées
    const nbCategories = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: 0,
      shuffle: false,
      enleveDoublons: true,
    }).length
    this.nbQuestions = Math.min(3, 2 * nbCategories)
    const paires: [Couleur, Couleur][] = [
      [
        { nom: 'rouge', lettre: 'R' },
        { nom: 'noire', lettre: 'N' },
      ],
      [
        { nom: 'blanche', lettre: 'B' },
        { nom: 'noire', lettre: 'N' },
      ],
      [
        { nom: 'verte', lettre: 'V' },
        { nom: 'jaune', lettre: 'J' },
      ],
      [
        { nom: 'rouge', lettre: 'R' },
        { nom: 'bleue', lettre: 'B' },
      ],
    ]
    const [c1, c2] = choice(paires)
    const k = randint(2, 7)
    // Les tirages propres aux nombres donnés sont faits après les précédents
    // pour ne pas modifier les énoncés du cas littéral
    // L'urne est commune à toutes les questions : si plusieurs modes sont
    // choisis, le mode de la version est tiré au hasard
    const modes = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 1,
      nbQuestions: 0,
      shuffle: false,
      enleveDoublons: true,
    }).map(Number)
    const litteral = modes.length === 1 ? modes[0] === 1 : choice([true, false])
    const m = litteral ? 0 : randint(2, 9, [k])
    // Couleur 0 : n (ou m) boules ; couleur 1 : k boules
    const couleurs = [c1, c2]
    const total = litteral ? `n+${k}` : `${m + k}`
    const totalMoins1 = litteral ? `n+${k - 1}` : `${m + k - 1}`
    const effectif = [litteral ? 'n' : `${m}`, `${k}`]
    const effectifApres = (tiree: number, cherchee: number) =>
      tiree === cherchee
        ? cherchee === 0
          ? litteral
            ? 'n-1'
            : `${m - 1}`
          : `${k - 1}`
        : effectif[cherchee]
    // Produit de deux effectifs écrit sous forme réduite (cas littéral)
    const produit = (a: number, b: number) => {
      if (a === 0 && b === 0) return 'n(n-1)'
      if (a === 1 && b === 1) return `${k * (k - 1)}`
      return `${k}n`
    }
    // Fraction numérique et sa forme simplifiée (cas des nombres donnés)
    const fractionEtSimplifiee = (num: number, den: number) =>
      litteral
        ? { brute: '', simplifiee: '' }
        : {
            brute: `\\dfrac{${num}}{${den}}`,
            simplifiee: new FractionEtendue(num, den).texFractionSimplifiee,
          }
    const evt = (c: number, rang: number) => `${couleurs[c].lettre}_${rang}`
    const pluriel = (nom: string) => `${nom}s`

    // Arbre pondéré (probabilités affichées via alter)
    const branche = (nom: string, proba: string, enfants: Arbre[] = []) =>
      new Arbre({ nom, visible: false, alter: proba, enfants })
    const arbre = new Arbre({
      racine: true,
      nom: '',
      proba: 1,
      visible: false,
      alter: '',
      enfants: [0, 1].map((x) =>
        branche(
          evt(x, 1),
          `\\dfrac{${effectif[x]}}{${total}}`,
          [0, 1].map((y) =>
            branche(
              evt(y, 2),
              `\\dfrac{${effectifApres(x, y)}}{${totalMoins1}}`,
            ),
          ),
        ),
      ),
    })
    arbre.setTailles()
    const objetsArbre = arbre.represente(0, 9, 0, 3.5, true, 1, 2)
    // Placé dans la correction de la première question seulement, pour ne pas le répéter
    const texteArbre = `La situation peut être représentée par l'arbre pondéré suivant (le tirage se fait sans remise, donc au second tirage l'urne ne contient plus que $${totalMoins1}$ boules)${sp()}:<br>
    ${mathalea2d(Object.assign({ scale: 0.4, display: 'block' } as const, fixeBordures(objetsArbre)), objetsArbre)}`

    this.consigne = `Une urne opaque contient $${effectif[0]}$ boules ${pluriel(c1.nom)} et $${k}$ boules ${pluriel(c2.nom)}, indiscernables au toucher${litteral ? ', où $n$ est un entier naturel supérieur ou égal à $2$' : ''}.<br>
    On tire successivement et sans remise deux boules de l'urne.<br>
    On note${sp()}:`
    this.consigne += `<br>$\\bullet$ $${evt(0, 1)}$ l'événement «${sp()}la première boule tirée est ${c1.nom}${sp()}» et $${evt(1, 1)}$ l'événement «${sp()}la première boule tirée est ${c2.nom}${sp()}» ;`
    this.consigne += `<br>$\\bullet$ $${evt(0, 2)}$ l'événement «${sp()}la deuxième boule tirée est ${c1.nom}${sp()}» et $${evt(1, 2)}$ l'événement «${sp()}la deuxième boule tirée est ${c2.nom}${sp()}».`
    const probabilitesDemandees =
      this.nbQuestions === 1
        ? 'la probabilité suivante'
        : 'les probabilités suivantes'
    const verbe = litteral ? 'exprimer, en fonction de $n$, ' : 'calculer'
    this.consigne += `<br>${verbe.charAt(0).toUpperCase() + verbe.slice(1)} ${probabilitesDemandees}.`

    // Chaque catégorie du formulaire regroupe deux types de questions
    const sousTypes: Record<number, string[]> = {
      1: ['c00', 'c11'],
      2: ['c01', 'c10'],
      3: ['i00', 'i11'],
      4: ['i01', 'i10'],
    }
    // Une catégorie par question, réparties équitablement (selon les poids choisis)
    const categories = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    // Puis, dans chaque catégorie, les deux types de questions en alternance
    const reserves = new Map<number, string[]>()
    for (const c of new Set(categories)) {
      reserves.set(c, combinaisonListes(sousTypes[c], this.nbQuestions))
    }
    const listeTypes = categories.map((c) => reserves.get(c)!.shift()!)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = listeTypes[i]
      const x = Number(type[1]) // couleur de la première boule
      const y = Number(type[2]) // couleur de la deuxième boule
      const restant = effectifApres(x, y)
      const rappel = `Le tirage se fait sans remise${sp()}: une fois la première boule tirée, il ne reste plus que $${totalMoins1}$ boules dans l'urne, dont $${restant}$ boule${restant === '1' ? '' : 's'} ${couleurs[y].nom}${restant === '1' ? '' : 's'}.`
      const pCond = `\\dfrac{${restant}}{${totalMoins1}}`
      const cond = fractionEtSimplifiee(Number(restant), Number(totalMoins1))
      let calcul: string
      let reponse: string
      let texteCorr: string

      if (type[0] === 'c') {
        calcul = `P_{${evt(x, 1)}}(${evt(y, 2)})`
        reponse = litteral ? pCond : cond.simplifiee
        texteCorr = `$${calcul}$ est la probabilité que la deuxième boule tirée soit ${couleurs[y].nom} sachant que la première boule tirée est ${couleurs[x].nom}.<br>
        ${rappel}<br>
       Ainsi, $${calcul}=${litteral || cond.brute === reponse ? '' : `${cond.brute}=`}${miseEnEvidence(reponse)}$.`
      } else {
        calcul = `P(${evt(x, 1)}\\cap ${evt(y, 2)})`
        const inter = fractionEtSimplifiee(
          Number(effectif[x]) * Number(restant),
          Number(total) * Number(totalMoins1),
        )
        reponse = litteral
          ? `\\dfrac{${produit(x, y)}}{(${total})(${totalMoins1})}`
          : inter.simplifiee
        texteCorr = `$${calcul}=P(${evt(x, 1)})\\times P_{${evt(x, 1)}}(${evt(y, 2)})$.<br>
        Au premier tirage, l'urne contient $${total}$ boules, dont $${effectif[x]}$ boules ${pluriel(couleurs[x].nom)}, donc $P(${evt(x, 1)})=\\dfrac{${effectif[x]}}{${total}}$.<br>
        ${rappel} <br>
        Donc $P_{${evt(x, 1)}}(${evt(y, 2)})=${pCond}$.<br>
        Par conséquent, $${calcul}=\\dfrac{${effectif[x]}}{${total}}\\times ${pCond}=${litteral || inter.brute === reponse ? '' : `${inter.brute}=`}${miseEnEvidence(reponse)}$.`
      }

      let texte = `$${calcul}$`
      if (this.interactif) {
        texte += ` $=$ ${ajouteChampTexteMathLive(this, i, litteral ? `${KeyboardType.clavierDeBaseAvecFraction} ${KeyboardType.variableN}` : KeyboardType.clavierDeBaseAvecFraction)}`
        handleAnswers(this, i, {
          reponse: litteral
            ? {
                value: reponse,
                options: { fonction: true, variable: 'n', domaine: [2, 100] },
              }
            : { value: reponse },
        })
      }

      if (this.questionJamaisPosee(i, type, k)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] =
          i === 0 ? `${texteArbre}<br>${texteCorr}` : texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
