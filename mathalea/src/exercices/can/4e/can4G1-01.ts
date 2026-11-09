import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { texteParPosition } from '../../../lib/2d/textes'
import { similitude } from '../../../lib/2d/transformations'
import { milieu, pointAdistance } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { extraireRacineCarree } from '../../../lib/outils/calculs'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { texNombre, texRacineCarree } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer l’hypoténuse avec le théorème de Pythagore'
export const interactifReady = true

export const dateDeModifImportante = '01/06/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = 'd9524'

export const refs = {
  'fr-fr': ['can4G1-01', '3AutoG11-1'],
  'fr-ch': [],
}
export default class CalculHypotenusePythagore extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b
    const nom = creerNomDePolygone(3, ['QD'])
    a = this.quotaRandint('a', 2, 7) //
    b = this.quotaRandint('b', 3, 7) //
    const A = pointAbstrait(0, 0, nom[0])
    const B = pointAdistance(A, a, randint(0, 45), nom[1])
    const C = similitude(A, B, 90, b / a, nom[2])
    const pol = polygoneAvecNom(A, B, C) // polygoneAvecNom s'occupe du placement des noms des sommets
    const objets = []
    const xmin = Math.min(A.x, B.x, C.x) - 1
    const ymin = Math.min(A.y, B.y, C.y) - 1
    const xmax = Math.max(A.x, B.x, C.x) + 1
    const ymax = Math.max(A.y, B.y, C.y) + 1
    let c2
    let reduction
    let reductible
    let entiere
    switch (this.quotaChoice('cas', ['a', 'b'])) {
      case 'a':
        c2 = a ** 2 + b ** 2
        reduction = extraireRacineCarree(c2)
        reductible = reduction[0] !== 1
        entiere = reduction[1] === 1
        objets.push(pol[0], pol[1], codageAngleDroit(A, B, C)) // pol[0], c'est le tracé et pol[1] ce sont les labels
        objets.push(
          texteParPosition(
            `${texNombre(a)}`,
            milieu(A, B).x,
            milieu(A, B).y + 0.4,
          ),
          texteParPosition(
            `${texNombre(b)}`,
            milieu(B, C).x + 0.4,
            milieu(B, C).y,
          ),
        )
        this.question = `Sur cette figure, calculer la valeur exacte de $${nom[0]}${nom[2]}$.<br>`
        this.question += mathalea2d(
          {
            xmin,
            ymin,
            xmax,
            ymax,
            pixelsParCm: 22,
            mainlevee: false,
            amplitude: 0.3,
            scale: 0.5,
            center: !context.isHtml,
          },
          objets,
        )

        if (entiere) {
          this.correction = ` On utilise le théorème de Pythagore dans le triangle $${nom[0]}${nom[1]}${nom[2]}$, rectangle en $${nom[1]}$.<br>
            On obtient :<br>
            $\\begin{aligned}
              ${nom[0]}${nom[1]}^2+${nom[1]}${nom[2]}^2&=${nom[0]}${nom[2]}^2\\\\
              ${nom[0]}${nom[2]}^2&=${nom[1]}${nom[2]}^2+${nom[0]}${nom[1]}^2\\\\
              ${nom[0]}${nom[2]}^2&=${b}^2+${a}^2\\\\
              ${nom[0]}${nom[2]}^2&=${b ** 2}+${a ** 2}\\\\
              ${nom[0]}${nom[2]}^2&=${c2}\\\\
              ${nom[0]}${nom[2]}&=\\sqrt{${c2}}\\\\
              ${nom[0]}${nom[2]}&=${miseEnEvidence(`${reduction[0]}`)}
              \\end{aligned}$`
          this.correction += texteEnCouleur(`<br> Mentalement : <br>
    La longueur $${nom[0]}${nom[2]}$ est donnée par la racine carrée de la somme des carrés de $${b}$ et de $${a}$.<br>
    Cette somme vaut $${b ** 2}+${a ** 2}=${c2}$. <br>
    La valeur cherchée est donc : $\\sqrt{${c2}}$, soit $${reduction[0]}$.`)
        } else {
          this.correction = ` On utilise le théorème de Pythagore dans le triangle $${nom[0]}${nom[1]}${nom[2]}$, rectangle en $${nom[1]}$.<br>
      On obtient :<br>
      $\\begin{aligned}
        ${nom[0]}${nom[1]}^2+${nom[1]}${nom[2]}^2&=${nom[0]}${nom[2]}^2\\\\
        ${nom[0]}${nom[2]}^2&=${nom[1]}${nom[2]}^2+${nom[0]}${nom[1]}^2\\\\
        ${nom[0]}${nom[2]}^2&=${b}^2+${a}^2\\\\
        ${nom[0]}${nom[2]}^2&=${b ** 2}+${a ** 2}\\\\
        ${nom[0]}${nom[2]}^2&=${c2}\\\\
        ${nom[0]}${nom[2]}&=${miseEnEvidence(`\\sqrt{${c2}}`)}
        \\end{aligned}$
        ${reductible ? `En simplifiant, on obtient : $${nom[0]}${nom[2]} = ${texRacineCarree(c2)}$` : ''}`
          this.correction += texteEnCouleur(`<br> Mentalement : <br>
La longueur $${nom[0]}${nom[2]}$ est donnée par la racine carrée de la somme des carrés de $${b}$ et de $${a}$.<br>
Cette somme vaut $${b ** 2}+${a ** 2}=${c2}$. <br>
La valeur cherchée est donc : $\\sqrt{${c2}}$.
`)
        }
        this.reponse = [
          `\\sqrt{${c2}}`,
          `${Math.sqrt(c2)}`,
          texRacineCarree(c2),
        ]

        this.canReponseACompleter = `$${nom[0]}${nom[2]}=\\ldots$`
        break

      case 'b':
        a = randint(1, 10) //
        b = randint(2, 10, [4, 9]) //
        c2 = a ** 2 + b
        reduction = extraireRacineCarree(c2)
        reductible = reduction[0] !== 1
        entiere = reduction[1] === 1
        if (entiere) {
          this.question = `$${nom[0]}${nom[1]}${nom[2]}$ est un triangle rectangle en $${nom[0]}$ dans lequel
                  $${nom[0]}${nom[1]}=${a}$ et $${nom[0]}${nom[2]}=\\sqrt{${b}}$.<br>
                   Calculer la valeur exacte de $${nom[1]}${nom[2]}$.<br>`
          this.correction = ` On utilise le théorème de Pythagore dans le triangle $${nom[0]}${nom[1]}${nom[2]}$, rectangle en $${nom[0]}$.<br>
        On obtient :<br>
        $\\begin{aligned}
          ${nom[0]}${nom[1]}^2+${nom[0]}${nom[2]}^2&=${nom[1]}${nom[2]}^2\\\\
          ${nom[1]}${nom[2]}^2&=${nom[0]}${nom[1]}^2+${nom[0]}${nom[2]}^2\\\\
          ${nom[1]}${nom[2]}^2&=\\sqrt{${b}}^2+${a}^2\\\\
          ${nom[1]}${nom[2]}^2&=${b}+${a ** 2}\\\\
          ${nom[1]}${nom[2]}^2&=${c2}\\\\
          ${nom[1]}${nom[2]}&=\\sqrt{${c2}}\\\\
          ${nom[1]}${nom[2]}&=${miseEnEvidence(`${reduction[0]}`)}
          \\end{aligned}$`
          this.correction += texteEnCouleur(`<br> Mentalement : <br>
    La longueur $${nom[1]}${nom[2]}$ est donnée par la racine carrée de la somme des carrés de $\\sqrt{${b}}$ et de $${a}$.<br>
    Cette somme vaut $${b}+${a ** 2}=${c2}$ (n'oubliez pas que $(\\sqrt{${b}})^2=${b}$). <br>
    La valeur cherchée est donc : $${reduction[0]}$.`)
        } else {
          this.question = `$${nom[0]}${nom[1]}${nom[2]}$ est un triangle rectangle en $${nom[0]}$ dans lequel
      $${nom[0]}${nom[1]}=${a}$ et $${nom[0]}${nom[2]}=\\sqrt{${b}}$.<br>
       Calculer la valeur exacte de $${nom[1]}${nom[2]}$.<br>`
          this.correction = ` On utilise le théorème de Pythagore dans le triangle $${nom[0]}${nom[1]}${nom[2]}$, rectangle en $${nom[0]}$.<br>
On obtient :<br>
$\\begin{aligned}
${nom[0]}${nom[1]}^2+${nom[0]}${nom[2]}^2&=${nom[1]}${nom[2]}^2\\\\
${nom[1]}${nom[2]}^2&=${nom[0]}${nom[1]}^2+${nom[0]}${nom[2]}^2\\\\
${nom[1]}${nom[2]}^2&=\\sqrt{${b}}^2+${a}^2\\\\
${nom[1]}${nom[2]}^2&=${b}+${a ** 2}\\\\
${nom[1]}${nom[2]}^2&=${c2}\\\\
${nom[1]}${nom[2]}&=${miseEnEvidence(`\\sqrt{${c2}}`)}
\\end{aligned}$
${reductible ? `En simplifiant, on obtient : $${nom[1]}${nom[2]} = ${texRacineCarree(c2)}$` : ''}`
          this.correction += texteEnCouleur(`<br> Mentalement : <br>
La longueur $${nom[1]}${nom[2]}$ est donnée par la racine carrée de la somme des carrés de $\\sqrt{${b}}$ et de $${a}$.<br>
Cette somme vaut $${b}+${a ** 2}=${c2}$ (n'oubliez pas que $(\\sqrt{${b}})^2=${b}$). <br>
La valeur cherchée est donc : $\\sqrt{${c2}}${reductible ? '=' + texRacineCarree(c2) : ''}$.`)
        }
        this.reponse = [
          `\\sqrt{${c2}}`,
          texRacineCarree(c2),
          `${Math.sqrt(c2)}`,
        ]

        this.canReponseACompleter = `$${nom[1]}${nom[2]}=\\ldots$`
        break
    }
  }
}
