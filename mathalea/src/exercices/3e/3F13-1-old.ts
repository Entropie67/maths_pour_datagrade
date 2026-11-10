import { graphiqueInterpole } from '../../lib/2d/GraphiqueInterpole'
import { repere } from '../../lib/2d/reperes'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint, texConsigne } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lire graphiquement images et antécédents'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Lecture d'images et antécédents sur un graphe sinusoidale
 * @author Rémi Angot
 */
export const uuid = '4b121'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class AntecedentEtImageGraphique extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    if (context.isHtml) {
      this.spacingCorr = 2
    }
  }

  nouvelleVersion() {
    const r = repere({
      xMin: -5,
      xMax: 5,
      yMin: -4,
      yMax: 4,
    })
    let a = randint(1, 3)
    let b = a - 4
    let c = a - 2
    let x0 = randint(-4, -2)
    while (x0 === a || x0 + 4 === b || x0 + 6 === c) {
      // Pour éviter d'avoir une image égale à un antécédent
      a = randint(1, 3)
      b = a - 4
      c = a - 2
      x0 = randint(-4, -2)
    }
    let gr = graphiqueInterpole(
      [
        [randint(-8, -5), a - 1],
        [x0, a],
        [x0 + 4, b],
        [x0 + 6, c],
        [randint(6, 10), c - 1],
      ], // Coordonnées des "sommets"
      { repere: r, color: bleuMathalea, step: 0.15, epaisseur: 2 },
    )

    if (choice([false, true])) {
      a *= -1
      b *= -1
      c *= -1
      gr = graphiqueInterpole(
        [
          [randint(-8, -5), a + 1],
          [x0, a],
          [x0 + 4, b],
          [x0 + 6, c],
          [randint(6, 10), c + 1],
        ], // Coordonnées des "sommets"
        { repere: r, color: bleuMathalea, step: 0.15, epaisseur: 2 },
      )
    }
    this.contenu =
      'Ci-dessous, on a tracé la courbe représentative de la fonction $f$.'
    if (context.isAmc) {
      this.autoCorrectionAMC[0] = {
        enonce:
          this.contenu +
          '<br>' +
          mathalea2d(
            {
              xmin: -7,
              ymin: -4.5,
              xmax: 7,
              ymax: 4.5,
              pixelsParCm: 30,
            },
            r,
            gr,
          ),
        enonceAvant: false, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
        enonceAvantUneFois: true, // EE : ce champ est facultatif et permet (si true) d'afficher l'énoncé ci-dessus une seule fois avant la numérotation de la première question de l'exercice. Ne fonctionne correctement que si l'option melange est à false.
        enonceCentre: true, // EE : ce champ est facultatif et permet (si true) de centrer le champ 'enonce' ci-dessus.}
        options: {
          multicols: true,
          barreseparation: true,
          numerotationEnonce: true,
        },
        propositions: [],
      }
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
    }

    if (context.isHtml && this.interactif) {
      this.contenu +=
        "<br><em>S'il y a plusieurs réponses, séparer les réponses avec un point-virgule.</em>"
    }
    this.contenu += '<br><br>'
    let cont1 = `${numAlpha(0)} Quelle est l'image de $${x0}$ ?`
    cont1 += ajouteChampTexteMathLive(this, 0, KeyboardType.clavierDeBase)
    if (context.isAmc) {
      this.autoCorrectionAMC[0].propositions?.push({
        type: 'AMCNum', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
        propositions: [
          // une ou plusieurs (Qcms) 'propositions'
          {
            texte: '', // Facultatif. la proposition de Qcm ou ce qui est affiché dans le corrigé pour cette question quand ce n'est pas un Qcm
            reponse: {
              // utilisé si type = 'AMCNum'
              texte: cont1, // facultatif
              valeur: a, // obligatoire (la réponse numérique à comparer à celle de l'élève). EE : Si une fraction est la réponse, mettre un tableau sous la forme [num,den]
              alignement: 'center', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
              param: {
                digits: 1, // obligatoire pour AMC (le nombre de chiffres dans le nombre, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                decimals: 0, // obligatoire pour AMC (le nombre de chiffres dans la partie décimale du nombre, si decimals est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                signe: true, // obligatoire pour AMC (présence d'une case + ou -)
                approx: 0, // (0 = valeur exacte attendue, sinon valeur de tolérance (voir explication détaillée dans type AMCNum))
              },
            },
          },
        ],
      })
    }
    const enonceAMC = `${numAlpha(1)} Quelle est l'image de $${x0 + 5}$ ?`
    cont1 += '<br>' + enonceAMC
    cont1 += ajouteChampTexteMathLive(this, 1, KeyboardType.clavierDeBase)
    if (context.isAmc) {
      this.autoCorrectionAMC[0].propositions?.push({
        type: 'AMCNum', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
        propositions: [
          // une ou plusieurs (Qcms) 'propositions'
          {
            texte: '', // Facultatif. la proposition de Qcm ou ce qui est affiché dans le corrigé pour cette question quand ce n'est pas un Qcm
            reponse: {
              // utilisé si type = 'AMCNum'
              texte: enonceAMC, // facultatif
              valeur: (b + c) / 2, // obligatoire (la réponse numérique à comparer à celle de l'élève). EE : Si une fraction est la réponse, mettre un tableau sous la forme [num,den]
              alignement: 'center', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
              param: {
                digits: 1, // obligatoire pour AMC (le nombre de chiffres dans le nombre, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                decimals: 0, // obligatoire pour AMC (le nombre de chiffres dans la partie décimale du nombre, si decimals est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                signe: true, // obligatoire pour AMC (présence d'une case + ou -)
                approx: 0, // (0 = valeur exacte attendue, sinon valeur de tolérance (voir explication détaillée dans type AMCNum))
              },
            },
          },
        ],
      })
    }
    const ordre = randint(1, 2)
    let cont2
    if (ordre === 1) {
      cont2 = `${numAlpha(2)} Déterminer le (ou les) antécédent(s) de $${b}$.`
      cont2 += ajouteChampTexteMathLive(
        this,
        2,
        KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
      )
      cont2 += `<br>${numAlpha(3)} Déterminer le (ou les) antécédent(s) de $${c}$.`
      cont2 += ajouteChampTexteMathLive(
        this,
        3,
        KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
      )
    } else {
      cont2 = `${numAlpha(2)} Déterminer le (ou les) antécédent(s) de $${c}$.`
      cont2 += ajouteChampTexteMathLive(
        this,
        2,
        KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
      )
      cont2 += `<br>${numAlpha(3)} Déterminer le (ou les) antécédent(s) de $${b}$.`
      cont2 += ajouteChampTexteMathLive(
        this,
        3,
        KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
      )
    }
    if (context.isAmc) {
      this.autoCorrectionAMC[0].propositions?.push({
        type: 'AMCNum', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
        propositions: [
          // une ou plusieurs (Qcms) 'propositions'
          {
            texte: '', // Facultatif. la proposition de Qcm ou ce qui est affiché dans le corrigé pour cette question quand ce n'est pas un Qcm
            reponse: {
              // utilisé si type = 'AMCNum'
              texte: `${numAlpha(2)} Déterminer un antécédent de $${b}$.`, // facultatif
              valeur: x0 + 4, // obligatoire (la réponse numérique à comparer à celle de l'élève). EE : Si une fraction est la réponse, mettre un tableau sous la forme [num,den]
              alignement: 'center', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
              param: {
                digits: 1, // obligatoire pour AMC (le nombre de chiffres dans le nombre, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                decimals: 0, // obligatoire pour AMC (le nombre de chiffres dans la partie décimale du nombre, si decimals est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                signe: true, // obligatoire pour AMC (présence d'une case + ou -)
                approx: 0, // (0 = valeur exacte attendue, sinon valeur de tolérance (voir explication détaillée dans type AMCNum))
              },
            },
          },
        ],
      })
      this.autoCorrectionAMC[0].propositions?.push({
        type: 'AMCNum', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
        propositions: [
          // une ou plusieurs (Qcms) 'propositions'
          {
            texte: '', // Facultatif. la proposition de Qcm ou ce qui est affiché dans le corrigé pour cette question quand ce n'est pas un Qcm
            reponse: {
              // utilisé si type = 'AMCNum'
              texte: `${numAlpha(3)} Déterminer un antécédent de $${c}$.`, // facultatif
              valeur: x0 + 2, // obligatoire (la réponse numérique à comparer à celle de l'élève). EE : Si une fraction est la réponse, mettre un tableau sous la forme [num,den]
              alignement: 'center', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
              param: {
                aussiCorrect: x0 + 6,
                digits: 1, // obligatoire pour AMC (le nombre de chiffres dans le nombre, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                decimals: 0, // obligatoire pour AMC (le nombre de chiffres dans la partie décimale du nombre, si decimals est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                signe: true, // obligatoire pour AMC (présence d'une case + ou -)
                approx: 0, // (0 = valeur exacte attendue, sinon valeur de tolérance (voir explication détaillée dans type AMCNum))
              },
            },
          },
        ],
      })
    }

    this.contenu += deuxColonnes(cont1, cont2)
    this.contenu += mathalea2d(
      { xmin: -7, ymin: -4.5, xmax: 7, ymax: 4.5, pixelsParCm: 30 },
      r,
      gr,
    )
    this.contenuCorrection = `${numAlpha(0)} L'image de $${x0}$ est $${a}$, on note $f(${x0})=${a}$.`
    handleAnswers(
      this,
      0,
      { reponse: { value: a } },
      { formatInteractif: 'mathlive' },
    )

    this.contenuCorrection += `<br>${numAlpha(1)} L'image de $${x0 + 5}$ est $${(b + c) / 2}$, on note $f(${x0 + 5})=${(b + c) / 2}$.`
    handleAnswers(
      this,
      1,
      { reponse: { value: (b + c) / 2 } },
      { formatInteractif: 'mathlive' },
    )
    if (ordre === 1) {
      this.contenuCorrection += `<br>${numAlpha(2)} $${b}$ a pour unique antécédent $${x0 + 4}$, on note $f(${x0 + 4})=${b}$.`
      handleAnswers(
        this,
        2,
        { reponse: { value: x0 + 4 } },
        { formatInteractif: 'mathlive' },
      )
      this.contenuCorrection += `<br>${numAlpha(3)} $${c}$ a deux antécédents $${x0 + 2}$ et $${x0 + 6}$, on note $f(${x0 + 2})=f(${x0 + 6})=${c}$.`
      handleAnswers(
        this,
        3,
        {
          reponse: {
            value: [`${x0 + 2};${x0 + 6}`, `${x0 + 6};${x0 + 2}`],
            options: { texteAvecCasse: true },
          },
        },
        { formatInteractif: 'mathlive' },
      )
    } else {
      this.contenuCorrection += `<br>${numAlpha(2)} $${c}$ a deux antécédents $${x0 + 2}$ et $${x0 + 6}$, on note $f(${x0 + 2})=f(${x0 + 6})=${c}$.`
      handleAnswers(
        this,
        2,
        {
          reponse: {
            value: [`${x0 + 2};${x0 + 6}`, `${x0 + 6};${x0 + 2}`],
            options: { texteAvecCasse: true },
          },
        },
        { formatInteractif: 'mathlive' },
      )
      this.contenuCorrection += `<br>${numAlpha(3)} $${b}$ a pour unique antécédent $${x0 + 4}$, on note $f(${x0 + 4})=${b}$.`
      handleAnswers(
        this,
        3,
        { reponse: { value: x0 + 4 } },
        { formatInteractif: 'mathlive' },
      )
    }
    if (!context.isHtml) {
      this.contenu =
        texConsigne('') +
        this.contenu
          .replace(/<br><br>/g, '\n\n\\medskip\n')
          .replace(/<br>/g, '\\\\\n')
      this.contenuCorrection = this.contenuCorrection
        .replace(/<br><br>/g, '\n\n\\medskip\n')
        .replace(/<br>/g, '\\\\\n')
    } else {
      this.contenuCorrection = `<div style="line-height: ${this.spacingCorr};">\n${this.contenuCorrection}\n</div>`
    }
    this.listeQuestions[0] = this.contenu
    this.listeCorrections[0] = this.contenuCorrection
  }
}
