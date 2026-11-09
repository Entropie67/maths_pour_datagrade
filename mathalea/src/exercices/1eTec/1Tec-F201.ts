import { propositionsQcm } from '../../lib/interactif/qcm'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import ExpressionAParabole from './1Tec-F20'

export const dateDePublication = '20/04/2026'
export const titre = 'Associer une expression algébrique à une parabole'
/**
 * @author Jordan Martin
 */
export const uuid = '203cf'

export const refs = {
  'fr-fr': ['1Tec-F25'],
  'fr-ch': [],
}

export const interactifReady = true

export default class ParaboleAExpression extends ExpressionAParabole {
  // Nombre de pixels par unité graphque
  pixelsUnite = 20

  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      "Types d'expression",
      `Nombres séparés par des tirets\n1 : $ax^2$\n2 : $ax^2 + c$\n3 : $a(x-r_1)(x-r_2)$\n4 : Mélange`,
    ]
    this.sup = 4
    this.besoinFormulaire2Texte = [
      `Probabilité qu'aucune expression ne corresponde`,
      `Écriture décimale`,
    ]
    this.sup2 = '0'
  }

  nouvelleVersion() {
    // Gestion du choix du type d'expression
    const expressionsPossibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })

    // Probabilité décimale que la représentation graphique ne soit pas celle d'une fonction polynome de degré 2
    let probaPasDegre2
    try {
      probaPasDegre2 = parseFloat(this.sup2.replace(`,`, `.`))
    } catch {
      probaPasDegre2 = 0
    }

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const choixExpression = expressionsPossibles[i]
      // Coef dominant
      const coefDominant = randint(-12, 12, [0, 1, 2]) / 10
      const coefDominantAlg = rienSi1(coefDominant)
      let expressionLatex = ''
      let graphe = ''
      let erreur1 = ''
      let erreur2 = ''
      let erreur3 = ''
      texteCorr = ''
      let polynome = new Polynome({ coeffs: [0] })

      const pasDegre2 = Math.random() < probaPasDegre2

      // Distinguer le cas ax², ax²+c et a(x-r_1)(x-r_2)
      switch (choixExpression) {
        // Cas ax²
        case this.typePolynome.monome: {
          // Distinguer les cas degré2 et non degré 2
          if (pasDegre2) {
            const objetEnonce = this.affineOuPoly3({
              pixelsParCm: this.pixelsUnite,
            })
            polynome = objetEnonce.polynome
            graphe = objetEnonce.graphe
            expressionLatex = `${coefDominantAlg}x^2`
            // Gestion de l'erreur 1 : Autre degré 2
            erreur1 =
              `${rienSi1(-coefDominant)}x^2` +
              ecritureAlgebrique(randint(-3, 3, [0]))
            // Correction
            texteCorr = `Les expressions proposées sont toutes celles de fonctions polynômes de degré 2.<br>`
            texteCorr += `Leurs représentations graphiques sont des paraboles. Or la représentation proposée n'est pas une parabole.`
            texteCorr += `<br>${texteEnCouleurEtGras('Aucune expression ne correspond.')}`
          }
          // Bien degré 2
          else {
            polynome = new Polynome({ coeffs: [0, 0, coefDominant] })
            expressionLatex = polynome.toLatex()
            const fenetre = this.reglerFenetrePoly2(coefDominant, 0, 0)
            graphe = this.genererGraphique(
              Object.assign(
                { fonction: polynome.fonction, pixelsParCm: this.pixelsUnite },
                fenetre,
              ),
            )
            // Gestion de l'erreur 1 : affine ou polynome degré 3
            erreur1 =
              randint(0, 1) === 0
                ? `${coefDominantAlg}x`
                : `${coefDominantAlg}x^3`
            // Correction
            let signeCoef, orientation
            if (coefDominant > 0) {
              signeCoef = texteGras('positif')
              orientation = texteGras('haut')
            } else {
              signeCoef = texteGras('négatif')
              orientation = texteGras('bas')
            }
            texteCorr = `La représentation graphique est une parabole orientée vers le ${orientation}. Elle admet l'axe des ordonnées comme axe de symétrie et passe par le point $(0;0)$.<br>`
            texteCorr += `L'expression de la fonction associée est donc de la forme $ax^2$ avec $a$ ${signeCoef}.`
            texteCorr += `<br>Donc $${miseEnEvidence(`f(x)=${expressionLatex}`)}$.`
          }
          // Gestion de l'erreur 2 : signe du coefficient dominant mal interprété
          erreur2 = `${rienSi1(-coefDominant)}x^2`
          // Gestion de l'erreur 3 : décalage vertical
          erreur3 =
            `${coefDominantAlg}x^2` + ecritureAlgebrique(randint(-3, 3, [0]))
          break
        }
        // Cas /ax²+c
        case this.typePolynome.monomeEtConstante: {
          const coefConstant = randint(-3, 3, [0])
          const coefConstantAlg = ecritureAlgebrique(coefConstant)
          // Distinguer les cas degré2 et non degré 2
          if (pasDegre2) {
            const objetEnonce = this.affineOuPoly3({
              pixelsParCm: this.pixelsUnite,
            })
            polynome = objetEnonce.polynome
            graphe = objetEnonce.graphe
            expressionLatex = `${coefDominantAlg}x^2` + coefConstantAlg
            // Gestion de l'erreur 1 : autre degré 2
            erreur1 =
              `${rienSi1(-coefDominant)}x^2` +
              ecritureAlgebrique(randint(-3, 3, [coefConstant, 0]))
            // Correction
            texteCorr = `Les expressions proposées sont toutes celles de fonctions polynômes de degré 2.<br>`
            texteCorr += `Leurs représentations graphiques sont des paraboles. Or la représentation proposée n'est pas une parabole.`
            texteCorr += `<br>${texteEnCouleurEtGras('Aucune expression ne correspond.')}`
          }
          // Bien degré 2
          else {
            polynome = new Polynome({
              coeffs: [coefConstant, 0, coefDominant],
            })
            expressionLatex = polynome.toLatex()
            const fenetre = this.reglerFenetrePoly2(
              coefDominant,
              0,
              coefConstant,
            )
            graphe = this.genererGraphique(
              Object.assign(
                { fonction: polynome.fonction, pixelsParCm: this.pixelsUnite },
                fenetre,
              ),
            )
            // Gestion de l'erreur 1 : affine ou polynome degré 3
            erreur1 =
              randint(0, 1) === 0
                ? `${coefDominantAlg}x` + coefConstantAlg
                : `${coefDominantAlg}x^3` + coefConstantAlg
            // Correction
            let signeCoef, orientation
            if (coefDominant > 0) {
              signeCoef = texteGras('positif')
              orientation = texteGras('haut')
            } else {
              signeCoef = texteGras('négatif')
              orientation = texteGras('bas')
            }
            texteCorr = `La représentation graphique est une parabole orientée vers le ${orientation}. Elle admet l'axe des ordonnées comme axe de symétrie et passe par le point $(0;${texNombre(coefConstant)})$.<br>`
            texteCorr += `L'expression de la fonction associée est donc de la forme $ax^2 + c$ avec $a$ ${signeCoef} et $c=${texNombre(coefConstant)}$.`
            texteCorr += `<br>Donc $${miseEnEvidence(`f(x)=${expressionLatex}`)}$.`
          }
          // Gestion de l'erreur 2 : signe du coefficient dominant mal interprété
          erreur2 = `${rienSi1(-coefDominant)}x^2` + coefConstantAlg
          // Gestion de l'erreur 3 : même coefficient dominant mais erreur de décalage vertical
          const decalage = randint(-3, 3, [coefConstant])
          erreur3 =
            `${coefDominantAlg}x^2` +
            `${decalage === 0 ? '' : ecritureAlgebrique(decalage)}`
          break
        }
        // Cas a(x-r_1)(r-r_2)
        case this.typePolynome.deuxRacines: {
          const racine1 = randint(-4, 4)
          const racine2 = randint(-4, 4, [0])
          // Opposé de la racine2 en écriture algébrique pour l'expression
          const racine2AlgOpp = ecritureAlgebrique(-racine2)
          // Exression
          const expressionSansCoef = this.gererExpressionDeuxRacines(
            coefDominant,
            racine1,
            racine2,
          )
          expressionLatex = rienSi1(coefDominant) + expressionSansCoef
          // Distinguer les cas degré2 et non degré 2
          if (pasDegre2) {
            const objetEnonce = this.affineOuPoly3({
              pixelsParCm: this.pixelsUnite,
            })
            polynome = objetEnonce.polynome
            graphe = objetEnonce.graphe
            // Gestion de l'erreur 1 : autre degré 2
            erreur1 =
              `${rienSi1(-coefDominant)}` +
              `(x${ecritureAlgebrique(randint(-4, 4, [0, -racine2, -racine1]))})` +
              `(x${racine2AlgOpp})`
            // Correction
            texteCorr = `Les expressions proposées sont toutes celles de fonctions polynômes de degré 2.<br>`
            texteCorr += `Leurs représentations graphiques sont des paraboles. Or la représentation proposée n'est pas une parabole.`
            texteCorr += `<br>${texteEnCouleurEtGras('Aucune expression ne correspond.')}`
          }
          // Bien degré 2
          else {
            polynome = Polynome.fromRoots([racine1, racine2]).multiply(
              coefDominant,
            )
            // Graphe
            const absSommet = (racine1 + racine2) / 2
            const extremum = polynome.fonction(absSommet)
            const fenetre = this.reglerFenetrePoly2(
              coefDominant,
              absSommet,
              extremum,
            )
            graphe = this.genererGraphique(
              Object.assign(
                { fonction: polynome.fonction, pixelsParCm: this.pixelsUnite },
                fenetre,
              ),
            )
            // Gestion de l'erreur 1 : affine ou polynome degré 3
            erreur1 =
              randint(0, 1) === 0
                ? `(x${racine2AlgOpp})`
                : expressionLatex +
                  `(x${ecritureAlgebrique(-randint(-4, 4, [racine1, racine2, 0]))})`
            // Correction
            let signeCoef, orientation
            if (coefDominant > 0) {
              signeCoef = texteGras('positif')
              orientation = texteGras('haut')
            } else {
              signeCoef = texteGras('négatif')
              orientation = texteGras('bas')
            }
            texteCorr = `La représentation graphique est une parabole orientée vers le ${orientation}.<br>`
            texteCorr +=
              racine1 === racine2
                ? `Son sommet est le point $(${texNombre(racine1)};0)$ ce qui indique que $${texNombre(racine1)}$ est une racine double.<br>L'expression de la fonction associée est donc de la forme $a(x-r)^2$ avec $a$ ${signeCoef} et $r=${texNombre(racine1)}$.`
                : `Elle passe par les points $(${texNombre(racine1)};0)$ et $(${texNombre(racine2)};0)$<br>L'expression de la fonction associée est donc de la forme $a(x-r_1)(x-r_2)$ avec $a$ ${signeCoef}, $r_1=${texNombre(racine1)}$ et $r_2=${texNombre(racine2)}$`
            texteCorr += `<br>Donc $${miseEnEvidence(`f(x)=${expressionLatex}`)}$.`
          }
          // Gestion de l'erreur 2 : signe du coefficient dominant mal interprété
          erreur2 = rienSi1(-coefDominant) + expressionSansCoef
          // Gestion de l'erreur 3 : une racine changée ou les deux racines opposées
          erreur3 =
            racine1 === -racine2
              ? rienSi1(coefDominant) +
                `(x${ecritureAlgebrique(randint(-4, 4, [racine2, -racine2, 0]))})` +
                `(x${racine2AlgOpp})`
              : rienSi1(coefDominant) +
                this.gererExpressionDeuxRacines(
                  coefDominant,
                  -racine1,
                  -racine2,
                )
          break
        }
      }

      texte = `Choisir l'expression de la fonction dont la représentation graphique est la suivante.<br>`
      texte += graphe

      const propositions = [
        {
          texte: `$f(x)=${expressionLatex}$`,
          statut: !pasDegre2,
        },
        { texte: `$f(x)=${erreur1}$`, statut: false },
        { texte: `$f(x)=${erreur2}$`, statut: false },
        { texte: `$f(x)=${erreur3}$`, statut: false },
        {
          texte: `Aucune expression ne correspond.`,
          statut: pasDegre2,
        },
      ]

      this.autoCorrection[i] = {
        options: { ordered: false, vertical: true, lastChoice: 3 },
        enonce: '',
        propositions,
      }

      const monQCM = propositionsQcm(this, i)

      if (this.questionJamaisPosee(i, ...polynome.monomes)) {
        this.listeQuestions[i] = texte + monQCM.texte
        this.listeCorrections[i] = texteCorr + monQCM.texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  // Gère le cas particulier de l'expression Latex avec deux racines sans proposer le cas (racine - x)
  public gererExpressionDeuxRacines(
    coefDominant: number,
    racine1: number,
    racine2: number,
  ): string {
    let expression
    // Cas de la racine2, jamais nulle
    expression = `(x${ecritureAlgebrique(-racine2)})`
    // Cas d'égalité (dans ce cas, racine1 est non nulle) : (x - r2)²
    if (racine1 === racine2) return expression + `^2`
    // Si racine1 nulle
    if (racine1 === 0) expression = `x` + expression
    else expression = `(x${ecritureAlgebrique(-racine1)})` + expression
    return expression
  }
}
