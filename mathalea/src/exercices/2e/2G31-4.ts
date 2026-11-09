import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer une équation réduite d'une droite passant par un point et parallèle ou perpendiculaire à une droite donnée"
export const dateDePublication = '25/11/2024'
export const interactifReady = true
export const uuid = '2db22'
export const refs = {
  'fr-fr': ['2G31-4'],
  'fr-ch': ['1mF2-12', '11LCFA2E-9', '11LSFA2E-9'],
}

/**
 * Droite passant par un point perpendiculaire à une droite donnée
 * @author Nathan Scheinmann
 */

export default class ExerciceEquationSecondDegre extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Position relative',
      '1 : Parallèle\n2 : Perpendiculaire \n3 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Type des coefficients',
      '1 : Entiers\n2 : Fractionnaires \n3 : Mélange',
    ]

    this.sup = 3
    this.sup2 = 3
    this.nbQuestions = 3
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['parallele', 'perpendiculaire'],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    const choixCoeff = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['entier', 'fraction'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })
    function pointSurDroite(
      point: FractionEtendue[],
      droite: FractionEtendue[],
    ) {
      if (
        droite[0]
          .produitFraction(point[0])
          .sommeFraction(droite[1])
          .isEqual(point[1])
      ) {
        return true
      } else {
        return false
      }
    }
    if (this.nbQuestions === 1) {
      this.consigne = "Déterminer l'équation réduite de la droite ci-dessous."
    } else {
      this.consigne = "Déterminer l'équation réduite des droites ci-dessous."
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let point = [
        new FractionEtendue(randint(-10, 10), 1),
        new FractionEtendue(randint(-10, 10), 1),
      ]
      let droite = [new FractionEtendue(0, 1), new FractionEtendue(0, 1)]

      do {
        if (choixCoeff[i] === 'entier') {
          point = [
            new FractionEtendue(randint(-10, 10), 1),
            new FractionEtendue(randint(-10, 10), 1),
          ]
          droite = [
            new FractionEtendue(randint(-10, 10, [0]), 1),
            new FractionEtendue(randint(-10, 10), 1),
          ]
        } else {
          point = [
            new FractionEtendue(randint(-10, 10), randint(-10, 10, [0])),
            new FractionEtendue(randint(-10, 10), randint(-10, 10, [0])),
          ]
          droite = [
            new FractionEtendue(randint(-10, 10, [0]), randint(-10, 10, [0])),
            new FractionEtendue(randint(-10, 10), randint(-10, 10, [0])),
          ]
        }
      } while (pointSurDroite(point, droite))
      texte += `La droite $d_{${i + 1}}$ passant par le point $${lettreDepuisChiffre(i + 1)}\\left(${point[0].texFractionSimplifiee};${point[1].texFractionSimplifiee}\\right)$ et ${listeTypeDeQuestions[i] === 'parallele' ? 'parallèle' : 'perpendiculaire'} à la droite d'équation $y=${rienSi1(droite[0].simplifie())}x${droite[1].num === 0 ? '' : ecritureAlgebrique(droite[1].simplifie())}$.`
      let nPente = new FractionEtendue(0, 1)
      if (listeTypeDeQuestions[i] === 'parallele') {
        nPente = droite[0].simplifie()
      } else {
        nPente = droite[0].oppose().inverse().simplifie()
      }
      const equationSansOrdonnee = `y=${rienSi1(nPente)}x+b`
      const equationAvecPoint = `y_{${lettreDepuisChiffre(i + 1)}}=${rienSi1(nPente)}x_{${lettreDepuisChiffre(i + 1)}}+b`
      const equationAvecValeurs = `${point[1].texFractionSimplifiee}=${rienSi1(nPente)}\\times${point[0].simplifie().ecritureParentheseSiNegatif}+b`
      const nOdonnee = point[1]
        .differenceFraction(nPente.produitFraction(point[0]))
        .simplifie()
      texteCorr += `La pente de la droite $d_{${i + 1}}$ est ${listeTypeDeQuestions[i] === 'parallele' ? 'la même que' : "l'opposée de l'inverse de"} celle de la droite donnée, ${listeTypeDeQuestions[i] === 'perpendiculaire' ? 'car le produit des pentes de deux droites perpendiculaires doit valoir $-1$.' : '.'} Elle vaut donc $${nPente.texFractionSimplifiee}$.<br>`
      texteCorr += `On peut écrire l'équation suivante pour la droite $d_{${i + 1}}$ 
      \\[${equationSansOrdonnee}.\\] où il faut encore déterminer la valeur de l'ordonnée à l'origine $b$. `
      texteCorr += `On sait que la droite passe par le point $${lettreDepuisChiffre(i + 1)}\\left(${point[0].texFractionSimplifiee};${point[1].texFractionSimplifiee}\\right)$, ainsi `
      texteCorr += `$${equationAvecPoint}.$ `
      texteCorr += `En remplaçant les valeurs de $x_{${lettreDepuisChiffre(i + 1)}}$ et $y_{${lettreDepuisChiffre(i + 1)}}$ par celles du point, on a`
      texteCorr += `\\[${equationAvecValeurs}.\\]`
      texteCorr +=
        "On détermine la valeur de $b$ en l'isolant dans l'équation précédente, on obtient "
      texteCorr += `$b=${nOdonnee.texFractionSimplifiee}$. `
      texteCorr += `L'équation réduite de la droite $d_{${i + 1}}$ est`
      texteCorr += `\\[y=${miseEnEvidence(`${rienSi1(nPente.simplifie())}x${nOdonnee.num === 0 ? '' : ecritureAlgebrique(nOdonnee.simplifie())}`)}\\]`

      if (
        this.questionJamaisPosee(
          i,
          point[0].texFractionSimplifiee,
          point[1].texFractionSimplifiee,
          droite[0].texFractionSimplifiee,
          droite[1].texFractionSimplifiee,
        )
      ) {
        this.listeQuestions[i] =
          texte +
          (this.interactif
            ? '<br>' +
              ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecVariable,
                { texteAvant: ' $y=$' },
              )
            : '')
        handleAnswers(this, i, {
          reponse: {
            value: `${rienSi1(nPente.simplifie())}x${nOdonnee.num === 0 ? '' : ecritureAlgebrique(nOdonnee.simplifie())}`,
            options: { expressionsForcementReduites: true },
          },
        })
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
