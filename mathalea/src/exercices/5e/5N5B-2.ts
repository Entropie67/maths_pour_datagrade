import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  enleveElement,
} from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCNum'

export const interactifReady = true

export const titre = 'Calculer plusieurs expressions pour des valeurs données'
export const dateDeModifImportante = '06/02/2024'

/**
 * x, y, z étant 3 entiers compris entre 2 et 9, calculer :
 * * kx
 * * kx-y
 * * xy
 * * x+y
 * * x+y+z
 * * x(y+z)
 * * x^2
 * * x^2+ky
 * * x^2+y^2
 * * ax^2+y^2
 * * ax^2+bx+c
 * @author Rémi Angot
 */
export const uuid = '8865d'

export const refs = {
  'fr-fr': ['5N5B-2'],
  'fr-2016': ['5L14-2'],
  'fr-ch': ['9R2FA3A-4', '9R3FA3A-4', '10CTFA4B-4', '10LCFA4B-4', '10LSFA4B-4', '11CTFA3B-4', '11LCFA3B-4', '11LSFA3B-4', 'PRQAL02B-2'],
}
export default class ExerciceSubstituer extends Exercice {
  constructor(difficulte = 1) {
    super()
    this.sup = difficulte
    this.listeAvecNumerotation = false
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Multiplication par un facteur positif\n2 : Multiplication par un facteur relatif',
    ]
    this.besoinFormulaire2Numerique = besoinFormulaireVerificationMultiLignes
    this.sup2 = 2
    this.comment = commentaireMultiLignes

    this.consigneModifiable = false
  }

  nouvelleVersion() {
    let reponse
    const typeDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    let k = randint(2, 9)
    let k2 = randint(2, 9)
    let k3 = randint(2, 9)
    if (this.sup > 1) {
      // si difficulté 2, k, k2 et k3 peuvent être négatifs !!! La correction est à faire. Exercice non fini
      k = k * choice([-1, 1])
      k2 = k2 * choice([-1, 1])
      k3 = k3 * choice([-1, 1])
    }
    const valeursPossibles = range(9, [0, 1]) // Toutes les valeurs de 2 à 9
    const x = choice(valeursPossibles)
    enleveElement(valeursPossibles, x)
    const y = choice(valeursPossibles)
    enleveElement(valeursPossibles, y)
    const z = choice(valeursPossibles)

    const listeTypeDeQuestionsExact = listeTypeDeQuestions.slice(
      0,
      this.nbQuestions,
    )
    if (
      listeTypeDeQuestionsExact.includes(5) ||
      listeTypeDeQuestionsExact.includes(6)
    )
      this.consigne = `Calculer pour $x=${x}$, $y=${y}$ et $z=${z}$.`
    else this.consigne = `Calculer pour $x=${x}$ et $y=${y}$.`

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.autoCorrection[i] = {}
      switch (listeTypeDeQuestions[i]) {
        case 1:
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}x$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${k}x=${k}\\times  ${x}=${miseEnEvidence(`${k * x}`)}$`
          reponse = k * x
          break
        case 2:
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}x-y$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${k}x-y=${k}\\times  ${x}-${y}=${miseEnEvidence(`${k * x - y}`)}$`
          reponse = k * x - y
          break
        case 3:
          texte = `$${lettreDepuisChiffre(i + 1)}=xy$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=xy=${x}\\times  ${y}=${miseEnEvidence(`${x * y}`)}$`
          reponse = x * y
          break
        case 4:
          texte = `$${lettreDepuisChiffre(i + 1)}=x+y$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=x+y=${x}+${y}=${miseEnEvidence(`${x + y}`)}$`
          reponse = x + y
          break
        case 5:
          texte = `$${lettreDepuisChiffre(i + 1)}=xy+z$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=xy+z=${x}\\times  ${y}+${z}=${miseEnEvidence(`${x * y + z}`)}$`
          reponse = x * y + z
          break
        case 6:
          texte = `$${lettreDepuisChiffre(i + 1)}=x(y+z)$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=x(y+z)=${x}\\times (${y}+${z})=${miseEnEvidence(`${x * (y + z)}`)}$`
          reponse = x * (y + z)
          break
        case 7:
          texte = `$${lettreDepuisChiffre(i + 1)}=x^2+${ecritureParentheseSiNegatif(k)}y$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=x^2+${ecritureParentheseSiNegatif(k)}y=${x}^2+${ecritureParentheseSiNegatif(k)}\\times  ${y}=${x * x}+${ecritureParentheseSiNegatif(k)}\\times  ${y}=${miseEnEvidence(`${x * x + k * y}`)}$`
          reponse = x * x + k * y
          break
        case 8:
          texte = `$${lettreDepuisChiffre(i + 1)}=x^2+y^2$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=x^2+y^2=${x}^2+${y}^2=${x * x}+${y * y}=${miseEnEvidence(`${x * x + y * y}`)}$`
          reponse = x * x + y * y
          break
        case 9:
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}x^2+y^2$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${k}x^2+y^2=${k}\\times  ${x}^2+${y}^2=${k}\\times  ${x * x}+${y * y}=${miseEnEvidence(`${k * x * x + y * y}`)}$`
          reponse = k * x * x + y * y
          break
        case 10:
        default:
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}x^2+${ecritureParentheseSiNegatif(k2)}x+${ecritureParentheseSiNegatif(k3)}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${k}x^2+${ecritureParentheseSiNegatif(k2)}x+${ecritureParentheseSiNegatif(k3)}=${k}\\times  ${x}^2+${ecritureParentheseSiNegatif(k2)}\\times  ${ecritureParentheseSiNegatif(x)}+${ecritureParentheseSiNegatif(k3)}=${k}\\times  ${x * x}+${ecritureParentheseSiNegatif(k2)}\\times  ${x}+${ecritureParentheseSiNegatif(k3)}=${miseEnEvidence(`${k * x * x + k2 * x + k3}`)}$`
          reponse = k * x * x + k2 * x + k3
          break
      }
      handleAnswers(
        this,
        i,
        { reponse: { value: reponse } },
        { digits: 3, decimals: 0 },
      )
      if (this.interactif) {
        texte += addPossibleMultiLinesAnswer(this, i, {
          prefix: `${lettreDepuisChiffre(i + 1)} =`,
          style: KeyboardType.clavierDeBaseAvecFraction,
          bareme: baremeMultiLignes(this.sup2),
        })
      } else if (context.isAmc)
        texte = 'Calculer ' + texte + ` pour $x=${x}$, $y=${y}$ et $z=${z}$.`

      if (this.questionJamaisPosee(i, texte)) {
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
