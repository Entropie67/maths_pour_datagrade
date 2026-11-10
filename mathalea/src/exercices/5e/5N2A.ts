import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '26/07/2026'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = 'Définir les nombres relatifs'

/**
 * @author Éric Elter
 */

export const uuid = '404b0'

export const refs = {
  'fr-fr': ['5N2A'],
  'fr-ch': ['9R1NO3B-1', '9R2NO3B-1', '9R3NO3B-1'],
}
export default class DefinirRelatifs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.consigne = 'Choisir la bonne réponse.'
    this.besoinFormulaireNumerique = [
      'Signe du premier nombre',
      3,
      'Positif\nNégatif\nMélange',
    ]
    this.sup = 3

    this.besoinFormulaire2Texte = [
      'Type de nombres',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entiers',
        '2 : Décimaux',
        '3 : Fractionnaires',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = '4'
  }

  nouvelleVersion() {
    let typesDeNombres = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: String(this.sup).includes('-')
        ? this.sup.split('-').length
        : 3,
    }).map(Number)
    typesDeNombres = combinaisonListes(typesDeNombres)

    let choixPrecedent = ''
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const a = arrondi(
        randint(1, 50, [10, 20, 30, 40, 50]) /
          (typesDeNombres[i] === 1 ? 1 : 10),
      )

      let numerateur = randint(1, 19, 10)
      let denominateur = randint(1, 19, 10)
      while (new FractionEtendue(numerateur, denominateur).estEntiere) {
        numerateur = randint(1, 19, 10)
        denominateur = randint(1, 19, 10)
      }
      const nbAffiche =
        typesDeNombres[i] === 3
          ? new FractionEtendue(numerateur, denominateur).texFractionSimplifiee
          : texNombre(a)
      if (this.questionJamaisPosee(i, nbAffiche)) {
        const signe =
          this.sup === 1
            ? '+'
            : this.sup === 2
              ? '-'
              : choice(['+', '-'], choixPrecedent)
        choixPrecedent = signe
        const signeOppose = choice(['+', '-'], signe)
        texte = `$${signe}${nbAffiche}$ est un nombre relatif car il existe $${signeOppose}${nbAffiche}$ tel que : `
        const bonneReponse = `(${signe}${nbAffiche})+(${signeOppose}${nbAffiche})=0`
        texteCorr =
          'Un nombre relatif est un nombre dont la somme avec son opposé est égale à $0$ donc  '
        texteCorr += `$${miseEnEvidence(bonneReponse)}$.`
        let propositionsFausses = [
          {
            texte: `$(${signe}${nbAffiche})\\div(${signeOppose}${nbAffiche})=-1$`,
            statut: false,
          },
          {
            texte: `$(${signe}${nbAffiche})-(${signeOppose}${nbAffiche})=0$`,
            statut: false,
          },
          {
            texte: `$(${signe}${nbAffiche})\\div(${signeOppose}${nbAffiche})=1$`,
            statut: false,
          },
          {
            texte: `$(-${nbAffiche})+(-${nbAffiche})=0$`,
            statut: false,
          },
          {
            texte: `$(+${nbAffiche})+(+${nbAffiche})=0$`,
            statut: false,
          },
        ]
        propositionsFausses = combinaisonListes(
          propositionsFausses,
          propositionsFausses.length,
        )
        this.autoCorrection[i] = {}
        this.autoCorrection[i].enonce = `${texte}\n`
        this.autoCorrection[i].propositions = [
          {
            texte: `$${bonneReponse}$`,
            statut: true,
          },
        ]
        this.autoCorrection[i].propositions?.push(propositionsFausses[0])
        this.autoCorrection[i].propositions?.push(propositionsFausses[1])
        this.autoCorrection[i].propositions?.push(propositionsFausses[2])
        this.autoCorrection[i].options = {
          ordered: false,
          radio: true,
        }
        const props = propositionsQcm(this, i)
        texte += `<br>${props.texte}`
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
