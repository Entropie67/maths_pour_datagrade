import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { range1 } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Trouver le tiers'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * Calculer le tiers d'un multiple de 3, d'un multiple de 300, d'un multiple de 30 ou d'un nombre a,b avec a et b multiples de 3
 * @author Rémi Angot

 */
export const uuid = '6a3de'

export const refs = {
  'fr-fr': ['6P3autoA-1', '6AutoP1'],
  'fr-2016': ['CM010'],
  'fr-ch': ['9R1FA1D-1', '9R2FA1D-1', '9R3FA1D-1'],
}
export default class Tiers extends Exercice {
  declare sup: number

  constructor() {
    super()

    this.consigne = 'Calculer.'

    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 1 // niveau de difficulté
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = range1(4)
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte = '', texteCorr = '', a = 0, b = 0, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case 1: // Table de 3
          a = randint(2, 9)
          texte = `$\\text{Le tiers de }${a * 3}$`
          texteCorr = `$\\text{Le tiers de }${a * 3} \\text{ est } ${miseEnEvidence(a)}$`
          handleAnswers(this, i, { reponse: { value: a } })
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
          )
          break
        case 2: // Table de 300
          a = randint(2, 9)
          texte = `$\\text{Le tiers de }${texNombre(a * 3 * 100)}$`
          texteCorr = `$\\text{Le tiers de }${texNombre(
            a * 3 * 100,
          )} \\text{ est } ${miseEnEvidence(texNombre(a * 100))}$`
          handleAnswers(this, i, { reponse: { value: a * 100 } })
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
          )
          break
        case 3: // Table de 30
          a = randint(2, 9)
          texte = `$\\text{Le tiers de }${texNombre(a * 3 * 10)}$`
          texteCorr = `$\\text{Le tiers de }${texNombre(
            a * 3 * 10,
          )} \\text{ est } ${miseEnEvidence(texNombre(a * 10))}$`
          handleAnswers(this, i, { reponse: { value: a * 10 } })
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
          )
          break
        case 4: // a,b avec a et b divisibles par 3
          a = randint(2, 9)
          b = randint(2, 9)
          texte = `$\\text{Le tiers de }${texNombre(a * 3 + (b * 3) / 100)}$`
          texteCorr = `$\\text{Le tiers de }${texNombre(
            a * 3 + (b * 3) / 100,
          )} \\text{ est } ${miseEnEvidence(texNombre(a + b / 100))}$`
          handleAnswers(this, i, { reponse: { value: a + b / 100 } })
          texte += ajouteChampTexteMathLive(this, i)
          break
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté',3];
}
