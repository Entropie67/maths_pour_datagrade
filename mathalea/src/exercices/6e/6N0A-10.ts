import { bleuMathalea } from '../../lib/colors'
import DragAndDrop, { type Etiquette } from '../../lib/interactif/DragAndDrop'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  enleveDoublonNum,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi, range1 } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Ranger des nombres entiers'
export const dateDeModifImportante = '13/05/2025'
export const interactifReady = true

/**
 * * Ranger une liste de nombres dans l'ordre croissant ou décroissant
 * @author Éric Elter
 */

export const uuid = '3bba9'

export const refs = {
  'fr-fr': ['6N0A-10', 'CM1N1I', 'CM2N1F'],
  'fr-2016': ['6N11-4'],
  'fr-ch': ['NR'], // Primaire anciennement :['9NO2-4'],
}
// une fonction pour gérer l'ordre
function myOrdre(ordre: 'croissant' | 'décroissant', tab: number[]) {
  tab.sort((a, b) => a - b)
  switch (ordre) {
    case 'croissant':
      return tab
    case 'décroissant':
      return tab.reverse()
  }
}

// Fonctions from EE
function generateNumbers(
  niveaux: number[] = [1, 2, 3],
  proximite: boolean = true,
): number[] {
  let numbers: number[] = []
  do {
    numbers = []
    // Chiffres pour la partie entière
    const c1 = randint(1, 9)
    const c2 = randint(1, 9, [c1])
    const baseEntier = Number(`${c1}${c2}`)
    const alternateEntier = Number(`${c2}${c1}`)

    // Chiffres pour la partie décimale
    const c3 = randint(1, 9, [c1, c2])
    const c4 = randint(1, 9, [c1, c2, c3])
    const c5 = randint(1, 9, [c1, c2, c3, c4])

    // Création des decimales décimaux selon les niveaux
    const decimales: number[][] = []
    if (niveaux.includes(1)) decimales.push([c3]) // dixième
    if (niveaux.includes(2)) decimales.push([c3, c4]) // centième
    if (niveaux.includes(3)) {
      decimales.push([c3, c4, c5]) // millième
      decimales.push([c3, (c4 + 1) % 10, c5])
      decimales.push([c3, 0, (c5 + 1) % 10])
      decimales.push([0, 0, c5])
    }
    if (decimales.length !== 6) {
      // Cas où on n'a pas choisi les trois ensemble : dixième, centième et millième
      const decimaleAAjouter = shuffle(range1(9))
      if (niveaux.length === 1) {
        // Cas où on a choisi qu'en seul des trois parmi : dixième, centième et millième
        if (niveaux[0] === 1) {
          // Que des dixièmes
          let d3: number
          for (let indiceTableau = 1; indiceTableau < 6; indiceTableau++) {
            d3 = (c3 + decimaleAAjouter[indiceTableau]) % 10
            decimales.push([d3])
          }
        } else if (niveaux[0] === 2) {
          // Que des centièmes
          decimales.push([c4, c3])
          decimales.push([0, c3])
          decimales.push([c4, 0])
          decimales.push([randint(1, 9, [c3]), c4])
          decimales.push([randint(1, 9, [c4, 0]), c3])
        } else {
          // Que des millièmes
          decimales.push([c3, c4, (c5 + 1) % 10])
          decimales.push([(c3 + 1) % 10, c4, c5])
        }
      } else {
        // Cas où on a choisi que deux parmi : dixième, centième et millième
        if (!niveaux.includes(3)) {
          // Pas de millième
          decimales.push([c4])
          decimales.push([c4, c3])
          decimales.push([0, c4])
          decimales.push([0, c3])
        } else if (!niveaux.includes(2)) {
          // Pas de centième
          decimales.push([c4])
          decimales.push([(c3 + 1) % 10, c4, c5])
        } else {
          // Pas de dixième
          decimales.push([c4, c3])
          decimales.push([(c3 + 1) % 10, c4, c5])
        }
      }
    }

    // Cette branche n'est utilisée que par les exercices enfants qui
    // demandent un mélange d'entiers et de nombres décimaux.
    if (niveaux.includes(0) || niveaux.length !== new Set(niveaux).size) {
      decimales.length = 0
      const precisions = shuffle(niveaux)
      for (let indiceTableau = 0; indiceTableau < 6; indiceTableau++) {
        const precision = precisions[indiceTableau % precisions.length]
        const decimale: number[] = []
        for (let rang = 0; rang < precision; rang++) {
          decimale.push(randint(rang === precision - 1 ? 1 : 0, 9))
        }
        decimales.push(decimale)
      }
    }

    // Mélange des decimales
    const melangeDecimales = shuffle(decimales)

    for (let indiceTableau = 0; indiceTableau < 6; indiceTableau++) {
      const decimal = melangeDecimales[indiceTableau]
      const entier =
        decimal.length === 0
          ? baseEntier + indiceTableau
          : proximite
            ? baseEntier
            : numbers.length % 2 === 0
              ? baseEntier
              : alternateEntier

      // On construit le nombre
      const value = Number(`${entier}.${decimal.join('')}`)
      numbers.push(value)
    }
    numbers = enleveDoublonNum(numbers)
  } while (numbers.length !== 6)
  return numbers
}

// Fonction pour obtenir une fraction décimale avec dénominateur 1000 (ou 10^n)
function getDecimalFraction(
  n: number,
  digits: number,
): { num: number; den: number } {
  const str = n.toString()
  const decimalPart = str.includes('.') ? str.split('.')[1] : ''
  const numerator = Number(decimalPart.padEnd(digits, '0')) // Normalise sur 3 chiffres
  const denominator = 10 ** digits
  return { num: numerator, den: denominator }
}

// Fonction pour mettre en couleur la partie entière de nombres
function formatterPartieEntiere(nombres: number[]): string {
  const uniques = [...new Set(nombres.map((n) => Math.floor(n)))]
  const len = uniques.length

  if (len === 0) return ''
  if (len === 1) return `$${miseEnEvidence(uniques[0], bleuMathalea)}$`
  if (len === 2)
    return `$${miseEnEvidence(uniques[0], bleuMathalea)}$ et $${miseEnEvidence(uniques[1], bleuMathalea)}$`

  const debut = uniques
    .slice(0, -1)
    .map((n) => `$${miseEnEvidence(n, bleuMathalea)}$`)
    .join(', ')

  const fin = `$${miseEnEvidence(uniques[len - 1], bleuMathalea)}$`

  return `${debut} et ${fin}`
}
// Retourner le nombre maximal de décimales parmi les nombres d'un tableau.
function getMaxDecimals(nombres: number[]): number {
  // Calculer le nombre de décimales pour chaque nombre
  const decimalCount = nombres.map((n) => {
    const decimalPart = arrondi(n - Math.floor(n), 3)
    // Si la partie décimale est 0, il n'y a pas de décimales
    return decimalPart === 0 ? 0 : decimalPart.toString().split('.')[1].length
  })

  // Retourner le nombre maximal de décimales
  return Math.max(...decimalCount)
}

export default class RangerOrdreCroissantDecroissant extends Exercice {
  protected typesDeNombres?: number[]

  constructor() {
    super()
    this.sup = 1
    this.sup2 = '4'
    this.sup3 = false
    this.sup4 = false
    this.nbQuestions = 2

    this.spacing = context.isHtml ? 3 : 1.5
    this.spacingCorr = context.isHtml ? 2.5 : 1.5

    this.besoinFormulaireNumerique = [
      'Type du rangement',
      3,
      '1 : Ordre croissant\n2 : Ordre décroissant\n3 : Mélange',
    ]
    this.correctionDetailleeDisponible = false
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    this.dragAndDrops = []
    let listeTypeDeQuestions = this.sup === 3 ? [1, 2] : [this.sup]
    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )

    const typesDeNombres = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: 99,
      saisie: this.sup2,
    })

    let typesDeNombresEntiers =
      this.typesDeNombres ??
      typesDeNombres.map((value) => parseInt(value.toString(), 10))
    if (this.typesDeNombres === undefined) {
      typesDeNombresEntiers = enleveDoublonNum(typesDeNombresEntiers)
    }

    for (let i = 0, texte, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // les chiffres
      const croissant = listeTypeDeQuestions[i] === 1
      const ordre = croissant ? 'croissant' : 'décroissant'
      const symbole = croissant ? '~<~' : '~>~'

      let nombres
      if (this.sup3) {
        nombres = generateNumbers(typesDeNombresEntiers, this.sup4)
      } else {
        // EE : Cette partie sur les entiers date d'un ancien exo et j'ai choisi de laisser ainsi.
        const c1 = randint(1, 9)
        const c2 = randint(1, 9, [c1])
        const c3 = randint(1, 9, [c1, c2])
        const c4 = randint(1, 9, [c1, c2, c3])
        const c5 = randint(1, 9, [c1, c2, c3, c4])
        const n1 = Number([c1, c2, c3, c4, c5].map(String).join(''))
        const n2 = Number([c1, c3, c3, c4, c5].map(String).join(''))
        const n3 = Number([c1, c2, c5, c4, c3].map(String).join(''))
        const n4 = Number(
          [c1, randint(0, 9), randint(0, 9), randint(0, 9)]
            .map(String)
            .join(''),
        )
        const n5 = Number(
          [
            1,
            randint(0, 9),
            randint(0, 9),
            randint(0, 9),
            randint(0, 9),
            randint(0, 9),
          ]
            .map(String)
            .join(''),
        )
        const n6 = Number(
          [c1, c2, 0, randint(0, 9), randint(0, 9)].map(String).join(''),
        )
        nombres = shuffle([n1, n2, n3, n4, n5, n6])
      }
      const nombresRanges = myOrdre(ordre, nombres.slice())

      // Le glisser-déposer identifie chaque étiquette par un id : deux nombres égaux rendraient la réponse ambiguë.
      if (new Set(nombres).size !== nombres.length) {
        cpt++
        continue
      }
      const nombresTex = nombres.map((nb) =>
        texNombre(
          nb,
          Math.max(...typesDeNombresEntiers),
          typesDeNombresEntiers.length === 1,
        ),
      )
      const avecGlisserDeposer =
        this.interactif && context.isHtml && !context.isTypst
      texte = `Classer les nombres suivants dans l'ordre ${ordre} :<br>`
      if (avecGlisserDeposer) {
        const etiquettes: Etiquette[] = nombresTex.map((nb, k) => ({
          id: String(k + 1),
          contenu: `$${nb}$`,
        }))
        const dnd = new DragAndDrop({
          exercice: this,
          question: i,
          consigne: '',
          etiquettes: [etiquettes],
          enonceATrous: range1(6)
            .map((k) => `%{rectangle${k}}`)
            .join(`$${symbole}$`),
          nomsZones: range1(6).map(
            (k) => `Position ${k} sur 6 dans l'ordre ${ordre}`,
          ),
        })
        this.dragAndDrops[i] = dnd
        texte += dnd.ajouteDragAndDrop({ melange: false, duplicable: false })
      } else {
        texte += `$${nombresTex.join('\\text{  ; \\ \\  }')}$.<br>`
        texte += remplisLesBlancs(
          this,
          i,
          `%{champ1}${symbole}%{champ2}${symbole}%{champ3}${symbole}%{champ4}${symbole}%{champ5}${symbole}%{champ6}`,
          ` ${KeyboardType.clavierNumbers}`,
          '\\ldots\\ldots',
        )
      }

      let texteCorr = ''
      if (this.correctionDetaillee && this.sup3) {
        texteCorr +=
          'Pour ranger les nombres dans l’ordre croissant, on procède en deux temps.<br>'

        // Étape 1 : Classement des parties entières
        texteCorr +=
          texteEnCouleurEtGras('Comparons les parties entières', bleuMathalea) +
          ' :<br>'
        if ([...new Set(nombres.map((n) => Math.floor(n)))].length === 1) {
          // Recherche des parties entières des nombres à classer
          texteCorr += `Les nombres à classer ont tous la même partie entière : ${formatterPartieEntiere(nombres)}.<br>`
        } else {
          texteCorr += `Les parties entières des nombres à classer sont : ${formatterPartieEntiere(nombres)}.<br>`
          texteCorr += `On classe d’abord ces parties entières selon leur ordre ${ordre} : `
          const partiesEntieres = [
            ...new Set(nombres.map((n) => Math.floor(n))),
          ].sort((a, b) => (ordre === 'croissant' ? a - b : b - a))
          texteCorr += `$${partiesEntieres.map((nb) => `${miseEnEvidence(texNombre(nb, 3), bleuMathalea)}`).join(symbole)}$.<br>`
        }
        // Étape 2 : Comparaison des décimales
        texteCorr +=
          texteEnCouleurEtGras(
            'Comparons les parties décimales lorsque les parties entières sont identiques',
            bleuMathalea,
          ) + ' :<br>'
        const nbDeDecimales = getMaxDecimals(nombres)
        const numerateurCommun = Math.pow(10, nbDeDecimales)
        texteCorr += `On compare alors les parties décimales sous forme de fractions décimales avec le même dénominateur commun (ici $${texNombre(numerateurCommun)}$).<br>`

        const groupesParEntier: { [k: number]: number[] } = {}
        for (const n of nombres) {
          const entier = Math.floor(n)
          if (!groupesParEntier[entier]) groupesParEntier[entier] = []
          groupesParEntier[entier].push(n)
        }
        let numeroGroupe = -1
        for (const entier of Object.keys(groupesParEntier)
          .map(Number)
          .sort((a, b) => a - b)) {
          const groupe = groupesParEntier[entier]
          if (groupe.length > 1) {
            numeroGroupe++
            if (!this.sup4)
              texteCorr +=
                numAlpha(numeroGroupe) +
                ` Parmi les nombres ayant pour partie entière $${miseEnEvidence(entier, bleuMathalea)}$, on va comparer les parties décimales :<br>`
            const numerateurs = []
            for (const n of groupe) {
              const frac = getDecimalFraction(n, nbDeDecimales)
              numerateurs.push(frac.num)
              texteCorr += `  • $${texNombre(n)}$ → partie décimale : $${new FractionEtendue(frac.num, frac.den).texFraction}$<br>`
            }
            const partiesDécimales = groupe.sort((a, b) =>
              ordre === 'croissant' ? a - b : b - a,
            )
            const numerateursClasses = numerateurs.sort((a, b) =>
              ordre === 'croissant' ? a - b : b - a,
            )
            texteCorr += `  → On classe les numérateurs de ces fractions décimales qui ont le même dénominateur commun ($${texNombre(numerateurCommun)}$) : `
            texteCorr += ` : $${numerateursClasses.map((nb) => `${miseEnEvidence(texNombre(nb, 3), bleuMathalea)}`).join(symbole)}$.<br>`

            texteCorr +=
              '  → On classe ensuite les nombres en comparant leurs fractions décimales respectives'
            texteCorr += this.sup4
              ? '.<br>'
              : ` : $${partiesDécimales.map((nb) => `${miseEnEvidence(texNombre(nb, 3), bleuMathalea)}`).join(symbole)}$.<br>`
          }
        }
      }
      texteCorr += `Les nombres sont maintenant rangés dans l'ordre ${ordre} : $${nombresRanges.map((nb) => `${miseEnEvidence(texNombre(nb, 3))}`).join(symbole)}$.`
      const bareme = (listePoints: number[]): [number, number] => [
        Math.ceil(
          (listePoints[0] * listePoints[1] +
            listePoints[2] +
            listePoints[3] +
            listePoints[4] +
            listePoints[5]) /
            2,
        ),
        3,
      ]
      if (avecGlisserDeposer) {
        handleAnswers(
          this,
          i,
          {
            bareme,
            ...Object.fromEntries(
              nombresRanges.map((nb, k) => [
                `rectangle${k + 1}`,
                { value: String(nombres.indexOf(nb) + 1) },
              ]),
            ),
          },
          { formatInteractif: 'dnd' },
        )
      } else {
        handleAnswers(this, i, {
          bareme,
          champ1: { value: nombresRanges[0] },
          champ2: { value: nombresRanges[1] },
          champ3: { value: nombresRanges[2] },
          champ4: { value: nombresRanges[3] },
          champ5: { value: nombresRanges[4] },
          champ6: { value: nombresRanges[5] },
        })
      }

      if (this.questionJamaisPosee(i, ...nombresRanges)) {
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
