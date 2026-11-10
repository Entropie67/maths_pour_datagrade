import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Donner le nombre de solutions d'une équation"
export const interactifReady = true

export const uuid = 'mmyid'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ28 extends ExerciceCan {
  enonce(a?: number, b?: number, isVrai?: boolean): void {
    if (a == null || b == null || isVrai == null) {
      a = randint(2, 9)
      b = randint(1, 9, [a])
      isVrai = choice([true, false])
    }

    // Si isVrai est true, on utilise (-x + b) => la racine b est positive,
    // la seule racine négative est -a. La proposition est donc Vraie.
    // Si isVrai est false, on utilise (-x - b) => la racine -b est négative,
    // les racines négatives sont -a et -b. La proposition est donc Fausse.
    const valeurB = isVrai ? b : -b
    const facteur2 = `(-x${ecritureAlgebrique(valeurB)})`
    const racine2 = valeurB // Car -x + valeurB = 0 => x = valeurB

    const enonce = `L'équation $(x^2-${a * a})${facteur2}=0$ admet une unique solution sur $]-\\infty\\,;\\,0[$.`

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce,
      propositions: [
        {
          texte: 'Vrai',
          statut: isVrai,
        },
        {
          texte: 'Faux',
          statut: !isVrai,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = enonce + '<br>' + qcm.texte

    const listeSols = `$x=${a}$, $x=${-a}$ et $x=${racine2}$`
    this.correction = `$x^2-${a * a}=0 \\iff x=${a}$ ou $x=${-a}$.<br>
    $-x${ecritureAlgebrique(valeurB)}=0 \\iff x=${racine2}$.<br>
    Les solutions sont ${listeSols}.<br>
    Sur $]-\\infty\\,;\\,0[$, ${
      isVrai
        ? `la seule solution est $x=${-a}$`
        : `les solutions sont $x=${-a}$ et $x=${-b}$`
    }, il y a donc ${isVrai ? 'bien une unique solution' : 'deux solutions'}.<br>
    La réponse est : ${isVrai ? texteEnCouleurEtGras('Vrai') : texteEnCouleurEtGras('Faux')}.`

    this.canEnonce = enonce
    this.canReponseACompleter =
      '$\\square$ \\textsc{Vrai} \\qquad $\\square$ \\textsc{Faux}'
  }

  nouvelleVersion(): void {
    // La version officielle d'origine était fausse (a=4, b=2, -x-2=0)
    if (this.canOfficielle) this.enonce(4, 2, false)
    else this.enonce()
  }
}
