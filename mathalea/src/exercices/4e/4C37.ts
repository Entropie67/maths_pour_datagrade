import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const amcReady = true
export const amcType = 'qcmMono'
export const titre = "Déterminer le signe d'une puissance"
export const interactifReady = true

export const dateDePublication = '30/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Déterminer le signe d'une puissance, on choisira la possibilité d'avoir un nombre positif ou négatif et un
 * exposant positif ou négatif
 * @author Delphine David
 */
export const uuid = '67432'

export const refs = {
  'fr-fr': ['4C37'],
  'fr-ch': ['10LCNO4A-3', '10LSNO4A-3'],
}
export default class SignePuissance extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5

    this.interactif = false
  }

  nouvelleVersion() {
    this.consigne = 'Déterminer le signe '
    this.consigne +=
      this.nbQuestions > 1
        ? 'des expressions suivantes.'
        : "de l'expression suivante."

    let listeTypeDeQuestions = ['a^n', '-a^n', '(-a)^n', '-(-a)^n']
    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    let a = 0
    let n = 0
    for (
      let i = 0, texte, texteCorr, monQcm, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case 'a^n':
          a = randint(2, 9)
          n = randint(-9, 9, [-1, 0, 1])
          texte = `$${a}^{${n}}$`
          texteCorr = `$${a}^{${n}}$ est ${texteEnCouleurEtGras('positif')} car $${a}$ est positif.`
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: 'Positif',
              statut: true,
            },
            {
              texte: 'Négatif',
              statut: false,
            },
          ]
          break
        case '-a^n':
          a = randint(2, 9)
          n = 2 * randint(1, 4) // permet de n'avoir que des exposant positif, cas intéressant ici
          texte = `$-${a}^{${n}}$`
          texteCorr = `$-${a}^{${n}}$ est ${texteEnCouleurEtGras('négatif')} car c'est l'opposé de $${a}^{${n}}$ qui est positif. Attention, il n'y a pas de parenthèses autour de $-${a}$.`
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: 'Positif',
              statut: false,
            },
            {
              texte: 'Négatif',
              statut: true,
            },
          ]
          break
        case '(-a)^n':
          a = randint(2, 9)
          n = randint(-9, 9, [-1, 0, 1])
          texte = `$(-${a})^{${n}}$`
          if (n % 2 === 0) {
            texteCorr = `$(-${a})^{${n}}$ est ${texteEnCouleurEtGras('positif')} car l'exposant est pair.`
            this.autoCorrection[i] = {}
            this.autoCorrection[i].enonce = `${texte}\n`
            this.autoCorrection[i].propositions = [
              {
                texte: 'Positif',
                statut: true,
              },
              {
                texte: 'Négatif',
                statut: false,
              },
            ]
          } else {
            texteCorr = `$(-${a})^{${n}}$ est ${texteEnCouleurEtGras('négatif')} car l'exposant est impair et -${a} est négatif.`
            this.autoCorrection[i] = {}
            this.autoCorrection[i].enonce = `${texte}\n`
            this.autoCorrection[i].propositions = [
              {
                texte: 'Positif',
                statut: false,
              },
              {
                texte: 'Négatif',
                statut: true,
              },
            ]
          }
          break
        case '-(-a)^n':
        default:
          a = randint(2, 9)
          n = randint(-9, 9, [-1, 0, 1])
          texte = `$-(-${a})^{${n}}$`
          if (n % 2 === 0) {
            texteCorr = `$-(-${a})^{${n}}$ est ${texteEnCouleurEtGras('négatif')}. L'exposant est pair donc $(-${a})^{${n}}$ est positif et son opposé est négatif.`
            this.autoCorrection[i] = {}
            this.autoCorrection[i].enonce = `${texte}\n`
            this.autoCorrection[i].propositions = [
              {
                texte: 'Positif',
                statut: false,
              },
              {
                texte: 'Négatif',
                statut: true,
              },
            ]
          } else {
            texteCorr = `$-(-${a})^{${n}}$ est ${texteEnCouleurEtGras('positif')}. L'exposant est impair et -${a} est négatif donc $(-${a})^{${n}}$ est négatif et son opposé est positif.`
            this.autoCorrection[i] = {}
            this.autoCorrection[i].enonce = `${texte}\n`
            this.autoCorrection[i].propositions = [
              {
                texte: 'Positif',
                statut: true,
              },
              {
                texte: 'Négatif',
                statut: false,
              },
            ]
          }
          break
      }
      this.autoCorrection[i].options = { ordered: true }
      monQcm = propositionsQcm(this, i)
      if (this.questionJamaisPosee(i, a, n)) {
        this.listeQuestions[i] = texte + monQcm.texte
        this.listeCorrections[i] = texteCorr
        this.listeCanReponsesACompleter[i] = monQcm.texte
        this.listeCanEnonces[i] = 'Quel est le signe de ' + texte + '?'
        this.correction = this.listeCorrections[i]
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
