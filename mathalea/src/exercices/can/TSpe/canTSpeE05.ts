import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { ecritureAlgebriqueSauf1, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Déterminer un vecteur normal à un plan donné par une équation cartésienne'
export const dateDePublication = '28/01/2025'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon
 */

export const uuid = '0cd98'
export const refs = {
  'fr-fr': ['canTSpeE05'],
  'fr-ch': ['3G99-5'],
}

export default class VecteurNormalPlan extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const a = randint(-10, 10, 0)
      const b = randint(-10, 10, 0)
      const c = randint(-10, 10, 0)
      const d = randint(-10, 10)

      texte = ` Dans un repère orthonormé de l'espace $\\big(O ; \\vec \\imath,\\vec \\jmath, \\vec k\\big)$, on donne une équation cartésienne d'un plan $\\mathcal{P}$ : <br> $\\mathcal{P}~:~${rienSi1(a)}x ${ecritureAlgebriqueSauf1(b)}y${ecritureAlgebriqueSauf1(c)}z${ecritureAlgebriqueSauf1(d)}=0$.<br>`
      texte += "<br>Donner les coordonnées d'un vecteur normal à $\\mathcal{P}$"

      if (this.interactif) {
        texte +=
          ': ' +
          remplisLesBlancs(
            this,
            i,
            '\\vec{n}(%{champ1}~;~%{champ2}~;~%{champ3}).',
          )
      } else texte += '.'
      handleAnswers(this, i, {
        champ1: { value: a },
        champ2: { value: b },
        champ3: { value: c },
      })
      texteCorr =
        "On sait qu'un plan dont l'équation cartésienne est donnée par $ax+by+cz+d=0$,<br> (avec $a,b,c,d$ des réels) admet le vecteur $\\vec{n}\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ comme vecteur normal.<br>"
      texteCorr += `Il vient : $\\vec{n}\\begin{pmatrix}${miseEnEvidence(a)}\\\\${miseEnEvidence(b)}\\\\${miseEnEvidence(c)}\\end{pmatrix}$.<br>`
      texteCorr +=
        'Tout vecteur colinéaire à $\\vec{n}$ est aussi normal au plan $\\mathcal{P}$'
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
