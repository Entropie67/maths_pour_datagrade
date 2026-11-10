import { glisseNombre } from '../../lib/2d/GlisseNombre'
import { lampeMessage } from '../../lib/format/message'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { range, rangeMinMax } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre =
  'Par combien diviser un nombre pour que le chiffre des unités devienne le chiffre des ...'

// Gestion de la date de publication initiale
export const dateDePublication = '04/11/2021'

/**
 * Presentation didactique : Par combien diviser un nombre pour que le chiffre des unités devienne le chiffre des ...
 * @author Éric Elter (inspiré par Aude Duvold)

 */
export const uuid = '85989'

export const refs = {
  'fr-fr': ['6N2C-2', '6AutoN4-4'],
  'fr-2016': ['6C30-7'],
  'fr-ch': ['PR-23', '9R1NO6F-7', '9R2NO6F-7', '9R3NO6F-7'],
}
export default class DiviserUnNombreParPuissanceDeDix extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Les nombres-exemples sont entiers',
      false,
    ]
    this.besoinFormulaire2CaseACocher = [
      'Exercice avec un raisonnement associé',
      true,
    ]
    this.besoinFormulaire3CaseACocher = [
      'Afficher le glisse-nombre dans la correction',
      true,
    ]
    this.nbQuestions = 5 // Ici le nombre de questions
    this.sup = false
    this.sup2 = true
    this.sup3 = true
  }

  nouvelleVersion() {
    const choixUnites = ['millièmes', 'centièmes', 'dixièmes']
    let listeChoixAlea = range(2)
    if (!this.sup2 || this.interactif) {
      this.nbQuestions = Math.min(this.nbQuestions, 3)
    }
    if (context.isAmc) {
      this.sup2 = false
    }
    if (this.interactif) {
      this.introduction = lampeMessage({
        titre: 'Aucun raisonnement écrit ne vous est demandé.',
        texte:
          ' Vous pouvez, tout de même, le faire au brouillon sur un exemple avant de choisir une réponse en ligne.',
        couleur: 'nombres',
      })
    } else {
      this.introduction = lampeMessage({
        titre: 'Bien lire les consignes.',
        texte: '',
        couleur: 'nombres',
      })
    }
    listeChoixAlea = combinaisonListes(listeChoixAlea, this.nbQuestions)
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const choixAlea = listeChoixAlea[0]
      listeChoixAlea.splice(0, 1)
      const centaine = randint(0, 1) === 0 ? choice(rangeMinMax(0, 9)) : 0
      const dizaine = choice(rangeMinMax(0, 9), [centaine])
      const unite = choice(rangeMinMax(0, 9), [centaine, dizaine])
      const dixieme = this.sup
        ? 0
        : choice(rangeMinMax(0, 9), [centaine, dizaine, unite])
      const centieme =
        randint(0, 1) !== 0 || this.sup
          ? 0
          : choice(rangeMinMax(0, 9), [centaine, dizaine, unite, dixieme])
      const exemple =
        centaine * 100 + dizaine * 10 + unite + dixieme / 10 + centieme / 100
      if (this.sup2 && !this.interactif) {
        texte = `Voici un nombre : $${texNombre(exemple, 2)}$.<br>`
        texte += `${numAlpha(0)} Entourer le chiffre des unités de ce nombre.<br>`
        texte += `${numAlpha(1)} Compléter les phrases suivantes.<br>`
        texte += `Diviser $${texNombre(exemple, 2)}$ par $${texNombre(10 ** (3 - choixAlea), 0)}$, c'est trouver le nombre $\\ldots\\ldots\\ldots$ fois plus $\\ldots\\ldots\\ldots$ que $${texNombre(exemple, 2)}$.<br>`
        texte += `Le chiffre des unités de $${texNombre(exemple, 2)}$ devient, alors, le chiffre des $\\ldots\\ldots\\ldots\\ldots\\ldots$ et donc $${texNombre(exemple, 2)} \\div ${texNombre(10 ** (3 - choixAlea), 0)} =\\ldots\\ldots\\ldots\\ldots$<br>`

        texteCorr = `${numAlpha(0)} $${unite}$ est le chiffre des unités de $${texNombre(exemple, 2)}$.<br>`
        texteCorr += `${numAlpha(1)} Diviser $${texNombre(exemple, 2)}$ par $${texNombre(10 ** (3 - choixAlea), 0)}$, c'est trouver le nombre $${miseEnEvidence(texNombre(10 ** (3 - choixAlea), 0))}$ fois plus ${texteEnCouleurEtGras('petit')} `
        texteCorr += `que $${texNombre(exemple, 2)}$.<br>`
        texteCorr += `Le chiffre des unités de $${texNombre(exemple, 2)}$ devient, alors, le chiffre des ${texteEnCouleurEtGras(choixUnites[choixAlea])} et donc $${texNombre(exemple, 2)} \\div ${texNombre(10 ** (3 - choixAlea), 0)} = ${miseEnEvidence(texNombre(exemple * 10 ** (choixAlea - 3), 5))}$.<br>`
      } else {
        texte = `Par combien diviser un nombre pour que tous ses chiffres changent de position et que le chiffre des unités devienne le chiffre des ${choixUnites[choixAlea]} ?`

        texteCorr = `Prenons un exemple : $${texNombre(exemple, 2)}$.<br>`
        texteCorr += `$${texNombre(exemple, 2)} \\div ${texNombre(10 ** (3 - choixAlea), 0)} = ${texNombre(exemple * 10 ** (choixAlea - 3), 0)}$<br>`
        texteCorr += `Si on veut que son chiffre des ${texteEnCouleurEtGras('unités')} devienne le chiffre des ${texteEnCouleurEtGras(choixUnites[choixAlea])}, on doit diviser le nombre par $${miseEnEvidence(texNombre(10 ** (3 - choixAlea), 0))}$.`
      }
      const aleaFaux = range(6, [3, choixAlea])
      // enleveElement(aleaFaux) cette commande est incomplète on ne sait pas quel item enlever par conséquent je la supprime ! Jean-claude Lhote le 25/03-2024
      const choixAleaFaux = []
      for (let kk = 0; kk < 4; kk++) {
        choixAleaFaux.push(texNombre(10 ** (3 - aleaFaux[kk]), 0))
      }
      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: `$${texNombre(10 ** (3 - choixAlea), 0)}$`,
          statut: true,
        },
        {
          texte: `$${choixAleaFaux[0]}$`,
          statut: false,
        },
        {
          texte: `$${choixAleaFaux[1]}$`,
          statut: false,
        },
      ]
      this.autoCorrection[i].options = {
        ordered: false,
        lastChoice: 4,
      }
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += '<br>' + props.texte
      }
      if (context.isHtml && this.sup3)
        texteCorr += mathalea2d(
          { xmin: 2.5, xmax: 27.5, ymin: -5, ymax: 5.5 },
          glisseNombre(exemple, choixAlea - 3),
        )

      if (
        this.questionJamaisPosee(i, dizaine, centaine, unite, dixieme, centieme)
      ) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
