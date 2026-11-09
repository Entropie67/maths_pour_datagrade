import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { sommeDesTermesParSigne } from '../../lib/outils/calculs'
import {
  ecritureAlgebrique,
  ecritureAlgebriquec,
  ecritureNombreRelatif,
  ecritureNombreRelatifc,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import {
  arrondi,
  nombreDeChiffresDansLaPartieEntiere,
  signe,
  triePositifsNegatifs,
} from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Additionner $5$ nombres relatifs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDeModifImportante = '25/9/2024'

/**
 * Effectuer la somme de 5 nombres relatifs.
 *
 * Pour la correction, on commence par effectuer la somme des termes de même signe
 *
 * * On peut paramétrer les distances à zéro qui sont par défaut inférieures à 20
 * * On peut utiliser des écritures simplifiées (ce qui n'est pas le cas par défaut)
 * @author Rémi Angot
 * 5R20-3
 */
export const uuid = '36e2a'

export const refs = {
  'fr-fr': ['5N2H'],
  'fr-2016': ['5R20-3'],
  'fr-ch': ['9R2NO3C-9', '9R3NO3C-9', '10CTNO2A-9', 'PRQNO06B-6'],
}
export default class ExerciceAdditionsDe5Relatifs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.sup = 20
    this.sup3 = false
    this.sup2 = 1
    this.sup4 = 2
    this.consigne = 'Calculer.'
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 0.5
    this.nbCols = 2
    this.nbColsCorr = 2

    this.amcType = amcType
    this.amcReady = amcReady
    this.besoinFormulaireNumerique = ['Valeur maximale', 99999]
    this.besoinFormulaire2Numerique = [
      "Type d'expressions",
      3,
      'Tous les nombres entre parenthèses \n2 : Seul les termes négatifs sont entre parenthèses \n3 : Écriture simplifiée',
    ]
    this.besoinFormulaire3CaseACocher = ['Avec des nombres décimaux']
    this.besoinFormulaire4Numerique = besoinFormulaireVerificationMultiLignes
    this.comment = commentaireMultiLignes
    // this.comment = "Si l'option « Avec des nombres décimaux » est activée, 2 fois sur 3 les nombres auront un chiffre après la virgule et une fois sur 3 un seul terme aura deux chiffres après la virgule."
  }

  nouvelleVersion() {
    // Rétrocompatibilité avec les liens vers les exercices quand c'était des cases à cocher
    if (this.sup2 === false) {
      this.sup2 = 1
    } else if (this.sup2 === true) {
      this.sup2 = 3
    }
    if (!context.isHtml) this.interactif = false
    if (this.interactif) {
      this.spacing = 3
    }
    const partieDecimaleAUnChiffre = combinaisonListes(
      [true, true, false],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let c, relatifs
      let texte = ''
      let texteCorr = ''
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      let CoefDecimales = this.sup3 ? 10 : 1
      let a =
        (randint(1, this.sup * CoefDecimales) / CoefDecimales) * choice([-1, 1])
      let b =
        (randint(1, this.sup * CoefDecimales) / CoefDecimales) * choice([-1, 1])
      if (a * b > 0) {
        // On s'assure que les 3 premières termes n'ont pas le même signe
        c =
          (randint(1, this.sup * CoefDecimales) / CoefDecimales) *
          (a > 0 ? -1 : 1)
      } else {
        c =
          (randint(1, this.sup * CoefDecimales) / CoefDecimales) *
          choice([-1, 1])
      }
      CoefDecimales = this.sup3 ? (partieDecimaleAUnChiffre[i] ? 10 : 100) : 1
      let d =
        (randint(1, this.sup * CoefDecimales) / CoefDecimales) * choice([-1, 1])
      let e =
        (randint(1, this.sup * CoefDecimales) / CoefDecimales) * choice([-1, 1])
      if (choice([true, false])) {
        ;[a, b, c, d, e] = shuffle([a, b, c, d, e])
      }

      const s1 = 1 // Que des additions
      const s2 = 1
      const s3 = 1
      const s4 = 1
      const reponse = arrondi(a + b + c + d + e)
      if (this.sup2 === 3) {
        texte = `$ ${lettreDepuisChiffre(i + 1)} = ${texNombre(a, 2)}${ecritureAlgebrique(b)}${ecritureAlgebrique(c)}${ecritureAlgebrique(d)}${ecritureAlgebrique(
          e,
        )}$`

        texteCorr = `$ ${lettreDepuisChiffre(i + 1)} =  ${texNombre(a, 2)}${ecritureAlgebrique(b)}${ecritureAlgebrique(c)}${ecritureAlgebrique(d)}${ecritureAlgebrique(
          e,
        )}$`
        texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)} = ${texNombre(sommeDesTermesParSigne([a, b, c, d, e])[0], 2)}${ecritureAlgebrique(sommeDesTermesParSigne([a, b, c, d, e])[1])} $`
        texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(texNombre(a + b + c + d + e, 2))}$`
      } else if (this.sup2 === 2) {
        texte = `$ ${lettreDepuisChiffre(i + 1)} = ${texNombre(a, 2)} + ${ecritureParentheseSiNegatif(b)} + ${ecritureParentheseSiNegatif(c)} + ${ecritureParentheseSiNegatif(d)} + ${ecritureParentheseSiNegatif(
          e,
        )}$`

        texteCorr = `$ ${lettreDepuisChiffre(i + 1)} =  ${texNombre(a, 2)} + ${ecritureParentheseSiNegatif(b)} + ${ecritureParentheseSiNegatif(c)} + ${ecritureParentheseSiNegatif(d)} + ${ecritureParentheseSiNegatif(
          e,
        )}$`
        texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)} = ${texNombre(sommeDesTermesParSigne([a, b, c, d, e])[0], 2)} + ${ecritureParentheseSiNegatif(sommeDesTermesParSigne([a, b, c, d, e])[1])}$`
        texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(texNombre(a + b + c + d + e, 2))} $`
      } else if (this.sup2 === 1) {
        texte = `$ ${lettreDepuisChiffre(i + 1)} =  ${ecritureNombreRelatif(a)}${signe(s1)}${ecritureNombreRelatif(b)}${signe(s2)}${ecritureNombreRelatif(
          c,
        )}${signe(s3)}${ecritureNombreRelatif(d)}${signe(s4)}${ecritureNombreRelatif(e)}$`

        texteCorr = `$ ${lettreDepuisChiffre(i + 1)} =  ${ecritureNombreRelatif(a)}${signe(s1)}${ecritureNombreRelatif(b)}${signe(s2)}${ecritureNombreRelatif(
          c,
        )}${signe(s3)}${ecritureNombreRelatif(d)}${signe(s4)}${ecritureNombreRelatif(e)} $`
        relatifs = triePositifsNegatifs([a, s1 * b, s2 * c, s3 * d, s4 * e])

        if (relatifs[0] > 0 && relatifs[4] < 0) {
          texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${ecritureNombreRelatifc(relatifs[0])}+${ecritureNombreRelatifc(relatifs[1])}+${ecritureNombreRelatifc(
            relatifs[2],
          )}+${ecritureNombreRelatifc(relatifs[3])}+${ecritureNombreRelatifc(relatifs[4])} $`
        }
        const sommesSignees = sommeDesTermesParSigne([
          relatifs[0],
          relatifs[1],
          relatifs[2],
          relatifs[3],
          relatifs[4],
        ])
        if (sommesSignees[0] !== 0 && sommesSignees[1] !== 0) {
          sommesSignees[0] = arrondi(sommesSignees[0], 2)
          sommesSignees[1] = arrondi(sommesSignees[1], 2)
          texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${ecritureNombreRelatifc(sommesSignees[0])}+${ecritureNombreRelatifc(sommesSignees[1])} $`
          texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${miseEnEvidence(ecritureAlgebrique(arrondi(a + s1 * b + s2 * c + s3 * d + s4 * e, 2)))}$<br>`
        } else if (sommesSignees[0] !== 0) {
          texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(ecritureAlgebrique(sommesSignees[0]))}$`
        } else {
          texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(ecritureAlgebrique(sommesSignees[1]))}$<br>`
        }
      }

      if (!context.isHtml && !context.isAmc) {
        texte += `<br>$ ${lettreDepuisChiffre(i + 1)} =$`
      }

      handleAnswers(
        this,
        i,
        { reponse: { value: reponse } },
        {
          signe: true,
          digits: Math.max(2, nombreDeChiffresDansLaPartieEntiere(reponse)),
          decimals: 0,
        },
      )
      if (this.interactif && !context.isAmc) {
        texte += addPossibleMultiLinesAnswer(this, i, {
          prefix: `${lettreDepuisChiffre(i + 1)} =`,
          style: KeyboardType.clavierDeBaseAvecFraction,
          bareme: baremeMultiLignes(this.sup4),
        })
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
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
