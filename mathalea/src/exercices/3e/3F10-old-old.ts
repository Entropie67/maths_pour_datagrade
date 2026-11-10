import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle2tableaux } from '../../lib/outils/arrayOutils'
import { numAlpha } from '../../lib/outils/outilString'
import { getLang } from '../../lib/stores/languagesStore'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lire images et antécédents depuis un tableau de valeurs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * @author Rémi Angot
 */
export const uuid = 'b92da'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ImageAntecedentDepuisTableauOuFleche extends Exercice {
  constructor() {
    super()
    this.comment = `Cet exercice est une ancienne version non compatible avec les vue CAN et une question par page. Il est souhaitable d'utiliser la nouvelle version.
Il existe une version CAN de cet exercice avec une seule question en 'can3F16'.`
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const lang = getLang()
    for (
      let i = 0, texte, texteCorr, texteAMC, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const a = randint(-20, 20)
      const b = randint(-20, 20, [a])
      const c = randint(-20, 20, [a, b])
      const d = randint(-20, 20, [a, b, c])
      const e = randint(-20, 20, [a, b, c, d])
      const f = randint(-20, 20, [a, b, c, d, e])
      // a->b ; c->d ; e->d ; d->a ; f->c
      const ligneX = [a, c, e, d, f]
      const ligneY = [b, d, d, a, c]
      shuffle2tableaux(ligneX, ligneY) // mélange les 2 lignes de la même manière
      texte = "Voici un tableau de valeurs d'une fonction $f$ : "
      texte += '<br><br>'
      texte += `$\\def\\arraystretch{1.5}\\begin{array}{|l|c|c|c|c|c|}
    \\hline
    x & ${ligneX[0]} & ${ligneX[1]} & ${ligneX[2]} & ${ligneX[3]} & ${ligneX[4]} \\\\
    \\hline
    f(x) & ${ligneY[0]} & ${ligneY[1]} & ${ligneY[2]} & ${ligneY[3]} & ${ligneY[4]} \\\\
    \\hline
    \\end{array}
    $<br>
    `
      if (this.interactif)
        texte +=
          "<br><br> <em>S'il y a plusieurs réponses, les séparer avec le point-virgule</em>.<br>"

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          enonceAvant: true, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
          enonceAvantUneFois: false, // EE : ce champ est facultatif et permet (si true) d'afficher l'énoncé ci-dessus une seule fois avant la numérotation de la première question de l'exercice. Ne fonctionne correctement que si l'option melange est à false.
          enonceCentre: true, // EE : ce champ est facultatif et permet (si true) de centrer le champ 'enonce' ci-dessus.}
          options: {
            multicols: true,
            barreseparation: true,
            numerotationEnonce: true,
          },
          propositions: [],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      texteAMC =
        numAlpha(0) + `Quelle est l'image de $${a}$ par la fonction $f$ ?`
      texte += '<br>' + texteAMC
      texteCorr =
        numAlpha(0) +
        `L'image de $${a}$ par la fonction $f$ est $${b}$, on note $f(${a})=${b}$.<br>`
      handleAnswers(
        this,
        6 * i,
        { reponse: { value: b } },
        { formatInteractif: 'mathlive' },
      )
      texte += ajouteChampTexteMathLive(this, 6 * i, KeyboardType.clavierDeBase)
      if (context.isAmc) {
        this.autoCorrectionAMC[i].propositions?.push(
          ajouteProposition(texteAMC, b),
        )
      }

      texteAMC =
        numAlpha(1) + `Quelle est l'image de $${c}$ par la fonction $f$ ?`
      texte += '<br>' + texteAMC
      texteCorr +=
        numAlpha(1) +
        `L'image de $${c}$ par la fonction $f$ est $${d}$, on note $f(${c})=${d}$.`
      texte += ajouteChampTexteMathLive(
        this,
        i * 6 + 1,
        KeyboardType.clavierDeBase,
      )
      handleAnswers(
        this,
        i * 6 + 1,
        { reponse: { value: d } },
        { formatInteractif: 'mathlive' },
      )
      if (context.isAmc) {
        this.autoCorrectionAMC[i].propositions?.push(
          ajouteProposition(texteAMC, d),
        )
      }

      let texte3 = `Déterminer ${lang === 'fr-CH' ? 'la préimage' : "l'antécédent ou les antécédents"} de $${a}$ par la fonction $f$.`
      const texteCorr3 = `$${a}$ a ${lang === 'fr-CH' ? 'un seul élément dans la préimage' : 'un seul antécédent'} par la fonction $f$ qui est $${d}$, on note $f(${d})=${a}$.`
      handleAnswers(
        this,
        i * 6 + 2,
        { reponse: { value: d } },
        { formatInteractif: 'mathlive' },
      )
      texte3 += ajouteChampTexteMathLive(
        this,
        i * 6 + 2,
        KeyboardType.clavierDeBase,
      )
      if (context.isAmc) {
        this.autoCorrectionAMC[i].propositions?.push(
          ajouteProposition(
            numAlpha(2) +
              `Déterminer un antécédent de $${a}$ par la fonction $f$.`,
            d,
          ),
        )
      }

      let texte4 = `Déterminer l'antécédent ou les antécédents de $${d}$ par la fonction $f$.`
      const texteCorr4 = `$${d}$ ${lang === 'fr-CH' ? 'deux éléments dans la préimage' : 'a deux antécédents'} par la fonction $f$ qui sont $${c}$ et $${e}$, on note $f(${c})=f(${e})=${d}$.`
      handleAnswers(
        this,
        i * 6 + 3,
        {
          reponse: {
            value: [`${c};${e}`, `${e};${c}`],
            options: { texteAvecCasse: true },
          },
        },
        { formatInteractif: 'mathlive' },
      )
      texte4 += ajouteChampTexteMathLive(
        this,
        i * 6 + 3,
        KeyboardType.clavierDeBase,
      )
      if (context.isAmc) {
        this.autoCorrectionAMC[i].propositions?.push(
          ajouteProposition(
            numAlpha(3) +
              `Déterminer un antécédent de $${d}$ par la fonction $f$.`,
            c,
          ),
        )
      }

      if (choice([true, false])) {
        // Une fois sur 2 on inverse les questions 3 et 4
        texte += '<br>' + numAlpha(2) + texte3 + '<br>' + numAlpha(3) + texte4
        texteCorr +=
          '<br>' + numAlpha(2) + texteCorr3 + '<br>' + numAlpha(3) + texteCorr4
      } else {
        texte += '<br>' + numAlpha(2) + texte4 + '<br>' + numAlpha(3) + texte3
        texteCorr +=
          '<br>' + numAlpha(2) + texteCorr4 + '<br>' + numAlpha(3) + texteCorr3
      }

      texte += '<br>' + numAlpha(4)
      texte += this.interactif
        ? `Compléter : $f(${c})=\\ldots$`
        : `Recopier et compléter : $f(${c})=\\ldots$`
      texteCorr += '<br>' + numAlpha(4) + `$f(${c})=${d}$`
      texte += ajouteChampTexteMathLive(
        this,
        i * 6 + 4,
        KeyboardType.clavierDeBase,
      )
      handleAnswers(
        this,
        i * 6 + 4,
        {
          reponse: {
            value: [`f(${c})=${d}`, `${d}`],
            options: { texteAvecCasse: true },
          },
        },
        { formatInteractif: 'mathlive' },
      )
      if (context.isAmc) {
        this.autoCorrectionAMC[i].propositions?.push(
          ajouteProposition(numAlpha(4) + `Compléter : $f(${c})=\\ldots$`, d),
        )
      }

      texte += '<br>' + numAlpha(5)
      texte += this.interactif
        ? `Compléter : $f(\\ldots)=${c}$`
        : `Recopier et compléter : $f(\\ldots)=${c}$`

      texteCorr += '<br>' + numAlpha(5) + `$f(${f})=${c}$`
      texte += ajouteChampTexteMathLive(
        this,
        i * 6 + 5,
        KeyboardType.clavierDeBase,
      )
      handleAnswers(
        this,
        i * 6 + 5,
        {
          reponse: {
            value: [`f(${f})=${c}`, `${f}`],
            options: { texteAvecCasse: true },
          },
        },
        { formatInteractif: 'mathlive' },
      )
      if (context.isAmc) {
        this.autoCorrectionAMC[i].propositions?.push(
          ajouteProposition(numAlpha(5) + `Compléter : $f(\\ldots)=${c}$`, f),
        )
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
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

function ajouteProposition(texteProposition: string, nombre: number) {
  return {
    type: 'AMCNum', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
    propositions: [
      // une ou plusieurs (Qcms) 'propositions'
      {
        texte: '', // Facultatif. la proposition de Qcm ou ce qui est affiché dans le corrigé pour cette question quand ce n'est pas un Qcm
        reponse: {
          // utilisé si type = 'AMCNum'
          texte: texteProposition, // facultatif
          valeur: nombre, // obligatoire (la réponse numérique à comparer à celle de l'élève). EE : Si une fraction est la réponse, mettre un tableau sous la forme [num,den]
          alignement: 'center', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
          param: {
            digits: 2, // obligatoire pour AMC (le nombre de chiffres dans le nombre, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
            decimals: 0, // obligatoire pour AMC (le nombre de chiffres dans la partie décimale du nombre, si decimals est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
            signe: true, // obligatoire pour AMC (présence d'une case + ou -)
            approx: 0, // (0 = valeur exacte attendue, sinon valeur de tolérance (voir explication détaillée dans type AMCNum))
          },
        },
      },
    ],
  }
}
