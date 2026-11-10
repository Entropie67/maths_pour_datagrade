// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 3d696 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import {
  Spline,
  spline,
  type NoeudSpline,
} from '../../lib/mathFonctions/Spline'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'

import { bleuMathalea } from '../../lib/colors'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '30/07/2025'
export const uuid = '3d696'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation par lecture graphique'

interface ReponseQcm {
  texte: string
  correction: string
  estCorrecte: boolean
  texteCorrection?: string
}

export default class AutoF4Old extends ExerciceQcmA {
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
      { x: 4, y: 1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 5, y: 0, deriveeGauche: -1, deriveeDroit: 0, isVisible: true },
    ]

    const o = latex2d('\\text{O}', -0.2, -0.3, { letterSize: 'scriptsize' })
    const theSpline = spline(noeudsFixes)
    this.spline = theSpline

    const bornes = theSpline.trouveMaxes()
    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: false,
      grilleY: false,
      grilleSecondaire: true,
      grilleSecondaireOpacite: 1,
      xThickMin: bornes.xMin - 1,
      yThickMin: bornes.yMin - 1,
      xLabelMin: bornes.xMin,
      yLabelMin: bornes.yMin,
      axesEpaisseur: 1.5,
      grilleOpacite: 1,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireCouleur: 'black',
      grilleSecondaireYMin: bornes.yMin - 1.02,
      grilleSecondaireYMax: bornes.yMax + 1.02,
      grilleSecondaireXMin: bornes.xMin - 1.02,
      grilleSecondaireXMax: bornes.xMax + 1.02,
    })

    const courbe1 = theSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: true,
      optionsNoeuds: { color: 'black', taille: 1.5, style: 'x', epaisseur: 2 },
      color: bleuMathalea,
    })

    const objetsEnonce = [repere1, courbe1]

    this.enonce =
      "Voici la représentation graphique d'une fonction $f$ définie sur $[-5\\,;\\,5]$.<br><br>"
    this.enonce +=
      mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.75, center: !context.isHtml },
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

    // Nouvelles questions inspirées des thèmes de la version aléatoire
    this.reponses = [
      "Le produit des solutions de l'équation $f(x) = 0$ est égal à $20$.",
      "Soit $k \\in \\mathbb{R}$. L'équation $f(x) = k$ a au moins une solution.",
      "Pour tout réel $k \\in [1\\,;\\,2[$, l'équation $f(x) = k$ admet exactement deux solutions.",
      "Le produit des solutions de l'équation $f(x) = 1$ est égal à $-20$.",
    ]

    this.correction = `
    Analysons chaque affirmation en observant attentivement la courbe :<br>

    $\\bullet$ ${texteEnCouleurEtGras("Le produit des solutions de l'équation ")}$${miseEnEvidence('f(x)=0')}$${texteEnCouleurEtGras(' est égal à ')}$${miseEnEvidence('20')}$${texteEnCouleurEtGras('.')}<br>
    Cette affirmation est correcte : L'équation $f(x) = 0$ correspond aux points où la courbe coupe l'axe des abscisses.<br>
    D'après le graphique, ces solutions sont : $x = -4$, $x = -1$ et $x = 5$.<br>
    Le produit est : $(-4) \\times (-1) \\times 5 = 20$.<br>

    $\\bullet$ Soit $k \\in \\mathbb{R}$. L'équation $f(x) = k$ a au moins une solution.<br>
    Cette affirmation est fausse : l'équation $f(x)=7$ n'a pas de solution.<br>

    $\\bullet$ Pour tout réel $k \\in [1\\,;\\,2[$, l'équation $f(x) = k$ admet exactement deux solutions.<br>
    Cette affirmation est fausse : si $k=1$, l'équation a trois solutions.<br>

    $\\bullet$ Le produit des solutions de l'équation $f(x) = 1$ est égal à $-20$.<br>
    Cette affirmation est fausse : il y a $0$ parmi les solutions, donc le produit est nul.
    `
  }

  versionAleatoire = () => {
    const noeuds1 = [
      { x: -4, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 0, y: 1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 2, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 3, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 5, y: 1, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 6, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
    ]
    const noeudsCourbe = noeuds1
    function aleatoiriseCourbe(noeudsChoisis: NoeudSpline[]) {
      const coeffX = choice([-1, 1]) // symétries ou pas
      const coeffY = choice([-1, 1])
      const deltaX = randint(-1, 1) // translations
      const deltaY = randint(-1, 1) // randint(-2, +2)

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

    const o = latex2d('\\text{O}', -0.2, -0.3, { letterSize: 'scriptsize' })
    const nuage = aleatoiriseCourbe(noeudsCourbe)
    const theSpline = spline(nuage)
    this.spline = theSpline
    const bornes = theSpline.trouveMaxes()
    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: false,
      grilleY: false,
      xThickMin: bornes.xMin - 1,
      yThickMin: bornes.yMin - 1,
      thickHauteur: 0.1,
      xLabelMin: bornes.xMin,
      yLabelMin: bornes.yMin,
      grilleSecondaireOpacite: 1,
      axesEpaisseur: 1.5,
      grilleOpacite: 1,
      grilleSecondaire: true,
      grilleSecondaireCouleur: 'black',
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: bornes.yMin - 1.02,
      grilleSecondaireYMax: bornes.yMax + 1.02,
      grilleSecondaireXMin: bornes.xMin - 1.02,
      grilleSecondaireXMax: bornes.xMax + 1.02,
    })
    const courbe1 = theSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: true,
      optionsNoeuds: { color: 'black', taille: 1.5, style: 'x', epaisseur: 2 },
      color: bleuMathalea,
    })
    const objetsEnonce = [repere1, courbe1]
    const nbAntecedentsEntiersMaximum = theSpline.nombreAntecedentsMaximum(
      bornes.yMin,
      bornes.yMax,
      true,
      true,
    )

    const nombreAntecedentCherches2 = 2 // choice([randint(1, nbAntecedentsEntiersMaximum), randint(0, nbAntecedentsEntiersMaximum), randint(1, nbAntecedentsEntiersMaximum)])
    const nombreAntecedentCherches1 = 1
    const nombreAntecedentCherches3 = 3

    const y2 = theSpline.trouveYPourNAntecedents(
      nombreAntecedentCherches2,
      bornes.yMin - 1,
      bornes.yMax + 1,
      true,
      true,
    )
    const y1 = theSpline.trouveYPourNAntecedents(
      nombreAntecedentCherches1,
      bornes.yMin - 1,
      bornes.yMax + 1,
      true,
      true,
    )
    const y3 = theSpline.trouveYPourNAntecedents(
      nombreAntecedentCherches3,
      bornes.yMin - 1,
      bornes.yMax + 1,
      true,
      true,
    )
    const y0 = theSpline.trouveYPourNAntecedents(
      nombreAntecedentCherches3,
      bornes.yMin - 1,
      bornes.yMax + 1,
      true,
      true,
    )

    if (y1 === false || y2 === false || y3 === false || y0 === false) {
      this.compteur++
      if (this.compteur > 10) {
        window.notify(
          "Erreur dans la génération de l'exercice : y1 === false",
          {
            spline: theSpline,
            nombreAntecedentCherches2,
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
    const solutions2 = theSpline.solve(y2) ?? []

    const solutions3 = theSpline.solve(y3) ?? []

    const AFC = 'Cette affirmation est correcte : <br>'
    const AFF = 'Cette affirmation est fausse : <br>'
    this.enonce = `Voici la représentation graphique d'une fonction $f$ définie sur $[${theSpline.x[0]}\\,;\\,${theSpline.x[theSpline.n - 1]}]$.<br><br>`
    this.enonce +=
      mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.75, center: !context.isHtml },
          {
            xmin: bornes.xMin - 2,
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
        texte: `Le produit des solutions de l'équation $f(x)=${y2}$ est égal à $${solutions2[0] * solutions2[1]}$.`,
        texteCorrection: `${texteEnCouleurEtGras("Le produit des solutions de l'équation ")}$${miseEnEvidence(`f(x)=${y2}`)}$${texteEnCouleurEtGras(' est égal à ')}$${miseEnEvidence(`${solutions2[0] * solutions2[1]}.`)}$`,
        correction:
          AFC +
          `L'équation $f(x)=${y2}$ a deux solutions : $${solutions2[0]}$ et $${solutions2[1]}$.<br>
          Le produit de ces solutions est $${solutions2[0]}\\times ${ecritureParentheseSiNegatif(solutions2[1])}= ${solutions2[0] * solutions2[1]}$.`,
        estCorrecte: true,
      },
      {
        texte: `La somme des solutions de l'équation $f(x)=${y2}$ est égal à $${solutions2[0] + solutions2[1]}$.`,
        texteCorrection: `${texteEnCouleurEtGras("La somme des solutions de l'équation ")}$${miseEnEvidence(`f(x)=${y2}`)}$${texteEnCouleurEtGras(' est égale à ')}$${miseEnEvidence(`${solutions2[0] * solutions2[1]}.`)}$`,
        correction:
          AFC +
          `L'équation $f(x)=${y2}$ a deux solutions : $${solutions2[0]}$ et $${solutions2[1]}$.<br>
          La somme de ces solutions est $${solutions2[0]}+ ${ecritureParentheseSiNegatif(solutions2[1])}= ${solutions2[0] + solutions2[1]}$.`,
        estCorrecte: true,
      },
      {
        texte: `La somme des solutions de l'équation $f(x)=${y3}$ est égal à $${solutions3[0] + solutions3[1] + solutions3[2]}$.`,
        texteCorrection: `${texteEnCouleurEtGras("La somme des solutions de l'équation ")}$${miseEnEvidence(`f(x)=${y3}`)}$${texteEnCouleurEtGras(' est égale à ')}$${miseEnEvidence(`${solutions3[1] * solutions3[2]}.`)}$`,
        correction:
          AFC +
          `L'équation $f(x)=${y3}$ a trois solutions : $${solutions3[0]}$, $${solutions3[1]}$ et $${solutions3[2]}$.<br>
          La somme de ces solutions est $${solutions3[0]}+ ${ecritureParentheseSiNegatif(solutions3[1])}+${ecritureParentheseSiNegatif(solutions3[2])}= ${solutions3[0] + solutions3[1] + solutions3[2]}$.`,
        estCorrecte: true,
      },
      {
        texte: `Le produit des solutions de l'équation $f(x)=${y3}$ est égal à $${solutions3[0] * solutions3[1] * solutions3[2]}$.`,
        texteCorrection: `${texteEnCouleurEtGras("Le produit des solutions de l'équation ")}$${miseEnEvidence(`f(x)=${y3}`)}$${texteEnCouleurEtGras(' est égal à ')}$${miseEnEvidence(`${solutions3[1] * solutions3[2]}.`)}$`,
        correction:
          AFC +
          `L'équation $f(x)=${y3}$ a trois solutions : $${solutions3[0]}$, $${solutions3[1]}$ et $${solutions3[2]}$.<br>
          Le produit de ces solutions est $${solutions3[0]}\\times ${ecritureParentheseSiNegatif(solutions3[1])}\\times ${ecritureParentheseSiNegatif(solutions3[2])}= ${solutions3[0] * solutions3[1] * solutions3[2]}$.`,
        estCorrecte: true,
      },
      {
        texte: `Soit $k\\in\\mathbb{R}$. <br>
          L'équation $f(x)=k$ a au plus $3$ solutions.`,
        texteCorrection: `${texteEnCouleurEtGras('Soit ')}$${miseEnEvidence('k\\in\\mathbb{R}')}$${texteEnCouleurEtGras(". <br>L'équation ")}$${miseEnEvidence('f(x)=k')}$${texteEnCouleurEtGras(' a au plus ')}$${miseEnEvidence('3')}$${texteEnCouleurEtGras(' solutions.')}`,
        correction:
          AFC +
          'Une droite horizontale coupe au plus trois fois la courbe, donc le nombre maximal de solutions est $3$.',
        estCorrecte: true,
      },
      {
        texte: `Soit $k\\in]${Math.min(theSpline.y[2], theSpline.y[3])}\\,;\\,${Math.max(theSpline.y[2], theSpline.y[3])}[$. <br>
          L'équation $f(x)=k$ admet exactement deux solutions.`,
        texteCorrection: `${texteEnCouleurEtGras('Soit ')}$${miseEnEvidence(`k\\in]${Math.min(theSpline.y[2], theSpline.y[3])}\\,;\\,${Math.max(theSpline.y[2], theSpline.y[3])}[`)}$${texteEnCouleurEtGras(". <br>L'équation ")}$${miseEnEvidence('f(x)=k')}$${texteEnCouleurEtGras(' admet exactement deux solutions.')}`,
        correction:
          AFC +
          `Si $k\\in]${Math.min(theSpline.y[2], theSpline.y[3])}\\,;\\,${Math.max(theSpline.y[2], theSpline.y[3])}[$, la droite d'équation $y=k$ coupe bien deux fois la courbe.`,
        estCorrecte: true,
      },
      {
        texte: `Soit $k\\in]${Math.min(theSpline.y[6], theSpline.y[7])}\\,;\\,${Math.max(theSpline.y[6], theSpline.y[7])}[$. <br>
          L'équation $f(x)=k$ admet exactement deux solutions.`,
        texteCorrection: `${texteEnCouleurEtGras('Soit ')}$${miseEnEvidence(`k\\in]${Math.min(theSpline.y[6], theSpline.y[7])}\\,;\\,${Math.max(theSpline.y[6], theSpline.y[7])}[`)}$${texteEnCouleurEtGras(". <br>L'équation ")}$${miseEnEvidence('f(x)=k')}$${texteEnCouleurEtGras(' admet exactement deux solutions.')}`,
        correction:
          AFC +
          `Si $k\\in]${Math.min(theSpline.y[6], theSpline.y[7])}\\,;\\,${Math.max(theSpline.y[6], theSpline.y[7])}[$,  la droite d'équation $y=k$ coupe bien deux fois la courbe.`,
        estCorrecte: true,
      },
      {
        texte: `Soit $k\\in\\mathbb{R}$. <br>
          Il existe une infinité de valeurs de $k$ pour lesquelles l'équation $f(x)=k$ admet exactement trois solutions.`,
        texteCorrection: `${texteEnCouleurEtGras('Soit ')}$${miseEnEvidence('k\\in\\mathbb{R}')}$${texteEnCouleurEtGras('. <br>Il existe une infinité de valeurs de ')}$${miseEnEvidence('k')}$${texteEnCouleurEtGras(" pour lesquelles l'équation ")}$${miseEnEvidence('f(x)=k')}$${texteEnCouleurEtGras(' admet exactement trois solutions.')}`,
        correction:
          AFC +
          `Pour toutes les valeurs de $k$ comprises entre $${Math.min(theSpline.y[0], theSpline.y[9])}$ et $${Math.max(theSpline.y[0], theSpline.y[9])}$, l'équation $f(x)=k$ admet exactement trois solutions.`,
        estCorrecte: true,
      },
      {
        texte: `Soit $k\\in[${Math.min(theSpline.y[0], theSpline.y[9])}\\,;\\,${Math.max(theSpline.y[0], theSpline.y[9])}]$. <br>
          L'équation $f(x)=k$ admet exactement trois solutions.`,
        texteCorrection: `${texteEnCouleurEtGras('Soit ')}$${miseEnEvidence(`k\\in[${Math.min(theSpline.y[0], theSpline.y[9])}\\,;\\,${Math.max(theSpline.y[0], theSpline.y[9])}]`)}$${texteEnCouleurEtGras(". <br>L'équation ")}$${miseEnEvidence('f(x)=k')}$${texteEnCouleurEtGras(' admet exactement trois solutions.')}`,
        correction:
          AFC +
          `Si $k\\in[${Math.min(theSpline.y[0], theSpline.y[9])}\\,;\\,${Math.max(theSpline.y[0], theSpline.y[9])}]$ la droite d'équation $y=k$ coupe bien trois fois la courbe.`,
        estCorrecte: true,
      },
    ]

    const mauvaisesReponses: ReponseQcm[] = [
      {
        texte: `Le produit des solutions de l'équation $f(x)=${y2}$ est égal à $${solutions2[0] + solutions2[1]}$.`,
        correction:
          AFF +
          `L'équation $f(x)=${y2}$ a deux solutions : $${solutions2[0]}$ et $${solutions2[1]}$.<br>
          Le produit de ces solutions est $${solutions2[0]}\\times ${ecritureParentheseSiNegatif(solutions2[1])}= ${solutions2[0] * solutions2[1]}$.`,
        estCorrecte: false,
      },
      {
        texte: `La somme des solutions de l'équation $f(x)=${y2}$ est égal à $${solutions2[0] * solutions2[1]}$.`,
        correction:
          AFF +
          `L'équation $f(x)=${y2}$ a deux solutions : $${solutions2[0]}$ et $${solutions2[1]}$.<br>
          La somme de ces solutions est $${solutions2[0]}+ ${ecritureParentheseSiNegatif(solutions2[1])}= ${solutions2[0] + solutions2[1]}$.`,
        estCorrecte: false,
      },
      {
        texte: `La somme des solutions de l'équation $f(x)=${y3}$ est égal à $${solutions3[0] * solutions3[1] * solutions3[2]}$.`,
        correction:
          AFF +
          `L'équation $f(x)=${y3}$ a trois solutions : $${solutions3[0]}$, $${solutions3[1]}$ et $${solutions3[2]}$.<br>
          La somme de ces solutions est $${solutions3[0]}+ ${ecritureParentheseSiNegatif(solutions3[1])}+${ecritureParentheseSiNegatif(solutions3[2])}= ${solutions3[0] + solutions3[1] + solutions3[2]}$.`,
        estCorrecte: false,
      },
      {
        texte: `Le produit des solutions de l'équation $f(x)=${y3}$ est égal à $${solutions3[0] + solutions3[1] + solutions3[2]}$.`,
        correction:
          AFF +
          `L'équation $f(x)=${y3}$ a trois solutions : $${solutions3[0]}$, $${solutions3[1]}$ et $${solutions3[2]}$.<br>
          Le produit de ces solutions est $${solutions3[0]}\\times ${ecritureParentheseSiNegatif(solutions3[1])}\\times ${ecritureParentheseSiNegatif(solutions3[2])}= ${solutions3[0] * solutions3[1] * solutions3[2]}$.`,
        estCorrecte: false,
      },
      {
        texte: `Soit $k\\in\\mathbb{R}$. <br>
          L'équation $f(x)=k$ a au plus $4$ solutions.`,
        correction:
          AFF +
          'Une droite horizontale coupe au plus trois fois la courbe, donc le nombre maximal de solutions est $3$.',
        estCorrecte: false,
      },
      {
        texte: `Soit $k\\in]${Math.min(theSpline.y[2], theSpline.y[3])}\\,;\\,${Math.max(theSpline.y[2], theSpline.y[3])}[$. <br>
          L'équation $f(x)=k$ admet exactement trois solutions.`,
        correction:
          AFF +
          `Si $k\\in]${Math.min(theSpline.y[2], theSpline.y[3])}\\,;\\,${Math.max(theSpline.y[2], theSpline.y[3])}[$, la droite d'équation $y=k$ coupe bien deux fois la courbe.`,
        estCorrecte: false,
      },
      {
        texte: `Soit $k\\in]${Math.min(theSpline.y[6], theSpline.y[7])}\\,;\\,${Math.max(theSpline.y[6], theSpline.y[7])}[$. <br>
          L'équation $f(x)=k$ admet exactement trois solutions.`,
        correction:
          AFF +
          `Si $k\\in]${Math.min(theSpline.y[6], theSpline.y[7])}\\,;\\,${Math.max(theSpline.y[6], theSpline.y[7])}[$,  la droite d'équation $y=k$ coupe bien deux fois la courbe.`,
        estCorrecte: false,
      },
      {
        texte: `Soit $k\\in\\mathbb{R}$. <br>
          Il n'existe que deux valeurs de $k$ pour lesquelles l'équation $f(x)=k$ ait exactement trois solutions.`,
        correction:
          AFF +
          `Pour toutes les valeurs de $k$ comprises entre $${Math.min(theSpline.y[0], theSpline.y[9])}$ et $${Math.max(theSpline.y[0], theSpline.y[9])}$, l'équation $f(x)=k$ admet exactement trois solutions.`,
        estCorrecte: false,
      },
      {
        texte: `Soit $k\\in[${Math.min(theSpline.y[0], theSpline.y[9])}\\,;\\,${Math.max(theSpline.y[0], theSpline.y[9])}]$. <br>
          L'équation $f(x)=k$ admet exactement deux solutions.`,
        correction:
          AFF +
          `Si $k\\in[${Math.min(theSpline.y[0], theSpline.y[9])}\\,;\\,${Math.max(theSpline.y[0], theSpline.y[9])}]$ la droite d'équation $y=k$ coupe trois fois la courbe et donc l'équation a trois solutions.`,
        estCorrecte: false,
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
    })
    // ========== FIN MODE TEST ========== */
    // Choisir une bonne réponse et 3 mauvaises réponses distinctes
    const bonneReponseChoisie = choice(bonnesReponses)
    const mauvaisesReponsesMelangees = shuffle([...mauvaisesReponses])
    const mauvaisesReponsesChoisies = mauvaisesReponsesMelangees.slice(0, 3)

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
      // Utiliser texteCorrection pour la bonne réponse (index 0), texte pour les autres
      const texteAffiche =
        index === 0 && reponse.texteCorrection
          ? reponse.texteCorrection
          : reponse.texte
      this.correction += `$\\bullet$ ${texteAffiche}<br>`
      this.correction += `  ${reponse.correction}<br>`
    })
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options.vertical = true
  }
}
