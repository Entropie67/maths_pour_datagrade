import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '1e5e0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer avec des puissances'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ9ANs2026 extends ExerciceQcmACourt {
  appliquerLesValeurs = (cas: number) => {
    let enonceExpr = ''
    let et1 = ''
    let et2 = ''
    let et3 = ''
    let repJuste = ''
    let faux1 = ''
    let faux2 = ''
    let faux3 = ''

    switch (cas) {
      case 1: //
        enonceExpr = '\\dfrac{2 \\times 3^2}{27 \\times 2^3}'
        et1 = '\\dfrac{2^1 \\times 3^2}{3^3 \\times 2^3}'
        et2 = '\\dfrac{2^1}{2^3} \\times \\dfrac{3^2}{3^3}'
        et3 =
          '\\dfrac{1}{2^2} \\times \\dfrac{1}{3^1} = \\dfrac{1}{4} \\times \\dfrac{1}{3}'
        repJuste = '\\dfrac{1}{12}'
        faux1 = '\\dfrac{1}{9}'
        faux2 = '12'
        faux3 = '\\dfrac{1}{6}'
        break
      case 2:
        enonceExpr = '\\dfrac{3 \\times 2^2}{8 \\times 3^2}'
        et1 = '\\dfrac{3^1 \\times 2^2}{2^3 \\times 3^2}'
        et2 = '\\dfrac{2^2}{2^3} \\times \\dfrac{3^1}{3^2}'
        et3 =
          '\\dfrac{1}{2^1} \\times \\dfrac{1}{3^1} = \\dfrac{1}{2} \\times \\dfrac{1}{3}'
        repJuste = '\\dfrac{1}{6}'
        faux1 = '\\dfrac{1}{12}'
        faux2 = '6'
        faux3 = '\\dfrac{1}{9}'
        break
      case 3:
        enonceExpr = '\\dfrac{2^3 \\times 3^2}{9 \\times 2^5}'
        et1 = '\\dfrac{2^3 \\times 3^2}{3^2 \\times 2^5}'
        et2 = '\\dfrac{2^3}{2^5} \\times \\dfrac{3^2}{3^2}'
        et3 = '\\dfrac{1}{2^2} \\times 1 = \\dfrac{1}{4} \\times 1'
        repJuste = '\\dfrac{1}{4}'
        faux1 = '4'
        faux2 = '\\dfrac{1}{8}'
        faux3 = '\\dfrac{1}{6}'
        break
      case 4:
        enonceExpr = '\\dfrac{27 \\times 2^2}{16 \\times 3^2}'
        et1 = '\\dfrac{3^3 \\times 2^2}{2^4 \\times 3^2}'
        et2 = '\\dfrac{2^2}{2^4} \\times \\dfrac{3^3}{3^2}'
        et3 = '\\dfrac{1}{2^2} \\times 3^1 = \\dfrac{1}{4} \\times 3'
        repJuste = '\\dfrac{3}{4}'
        faux1 = '\\dfrac{4}{3}'
        faux2 = '\\dfrac{3}{8}'
        faux3 = '\\dfrac{9}{4}'
        break
      case 5:
        enonceExpr = '\\dfrac{4 \\times 3^3}{9 \\times 2^4}'
        et1 = '\\dfrac{2^2 \\times 3^3}{3^2 \\times 2^4}'
        et2 = '\\dfrac{2^2}{2^4} \\times \\dfrac{3^3}{3^2}'
        et3 = '\\dfrac{1}{2^2} \\times 3^1 = \\dfrac{1}{4} \\times 3'
        repJuste = '\\dfrac{3}{4}'
        faux1 = '\\dfrac{4}{3}'
        faux2 = '\\dfrac{3}{8}'
        faux3 = '\\dfrac{3}{2}'
        break
      case 6:
        enonceExpr = '\\dfrac{9 \\times 2^3}{8 \\times 3^3}'
        et1 = '\\dfrac{3^2 \\times 2^3}{2^3 \\times 3^3}'
        et2 = '\\dfrac{2^3}{2^3} \\times \\dfrac{3^2}{3^3}'
        et3 = '1 \\times \\dfrac{1}{3^1} = 1 \\times \\dfrac{1}{3}'
        repJuste = '\\dfrac{1}{3}'
        faux1 = '3'
        faux2 = '\\dfrac{1}{9}'
        faux3 = '\\dfrac{2}{3}'
        break
      case 7:
        enonceExpr = '\\dfrac{8 \\times 3^2}{27 \\times 2^2}'
        et1 = '\\dfrac{2^3 \\times 3^2}{3^3 \\times 2^2}'
        et2 = '\\dfrac{2^3}{2^2} \\times \\dfrac{3^2}{3^3}'
        et3 = '2^1 \\times \\dfrac{1}{3^1} = 2 \\times \\dfrac{1}{3}'
        repJuste = '\\dfrac{2}{3}'
        faux1 = '\\dfrac{3}{2}'
        faux2 = '\\dfrac{4}{9}'
        faux3 = '\\dfrac{2}{9}'
        break
      case 8:
        enonceExpr = '\\dfrac{32 \\times 3^2}{9 \\times 2^6}'
        et1 = '\\dfrac{2^5 \\times 3^2}{3^2 \\times 2^6}'
        et2 = '\\dfrac{2^5}{2^6} \\times \\dfrac{3^2}{3^2}'
        et3 = '\\dfrac{1}{2^1} \\times 1 = \\dfrac{1}{2} \\times 1'
        repJuste = '\\dfrac{1}{2}'
        faux1 = '2'
        faux2 = '\\dfrac{1}{4}'
        faux3 = '\\dfrac{1}{6}'
        break
    }

    this.enonce = `On considère le nombre réel : $E = ${enonceExpr}$. On peut affirmer que $E$ est égal à :`

    this.correction = `On utilise les règles de calcul sur les puissances pour simplifier l'expression :<br>
    $\\begin{aligned}
    E &= ${enonceExpr}\\\\
    &= ${et1}\\\\
    &= ${et2}\\\\
    &= ${et3}\\\\
    &= ${miseEnEvidence(repJuste)}
    \\end{aligned}$`

    // Le premier élément est la bonne réponse, l'aléatoire mélangera l'ordre à l'affichage
    this.reponses = [`$${repJuste}$`, `$${faux1}$`, `$${faux2}$`, `$${faux3}$`]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const cas = choice([1, 2, 3, 4, 5, 6, 7, 8])
      this.appliquerLesValeurs(cas)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
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
        / On peut affirmer que \$E\$ est égal à :\s*$/,
        ' Calculer $E$.',
      )
    this.texteAvantReponseCourte = '$E=$'
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
  }
}
