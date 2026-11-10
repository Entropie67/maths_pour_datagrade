import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '01/11/2025'
export const dateDeModifImportante = '21/10/2026'
export const uuid = '0a4a3'
// @Authors Gilles Mora & philou
export const refs = {
  'fr-fr': ['1A-F02-15'],
  'fr-ch': ['1mQCM-41'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer le produit des coordonnées du point d'intersection de deux droites"
export default class auto1AF2g extends ExerciceQcmA {
  private questionsOuvertes = new Map<
    string,
    { correction: string; reponses: string[] }
  >()

  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    d: number,
  ): void {
    const abs = new FractionEtendue(d - b, a - c)
    const ord = new FractionEtendue(a * d - b * c, a - c)
    this.enonce = `$(D)$ et $(D')$ sont deux droites dans un repère du plan.<br>
    L'équation réduite de $(D)$ est : $y=${reduireAxPlusB(a, b)}$ et celle de $(D')$ est : $y=${reduireAxPlusB(c, d)}$.<br>
    ${this.sup3 || context.isAmc ? "Le produit des coordonnées du point d'intersection des deux droites $(D)$ et $(D')$ est égal à :" : "Déterminer le produit des coordonnées du point d'intersection des deux droites $(D)$ et $(D')$."}`
    this.correction = ` Les coefficients directeurs de $(D)$ et $(D')$ étant différents, les droites ne sont pas parallèles.  <br>
     Les deux droites $(D)$ et $(D')$ sont donc sécantes, et l'abscisse $x$ de leur point d'intersection est solution de l'équation : $${reduireAxPlusB(
       a,
       b,
     )}=${reduireAxPlusB(c, d)}$.<br>
     \\[\\begin{aligned}
     ${reduireAxPlusB(a, b)}&=${reduireAxPlusB(c, d)}\\\\
     ${reduireAxPlusB(a - c, 0)}&=${reduireAxPlusB(0, d - b)}\\\\
     x&=${abs.texFractionSimplifiee}
     \\end{aligned}\\]
     En utilisant l'équation de la droite $(D)$, l'ordonnée $y$ du point d'intersection de $(D)$ et $(D')$ est alors égale à ${
       a === 1
         ? `$y= ${abs.texFractionSimplifiee}
     ${ecritureAlgebrique(b)}=${ord.texFractionSimplifiee}$`
         : `$y=${rienSi1(a)}${a === -1 ? ` ` : `\\times`}${
             abs.signe === -1
               ? `\\left(${abs.texFractionSimplifiee}\\right)`
               : `${abs.texFractionSimplifiee}`
           }${ecritureAlgebrique(b)}=${ord.texFractionSimplifiee}$`
     } (ou, en utilisant l'équation de $(D')$, ${
       c === 1
         ? `$y= ${abs.texFractionSimplifiee}
     ${ecritureAlgebrique(d)}=${ord.texFractionSimplifiee}$`
         : `$y=${rienSi1(c)}${c === -1 ? ` ` : `\\times`}${
             abs.signe === -1
               ? `\\left(${abs.texFractionSimplifiee}\\right)`
               : `${abs.texFractionSimplifiee}`
           }${ecritureAlgebrique(d)}=${ord.texFractionSimplifiee}$`
     }). <br>
     Le produit des coordonnées du point d'intersection est donc donné par $x\\times y=${
       abs.texFractionSimplifiee
     }\\times ${
       ord.signe === -1
         ? `\\left(${ord.texFractionSimplifiee}\\right)`
         : `${ord.texFractionSimplifiee}`
     }$, soit un produit égal à $${miseEnEvidence(
       `${
         new FractionEtendue((a * d - b * c) * (d - b), (a - c) ** 2)
           .texFractionSimplifiee
       }`,
     )}$. `
    this.reponses = [
      `$ ${
        new FractionEtendue((a * d - b * c) * (d - b), (a - c) ** 2)
          .texFractionSimplifiee
      }$`,
      `$ ${texNombre(b * d)}$`,
      `$ ${new FractionEtendue(d * b, a * c).texFractionSimplifiee} $`,
      `$ ${
        new FractionEtendue(d - b + a * d - b * c, a - c).texFractionSimplifiee
      } $`,
    ]
    this.questionsOuvertes.set(this.enonce, {
      correction: this.correction,
      reponses: [this.reponses[0].replace(/\$/g, '').trim()],
    })
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 2, 5, 6)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const a = randint(-4, 4, 0)
      const b = randint(-9, 9, 0)
      const c = randint(-7, 7, [0, a]) // En particulier, éviter les droites parallèles
      let d = randint(-9, 9, 0)

      // Continuer tant que les conditions problématiques sont remplies
      while (
        -Math.abs(d - b) < -5 || // Éviter un numérateur trop grand pour le produit
        d - b === a - c || // En particulier, éviter solution x = 1
        d === b // Éviter que les ordonnées à l'origine soient identiques
      ) {
        d = randint(-9, 9, 0)
      }

      this.appliquerLesValeurs(a, b, c, d)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // Limiter le nombre de tentatives pour éviter une boucle infinie
  }

  nouvelleVersion() {
    this.questionsOuvertes.clear()
    // Conserver les tirages du générateur, puis remplacer l'affichage du QCM.
    super.nouvelleVersion()
    if (this.sup3 || context.isAmc) return
    this.consigne = ''
    for (let i = 0; i < this.listeQuestions.length; i++) {
      const enonce = this.autoCorrection[i].enonce ?? ''
      const donnees = this.questionsOuvertes.get(enonce)
      if (!donnees) continue
      this.listeQuestions[i] = this.interactif
        ? enonce.replace(
            /Déterminer le produit des coordonnées du point d'intersection des deux droites \$\(D\)\$ et \$\(D'\)\$\./,
            "Le produit des coordonnées du point d'intersection des deux droites $(D)$ et $(D')$ est ",
          ) +
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
          ) +
          '.'
        : enonce
      this.listeCorrections[i] = donnees.correction
      handleAnswers(
        this,
        i,
        { reponse: { value: donnees.reponses } },
        { formatInteractif: 'mathalea-mathfield' },
      )
    }
  }

  constructor() {
    super()
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    this.versionAleatoire()
    this.spacing = 2
  }
}
