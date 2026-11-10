import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Trouver des phrases avec les mots : divisible, diviseur et multiple'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

/**
 * Compléter des phrases avec les mots divisible, divieur et multiple
 * @author Rémi Angot

 */
export const uuid = 'f894a'

export const refs = {
  'fr-fr': ['6N2J-3,5N1I'],
  'fr-2016': ['6N43-4'],
  'fr-ch': ['9R1NO1A-1', '9R2NO1A-1', '9R3NO1A-1', 'PRQNO09A-8'],
}
type ReponseType = [string, string]
type ReponseTypeArray = ReponseType[]
export default class DivisibleDiviseurMultiple extends Exercice {
  setReponse: (i: number, listeBonnesReponses: ReponseTypeArray) => void
  listeReponses: ReponseTypeArray[]
  constructor() {
    super()

    this.nbQuestions = 6 // 6 questions au maximum
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.listeReponses = []
    // Chaque question comporte deux listes déroulantes et rapporte donc 2 points,
    // corrigées par correctionInteractive() qui renvoie un tableau de résultats.
    this.exoCustomResultat = true
    this.pointsParQuestions = 2 // deux listes déroulantes à compléter par question

    this.setReponse = function (
      i: number,
      listeBonnesReponses: ReponseTypeArray,
    ) {
      this.listeReponses[i] = listeBonnesReponses
    }
  }

  nouvelleVersion() {
    let b = randint(6, 17, [9, 10])
    let q = randint(11, 99)
    let r = randint(1, b - 1)
    let a = b * q
    let a1 = b * q + r
    while (q % b === 0 || q % r === 0 || b % r === 0 || a1 % r === 0) {
      b = randint(6, 17, [9, 10])
      q = randint(11, 99)
      r = randint(1, b - 1)
      a = b * q
      a1 = b * q + r
    }
    this.introduction = `À l'aide des calculs suivants, compléter les phrases suivantes avec les nombres $${texNombre(a1)}$, $${texNombre(a)}$, $${texNombre(b)}$ ou $${texNombre(q)}$.<br><br>`
    if (randint(0, 1) === 0) {
      this.introduction += operation({
        operande1: a,
        operande2: b,
        type: 'divisionE',
      })
      if (!context.isHtml) this.introduction += '\\qquad'
      this.introduction += operation({
        operande1: a1,
        operande2: b,
        type: 'divisionE',
      })
    } else {
      this.introduction += operation({
        operande1: a1,
        operande2: b,
        type: 'divisionE',
      })
      if (!context.isHtml) this.introduction += '\\qquad'
      this.introduction += operation({
        operande1: a,
        operande2: b,
        type: 'divisionE',
      })
    }

    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6] // On créé 3 types de questions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (let i = 0, texte, texteCorr; i < this.nbQuestions; i++) {
      // Boucle principale où i+1 correspond au numéro de la question
      if (listeTypeDeQuestions[i] === 1) {
        texte =
          '$\\ldots\\ldots\\ldots$ est divisible par $\\ldots\\ldots\\ldots$'
        if (this.interactif) {
          texte =
            choixDeroulant(this, 2 * i, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            }) +
            'est divisible par' +
            choixDeroulant(this, 2 * i + 1, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            })
        }
        texteCorr = `$${miseEnEvidence(texNombre(a, 0))}$ est divisible par $${miseEnEvidence(texNombre(b, 0))}$ ou $${miseEnEvidence(texNombre(a, 0))}$ est divisible par $${miseEnEvidence(texNombre(q, 0))}$
        car le reste de la division euclidienne de $${texNombre(a, 0)}$ par $${texNombre(b, 0)}$ est $0$ et le quotient est $${texNombre(q, 0)}$.`
      } else if (listeTypeDeQuestions[i] === 2) {
        texte =
          '$\\ldots\\ldots\\ldots$ est un diviseur de $\\ldots\\ldots\\ldots$'
        if (this.interactif) {
          texte =
            choixDeroulant(this, 2 * i, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            }) +
            'est un diviseur de' +
            choixDeroulant(this, 2 * i + 1, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            })
        }
        texteCorr = `$${miseEnEvidence(texNombre(b, 0))}$ est un diviseur de $${miseEnEvidence(texNombre(a, 0))}$ ou $${miseEnEvidence(texNombre(q, 0))}$ est un diviseur de $${miseEnEvidence(texNombre(a, 0))}$
        car le reste de la division euclidienne de $${texNombre(a, 0)}$ par $${texNombre(b, 0)}$ est $0$ et le quotient est $${texNombre(q, 0)}$.`
      } else if (listeTypeDeQuestions[i] === 3) {
        texte =
          '$\\ldots\\ldots\\ldots$ est un multiple de $\\ldots\\ldots\\ldots$'
        if (this.interactif) {
          texte =
            choixDeroulant(this, 2 * i, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            }) +
            'est un multiple de' +
            choixDeroulant(this, 2 * i + 1, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            })
        }
        texteCorr = `$${miseEnEvidence(texNombre(a, 0))}$ est un multiple de $${miseEnEvidence(texNombre(b, 0))}$ ou $${miseEnEvidence(texNombre(a, 0))}$ est un multiple de $${miseEnEvidence(texNombre(q, 0))}$
        car le reste de la division euclidienne de $${texNombre(a, 0)}$ par $${texNombre(b, 0)}$ est $0$ et le quotient est $${texNombre(q, 0)}$.`
      } else if (listeTypeDeQuestions[i] === 4) {
        texte =
          "$\\ldots\\ldots\\ldots$ n'est pas divisible par $\\ldots\\ldots\\ldots$"
        if (this.interactif) {
          texte =
            choixDeroulant(this, 2 * i, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            }) +
            "n'est pas divisible par" +
            choixDeroulant(this, 2 * i + 1, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            })
        }
        texteCorr = `$${miseEnEvidence(texNombre(a1, 0))}$ n'est pas divisible par $${miseEnEvidence(texNombre(b, 0))}$ ou $${miseEnEvidence(texNombre(a1, 0))}$ n'est pas divisible par $${miseEnEvidence(texNombre(q, 0))}$
        car le reste de la division euclidienne de $${texNombre(a1, 0)}$ par $${texNombre(b, 0)}$ n'est pas $0$.`
      } else if (listeTypeDeQuestions[i] === 5) {
        texte =
          "$\\ldots\\ldots\\ldots$ n'est pas un diviseur de $\\ldots\\ldots\\ldots$"
        if (this.interactif) {
          texte =
            choixDeroulant(this, 2 * i, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            }) +
            "n'est pas un diviseur de" +
            choixDeroulant(this, 2 * i + 1, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            })
        }
        texteCorr = `$${miseEnEvidence(texNombre(b, 0))}$ n'est pas un diviseur de $${miseEnEvidence(texNombre(a1, 0))}$ ou $${miseEnEvidence(texNombre(q, 0))}$ n'est pas un diviseur de $${miseEnEvidence(texNombre(a1, 0))}$
        car le reste de la division euclidienne de $${texNombre(a1, 0)}$ par $${texNombre(b, 0)}$ n'est pas $0$.`
      } else {
        texte =
          "$\\ldots\\ldots\\ldots$ n'est pas un multiple de $\\ldots\\ldots\\ldots$"
        if (this.interactif) {
          texte =
            choixDeroulant(this, 2 * i, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            }) +
            "n'est pas un multiple de" +
            choixDeroulant(this, 2 * i + 1, {
              choices: [
                { label: 'Choisir un nombre', value: '' },
                { latex: texNombre(a1, 0), value: String(a1) },
                { latex: texNombre(a, 0), value: String(a) },
                { latex: texNombre(b, 0), value: String(b) },
                { latex: texNombre(q, 0), value: String(q) },
              ],
            })
        }
        texteCorr = `$${miseEnEvidence(texNombre(a1, 0))}$ n'est pas un multiple de $${miseEnEvidence(texNombre(b, 0))}$ ou $${miseEnEvidence(texNombre(a1, 0))}$ n'est pas un multiple de $${miseEnEvidence(texNombre(q, 0))}$
        car le reste de la division euclidienne de $${texNombre(a1, 0)}$ par $${texNombre(b, 0)}$ n'est pas $0$.`
      }
      const nombres = [a1, a, b, q]
      const type = listeTypeDeQuestions[i]
      this.setReponse(
        i,
        nombres.flatMap((premier) =>
          nombres
            .filter((second) => {
              const divisible =
                type === 2 || type === 5
                  ? second % premier === 0
                  : premier % second === 0
              return type <= 3 ? divisible : !divisible
            })
            .map((second): ReponseType => [String(premier), String(second)]),
        ),
      )
      texte += ajouteFeedback(this, 2 * i + 1)
      // Si la question n'a jamais été posée, on en crée une autre
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    // choixDeroulant() a renseigné autoCorrection aux indices 2i et 2i+1 pour
    // chaque liste déroulante. La correction est en réalité entièrement gérée
    // question par question par correctionInteractive() : on repart donc d'un
    // autoCorrection vierge, une entrée vide par question, que
    // attachExerciseCustomCallbacks() branchera sur correctionInteractive().
    // Sans ça, les listes déroulantes des indices nbQuestions à 2*nbQuestions-1
    // étaient comptées comme des questions toujours fausses (score plafonné à
    // la moitié des points).
    this.autoCorrection = Array.from({ length: this.nbQuestions }, () => ({}))
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number): string[] => {
    const select1 = document.querySelector(
      `#liste-deroulanteEx${this.numeroExercice}Q${2 * i}`,
    ) as HTMLSelectElement
    const select2 = document.querySelector(
      `#liste-deroulanteEx${this.numeroExercice}Q${2 * i + 1}`,
    ) as HTMLSelectElement
    if (this.answers === undefined) {
      this.answers = {}
    }
    if (select1) {
      this.answers[select1.id] = select1.value
    }
    if (select2) {
      this.answers[select2.id] = select2.value
    }
    const choix1 = select1?.value ?? ''
    const choix2 = select2?.value ?? ''

    const paires = this.listeReponses[i]
    const isOk = paires.some(
      ([premier, second]) => premier === choix1 && second === choix2,
    )
    // Une phrase est une relation entre deux nombres : valider la paire entière.
    const ok1 = isOk
    const ok2 = isOk

    // Un smiley à côté de chacune des deux listes déroulantes pour indiquer
    // le résultat de la phrase : une question rapporte toujours 2 points.
    const afficheResultatListe = (questionIndex: number, estJuste: boolean) => {
      const span = document.querySelector(
        `#resultatCheckEx${this.numeroExercice}Q${questionIndex}`,
      )
      if (span == null) {
        window.notify(
          '6N2J-3 : span de résultat de liste déroulante introuvable',
          { questionIndex },
        )
        return
      }
      span.innerHTML = estJuste ? '😎' : '☹️'
      ;(span as HTMLElement).style.fontSize = 'large'
    }
    afficheResultatListe(2 * i, ok1)
    afficheResultatListe(2 * i + 1, ok2)

    return [ok1 ? 'OK' : 'KO', ok2 ? 'OK' : 'KO']
  }
}
