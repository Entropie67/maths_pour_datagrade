import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '20/07/2026'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre =
  'Savoir que pour compléter une addition à trou, on utilise une soustraction'

/**
 * @author Éric Elter
 */
export const uuid = '503dd'

export const refs = {
  'fr-fr': ['5N2autoB'],
  'fr-ch': ['NR'],
}
export default class CompleterUneAdditionATrou extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireNumerique = [
      'Type de nombres',
      3,
      'Petits nombres\nGrands nombres\nMélange',
    ]
    this.sup = 1

    this.besoinFormulaire2Texte = [
      "Type d'égalité",
      [
        'Nombres séparés par des tirets :',
        '1 : Terme connu à gauche et somme à droite',
        '2 : Terme connu à droite et somme à droite',
        '3 : Terme connu à gauche et somme à gauche',
        '4 : Terme connu à droite et somme à gauche',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = '5'

    this.besoinFormulaire3CaseACocher = ['Nombres entiers', true]
    this.sup3 = false
  }

  nouvelleVersion() {
    this.consigne =
      "Choisir l'opération qui permet de trouver le nombre manquant dans "
    this.consigne +=
      this.nbQuestions > 1
        ? 'chacune de ces additions à trou.'
        : 'cette addition à trou.'
    const typesDEgalitesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: String(this.sup).includes('-')
        ? this.sup.split('-').length
        : 5,
    }).map(Number)

    const typesDEgalites = combinaisonListes(
      typesDEgalitesDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const choixa = [
        randint(3, 20),
        randint(1, 9) * 100 + randint(4, 9) * 10 + randint(7, 9),
      ]
      const choixb = [
        randint(3, 20),
        randint(1, 9) * 100 + randint(4, 9) * 10 + randint(7, 9),
      ]
      let a = this.sup === 3 ? choice(choixa) : choixa[this.sup - 1]
      let b = this.sup === 3 ? choice(choixb) : choixb[this.sup - 1]
      if (!this.sup3) {
        a = arrondi(a / choice([10, 100]))
        b = arrondi(b / choice([10, 100]))
      }

      if (this.questionJamaisPosee(i, a, b)) {
        const c = arrondi(a + b)
        switch (typesDEgalites[i]) {
          case 1:
            texte = `$${texNombre(a)}+\\ldots\\ldots=${texNombre(c)}$`
            break
          case 2:
            texte = `$\\ldots\\ldots+${texNombre(a)}=${texNombre(c)}$`
            break
          case 3:
            texte = `$${texNombre(c)}=${texNombre(a)}+\\ldots\\ldots$`
            break
          case 4:
          default:
            texte = `$${texNombre(c)}=\\ldots\\ldots+${texNombre(a)}$`
            break
        }
        const bonneReponse = `${texNombre(c)}-${texNombre(a)}`
        texteCorr =
          'Dans une addition à trou, le terme à trouver est toujours issu de la différence entre la somme et le terme connu : '
        texteCorr += `$${miseEnEvidence(bonneReponse)}$.`
        this.autoCorrection[i] = {}
        this.autoCorrection[i].enonce = `${texte}\n`
        this.autoCorrection[i].propositions = [
          {
            texte: `$${bonneReponse}$`,
            statut: true,
          },
          {
            texte: `$${texNombre(a)}-${texNombre(c)}$`,
            statut: false,
            feedback: "C'est bien une soustraction mais pas dans ce sens-là.",
          },
          {
            texte: `$${texNombre(c)}+${texNombre(a)}$`,
            statut: false,
            feedback:
              'Une addition ne sert pas à trouver, dans cette addition à trou, le nombre manquant.',
          },
          {
            texte: `$${texNombre(c)}\\div${texNombre(a)}$`,
            statut: false,
            feedback:
              'Une division ne sert pas à trouver, dans cette addition à trou, le nombre manquant.',
          },
        ]
        this.autoCorrection[i].options = {
          ordered: false,
          lastChoice: 5,
        }
        const props = propositionsQcm(this, i)
        texte += `<br>${props.texte}`
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
