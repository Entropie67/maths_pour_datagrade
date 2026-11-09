import { propositionsQcm } from '../../../lib/interactif/qcm'
import { enleveElement, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Trouver la bonne unité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 * MAJ en décembre 2025 par Mireille Gain pour augmenter le nombre de cas

 */
export const uuid = 'ac56a'

export const refs = {
  'fr-fr': ['can6M4-01', 'CM1M1C'],
  'fr-ch': [],
}
export default class LaBonneUnite extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const hauteurs = [
      ["d'une chaise", 75, 115, 'cm'],
      ["d'une grue de chantier", 20, 60, 'm'],
      ["d'un gratte-ciel", 50, 180, 'm'],
      ["d'une girafe", 40, 50, 'dm'],
      ["d'une colline", 75, 150, 'm'],
      ["d'une maison", 30, 90, 'dm'],
      ["d'une poule", 15, 50, 'cm'],
    ]

    const longueurs = [
      ['stade de football', 100, 110, 'm'],
      ['crayon', 15, 20, 'cm'],
      ["tronçon d'autoroute", 100, 500, 'km'],
      ['camion', 7, 20, 'm'],
      ['doigt', 30, 90, 'mm'],
      ['livre de poche', 15, 20, 'cm'],
      ['fleuve', 200, 6992, 'km'],
      ['écran de téléphone', 10, 18, 'cm'],
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const choixType = randint(0, 1) // 0 pour hauteur, 1 pour longueur
      let liste: [string, number, number, string][]
      let typeObjet: string
      if (choixType === 0) {
        liste = hauteurs.slice(0) as [string, number, number, string][]
        typeObjet = 'hauteur '
      } else {
        liste = longueurs.slice(0) as [string, number, number, string][]
        typeObjet = "longueur d'un"
      }
      const nbChoix = liste.length
      const unites = shuffle(['mm', 'cm', 'dm', 'm', 'km'])
      const a = randint(0, nbChoix - 1)
      const b = randint(liste[a][1] as number, liste[a][2] as number)
      enleveElement(unites, liste[a][3])
      let texte = `Choisir parmi les propositions suivantes la ${typeObjet} ${liste[a][0]}.<br>`
      this.canEnonce = texte
      this.autoCorrection[i] = {
        enonce: texte,
        propositions: [
          {
            texte: `$${texNombre(b)}\\,\\text{${liste[a][3]}}$`,
            statut: true,
          },
          {
            texte: `$${texNombre(b)}\\,\\text{${unites[0]}}$`,
            statut: false,
          },
          {
            texte: `$${texNombre(b)}\\,\\text{${unites[1]}}$`,
            statut: false,
          },
          {
            texte: `$${texNombre(b)}\\,\\text{${unites[2]}}$`,
            statut: false,
          },
        ],
      }
      const monQcm = propositionsQcm(this, i)
      if (!context.isAmc) {
        texte += monQcm.texte
      }
      const texteCorr = `La ${typeObjet} ${liste[a][0]} est $${miseEnEvidence(texNombre(b))}$ ${texteEnCouleurEtGras(liste[a][3])}.`
      if (this.questionJamaisPosee(i, a, b, choixType)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(monQcm.texte)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
