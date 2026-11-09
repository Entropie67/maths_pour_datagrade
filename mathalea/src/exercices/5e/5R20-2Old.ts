import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureNombreRelatif,
  ecritureNombreRelatifc,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = 'Compléter une addition à trou de deux entiers relatifs'

/**
 * Compléter une addition à trou entre 2 nombres relatifs.
 *
 * * On peut paramétrer la distance à zéro maximale des deux termes (par défaut égale à 20)
 * * On peut choisir d'avoir une écriture simplifiée  (par défaut ce n'est pas le cas)
 * @author Rémi Angot
 */
export const uuid = 'ce842'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ExerciceAdditionsRelatifsATrouOld extends Exercice {
  constructor(max = 10) {
    super()
    this.sup = max
    this.sup2 = false // écriture simplifiée
    this.sup3 = false // decimaux
    this.besoinFormulaireNumerique = ['Valeur maximale', 99999]
    this.besoinFormulaire2CaseACocher = ['Avec des écritures simplifiées']
    this.besoinFormulaire3CaseACocher = ['Avec des nombres décimaux']
    this.amcReady = amcReady
    this.amcType = amcType

    this.consigne = 'Compléter :'
    this.spacing = 0.5
    this.nbCols = 3
    this.nbColsCorr = 3
  }

  nouvelleVersion(numeroExercice: number) {
    this.numeroExercice = numeroExercice
    for (
      let i = 0, k, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      const CoefDecimales = this.sup3 ? 10 : 1
      let a =
        (randint(1, this.sup * CoefDecimales) / CoefDecimales) * choice([-1, 1])
      let b =
        (randint(1, this.sup * CoefDecimales) / CoefDecimales) * choice([-1, 1])
      k = choice([
        [-1, -1],
        [-1, 1],
        [1, -1],
      ]) // Les deux nombres relatifs ne peuvent pas être tous les deux positifs
      a = a * k[0]
      b = b * k[1]
      let termes
      const rang1 = randint(0, 1)
      const rang2 = 1 - rang1
      if (this.sup2) {
        termes = [
          rang1 === 0 ? texNombre(a, 1) : ecritureAlgebrique(a),
          (rang2 === 1 ? '+' : '') + '\\ldots\\ldots\\ldots',
          rang1 === 0 ? texNombre(a, 1) : ecritureAlgebrique(a),
          rang2 === 1
            ? '+' + miseEnEvidence(ecritureParentheseSiNegatif(b))
            : miseEnEvidence(texNombre(b, 1)),
        ] // miseEnEvidence(b)]
        texte =
          '$ ' +
          termes[rang1] +
          termes[rang2] +
          ' = ' +
          texNombre(a + b, 1) +
          ' $'
        texteCorr =
          '$ ' +
          termes[rang1 + 2] +
          termes[rang2 + 2] +
          ' = ' +
          texNombre(a + b, 1) +
          ' $'
        if (rang2 === 1 && b < 0)
          texteCorr +=
            '<br>$ ' +
            termes[rang1 + 2] +
            sp(1) +
            miseEnEvidence(texNombre(b, 1)) +
            ' = ' +
            texNombre(a + b, 1) +
            ' $'
      } else {
        termes = [
          ecritureNombreRelatif(a),
          '\\ldots\\ldots\\ldots',
          ecritureNombreRelatifc(a),
          ecritureNombreRelatifc(b),
        ]
        texte =
          '$ ' +
          termes[rang1] +
          ' + ' +
          termes[rang2] +
          ' = ' +
          ecritureNombreRelatif(a + b) +
          ' $'
        texteCorr =
          '$ ' +
          termes[rang1 + 2] +
          ' + ' +
          termes[rang2 + 2] +
          ' = ' +
          ecritureNombreRelatifc(a + b) +
          ' $'
      }
      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: `$${texNombre(b, 1)}$`, // `$${b}$`,
          statut: true,
        },
        {
          texte: `$${texNombre(a + b + a, 1)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(-2 * a - b, 1)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(-b, 1)}$`,
          statut: false,
        },
      ]
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
