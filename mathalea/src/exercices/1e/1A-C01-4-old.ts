// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 3febe continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '3febe'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Ordonner des nombres par ordre croissant'
export const dateDePublication = '28/08/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class OrdonnerCroissantOld extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  // Fonction pour déterminer la conversion intermédiaire d'une fraction
  private obtenirConversionIntermediaire(tex: string, _val: number): string {
    // Extraire le numérateur et dénominateur de la fraction LaTeX
    // Gérer les cas avec accolades doubles ou espaces dans les nombres
    const match = tex.match(/\\dfrac\{(\d+)\}\{(?:\{?([0-9\s]+)\}?)\}/)
    if (!match) return '' // Pas une fraction

    const numerateur = parseInt(match[1])
    const denominateurStr = match[2].replace(/\s/g, '') // Enlever les espaces
    const denominateur = parseInt(denominateurStr)

    // Vérifier si on peut convertir facilement vers /100
    if (denominateur === 25) {
      return `\\dfrac{${numerateur} \\times 4}{25\\times 4} = \\dfrac{${numerateur * 4}}{100}=`
    } else if (denominateur === 20) {
      return `\\dfrac{${numerateur} \\times 5}{20\\times 5} = \\dfrac{${numerateur * 5}}{100}=`
    } else if (denominateur === 50) {
      return `\\dfrac{${numerateur} \\times 2}{50\\times 2} =  \\dfrac{${numerateur * 2}}{100}=`
    }

    return '' // Pas de conversion intermédiaire
  }

  // Fonction pour formater la ligne de correction
  private construireLigneCorrection(tex: string, val: number): string {
    const valeurDecimale = (Math.round(val * 1000) / 1000)
      .toString()
      .replace('.', ',')

    // Si c'est déjà un nombre décimal, pas besoin de conversion
    if (tex.includes(',')) {
      return `$${tex}$<br><br>`
    }

    // Si c'est une fraction, chercher une conversion intermédiaire
    const conversionIntermediaire = this.obtenirConversionIntermediaire(
      tex,
      val,
    )

    if (conversionIntermediaire) {
      return `$${tex} = ${conversionIntermediaire}${valeurDecimale}$<br><br>`
    } else {
      // Pour toutes les autres fractions (y compris /1000), afficher directement la valeur décimale
      return `$${tex} = ${valeurDecimale}$<br><br>`
    }
  }

  versionOriginale: () => void = () => {
    this.enonce = `Voici trois nombres.<br>$\\dfrac{1}{5}$ ${sp(6)} $\\dfrac{19}{100}$ ${sp(6)} $0,21$<br>
    Le classement par ordre croissant de ces trois nombres est :`

    this.correction = `Pour comparer ces trois nombres, on les écrit sous forme décimale :<br>
    $\\dfrac{1}{5} = 0,2$<br>
    $\\dfrac{19}{100} = 0,19$<br>
    $0,21$<br><br>
    On a donc : $0,19 < 0,2 < 0,21$<br>
    Soit : $${miseEnEvidence('\\dfrac{19}{100} < \\dfrac{1}{5} < 0,21')}$.`

    this.reponses = [
      '$\\dfrac{19}{100} < \\dfrac{1}{5} < 0,21$',
      '$\\dfrac{1}{5} < \\dfrac{19}{100} < 0,21$',
      '$\\dfrac{1}{5} < 0,21 < \\dfrac{19}{100}$',
      '$0,21 < \\dfrac{19}{100} < \\dfrac{1}{5}$',
    ]
  }

  versionAleatoire: () => void = () => {
    // Générateur de triplets de nombres avec leurs comparaisons
    const triplets = [
      // Triplet 1: fraction simple, fraction/100, décimal
      {
        a: { tex: '\\dfrac{2}{5}', val: 0.4, desc: 'fraction simple' },
        b: { tex: '\\dfrac{37}{100}', val: 0.37, desc: 'fraction sur 100' },
        c: { tex: '0,42', val: 0.42, desc: 'décimal' },
      },
      // Triplet 2: fraction/10, fraction simple, décimal
      {
        a: { tex: '\\dfrac{3}{10}', val: 0.3, desc: 'fraction sur 10' },
        b: { tex: '\\dfrac{1}{4}', val: 0.25, desc: 'fraction simple' },
        c: { tex: '0,31', val: 0.31, desc: 'décimal' },
      },
      // Triplet 3: décimal, fraction/1000, fraction simple
      {
        a: { tex: '0,125', val: 0.125, desc: 'décimal' },
        b: {
          tex: `\\dfrac{127}{${texNombre(1000)}}`,
          val: 0.127,
          desc: `fraction sur $${texNombre(1000)}$`,
        },
        c: { tex: '\\dfrac{3}{25}', val: 0.12, desc: 'fraction simple' },
      },
      // Triplet 4: fraction/100, décimal, fraction simple
      {
        a: { tex: '\\dfrac{23}{100}', val: 0.23, desc: 'fraction sur 100' },
        b: { tex: '0,2', val: 0.2, desc: 'décimal' },
        c: { tex: '\\dfrac{1}{4}', val: 0.25, desc: 'fraction simple' },
      },
      // Triplet 5: fraction simple, décimal, fraction/100
      {
        a: { tex: '\\dfrac{3}{8}', val: 0.375, desc: 'fraction simple' },
        b: { tex: '0,4', val: 0.4, desc: 'décimal' },
        c: { tex: '\\dfrac{36}{100}', val: 0.36, desc: 'fraction sur 100' },
      },
      // Triplet 6: fraction/1000, fraction simple, décimal
      {
        a: {
          tex: `\\dfrac{333}{${texNombre(1000)}}`,
          val: 0.333,
          desc: `fraction sur $${texNombre(1000)}$`,
        },
        b: { tex: '\\dfrac{3}{10}', val: 0.3, desc: 'fraction simple' },
        c: { tex: '0,33', val: 0.33, desc: 'décimal' },
      },
      // Triplet 7
      {
        a: { tex: '\\dfrac{7}{10}', val: 0.7, desc: 'fraction sur 10' },
        b: { tex: '0,65', val: 0.65, desc: 'décimal' },
        c: { tex: '\\dfrac{3}{5}', val: 0.6, desc: 'fraction simple' },
      },
      // Triplet 8
      {
        a: { tex: '0,45', val: 0.45, desc: 'décimal' },
        b: { tex: '\\dfrac{11}{25}', val: 0.44, desc: 'fraction simple' },
        c: { tex: '\\dfrac{47}{100}', val: 0.46, desc: 'fraction sur 100' },
      },
      // Triplet 9
      {
        a: {
          tex: `\\dfrac{125}{${texNombre(1000)}}`,
          val: 0.125,
          desc: `fraction sur $${texNombre(1000)}$`,
        },
        b: { tex: '0,13', val: 0.13, desc: 'décimal' },
        c: { tex: '\\dfrac{3}{25}', val: 0.12, desc: 'fraction simple' },
      },
      // Triplet 10
      {
        a: { tex: '\\dfrac{3}{5}', val: 0.6, desc: 'fraction simple' },
        b: { tex: '\\dfrac{58}{100}', val: 0.58, desc: 'fraction sur 100' },
        c: { tex: '0,61', val: 0.61, desc: 'décimal' },
      },
      // Triplet 11
      {
        a: { tex: '0,75', val: 0.75, desc: 'décimal' },
        b: { tex: '\\dfrac{7}{10}', val: 0.7, desc: 'fraction simple' },
        c: { tex: '\\dfrac{74}{100}', val: 0.74, desc: 'fraction sur 100' },
      },
      // Triplet 12
      {
        a: { tex: '\\dfrac{7}{100}', val: 0.07, desc: 'fraction sur 100' },
        b: { tex: '\\dfrac{2}{25}', val: 0.08, desc: 'fraction simple' },
        c: { tex: '0,075', val: 0.075, desc: 'décimal' },
      },
      // Triplet 13
      {
        a: { tex: '\\dfrac{4}{10}', val: 0.4, desc: 'fraction sur 10' },
        b: { tex: '0,399', val: 0.399, desc: 'décimal' },
        c: { tex: '\\dfrac{21}{50}', val: 0.42, desc: 'fraction simple' },
      },
      // Triplet 14
      {
        a: {
          tex: `\\dfrac{167}{${texNombre(1000)}}`,
          val: 0.167,
          desc: `fraction sur $${texNombre(1000)}$`,
        },
        b: { tex: '\\dfrac{1}{5}', val: 0.2, desc: 'fraction simple' },
        c: { tex: '0,16', val: 0.16, desc: 'décimal' },
      },
      // Triplet 15
      {
        a: { tex: '0,9', val: 0.9, desc: 'décimal' },
        b: { tex: '\\dfrac{89}{100}', val: 0.89, desc: 'fraction sur 100' },
        c: { tex: '\\dfrac{22}{25}', val: 0.88, desc: 'fraction simple' },
      },
      // Triplet 16
      {
        a: { tex: '\\dfrac{4}{5}', val: 0.8, desc: 'fraction simple' },
        b: { tex: '0,82', val: 0.82, desc: 'décimal' },
        c: {
          tex: `\\dfrac{835}{${texNombre(1000)}}`,
          val: 0.835,
          desc: `fraction sur $${texNombre(1000)}$`,
        },
      },
      // Triplet 17
      {
        a: { tex: '\\dfrac{13}{100}', val: 0.13, desc: 'fraction sur 100' },
        b: { tex: '\\dfrac{1}{8}', val: 0.125, desc: 'fraction simple' },
        c: { tex: '0,14', val: 0.14, desc: 'décimal' },
      },
      // Triplet 18
      {
        a: { tex: '0,375', val: 0.375, desc: 'décimal' },
        b: { tex: '\\dfrac{38}{100}', val: 0.38, desc: 'fraction sur 100' },
        c: { tex: '\\dfrac{7}{20}', val: 0.35, desc: 'fraction simple' },
      },
      // Triplet 19
      {
        a: { tex: '\\dfrac{6}{10}', val: 0.6, desc: 'fraction sur 10' },
        b: { tex: '\\dfrac{31}{50}', val: 0.62, desc: 'fraction simple' },
        c: { tex: '0,59', val: 0.59, desc: 'décimal' },
      },
      // Triplet 20
      {
        a: {
          tex: `\\dfrac{275}{${texNombre(1000)}}`,
          val: 0.275,
          desc: `fraction sur $${texNombre(1000)}$`,
        },
        b: { tex: '0,27', val: 0.27, desc: 'décimal' },
        c: { tex: '\\dfrac{7}{25}', val: 0.28, desc: 'fraction simple' },
      },
    ]

    // Sélection aléatoire d'un triplet
    const triplet = choice(triplets)
    const { a, b, c } = triplet

    // Tri par ordre croissant
    const nombresTries = [a, b, c].sort((x, y) => x.val - y.val)

    // Construction des réponses
    const ordreCorrect = nombresTries.map((n) => n.tex).join(' < ')

    // Générer d'autres ordres possibles
    const autresOrdres = [
      `${a.tex} < ${b.tex} < ${c.tex}`,
      `${a.tex} < ${c.tex} < ${b.tex}`,
      `${b.tex} < ${a.tex} < ${c.tex}`,
      `${b.tex} < ${c.tex} < ${a.tex}`,
      `${c.tex} < ${a.tex} < ${b.tex}`,
      `${c.tex} < ${b.tex} < ${a.tex}`,
    ].filter((ordre) => ordre !== ordreCorrect)

    // Sélectionner 3 ordres incorrects
    const reponsesFausses = []
    for (let i = 0; i < 3 && i < autresOrdres.length; i++) {
      reponsesFausses.push(autresOrdres[i])
    }

    this.enonce = `Voici trois nombres.<br>$${a.tex}$ ${sp(6)} $${b.tex}$ ${sp(6)} $${c.tex}$<br>
    Le classement par ordre croissant de ces trois nombres est :`

    // Construction de la correction avec conversion en décimaux
    let correctionTexte =
      'Pour comparer ces trois nombres, on les écrit sous forme décimale :<br>'

    correctionTexte += this.construireLigneCorrection(a.tex, a.val)
    correctionTexte += this.construireLigneCorrection(b.tex, b.val)
    correctionTexte += this.construireLigneCorrection(c.tex, c.val)

    const valeursTriees = nombresTries
      .map((n) =>
        (Math.round(n.val * 1000) / 1000).toString().replace('.', ','),
      )
      .join(' < ')
    correctionTexte += `<br>On a donc : $${valeursTriees}$.<br>`
    correctionTexte += `Finalement : $${miseEnEvidence(ordreCorrect)}$.`

    this.correction = correctionTexte

    this.reponses = [
      `$${ordreCorrect}$`,
      `$${reponsesFausses[0]}$`,
      `$${reponsesFausses[1]}$`,
      `$${reponsesFausses[2]}$`,
    ]
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Pour comparer des nombres, selon les situations, il est souvent plus pratique de tous les écrire :
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>sous forme de fractions de même dénominateur,</li>
    <li>sous forme décimale,</li>
    <li>en notation scientifique.</li>
  </ul>
   <p style="margin: 0 0 10px 0;">
   Le plus simple dans cet exercice est de les écrire sous forme décimale.
  </p>
 `
    this.versionAleatoire()
    this.spacing = 1.5
    this.spacingCorr = 1
  }
}
