import { repere } from '../../lib/2d/reperes'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import {
  Spline,
  spline,
  type NoeudSpline,
} from '../../lib/mathFonctions/Spline'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'

import { bleuMathalea } from '../../lib/colors'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '30/07/2025'
export const uuid = '0b1fc'

export const refs = {
  'fr-fr': ['1A-F04-3'],
  'fr-ch': ['1mF1-16'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Retrouver l'affirmation correcte à partir de lectures graphiques"

interface ReponseQcm {
  texte: string
  correction: string
  estCorrecte: boolean
  texteCorrection?: string
}

export default class AutoF4b extends ExerciceQcmA {
  compteur = 0
  spline?: Spline
  versionOriginale: () => void = () => {
    // Définition des noeuds fixes pour la courbe originale
    const noeudsFixes: NoeudSpline[] = [
      { x: -5, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -4, y: 0, deriveeGauche: -1.5, deriveeDroit: -1, isVisible: true },
      { x: -3, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 1, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 2, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 4, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 5, y: -1, deriveeGauche: -1, deriveeDroit: 0, isVisible: true },
    ]

    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const theSpline = spline(noeudsFixes)
    this.spline = theSpline

    const bornes = theSpline.trouveMaxes()
    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: true,
      grilleY: true,
      xThickMin: bornes.xMin - 1,
      yThickMin: bornes.yMin - 1,
      yThickMax: bornes.yMax + 1,
      xLabelMin: bornes.xMin,
      yLabelMin: bornes.yMin,
      yLabelMax: bornes.yMax,
      xLabelMax: bornes.xMax,
      xThickMax: bornes.xMax + 1,
      axesEpaisseur: 1.5,
      grilleOpacite: 1,
      grilleYMin: bornes.yMin - 1.02,
      grilleYMax: bornes.yMax + 1.02,
      grilleXMin: bornes.xMin - 1.02,
      grilleXMax: bornes.xMax + 1.02,
    })

    const courbe1 = theSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: true,
      optionsNoeuds: { color: 'black', taille: 1.5, style: 'x', epaisseur: 2 },
      color: bleuMathalea,
    })

    // Nom de la courbe, à droite de son extrémité
    const nomCourbe = latex2d(
      '\\mathscr{C}_f',
      theSpline.x[theSpline.n - 1] + 0.5,
      theSpline.y[theSpline.n - 1] + 0.6,
      { color: bleuMathalea },
    )
    const objetsEnonce = [repere1, courbe1, nomCourbe]

    this.enonce =
      "Voici la représentation graphique $\\mathscr{C}_f$ d'une fonction $f$ définie sur $[-5\\,;\\,5]$.<br><br>"
    this.enonce +=
      mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.9, center: !context.isHtml },
          {
            xmin: bornes.xMin - 1,
            ymin: bornes.yMin - 1,
            xmax: bornes.xMax + 1,
            ymax: bornes.yMax + 1,
          },
        ),
        objetsEnonce,
        o,
      ) + '<br><br>'
    this.enonce += 'Une seule affirmation est correcte :'

    // Questions fixes avec leurs corrections
    this.reponses = [
      "L'équation $f(x) = 0$ admet trois solutions dont deux sont opposées",
      'Le maximum de $f$ est $5$',
      '$f$ est négative sur $[-5\\,;\\,-1]$',
      "L'inéquation $f(x) \\geqslant 0$ a pour ensemble de solutions $[-1\\,;\\,5]$",
    ]

    this.correction = `

    $\\bullet$ L'équation $f(x) = 0$ admet trois solutions dont deux sont opposées<br>
Cette affirmation est correcte : La courbe coupe l'axe des abscisses en trois points : en $x = -4$, en $x =-1$ et $x=4$.<br>
$-4$ et $4$ sont des nombres opposés. <br>

$\\bullet$ Le maximum de $f$ est $5$<br>
Cette affirmation est fausse : Le point le plus haut de la courbe a pour ordonnée $3$. C'est le maximum de $f$.<br>


$\\bullet$ $f$ est négative sur $[-5\\,;\\,-1]$<br>
Cette affirmation est fausse : Sur l'intervalle $[-5\\,;\\,-1]$, la fonction prend des valeurs positives (notamment au début de l'intervalle où $f(-5) = 1$) et des valeurs négatives.<br>

$\\bullet$ L'inéquation $f(x) \\geqslant 0$ a pour ensemble de solutions $[-1\\,;\\,5]$<br>
Cette affirmation est fausse : Les solutions de l'inéquation $f(x) \\geqslant 0$ correspondent aux abscisses des points situés sur ou au-dessus de l'axe des abscisses. D'après le graphique, cela correspond approximativement à $[-5\\,;\\,-3] \\cup [-1\\,;\\,4]$.
    `
  }

  versionAleatoire = () => {
    const cas = randint(1, 2)
    const noeuds1 = [
      { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 0, y: -1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 2, y: -2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 3, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 5, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
    ]
    const noeuds2 = [
      { x: -6, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -5, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -4, y: 2, deriveeGauche: -1.5, deriveeDroit: -1.5, isVisible: true },
      { x: -2, y: 0, deriveeGauche: -1, deriveeDroit: -1.5, isVisible: true },
      { x: 0, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 1, y: -1, deriveeGauche: 1.5, deriveeDroit: 1.5, isVisible: true },
      { x: 2, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: -2, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
    ]

    // Choisir les noeuds selon le cas
    const noeudsCourbe = cas === 1 ? noeuds1 : noeuds2

    function aleatoiriseCourbe(noeudsChoisis: NoeudSpline[]) {
      const coeffX = cas === 1 ? 1 : -1 // choice([-1, 1]) // symétries ou pas
      const coeffY = 1 // choice([-1, 1])
      const deltaX = 0 // randint(-1, 1) // translations
      const deltaY = 0 // randint(-1, 1)// randint(-2, +2)

      return noeudsChoisis.map((noeud: NoeudSpline) =>
        Object({
          x: (noeud.x + deltaX) * coeffX,
          y: (noeud.y + deltaY) * coeffY,
          deriveeGauche: noeud.deriveeGauche * coeffX * coeffY,
          deriveeDroit: noeud.deriveeDroit * coeffX * coeffY,
          isVisible: noeud.isVisible,
        }),
      )
    }

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const nuage = aleatoiriseCourbe(noeudsCourbe)
    const theSpline = spline(nuage)
    this.spline = theSpline
    const bornes = theSpline.trouveMaxes()
    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: true,
      grilleY: true,
      xThickMin: bornes.xMin - 1,
      yThickMin: bornes.yMin - 1,
      yThickMax: bornes.yMax + 1,
      xLabelMin: bornes.xMin,
      yLabelMin: bornes.yMin,
      yLabelMax: bornes.yMax,
      xLabelMax: bornes.xMax,
      xThickMax: bornes.xMax + 1,
      axesEpaisseur: 1.5,
      grilleOpacite: 1,

      grilleYMin: bornes.yMin - 1.02,
      grilleYMax: bornes.yMax + 1.02,
      grilleXMin: bornes.xMin - 1.02,
      grilleXMax: bornes.xMax + 1.02,
    })
    const courbe1 = theSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: true,
      optionsNoeuds: { color: 'black', taille: 1.5, style: 'x', epaisseur: 2 },
      color: bleuMathalea,
    })
    // Nom de la courbe, à droite de son extrémité
    const nomCourbe = latex2d(
      '\\mathscr{C}_f',
      theSpline.x[theSpline.n - 1] + 0.5,
      theSpline.y[theSpline.n - 1] + 0.6,
      { color: bleuMathalea },
    )
    const objetsEnonce = [repere1, courbe1, nomCourbe]
    const nbAntecedentsEntiersMaximum = theSpline.nombreAntecedentsMaximum(
      bornes.yMin,
      bornes.yMax,
      true,
      true,
    )

    const nombreAntecedentCherches1 = choice([
      randint(1, nbAntecedentsEntiersMaximum),
      randint(0, nbAntecedentsEntiersMaximum),
      randint(1, nbAntecedentsEntiersMaximum),
    ])
    const y1 = theSpline.trouveYPourNAntecedents(
      nombreAntecedentCherches1,
      bornes.yMin - 1,
      bornes.yMax + 1,
      true,
      true,
    )
    if (y1 === false) {
      this.compteur++
      if (this.compteur > 10) {
        window.notify(
          "Erreur dans la génération de l'exercice : y1 === false",
          {
            spline: theSpline,
            nombreAntecedentCherches1,
            nbAntecedentsEntiersMaximum,
            bornes,
          },
        )
        return
      }
      this.nouvelleVersion()
      return
    }
    this.compteur = 0
    switch (cas) {
      case 1:
        {
          const a = randint(31, 59) / 100
          const aBis = randint(9, 19) / 100
          const b = randint(31, 49) / 10
          const bBis = randint(31, 58) / 10
          const v1 = randint(-30, -15) / 10
          const v2 = randint(-40, -31) / 10
          const v2b = randint(17, 29) / 10
          const v3 = randint(-24, -20) / 10
          const v4 = randint(-25, 5) / 10
          const v5 = randint(1, 3)
          const choix = choice([true, false])
          const AFC = 'Cette affirmation est correcte : <br>'
          const AFF = 'Cette affirmation est fausse : <br>'
          this.enonce = `Voici la représentation graphique $\\mathscr{C}_f$ d'une fonction $f$ définie sur $[${theSpline.x[0]}\\,;\\,${theSpline.x[theSpline.n - 1]}]$.<br><br>`
          this.enonce +=
            mathalea2d(
              Object.assign(
                { pixelsParCm: 30, scale: 1, center: !context.isHtml },
                {
                  xmin: bornes.xMin - 1,
                  ymin: bornes.yMin - 1,
                  xmax: bornes.xMax + 1,
                  ymax: bornes.yMax + 1,
                },
              ),
              objetsEnonce,
              o,
            ) + '<br><br>'
          this.enonce += 'Une seule affirmation est correcte :'

          // Définir toutes les réponses possibles avec leur correction
          const bonnesReponses: ReponseQcm[] = [
            {
              texte: `$f$ est positive sur $[${texNombre(v1, 1)}\\,;\\,${texNombre(v1 + 0.5, 1)}]$.`,
              texteCorrection: `$${miseEnEvidence('f')}$${texteEnCouleurEtGras(' est positive sur ')}$${miseEnEvidence(`[${texNombre(v1, 1)}\\,;\\,${texNombre(v1 + 0.5, 1)}]`)}$${texteEnCouleurEtGras('.')}`,
              correction:
                AFC +
                `$f$ est positive sur $[${texNombre(v1, 1)}\\,;\\,${texNombre(v1 + 0.5, 1)}]$ car la courbe se situe au-dessus de l'axe des abscisses sur cet intervalle.`,
              estCorrecte: true,
            },
            {
              texte: "L'équation $f(x)=0$ admet deux solutions de même signe.",
              texteCorrection: `${texteEnCouleurEtGras("L'équation ")}$${miseEnEvidence('f(x)=0')}$${texteEnCouleurEtGras(' admet deux solutions de même signe.')}`,
              correction:
                AFC +
                "L'équation $f(x)=0$ admet effectivement deux solutions de même signe car la courbe coupe deux fois l'axe des abscisses pour des valeurs négatives.",
              estCorrecte: true,
            },
            {
              texte: 'Le minimum de $f$ est $-3$.',
              texteCorrection: `${texteEnCouleurEtGras('Le minimum de ')}$${miseEnEvidence('f')}$${texteEnCouleurEtGras(' est ')}$${miseEnEvidence('-3')}$${texteEnCouleurEtGras('.')}`,
              correction:
                AFC +
                "Le point le plus bas de la courbe a pour ordonnée $-3$. C'est le minimum de $f$.",
              estCorrecte: true,
            },
            {
              texte: `${choix ? `$f(${texNombre(a, 2)}) > f(${texNombre(a + 0.01, 2)})$` : `$f(${texNombre(a + 0.01, 2)}) < f(${texNombre(a, 2)})$`}`,
              texteCorrection: `$${miseEnEvidence(choix ? `f(${texNombre(a, 2)}) > f(${texNombre(a + 0.01, 2)})` : `f(${texNombre(a + 0.01, 2)}) < f(${texNombre(a, 2)})`)}$`,
              correction:
                AFC +
                ` Comme la fonction est décroissante sur $[-2\\,;\\,3]$,${choix ? `$f(${texNombre(a, 2)}) > f(${texNombre(a + 0.01, 2)})$` : `$f(${texNombre(a + 0.01, 2)}) < f(${texNombre(a, 2)})$`} `,
              estCorrecte: false,
            },
            {
              texte: `${choix ? `$f(${texNombre(v1, 2)}) \\times f(${texNombre(v2, 2)}) < 0$` : `$f(${texNombre(b, 2)}) \\times f(${texNombre(a, 2)}) > 0$`}`,
              texteCorrection: `$${miseEnEvidence(choix ? `f(${texNombre(v1, 2)}) \\times f(${texNombre(v2, 2)}) < 0` : `f(${texNombre(b, 2)}) \\times f(${texNombre(a, 2)}) > 0`)}$`,
              correction:
                AFC +
                `${choix ? `$f(${texNombre(v1, 2)}) >0$ et $f(${texNombre(v2, 2)}) < 0$, donc le produit est négatif.` : `$f(${texNombre(b, 2)}) < 0$ et $f(${texNombre(a, 2)}) > 0$, donc le produit est positif.`}`,
              estCorrecte: false,
            },
            {
              texte:
                "L'inéquation $f(x) < 0$ a pour ensemble de solutions $[-4\\,;\\,-3[\\cup ]-1\\,;\\,5]$.",
              texteCorrection: `${texteEnCouleurEtGras("L'inéquation ")}$${miseEnEvidence('f(x) < 0')}$${texteEnCouleurEtGras(' a pour ensemble de solutions ')}$${miseEnEvidence('[-4\\,;\\,-3[\\cup ]-1\\,;\\,5]')}$${texteEnCouleurEtGras('.')}`,
              correction:
                AFC +
                "Les solutions de l'inéquation $f(x) < 0$ sont les abscisses respectives des points de la courbe situés strictement en dessous de l'axe des abscissses.",
              estCorrecte: true,
            },
          ]

          const mauvaisesReponses: ReponseQcm[] = [
            {
              texte: `${choix ? `$f(${texNombre(a, 2)}) < f(${texNombre(a + 0.01, 2)})$` : `$f(${texNombre(a + 0.01, 2)}) > f(${texNombre(a, 2)})$`}`,
              correction:
                AFF +
                ` $f(${texNombre(a, 2)}) > f(${texNombre(a + 0.01, 2)})$ puisque la fonction est décroissante sur $[-2\\,;\\,3]$.`,
              estCorrecte: false,
            },
            {
              texte: 'Le minimum de $f$ est $-4$.',
              correction:
                AFF +
                ' Le point le plus bas de la courbe a pour ordonnée $-3$, donc le minimum de $f$ est $-3$.',
              estCorrecte: false,
            },
            {
              texte: `L'équation $f(x) = ${texNombre(v4, 1)}$ a une unique solution.`,
              correction:
                AFF +
                `La droite d'équation $y=${texNombre(v4, 1)}$ coupe plusieurs fois la courbe, donc l'équation n'a pas une unique solution.`,
              estCorrecte: false,
            },
            {
              texte: `${choix ? `$f(${texNombre(v1, 2)}) \\times f(${texNombre(v2b, 2)}) > 0$` : `$f(${texNombre(bBis, 2)}) \\times f(${texNombre(aBis, 2)}) < 0$`}`,
              correction:
                AFF +
                `${choix ? `$f(${texNombre(v1, 2)}) >0$ et $f(${texNombre(v2b, 2)}) < 0$, donc le produit est négatif.` : `$f(${texNombre(bBis, 2)}) < 0$ et $f(${texNombre(aBis, 2)}) < 0$, donc le produit est positif.`}`,
              estCorrecte: false,
            },
            {
              texte: `$f$ est négative sur $[${texNombre(v3, 1)}\\,;\\,${texNombre(v3 + 0.5, 1)}]$.`,
              correction:
                AFF +
                `$f$ est positive sur $[-3\\,;\\,-1]$, donc $f$ est positive sur $[${texNombre(v3, 1)}\\,;\\,${texNombre(v3 + 0.5, 1)}]$.`,
              estCorrecte: false,
            },
            {
              texte:
                "L'inéquation $f(x) < 0$ a pour ensemble de solutions $[-4\\,;\\,-3]\\cup [-1\\,;\\,5]$.",
              correction:
                AFF +
                "Les solutions de l'inéquation $f(x) < 0$ sont les abscisses respectives des points situés strictement en dessous de l'axe des abscissses, ce qui n'est pas le cas de $-3$ par exemple.",
              estCorrecte: true,
            },
            {
              texte:
                "L'inéquation $f(x) \\geqslant 0$ a pour ensemble de solutions $]-3\\,;\\,-1[$.",
              correction:
                AFF +
                `Les solutions de l'inéquation $f(x)\\geqslant 0$ sont les abscisses respectives des points situés strictement au-dessus ou sur l'axe des abscissses.<br>
              $-3$ et $-1$ sont donc solutions de l'inéquation.`,
              estCorrecte: true,
            },
            {
              texte: `Si $${theSpline.x[v5]}\\leqslant x \\leqslant 5$, alors $-1\\leqslant f(x) \\leqslant ${theSpline.y[v5]}$.`,
              correction:
                AFF +
                `Le minimum de $f$ sur $[${theSpline.x[v5]}\\,;\\,5]$ est $-3$ et son maximum est $${theSpline.y[v5]}$, on en déduit l'encadrement $-3\\leqslant x \\leqslant ${theSpline.y[v5]}$.`,
              estCorrecte: true,
            },
            {
              texte: 'Le maximum de $f$ est $5$.',
              correction:
                AFF +
                'Le point le plus haut de la courbe a pour ordonnée $1$, donc le maximum de $f$ est $1$.',
              estCorrecte: false,
            },
          ]
          // Choisir une bonne réponse et 3 mauvaises réponses distinctes
          const bonneReponseChoisie = choice(bonnesReponses)
          const mauvaisesReponsesMelangees = shuffle([...mauvaisesReponses])
          const mauvaisesReponsesChoisies = mauvaisesReponsesMelangees.slice(
            0,
            3,
          )

          // Constituer le tableau des réponses (bonne réponse en premier)
          const toutesLesReponses = [
            bonneReponseChoisie,
            ...mauvaisesReponsesChoisies,
          ]

          // Extraire les textes pour this.reponses
          this.reponses = toutesLesReponses.map((reponse) => reponse.texte)

          // Construire la correction en analysant chaque réponse
          this.correction = ''
          toutesLesReponses.forEach((reponse, index) => {
            const texteAffiche =
              index === 0 && reponse.texteCorrection
                ? reponse.texteCorrection
                : reponse.texte
            this.correction += `$\\bullet$ ${texteAffiche}<br>`
            this.correction += ` ${reponse.correction}<br>`
          })
        }
        break

      case 2:
      default:
        {
          const v6 = randint(30, 45) / 10
          const v7 = randint(53, 60) / 10
          const v6Bis = randint(21, 29) / 10
          const v7Bis = randint(31, 39) / 10
          const v8 = randint(2, 22) / 10
          const v9 = randint(2, 8) / 10
          const v10 = randint(12, 18) / 10
          const v11 = randint(51, 59) / 10
          const v12 = randint(22, 55) / 10
          const v11Bis = randint(1, 15) / 10
          const v12Bis = randint(16, 19) / 10
          const v13 = randint(0, 2)
          const v14 = randint(6, 7)
          const choix = choice([true, false])
          const AFC = 'Cette affirmation est correcte : <br>'
          const AFF = 'Cette affirmation est fausse : <br>'
          this.enonce = `Voici la représentation graphique $\\mathscr{C}_f$ d'une fonction $f$ définie sur $[${theSpline.x[0]}\\,;\\,${theSpline.x[theSpline.n - 1]}]$.<br><br>`
          this.enonce +=
            mathalea2d(
              Object.assign(
                { pixelsParCm: 30, scale: 1, center: !context.isHtml },
                {
                  xmin: bornes.xMin - 1,
                  ymin: bornes.yMin - 1,
                  xmax: bornes.xMax + 1,
                  ymax: bornes.yMax + 1,
                },
              ),
              objetsEnonce,
              o,
            ) + '<br><br>'
          this.enonce += 'Une seule affirmation est correcte :'

          // Définir toutes les réponses possibles avec leur correction
          const bonnesReponses: ReponseQcm[] = [
            {
              texte: `$f$ est positive sur $[${texNombre(v6, 1)}\\,;\\,${texNombre(v7, 1)}]$`,
              texteCorrection: `$${miseEnEvidence('f')}$${texteEnCouleurEtGras(' est positive sur ')}$${miseEnEvidence(`[${texNombre(v6, 1)}\\,;\\,${texNombre(v7, 1)}]`)}$`,
              correction:
                AFC +
                `$f$ est positive sur $[${texNombre(v6, 1)}\\,;\\,${texNombre(v7, 1)}]$ car la courbe se situe au-dessus de l'axe des abscisses sur cet intervalle.`,
              estCorrecte: true,
            },
            {
              texte: "L'équation $f(x)=0$ admet deux solutions opposées.",
              texteCorrection: `${texteEnCouleurEtGras("L'équation ")}$${miseEnEvidence('f(x)=0')}$${texteEnCouleurEtGras(' admet deux solutions opposées.')}`,
              correction:
                AFC +
                "L'équation $f(x)=0$ admet effectivement deux solutions opposées car la courbe coupe deux fois l'axe des abscisses pour des valeurs opposées en $-2$ et $2$.",
              estCorrecte: true,
            },
            {
              texte: 'Le minimum de $f$ est $-4$.',
              texteCorrection: `${texteEnCouleurEtGras('Le minimum de ')}$${miseEnEvidence('f')}$${texteEnCouleurEtGras(' est ')}$${miseEnEvidence('-4')}$${texteEnCouleurEtGras('.')}`,
              correction:
                AFC +
                "Le point le plus bas de la courbe a pour ordonnée $-4$. C'est le minimum de $f$.",
              estCorrecte: true,
            },
            {
              texte: `${choix ? `$f(${texNombre(v8, 2)}) < f(${texNombre(v8 + 0.01, 2)})$` : `$f(${texNombre(v8 + 0.01, 2)}) > f(${texNombre(v8, 2)})$`}`,
              texteCorrection: `$${miseEnEvidence(choix ? `f(${texNombre(v8, 2)}) < f(${texNombre(v8 + 0.01, 2)})` : `f(${texNombre(v8 + 0.01, 2)}) > f(${texNombre(v8, 2)})`)}$`,
              correction:
                AFC +
                ` Comme la fonction est croissante sur $[0\\,;\\,5]$, ${choix ? `$f(${texNombre(v8, 2)}) < f(${texNombre(v8 + 0.01, 2)})$` : `$f(${texNombre(v8 + 0.01, 2)}) > f(${texNombre(v8, 2)})$`}`,
              estCorrecte: false,
            },
            {
              texte: `${choix ? `$f(${texNombre(v9, 2)}) \\times f(${texNombre(v10, 2)}) > 0$` : `$f(${texNombre(v11, 2)}) \\times f(${texNombre(v12, 2)}) > 0$`}`,
              texteCorrection: `$${miseEnEvidence(choix ? `f(${texNombre(v9, 2)}) \\times f(${texNombre(v10, 2)}) > 0` : `f(${texNombre(v11, 2)}) \\times f(${texNombre(v12, 2)}) > 0`)}$`,
              correction:
                AFC +
                `${choix ? `$f(${texNombre(v9, 2)}) <0$ et $f(${texNombre(v10, 2)}) < 0$, donc le produit est positif.` : `$f(${texNombre(v11, 2)}) > 0$ et $f(${texNombre(v12, 2)}) > 0$, donc le produit est positif.`}`,
              estCorrecte: false,
            },
            {
              texte:
                "L'inéquation $f(x) \\leqslant 0$ a pour ensemble de solutions $[-3\\,;\\,2]$.",
              texteCorrection: `${texteEnCouleurEtGras("L'inéquation ")}$${miseEnEvidence('f(x) \\leqslant 0')}$${texteEnCouleurEtGras(' a pour ensemble de solutions ')}$${miseEnEvidence('[-3\\,;\\,2]')}$${texteEnCouleurEtGras('.')}`,
              correction:
                AFC +
                "Les solutions de l'inéquation $f(x) \\leqslant 0$ sont les abscisses respectives des points de la courbe situés en dessous ou sur l'axe des abscissses.",
              estCorrecte: true,
            },
            {
              texte: `Si $${theSpline.x[v13]}\\leqslant x \\leqslant ${theSpline.x[v14]}$, alors $-4\\leqslant f(x) \\leqslant 3$.`,
              texteCorrection: `${texteEnCouleurEtGras('Si ')}$${miseEnEvidence(`${theSpline.x[v13]}\\leqslant x \\leqslant ${theSpline.x[v14]}`)}$${texteEnCouleurEtGras(', alors ')}$${miseEnEvidence('-4\\leqslant f(x) \\leqslant 3')}$${texteEnCouleurEtGras('.')}`,
              correction:
                AFC +
                `Le minimum de $f$ sur $[${theSpline.x[v13]}\\,;\\,${theSpline.x[v14]}]$ est $-4$ et son maximum est $3$, on en déduit l'encadrement $-4\\leqslant x \\leqslant 3$.`,
              estCorrecte: true,
            },
          ]

          const mauvaisesReponses: ReponseQcm[] = [
            {
              texte: `$f$ est négative sur $[${texNombre(v6Bis, 1)}\\,;\\,${texNombre(v7Bis, 1)}]$.`,
              correction:
                AFF +
                `$f$ est positive sur $[${texNombre(v6, 1)}\\,;\\,${texNombre(v7, 1)}]$ car la courbe se situe au-dessus de l'axe des abscisses sur cet intervalle.`,
              estCorrecte: true,
            },
            {
              texte: "L'équation $f(x)=0$ admet une unique solution.",
              correction:
                AFF +
                "L'équation $f(x)=0$ admet deux solutions car la courbe coupe deux fois l'axe des abscisses pour des valeurs opposées en $-2$ et $2$.",
              estCorrecte: true,
            },
            {
              texte: `Le minimum de $f$ est ${choix ? '$-3$' : '$0$'}.`,
              correction:
                AFF +
                "Le point le plus bas de la courbe a pour ordonnée $-4$. C'est le minimum de $f$.",
              estCorrecte: true,
            },
            {
              texte: `Le maximum de $f$ est ${choix ? '$6$' : '$5$'}.`,
              correction:
                AFF +
                "Le point le plus haut de la courbe a pour ordonnée $3$. C'est le maximum de $f$.",
              estCorrecte: true,
            },
            {
              texte: `${choix ? `$f(${texNombre(v8, 2)}) > f(${texNombre(v8 + 0.01, 2)})$` : `$f(${texNombre(v8 + 0.01, 2)}) < f(${texNombre(v8, 2)})$`}`,
              correction:
                AFF +
                ` Comme la fonction est croissante sur $[0\\,;\\,5]$, ${choix ? `$f(${texNombre(v8, 2)}) < f(${texNombre(v8 + 0.01, 2)})$` : `$f(${texNombre(v8 + 0.01, 2)}) > f(${texNombre(v8, 2)})$`}`,
              estCorrecte: false,
            },
            {
              texte: `${choix ? `$f(${texNombre(-v9, 2)}) \\times f(${texNombre(-v10, 2)}) < 0$` : `$f(${texNombre(v11Bis, 2)}) \\times f(${texNombre(v12Bis, 2)}) < 0$`}`,
              correction:
                AFF +
                `${choix ? `$f(${texNombre(-v9, 2)}) <0$ et $f(${texNombre(-v10, 2)}) < 0$, donc le produit est positif.` : `$f(${texNombre(v11Bis, 2)}) < 0$ et $f(${texNombre(v12Bis, 2)}) < 0$, donc le produit est positif.`}`,
              estCorrecte: false,
            },
            {
              texte:
                "L'inéquation $f(x) \\leqslant 0$ a pour ensemble de solutions $[-3\\,;\\,-2[\\cup]-2\\,;\\,2]$.",
              correction:
                AFF +
                "Les solutions de l'inéquation $f(x) \\leqslant 0$ sont les abscisses respectives des points de la courbe situés en dessous ou sur l'axe des abscissses.",
              estCorrecte: true,
            },
            {
              texte: `Si $${theSpline.x[v13]}\\leqslant x \\leqslant ${theSpline.x[v14]}$, alors $${theSpline.y[v13]}\\leqslant f(x) \\leqslant ${theSpline.y[v14]}$.`,
              correction:
                AFF +
                `Le minimum de $f$ sur $[${theSpline.x[v13]}\\,;\\,${theSpline.x[v14]}]$ est $-4$ et son maximum est $3$, on en déduit l'encadrement $-4\\leqslant x \\leqslant 3$.`,
              estCorrecte: true,
            },
          ]
          /* // ========== MODE TEST - AFFICHAGE DE TOUTES LES RÉPONSES ==========
    // Afficher TOUTES les bonnes réponses avec leurs corrections
    this.reponses = []
    bonnesReponses.forEach((rep, i) => {
      this.reponses.push(`✓ BONNE ${i + 1}: ${rep.texte} → CORRECTION: ${rep.correction}`)
    })

    // Afficher TOUTES les mauvaises réponses avec leurs corrections
    mauvaisesReponses.forEach((rep, i) => {
      this.reponses.push(`✗ MAUVAISE ${i + 1}: ${rep.texte} → CORRECTION: ${rep.correction}`)
    })

    // Afficher TOUTES les corrections organisées
    this.correction = '<h3>RÉCAPITULATIF COMPLET :</h3>'
    this.correction += `<h4>BONNES RÉPONSES (${bonnesReponses.length}) :</h4>`
    bonnesReponses.forEach((rep, i) => {
      this.correction += '<div style="border: 2px solid green; padding: 10px; margin: 5px 0; background: #e8f5e8;">'
      this.correction += `<strong>✓ BONNE ${i + 1}:</strong> ${rep.texte}<br>`
      this.correction += `<strong>Correction:</strong> ${rep.correction}`
      this.correction += '</div>'
    })

    this.correction += `<h4>MAUVAISES RÉPONSES (${mauvaisesReponses.length}) :</h4>`
    mauvaisesReponses.forEach((rep, i) => {
      this.correction += '<div style="border: 2px solid red; padding: 10px; margin: 5px 0; background: #ffe8e8;">'
      this.correction += `<strong>✗ MAUVAISE ${i + 1}:</strong> ${rep.texte}<br>`
      this.correction += `<strong>Correction:</strong> ${rep.correction}`
      this.correction += '</div>'
    }) */
          // ========== FIN MODE TEST ==========
          // Choisir une bonne réponse et 3 mauvaises réponses distinctes
          const bonneReponseChoisie = choice(bonnesReponses)
          const mauvaisesReponsesMelangees = shuffle([...mauvaisesReponses])
          const mauvaisesReponsesChoisies = mauvaisesReponsesMelangees.slice(
            0,
            3,
          )

          // Constituer le tableau des réponses (bonne réponse en premier)
          const toutesLesReponses = [
            bonneReponseChoisie,
            ...mauvaisesReponsesChoisies,
          ]

          // Extraire les textes pour this.reponses
          this.reponses = toutesLesReponses.map((reponse) => reponse.texte)

          // Construire la correction en analysant chaque réponse
          this.correction = ''
          toutesLesReponses.forEach((reponse, _index) => {
            this.correction += `$\\bullet$ `
            this.correction +=
              reponse.texte === bonneReponseChoisie.texte
                ? `${reponse.texteCorrection}<br>`
                : `${reponse.texte}<br>`
            this.correction += ` ${reponse.correction}<br>`
          })
        }
        break
    }
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options.vertical = true
  }
}
