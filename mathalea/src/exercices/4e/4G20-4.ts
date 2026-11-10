import Decimal from 'decimal.js'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

/**
 * Calcule le cosinus d'un angle en degrés
 */
function degCos(deg: number): number {
  return Math.cos((deg * Math.PI) / 180)
}

export const interactifReady = true

export const dateDePublication = '27/06/2021'
export const dateDeModifImportante = '18/09/2024'
export const titre = 'Arrondir une racine carrée'

/**
 * * Arrondir_une_valeur
 * @author Mireille Gain
 */

export const uuid = '41188'

export const refs = {
  'fr-fr': ['4G20-4', 'BP2AutoS2', 'BP2G8'],
  'fr-ch': ['10CTNO6B-1', '10LCNO6B-1', '10LSNO6B-1', 'PRQNO07B-5'],
}
export default class ArrondirUneValeur4e extends Exercice {
  version: number
  constructor() {
    super()

    this.nbQuestions = 3

    this.version = 1
    this.spacing = context.isHtml ? 1.5 : 2.5
    this.spacingCorr = context.isHtml ? 1.5 : 2.5
  }

  nouvelleVersion() {
    this.consigne =
      "Arrondir chaque nombre à l'unité, puis au dixième, puis au centième."

    let n, nb, rac, angle, v

    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (this.version === 1) {
        rac = new Decimal(
          randint(
            2,
            300,
            [
              4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256,
              289,
            ],
          ),
        )
        n = rac.sqrt()
        nb = `\\sqrt{${rac}}`
      } else {
        // if (this.version === 2)
        v = new Decimal(randint(11, 99)).div(10)
        angle = randint(1, 89, 60)
        if (choice([true, false])) {
          n = v.mul(degCos(angle))
          nb = `${texNombre(v, 1)}\\cos(${angle})`
        } else {
          n = v.div(degCos(angle))
          nb = `\\dfrac{${texNombre(v, 1)}}{\\cos(${angle})}`
        }
      }

      texte = `Quand on écrit sur la calculatrice $${nb}$, elle renvoie : $${texNombre(n, 10)}$.<br>`

      texte += addMultiMathfield(this, i, {
        dataTemplate: `a) Son arrondi à l'unité est : %{champ1}
  b) Son arrondi au dixième est : %{champ2}
  c) Son arrondi au centième est : %{champ3}
  `,
        dataOptions: {
          champ1: { keyboard: KeyboardType.clavierNumbers },
          champ2: { keyboard: KeyboardType.clavierNumbers },
          champ3: { keyboard: KeyboardType.clavierNumbers },
        },
      })
      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          champ1: { value: n.round().toString() },
          champ2: { value: n.toDP(1).toString() },
          champ3: { value: n.toDP(2).toString() },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      // texteCorr = `Quand on écrit sur la calculatrice $${nb}$, elle renvoie : $${texNombre(n, 10)}.$`
      texteCorr = `Arrondi à l'unité de $${texNombre(n, 10)}$ : `
      texteCorr += `$${miseEnEvidence(texNombre(n, 0))}$`
      texteCorr += `<br>Arrondi au dixième de $${texNombre(n, 10)}$ : `
      texteCorr += `$${miseEnEvidence(texNombre(n, 1, true))}$`
      texteCorr += `<br>Arrondi au centième de $${texNombre(n, 10)}$ : `
      texteCorr += `$${miseEnEvidence(texNombre(n, 2, true))}$`

      if (this.questionJamaisPosee(i, n)) {
        // Si la question n'a jamais été posée, on en créé une autre
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
