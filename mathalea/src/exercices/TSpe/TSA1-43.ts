import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteCode } from '../../lib/outils/embellissements'
import { scriptPython } from '../../lib/outils/scriptPython'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Compléter une boucle Python de recherche de seuil (QCM Bac)'
export const dateDePublication = '29/08/2026'
export const uuid = '0465d'
export const refs = {
  'fr-fr': ['TSA1-43', 'TCA1-33'],
  'fr-ch': [],
}
export const interactifReady = true

/**
 * Identifier la condition d'une boucle de recherche du premier dépassement.
 *
 * @author Stéphane Guyon
 */
export default class BouclePythonRechercheSeuil extends ExerciceSimple {
  private appliquerValeurs(
    lettre: string,
    nomFonction: string,
    u0: number,
    coefficient: number,
    termeConstant: number,
    seuil: number,
  ): void {
    const coefficientTex = texNombre(coefficient, 1)
    const coefficientPython = coefficient.toFixed(1)

    const programme = `def ${nomFonction}():
    n = 0
    ${lettre} = ${u0}
    while ...:
        n = n + 1
        ${lettre} = ${coefficientPython}*${lettre} + ${termeConstant}
    return n`

    this.question = `On considère la suite $(${lettre}_n)$ définie sur $\\mathbb N$ par $${lettre}_0=${u0}$ et, pour tout entier naturel $n$, par :<br>
$${lettre}_{n+1}=${coefficientTex}${lettre}_n+${termeConstant}$.<br><br>
La fonction Python ci-dessous doit renvoyer la plus petite valeur de l'entier $n$ telle que $${lettre}_n>${texNombre(seuil)}$.<br>
${scriptPython(programme, 6)}<br><br>
À la ligne $4$, on complète l'instruction ${texteCode('while')} par :<br>`

    const reponsesQcm = [
      `$${lettre}\\leqslant ${texNombre(seuil)}$`,
      `$${lettre}=${texNombre(seuil)}$`,
      `$${lettre}>${texNombre(seuil)}$`,
      `$n\\leqslant ${texNombre(seuil)}$`,
    ]
    this.reponse = this.versionQcm
      ? reponsesQcm[0]
      : `${lettre}\\leqslant ${seuil}`
    this.distracteurs = reponsesQcm.slice(1)
    // Le clavier compare de MathALÉA ne propose aucune lettre : on ajoute, pour
    // cette question, la variable de la suite et les symboles de comparaison
    // dont l'élève a besoin pour compléter la condition du `while`.
    this.optionsChampTexte = {
      dataKeys: [lettre, '<', '\\leqslant', '=', '>', '\\geqslant'],
    }
    this.versionQcmOptions = {
      radio: true,
      vertical: false,
    }
    this.correction = `On veut que la boucle s'arrête dès que $${lettre}>${texNombre(seuil)}$. Cela signifie qu'elle doit tourner tant que $${lettre}\\leqslant ${texNombre(seuil)}$ : c'est donc cette condition qui doit être placée après ${texteCode('while')}.<br>
Lorsque $${lettre}>${texNombre(seuil)}$, la condition $${lettre}\\leqslant ${texNombre(seuil)}$ devient fausse, la boucle s'arrête et le programme renvoie le rang correspondant.<br><br>
Les autres propositions ne conviennent pas :<br>
$\\bullet$ $${lettre}=${texNombre(seuil)}$ ne ferait continuer la boucle que dans le seul cas d'une égalité ;<br>
$\\bullet$ $${lettre}>${texNombre(seuil)}$ ferait continuer la boucle précisément lorsque le seuil est déjà dépassé ;<br>
$\\bullet$ $n\\leqslant ${texNombre(seuil)}$ compare le rang au seuil, alors que la consigne porte sur la valeur du terme de la suite.<br><br>
La bonne réponse est donc $${miseEnEvidence(`${lettre}\\leqslant ${texNombre(seuil)}`)}$.`
  }

  nouvelleVersion(): void {
    if (this.sup) {
      this.appliquerValeurs('u', 'seuil', 15, 1.2, 12, 10000)
    } else {
      this.appliquerValeurs(
        choice(['u', 'v', 'w']),
        choice(['seuil', 'rangSeuil', 'premierRang']),
        randint(5, 30),
        randint(11, 15) / 10,
        randint(4, 20),
        choice([1000, 2000, 5000, 10000, 20000]),
      )
    }
  }

  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
    this.versionQcmDisponible = true
    this.versionQcm = true
    this.formatChampTexte = KeyboardType.clavierPersonnalisable
    this.besoinFormulaireCaseACocher = ['Sujet original QCM Bac', false]
    this.sup = false
  }
}
