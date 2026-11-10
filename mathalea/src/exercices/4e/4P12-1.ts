import { bleuMathalea } from '../../lib/colors'
import type { MathfieldElement } from 'mathlive'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import {
  numAlpha,
  premiereLettreEnMajuscule,
  queDevant,
  sp,
} from '../../lib/outils/outilString'
import { personne, personnes } from '../../lib/outils/Personne'
import { ppcm } from '../../lib/outils/primalite'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import type { IExercice } from '../../lib/types'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des problèmes de ratio'
export const interactifReady = true

export const dateDeModifImportante = '22/05/2025'

export const uuid = '0a637'

export const refs = {
  'fr-fr': ['4P12-1'],
  'fr-ch': ['10CTFA1B-2', '10LCFA1B-2', '10LSFA1B-2', 'PRQPF03B-6'],
}

/**
 * @description Problèmes de ratio
 * @author Jean-claude Lhote
 */
export default class ProblemeDeRatio extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de ratios',
      3,
      ' 1 : x:y\n 2 : x:y:z\n 3 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Type de problèmes',
      'Nombres séparés par des tirets :\n1 : Partage\n2 : Coktails\n3 : dilution\n4 Recette\n5 : Écrans\n6 : Mélange',
    ]

    this.nbQuestions = 4 // Ici le nombre de questions
    this.sup = 3
    this.sup2 = '6'
    this.spacing = 2
    this.spacingCorr = 3
  }

  nouvelleVersion() {
    let prenoms = []
    const objets = ['billes', 'livres', 'perles', 'gâteaux', 'bonbons']
    const sirops = [
      'de fraise',
      'de citron',
      'de cerise',
      'de menthe',
      "d'orange",
    ]
    const jusdefruit = [
      "d'ananas",
      'de banane',
      'de pamplemousse',
      "d'abricot",
      'de raisin',
    ]
    const produits = [
      "produit d'entretien",
      'décapant biologique',
      'colorant',
      'shampoing automobile',
      'fertilisant liquide',
    ]
    let article
    let p1
    let quidam
    let index
    let index2
    const ratiosables = [
      [10, 6, 5],
      [7, 4, 4],
      [13, 7, 10],
    ]
    const ratiovinaigrette = [
      [2, 3],
      [3, 5],
      [4, 7],
    ]
    const ratioecran = [
      [16, 9],
      [4, 3],
      [21, 9],
      [16, 10],
    ]
    const resolutions = [
      [800, 600],
      [1024, 768],
      [1280, 720],
      [1280, 1024],
      [1366, 768],
      [1600, 900],
      [1680, 1050],
      [1920, 1080],
    ]
    const typeDeProblèmes = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 1,
      listeOfCase: ['partage', 'mélange', 'dilution', 'recette', 'ecran'],
    }).map(String)
    for (
      let i = 0,
        texte,
        texteCorr,
        x: number,
        y: number,
        z,
        total,
        a: number,
        b: number,
        c: number,
        n = 2,
        k,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      index = randint(0, 10)
      index2 = randint(0, 10)
      texte = '' // Nous utilisons souvent cette variable pour construire le texte de la question.
      texteCorr = '' // Idem pour le texte de la correction.
      switch (this.sup) {
        case 1:
          x = randint(1, 5)
          y = randint(1, 5, x)
          z = 0
          n = 2
          break
        case 2:
          x = randint(1, 5)
          y = randint(1, 5, x)
          z = randint(1, 7, [x, y])
          n = 3
          break
        case 3:
        default:
          x = randint(1, 5)
          y = randint(1, 5, x)
          if (choice([true, false])) {
            z = randint(1, 7, [x, y])
            n = 3
          } else {
            n = 2
            z = 0
          }
          break
      }
      k = randint(2, 6)
      total = (x + y + z) * k
      switch (
        typeDeProblèmes[i] // Chaque question peut être d'un type différent, ici 4 cas sont prévus...
      ) {
        case 'partage':
          prenoms = personnes(n)
          for (let j = 0; j < n - 1; j++) {
            if (j > 0) {
              texte += ', '
            }
            texte += `${prenoms[j].prenom}`
          }
          texte += ` et ${prenoms[n - 1].prenom} se partagent $${total}$ ${objets[index % 5]} dans le ratio $~${x}~:~${y}$`
          if (n === 3) {
            texte += `$~:~${z}$`
          }
          texte += `.<br>Combien de ${objets[index % 5]} chaque enfant reçoit-il ?<br>`
          if (n === 2) {
            texteCorr += `Si les enfants se partageaient $${x}+${y}=${x + y}$ ${objets[index % 5]} alors ${prenoms[0].prenom} en aurait $${x}$ et ${prenoms[1].prenom} en aurait $${y}$.`
            texteCorr += `<br>Mais il y a $${total}$ ${objets[index % 5]}, soit $${miseEnEvidence(k, bleuMathalea)}\\times ${x + y + z}$ ${objets[index % 5]}.<br>`
            texteCorr += `Donc ${prenoms[0].prenom} en aura $${miseEnEvidence(k, bleuMathalea)}\\times ${x}=${miseEnEvidence(k * x)}$ et ${prenoms[1].prenom} en aura $${miseEnEvidence(k, bleuMathalea)}\\times ${y}=${miseEnEvidence(k * y)}$.<br>`
            texteCorr += `Conclusion : ${prenoms[0].prenom} aura $${k * x}$ ${objets[index % 5]} et ${prenoms[1].prenom} en aura $${k * y}$.`
            if (this.interactif) {
              texte += ajouteQuestionMathlive({
                exercice: this,
                question: i,
                content: `\\text{${prenoms[0].prenom} : }%{champ1}\\text{ ; ${prenoms[1].prenom} : }%{champ2}`,
                objetReponse: {
                  champ1: { value: k * x },
                  champ2: { value: k * y },
                  bareme: toutAUnPoint,
                },
                typeInteractivite: 'fillInTheBlank',
                reponseParams: { formatInteractif: 'fill-in-the-blank' },
              })
            }
          } else {
            texteCorr += `Si les enfants se partageaient $${x}+${y}+${z}=${x + y + z}$ ${objets[index % 5]} alors ${prenoms[0].prenom} en aurait $${x}$, ${prenoms[1].prenom} en aurait $${y}$ et ${prenoms[2].prenom} en aurait $${z}$.`
            texteCorr += `<br>Mais il y a $${total}$ ${objets[index % 5]}, soit $${miseEnEvidence(k, bleuMathalea)}\\times ${x + y + z}$ ${objets[index % 5]}.<br>`
            texteCorr += `Donc ${prenoms[0].prenom} en aura $${miseEnEvidence(k, bleuMathalea)}\\times ${x}=${miseEnEvidence(k * x)}$, ${prenoms[1].prenom} en aura $${miseEnEvidence(k, bleuMathalea)}\\times ${y}=${miseEnEvidence(k * y)}$ et ${prenoms[2].prenom} en aura $${miseEnEvidence(k, bleuMathalea)}\\times ${z}=${miseEnEvidence(k * z)}$.<br>`
            texteCorr += `Conclusion : ${prenoms[0].prenom} aura $${k * x}$ ${objets[index % 5]}, ${prenoms[1].prenom} en aura $${k * y}$ et ${prenoms[2].prenom} en aura $${k * z}$.`
            if (this.interactif) {
              texte += ajouteQuestionMathlive({
                exercice: this,
                question: i,
                content: `\\text{${prenoms[0].prenom} : }%{champ1}\\text{ ; ${prenoms[1].prenom} : }%{champ2}\\text{ ; ${prenoms[2].prenom} : }%{champ3}`,
                objetReponse: {
                  champ1: { value: k * x },
                  champ2: { value: k * y },
                  champ3: { value: k * z },
                  bareme: toutAUnPoint,
                },
                typeInteractivite: 'fillInTheBlank',
                reponseParams: { formatInteractif: 'fill-in-the-blank' },
              })
            }
          }
          break
        case 'mélange':
          x = randint(1, 3)
          y = x + randint(5, 7)
          if (n === 3) {
            z = y + randint(1, 3)
          } else {
            z = 0
          }
          total = ppcm(x + y + z, 20)
          k = total / (x + y + z)
          quidam = personne({})
          article = quidam.pronom

          if (n === 2) {
            // On mélange du sirop et de l'eau
            texte += `${quidam.prenom} prépare un sirop à l'eau pour ses amis. ${premiereLettreEnMajuscule(article)} mélange du sirop ${sirops[index % 5]} et de l'eau dans le ratio $~${x}~:~${y}$.<br>`
            if (choice([true, false])) {
              texte += `${premiereLettreEnMajuscule(article)} désire préparer $${total}\\text{ cL} $ de boisson. Quelle quantité de sirop et d'eau doit-${article} mélanger ?`
              texteCorr += `Si ${quidam.prenom} mélange selon le ratio donné $${x}\\text{ cL} $ de sirop ${sirops[index % 5]} et $${y}\\text{ cL} $ d'eau ${article} obtiendra $${x + y}\\text{ cL} $ de mélange.<br>`
              texteCorr += `${premiereLettreEnMajuscule(article)} veut obtenir $${total}\\text{ cL} $ $=${miseEnEvidence(k, bleuMathalea)}\\times ${x + y}\\text{ cL} $.<br>`
              texteCorr += `Donc pour cela, ${article} doit mélanger $${miseEnEvidence(k, bleuMathalea)}\\times ${x}\\text{ cL} $$=${miseEnEvidence(k * x)}\\text{ cL} $ de sirop ${sirops[index % 5]} et $${miseEnEvidence(k, bleuMathalea)}\\times ${y}\\text{ cL} $$=${miseEnEvidence(k * y)}\\text{ cL} $ d'eau`
              if (this.interactif) {
                texte += ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  content:
                    '\\text{Sirop : }%{champ1}\\text{ cL}\\text{ ; eau : }%{champ2}\\text{ cL}',
                  objetReponse: {
                    champ1: { value: k * x },
                    champ2: { value: k * y },
                    bareme: toutAUnPoint,
                  },
                  typeInteractivite: 'fillInTheBlank',
                  reponseParams: { formatInteractif: 'fill-in-the-blank' },
                })
              }
            } else {
              texte += `${premiereLettreEnMajuscule(article)} verse $${k * x}\\text{ cL} $ de sirop ${sirops[index % 5]}. Quelle quantité d'eau doit-${article} ajouter et quelle quantité de boisson obtiendra-t-${article} ?<br>`
              texteCorr += `Pour cette boisson le sirop ${sirops[index % 5]} et l'eau sont dans un ratio de $${x}~:~${y}$<br>ce qui signifie que : `
              texteCorr += `$${texFractionFromString('\\text{Volume de sirop en cL}', x + '\\text{ cL}')}=${texFractionFromString("\\text{Volume d'eau en cL}", y + '\\text{ cL}')}$.<br>`
              texteCorr += `Avec la valeur numérique : $${texFractionFromString(String(k * x) + '\\text{ cL}', String(x) + '\\text{ cL}')}=${texFractionFromString("\\text{Volume d'eau en cL}", String(y) + '\\text{ cL}')}$.<br>`
              texteCorr += `${quidam.prenom} doit ajouter un volume d'eau de : $${texFractionFromString(y + '\\times' + k * x, x)}=${y * k}\\text{ cL}$.<br>
              Ainsi, ${quidam.pronom} obtiendra un volume de boisson de : $${k * x}\\text{ cL}+${k * y}\\text{ cL}=${miseEnEvidence(k * (x + y))}\\text{ cL}$.`
              if (this.interactif) {
                texte += ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  content:
                    '\\text{eau : }%{champ1}\\text{ cL}\\text{ ; boisson : }%{champ2}\\text{ cL}',
                  objetReponse: {
                    champ1: { value: k * y },
                    champ2: { value: k * y + k * x },
                    bareme: toutAUnPoint,
                  },
                  typeInteractivite: 'fillInTheBlank',
                  reponseParams: { formatInteractif: 'fill-in-the-blank' },
                })
              }
            }
          } else {
            // On mélange du sirop, du jus de fruit et de la limonade.
            texte += `${quidam.prenom} prépare un cocktail à base de sirop ${sirops[index % 5]}, de jus ${jusdefruit[index2 % 5]} et d'eau gazeuse pour ses amis. ${premiereLettreEnMajuscule(article)} mélange les trois ingrédients dans le ratio $~${x}~:~${y}~:~${z}$.<br>`
            if (choice([true, false])) {
              texte += `${premiereLettreEnMajuscule(article)} désire préparer $${total}\\text{ cL} $ de boisson. Quelle quantité de sirop, de jus et d'eau gazeuse doit-${article} mélanger ?<br>`
              texteCorr += `Si ${quidam.prenom} mélange selon le ratio donné $${x}\\text{ cL} $ de sirop ${sirops[index % 5]}, $${y}\\text{ cL} $ de jus ${jusdefruit[index2 % 5]} et $${z}\\text{ cL} $ d'eau gazeuse ${article} obtiendra $${x + y + z}\\text{ cL} $ de cocktail.<br>`
              texteCorr += `${premiereLettreEnMajuscule(article)} veut obtenir $${total}\\text{ cL} $ $=${miseEnEvidence(k, bleuMathalea)}\\times ${x + y + z}\\text{ cL} $ de cocktail.<br>`
              texteCorr += `Donc pour cela, ${article} doit mélanger $${miseEnEvidence(k, bleuMathalea)}\\times ${x}\\text{ cL} $$=${miseEnEvidence(k * x)}\\text{ cL} $ de sirop ${sirops[index % 5]}, $${miseEnEvidence(k, bleuMathalea)}\\times ${y}\\text{ cL} $$=${miseEnEvidence(k * y)}\\text{ cL} $ de jus ${jusdefruit[index2 % 5]} et $${miseEnEvidence(k, bleuMathalea)}\\times ${z}\\text{ cL} $$=${miseEnEvidence(k * z)}\\text{ cL} $ d'eau gazeuse.`
              if (this.interactif) {
                texte += ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  content: `\\text{ sirop ${sirops[index % 5]} : }%{champ1}\\text{ cL}\\text{ ; jus ${jusdefruit[index2 % 5]}: }%{champ2}\\text{ cL}\\text{ ; eau gazeuse : }%{champ3}\\text{ cL}`,
                  objetReponse: {
                    champ1: { value: String(k * x) },
                    champ2: { value: String(k * y) },
                    champ3: { value: String(k * z) },
                    bareme: toutAUnPoint,
                  },
                  typeInteractivite: 'fillInTheBlank',
                  reponseParams: { formatInteractif: 'fill-in-the-blank' },
                })
              }
            } else {
              texte += `${premiereLettreEnMajuscule(article)} verse $${k * x}\\text{ cL} $ de sirop ${sirops[index % 5]}. Quelle quantité de jus ${jusdefruit[index2 % 5]} et d'eau gazeuse doit-${article} ajouter et quelle quantité de cocktail obtiendra-t-${article} ?<br>`
              texteCorr += `Pour ce cocktail le sirop ${sirops[index % 5]}, le jus ${jusdefruit[index2 % 5]} et l'eau gazeuse sont dans un ratio de $${x}~:~${y}~:~${z}$<br>`
              texteCorr += `ce qui signifie que $${texFractionFromString('\\text{Volume de sirop en cL}', x + '\\text{ cL}')}=${texFractionFromString('\\text{Volume de jus de fruit en cL}', y + '\\text{ cL}')}=${texFractionFromString("\\text{Volume d'eau gazeuse en cL}", z + '\\text{ cL}')}$<br>`
              texteCorr += `Avec la valeur numérique : $${texFractionFromString(k * x + '\\text{ cL}', x + '\\text{ cL}')}=${texFractionFromString('\\text{Volume de jus de fruit en cL}', y + '\\text{ cL}')}=${texFractionFromString("\\text{Volume d'eau gazeuse en cL}", z + '\\text{ cL}')}$.<br>`
              texteCorr += `${quidam.prenom} en déduit que le volume de jus ${jusdefruit[index2 % 5]} est : $${texFractionFromString(k * x + '\\times' + y, x)}\\text{ cL}=${miseEnEvidence(y * k)}\\text{ cL}$.<br>`
              texteCorr += `Et le volume d'eau gazeuse est : $${texFractionFromString(k * x + '\\times' + z, x)}\\text{ cL}=${miseEnEvidence(z * k)}\\text{ cL}$.<br>`
              if (this.interactif) {
                texte += ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  content: `\\text{jus ${jusdefruit[index2 % 5]} : }%{champ1}\\text{ cL}\\text{ ; eau gazeuse : }%{champ2}\\text{ cL}\\text{ ; Volume total : }%{champ3}\\text{ cL}`,
                  objetReponse: {
                    champ1: { value: String(k * y) },
                    champ2: { value: String(k * z) },
                    champ3: { value: String(k * (x + y + z)) },
                    bareme: toutAUnPoint,
                  },
                  typeInteractivite: 'fillInTheBlank',
                  reponseParams: { formatInteractif: 'fill-in-the-blank' },
                })
              }
            }
          }
          break

        case 'dilution':
          x = randint(1, 3)
          y = randint(2 * x, 4 * x)
          a = x + y
          p1 = Math.round((x * 100) / a)
          if (n === 3) {
            // Deux ratios de dilution : x:y x:z
            z = randint(5 * x, 10 * x)
            b = x + z
            // p2 = p1
            p1 = Math.round((x * 100) / b)
          }
          k = randint(10, 20) * 10
          texte += `Un ${produits[index % 5]} est vendu sous forme concentrée avec l'indication suivante sur le bidon :<br>`
          if (n === 2) {
            texte += `Diluer avec de l'eau à $~${x}~:~${y}~$.<br>`
            if (choice([true, false])) {
              texte +=
                "À quel pourcentage de produit concentré dans le mélange final correspond ce ratio ? (arrondir à l'unité).<br>"
              texteCorr += `Une dilution selon le ratio $~${x}~:~${y}~$ signifie qu'on dilue $${x}$ unités de volume de ${produits[index % 5]} dans $${y}$ unités de volume d'eau.<br>`
              texteCorr += `Ce qui fait donc un total de $${x + y}$ unités de volume de produit dilué.<br>`
              texteCorr += `La proportion de ${produits[index % 5]} est donc : $${texFractionFromString(x + '\\text{ unités de volume}', x + y + '\\text{ unités de volume}')}\\approx ${texNombre(arrondi(x / (x + y)), 3)}$ soit environ $${miseEnEvidence(Math.round((100 * x) / (x + y)))}\\,\\%$.`
              if (this.interactif) {
                texte += ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  objetReponse: {
                    reponse: {
                      value: `[${p1 - 0.5};${p1 + 0.5}]`,
                      options: { estDansIntervalle: true },
                    },
                  },
                  texteApres: '%',
                  typeInteractivite: 'mathlive',
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                })
              }
            } else {
              total = k * (x + y)
              texte += `Si on veut préparer $${texNombre(total)}\\text{ cL} $ de produit dilué, quel volume d\`eau et de ${produits[index % 5]} faut-il mélanger ?<br>`
              texteCorr += `Selon le ratio donné, pour $${x}$ unités de volume de ${produits[index % 5]} il faut $${y}$ unités de volume d'eau soit au total un volume de $${x + y}$ unités de volume.<br>`
              texteCorr += `Or $${texNombre(total)}\\text{ cL} $ $=${miseEnEvidence(k, bleuMathalea)}\\times ${x + y}$ donc il faut $${miseEnEvidence(k, bleuMathalea)}\\times ${x}=${miseEnEvidence(k * x)}\\text{ cL} $ de ${produits[index % 5]} et $${miseEnEvidence(k, bleuMathalea)}\\times ${y}=${miseEnEvidence(texNombre(k * y))}\\text{ cL} $ d'eau.<br>`
              if (this.interactif) {
                texte += ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  content: `\\text{${produits[index % 5]} : }%{champ1}\\text{ cL}\\text{ ; eau : }%{champ2}\\text{ cL}`,
                  objetReponse: {
                    champ1: { value: k * x },
                    champ2: { value: k * y },
                    bareme: toutAUnPoint,
                  },
                  typeInteractivite: 'fillInTheBlank',
                  reponseParams: { formatInteractif: 'fill-in-the-blank' },
                })
              }
            }
          } else {
            texte += `Diluer avec de l'eau de $~${x}~:~${z}~$ à $~${x}~:~${y}~$.<br>`
            if (choice([true, false])) {
              texte +=
                "Donner les pourcentages minimum de produit concentré dans le mélange final (arrondi à l'unité).<br>"
              texteCorr += `Une dilution selon le ratio $~${x}~:~${y}~$ signifie qu'on dilue $${x}$ unités de volume de ${produits[index % 5]} dans $${y}$ unités de volume d'eau.<br>`
              texteCorr += `Ce qui fait donc un total de $${x}+${y}=${x + y}$ unités de volume de produit dilué.<br>`
              texteCorr += `La proportion de ${produits[index % 5]} est donc : $${texFractionFromString(x + '\\text{ unités de volume}', x + y + '\\text{ unités de volume}')}\\approx ${texNombre(arrondi(x / (x + y)), 4)}$ soit environ $${miseEnEvidence(Math.round((100 * x) / (x + y)))}\\,\\%$<br>`
              texteCorr += `De la même façon, selon le ratio $~${x}~:~${z}$, on obtient la proportion suivante :<br>`
              texteCorr += `$${texFractionFromString(x + '\\text{ unités de volume}', `(${x}+${z})\\text{ unités de volume}`)}=${texFractionFromString(x, x + z)}\\approx ${texNombre(arrondi(x / (x + z)), 4)}$ soit environ $${miseEnEvidence(Math.round((100 * x) / (x + z)))}\\,\\%$.<br>`
              texteCorr +=
                'Conclusion : les pourcentages et les ratios annoncés correspondent bien.'
              if (this.interactif) {
                texte += ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  content:
                    '\\text{pourcentage minimum : }%{champ1}\\%\\text{ ; pourcentage maximum : }%{champ2}\\%',
                  objetReponse: {
                    champ2: {
                      value: `[${Math.round((100 * x) / (x + y)) - 0.5};${Math.round((100 * x) / (x + y)) + 0.5}]`,
                      options: { estDansIntervalle: true },
                    },
                    champ1: {
                      value: `[${Math.round((100 * x) / (x + z)) - 0.5};${Math.round((100 * x) / (x + z)) + 0.5}]`,
                      options: { estDansIntervalle: true },
                    },
                    bareme: toutAUnPoint,
                  },
                  typeInteractivite: 'fillInTheBlank',
                  reponseParams: { formatInteractif: 'fill-in-the-blank' },
                })
              }
            } else {
              total = k * (x + y)
              texte += ` ${numAlpha(0)} Si on veut préparer $${total}\\text{ cL} $ de produit dilué selon le ratio $~${x}~:~${y}$, quel volume de ${produits[index % 5]} et d'eau faut-il mélanger ?<br>`
              texte += ` ${numAlpha(1)} Quel volume d'eau faut-il ajouter au mélange précédent pour obtenir un produit dilué selon le ratio $~${x}~:~${z}$ ?`
              texteCorr += ` ${numAlpha(0)} Selon le ratio donné, pour $${x}$ unités de volume de ${produits[index % 5]} il faut $${y}$ unités de volume d'eau soit au total un volume de $${x + y}$ unités de volume.<br>`
              texteCorr += `${sp(4)}Or $${total}\\text{ cL} $ $=${miseEnEvidence(k, bleuMathalea)}\\times ${x + y}$ donc il faut $${miseEnEvidence(k, bleuMathalea)}\\times ${x}=${miseEnEvidence(k * x)}\\text{ cL} $ de ${produits[index % 5]} et $${miseEnEvidence(k, bleuMathalea)}\\times ${y}=${miseEnEvidence(k * y)}\\text{ cL} $ d'eau.<br>`
              texteCorr += ` ${numAlpha(1)} Le ratio $~${x}~:~${z}~$ pour le ${produits[index % 5]} signifie que :<br>`
              texteCorr += `${sp(4)}$${texFractionFromString(k * x + '\\text{ cL}', x + '\\text{ cL}')}=${texFractionFromString("\\text{volume d'eau en cL}", z + '\\text{ cL}')}=${miseEnEvidence(k, bleuMathalea)}$.<br>`
              texteCorr += `${sp(4)}Donc il faut donc $${miseEnEvidence(k, bleuMathalea)}\\times ${z}\\text{ cL}=${miseEnEvidence(texNombre(k * z))}\\text{ cL}$ d'eau pour obtenir une dilution selon le ratio $~${x}~:~${z}$, et comme le mélange précédent contient déjà $${k * y}\\text{ cL} $ d'eau, il faut donc ajouter :<br>
              $${texNombre(k * z)}\\text{ cL} - ${k * y}\\text{ cL}=${k * z - k * y}\\text{ cL}$ d'eau.`
              if (this.interactif) {
                texte += ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  content: `\\text{${produits[index % 5]} mélange 1 : }%{champ1}\\text{ cL}\\text{ ; eau mélange 1 : }%{champ2}\\text{ cL}\\text{ ; eau mélange 2 : }%{champ3}\\text{ cL}`,
                  objetReponse: {
                    champ1: { value: String(k * x) },
                    champ2: { value: String(k * y) },
                    champ3: { value: String(k * z - k * y) },
                    bareme: toutAUnPoint,
                  },
                  typeInteractivite: 'fillInTheBlank',
                  reponseParams: { formatInteractif: 'fill-in-the-blank' },
                })
              }
            }
          }

          break

        case 'recette':
          quidam = personne({})
          if (n === 3) {
            article = quidam.pronom
            x = ratiosables[index % 3][0]
            y = ratiosables[index % 3][1]
            z = ratiosables[index % 3][2]
            k = choice([10, 15, 20, 25])
            total = (x + y + z) * k
            texte += `${quidam.prenom} veut faire des sablés bretons. Pour cela ${article} doit réaliser un mélange de farine, de sucre et de beurre selon le ratio $~${x}~:~${y}~:~${z}$.<br>`
            texte += `${numAlpha(0)} ${premiereLettreEnMajuscule(article)} dispose de $${k * z}\\text{ g}$ de beurre. Quelle masse de farine et de sucre doit-${article} utiliser si ${article} utilise tout le beurre disponible ?<br>`
            texte += `${numAlpha(1)} Quelle sera alors la masse totale du «${sp()}sable${sp()}» produit ?<br>`
            texteCorr += `${numAlpha(0)} La farine, le sucre et le beurre respecte le ratio $~${x}~:~${y}~:~${z}$, ce qui signifie :<br>`
            texteCorr += `$${texFractionFromString('\\text{masse de farine en gramme}', x + '\\text{ g}')}=${texFractionFromString('\\text{masse de sucre en gramme}', y + '\\text{ g}')}=${texFractionFromString(`${k * z}\\text{ g}`, `${z}\\text{ g}`)}=${miseEnEvidence(k, bleuMathalea)}$.<br>`
            texteCorr += `On en déduit ${queDevant(quidam.prenom)} devra utiliser $${miseEnEvidence(k, bleuMathalea)}\\times ${x}\\text{ g}=${miseEnEvidence(k * x)}\\text{ g}$ de farine et $${miseEnEvidence(k, bleuMathalea)}\\times ${y}\\text{ g}=${miseEnEvidence(k * y)}\\text{ g}$ de sucre.<br>`
            texteCorr += `${numAlpha(1)} La masse de «${sp()}sable${sp()}» sera donc : $${k * x}\\text{ g} + ${k * y}\\text{ g} +${k * z}\\text{ g} =${miseEnEvidence(total)}\\text{ g}$.`
            if (this.interactif) {
              texte += ajouteQuestionMathlive({
                exercice: this,
                question: i,
                content:
                  '\\text{masse de farine : }%{champ1}\\text{ g}\\text{ ; masse de sucre : }%{champ2}\\text{ g}\\text{ ; masse de sable : }%{champ3}\\text{ g}',
                objetReponse: {
                  champ1: { value: String(k * x) },
                  champ2: { value: String(k * y) },
                  champ3: { value: String(total) },
                  bareme: toutAUnPoint,
                },
                typeInteractivite: 'fillInTheBlank',
                reponseParams: { formatInteractif: 'fill-in-the-blank' },
              })
            }
          } else {
            article = quidam.pronom
            x = ratiovinaigrette[index % 3][0]
            y = ratiovinaigrette[index % 3][1]
            k = randint(2, 6)
            total = (x + y) * k
            texte += `${quidam.prenom} veut réaliser une vinaigrette. Pour cela ${article} mélange du vinaigre et de l'huile d'olive selon le ratio $~${x}~:~${y}$.<br>`
            texte += `${premiereLettreEnMajuscule(article)} utilise $${y * k}$ cuillères à soupe d'huile d'une contenance de $15 \\text{ mL}$ chacune.<br>`
            texte += `${numAlpha(0)} Quel volume de vinaigre doit-${article} utiliser ?<br>`
            texte += `${numAlpha(1)} Quel volume de vinaigrette ${quidam.prenom} réalisera-t-${article} ?<br>`
            texteCorr += `${numAlpha(0)} Comme le ratio de vinaigre et d'huile est $${x}~:~${y}$, alors on a :<br>`
            texteCorr += `${sp(6)}$${texFractionFromString('\\text{volume de vinagre en mL}', x + '\\text{ mL}')}=${texFractionFromString(`${y * k}\\times 15 \\text{ mL}`, y + '\\text{ mL}')}=${miseEnEvidence(k * 15, bleuMathalea)}$.<br>`
            texteCorr += `${sp(6)}Le volume de vinaigre doit-être : $${miseEnEvidence(k * 15, bleuMathalea)}\\times ${x}\\text{ mL}=${miseEnEvidence(k * 15 * x)}\\text{ mL}$.<br>`
            texteCorr += `${numAlpha(1)} Donc le volume de vinaigrette est : $${miseEnEvidence(k * 15, bleuMathalea)}\\text{ mL}\\times \\left( ${x}+${y} \\right)=${miseEnEvidence(k * 15, bleuMathalea)}\\text{ mL}\\times ${x + y}=${miseEnEvidence(k * 15 * (x + y))}\\text{ mL}$.`
            if (this.interactif) {
              texte += ajouteQuestionMathlive({
                exercice: this,
                question: i,
                content:
                  '\\text{volume de vinaigre : }%{champ1}\\text{ mL}\\text{ ; volume de vinaigrette : }%{champ2}\\text{ mL}',
                objetReponse: {
                  champ1: { value: String(k * x * 15) },
                  champ2: { value: String(k * 15 * (x + y)) },
                  bareme: toutAUnPoint,
                },
                typeInteractivite: 'fillInTheBlank',
                reponseParams: { formatInteractif: 'fill-in-the-blank' },
              })
            }
          }
          break

        case 'ecran':
          x = ratioecran[index % 4][0]
          y = ratioecran[index % 4][1]
          a = resolutions[index2 % 8][0]
          b = resolutions[index2 % 8][1]
          texte += `Un écran au format $${x}~:~${y}$ est-il adapté à une résolution de $${texNombre(a, 0)}\\times ${texNombre(b, 0)}$ ?<br>`
          if (a / x === b / y) {
            texteCorr += `La résolution d'image $${texNombre(a, 0)}\\times ${texNombre(b, 0)}$ ${texteEnCouleurEtGras('respecte effectivement')} le format $${x}~:~${y}$.<br>`
            texteCorr += `En effet, $${texFractionFromString(a, x)}=${texFractionFromString(b, y)}=${texNombre(a / x)}$`
            if (this.interactif) {
              texte +=
                `Si oui, saisir $${texNombre(b, 0)}$ dans la zone de saisie, sinon saisir la hauteur adaptée.<br>` +
                ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  content: `${texNombre(a, 0)}\\times %{champ1}`,
                  objetReponse: { champ1: { value: texNombre(b, 0) } },
                  typeInteractivite: 'fillInTheBlank',
                  reponseParams: { formatInteractif: 'fill-in-the-blank' },
                })
            }
          } else {
            texteCorr += `La résolution d'image $${texNombre(a)}\\times ${texNombre(b)}$ ${texteEnCouleurEtGras('ne respecte pas')} le format $${x}~:~${y}$.<br>`

            if (Number.isInteger(a / x)) {
              texteCorr += `En effet, $${texFractionFromString(a, x)}=${texNombre(a / x)}$ et $${texFractionFromString(b, y)}\\approx ${texNombre(b / y)}$.<br>`
              k = a / x
              if (!this.interactif) {
                texte +=
                  "Sinon, proposer une résolution qui conviendrait en gardant la largeur d'image."
              } else {
                texte +=
                  `Si oui, saisir $${texNombre(b, 0)}$ dans la zone de saisie, sinon saisir la hauteur adaptée.<br>` +
                  ajouteQuestionMathlive({
                    exercice: this,
                    question: i,
                    content: `${texNombre(a, 0)}\\times %{champ1}`,
                    objetReponse: { champ1: { value: String(k * y) } },
                    typeInteractivite: 'fillInTheBlank',
                    reponseParams: { formatInteractif: 'fill-in-the-blank' },
                  })
              }
              texteCorr += `On doit avoir : $${texFractionFromString(a, x)}=${texFractionFromString('h', y)}$<br>`
              texteCorr += `Donc $h=${texFractionFromString(`${y}\\times ${texNombre(a, 0)}`, String(x))}=${miseEnEvidence(texNombre(k * y))}$. La résolution $${texNombre(a)}\\times ${texNombre(k * y)}$ respecte le format $${x}~:~${y}$.`
            } else if (Number.isInteger(b / y)) {
              texteCorr += `En effet, $${texFractionFromString(a, x)}\\approx ${texNombre(a / x)}$ et $${texFractionFromString(b, y)}=${texNombre(b / y)}$.<br>`
              k = b / y
              if (!this.interactif) {
                texte +=
                  "Sinon, proposer une résolution qui conviendrait en gardant la hauteur d'image."
              } else {
                texte +=
                  `Si oui, saisir $${texNombre(a, 0)}$ dans la zone de saisie, sinon saisir la largeur adaptée.<br>` +
                  ajouteQuestionMathlive({
                    exercice: this,
                    question: i,
                    content: ` %{champ1}\\times${texNombre(b, 0)}`,
                    objetReponse: { champ1: { value: String(k * x) } },
                    typeInteractivite: 'fillInTheBlank',
                    reponseParams: { formatInteractif: 'fill-in-the-blank' },
                  })
              }
              texteCorr += `On doit avoir : $${texFractionFromString(b, y)}=${texFractionFromString('L', x)}$<br>`
              texteCorr += `Donc $L=${texFractionFromString(x + '\\times' + texNombre(b), y)}=${miseEnEvidence(texNombre(k * x))}$. La résolution $${texNombre(k * x)}\\times ${texNombre(b)}$ respecte le format $${x}~:~${y}$.`
            } else {
              texteCorr += `En effet, $${texFractionFromString(a, x)}\\approx ${texNombre(a / x)}$ et $${texFractionFromString(b, y)}\\approx ${texNombre(b / y)}$.<br>`

              k = ppcm(x, y)
              c = 0
              if (k % 10 !== 0) {
                if (k % 2 === 0) {
                  k *= 5
                } else {
                  if (k % 5 === 0) {
                    k *= 2
                  } else {
                    k *= 10
                  }
                }
              }
              while (c < 1024) {
                c += k
              }
              const callback = (exercice: IExercice, question: number) => {
                const spanReponseLigne = document.querySelector(
                  `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
                )
                let feedback: string = ''
                const mfe = document.querySelector(
                  `#champTexteEx${exercice.numeroExercice}Q${question}`,
                ) as MathfieldElement
                const prompts = mfe.getPrompts()
                if (prompts.length !== 2) {
                  return {
                    isOk: false,
                    feedback:
                      "erreur dans le programme : Les zones n'ont pas été trouvées",
                    score: { nbBonnesReponses: 0, nbReponses: 1 },
                  }
                }
                const [largeur, hauteur] = prompts.map((prompt) =>
                  mfe.getPromptValue(prompt),
                )
                const isOk =
                  Number(largeur) > 1024 &&
                  Number(largeur) / x === Number(hauteur) / y
                if (Number(largeur) < 1024) {
                  feedback = `La largeur doit être supérieure à ${stringNombre(1024)} pixels<br>`
                }
                if (Number(largeur) / x === Number(hauteur) / y) {
                  feedback += `La résolution proposée respecte le format $${x}~:~${y}$, car les deux nombres ont été multipliés par ${Number(largeur) / x}`
                } else {
                  feedback += `La résolution proposée ne respecte pas le format $${x}~:~${y}$ car $\\dfrac{${Number(largeur)}}{${x}}\\approx ${texNombre(Number(largeur) / x, 3)}$ et $\\dfrac{${Number(hauteur)}}{${y}}\\approx ${texNombre(Number(hauteur) / y, 3)}$`
                }
                const resultat = {
                  isOk,
                  feedback,
                  score: {
                    nbBonnesReponses: isOk ? 1 : 0,
                    nbReponses: 1,
                  },
                }
                // on met le smiley
                if (spanReponseLigne != null) {
                  spanReponseLigne.innerHTML = resultat.isOk ? '😎' : '☹️'
                }
                const spanFeedback = document.querySelector(
                  `#feedbackEx${exercice.numeroExercice}Q${question}`,
                )
                // on met le feedback
                if (
                  feedback != null &&
                  spanFeedback != null &&
                  feedback.length > 0
                ) {
                  spanFeedback.innerHTML = '💡 ' + feedback
                  spanFeedback.classList.add(
                    'py-2',
                    'italic',
                    'text-coopmaths-warn-darkest',
                    'dark:text-coopmathsdark-warn-darkest',
                  )
                }
                return resultat
              }

              if (this.interactif) {
                texte +=
                  `Si oui, recopier les nombres $${texNombre(a, 0)}$ et $${texNombre(b, 0)}$ dans les zones de saisies, sinon, saisissez une résolution adaptée avec une largeur supérieure à $${texNombre(1024)}$ pixels` +
                  ajouteQuestionMathlive({
                    exercice: this,
                    question: i,
                    content: ' %{champ1}\\times %{champ2}',
                    objetReponse: {
                      champ1: { value: c.toFixed(0) },
                      champ2: { value: ((c * y) / x).toFixed(0) },
                      bareme: toutAUnPoint,
                      callback,
                    },
                    typeInteractivite: 'fillInTheBlank',
                    reponseParams: { formatInteractif: 'fill-in-the-blank' },
                  })
              } else {
                texte += `Sinon proposer une résolution adaptée à ce ratio avec une largeur supérieure à $${texNombre(1024)}$ pixels.`
              }
              texteCorr += `Le nombre $${texNombre(c)}$ est un multiple de $${x}$ et de $${y}$.<br>`
              texteCorr += `Je choisis comme résolution $${texNombre(c)} \\times ${texFractionFromString(texNombre(c) + '\\times ' + y, x)}$ soit $${texNombre(c)}\\times ${(c * y) / x}$.<br>`
              texteCorr += `En effet $${texFractionFromString(c, x)}=${texFractionFromString((c * y) / x, y)}=${c / x}$ donc la résolution $${texNombre(c)}\\times ${(c * y) / x}$ respecte le format $${x}~:~${y}$.`
            }
          }

          break
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
  // Si les variables suivantes sont définies, elles provoquent l'affichage des formulaires des paramètres correspondants
  // Il peuvent être de 3 types : _numerique, _case_a_cocher ou _texte.
  // Il sont associés respectivement aux paramètres sup, sup2 et sup3.
} // Fin de l'exercice.
