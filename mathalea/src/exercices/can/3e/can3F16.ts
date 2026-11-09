import { amcConvert } from '../../../lib/amc/amcBuilders'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { shuffle2tableaux } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { getLang } from '../../../lib/stores/languagesStore'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Lire images et antécédents depuis un tableau de valeurs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * @author Jean-Claude Lhote
 * à partir de l'exercice 3F10 de Rémi Angot, bricolé par Érice Elter, Nathan Sheinmann et Jean-Claude Lhote.
 */
export const uuid = 'b92dc'

export const refs = {
  'fr-fr': ['3F10Can', '2F11-flash1', 'can2F12-03'],
  'fr-ch': ['NR'],
}
export default class ImageAntecedentDepuisTableau extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const lang = getLang()
    for (
      let i = 0, texte, texteCorr, cpt = 0;
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
      const choix = randint(0, 3)
      const choix2 = randint(0, 1)
      const questions = [
        [
          `Quelle est l'image de $${a}$ par la fonction $f$ ?`,
          `Quel nombre $${a}$ a-t-il comme image ?`,
        ],
        [
          `Quelle est l'image de $${c}$ par la fonction $f$ ?`,
          `Quel nombre $${c}$ a-t-il comme image ?`,
        ],
        [
          lang === 'fr-CH'
            ? `la préimage de $${a}$ par $f$.`
            : `l'antécédent ou les antécédents de $${a}$ par la fonction $f$.`,
          `le ou les nombres qui ont $${a}$ comme image par $f$.`,
        ],
        [
          lang === 'fr-CH'
            ? `Déterminer la préimage de $${d}$ par la fonction $f$.`
            : `Déterminer l'antécédent ou les antécédents de $${d}$ par la fonction $f$.`,
          `Déterminer le ou les nombres qui ont $${d}$ comme image par la fonction $f$.`,
        ],
      ]
      const corrections = [
        [
          `L'image de $${a}$ par la fonction $f$ est $${miseEnEvidence(b)}$, on note $f(${a})=${miseEnEvidence(b)}$.<br>`,
          `Le nombre $${a}$ a pour image $${miseEnEvidence(b)}$ par la fonction $f$, on note $f(${a})=${miseEnEvidence(b)}$.<br>`,
        ],
        [
          `L'image de $${c}$ par la fonction $f$ est $${miseEnEvidence(d)}$, on note $f(${c})=${miseEnEvidence(d)}$.`,
          `Le nombre $${c}$ a pour image $${miseEnEvidence(d)}$ par la fonction $f$, on note $f(${c})=${miseEnEvidence(d)}$.`,
        ],
        [
          `$${a}$ a ${lang === 'fr-CH' ? 'un seul élément dans la préimage' : 'un seul antécédent'} par la fonction $f$ qui est $${miseEnEvidence(d)}$, on note $f(${miseEnEvidence(d)})=${a}$.`,
          `Le nombre $${miseEnEvidence(d)}$ a pour image $${a}$ par la fonction $f$, donc $f(${miseEnEvidence(d)})=${a}$.`,
        ],
        [
          lang === 'fr-CH'
            ? `$${d}$ a deux éléments dans la préimage : $${miseEnEvidence(`${c};${e}`)}$, on note $f(${c})=f(${e})=${d}$.`
            : `$${d}$ a deux antécédents : $${miseEnEvidence(`${c};${e}`)}$, on note $f(${c})=f(${e})=${d}$.`,
          `$${miseEnEvidence(`${c};${e}`)}$ ont pour image $${d}$ par la fonction $f$, on note $f(${c})=f(${e})=${d}$.`,
        ],
      ]
      const reponses = [b.toString(), d.toString(), d.toString(), `${c};${e}`]

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
      const question = questions[choix][choix2]
      const correction = corrections[choix][choix2]
      const reponse = reponses[choix]

      texte += '<br>' + question
      texteCorr = correction
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { suiteDeNombres: choix === 3 } },
      })
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
      )
      if (context.isAmc) {
        this.autoCorrectionAMC[i].propositions?.push(
          ajouteProposition(question, b),
        )
      }

      if (this.questionJamaisPosee(i, [a, b, c, d, e, f].join(''))) {
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
