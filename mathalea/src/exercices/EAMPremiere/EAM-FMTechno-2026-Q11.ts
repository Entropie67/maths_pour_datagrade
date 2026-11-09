import { tableauColonneLigne } from '../../lib/2d/tableau'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'e7117'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer une probabilité conditionnelle'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ11FMt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    n11: number,
    n12: number,
    n21: number,
    n22: number,
    typeQuestion: number,
  ): void {
    const totL1 = n11 + n12
    const totL2 = n21 + n22
    const totC1 = n11 + n21
    const totC2 = n12 + n22
    const total = totL1 + totL2

    let conditionNom = ''
    let cibleNom = ''
    let num = 0
    let den = 0
    let dist1_den = 0
    let dist3_den = 0
    let typeMarginale = ''
    let nomMarginale = ''

    switch (typeQuestion) {
      case 1:
        conditionNom = 'avec fil'
        cibleNom = 'avec sac'
        num = n11
        den = totL1
        dist1_den = n12
        dist3_den = totC1
        typeMarginale = 'ligne'
        nomMarginale = 'Avec fil'
        break
      case 2:
        conditionNom = 'sans fil'
        cibleNom = 'avec sac'
        num = n21
        den = totL2
        dist1_den = n22
        dist3_den = totC1
        typeMarginale = 'ligne'
        nomMarginale = 'Sans fil'
        break
      case 3:
        conditionNom = 'avec sac'
        cibleNom = 'avec fil'
        num = n11
        den = totC1
        dist1_den = n21
        dist3_den = totL1
        typeMarginale = 'colonne'
        nomMarginale = 'Avec sac'
        break
      case 4:
        conditionNom = 'sans sac'
        cibleNom = 'sans fil'
        num = n22
        den = totC2
        dist1_den = n12
        dist3_den = totL2
        typeMarginale = 'colonne'
        nomMarginale = 'Sans sac'
        break
    }

    // =========================================================================
    // CREATION DES DEUX VERSIONS DU TABLEAU (HTML vs LaTeX)
    // =========================================================================

    const tableauHtml = tableauColonneLigne(
      ['', '\\text{Avec sac}', '\\text{Sans sac}', '\\text{Total}'],
      ['\\text{Avec fil}', '\\text{Sans fil}', '\\text{Total}'],
      [
        n11.toString(),
        n12.toString(),
        totL1.toString(),
        n21.toString(),
        n22.toString(),
        totL2.toString(),
        totC1.toString(),
        totC2.toString(),
        total.toString(),
      ],
    )

    const tableauLatex = `\\begin{center}\\begin{tblr}{colspec={|c|c|c|c|}, hlines, vlines}
    & \\text{Avec sac} & \\text{Sans sac} & \\text{Total}\\\\
    \\text{Avec fil} & $${n11}$ & $${n12}$ & $${totL1}$\\\\
    \\text{Sans fil} & $${n21}$ & $${n22}$ & $${totL2}$\\\\
    \\text{Total} & $${totC1}$ & $${totC2}$ & $${total}$
    \\end{tblr}\\end{center}`

    // =========================================================================
    // SÉPARATION DE L'ÉNONCÉ POUR ÉVITER LES ERREURS DE SAUTS DE LIGNE EN LATEX
    // =========================================================================

    if (context.isHtml) {
      // Version Web avec les balises <br>
      this.enonce = `Le tableau ci-dessous donne la répartition des achats d'aspirateurs d'un magasin d'électroménager.<br><br>`
      this.enonce += `${tableauHtml}<br>`
      this.enonce += `On interroge au hasard un client parmi ceux qui ont acheté un aspirateur ${conditionNom}.<br>`
      this.enonce += `La probabilité que ce client ait acheté un aspirateur ${cibleNom} est :`
    } else {
      // Version AMC/LaTeX pure sans aucun <br> (LaTeX gère les sauts de ligne avec l'environnement center)
      this.enonce = `Le tableau ci-dessous donne la répartition des achats d'aspirateurs d'un magasin d'électroménager.\n`
      this.enonce += `${tableauLatex}\n`
      this.enonce += `On interroge au hasard un client parmi ceux qui ont acheté un aspirateur ${conditionNom}.\n\n`
      this.enonce += `La probabilité que ce client ait acheté un aspirateur ${cibleNom} est :`
    }

    this.correction = `On choisit le client conditionnellement à l'événement «\u00a0a acheté un aspirateur ${conditionNom}\u00a0».<br>`
    this.correction += `L'univers de cette probabilité est donc restreint à la ${typeMarginale} «\u00a0${nomMarginale}\u00a0», qui compte $${den}$ clients au total.<br>`
    this.correction += `Parmi ces $${den}$ clients, l'effectif de ceux ayant acheté un aspirateur ${cibleNom} est de $${num}$.<br>`
    this.correction += `La probabilité est donc : $${miseEnEvidence(`\\dfrac{${num}}{${den}}`)}$.`

    const dist1 = `\\dfrac{${num}}{${dist1_den}}`
    const dist2 = `\\dfrac{${num}}{${total}}`
    const dist3 = `\\dfrac{${num}}{${dist3_den}}`

    this.reponses = [
      `$\\dfrac{${num}}{${den}}$`,
      `$${dist1}$`,
      `$${dist2}$`,
      `$${dist3}$`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(102, 58, 20, 70, 2)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    let numEssais = 0
    do {
      numEssais++
      const n11 = randint(50, 150)
      const n12 = randint(30, 90)
      const n21 = randint(15, 40)
      const n22 = randint(45, 100)

      const typeQuestion = randint(1, 4)

      this.appliquerLesValeurs(n11, n12, n21, n22, typeQuestion)
      compteur++
    } while (
      compteur < 100 &&
      numEssais < 500 &&
      !aLeBonNombreDePropsDifferentes(this, 4, true)
    )
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /La probabilité que ce client ait acheté un aspirateur (.*) est :\s*$/,
        (_, cible: string) =>
          this.interactif
            ? `La probabilité que ce client ait acheté un aspirateur ${cible} est `
            : `Calculer la probabilité que ce client ait acheté un aspirateur ${cible}.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
