import { deuxColonnes } from '../../lib/format/miseEnPage'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { Arbre } from '../../modules/arbres'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '15/09/2025'
export const uuid = '3a5ab'
// @Author Stéphane Guyon// repris par Gilles Mora pour sortie npdf et nombres décimaux dans tableau
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Utiliser un arbre pour calculer une probabilité (totale)'
export default class auto1AP3 extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    let objets = []

    const pA = 0.4
    const pBA = 0.3
    const pBbAb = 0.9
    const omega = new Arbre({
      racine: true,
      nom: '',
      proba: 1,
      visible: false,
      alter: '',
      enfants: [
        new Arbre({
          rationnel: false,
          nom: 'A',
          proba: pA,
          enfants: [
            new Arbre({
              rationnel: false,
              nom: 'B',
              proba: pBA,
            }),
            new Arbre({
              rationnel: false,
              nom: '\\bar B',
              proba: Number(1 - pBA),
              visible: false,
            }),
          ],
        }),
        new Arbre({
          rationnel: false,
          nom: '\\bar A',
          proba: Number(1 - pA),
          visible: false,
          enfants: [
            new Arbre({
              rationnel: false,
              nom: 'B',
              proba: Number(1 - pBbAb),
              visible: false,
              // alter: 'x'
            }),
            new Arbre({
              rationnel: false,
              nom: '\\bar B',
              proba: pBbAb,
              visible: true,
              alter: '',
            }),
          ],
        }),
      ],
    })

    omega.setTailles() // On calcule les tailles des arbres.
    objets = omega.represente(0, 6, 0, 3, true, 1, 8)

    // Génère distracteur2 différent de distracteur1 et de la bonne réponse

    this.enonce = `${deuxColonnes(
      `On considère l'arbre de probabilités ci-contre.<br><br>
      On cherche la probabilité de l'événement $B$.<br><br>
      On a :`,
      context.isHtml
        ? mathalea2d(
            {
              xmin: -0.1,
              xmax: 12,
              ymin: -5,
              ymax: 5,
              display: 'inline',
              scale: 0.7,
            },
            objets,
          )
        : `
 \\pstree[treemode=R,labelsep=1mm,treesep=12mm]{\\TR{}}
            {
              \\pstree[labelsep=1mm]{\\TR{$A$}\\taput{$0,4$}}
              {
                \\TR{$B$}\\taput{$0,3$}
                \\TR{$\\overline{B}$}\\tbput{$$}
              }
              \\pstree[labelsep=1mm]{\\TR{$\\overline{A}$}\\tbput{$$}}
              {
                \\TR{$B$}\\taput{$$}
                \\TR{$\\overline{B}$}\\tbput{$0,9$}
              }

            }	

`,
    )}<br>`

    this.correction = `
    On applique la formule de probabilité totale :<br> $\\begin{aligned}
    p(B)&=p(A)\\times p_A(B)+p(\\overline A)\\times p_{\\overline A}(B)\\\\
    &=${texNombre(pA, 2)}\\times ${texNombre(pBA)}+${texNombre(1 - pA)}\\times ${texNombre(1 - pBbAb)}\\\\
    &=${miseEnEvidence(texNombre(pA * pBA + (1 - pA) * (1 - pBbAb), 2))}.
    \\end{aligned}$`
    this.reponses = [
      `$p(B)=${texNombre(pA * pBA + (1 - pA) * (1 - pBbAb))} $`,
      `$p(B)=${texNombre(0.12)}$ `,
      `$p(B)=${texNombre(0.66)}$ `,
      `$p(B)=${texNombre(0.3)}$ `,
    ]
  }

  versionAleatoire = () => {
    let objets = []

    const pA = randint(1, 9) / 10
    const pBA = randint(1, 9) / 10
    const pBbAb = randint(1, 9) / 10
    const omega = new Arbre({
      racine: true,
      nom: '',
      proba: 1,
      visible: false,
      alter: '',
      enfants: [
        new Arbre({
          rationnel: false,
          nom: 'A',
          proba: pA,
          enfants: [
            new Arbre({
              rationnel: false,
              nom: 'B',
              proba: pBA,
            }),
            new Arbre({
              rationnel: false,
              nom: '\\bar B',
              proba: Number(1 - pBA),
              visible: false,
            }),
          ],
        }),
        new Arbre({
          rationnel: false,
          nom: '\\bar A',
          proba: Number(1 - pA),
          visible: false,
          enfants: [
            new Arbre({
              rationnel: false,
              nom: 'B',
              proba: Number(1 - pBbAb),
              visible: false,
              // alter: 'x'
            }),
            new Arbre({
              rationnel: false,
              nom: '\\bar B',
              proba: pBbAb,
              visible: true,
              alter: '',
            }),
          ],
        }),
      ],
    })

    omega.setTailles() // On calcule les tailles des arbres.
    objets = omega.represente(0, 6, 0, 3, true, 1, 8)

    // Génère distracteur2 différent de distracteur1 et de la bonne réponse

    this.enonce = `${deuxColonnes(
      `On considère l'arbre de probabilités ci-contre.<br><br>
      On cherche la probabilité de l'événement $B$.<br><br>
      On a :`,
      context.isHtml
        ? mathalea2d(
            {
              xmin: -0.1,
              xmax: 10,
              ymin: -5,
              ymax: 5,
              display: 'inline',
              scale: 0.7,
            },
            objets,
          )
        : `
 \\pstree[treemode=R,labelsep=1mm,treesep=12mm]{\\TR{}}
            {
              \\pstree[labelsep=1mm]{\\TR{$A$}\\taput{$${texNombre(pA)}$}}
              {
                \\TR{$B$}\\taput{$${texNombre(pBA)}$}
                \\TR{$\\overline{B}$}\\tbput{$$}
              }
              \\pstree[labelsep=1mm]{\\TR{$\\overline{A}$}\\tbput{$$}}
              {
                \\TR{$B$}\\taput{$$}
                \\TR{$\\overline{B}$}\\tbput{$${texNombre(pBbAb)}$}
              }

            }	

`,
    )}<br>`

    this.correction = `
    On applique la formule de probabilité totale :<br> $\\begin{aligned}
    p(B)&=p(A)\\times p_A(B)+p(\\overline A)\\times p_{\\overline A}(B)\\\\
    &=${texNombre(pA, 2)}\\times ${texNombre(pBA)}+${texNombre(1 - pA)}\\times ${texNombre(1 - pBbAb)}\\\\
    &=${miseEnEvidence(texNombre(pA * pBA + (1 - pA) * (1 - pBbAb), 2))}.
    \\end{aligned}$`
    this.reponses = [
      `$p(B)=${texNombre(pA * pBA + (1 - pA) * (1 - pBbAb))} $`,
      `$p(B)=${texNombre(pA * pBA)}$ `,
      `$p(B)=${texNombre(pA * pBA + (1 - pA) * pBbAb)}$ `,
      `$p(B)=${texNombre(pBA)}$ `,
    ]
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
