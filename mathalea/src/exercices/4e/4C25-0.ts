import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { enleveElementBis, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
} from '../../lib/outils/nombres'
import { numAlpha, queDevant } from '../../lib/outils/outilString'
import { prenom, prenomF, prenomM } from '../../lib/outils/Personne'
import type { UneProposition } from '../../lib/types'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction, listeFractions } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes additifs et de comparaison sur les fractions'
export const dateDeModifImportante = '05/11/2025'
export const interactifReady = true

/**
 * Résoudre des problèmes additifs et de comparaison sur les fractions
 * Refactoring Mickael Guironnet : possibilité de choisir les problèmes et avoir des dénominateurs différents
 * @author Sébastien Lozano
 * Passage en 5ème (dénominateurs multiples) + Passage en interactif : Éric Elter (21/05/2025)
 * Meilleur score avec remplisLesBlanc : Éric Elter (05/11/2025)
 */
export const uuid = '9db08'

export const refs = {
  'fr-fr': ['4C25-0'],
  'fr-ch': ['9R3NO4K-3', '10CTNO3D-3', '10LCNO3D-3', '10LSNO3D-3', 'PRQNO15B-10'],
}
export default class ProblemesAdditifsFractionsBis extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de problèmes',
      'Nombres séparés par des tirets :\n1: Triathlon (3 fractions)\n2 : Élection (3 fractions)\n3 : Mandala (4 fractions)\n4 : Jardin (4 fractions)\n5 : Stade (4 fractions)\n6 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Avec dénominateur(s) multiple(s) du plus petit',
    ]
    this.sup = '6'
    this.sup2 = false

    this.nbQuestions = 3

    this.spacing = context.isHtml ? 2 : 1.5
    this.spacingCorr = context.isHtml ? 3 : 1.5
  }

  nouvelleVersion() {
    this.consigne = this.interactif
      ? ''
      : this.nbQuestions > 1
        ? 'Justifier vos réponses aux problèmes suivants.'
        : 'Justifier votre réponse au problème suivant.'
    if (!context.isHtml && this.nbQuestions > 1) this.consigne += '<br>'
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const denomsAmis = [
      [40, 20, 4, 10, 5, 8],
      [60, 30, 3, 20, 4, 15, 5, 12, 6, 10],
      [80, 40, 4, 20, 5, 16, 8, 10],
      [100, 50, 25, 20, 10, 5],
      [64, 8, 32, 16, 4],
      [54, 9, 6, 27, 18],
    ]
    const arr = Array.from({ length: denomsAmis.length }, (_, i) => i)
    let denomsAmisToSelect = shuffle(arr)

    let listefrac,
      listefrac2,
      denominateurCommun,
      fracMemeDenom,
      fracMemeDenomRangees,
      fracRangees
    // le tableau d'objets contenant tout le necesssaire, fractions, énoncé, question ... pour les problème avec 4 fractions
    let pb4f = []
    let pb3f = []
    // les numérateurs et dénominateurs des fractions
    let n1, n2, n3, n4, d1, d2, d3, d4, F1, F2, F3, F4

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on choisit un tableau de dénominateurs qui va bien
      if (denomsAmisToSelect.length === 0)
        denomsAmisToSelect = shuffle(
          Array.from({ length: denomsAmis.length }, (_, i) => i),
        )

      if (listeTypeDeQuestions[i] < 3) {
        //= =====================================================
        //= ================AVEC 3 FRACTIONS========
        //= =====================================================

        // le tableau d'objets contenant tout le necesssaire, fractions, énoncé, question ... pour les problème avec 3 fractions
        pb3f = []

        const denomsCool3 = denomsAmis[Number(denomsAmisToSelect.pop())]
        F1 = fraction(1, 2)
        F2 = fraction(1, 2)
        F3 = fraction(1, 2)
        let b = 0
        while (
          b < 50 &&
          (F1.num === F2.num ||
            F1.num === F3.num ||
            F2.num === F3.num ||
            F1.den === F2.den ||
            F1.superieurLarge(fraction(1, 2)) ||
            F2.superieurLarge(fraction(1, 2)) || // Niveau propre à la 5ème (Un dénominateur multiple de l'autre)
            (this.sup2 &&
              (nombreDeChiffresDansLaPartieDecimale(
                arrondi(Math.max(F1.den, F2.den) / Math.min(F1.den, F2.den)),
              ) !== 0 ||
                Math.max(F1.den, F2.den) / Math.min(F1.den, F2.den) > 11)))
        ) {
          // pour éviter la boucle infinie
          b++

          // sélectionne 2 dénominateurs différents et trie par ordre croissant
          const dens = shuffle(denomsCool3).slice(0, 2) as [number, number]
          ;[d1, d2] = dens.sort((a: number, b: number) => a - b)

          n1 = randint(Math.ceil(d1 / 4), Math.floor(d1 / 2)) // fraction comprise entre 1 quart et 1 demi
          n2 = randint(Math.ceil(d2 / 4), Math.floor(d2 / 2)) // fraction comprise entre 1 quart et 1 demi

          n3 = d1 * d2 - n1 * d2 - n2 * d1 // la somme des trois vaut 1 !
          d3 = d1 * d2

          F1 = fraction(n1, d1).simplifie()
          F2 = fraction(n2, d2).simplifie()
          F3 = fraction(n3, d3).simplifie()
        }
        // on mélange
        ;[F1, F2] = shuffle([F1, F2])

        //= =====================================================
        //= ======== indice 0 le triathlon des neiges  ==========
        //= =====================================================
        pb3f.push({
          prenoms: [prenomM()],
          fractions: [F1, 'VTT', F2, 'ski de fond', F3, 'course à pied'],
          enonce: '',
          question:
            (this.interactif ? numAlpha(0) : '') +
            'Pour quelle discipline, la distance parcourue est-elle la plus grande ?',
          correction: '',
          question2:
            'Classer, par ordre croissant, les fractions respectives associées à chaque discipline.',
        })

        // les 3 prénoms doivent être distincts
        const [p1, p2, p3] = prenomF(3)

        //= =====================================================
        //= ==========indice 1 Miss Math===========
        //= =====================================================
        pb3f.push({
          prenoms: [],
          fractions: [F1, p1, F2, p2, F3, p3],
          enonce: '',
          question: 'Qui a été élue ?',
          correction: '',
          question2:
            'Classer, par ordre croissant, les proportions des suffrages associées à chaque candidate.',
        })
        const currentDate = new Date()
        const currentAnnee = currentDate.getFullYear()

        //= =====================================================
        //= ===== énoncé indice 0 le triathlon des neiges  ======
        //= =====================================================
        pb3f[0].enonce +=
          "Le triathlon des neiges de la vallée des loups comprend trois épreuves qui s'enchaînent : VTT, ski de fond et course à pied."
        pb3f[0].enonce += `<br>${pb3f[0].prenoms[0]}, un passionné de cette épreuve, s'entraîne régulièrement sur le même circuit. `
        pb3f[0].enonce += `<br>À chaque entraînement, il parcourt le circuit de la façon suivante : $${(pb3f[0].fractions[0] as FractionEtendue).texFraction}$ en ${pb3f[0].fractions[1]}, `
        pb3f[0].enonce += `$${(pb3f[0].fractions[2] as FractionEtendue).texFraction}$ en ${pb3f[0].fractions[3]} et le reste en ${pb3f[0].fractions[5]}.`

        //= =====================================================
        //= ========== énoncé indice 1 Miss Math===========
        //= =====================================================
        pb3f[1].enonce = `À l'élection de Miss Math ${currentAnnee}, ${pb3f[1].fractions[1]} a remporté $${(pb3f[1].fractions[0] as FractionEtendue).texFraction}$ des suffrages, `
        pb3f[1].enonce += `${pb3f[1].fractions[3]} $${(pb3f[1].fractions[2] as FractionEtendue).texFraction}$ et `
        pb3f[1].enonce += `${pb3f[1].fractions[5]} tous les autres.`

        //= =====================================================
        //= ==========Correction Commune===========
        //= =====================================================
        listefrac = listeFractions(F1, F2, F3)
        fracMemeDenom = enleveElementBis(listefrac.listeMemeDenominateur)
        fracMemeDenomRangees = enleveElementBis(
          listefrac.listeRangeeMemeDenominateur,
        )
        fracRangees = enleveElementBis(listefrac.listeRangee)
        denominateurCommun = (
          listefrac.listeMemeDenominateur[0] as unknown as FractionEtendue
        ).den
        for (let i = 0; i < 2; i++) {
          pb3f[i].correction =
            "Il s'agit d'un problème additif. Il va être nécessaire de réduire les fractions au même dénominateur pour les additionner, les soustraire ou les comparer.<br>"
          if (listefrac.liste[0].den === listefrac.liste[1].den) {
            pb3f[i].correction +=
              "Les fractions de l'énoncé ont déjà le même dénominateur.<br>"
          } else {
            pb3f[i].correction +=
              "Réduisons les fractions de l'énoncé au même dénominateur : "

            pb3f[i].correction += `$${listefrac.liste[0].texFraction}$ `
            if (listefrac.liste[0].den !== denominateurCommun)
              pb3f[i].correction +=
                `$= ${(listefrac.listeMemeDenominateur[0] as unknown as FractionEtendue).texFraction}$ et `
            else pb3f[i].correction += ' et '
            pb3f[i].correction += `$${listefrac.liste[1].texFraction}$ `
            if (listefrac.liste[1].den !== denominateurCommun)
              pb3f[i].correction +=
                `$= ${(listefrac.listeMemeDenominateur[1] as unknown as FractionEtendue).texFraction}$.<br>`
            else pb3f[i].correction += '.<br>'
          }
        }

        //= =====================================================
        //= === Correction indice 0 le triathlon des neiges  ====
        //= =====================================================
        pb3f[0].correction += "Calculons d'abord la distance en "

        //= =====================================================
        //= ======= Correction indice 1 Miss Math ========
        //= =====================================================
        pb3f[1].correction +=
          "Calculons d'abord la proportion des suffrages remportés par "

        //= =====================================================
        //= ========== Correction Commune ===========
        //= =====================================================
        for (let i = 0; i < 2; i++) {
          pb3f[i].correction += `${pb3f[i].fractions[5]} : <br>`
          pb3f[i].correction +=
            `$1-${(pb3f[i].fractions[0] as FractionEtendue).texFraction}-${(pb3f[i].fractions[2] as FractionEtendue).texFraction} = `
          pb3f[i].correction +=
            `${fraction(denominateurCommun, denominateurCommun).texFraction}-${(listefrac.listeMemeDenominateur[0] as unknown as FractionEtendue).texFraction}-${(listefrac.listeMemeDenominateur[1] as unknown as FractionEtendue).texFraction} = `
          pb3f[i].correction +=
            `\\dfrac{${denominateurCommun}-${(listefrac.listeMemeDenominateur[0] as unknown as FractionEtendue).num}-${(listefrac.listeMemeDenominateur[1] as unknown as FractionEtendue).num}}{${denominateurCommun}} = `
          pb3f[i].correction +=
            `${fraction(denominateurCommun - (listefrac.listeMemeDenominateur[0] as unknown as FractionEtendue).num - (listefrac.listeMemeDenominateur[1] as unknown as FractionEtendue).num, denominateurCommun).texFraction}`
          if (!(denominateurCommun === F3.den)) {
            pb3f[i].correction +=
              ` = ${(pb3f[i].fractions[4] as FractionEtendue).texFraction}$`
          } else {
            pb3f[i].correction += '$'
          }
        }

        //= =====================================================
        //= === Conclusion indice 0 le triathlon des neiges  ====
        //= =====================================================
        pb3f[0].correction += `<br>${pb3f[0].prenoms[0]} fait donc $${(pb3f[0].fractions[0] as FractionEtendue).texFraction}$ en ${pb3f[0].fractions[1]}, `
        pb3f[0].correction += `$${(pb3f[0].fractions[2] as FractionEtendue).texFraction}$ en ${pb3f[0].fractions[3]} et `
        pb3f[0].correction += `$${(pb3f[0].fractions[4] as FractionEtendue).texFraction}$ en ${pb3f[0].fractions[5]}.`

        pb3f[0].correction +=
          '<br> Avec les mêmes dénominateurs pour pouvoir comparer, '
        pb3f[0].correction += `${pb3f[0].prenoms[0]} fait donc $${(fracMemeDenom[0] as unknown as FractionEtendue).texFraction}$ en ${pb3f[0].fractions[1]}, `
        pb3f[0].correction += `$${(fracMemeDenom[1] as unknown as FractionEtendue).texFraction}$ en ${pb3f[0].fractions[3]} et `
        pb3f[0].correction += `$${(fracMemeDenom[2] as unknown as FractionEtendue).texFraction}$ en ${pb3f[0].fractions[5]}.`

        pb3f[0].correction += `<br>Nous pouvons alors ranger ces fractions dans l'ordre croissant : $${miseEnEvidence(fracMemeDenomRangees[0].texFraction)}$ < $${miseEnEvidence(fracMemeDenomRangees[1].texFraction)}$ < $${miseEnEvidence(fracMemeDenomRangees[2].texFraction)}$.`

        pb3f[0].correction += `<br>Enfin, nous pouvons ranger les fractions de l'énoncé et la fraction calculée dans l'ordre croissant : $${fracRangees[0].texFraction}$ < $${fracRangees[1].texFraction}$ < $${fracRangees[2].texFraction}$.`

        pb3f[0].correction += `<br> 
                      C'est donc en ${texteEnCouleurEtGras(
                        `${
                          pb3f[0].fractions[
                            pb3f[0].fractions.indexOf(fracRangees[2]) + 1
                          ]
                        }`,
                      )} ${queDevant(pb3f[0].prenoms[0])} fait la plus grande distance.`

        //= =====================================================
        //= ======= Conclusion indice 1 Miss Math ========
        //= =====================================================
        pb3f[1].correction += `<br>${pb3f[1].fractions[1]} a donc remporté $${(pb3f[1].fractions[0] as FractionEtendue).texFraction}$ des sufffrages, `
        pb3f[1].correction += `${pb3f[1].fractions[3]} a remporté $${(pb3f[1].fractions[2] as FractionEtendue).texFraction}$ des sufffrages et `
        pb3f[1].correction += `${pb3f[1].fractions[5]} $${(pb3f[1].fractions[4] as FractionEtendue).texFraction}$ des sufffrages.`

        pb3f[1].correction +=
          '<br> Avec les mêmes dénominateurs pour pouvoir comparer, '
        pb3f[1].correction += `${pb3f[1].fractions[1]} remporte donc $${(fracMemeDenom[0] as unknown as FractionEtendue).texFraction}$, `
        pb3f[1].correction += `${pb3f[1].fractions[3]} $${(fracMemeDenom[1] as unknown as FractionEtendue).texFraction}$ et `
        pb3f[1].correction += `${pb3f[1].fractions[5]} $${(fracMemeDenom[2] as unknown as FractionEtendue).texFraction}$.`

        pb3f[1].correction += `<br>Nous pouvons alors ranger ces fractions dans l'ordre croissant : $${miseEnEvidence(fracMemeDenomRangees[0].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[1].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[2].texFraction)}$.`

        pb3f[1].correction += `<br>Enfin, nous pouvons ranger les fractions de l'énoncé et la fraction calculée dans l'ordre croissant : $${fracRangees[0].texFraction}$ < $${fracRangees[1].texFraction}$ < $${fracRangees[2].texFraction}$.`

        pb3f[1].correction += `<br> 
                      C'est donc ${texteEnCouleurEtGras(
                        `${
                          pb3f[1].fractions[
                            pb3f[1].fractions.indexOf(fracRangees[2]) + 1
                          ]
                        }`,
                      )} qui a été élue.`
      } else {
        //= =====================================================
        //= ======= AVEC 4 FRACTIONS=======
        //= =====================================================
        pb4f = []
        const denomsCool4 = denomsAmis[Number(denomsAmisToSelect.pop())]

        F1 = fraction(1, 3)
        F2 = fraction(1, 3)
        F3 = fraction(1, 3)
        F4 = fraction(1, 3)
        let b = 0
        while (
          b < 100 &&
          (F1.num === F2.num ||
            F1.num === F3.num ||
            F1.num === F4.num ||
            F2.num === F3.num ||
            F2.num === F4.num ||
            F3.num === F4.num ||
            F1.den === F2.den ||
            F1.superieurLarge(fraction(1, 3)) ||
            F2.superieurLarge(fraction(1, 3)) ||
            F3.superieurLarge(fraction(1, 3)) || // Niveau propre à la 5ème (Deux dénominateur multiples de l'un)
            (this.sup2 &&
              (nombreDeChiffresDansLaPartieDecimale(
                arrondi(Math.max(F1.den, F2.den) / Math.min(F1.den, F2.den)),
              ) !== 0 ||
                nombreDeChiffresDansLaPartieDecimale(
                  arrondi(Math.max(F1.den, F3.den) / Math.min(F1.den, F3.den)),
                ) !== 0 ||
                nombreDeChiffresDansLaPartieDecimale(
                  arrondi(Math.max(F3.den, F2.den) / Math.min(F3.den, F2.den)),
                ) !== 0 ||
                Math.max(F1.den, F2.den) / Math.min(F1.den, F2.den) > 13 ||
                Math.max(F1.den, F3.den) / Math.min(F1.den, F3.den) > 13 ||
                Math.max(F3.den, F2.den) / Math.min(F3.den, F2.den) > 13)) || // Niveau propre à la 4ème
            (!this.sup2 && (F1.den === F3.den || F2.den === F3.den)))
        ) {
          // pour éviter la boucle infinie
          b++

          // sélectionne 3 dénominateurs différents et trie par ordre croissant
          const dens = shuffle(denomsCool4).slice(0, 3)
          ;[d1, d2, d3] = dens.sort((a: number, b: number) => a - b)

          n1 = d1 === 2 ? 1 : randint(Math.ceil(d1 / 6), Math.floor(d1 / 3)) // fraction entre 1/6 et 1/3
          n2 = randint(Math.ceil(d2 / 6), Math.floor(d2 / 3)) // fraction entre 1/6 et 1/3
          n3 = randint(Math.ceil(d3 / 6), Math.floor(d3 / 3)) // fraction entre 1/6 et 1/3

          n4 = d1 * d2 * d3 - n1 * d2 * d3 - n2 * d1 * d3 - n3 * d1 * d2 // la somme des quatre vaut 1 !
          d4 = d1 * d2 * d3

          F1 = fraction(n1, d1).simplifie()
          F2 = fraction(n2, d2).simplifie()
          F3 = fraction(n3, d3).simplifie()
          F4 = fraction(n4, d4).simplifie()
        }
        // on mélange
        ;[F1, F2, F3] = shuffle([F1, F2, F3])

        //= =====================================================
        //= ========== indice 0 le mandala===========
        //= =====================================================
        pb4f.push({
          //
          prenoms: [prenom()],
          fractions: [
            F1,
            'carmin',
            F2,
            'ocre jaune',
            F3,
            'turquoise',
            F4,
            'pourpre',
          ],
          enonce: '',
          question: 'Quelle est la couleur qui recouvre le plus de surface ?',
          correction: '',
          question2:
            'Classer, par ordre croissant, les fractions associées à chaque couleur.',
        })

        //= =====================================================
        //= ==========indice 1 le jardin ===========
        //= =====================================================
        pb4f.push({
          // indice 1 le jardin
          prenoms: [],
          fractions: [
            F1,
            'la culture des légumes',
            F2,
            'la culture des plantes aromatiques',
            F3,
            'une serre servant aux semis',
            F4,
            'la culture des fraisiers',
          ],
          enonce: '',
          question: 'Quelle est la culture qui occupe le plus de surface ?',
          correction: '',
          question2:
            'Classer, par ordre croissant, les fractions associées à chaque culture.',
        })

        //= =====================================================
        //= ==========indice 2 le stade ===========
        //= =====================================================
        pb4f.push({
          // indice 2 le stade
          prenoms: [],
          fractions: [
            F1,
            'le pays organisateur',
            F2,
            "l'ensemble des supporters des deux équipes en jeu",
            F3,
            'les sponsors et officiels',
            F4,
            'les places en vente libre',
          ],
          enonce: '',
          question:
            'Quelle est la catégorie la plus importante dans le stade ?',
          correction: '',
          question2:
            'Classer, par ordre croissant, les fractions associées à chaque catégorie dans le stade.',
        })

        //= =====================================================
        //= ==========énoncé indice 0 le mandala  ===========
        //= =====================================================
        pb4f[0].enonce = `${pb4f[0].prenoms[0]} colorie un mandala selon les proportions suivantes : $${(pb4f[0].fractions[0] as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[1]}, `
        pb4f[0].enonce += `$${(pb4f[0].fractions[2] as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[3]}, `
        pb4f[0].enonce += `$${(pb4f[0].fractions[4] as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[5]} et `
        pb4f[0].enonce += `le reste en ${pb4f[0].fractions[7]}.`

        //= =====================================================
        //= ==========énoncé indice 1 le jardin ===========
        //= =====================================================
        pb4f[1].enonce = `Un jardin est aménagé selon les proportions suivantes : $${(pb4f[1].fractions[0] as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[1]}, `
        pb4f[1].enonce += `$${(pb4f[1].fractions[2] as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[3]}, `
        pb4f[1].enonce += `$${(pb4f[1].fractions[4] as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[5]} et `
        pb4f[1].enonce += `le reste par ${pb4f[1].fractions[7]}.`

        //= =====================================================
        //= ==========énoncé indice 2 le stade ===========
        //= =====================================================
        pb4f[2].enonce = `Pour chaque match, les places du stade sont mises en vente dans les proportions suivantes : $${(pb4f[2].fractions[0] as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[1]}, `
        pb4f[2].enonce += `$${(pb4f[2].fractions[2] as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[3]}, `
        pb4f[2].enonce += `$${(pb4f[2].fractions[4] as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[5]} et `
        pb4f[2].enonce += `le reste pour ${pb4f[2].fractions[7]}.`

        //= =====================================================
        //= ========== Correction Commune  ===========
        //= =====================================================
        listefrac2 = listeFractions(F1, F2, F3, F4)
        fracMemeDenom = enleveElementBis(listefrac2.listeMemeDenominateur)
        fracMemeDenomRangees = enleveElementBis(
          listefrac2.listeRangeeMemeDenominateur,
        )
        fracRangees = enleveElementBis(listefrac2.listeRangee)
        denominateurCommun = (
          listefrac2.listeMemeDenominateur[0] as unknown as FractionEtendue
        ).den
        for (let i = 0; i < 3; i++) {
          pb4f[i].correction =
            "Il s'agit d'un problème additif. Il va être nécessaire de réduire les fractions au même dénominateur pour les additionner, les soustraire ou les comparer.<br>"

          if (
            listefrac2.liste[0].den === denominateurCommun &&
            listefrac2.liste[1].den === denominateurCommun &&
            listefrac2.liste[2].den === denominateurCommun
          ) {
            pb4f[i].correction +=
              "Les fractions de l'énoncé ont déjà le même dénominateur."
          } else {
            pb4f[i].correction +=
              "Réduisons les fractions de l'énoncé au même dénominateur : "
            pb4f[i].correction += `$${listefrac2.liste[0].texFraction}$ `
            if (listefrac2.liste[0].den !== denominateurCommun)
              pb4f[i].correction +=
                `$= ${(listefrac2.listeMemeDenominateur[0] as unknown as FractionEtendue).texFraction}$ ; `
            else pb4f[i].correction += ' ; '
            pb4f[i].correction += `$${listefrac2.liste[1].texFraction}$ `
            if (listefrac2.liste[1].den !== denominateurCommun)
              pb4f[i].correction +=
                `$= ${(listefrac2.listeMemeDenominateur[1] as unknown as FractionEtendue).texFraction}$ et `
            else pb4f[i].correction += ' et '
            pb4f[i].correction += `$${listefrac2.liste[2].texFraction}$ `
            if (listefrac2.liste[2].den !== denominateurCommun)
              pb4f[i].correction +=
                `$= ${(listefrac2.listeMemeDenominateur[2] as unknown as FractionEtendue).texFraction}$.<br>`
            else pb4f[i].correction += '.<br>'
          }
        }

        //= =====================================================
        //= =========Correction indice 0 le mandala==========
        //= =====================================================
        pb4f[0].correction +=
          "Calculons d'abord la fraction du mandala recouverte en "

        //= =====================================================
        //= ==========Correction indice 1 le jardin===========
        //= =====================================================
        pb4f[1].correction +=
          "Calculons d'abord la fraction du jardin occupée par "

        //= =====================================================
        //= ==========énoncé indice 2 le stade  ===========
        //= =====================================================
        pb4f[2].correction +=
          "Calculons d'abord la fraction du stade occupée par "

        //= =====================================================
        //= ========== Correction Commune  ===========
        //= =====================================================
        for (let i = 0; i < 3; i++) {
          pb4f[i].correction += `${pb4f[i].fractions[5]} : <br>`
          pb4f[i].correction +=
            `$1-${(pb4f[i].fractions[0] as FractionEtendue).texFraction}-${(pb4f[i].fractions[2] as FractionEtendue).texFraction}-${(pb4f[i].fractions[4] as FractionEtendue).texFraction} = `
          pb4f[i].correction +=
            `\\dfrac{${denominateurCommun}}{${denominateurCommun}}-${(fracMemeDenom[0] as unknown as FractionEtendue).texFraction}-${(fracMemeDenom[1] as unknown as FractionEtendue).texFraction}-${(fracMemeDenom[2] as unknown as FractionEtendue).texFraction} = `
          pb4f[i].correction +=
            `\\dfrac{${denominateurCommun}-${(fracMemeDenom[0] as unknown as FractionEtendue).num}-${(fracMemeDenom[1] as unknown as FractionEtendue).num}-${(fracMemeDenom[2] as unknown as FractionEtendue).num}}{${denominateurCommun}} = `
          pb4f[i].correction +=
            `${(fracMemeDenom[3] as unknown as FractionEtendue).texFraction}`
          if (
            (fracMemeDenom[3] as unknown as FractionEtendue).den !==
            (pb4f[i].fractions[6] as unknown as FractionEtendue).den
          ) {
            pb4f[i].correction +=
              ` = ${(pb4f[i].fractions[6] as FractionEtendue).texFraction}$`
          } else {
            pb4f[i].correction += '$'
          }
        }

        //= =====================================================
        //= ========== Conclusion indice 0 le mandala ===========
        //= =====================================================

        pb4f[0].correction += `<br>Le mandala est donc colorié de la façon suivante : $${(pb4f[0].fractions[0] as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[1]}, `
        pb4f[0].correction += `$${(pb4f[0].fractions[2] as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[3]}, `
        pb4f[0].correction += `$${(pb4f[0].fractions[4] as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[5]} et `
        pb4f[0].correction += `$${(pb4f[0].fractions[6] as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[7]}.`

        pb4f[0].correction +=
          '<br> Avec les mêmes dénominateurs pour pouvoir comparer, '
        pb4f[0].correction += `le mandala est donc colorié de la façon suivante : $${(fracMemeDenom[0] as unknown as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[1]}, `
        pb4f[0].correction += `$${(fracMemeDenom[1] as unknown as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[3]}, `
        pb4f[0].correction += `$${(fracMemeDenom[2] as unknown as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[5]} et `
        pb4f[0].correction += `$${(fracMemeDenom[3] as unknown as FractionEtendue).texFraction}$ en ${pb4f[0].fractions[7]}.`

        pb4f[0].correction += `<br>Nous pouvons alors ranger ces fractions dans l'ordre croissant : $${miseEnEvidence(fracMemeDenomRangees[0].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[1].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[2].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[3].texFraction)}$.`

        pb4f[0].correction += `<br>Enfin, nous pouvons ranger les fractions de l'énoncé et la fraction calculée dans l'ordre croissant : $${fracRangees[0].texFraction} < ${fracRangees[1].texFraction} < ${fracRangees[2].texFraction} < ${fracRangees[3].texFraction}$.`

        pb4f[0].correction += `<br> 
                      C'est donc en ${texteEnCouleurEtGras(
                        `${
                          pb4f[0].fractions[
                            pb4f[0].fractions.indexOf(fracRangees[3]) + 1
                          ]
                        }`,
                      )} que le mandala est le plus recouvert.`

        //= =====================================================
        //= ========== Conclusion indice 1 le jardin ===========
        //= =====================================================
        pb4f[1].correction += `<br>Le jardin est donc occupé de la façon suivante : $${(pb4f[1].fractions[0] as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[1]}, `
        pb4f[1].correction += `$${(pb4f[1].fractions[2] as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[3]}, `
        pb4f[1].correction += `$${(pb4f[1].fractions[4] as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[5]} et `
        pb4f[1].correction += `$${(pb4f[1].fractions[6] as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[7]}.`

        pb4f[1].correction +=
          '<br> Avec les mêmes dénominateurs pour pouvoir comparer, '
        pb4f[1].correction += `le jardin est donc occupé de la façon suivante : $${(fracMemeDenom[0] as unknown as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[1]}, `
        pb4f[1].correction += `$${(fracMemeDenom[1] as unknown as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[3]}, `
        pb4f[1].correction += `$${(fracMemeDenom[2] as unknown as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[5]} et `
        pb4f[1].correction += `$${(fracMemeDenom[3] as unknown as FractionEtendue).texFraction}$ par ${pb4f[1].fractions[7]}.`

        pb4f[1].correction += `<br>Nous pouvons alors ranger ces fractions dans l'ordre croissant : $${miseEnEvidence(fracMemeDenomRangees[0].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[1].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[2].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[3].texFraction)}$.`
        pb4f[1].correction += `<br>Enfin, nous pouvons ranger les fractions de l'énoncé et la fraction calculée dans l'ordre croissant : $${fracRangees[0].texFraction} < ${fracRangees[1].texFraction} < ${fracRangees[2].texFraction} < ${fracRangees[3].texFraction}$.`

        pb4f[1].correction += `<br> 
                      C'est donc par ${texteEnCouleurEtGras(
                        `${
                          pb4f[1].fractions[
                            pb4f[1].fractions.indexOf(fracRangees[3]) + 1
                          ]
                        }`,
                      )} que le jardin est le plus occupé.`

        //= =====================================================
        //= ========== Conclusion indice 2 le stade ===========
        //= =====================================================
        pb4f[2].correction += `<br>Le stade est donc occupé de la façon suivante : $${(pb4f[2].fractions[0] as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[1]}, `
        pb4f[2].correction += `$${(pb4f[2].fractions[2] as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[3]}, `
        pb4f[2].correction += `$${(pb4f[2].fractions[4] as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[5]} et `
        pb4f[2].correction += `$${(pb4f[2].fractions[6] as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[7]}.`

        pb4f[2].correction +=
          '<br> Avec les mêmes dénominateurs pour pouvoir comparer, '
        pb4f[2].correction += `le stade est donc occupé de la façon suivante : $${(fracMemeDenom[0] as unknown as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[1]}, `
        pb4f[2].correction += `$${(fracMemeDenom[1] as unknown as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[3]}, `
        pb4f[2].correction += `$${(fracMemeDenom[2] as unknown as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[5]} et `
        pb4f[2].correction += `$${(fracMemeDenom[3] as unknown as FractionEtendue).texFraction}$ pour ${pb4f[2].fractions[7]}.`

        pb4f[2].correction += `<br>Nous pouvons alors ranger ces fractions dans l'ordre croissant : $${miseEnEvidence(fracMemeDenomRangees[0].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[1].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[2].texFraction)}$, $${miseEnEvidence(fracMemeDenomRangees[3].texFraction)}$.`
        pb4f[2].correction += `<br>Enfin, nous pouvons ranger les fractions de l'énoncé et la fraction calculée dans l'ordre croissant : $${fracRangees[0].texFraction} < ${fracRangees[1].texFraction} < ${fracRangees[2].texFraction} < ${fracRangees[3].texFraction}$.`
        pb4f[2].correction += `<br> 
                      C'est donc pour ${texteEnCouleurEtGras(
                        `${
                          pb4f[2].fractions[
                            pb4f[2].fractions.indexOf(fracRangees[3]) + 1
                          ]
                        }`,
                      )} que le nombre de places est le plus important.`
      }

      /* ************************************************************
                  AFFICHAGE DE L'ENONCE ET DE LA CORRECTION
       ************************************************************** */

      const probleme =
        listeTypeDeQuestions[i] < 3
          ? pb3f[listeTypeDeQuestions[i] - 1]
          : pb4f[listeTypeDeQuestions[i] - 3]
      texte = `${probleme.enonce} <br> ${probleme.question}<br>`
      texteCorr = `${probleme.correction}`

      /* ************************************************************
                          GESTION DE L'INTERACTIF
       ************************************************************** */

      if (this.interactif) {
        const indiceFracRangees = listeTypeDeQuestions[i] > 2 ? 3 : 2
        const propositionsFinales = [
          {
            texte: probleme.fractions[1],
            statut:
              `${probleme.fractions[probleme.fractions.indexOf(fracRangees[indiceFracRangees]) + 1]}` ===
              probleme.fractions[1],
          },
          {
            texte: probleme.fractions[3],
            statut:
              `${probleme.fractions[probleme.fractions.indexOf(fracRangees[indiceFracRangees]) + 1]}` ===
              probleme.fractions[3],
          },
          {
            texte: probleme.fractions[5],
            statut:
              `${probleme.fractions[probleme.fractions.indexOf(fracRangees[indiceFracRangees]) + 1]}` ===
              probleme.fractions[5],
          },
        ]
        if (listeTypeDeQuestions[i] > 2) {
          propositionsFinales.push({
            texte: probleme.fractions[7],
            statut:
              `${probleme.fractions[probleme.fractions.indexOf(fracRangees[indiceFracRangees]) + 1]}` ===
              probleme.fractions[7],
          })
        }

        const texte2 = `${probleme.question2}`

        this.autoCorrection[2 * i] = {
          propositions: propositionsFinales as UneProposition[],
        }

        const monQcm = propositionsQcm(this, 2 * i)
        texte += monQcm.texte
        texte += numAlpha(1) + texte2
        texte +=
          '<br>' +
          remplisLesBlancs(
            this,
            2 * i + 1,
            '%{champ1}~<~%{champ2}~<~%{champ3}' +
              (listeTypeDeQuestions[i] > 2 ? '~<~%{champ4}' : ''),
            ` ${KeyboardType.clavierDeBaseAvecFraction}`,
          )
        handleAnswers(
          this,
          2 * i + 1,
          listeTypeDeQuestions[i] < 3
            ? {
                bareme: (listePoints) => [
                  listePoints[0] + listePoints[1] + listePoints[2],
                  3,
                ],
                champ1: { value: fracMemeDenomRangees[0].texFraction },
                champ2: { value: fracMemeDenomRangees[1].texFraction },
                champ3: { value: fracMemeDenomRangees[2].texFraction },
              }
            : {
                bareme: (listePoints) => [
                  Math.ceil(
                    0.74 *
                      (listePoints[0] +
                        listePoints[1] +
                        listePoints[2] +
                        listePoints[3]),
                  ),
                  3,
                ],
                champ1: { value: fracMemeDenomRangees[0].texFraction },
                champ2: { value: fracMemeDenomRangees[1].texFraction },
                champ3: { value: fracMemeDenomRangees[2].texFraction },
                champ4: { value: fracMemeDenomRangees[3].texFraction },
              },
        )
      }

      /* ************************************************************
                     FIN DE LA GESTION DE L'INTERACTIF
       ************************************************************** */

      if (this.questionJamaisPosee(i, texteCorr)) {
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
