import { droite, type Droite } from '../../lib/2d/droites'
import { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { Vecteur } from '../../lib/2d/Vecteur'
import {
  all,
  hasZeroMember,
  isEquation,
  isEquivalentEquation,
  onlyIrreducibleFractions,
} from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusByPlusC,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  "Déterminer une équation cartésienne d'une droite remarquable"
export const dateDePublication = '24/06/2024'
export const dateDeModificationImportante = '10/01/2026'
export const interactifReady = true

/**
 * Calcul d'équations cartésiennes de droites
 * @author : florianpicard revu par Stéphane Guyon et Nathan Scheinmann
 */

export const uuid = '8472d'

export const refs = {
  'fr-fr': ['1G21'],
  'fr-ch': ['3G97-3'],
}

function pointVersTex(A: PointAbstrait): string {
  return `${A.nom}\\left(${A.x} ; ${A.y}\\right)`
}

function vecteurVersTex(u: Vecteur): string {
  const fonctionLatex = u.nom.length >= 2 ? 'overrightarrow' : 'vec'
  return `\\${fonctionLatex}{${u.nom}} \\begin{pmatrix} ${u.x} \\\\ ${u.y} \\end{pmatrix}`
}

type QuestionData = {
  reponse: string
  signature: string
  texte: string
  texteCorr: string
}

function equationDepuisPointEtVecteurNormal(
  A: PointAbstrait,
  n: Vecteur,
): Droite {
  return droite(n.x, n.y, -A.x * n.x - A.y * n.y)
}

function equationVersTex(d: Droite): string {
  return `${reduireAxPlusByPlusC(d.a, d.b, d.c)}=0`
}

function distanceCarree(A: PointAbstrait, B: PointAbstrait): number {
  return (B.x - A.x) ** 2 + (B.y - A.y) ** 2
}

function questionMediatrice(): QuestionData {
  let A: PointAbstrait
  let B: PointAbstrait
  do {
    A = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'A')
    B = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'B')
  } while (
    (A.x === B.x && A.y === B.y) ||
    (A.x + B.x) % 2 !== 0 ||
    (A.y + B.y) % 2 !== 0 ||
    distanceCarree(A, B) < 8
  )

  const I = milieu(A, B, 'I')
  const n = new Vecteur(A, B, 'AB')
  const d = equationDepuisPointEtVecteurNormal(I, n)
  const reponse = equationVersTex(d)

  const texte =
    `Dans un repère orthonormé du plan, on considère les points $${pointVersTex(A)}$ et $${pointVersTex(B)}$.` +
    `<br>Déterminer une équation cartésienne de la médiatrice du segment $[${A.nom}${B.nom}]$.`

  const texteCorr =
    `La médiatrice de $[${A.nom}${B.nom}]$ est la droite perpendiculaire à $(${A.nom}${B.nom})$ passant par le milieu de $[${A.nom}${B.nom}]$.` +
    `<br>Le milieu de $[${A.nom}${B.nom}]$ est $${pointVersTex(I)}$.` +
    `<br>Le vecteur $${vecteurVersTex(n)}$ est un vecteur normal à la médiatrice.` +
    `<br>Une équation cartésienne de cette médiatrice est donc de la forme où $c$ reste à déterminer${sp()}:` +
    `<br>$${reduireAxPlusByPlusC(n.x, n.y, 0)}+c=0$.` +
    `<br>Comme $I$ appartient à la médiatrice, ses coordonnées vérifient cette équation, ce qui nous permet de déterminer $c$${sp()}:` +
    `<br>$${n.x}\\times ${ecritureParentheseSiNegatif(I.x)}${ecritureAlgebrique(n.y)}\\times ${ecritureParentheseSiNegatif(I.y)}+c=0$.` +
    `<br>On a $c=${d.c}$.` +
    `<br>On obtient ainsi${sp()}: $${miseEnEvidence(reponse)}$.`

  return {
    reponse,
    signature: `mediatrice:${A.x},${A.y}:${B.x},${B.y}`,
    texte,
    texteCorr,
  }
}

function questionHauteur(): QuestionData {
  let A: PointAbstrait
  let B: PointAbstrait
  let C: PointAbstrait
  do {
    A = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'A')
    B = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'B')
    C = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'C')
  } while (
    (B.x === C.x && B.y === C.y) ||
    (A.x === B.x && A.y === B.y) ||
    (A.x === C.x && A.y === C.y) ||
    distanceCarree(B, C) < 8 ||
    distanceCarree(A, B) < 8 ||
    distanceCarree(A, C) < 8 ||
    Math.abs((B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x)) < 8
  )

  const n = new Vecteur(B, C, 'BC')
  const h = equationDepuisPointEtVecteurNormal(A, n)
  const reponse = equationVersTex(h)

  const texte =
    `Dans un repère orthonormé du plan, on considère les trois points $${pointVersTex(A)}$, $${pointVersTex(B)}$ et $${pointVersTex(C)}$.` +
    `<br>Déterminer une équation cartésienne de la hauteur issue de $${A.nom}$ dans le triangle $${A.nom}${B.nom}${C.nom}$.`

  const texteCorr =
    `La hauteur issue de $${A.nom}$ est la droite qui passe par $${A.nom}$ et qui est perpendiculaire à $(${B.nom}${C.nom})$.` +
    `<br>Le vecteur $${vecteurVersTex(n)}$ est donc un vecteur normal à cette hauteur.` +
    `<br>Une équation cartésienne de cette hauteur est de la forme, où $c$ reste à déterminer${sp()}:` +
    `<br>$${reduireAxPlusByPlusC(n.x, n.y, 0)}+c=0$.` +
    `<br>Comme $A$ appartient à la hauteur, ses coordonnées vérifient cette équation, ce qui nous permet de déterminer $c$${sp()}:` +
    `<br>$${n.x}\\times ${ecritureParentheseSiNegatif(A.x)}${ecritureAlgebrique(n.y)}\\times ${ecritureParentheseSiNegatif(A.y)}+c=0$.` +
    `<br>On a $c=${h.c}$.` +
    `<br>On obtient ainsi${sp()}: $${miseEnEvidence(reponse)}$.`

  return {
    reponse,
    signature: `hauteur:${A.x},${A.y}:${B.x},${B.y}:${C.x},${C.y}`,
    texte,
    texteCorr,
  }
}

export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = '3'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Médiatrice',
        '2 : Hauteur',
        '3 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const question =
        listeTypeDeQuestions[i] === 1 ? questionMediatrice : questionHauteur
      const { reponse, signature, texte, texteCorr } = question()
      const texteInteractif =
        texte +
        ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
          texteAvant: `<br>Une équation cartésienne${sp()}: `,
          texteApres: '.',
        })
      if (this.questionJamaisPosee(i, signature)) {
        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            compare: all([
              isEquation(),
              isEquivalentEquation(),
              hasZeroMember(),
              onlyIrreducibleFractions(),
            ]),
          },
        })
        this.listeQuestions[i] = texteInteractif
        this.listeCorrections[i] = texteCorr.replace(
          /\b(\d+)\.(\d+)\b/g,
          '$1,$2',
        )
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
