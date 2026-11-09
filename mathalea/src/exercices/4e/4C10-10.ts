import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureNombreRelatif,
  ecritureNombreRelatifc,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'
import { sp } from '../../lib/outils/outilString'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre =
  'Compléter une multiplication à trou de deux entiers relatifs'

export const dateDePublication = '26/08/2022'

/**
 * Compléter une multiplication à trou entre 2 nombres relatifs.
 *
 * * On peut paramétrer la distance à zéro maximale des deux termes (par défaut égale à 20)
 * * On peut choisir d'avoir une écriture simplifiée  (par défaut ce n'est pas le cas)
 * @author Sébastien LOZANO
 * 4C10-10
 */
export const uuid = '857c1'

export const refs = {
  'fr-fr': ['4C10-10'],
  'fr-ch': ['10LCNO2C-8', '10LSNO2C-8', '11CTNO1B-8'],
}
export default class ExerciceMultiplicationsRelatifsATrou extends Exercice {
  constructor(max = 10) {
    super()
    this.besoinFormulaireNumerique = ['Valeur maximale', 99999]
    this.besoinFormulaire2CaseACocher = ['Avec des écritures simplifiées']
    this.sup = max
    this.sup2 = false // écriture simplifiée

    this.amcReady = amcReady
    this.amcType = amcType

    this.consigne = `Compléter${sp()}:`
    this.spacing = 2
  }

  nouvelleVersion(numeroExercice: number) {
    this.numeroExercice = numeroExercice
    for (
      let i = 0, a, b, k, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      a = randint(1, this.sup)
      b = randint(1, this.sup)
      k = choice([
        [-1, -1],
        [-1, 1],
        [1, -1],
      ]) // Les deux nombres relatifs ne peuvent pas être tous les deux positifs
      a = a * k[0]
      b = b * k[1]
      let facteurs: (number | string)[]
      const rang1 = randint(0, 1)
      const rang2 = 1 - rang1
      if (this.sup2) {
        facteurs = [a, '\\ldots\\ldots\\ldots', a, b]
        const facteur2 =
          facteurs[rang2] === '\\ldots\\ldots\\ldots'
            ? facteurs[rang2]
            : ecritureParentheseSiNegatif(Number(facteurs[rang2]))
        texte =
          '$ ' +
          (typeof facteurs[rang1] === 'number'
            ? texNombre(facteurs[rang1])
            : facteurs[rang1]) +
          ' \\times ' +
          facteur2 +
          ' = ' +
          texNombre(a * b) +
          ' $'
        texteCorr =
          '$ ' +
          texNombre(Number(facteurs[rang1 + 2])) +
          ' \\times ' +
          ecritureParentheseSiNegatif(Number(facteurs[rang2 + 2])) +
          ' = ' +
          texNombre(a * b) +
          ' $'
      } else {
        facteurs = [
          ecritureNombreRelatif(a),
          '\\ldots\\ldots\\ldots',
          ecritureNombreRelatifc(a),
          ecritureNombreRelatifc(b),
        ]
        texte =
          '$ ' +
          facteurs[rang1] +
          ' \\times ' +
          facteurs[rang2] +
          ' = ' +
          ecritureNombreRelatif(a * b) +
          ' $'
        texteCorr =
          '$ ' +
          facteurs[rang1 + 2] +
          ' \\times ' +
          facteurs[rang2 + 2] +
          ' = ' +
          ecritureNombreRelatifc(a * b) +
          ' $'
      }

      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: `$${texNombre(b)}$`,
          statut: true,
        },
        {
          texte: `$${texNombre(a * b - a)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(a - b * a)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(-b)}$`,
          statut: false,
        },
      ]
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }
      if (this.questionJamaisPosee(i, a, b, String(k))) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        this.listeReponsesCourtes[i] = `$${texNombre(b)}$`
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
