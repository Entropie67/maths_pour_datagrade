import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { milieu, pointAdistance } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
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
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un côté avec le théorème de Pythagore'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = '4b711'

export const refs = {
  'fr-fr': ['can4G1-02', 'BP2AutoR5', '3AutoG11'],
  'fr-ch': [],
}
export default class CalculCotePythagore extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const nom = creerNomDePolygone(3, ['QD'])
    const a = this.quotaRandint('a', 2, 5) //
    const b = this.quotaRandint('b', 6, 10) //
    const c2 = b ** 2 - a ** 2
    const A = pointAbstrait(0, 0, nom[0])
    const B = pointAdistance(A, a, -90, nom[1])
    const C = pointAdistance(B, Math.sqrt(c2), 0, nom[2])
    const pol = polygoneAvecNom(A, B, C) // polygoneAvecNom s'occupe du placement des noms des sommets
    const objets = []
    const reduction = extraireRacineCarree(c2)
    const reductible = reduction[0] !== 1

    objets.push(pol[0], pol[1], codageAngleDroit(A, B, C)) // pol[0], c'est le tracé et pol[1] ce sont les labels
    objets.push(
      latex2d(`${texNombre(b)}`, milieu(C, A).x, milieu(C, A).y + 0.4, {
        letterSize: 'scriptsize',
      }),
      latex2d(`${texNombre(a)}`, milieu(B, A).x - 0.3, milieu(B, A).y + 0.2, {
        letterSize: 'scriptsize',
      }),
    )
    this.question = `Déterminer la valeur exacte de $${nom[1]}${nom[2]}$.<br>`
    this.question += `${mathalea2d(Object.assign({ scale: 0.5, display: 'block', center: !context.isHtml } as const, fixeBordures([objets], { rxmin: 0, rxmax: 0, rymax: 0, rymin: 0.5 })), [objets])}`
    this.optionsChampTexte = { texteAvant: `<br>$${nom[1]}${nom[2]}=$` }
    this.correction = ` On utilise le théorème de Pythagore dans le triangle $${nom[0]}${nom[1]}${nom[2]}$, rectangle en $${nom[1]}$.<br>
      On obtient :<br><br>
      $\\begin{aligned}
        ${nom[0]}${nom[1]}^2+${nom[1]}${nom[2]}^2&=${nom[0]}${nom[2]}^2\\\\
        ${nom[1]}${nom[2]}^2&=${nom[0]}${nom[2]}^2-${nom[0]}${nom[1]}^2\\\\
        ${nom[1]}${nom[2]}^2&=${b}^2-${a}^2\\\\
        ${nom[1]}${nom[2]}^2&=${b ** 2}-${a ** 2}\\\\
        ${nom[1]}${nom[2]}^2&=${c2}\\\\
        ${nom[1]}${nom[2]}&=${miseEnEvidence('\\sqrt{' + c2 + '}')}
        \\end{aligned}$<br>
        ${reductible ? `En simplifiant, on obtient : $${nom[1]}${nom[2]} = ${miseEnEvidence(texRacineCarree(c2))}$.` : ''}
        <br>`
    this.correction += texteEnCouleur(
      `Mentalement : <br>
    La longueur $${nom[1]}${nom[2]}$ est donnée par la racine carrée de la différence des carrés de $${b}$ et de $${a}$.<br>
    Cette différence vaut $${b ** 2}-${a ** 2}=${c2}$. <br>
    La valeur cherchée est donc : $\\sqrt{${c2}}${reductible ? '=' + texRacineCarree(c2) : ''}$.`,
      bleuMathalea,
    )
    this.reponse = [`\\sqrt{${c2}}`, `${Math.sqrt(c2)}`, texRacineCarree(c2)]

    this.canReponseACompleter = `$${nom[1]}${nom[2]}=\\ldots$`
  }
}
