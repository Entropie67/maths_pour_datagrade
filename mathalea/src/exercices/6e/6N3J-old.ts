import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Ordonner une liste de nombres écrits sous forme de fractions ou de nombres mixtes'
export const interactifReady = true

export const dateDePublication = '21/07/2025'

/** Ordonner une liste de nombres écrits sous forme de fractions ou de nombres mixtes
 * @author Éric Elter
 */

export const uuid = '98293'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}

/**
 * Trie le tableau `T2` selon l'ordre croissant des valeurs dans `T1`.
 *
 * Les deux tableaux doivent être de même longueur. Chaque élément de `T2`
 * sera réorganisé pour correspondre à la position triée de l'élément
 * correspondant dans `T1`.
 *
 * @param {number[]} T1 - Tableau de nombres utilisé pour déterminer l'ordre.
 * @param {string[]} T2 - Tableau de chaînes à réorganiser selon le tri de T1.
 * @returns {string[]} Un nouveau tableau `T2` trié selon l'ordre croissant de `T1`.
 * @throws {Error} Si `T1` et `T2` n'ont pas la même longueur.
 *
 * @example
 * const T1 = [42, 7, 19];
 * const T2 = ["z", "a", "m"];
 * const result = sortByT1Order(T1, T2); // ["a", "m", "z"]
 */
function sortByT1Order(T1: number[], T2: string[]): string[] {
  if (T1.length !== T2.length) {
    throw new Error('T1 and T2 must have the same length')
  }

  return T1.map((value, index) => ({ value, str: T2[index] }))
    .sort((a, b) => a.value - b.value)
    .map((pair) => pair.str)
}

export default class ComparerFractionsNombresMixtes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.besoinFormulaireNumerique = [
      'Type du rangement',
      3,
      '1 : Ordre croissant\n2 : Ordre décroissant\n3 : Mélange',
    ]
    this.sup = 3
    this.besoinFormulaire2Numerique = [
      'Type du rangement',
      3,
      '1 : Nombre mixte plus grand que 1\n2 : Nombre mixte plus petit que 1\n3 : Mélange',
    ]
    this.sup2 = 3
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.spacing = 2.5
    this.spacingCorr = 2.5
  }

  nouvelleVersion() {
    let listeTypeDeQuestions = this.sup === 3 ? [1, 2] : [this.sup]
    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    let listeTypeDeSignes = this.sup2 === 3 ? [1, 2] : [this.sup2]
    listeTypeDeSignes = combinaisonListes(listeTypeDeSignes, this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const croissant = listeTypeDeQuestions[i] === 1
      const ordre = croissant ? 'croissant' : 'décroissant'
      const symbole = croissant ? '<' : '>'

      let texte = `Classer les nombres suivants dans l'ordre ${ordre} :<br>`
      const denominateur = randint(3, 10)

      const numerateurFractionMixte = choice([true, false]) ? 1 : 2
      const complementNumerateurFM = 3 - numerateurFractionMixte
      const complementNb3 = choice([
        numerateurFractionMixte + complementNumerateurFM,
        Math.abs(numerateurFractionMixte - complementNumerateurFM),
      ])

      // (a+1)/b avec a>b
      const Nb1 = new FractionEtendue(
        listeTypeDeSignes[i] === 1
          ? denominateur + complementNumerateurFM
          : denominateur - complementNumerateurFM,
        denominateur,
      )
      // (2a+1)/2b
      const Nb2 = new FractionEtendue(
        listeTypeDeSignes[i] === 1
          ? 2 * denominateur + complementNb3
          : 2 * denominateur - complementNb3,
        2 * denominateur,
      )
      // 1 + 1/b
      const Nb3 = new FractionEtendue(numerateurFractionMixte, denominateur)
      // c/b avec c/b
      const Nb4 = new FractionEtendue(
        listeTypeDeSignes[i] === 1
          ? denominateur - randint(2, denominateur - 1)
          : denominateur + randint(2, denominateur - 1),
        denominateur,
      )
      // 1
      const Nb5 = new FractionEtendue(1, 1)

      const TableauDeFractions = [Nb1, Nb2, Nb3, Nb4, Nb5]

      if (this.questionJamaisPosee(i, ...TableauDeFractions)) {
        const TableauDeNombres = TableauDeFractions.map(
          (el) => el.valeurDecimale,
        )
        TableauDeNombres[2] =
          listeTypeDeSignes[i] === 1
            ? 1 + TableauDeNombres[2]
            : 1 - TableauDeNombres[2]
        const TableauAComparer = TableauDeFractions.map((el) => el.texFraction)
        const unPlus = listeTypeDeSignes[i] === 1 ? '1+' : '1-'
        TableauAComparer[2] = unPlus + TableauAComparer[2]

        const NbAComparer = shuffle(TableauAComparer)
        for (let indice = 0; indice < NbAComparer.length; indice++) {
          texte += `$${sp(3)}${NbAComparer[indice]}${sp(3)}$;`
        }
        texte = texte.slice(0, -1)
        texte += '<br>'

        texte += remplisLesBlancs(
          this,
          i,
          `%{champ1}${symbole}%{champ2}${symbole}%{champ3}${symbole}%{champ4}${symbole}%{champ5}`,
          ` ${KeyboardType.clavierDeBaseAvecFraction}`,
          '\\ldots\\ldots',
        )

        const fractionsTrieesFinales = sortByT1Order(
          TableauDeNombres,
          TableauAComparer,
        )
        const indiceBase0 = listeTypeDeSignes[i] - 1
        handleAnswers(this, i, {
          bareme: (listePoints) => [
            Math.ceil(
              (listePoints[0] +
                listePoints[1] +
                listePoints[2] +
                listePoints[3] +
                listePoints[4]) /
                2,
            ),
            3,
          ],
          champ1: {
            value: fractionsTrieesFinales[4 * indiceBase0],
          },
          champ2: {
            value: fractionsTrieesFinales[abs(4 * indiceBase0 - 1)],
          },
          champ3: {
            value: fractionsTrieesFinales[abs(4 * indiceBase0 - 2)],
          },
          champ4: {
            value: fractionsTrieesFinales[abs(4 * indiceBase0 - 3)],
          },
          champ5: {
            value: fractionsTrieesFinales[abs(4 * indiceBase0 - 4)],
          },
        })

        let texteCorr = ''
        const sens = listeTypeDeQuestions[i] === 1 ? 1 : -1

        if (this.correctionDetaillee) {
          texteCorr = 'Commençons par comparer ces nombres à $1$.<br>'
          const symboleComparaison = listeTypeDeSignes[i] === 1 ? '>' : '<'
          const symboleComparaisonContraire =
            listeTypeDeSignes[i] === 2 ? '>' : '<'
          texteCorr += `$${Nb1.texFraction}${symboleComparaison}1 ${sp(20)} ${Nb2.texFraction}${symboleComparaison}1 ${sp(20)} ${unPlus}${Nb3.texFraction}${symboleComparaison}1 ${sp(20)} ${Nb4.texFraction}${symboleComparaisonContraire}1$<br>`
          texteCorr += `Comparons maintenant $${Nb1.texFraction}$, $${Nb2.texFraction}$ et $${unPlus}${Nb3.texFraction}$ entre eux.<br>`
          texteCorr += `$${Nb1.texFraction}=${unPlus}${new FractionEtendue(complementNumerateurFM, denominateur).texFraction}=${unPlus}${new FractionEtendue(2 * complementNumerateurFM, 2 * denominateur).texFraction} ${sp(20)}`
          texteCorr += `${Nb2.texFraction}=${unPlus}${new FractionEtendue(complementNb3, 2 * denominateur).texFraction} ${sp(20)} `
          texteCorr += `${unPlus}${Nb3.texFraction}=${unPlus}${new FractionEtendue(2 * numerateurFractionMixte, 2 * denominateur).texFraction}$<br>`
          texteCorr += 'Et donc on a : '
          const TableauDeFractionsPartiel = [Nb1, Nb2, Nb3]
          const TableauDeNombresPartiel = TableauDeFractionsPartiel.map(
            (el) => el.valeurDecimale,
          )
          TableauDeNombresPartiel[2] =
            listeTypeDeSignes[i] === 1
              ? 1 + TableauDeNombresPartiel[2]
              : 1 - TableauDeNombresPartiel[2]
          const TableauAComparerPartiel = TableauDeFractionsPartiel.map(
            (el) => el.texFraction,
          )
          TableauAComparerPartiel[2] = unPlus + TableauAComparerPartiel[2]

          const fractionsTrieesPartielles = sortByT1Order(
            TableauDeNombresPartiel,
            TableauAComparerPartiel,
          )
          const start = sens === 1 ? 0 : fractionsTrieesPartielles.length - 1
          const end = sens === 1 ? fractionsTrieesPartielles.length : -1
          for (let indice = start; indice !== end; indice += sens) {
            texteCorr += `$${sp(3)}${fractionsTrieesPartielles[indice]}${sp(3)}$${symbole}`
          }
          texteCorr = texteCorr.slice(0, -1) + '.<br>'
          texteCorr += `On conclut alors au rangement final par ordre ${ordre}.<br>`
        }
        const startFinal = sens === 1 ? 0 : fractionsTrieesFinales.length - 1
        const endFinal = sens === 1 ? fractionsTrieesFinales.length : -1
        for (let indice = startFinal; indice !== endFinal; indice += sens) {
          texteCorr += `$${sp(3)}${miseEnEvidence(fractionsTrieesFinales[indice])}${sp(3)}$${symbole}`
        }
        texteCorr = texteCorr.slice(0, -1)

        this.listeCorrections[i] = texteCorr
        this.listeQuestions[i] = texte
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
