import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenomF } from '../../lib/outils/Personne'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des problèmes de prix'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDePublication = '26/05/2025'

/**
 *
 * @author Mickael Guironnet
 */
export const uuid = 'a1378'

export const refs = {
  'fr-fr': ['6N5-7', '5N1D-3'],
  'fr-2016': ['6C12-7'],
  'fr-ch': ['9R1NO7E-5', '9R2NO7E-5', '9R3NO7E-5', 'PRQST02B-11', 'PRQNO15A-5'],
}
export default class ProblemesAvec4Opérations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = 3
    this.besoinFormulaireTexte = [
      'Type de problèmes',
      `Nombres séparés par des tirets :
  1 : Pains et tartelettes
  2 : Cahiers et stylos
  3 : Mélange`,
    ]
    this.besoinFormulaire2Numerique = [
      'Précision des prix',
      4,
      '1 : Au dixième\n2 : Au centième\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne = 'Résoudre '
    this.consigne +=
      this.nbQuestions > 1 ? 'les problèmes suivants.' : 'le problème suivant.'
    const typesDeQuestions = gestionnaireFormulaireTexte({
      max: 2,
      defaut: 1,
      melange: 3,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })
    const precisions = gestionnaireFormulaireTexte({
      max: 2,
      defaut: 1,
      melange: 3,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
    })
    for (
      let i = 0, texte, texteCorr, prixTartelettes, prixPains, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const n = precisions[i] as number
      switch (
        typesDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 1: {
          prixPains =
            randint(0, 1) +
            (n > 0 ? randint(1, 9) * 0.1 : 0) +
            (n > 1 ? choice([0, 5]) * 0.01 : 0)
          const quantitéPains = randint(2, 5)
          prixTartelettes =
            randint(1, 2) +
            (n > 0 ? randint(1, 9) * 0.1 : 0) +
            (n > 1 ? choice([0, 5, 9]) * 0.01 : 0)
          const quantitéTartelettes = randint(2, 9, [quantitéPains])
          const prix =
            prixPains * quantitéPains + prixTartelettes * quantitéTartelettes
          texte = `${prenomF()} achète à la boulangerie $${quantitéPains}$ pains à $${texPrix(prixPains)}$ € et $${quantitéTartelettes}$ tartelettes. Elle paie $${texPrix(prix)}$ €. Quel est le prix d'une tartelette ?<br>`
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                  texteApres: ' €',
                }) + '<br>'
              : ''
          texteCorr = `Les pains coûtent $${quantitéPains} \\times ${texPrix(prixPains)} = ${texPrix(quantitéPains * prixPains)}$ €.<br>`
          texteCorr += `On soustrait au prix total $${texNombre(prix)} - ${texPrix(prixPains * quantitéPains)} = ${texPrix(prix - quantitéPains * prixPains)}$ €.<br>`
          texteCorr += `On divise par le nombre de tartelettes $${texPrix(prix - quantitéPains * prixPains)} \\div ${quantitéTartelettes} = ${texPrix((prix - quantitéPains * prixPains) / quantitéTartelettes)}$<br>`
          texteCorr +=
            "Donc le prix d'une tartelette est " +
            `$${miseEnEvidence(texPrix(prixTartelettes))}$ €.`
          handleAnswers(this, i, { reponse: { value: prixTartelettes } })
          break
        }
        case 2: {
          prixPains =
            1 +
            (n > 0 ? randint(1, 9) * 0.1 : 0) +
            (n > 1 ? choice([0, 4, 5, 9]) * 0.01 : 0)
          const quantitéPains = randint(2, 5)
          prixTartelettes =
            randint(1, 2) +
            (n > 0 ? randint(1, 9) * 0.1 : 0) +
            (n > 1 ? choice([0, 5, 9]) * 0.01 : 0)
          const quantitéTartelettes = randint(2, 9, [quantitéPains])
          const prix =
            prixPains * quantitéPains + prixTartelettes * quantitéTartelettes
          texte = `${prenomF()} achète $${quantitéPains}$ cahiers à $${texPrix(prixPains)}$ € et $${quantitéTartelettes}$ stylos au même prix chacun. Elle paie $${texPrix(prix)}$ €. Quel est le prix d'un stylo ?<br>`
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                  texteApres: ' €',
                }) + '<br>'
              : ''
          texteCorr = `Les cahiers coûtent $${quantitéPains} \\times ${texPrix(prixPains)} = ${texPrix(quantitéPains * prixPains)}$ €.<br>`
          texteCorr += `On soustrait au prix total $${texPrix(prix)} - ${texPrix(prixPains * quantitéPains)} = ${texPrix(prix - quantitéPains * prixPains)}$ €.<br>`
          texteCorr += `On divise par le nombre de stylos $${texPrix(prix - quantitéPains * prixPains)} \\div ${quantitéTartelettes} = ${texPrix((prix - quantitéPains * prixPains) / quantitéTartelettes)}$ €.<br>`
          texteCorr +=
            "Donc le prix d'un stylo est " +
            `$${miseEnEvidence(texPrix(prixTartelettes))}$ €.`
          handleAnswers(this, i, { reponse: { value: prixTartelettes } })
          break
        }
      }
      if (this.questionJamaisPosee(i, prixPains ?? '', prixTartelettes ?? '')) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte ?? ''
        this.listeCorrections[i] = texteCorr ?? ''
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
