import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Quotient de deux entiers relatifs'
export const interactifReady = true

/**
 * Effectuer une division entre 2 nombres relatifs écrite sous la forme d'une fraction.
 *
 * * On peut choisir de n'avoir que des tables de multiplication, par défaut il y a aussi des divisions simples par 2, 3 ou 4
 * @author Rémi Angot
 */
export const uuid = 'cdcc1'

export const refs = {
  'fr-fr': ['4C10-4'],
  'fr-ch': ['10LCNO2C-3', '10LSNO2C-3', '11CTNO1B-3', 'PRQNO06B-11'],
}
export default class ExerciceQuotientsRelatifs extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Utiliser seulement les tables de multiplication de 2 à 9',
    ]

    this.sup = false

    this.consigne = 'Calculer.'
    this.spacing = 2
    this.nbQuestions = 6
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = combinaisonListes(
      ['-+', '+-', '--', '++'],
      this.nbQuestions,
    )
    let typesDeNombres = combinaisonListes(
      ['tables', 'horstables'],
      this.nbQuestions,
    )
    if (this.sup) {
      typesDeNombres = combinaisonListes(['tables'], this.nbQuestions)
    }
    for (
      let i = 0, a, b, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      if (typesDeNombres[i] === 'tables') {
        b = randint(2, 9)
        a = b * randint(2, 9)
      } else {
        b = choice([11, 12, 13, 14, 15, 16, 20, 60, 80])
        a = b * randint(2, 4)
      }
      switch (listeTypeDeQuestions[i]) {
        case '-+':
          a *= -1
          break
        case '+-':
          b *= -1
          break
        case '--':
          a *= -1
          b *= -1
          break
      }
      texte = `$\\dfrac{${a}}{${b}}$`
      texteCorr = `$\\dfrac{${a}}{${b}}=${miseEnEvidence(arrondi(a / b))}$`
      handleAnswers(this, i, { reponse: { value: arrondi(a / b) } })
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
        texteAvant: '=',
      })

      if (this.questionJamaisPosee(i, a, b)) {
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
