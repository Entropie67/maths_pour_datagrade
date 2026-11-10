import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '16/07/2026'
export const uuid = 'c1978'

export const refs = {
  'fr-fr': ['1A-F03-2', '2A-F3-2'],
  'fr-ch': ['1mQCM-53', '11LCQCMFA2B-1', '11LSQCMFA2B-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Reconnaître une fonction affine ($2$)'
/**
 * Reconnaître  une fonction affine.
 * @author Gilles Mora
 */

// expr : l'expression affichée ; a, b : les coefficients ; etape (optionnel) : le calcul intermédiaire
type Affine = { expr: string; a: string; b: string; etape?: string }

// Tableau des fonctions AFFINES : on en pioche UNE (la bonne réponse)
const affines: Array<() => Affine> = [
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    return {
      expr: `${b}${ecritureAlgebriqueSauf1(a)}x`,
      a: `${a}`,
      b: `${b}`,
      etape: `${b}${ecritureAlgebriqueSauf1(a)}x = ${rienSi1(a)}x${ecritureAlgebrique(b)}`,
    }
  },
  () => {
    const a = randint(3, 10)
    const b = randint(-10, 10, 0)
    return {
      expr: `\\dfrac{${a}}{${a + 1}}x${ecritureAlgebrique(b)}`,
      a: `\\dfrac{${a}}{${a + 1}}`,
      b: `${b}`,
    }
  },
  () => {
    const a = randint(2, 10)
    const b = randint(-10, 10, 0)
    return {
      expr: `\\dfrac{1}{${a}}x${ecritureAlgebrique(b)}`,
      a: `\\dfrac{1}{${a}}`,
      b: `${b}`,
    }
  },
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    const c = randint(2, 10)
    const signeB = b > 0 ? '+' : '-'
    return {
      expr: `\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(b)}}{${c}}`,
      a: `\\dfrac{${a}}{${c}}`,
      b: `\\dfrac{${b}}{${c}}`,
      etape: `\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(b)}}{${c}} = \\dfrac{${rienSi1(a)}x}{${c}} ${signeB} \\dfrac{${Math.abs(b)}}{${c}} = \\dfrac{${a}}{${c}}x ${signeB} \\dfrac{${Math.abs(b)}}{${c}}`,
    }
  },
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    const produit = a * b
    const signeProduit = produit > 0 ? '+' : ''
    return {
      expr: `${rienSi1(a)}(x${ecritureAlgebrique(b)})`,
      a: `${a}`,
      b: `${produit}`,
      etape: `${rienSi1(a)}(x${ecritureAlgebrique(b)}) = ${rienSi1(a)}x ${signeProduit} ${produit}`,
    }
  },
  () => {
    const a = randint(-10, 10, 0)
    const b = choice([2, 3, 5, 7])
    return { expr: `${rienSi1(a)}x+\\sqrt{${b}}`, a: `${a}`, b: `\\sqrt{${b}}` }
  },
  () => {
    const a = choice([2, 3, 5, 7])
    const b = randint(-10, 10, 0)
    return {
      expr: `\\sqrt{${a}}x${ecritureAlgebrique(b)}`,
      a: `\\sqrt{${a}}`,
      b: `${b}`,
    }
  },
]

// Tableau des fonctions NON AFFINES : on en pioche TROIS de types différents
const nonAffines: Array<() => string> = [
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    return `${rienSi1(a)}x^2${ecritureAlgebrique(b)}`
  },
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    return `\\dfrac{${a}}{x}${ecritureAlgebrique(b)}`
  },
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    return `\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(b)}}{x}`
  },
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    return `${rienSi1(a)}(x^2${ecritureAlgebrique(b)})`
  },
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    return `${rienSi1(a)}x^3${ecritureAlgebrique(b)}`
  },
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    return `${rienSi1(a)}x${b > 0 ? '+' : '-'}\\dfrac{${Math.abs(b)}}{x}`
  },
  () => {
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    return `${rienSi1(a)}\\sqrt{x}${ecritureAlgebrique(b)}`
  },
]

// Fonction pour piocher 3 distracteurs différents
function troisNonAffines(): string[] {
  const indices = [...nonAffines.keys()]
  const choisis: string[] = []
  for (let i = 0; i < 3; i++) {
    const idx = choice(indices)
    indices.splice(indices.indexOf(idx), 1)
    choisis.push(nonAffines[idx]())
  }
  return choisis
}

export default class ReconnaitreFonctionAffine extends ExerciceQcmA {
  private appliquerLesValeurs(
    bonne: Affine,
    distracteurs: string[],
    nomsForces?: string[],
  ) {
    // Si des noms sont forcés (version originale), on les utilise, sinon on mélange
    const noms = nomsForces || shuffle(['f', 'g', 'h', 'u'])
    const nomBonne = noms[0]
    const nomD1 = noms[1]
    const nomD2 = noms[2]
    const nomD3 = noms[3]

    this.enonce = `Parmi les $4$ fonctions dont on donne les expressions algébriques ci-dessous, une seule est une fonction affine. <br>
    Laquelle ?`

    this.correction = `L'expression algébrique d'une fonction affine s'écrit sous la forme $ax+b$ (où $a$ et $b$ sont des nombres réels).<br>
Seule la fonction $${nomBonne}$ vérifie cette condition.<br>`

    if (bonne.etape) {
      this.correction += `En effet, on a : $${nomBonne}(x) = ${bonne.etape}$.<br>`
    }

    this.correction += `On identifie ainsi $a=${bonne.a}$ et $b=${bonne.b}$.<br>
    Ainsi, la seule fonction définissant une fonction affine est la fonction $${nomBonne}$ définie par $${miseEnEvidence(nomBonne)}${miseEnEvidence('(x) =\\,')} ${miseEnEvidence(bonne.expr)}$.`

    this.reponses = [
      `$${nomBonne}(x) = ${bonne.expr}$`,
      `$${nomD1}(x) = ${distracteurs[0]}$`,
      `$${nomD2}(x) = ${distracteurs[1]}$`,
      `$${nomD3}(x) = ${distracteurs[2]}$`,
    ]
  }

  versionOriginale = () => {
    // Version figée qui nécessite une étape de calcul pour bien montrer le fonctionnement
    const bonne: Affine = {
      expr: '\\dfrac{3x-4}{5}',
      a: '\\dfrac{3}{5}',
      b: '-\\dfrac{4}{5}',
      etape:
        '\\dfrac{3x-4}{5} = \\dfrac{3x}{5} - \\dfrac{4}{5} = \\dfrac{3}{5}x - \\dfrac{4}{5}',
    }
    const distracteurs = ['\\dfrac{3x^2-4}{5}', '\\dfrac{3}{5x}-4', '3x^3-4']
    // On force l'ordre des noms pour la version figée ('g' sera la bonne réponse)
    this.appliquerLesValeurs(bonne, distracteurs, ['g', 'f', 'h', 'u'])
  }

  versionAleatoire = () => {
    const bonne = choice(affines)()
    const distracteurs = troisNonAffines()
    this.appliquerLesValeurs(bonne, distracteurs)
  }

  nouvelleVersion() {
    this.sansLettreCorrection = true
    super.nouvelleVersion()
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
