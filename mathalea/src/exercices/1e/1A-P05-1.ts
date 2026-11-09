import { deuxColonnes } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { Arbre } from '../../modules/arbres'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
export const dateDePublication = '15/09/2025'
export const dateDeModifImportante = '21/10/2026'
export const uuid = 'a2b55'
// @Author Stéphane Guyon// repris par Gilles Mora pour sortie npdf et nombres décimaux dans tableau
export const refs = {
  'fr-fr': ['1A-P05-1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Utiliser un arbre pour calculer une probabilité (totale)'
export default class auto1AP3 extends ExerciceQcmACourt {
  // Probabilité exacte saisie lorsque la version QCM est désactivée
  private reponseSaisie = ''

  versionOriginale: () => void = () => {
    let objets = []

    const pA = 0.4
    const pBA = 0.3
    const pBbAb = 0.9
    this.reponseSaisie = String(
      Math.round((pA * pBA + (1 - pA) * (1 - pBbAb)) * 1e4) / 1e4,
    )
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
      `On considère l'arbre de probabilités ci-contre.
      `,
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
    )}`
    this.enonce += "La probabilité de l'événement $B$ est : "
    this.correction = `
    On applique la formule de probabilité totale :<br> $\\begin{aligned}
    P(B)&=P(A)\\times P_A(B)+P(\\overline A)\\times P_{\\overline A}(B)\\\\
    &=${texNombre(pA, 2)}\\times ${texNombre(pBA)}+${texNombre(1 - pA)}\\times ${texNombre(1 - pBbAb)}\\\\
    &=${miseEnEvidence(texNombre(pA * pBA + (1 - pA) * (1 - pBbAb), 2))}
    \\end{aligned}$`
    this.reponses = [
      `$P(B)=${texNombre(pA * pBA + (1 - pA) * (1 - pBbAb))} $`,
      `$P(B)=${texNombre(0.12)}$ `,
      `$P(B)=${texNombre(0.66)}$ `,
      `$P(B)=${texNombre(0.3)}$ `,
    ]
  }

  versionAleatoire = () => {
    let objets = []

    const pA = randint(1, 9) / 10
    let pBA = randint(1, 9)
    let pBbAb = randint(1, 9, [5, pBA, 10 - pBA])
    pBA /= 10
    pBbAb /= 10
    this.reponseSaisie = String(
      Math.round((pA * pBA + (1 - pA) * (1 - pBbAb)) * 1e4) / 1e4,
    )
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
      `On considère l'arbre de probabilités ci-contre.`,
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
    )}`

    this.enonce += "La probabilité de l'événement $B$ est : "
    this.correction = `
    On applique la formule de probabilité totale :<br> $\\begin{aligned}
    P(B)&=P(A)\\times P_A(B)+P(\\overline A)\\times P_{\\overline A}(B)\\\\
    &=${texNombre(pA, 2)}\\times ${texNombre(pBA)}+${texNombre(1 - pA)}\\times ${texNombre(1 - pBbAb)}\\\\
    &=${miseEnEvidence(texNombre(pA * pBA + (1 - pA) * (1 - pBbAb), 2))}
    \\end{aligned}$`
    this.reponses = [
      `$P(B)=${texNombre(pA * pBA + (1 - pA) * (1 - pBbAb))}$`,
      `$P(B)=${texNombre(pA * pBA)}$`,
      `$P(B)=${texNombre(pA * pBA + (1 - pA) * pBbAb)}$`,
      `$P(B)=${texNombre(pBA)}$`,
    ]
  }

  constructor() {
    super()
    // Saisie libre (version QCM désactivée) : la dernière phrase devient une question
    this.enonceCourt = () =>
      this.enonce.replace(
        /La probabilité de l'événement \$B\$ est : \s*$/,
        this.interactif ? '$P(B)=$' : 'Calculer $P(B)$.',
      )
    this.champReponseCourteEnLigne = true
    this.reponseCourte = () => this.reponseSaisie

    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })

    this.versionAleatoire()
  }
}
