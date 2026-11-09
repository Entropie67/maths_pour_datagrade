import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { spline } from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '42368'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer graphiquement un antécédent'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ3FMns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(dx: number, dy: number): void {
    // Points de base modélisant fidèlement la courbe de l'image
    const baseNoeuds = [
      { x: -4, y: -1, deriveeGauche: 4, deriveeDroit: 4, isVisible: false },
      { x: -3, y: 1.5, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: -1.5, y: -1.5, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 0, y: 1, deriveeGauche: 2, deriveeDroit: 2, isVisible: false },
      { x: 1, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false }, // Maximum ciblé (antécédent de base)
      { x: 3, y: 0.5, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 5, y: 2.5, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
    ]

    // Application de la translation (version aléatoire)
    const noeuds = baseNoeuds.map((n) => ({
      x: n.x + dx,
      y: n.y + dy,
      deriveeGauche: n.deriveeGauche,
      deriveeDroit: n.deriveeDroit,
      isVisible: n.isVisible,
    }))

    const theSpline = spline(noeuds)
    const bornes = theSpline.trouveMaxes()

    const xMin = Math.floor(bornes.xMin) - 1
    const xMax = Math.ceil(bornes.xMax) + 1
    const yMin = Math.floor(bornes.yMin) - 1
    const yMax = Math.ceil(bornes.yMax) + 1

    const r = repere({
      xMin,
      xMax,
      yMin,
      yMax,
      grilleX: true,
      grilleY: true,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 0.5,
      grilleSecondaireYDistance: 0.5,
      axesEpaisseur: 1.5,
    })

    const courbe = theSpline.courbe({
      epaisseur: 2,
      color: bleuMathalea,
      ajouteNoeuds: false,
    })

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })

    const figure = mathalea2d(
      {
        xmin: xMin - 0.5,
        xmax: xMax + 0.5,
        ymin: yMin - 1.5,
        ymax: yMax + 0.5,
        pixelsParCm: 25,
        scale: 0.6,
        display: 'block',
        center: !context.isHtml,
      },
      r,
      courbe,
      o,
    )

    const k = 3 + dy // Valeur dont on cherche l'antécédent
    const repCorrecte = 1 + dx // L'antécédent attendu

    // On cherche si l'abscisse "k" correspond à un de nos points de base translatés
    // pour que son image soit parfaitement lisible sur le quadrillage.
    let imageDeK: number | undefined
    for (const noeud of baseNoeuds) {
      if (noeud.x + dx === k) {
        imageDeK = noeud.y + dy
        break
      }
    }

    this.enonce = `On donne ci-dessous la représentation graphique d'une fonction $f$.<br><br>
${figure}`
    this.enonce += `Lequel de ces nombres est un antécédent de $${k}$ ?`

    // --- DISTRACTEURS INTELLIGENTS ---
    const fmt = (x: number) => `$${texNombre(x, 1)}$`
    const distracteurs = new Set<number>()

    // 1er piège : l'élève donne l'image de k au lieu de l'antécédent
    if (imageDeK !== undefined) distracteurs.add(imageDeK)

    // 2e piège : l'élève donne k lui-même
    distracteurs.add(k)

    // On complète avec des valeurs proches si besoin
    let ecart = 0.5
    while (distracteurs.size < 3) {
      if (repCorrecte + ecart !== k && repCorrecte + ecart !== imageDeK)
        distracteurs.add(repCorrecte + ecart)
      if (distracteurs.size === 3) break
      if (repCorrecte - ecart !== k && repCorrecte - ecart !== imageDeK)
        distracteurs.add(repCorrecte - ecart)
      ecart += 0.5
    }

    const distArray = Array.from(distracteurs).slice(0, 3)

    this.reponses = [
      fmt(repCorrecte),
      fmt(distArray[0]),
      fmt(distArray[1]),
      fmt(distArray[2]),
    ]

    // --- CORRECTION ---
    this.correction = `Les antécédents se lisent sur l'axe des abscisses (axe horizontal). <br>
    Pour trouver un antécédent de $${k}$ par la fonction $f$, on cherche la (ou les) abscisse(s) des points de la courbe dont l'ordonnée est $${k}$.<br>`
    this.correction += `On se place à la valeur $${k}$ sur l'axe des ordonnées (axe vertical), on se déplace horizontalement jusqu'à rencontrer la courbe, puis on lit l'abscisse correspondante sur l'axe des abscisses.<br>`
    this.correction += `On lit ici que le point de la courbe d'ordonnée $${k}$ a pour abscisse $${repCorrecte}$.<br>`
    this.correction += `Donc un antécédent de $${k}$ est $${miseEnEvidence(texNombre(repCorrecte, 1))}$.`
  }

  versionOriginale: () => void = () => {
    // Aucune translation pour la version originale (k=3, antécédent=1, image de 3=0.5)
    this.appliquerLesValeurs(0, 0)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Paires calculées pour s'assurer que k tombe sur un noeud clair du graphique (image parfaitement lisible)
    // et que l'image de k n'est pas égale à l'antécédent de k.
    const validPairs: [number, number][] = [
      [2, -1], // k=2,  rep=3,  imageDeK=0
      [1, -2], // k=1,  rep=2,  imageDeK=-1
      [-2, -2], // k=1,  rep=-1, imageDeK=-1.5
      [-1, -1], // k=2,  rep=0,  imageDeK=-0.5
      [0, 0], // k=3,  rep=1,  imageDeK=0.5 (Version originale)
      [1, 1], // k=4,  rep=2,  imageDeK=1.5
      [-2, 0], // k=3,  rep=-1, imageDeK=2.5
      [-1, 1], // k=4,  rep=0,  imageDeK=3.5
    ]

    let compteur = 0
    do {
      const [dx, dy] = choice(validPairs)
      this.appliquerLesValeurs(dx, dy)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Lequel de ces nombres est un antécédent de \$([^$]*)\$ \?\s*$/,
        (_, k: string) =>
          this.interactif
            ? `L'antécédent de $${k}$ par $f$ est `
            : `Déterminer par lecture graphique l'antécédent de $${k}$ par $f$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBase
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
