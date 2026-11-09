import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
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

export const titre = 'Reconnaître un nombre relatif'

/**
 * @author Éric Elter
 */
export const uuid = '609bd'

export const refs = {
  'fr-fr': ['5N2A-1'],
  'fr-ch': ['9R1NO3B-2', '9R2NO3B-2', '9R3NO3B-2'],
}
export default class ReconnaitreRelatifs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3

    this.besoinFormulaireTexte = [
      'Signe devant le nombre',
      `Nombres séparés par des tirets :
    1 : Sans signe
    2 : +
    3 : -
    4 : Mélange`,
    ]
    this.sup = '4'

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
    let listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: String(this.sup).includes('-')
        ? this.sup.split('-').length
        : 3,
      listeOfCase: ['', '+', '-'],
    })
    listeTypeQuestions = combinaisonListes(listeTypeQuestions, this.nbQuestions)

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

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = 'Choisir la (ou les) bonne(s) réponse(s).'
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
        const signe = listeTypeQuestions[i]
        this.autoCorrection[i] = {}
        this.autoCorrection[i].enonce = `${texte}\n`
        this.autoCorrection[i].propositions = [
          {
            texte: `$${signe}${nbAffiche}$ est un nombre positif.`,
            statut: signe === '' || signe === '+',
            feedback:
              signe !== '' && signe !== '+' && signe !== '-'
                ? `Aucun nombre ne s'écrit avec le $${signe} devant la partie numérique : $${signe}${nbAffiche}$ n'est pas un nombre.`
                : '',
          },
          {
            texte: `$${signe}${nbAffiche}$ est un nombre négatif.`,
            statut: signe === '-',
            feedback:
              signe !== '' && signe !== '+' && signe !== '-'
                ? `Aucun nombre ne s'écrit avec le $${signe} devant la partie numérique : $${signe}${nbAffiche}$ n'est pas un nombre.`
                : '',
          },
          {
            texte: `$${signe}${nbAffiche}$ est un nombre relatif.`,
            statut: signe === '' || signe === '+' || signe === '-',
            feedback:
              signe !== '' && signe !== '+' && signe !== '-'
                ? `Aucun nombre ne s'écrit avec le $${signe} devant la partie numérique : $${signe}${nbAffiche}$ n'est pas un nombre.`
                : '',
          },
          {
            texte: `$${signe}${nbAffiche}$ n'est pas un nombre relatif.`,
            statut: signe !== '' && signe !== '+' && signe !== '-',
          },
        ]
        this.autoCorrection[i].options = {
          ordered: false,
          lastChoice: 5,
          vertical: true,
        }
        texteCorr = `Un nombre relatif est un nombre qui s'écrit avec une partie numérique précédée d'aucun signe ou du signe + (nombre positif) ou bien du signe - (nombre négatif).<br>`
        const props = propositionsQcm(this, i)
        texte += `<br>${props.texte}`
        texteCorr += `${props.texteCorr}`
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
