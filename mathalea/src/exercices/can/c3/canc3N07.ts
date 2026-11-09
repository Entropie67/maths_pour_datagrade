import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { handleAnswers } from '../../../lib/interactif/gestionInteractif'

export const titre = 'Décomposer un nombre'
export const interactifReady = true

export const dateDePublication = '25/01/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '26/10/2024'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = 'ba5d4'

export const refs = {
  'fr-fr': ['canc3N07'],
  'fr-ch': [],
}
export default class DecompositionNombre extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.consigne = 'Compléter.'
    let texte, texteCorr, c, d, u, n, um
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (
        choice([1, 2]) // 2
      ) {
        case 1:
          u = randint(1, 9)
          d = randint(1, 9)
          c = randint(1, 9)
          n = c * 100 + d * 10 + u
          if (choice([true, false])) {
            if (this.interactif) {
              texte = remplisLesBlancs(
                this,
                i,
                `${texNombre(n)}= \\, %{champ1}  \\text{ centaine(s) }  \\, %{champ2}\\, \\text{ unité(s)}`,
                KeyboardType.clavierDeBase,
              )
              handleAnswers(this, i, {
                bareme: (listePoints) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: c },
                champ2: { value: d * 10 + u },
              })
            } else {
              texte = `$${n}=\\ldots$ centaine(s)  $\\ldots$ unité(s)`
            }
            texteCorr = `Comme $${texNombre(n)}= ${c} \\times 100 +  ${d * 10 + u} \\times 1$, alors $${texNombre(n)}= ${miseEnEvidence(c)}$  ${c === 1 ? 'centaine' : 'centaines'} $${miseEnEvidence(d * 10 + u)}$ unités. `
            this.canEnonce = 'Compléter.'
            this.canReponseACompleter = `$${n}=\\ldots$ centaine(s)  $\\ldots$ unité(s)`
          } else {
            if (this.interactif) {
              texte = remplisLesBlancs(
                this,
                i,
                `${texNombre(n)}= \\, %{champ1}  \\text{ dizaine(s) }  \\, %{champ2}\\, \\text{ unité(s)}`,
                KeyboardType.clavierDeBase,
              )
              handleAnswers(this, i, {
                bareme: (listePoints) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: c * 10 + d },
                champ2: { value: u },
              })
            } else {
              texte = `$${n}=\\ldots$ dizaine(s)  $\\ldots$ unité(s)`
            }
            texteCorr = `Comme $${texNombre(n)}= ${c * 10 + d} \\times 10 +  ${u} \\times 1$, alors $${texNombre(n)}= ${miseEnEvidence(c * 10 + d)}$   dizaines  $${miseEnEvidence(u)}$ ${u === 1 ? 'unité.' : 'unités.'} `
            this.canEnonce = 'Compléter.'
            this.canReponseACompleter = `$${texNombre(n)}=\\ldots$ dizaine(s)  $\\ldots$ unité(s)`
          }
          break
        case 2:
        default:
          um = randint(1, 9)
          u = randint(1, 9)
          d = randint(1, 9)
          c = randint(1, 9)
          n = um * 1000 + c * 100 + d * 10 + u

          if (choice([true, false])) {
            if (this.interactif) {
              texte = remplisLesBlancs(
                this,
                i,
                `${texNombre(n)}= \\, %{champ1}  \\text{ centaine(s) }  \\, %{champ2}\\, \\text{ unité(s)}`,
                KeyboardType.clavierDeBase,
              )
              handleAnswers(this, i, {
                bareme: (listePoints) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: um * 10 + c },
                champ2: { value: d * 10 + u },
              })
            } else {
              texte = `$${texNombre(n)}=\\ldots$ centaine(s)  $\\ldots$ unité(s)`
            }
            texteCorr = `Comme $${texNombre(n)}=  ${um * 10 + c} \\times 100 +  ${d * 10 + u} \\times 1$, alors $${texNombre(n)}= ${miseEnEvidence(um * 10 + c)}$  centaines $${miseEnEvidence(d * 10 + u)}$ unités. `
            this.canEnonce = 'Compléter.'
            this.canReponseACompleter = `$${texNombre(n)}=\\ldots$ centaine(s)  $\\ldots$ unité(s)`
          } else {
            if (this.interactif) {
              texte = remplisLesBlancs(
                this,
                i,
                `${texNombre(n)}= \\, %{champ1}  \\text{ dizaine(s) }  \\, %{champ2}\\, \\text{ unité(s)}`,
                KeyboardType.clavierDeBase,
              )
              handleAnswers(this, i, {
                bareme: (listePoints) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: um * 100 + c * 10 + d },
                champ2: { value: u },
              })
            } else {
              texte = `$${texNombre(n)}=\\ldots$ dizaine(s)  $\\ldots$ unité(s)`
            }
            texteCorr = `Comme $${texNombre(n)}=  ${um * 100 + c * 10 + d} \\times 10 +  ${u} \\times 1$, alors $${texNombre(n)}= ${miseEnEvidence(um * 100 + c * 10 + d)}$  dizaines $${miseEnEvidence(u)}$ ${u === 1 ? 'unité.' : 'unités.'} `
            this.canEnonce = 'Compléter.'
            this.canReponseACompleter = `$${texNombre(n)}=\\ldots$ dizaine(s)  $\\ldots$ unité(s)`
          }
          break
      }

      if (this.questionJamaisPosee(i, n)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
