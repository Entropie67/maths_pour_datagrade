import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Utiliser les expressions « égal à », « supérieur à », « inférieur à » et « compris entre »'
export const dateDePublication = '03/11/2026'
export const interactifReady = true

/**
 * Choisir l'expression qui complète une phrase, traduire une phrase par un
 * symbole et reconnaître un nombre compris entre deux autres
 * @author Rémi Angot
 */
export const uuid = 'a339d'

export const refs = {
  'fr-fr': ['CM1N1G'],
  'fr-ch': [],
}

type Proposition = { texte: string; statut: boolean }

/** 3 456 → 3 000+400+50+6 (les termes nuls sont omis) */
function decomposition(n: number): string {
  const chiffres = String(n).split('').map(Number)
  return chiffres
    .map((c, rang) => c * 10 ** (chiffres.length - 1 - rang))
    .filter((terme) => terme !== 0)
    .map((terme) => texNombre(terme))
    .join('+')
}

/** Change un chiffre de n pour obtenir un nombre plus grand ou plus petit, avec le même nombre de chiffres */
function voisin(n: number, plusGrand: boolean): number {
  const chiffres = String(n).split('').map(Number)
  const rangs = shuffle(chiffres.map((_, rang) => rang))
  for (const rang of rangs) {
    const min = rang === 0 ? 1 : 0
    const c = chiffres[rang]
    if (plusGrand ? c < 9 : c > min) {
      chiffres[rang] = plusGrand ? randint(c + 1, 9) : randint(min, c - 1)
      return Number(chiffres.join(''))
    }
  }
  return plusGrand ? n + 1 : n - 1
}

const expressions = {
  egal: 'égal à',
  superieur: 'supérieur à',
  inferieur: 'inférieur à',
}

export default class ExpressionsDeComparaison extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Compléter une phrase',
        '2 : Écrire une phrase avec un symbole',
        '3 : Trouver un nombre compris entre deux nombres',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const listeTypesDeQuestions = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 3,
        melange: 4,
        defaut: 4,
        nbQuestions: this.nbQuestions,
      }).map(Number),
      this.nbQuestions,
    )
    const listeRelations = combinaisonListes(
      ['egal', 'superieur', 'inferieur'] as const,
      this.nbQuestions,
    )
    const listeSymboles = combinaisonListes(
      ['superieur', 'inferieur'] as const,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let propositions: Proposition[] = []
      let cle: number[] = []
      switch (listeTypesDeQuestions[i]) {
        case 1: {
          const relation = listeRelations[i]
          const a = randint(1001, 9999)
          const b =
            relation === 'egal' ? a : voisin(a, relation === 'inferieur')
          texte = `Compléter la phrase : $${texNombre(a)}$ est $\\ldots$ $${decomposition(b)}$.`
          texteCorr = `$${decomposition(b)}=${texNombre(b)}$.<br>`
          texteCorr +=
            relation === 'egal'
              ? `Les deux nombres sont égaux, donc $${texNombre(a)}$ est ${texteEnCouleurEtGras('égal à')} $${decomposition(b)}$.`
              : `$${texNombre(a)}${relation === 'superieur' ? '>' : '<'}${texNombre(b)}$, donc $${texNombre(a)}$ est ${texteEnCouleurEtGras(expressions[relation])} $${decomposition(b)}$.`
          propositions = (['egal', 'superieur', 'inferieur'] as const).map(
            (r) => ({ texte: `« ${expressions[r]} »`, statut: r === relation }),
          )
          cle = [a, b]
          break
        }
        case 2: {
          const relation = listeSymboles[i]
          const a = randint(101, 9999)
          const b = voisin(a, relation === 'inferieur')
          const symbole = relation === 'superieur' ? '>' : '<'
          texte = `Écrire avec un symbole la phrase : « $${texNombre(a)}$ est ${expressions[relation]} $${texNombre(b)}$ ».`
          texteCorr = `« Est ${expressions[relation]} » se note $${symbole}$.<br>`
          texteCorr += `« $${texNombre(a)}$ est ${expressions[relation]} $${texNombre(b)}$ » s'écrit $${miseEnEvidence(`${texNombre(a)}${symbole}${texNombre(b)}`)}$.`
          propositions = ['<', '>', '='].map((s) => ({
            texte: `$${texNombre(a)}${s}${texNombre(b)}$`,
            statut: s === symbole,
          }))
          cle = [a, b]
          break
        }
        case 3:
        default: {
          const borneInf = randint(11, 99) * 10
          const borneSup = borneInf + 10
          const dizaines = (borneInf / 10) % 10
          // Le chiffre des unités diffère de celui des dizaines pour que
          // l'échange de ces deux chiffres donne un nombre hors de l'intervalle
          const solution = borneInf + randint(1, 9, [dizaines])
          const echange =
            solution - (solution % 100) + (solution % 10) * 10 + dizaines
          const auDessus = borneSup + randint(1, 9)
          const auDessous = borneInf - randint(1, 9)
          const distracteurs = [echange, auDessus, auDessous]
          if (new Set([solution, ...distracteurs]).size < 4) {
            cpt++
            continue
          }
          texte = `Quel nombre est compris entre $${texNombre(borneInf)}$ et $${texNombre(borneSup)}$ ?`
          texteCorr = distracteurs
            .map((n) =>
              n > borneSup
                ? `$${texNombre(n)}$ est supérieur à $${texNombre(borneSup)}$.`
                : `$${texNombre(n)}$ est inférieur à $${texNombre(borneInf)}$.`,
            )
            .join('<br>')
          texteCorr += `<br>$${texNombre(solution)}$ est supérieur à $${texNombre(borneInf)}$ et inférieur à $${texNombre(borneSup)}$.<br>`
          texteCorr += `Le nombre compris entre $${texNombre(borneInf)}$ et $${texNombre(borneSup)}$ est $${miseEnEvidence(texNombre(solution))}$.`
          propositions = shuffle([
            { texte: `$${texNombre(solution)}$`, statut: true },
            ...distracteurs.map((n) => ({
              texte: `$${texNombre(n)}$`,
              statut: false,
            })),
          ])
          cle = [borneInf, solution]
          break
        }
      }
      const qcmOptions = { radio: true, vertical: false }
      if (this.questionJamaisPosee(i, listeTypesDeQuestions[i], ...cle)) {
        handleAnswers(
          this,
          i,
          {
            qcm: {
              enonce: texte,
              propositions,
              correction: texteCorr,
              options: qcmOptions,
            },
          },
          { formatInteractif: 'mathalea-qcm' },
        )
        if (context.isHtml) {
          texte += addMathaleaQcm(this, i, {
            ...qcmOptions,
            interactivityOn: this.interactif,
          })
        } else if (!context.isAmc) {
          texte += propositionsQcm(this, i).texte
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
