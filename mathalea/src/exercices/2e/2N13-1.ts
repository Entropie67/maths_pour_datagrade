import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Utiliser la notion de valeur absolue d'une quantité"
export const interactifReady = true

/**
 * @author Stéphane Guyon
 */

export const uuid = '0d8b3'

export const refs = {
  'fr-fr': ['2N13-1'],
  'fr-ch': ['2mFctPoly-5'],
}
export default class ValeurAbsolue extends Exercice {
  constructor() {
    super()

    this.consigne = 'Déterminer la valeur du nombre proposé.'
    this.nbQuestions = 5
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 1 //
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3]
    let typesDeQuestions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      typesDeQuestions = listeTypeDeQuestions[i]
      let a = 0
      let b = 0
      let c = 0
      let texte = ''
      let texteCorr = ''
      let reponse = '0'
      switch (typesDeQuestions) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1:
          a = randint(1, 150) * choice([-1, 1])

          texte = `$\\vert ${a}\\vert =$`
          reponse = `${Math.abs(a)}`
          texteCorr = `$\\vert ${a}\\vert = ${miseEnEvidence(reponse)}$`

          break
        case 2:
          a = randint(1, 5)

          texte = `$\\vert \\pi - ${a}\\vert =$`
          if (a > 3) {
            reponse = `${a}-\\pi`
            texteCorr = `On a : $\\pi - ${a}<0 $ donc $\\vert \\pi - ${a}\\vert = ${miseEnEvidence(reponse)}$.`
          } else {
            reponse = `\\pi - ${a}`
            texteCorr = `On a : $\\pi - ${a}>0 $ donc $\\vert \\pi - ${a}\\vert = ${miseEnEvidence(reponse)}$.`
          }

          break
        case 3:
        default:
          a = randint(2, 5)
          b = randint(2, 7, 4)
          c = Math.sqrt(b)

          texte = `$\\vert \\sqrt{${b}} - ${a}\\vert =$`

          if (c > a) {
            reponse = `\\sqrt{${b}} - ${a}`
            texteCorr = `On a : $${b} > ${a * a}$ donc $\\sqrt{${b}} > ${a}$ <br>
                        $\\sqrt{${b}}- ${a}$ est donc un nombre positif, il en resulte que  $\\vert \\sqrt{${b}} - ${a}\\vert = ${miseEnEvidence(reponse)}$.`
          } else {
            reponse = `${a}-\\sqrt{${b}}`
            texteCorr = `On a : $${b}< ${a * a}$ donc $\\sqrt{${b}} < ${a}$ <br>
                        $\\sqrt{${b}}- ${a}$ est donc un nombre négatif, il en resulte que  $\\vert \\sqrt{${b}} -${a}\\vert = ${miseEnEvidence(reponse)}$.`
          }

          break
      }
      texte += this.interactif
        ? ajouteChampTexteMathLive(this, i, KeyboardType.complexes)
        : ' $\\ldots$'
      handleAnswers(this, i, { reponse: { value: reponse } })
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
