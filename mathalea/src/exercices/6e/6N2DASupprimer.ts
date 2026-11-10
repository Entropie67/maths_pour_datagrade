import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDansLaPartieEntiere,
} from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'
export const titre =
  'Calculer le produit de deux décimaux connaissant le produit de deux entiers'

/**
 * * Calculer le produit de deux décimaux à partir d'un produit de deux entiers
 * * 6C30-2
 * @author Sébastien Lozano
 */

export const uuid = '625c0'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6C30-2'],
  'fr-ch': ['PR-26'],
}
export default class ProduitDeDecimauxAPartirProduitConnuASupprimer extends Exercice {
  constructor() {
    super()
    this.sup = 1
    this.nbQuestions = 3

    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = shuffle([0, 1, 2])

    let reponse
    // let listeTypeDeQuestions  = combinaisonListes(typesDeQuestionsDisponibles,this.nbQuestions) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées --> à remettre comme ci-dessus

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // pour les situations, autant de situations que de cas dans le switch !
      this.autoCorrection[i] = {}
      const situations = [
        {
          // case 0 --> (d1u1xp1)xd2u2
          d1: randint(1, 9),
          u1: randint(1, 9),
          d2: randint(1, 9),
          u2: randint(1, 9),
          p1: randint(-3, 3, [0]),
          p2: randint(-3, 3, [0]),
        },
      ]
      const enonces = []
      // for (let k=0;k<3;k++) {
      enonces.push({
        enonce: `
            Sachant que $${arrondi(situations[0].d1 * 10 + situations[0].u1)}\\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)} = ${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * (situations[0].d2 * 10 + situations[0].u2)))}$,
            calculer $${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * 10 ** situations[0].p1))}\\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)}$.
            `,
        question: '',
        correction: `
          $${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * 10 ** situations[0].p1))}\\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)} = ${arrondi(situations[0].d1 * 10 + situations[0].u1)}\\times ${texNombre(10 ** situations[0].p1)} \\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)} = ${arrondi(situations[0].d1 * 10 + situations[0].u1)}\\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)}\\times ${texNombre(10 ** situations[0].p1)} =  ${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * (situations[0].d2 * 10 + situations[0].u2)))}\\times ${texNombre(10 ** situations[0].p1)} = ${miseEnEvidence(texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * (situations[0].d2 * 10 + situations[0].u2)) * arrondi(10 ** situations[0].p1)))}$
          `,
        reponse: arrondi(
          (situations[0].d1 * 10 + situations[0].u1) *
            (situations[0].d2 * 10 + situations[0].u2) *
            10 ** situations[0].p1,
        ),
      })
      enonces.push({
        enonce: `
          Sachant que $${arrondi(situations[0].d1 * 10 + situations[0].u1)}\\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)} = ${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * (situations[0].d2 * 10 + situations[0].u2)))}$,
          calculer $${texNombre(arrondi(situations[0].d1 * 10 + situations[0].u1))}\\times ${texNombre(arrondi((situations[0].d2 * 10 + situations[0].u2) * 10 ** situations[0].p2))}$.
            `,
        question: '',
        correction: `
          $${texNombre(arrondi(situations[0].d1 * 10 + situations[0].u1))}\\times ${texNombre(arrondi((situations[0].d2 * 10 + situations[0].u2) * 10 ** situations[0].p2))} = ${arrondi(situations[0].d1 * 10 + situations[0].u1)}\\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)}\\times ${texNombre(10 ** situations[0].p2)} = ${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * (situations[0].d2 * 10 + situations[0].u2)))}\\times ${texNombre(10 ** situations[0].p2)} = ${miseEnEvidence(texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * (situations[0].d2 * 10 + situations[0].u2)) * arrondi(10 ** situations[0].p2)))}$
          `,
        reponse: arrondi(
          (situations[0].d1 * 10 + situations[0].u1) *
            (situations[0].d2 * 10 + situations[0].u2) *
            10 ** situations[0].p2,
        ),
      })
      enonces.push({
        enonce: `
          Sachant que $${arrondi(situations[0].d1 * 10 + situations[0].u1)}\\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)} = ${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * (situations[0].d2 * 10 + situations[0].u2)))}$,
          calculer $${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * 10 ** situations[0].p1))}\\times ${texNombre(arrondi((situations[0].d2 * 10 + situations[0].u2) * 10 ** situations[0].p2))}$.
          `,
        question: '',
        correction: `
          $${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * 10 ** situations[0].p1))}\\times ${texNombre(arrondi((situations[0].d2 * 10 + situations[0].u2) * 10 ** situations[0].p2))} = ${arrondi(situations[0].d1 * 10 + situations[0].u1)}\\times ${texNombre(10 ** situations[0].p1)} \\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)}\\times ${texNombre(10 ** situations[0].p2)} = ${arrondi(situations[0].d1 * 10 + situations[0].u1)}\\times ${arrondi(situations[0].d2 * 10 + situations[0].u2)}\\times ${texNombre(10 ** situations[0].p1)}\\times ${texNombre(10 ** situations[0].p2)} = ${texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * (situations[0].d2 * 10 + situations[0].u2)))}\\times ${texNombre(10 ** situations[0].p1)}\\times ${texNombre(10 ** situations[0].p2)} = ${miseEnEvidence(texNombre(arrondi((situations[0].d1 * 10 + situations[0].u1) * (situations[0].d2 * 10 + situations[0].u2)) * arrondi(10 ** situations[0].p1) * arrondi(10 ** situations[0].p2)))}$
          `,
        reponse: arrondi(
          (situations[0].d1 * 10 + situations[0].u1) *
            (situations[0].d2 * 10 + situations[0].u2) *
            10 ** situations[0].p1 *
            10 ** situations[0].p2,
        ),
      })

      // };

      // autant de case que d'elements dans le tableau des situations
      switch (listeTypeDeQuestions[i]) {
        case 0:
          texte = `${enonces[0].enonce}`
          texteCorr = `${enonces[0].correction}`
          reponse = enonces[0].reponse
          break
        case 1:
          texte = `${enonces[1].enonce}`
          texteCorr = `${enonces[1].correction}`
          reponse = enonces[1].reponse
          break
        case 2:
        default:
          texte = `${enonces[2].enonce}`
          texteCorr = `${enonces[2].correction}`
          reponse = enonces[2].reponse
          break
      }
      if (context.isHtml && this.interactif)
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      handleAnswers(this, i, { reponse: { value: reponse } })
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          reponse: { texte: texteCorr, valeur: reponse },
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        const amcParam = ensureAmcParam(this, i)
        amcParam.digits =
          nombreDeChiffresDansLaPartieEntiere(reponse) +
          nombreDeChiffresDansLaPartieDecimale(reponse) +
          2
        amcParam.decimals = nombreDeChiffresDansLaPartieDecimale(reponse) + 1
        amcParam.signe = false
        amcParam.exposantNbChiffres = 0
      }
      if (this.questionJamaisPosee(i, reponse)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
