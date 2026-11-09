import { orangeMathalea } from '../../lib/colors'
import { demiDroiteInteractive } from '../../lib/customElements/demi_droite_interactive'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { adverbeNumeral } from '../../modules/nombreEnLettres'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '05/07/2026'
export const titre =
  'Placer une abscisse fractionnaire sur une demi-droite (fraction quotient)'
export const interactifReady = true

/** Placer une abscisse fractionnaire sur une demi-droite graduée
 * @author Jean-Claude Lhote
 */
export const uuid = 'cff13'

export const refs = {
  'fr-fr': ['6N3D-1'],
  'fr-2016': [],
  'fr-ch': ['9R1NO4B-9', '9R2NO4B-9', '9R3NO4B-9', 'PRQNO04B-9'],
}

export default class DonnerSensDefinitionQuotient2 extends Exercice {
  private reponsesAttendues: { num: number; den: number }[] = []

  constructor() {
    super()
    this.nbQuestions = 5
    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireCaseACocher = ['Avec une multiplication', false]
    this.besoinFormulaire2CaseACocher = [
      'Avec partage en 5 et 10 pour la version latex',
      false,
    ]
    this.sup = false
    this.sup2 = false
    this.comment = `Cet exercice se distingue de la série CM2N2E par le fait qu'on utilise la notion de quotient pour placer le point A.<br>
    En version HTML, on peut avoir un diviseur allant de 2 à 10 (le bouton |+ permet de modifier le nombre de parts).<br>
    En version LaTex, les diviseurs sont limités à 2, 4, 5 et 10 (ou 2 et 4 seulement si la case est décochée), car l'élève doit effectuer lui même le partage du segment [OT] après avoir placé le point T.`
  }

  nouvelleVersion() {
    this.consigne =
      context.isHtml && !context.isTypst
        ? 'Utiliser les boutons pour modifier la demi-droite graduée et créer les graduations nécessaires pour placer le point $A$.'
        : "L'unité est le cm. Un segment [OT] est à construire sur la demi-droite graduée, puis à partager en parties égales pour placer le point $A$."
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const abscisseT = randint(4, 9)
      const den = context.isHtml
        ? randint(2, 10, abscisseT)
        : this.sup2
          ? choice([2, 4, 5, 10], abscisseT)
          : choice([2, 4], abscisseT)
      const num = this.sup ? randint(2, den) * abscisseT : abscisseT

      let texte = `Placer le point $A$ d'abscisse $\\dfrac{${num}}{${den}}$ sur la demi-droite graduée ci-dessous.<br><br>`
      let texteCorr = `On construit le segment [OT] de longueur ${abscisseT} cm, puis on le partage en ${den} parties égales.<br>
        Le point A est placé sur la ${adverbeNumeral(num / abscisseT)} graduation après $O$.<br>`
      texteCorr +=
        this.correctionDetaillee && this.sup
          ? `En effet, $\\dfrac{${num}}{${den}} =${num / abscisseT} \\times \\dfrac{${abscisseT}}{${den}}$.<br><br>`
          : ''
      texteCorr += `Le point d'abscisse $\\dfrac{${num}}{${den}}$ est placé sur la demi-droite graduée ci-dessous.<br><br>`

      texte += demiDroiteInteractive(this, i, {
        initialT: context.isHtml && !context.isTypst ? 2 : abscisseT,
        minT: 2,
        maxT: 10,
      })
      texteCorr += demiDroiteInteractive(this, i, {
        initialT: abscisseT,
        minT: 2,
        maxT: 10,
        interactivityOn: false,
        partsCount: den,
        points: [{ pointValue: num / den, label: 'A' }],
        id: `demi-droite-gradueeEx${this.numeroExercice}Q${i}Corr`,
        pointsColor: orangeMathalea,
      })

      if (this.questionJamaisPosee(i, num, den)) {
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: JSON.stringify({
                partsCount: den,
                maxT: num,
                showwNegative: false,
                points: [{ pointValue: num / den, label: 'A' }],
                x0: 0,
              }),
            },
          },
          { formatInteractif: 'demi-droite-interactive' },
        )
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        this.reponsesAttendues[i] = { num, den }
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i?: number): string => {
    if (i === undefined) return ''

    const host = document.querySelector(
      `#demi-droite-gradueeEx${this.numeroExercice}Q${i}`,
    ) as
      | (HTMLElement & {
          disableControls: () => void
          value: {
            partsCount: number
            maxT: number
            showwNegative: boolean
            points: { pointValue: number; label: string }[]
          }
        })
      | null

    if (host === null || this.reponsesAttendues[i] === undefined) return ''
    host.disableControls()

    const value = host.value
    this.answers ??= {}
    this.answers[`Ex${this.numeroExercice}Q${i}`] = JSON.stringify(value)

    const attendu =
      this.reponsesAttendues[i].num / this.reponsesAttendues[i].den
    const saisi = value.points[0]?.pointValue
    const ok = saisi !== undefined && Math.abs(saisi - attendu) < 1e-9

    const spanResultat = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement | null

    if (spanResultat) {
      spanResultat.innerHTML = ok ? '😎' : '☹️'
    }
    return ok ? 'OK' : 'KO'
  }
}
