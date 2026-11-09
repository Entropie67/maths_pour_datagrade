import { propositionsQcm } from '../../lib/interactif/qcm'
import { tableauVariationsFonction } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre = 'Comparer des images dans un tableau de variations'
export const dateDeModifImportante = '08/09/2024'
export const interactifReady = true

export const uuid = '2f857'
export const refs = {
  'fr-fr': ['2F41-3'],
  'fr-ch': ['1mF1-18'],
}

/**
 *
 * @author Gilles Mora
 */

export default class ComparerImagesTableau extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : On peut comparer avec le sens de variation\n2 : On peut comparer par encadrement\n3 : On ne peut pas comparer\n4 : Mélange',
    ]
    this.sup = '4'
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      let xMin // La borne gauche de l'intervalle d'étude (prévoir une valeur de remplacement pour les infinis + et -)
      let xMax // La borne droite de l'intervalle d'étude
      let substituts = [] // les valeur de substitution pour xMin ou xMax...
      let tolerance // la tolérance doit être réglée au cas par cas, car pour la dérivée de 1/x entre 17 et 19 par exemple, il y a trop peu de différence avec zéro !
      let props

      const enonce = `On donne ci-dessous, le tableau de variations d'une fonction $f$. <br>
 Comparer, si possible, `
      const choix = choice([true, false])
      const a = randint(-3, 3, 0)
      const alpha = randint(-5, 5, 0)
      const beta = randint(1, 3)
      const k = randint(-3, 3)
      const rac1 = randint(-3, 3) // rac de la dérivée pour poly3
      const rac2 = rac1 + randint(3, 6, 0) // rac de la dérivée pour poly3
      const fonction1 = (x: number) => a * (x - alpha) ** 2 + beta // forme développée
      const derivee1 = (x: number) => 2 * a * (x - alpha) // Sa dérivée
      const fonction2 = (x: number) =>
        2 * a * x ** 3 -
        3 * a * rac1 * x ** 2 -
        3 * a * rac2 * x ** 2 +
        6 * a * rac1 * rac2 * x +
        k
      const derivee2 = (x: number) =>
        6 * a * x ** 2 -
        6 * a * rac1 * x -
        6 * a * rac2 * x +
        6 * a * rac1 * rac2
      switch (listeDeQuestions[i]) {
        case 1: // on peut comparer grâce aux variations
          switch (randint(0, 1)) {
            case 0:
              {
                const borneInf = alpha - randint(3, 12)
                const borneSup = alpha + randint(3, 12)
                const p = new Trinome(0, 0, 0) // Le constructeur de Trinome veut 3 arguments
                p.defFormeCanonique(a, alpha, beta)

                const x1 = choix
                  ? randint(borneInf + 1, alpha - 2)
                  : randint(alpha + 1, borneSup - 2)
                const x2 = choix
                  ? randint(x1 + 1, alpha - 1)
                  : randint(x1 + 1, borneSup - 1)
                tolerance = 0.005
                xMin = borneInf
                xMax = borneSup
                substituts = [
                  {
                    antVal: borneInf,
                    antTex: `$${borneInf}$`,
                    imgVal: Number(p.image(borneInf)),
                    imgTex: `$${p.image(borneInf).texFraction}$`,
                  },
                  {
                    antVal: p.alpha.valeurDecimale,
                    antTex: p.alpha.simplifie().texFSD,
                    imgVal: p.beta.valeurDecimale,
                    imgTex: `$${p.beta.simplifie().texFSD}$`,
                  },
                  {
                    antVal: borneSup,
                    antTex: `${borneSup}`,
                    imgVal: Number(p.image(borneSup)),
                    imgTex: `$${p.image(borneSup).texFraction}$`,
                  },
                ]
                texte = enonce + `$f(${x1})$ et $f(${x2})$.<br><br>`
                texte += tableauVariationsFonction(
                  fonction1 as (x: number | FractionEtendue) => number,
                  derivee1 as (x: number | FractionEtendue) => number,
                  xMin,
                  xMax,
                  { ligneDerivee: false, substituts, step: 0.5, tolerance },
                )
                texteCorr = `D'après le tableau de variations, la fonction $f$ est strictement ${a > 0 ? `${choix ? 'décroissante' : 'croissante'}` : `${choix ? 'croissante' : 'décroissante'}`} sur ${choix ? `$[${borneInf}\\,;\\,${alpha}]$` : `$[${alpha}\\,;\\,${borneSup}]$`}. <br>
          De plus,<br>
           ${choix ? `$\\bullet$ $${x1}\\in [${borneInf}\\,;\\,${alpha}]$,<br>$\\bullet$ $${x2}\\in [${borneInf}\\,;\\,${alpha}]$, <br>$\\bullet$ $${x1}<${x2}$` : `$\\bullet$ $${x1}\\in [${alpha}\\,;\\,${borneSup}]$,<br> $\\bullet$ $${x2}\\in [${alpha}\\,;\\,${borneSup}]$, <br>$\\bullet$ $${x1}<${x2}$`}.<br>
         On sait que si une fonction est strictement ${a > 0 ? `${choix ? 'décroissante' : 'croissante'}` : `${choix ? 'croissante' : 'décroissante'}`} sur un intervalle $[a\\,;\\,b]$, alors ses antécédents et ses images sont rangés dans 
         ${a > 0 ? `${choix ? "l'ordre inverse" : 'le même ordre'}` : `${choix ? 'le même ordre' : "l'ordre inverse"}`}.
         <br>
         Cela signifie que pour tout $x_1\\in[a\\,;\\,b]$ et $x_2\\in[a\\,;\\,b]$, si $x_1 < x_2$ alors ${a > 0 ? `${choix ? '$f(x_1) > f(x_2)$' : '$f(x_1) < f(x_2)$'}` : `${choix ? '$f(x_1) < f(x_2)$' : '$f(x_1) > f(x_2)$'}`}
         <br>
          Par conséquent, comme $${x1}<${x2}$, alors ${a > 0 ? `${choix ? `${texteEnCouleurEtGras(`$f(${x1}) > f(${x2})$`)}.` : `${texteEnCouleurEtGras(`$f(${x1}) < f(${x2})$`)}.`}` : `${choix ? `${texteEnCouleurEtGras(`$f(${x1}) < f(${x2})$`)}.` : `${texteEnCouleurEtGras(`$f(${x1}) > f(${x2})$`)}.`}`}
          `
                this.autoCorrection[i] = {
                  enonce: texte,
                  propositions: [
                    {
                      texte: `${a > 0 ? `${choix ? `$f(${x1}) > f(${x2})$` : `$f(${x1}) < f(${x2})$`}` : `${choix ? `$f(${x1}) < f(${x2})$` : `$f(${x1}) > f(${x2})$`}`}`,
                      statut: true,
                    },
                    {
                      texte: `${a > 0 ? `${choix ? `$f(${x1}) < f(${x2})$` : `$f(${x1}) > f(${x2})$`}` : `${choix ? `$f(${x1}) > f(${x2})$` : `$f(${x1}) < f(${x2})$`}`}`,
                      statut: false,
                    },
                    {
                      texte: 'On ne peut pas savoir',
                      statut: false,
                    },
                  ],
                }
                props = propositionsQcm(this, i)
                if (this.interactif) texte += props.texte
              }
              break
            case 1:
              {
                let x1, x2
                const borneInf = rac1 - randint(3, 5)
                const borneSup = rac2 + randint(3, 5)
                const ImBorneInf = a > 0 ? randint(-10, 5) : randint(-5, 10)
                const ImBorneSup = a > 0 ? randint(8, 15) : randint(-15, -8)
                const Imx1 = a > 0 ? randint(10, 15) : randint(-15, -10)
                const Imx2 = a > 0 ? randint(-3, 5) : randint(-5, 3)
                const choixIntervalle = choice([1, 2, 3])
                if (choixIntervalle === 1) {
                  x1 = randint(borneInf + 1, rac1 - 2)
                  x2 = x1 + 1
                }
                if (choixIntervalle === 2) {
                  x1 = rac2 - 2
                  x2 = rac2 - 1
                }
                if (choixIntervalle === 3) {
                  x1 = rac2 + 1
                  x2 = rac2 + 2
                }

                tolerance = 0.005
                xMin = borneInf
                xMax = borneSup
                substituts = [
                  {
                    antVal: borneInf,
                    antTex: `${texNombre(borneInf, 0)}`,
                    imgVal: fonction2(borneInf),
                    imgTex: `$${texNombre(ImBorneInf, 0)}$`,
                  },
                  {
                    antVal: Math.min(rac1, rac2),
                    antTex: `${texNombre(Math.min(rac1, rac2), 0)}`,
                    imgTex: `$${texNombre(Imx1, 0)}$`,
                  },
                  {
                    antVal: Math.max(rac1, rac2),
                    antTex: `${texNombre(Math.max(rac1, rac2), 0)}`,
                    imgTex: `$${texNombre(Imx2, 0)}$`,
                  },
                  {
                    antVal: borneSup,
                    antTex: `${texNombre(borneSup, 0)}`,
                    imgTex: `$${texNombre(ImBorneSup, 0)}$`,
                  },
                ]

                texte = enonce + `$f(${x1})$ et $f(${x2})$.<br><br>`
                texte += tableauVariationsFonction(
                  fonction2 as (x: number | FractionEtendue) => number,
                  derivee2 as (x: number | FractionEtendue) => number,
                  xMin,
                  xMax,
                  { ligneDerivee: false, substituts, step: 0.5, tolerance },
                )

                if (choixIntervalle === 1 || choixIntervalle === 3) {
                  // corr dans le cas ou x1 et x2 sont dans l'intervalle 1 ou 3
                  texteCorr = `D'après le tableau de variations, la fonction $f$ est strictement ${a > 0 ? 'croissante' : 'décroissante'} sur 
                  ${a > 0 ? `$[${borneInf}\\,;\\,${rac1}]$` : `$[${rac2}\\,;\\,${borneSup}]$`}. <br>
          De plus,<br>
          $\\bullet$ $${x1}\\in ${choixIntervalle === 1 ? `[${borneInf}\\,;\\,${rac1}]` : `[${rac2}\\,;\\,${borneSup}]`}$,<br>
          $\\bullet$ $${x2}\\in ${choixIntervalle === 1 ? `[${borneInf}\\,;\\,${rac1}]` : `[${rac2}\\,;\\,${borneSup}]`}$, <br>
            $\\bullet$ $${x1}<${x2}$.<br>
         On sait que si une fonction est strictement ${a > 0 ? 'croissante' : 'décroissante'} sur un intervalle $[a\\,;\\,b]$, alors ses antécédents et ses images sont rangés dans 
         ${a > 0 ? 'le même ordre' : "l'ordre inverse"}.
         <br>
         Cela signifie que pour tout $x_1\\in[a\\,;\\,b]$ et $x_2\\in[a\\,;\\,b]$, si $x_1 < x_2$ alors ${a > 0 ? '$f(x_1) < f(x_2)$' : '$f(x_1) > f(x_2)$'}. <br>
          Par conséquent, comme $${x1}<${x2}$, alors ${a > 0 ? `${texteEnCouleurEtGras(`$f(${x1}) < f(${x2})$`)}.` : `${texteEnCouleurEtGras(`$f(${x1}) > f(${x2})$`)}.`}`
                }
                if (choixIntervalle === 2) {
                  // corr dans le cas ou x1 et x2 sont dans l'intervalle 2
                  texteCorr = `D'après le tableau de variations, la fonction $f$ est ${a > 0 ? 'décroissante' : 'croissante'} sur $[${rac1}\\,;\\,${rac2}]$. <br>
                    De plus,<br>
                    $\\bullet$ $${x1}\\in [${rac1}\\,;\\,${rac2}]$,<br>
                    $\\bullet$ $${x2}\\in [${rac1}\\,;\\,${rac2}]$, <br>
                      $\\bullet$ $${x1}<${x2}$.<br>
                   On sait que si une fonction est strictement ${a > 0 ? 'décroissante' : 'croissante'} sur un intervalle $[a\\,;\\,b]$, alors ses antécédents et ses images sont rangés dans 
                   ${a > 0 ? "l'ordre inverse" : 'le même ordre'}.
                   <br>
                   Cela signifie que pour tout $x_1\\in[a\\,;\\,b]$ et $x_2\\in[a\\,;\\,b]$, si $x_1 < x_2$ alors ${a > 0 ? '$f(x_1) > f(x_2)$' : '$f(x_1) < f(x_2)$'}. <br>
                    Par conséquent, comme $${x1}<${x2}$, alors ${a > 0 ? `${texteEnCouleurEtGras(`$f(${x1}) > f(${x2})$`)}.` : `${texteEnCouleurEtGras(`$f(${x1}) < f(${x2})$`)}.`}`
                }

                if (choixIntervalle === 1 || choixIntervalle === 3) {
                  this.autoCorrection[i] = {
                    enonce: texte,
                    propositions: [
                      {
                        texte: `${a > 0 ? `$f(${x1}) < f(${x2})$` : `$f(${x1}) > f(${x2})$`}`,
                        statut: true,
                      },
                      {
                        texte: `${a > 0 ? `$f(${x1}) > f(${x2})$` : `$f(${x1}) < f(${x2})$`}`,
                        statut: false,
                      },
                      {
                        texte: 'On ne peut pas savoir',
                        statut: false,
                      },
                    ],
                  }
                }
                if (choixIntervalle === 2) {
                  this.autoCorrection[i] = {
                    enonce: texte,
                    propositions: [
                      {
                        texte: `${a > 0 ? `$f(${x1}) > f(${x2})$` : `$f(${x1}) < f(${x2})$`}`,
                        statut: true,
                      },
                      {
                        texte: `${a > 0 ? `$f(${x1}) < f(${x2})$` : `$f(${x1}) > f(${x2})$`}`,
                        statut: false,
                      },
                      {
                        texte: 'On ne peut pas savoir',
                        statut: false,
                      },
                    ],
                  }
                }

                props = propositionsQcm(this, i)
                if (this.interactif) texte += props.texte
              }
              break
          }
          break

        case 2: // On peut comparer par encadrement
          switch (randint(0, 1)) {
            case 0: // parabole x1 dans le premier intervalle et x2 = borne sup
              {
                const borneInf = alpha - randint(3, 12)
                const borneSup = alpha + randint(3, 12)
                const p = new Trinome(0, 0, 0)
                p.defFormeCanonique(a, alpha, beta)

                const x1 = randint(borneInf + 1, alpha - 1)
                const x2 = borneSup
                tolerance = 0.005
                xMin = borneInf
                xMax = borneSup
                const k = randint(1, 10)
                const ImAlpha = randint(-5, 5)
                const ImBorneInf = a > 0 ? ImAlpha + k : ImAlpha - k
                const ImBorneSup = a > 0 ? ImBorneInf + k : ImBorneInf - k
                substituts = [
                  {
                    antVal: borneInf,
                    antTex: `$${texNombre(borneInf, 0)}$`,
                    imgTex: `$${texNombre(ImBorneInf, 0)}$`,
                  },
                  {
                    antVal: p.alpha.valeurDecimale,
                    antTex: p.alpha.simplifie().texFSD,
                    imgVal: p.beta.valeurDecimale,
                    imgTex: `$${texNombre(ImAlpha, 0)}$`,
                  },
                  {
                    antVal: borneSup,
                    antTex: `$${texNombre(borneSup, 0)}$`,
                    imgTex: `${texNombre(ImBorneSup, 0)}`,
                  },
                ]
                texte = enonce + `$f(${x1})$ et $f(${x2})$.<br><br>`
                texte += tableauVariationsFonction(
                  fonction1 as (x: number | FractionEtendue) => number,
                  derivee1 as (x: number | FractionEtendue) => number,
                  xMin,
                  xMax,
                  { ligneDerivee: false, substituts, step: 0.5, tolerance },
                )
                texteCorr = `Comme $${x1}$ et $${x2}$ n'appartiennent pas à un intervalle sur lequel $f$ est monotone, on ne peut pas utiliser le sens de variation de $f$ pour comparer $f(${x1})$ et $f(${x2})$.<br>
                Mais, d'après le tableau de variations, $f(${x2})=${ImBorneSup}$ et comme $${x1}\\in [${borneInf}\\,;\\,${alpha}]$, ${
                  a > 0
                    ? ` alors $${ImAlpha}< f(${x1}) < ${ImBorneInf}$.`
                    : ` alors $${ImBorneInf} < f(${x1}) < ${ImAlpha}$.`
                }
                                <br>
                On en déduit que ${a > 0 ? `${texteEnCouleurEtGras(`$f(${x1}) < f(${x2})$`)}.` : `${texteEnCouleurEtGras(`$f(${x1}) > f(${x2})$`)}.`}<br>
                En effet, ${
                  a > 0
                    ? `$f(${x1})$ est un nombre compris entre $${ImAlpha}$ et $${ImBorneInf}$, il sera donc inférieur à $f(${x2})=${ImBorneSup}$`
                    : `$f(${x1})$ est un nombre compris entre $${ImBorneInf}$ et $${ImAlpha}$, il sera donc supérieur à $f(${x2})=${ImBorneSup}$`
                }.
        `
                this.autoCorrection[i] = {
                  enonce: texte,
                  propositions: [
                    {
                      texte: `${a > 0 ? `$f(${x1}) < f(${x2})$` : `$f(${x1}) > f(${x2})$`}`,
                      statut: true,
                    },
                    {
                      texte: `${a > 0 ? `$f(${x1}) > f(${x2})$` : `$f(${x1}) < f(${x2})$`}`,
                      statut: false,
                    },
                    {
                      texte: 'On ne peut pas savoir',
                      statut: false,
                    },
                  ],
                }
                props = propositionsQcm(this, i)
                if (this.interactif) texte += props.texte
              }
              break
            case 1:
              {
                const borneInf = Math.min(rac1, rac2) - randint(2, 5)
                const borneSup = Math.max(rac1, rac2) + randint(2, 5)
                const ImBorneInf = a > 0 ? randint(-5, 5) : randint(-5, 5)
                const ImBorneSup = a > 0 ? randint(-14, -6) : randint(6, 14)
                const Imx1 = a > 0 ? randint(8, 10) : randint(-10, -8)
                const Imx2 = a > 0 ? randint(-20, -15) : randint(15, 20)
                const x1 = randint(borneInf + 1, Math.min(rac1, rac2) - 1)
                const x2 = randint(Math.max(rac1, rac2) + 1, borneSup - 1)
                tolerance = 0.005
                xMin = borneInf
                xMax = borneSup
                substituts = [
                  {
                    antVal: borneInf,
                    antTex: `${texNombre(borneInf, 0)}`,
                    imgVal: fonction2(borneInf),
                    imgTex: `$${texNombre(ImBorneInf, 0)}$`,
                  },
                  {
                    antVal: Math.min(rac1, rac2),
                    antTex: `${texNombre(Math.min(rac1, rac2), 0)}`,
                    imgTex: `$${texNombre(Imx1, 0)}$`,
                  },
                  {
                    antVal: Math.max(rac1, rac2),
                    antTex: `${texNombre(Math.max(rac1, rac2), 0)}`,
                    imgTex: `$${texNombre(Imx2, 0)}$`,
                  },
                  {
                    antVal: borneSup,
                    antTex: `${texNombre(borneSup, 0)}`,
                    imgTex: `$${texNombre(ImBorneSup, 0)}$`,
                  },
                ]

                texte = enonce + `$f(${x1})$ et $f(${x2})$.<br><br>`
                texte += tableauVariationsFonction(
                  fonction2 as (x: number | FractionEtendue) => number,
                  derivee2 as (x: number | FractionEtendue) => number,
                  xMin,
                  xMax,
                  { ligneDerivee: false, substituts, step: 0.5, tolerance },
                )
                texteCorr = `Comme $${x1}$ et $${x2}$ n'appartiennent pas à un intervalle sur lequel $f$ est monotone, on ne peut pas utiliser le sens de variation de $f$ pour comparer $f(${x1})$ et $f(${x2})$.<br>
                Mais, d'après le tableau de variations :<br>
                $\\bullet$ Comme $${x1}\\in [${borneInf}\\,;\\,${Math.min(rac1, rac2)}]$, alors ${a > 0 ? `$${ImBorneInf} < f(${x1}) < ${Imx1}$` : `$${Imx1} < f(${x1}) < ${ImBorneInf}$`}. <br>
                $\\bullet$ Comme $${x2}\\in [${Math.max(rac1, rac2)}\\,;\\,${borneSup}]$, alors ${a > 0 ? `$${Imx2} < f(${x2}) < ${ImBorneSup}$` : `$${ImBorneSup} < f(${x2}) < ${Imx2}$`}. <br>
                On en déduit que ${a > 0 ? `${texteEnCouleurEtGras(`$f(${x1}) > f(${x2})$`)}.` : `${texteEnCouleurEtGras(`$f(${x1}) < f(${x2})$`)}.`}<br>
                En effet, ${
                  a > 0
                    ? `$f(${x1})$ est un nombre compris entre $${ImBorneInf}$ et $${Imx1}$, il sera donc supérieur à $f(${x2})$ qui est un nombre compris entre $${Imx2}$ et $${ImBorneSup}$.`
                    : `$f(${x1})$ est un nombre compris entre $${Imx1}$ et $${ImBorneInf}$, il sera donc inférieur à $f(${x2})$ qui est un nombre compris entre $${ImBorneSup}$ et $${Imx2}$. `
                }
        `
                this.autoCorrection[i] = {
                  enonce: texte,
                  propositions: [
                    {
                      texte: `${a > 0 ? `$f(${x1}) > f(${x2})$` : `$f(${x1}) < f(${x2})$`}`,
                      statut: true,
                    },
                    {
                      texte: `${a > 0 ? `$f(${x1}) < f(${x2})$` : `$f(${x1}) > f(${x2})$`}`,
                      statut: false,
                    },
                    {
                      texte: 'On ne peut pas savoir',
                      statut: false,
                    },
                  ],
                }
                props = propositionsQcm(this, i)
                if (this.interactif) texte += props.texte
              }
              break
          }
          break

        case 3: // on ne peut pas comparer
          switch (randint(0, 1)) {
            case 0: // parabole x1 dans le premier intervalle et x2 = borne sup
              {
                const borneInf = alpha - randint(3, 12)
                const borneSup = alpha + randint(3, 12)
                const p = new Trinome(0, 0, 0)
                p.defFormeCanonique(a, alpha, beta)

                const x1 = randint(borneInf + 1, alpha - 1)
                const x2 = borneSup
                tolerance = 0.005
                xMin = borneInf
                xMax = borneSup
                const k = randint(3, 10)
                const ImAlpha = randint(-5, 5)
                const ImBorneInf = a > 0 ? ImAlpha + k : ImAlpha - k
                const ImBorneSup =
                  a > 0
                    ? ImAlpha + k - randint(1, 2)
                    : ImAlpha - k + randint(1, 2)
                substituts = [
                  {
                    antVal: borneInf,
                    antTex: `$${texNombre(borneInf, 0)}$`,
                    imgTex: `$${texNombre(ImBorneInf, 0)}$`,
                  },
                  {
                    antVal: p.alpha.valeurDecimale,
                    antTex: p.alpha.simplifie().texFSD,
                    imgVal: p.beta.valeurDecimale,
                    imgTex: `$${texNombre(ImAlpha, 0)}$`,
                  },
                  {
                    antVal: borneSup,
                    antTex: `$${texNombre(borneSup, 0)}$`,
                    imgTex: `${texNombre(ImBorneSup, 0)}`,
                  },
                ]
                texte = enonce + `$f(${x1})$ et $f(${x2})$.<br><br>`
                texte += tableauVariationsFonction(
                  fonction1 as (x: number | FractionEtendue) => number,
                  derivee1 as (x: number | FractionEtendue) => number,
                  xMin,
                  xMax,
                  { ligneDerivee: false, substituts, step: 0.5, tolerance },
                )
                texteCorr = `Comme $${x1}$ et $${x2}$ n'appartiennent pas à un intervalle sur lequel $f$ est monotone, on ne peut pas utiliser le sens de variation de $f$ pour comparer $f(${x1})$ et $f(${x2})$.<br>
              D'après le tableau de variations :<br>
              $\\bullet$ Comme $${x1}\\in [${borneInf}\\,;\\,${alpha}]$, ${
                a > 0
                  ? ` alors $${ImAlpha}< f(${x1}) < ${ImBorneInf}$.`
                  : ` alors $${ImBorneInf} < f(${x1}) < ${ImAlpha}$.`
              }
                              <br>
                              $\\bullet$ $f(${x2})=${ImBorneSup}$.
                              <br>
                                         Ainsi, on ne peut pas comparer $f(${x1})$ et $f(${x2})$ : ${texteEnCouleurEtGras('On ne peut pas savoir')}. <br>
             En effet $f(${x1})$ et $f(${x2})$ appartiennent tous les deux à l'intervalle ${
               a > 0
                 ? `$]${ImAlpha}\\,;\\, ${ImBorneInf}[$.`
                 : `$]${ImBorneInf}\\,;\\, ${ImAlpha}[$.`
             } `
                this.autoCorrection[i] = {
                  enonce: texte,
                  propositions: [
                    {
                      texte: `${a > 0 ? `$f(${x1}) < f(${x2})$` : `$f(${x1}) > f(${x2})$`}`,
                      statut: false,
                    },
                    {
                      texte: `${a > 0 ? `$f(${x1}) > f(${x2})$` : `$f(${x1}) < f(${x2})$`}`,
                      statut: false,
                    },
                    {
                      texte: 'On ne peut pas savoir',
                      statut: true,
                    },
                  ],
                }
                props = propositionsQcm(this, i)
                if (this.interactif) texte += props.texte
              }
              break
            case 1:
              {
                const borneInf = Math.min(rac1, rac2) - randint(2, 5)
                const borneSup = Math.max(rac1, rac2) + randint(2, 5)
                const ImBorneInf = a > 0 ? randint(-10, 5) : randint(-5, 10)
                const ImBorneSup = a > 0 ? randint(8, 15) : randint(-15, -8)
                const Imx1 = a > 0 ? randint(10, 15) : randint(-15, -10)
                const Imx2 = a > 0 ? randint(-3, 5) : randint(-5, 3)
                const x1 = randint(borneInf + 1, Math.min(rac1, rac2) - 1)
                const x2 = randint(Math.max(rac1, rac2) + 1, borneSup - 1)
                tolerance = 0.005
                xMin = borneInf
                xMax = borneSup
                substituts = [
                  {
                    antVal: borneInf,
                    antTex: `${texNombre(borneInf, 0)}`,
                    imgVal: fonction2(borneInf),
                    imgTex: `$${texNombre(ImBorneInf, 0)}$`,
                  },
                  {
                    antVal: Math.min(rac1, rac2),
                    antTex: `${texNombre(Math.min(rac1, rac2), 0)}`,
                    imgTex: `$${texNombre(Imx1, 0)}$`,
                  },
                  {
                    antVal: Math.max(rac1, rac2),
                    antTex: `${texNombre(Math.max(rac1, rac2), 0)}`,
                    imgTex: `$${texNombre(Imx2, 0)}$`,
                  },
                  {
                    antVal: borneSup,
                    antTex: `${texNombre(borneSup, 0)}`,
                    imgTex: `$${texNombre(ImBorneSup, 0)}$`,
                  },
                ]

                texte = enonce + `$f(${x1})$ et $f(${x2})$.<br><br>`
                texte += tableauVariationsFonction(
                  fonction2 as (x: number | FractionEtendue) => number,
                  derivee2 as (x: number | FractionEtendue) => number,
                  xMin,
                  xMax,
                  { ligneDerivee: false, substituts, step: 0.5, tolerance },
                )
                texteCorr = `Comme $${x1}$ et $${x2}$ n'appartiennent pas à un intervalle sur lequel $f$ est monotone, on ne peut pas utiliser le sens de variation de $f$ pour comparer $f(${x1})$ et $f(${x2})$.<br>
                Mais, d'après le tableau de variations : <br>
                $\\bullet$ Comme $${x1}\\in [${borneInf}\\,;\\,${Math.min(rac1, rac2)}]$, alors ${a > 0 ? `$${ImBorneInf} < f(${x1}) < ${Imx1}$` : `$${Imx1} < f(${x1}) < ${ImBorneInf}$`}. <br>
                $\\bullet$ Comme $${x2}\\in [${Math.max(rac1, rac2)}\\,;\\,${borneSup}]$, alors ${a > 0 ? `$${Imx2} < f(${x2}) < ${ImBorneSup}$` : `$${ImBorneSup} < f(${x2}) < ${Imx2}$`}. <br>
                Ces deux encadrements ne permettent pas de comparer $f(${x1})$ et $f(${x2})$.<br>
                Ainsi, on ne peut pas comparer $f(${x1})$ et $f(${x2})$ : ${texteEnCouleurEtGras('On ne peut pas savoir')}. `

                this.autoCorrection[i] = {
                  enonce: texte,
                  propositions: [
                    {
                      texte: `${a > 0 ? `$f(${x1}) > f(${x2})$` : `$f(${x1}) < f(${x2})$`}`,
                      statut: false,
                    },
                    {
                      texte: `${a > 0 ? `$f(${x1}) < f(${x2})$` : `$f(${x1}) > f(${x2})$`}`,
                      statut: false,
                    },
                    {
                      texte: 'On ne peut pas savoir',
                      statut: true,
                    },
                  ],
                }
                props = propositionsQcm(this, i)
                if (this.interactif) texte += props.texte
              }
              break
          }
          break
      }
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
