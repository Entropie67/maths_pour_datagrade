import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '9ebc5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer une probabilité à partir d'un tableau"
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ10AGt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    fns: number,
    gns: number,
    fs: number,
    gs: number,
    sexeChoisi: string,
    pratique: boolean,
  ): void {
    const tns = fns + gns
    const ts = fs + gs
    const tf = fns + fs
    const tg = gns + gs
    const tt = tf + tg
    this.enonce = `Une enquête réalisée auprès des $800$ élèves d’un lycée donne les résultats suivants :<br><br>
    $\\begin{array}{|c|c|c|c|}
    \\hline
    \\text{L'élève}&\\text{est une fille}&\\text{est un garçon}&\\text{Total}\\\\
    \\hline
    \\text{ne pratique aucune activité sportive}&${fns}&${gns}&${tns}\\\\
    \\hline
    \\text{pratique au moins une activité sportive}&${fs}&${gs}&${ts}\\\\
      \\hline
    \\text{Total}&${tf}&${tg}&${tt}\\\\
     \\hline
    \\end{array}$<br><br>
   On choisit au hasard un élève parmi les ${sexeChoisi}s.
   Quelle est la probabilité qu'${sexeChoisi === 'garçon' ? 'il' : 'elle'} ${pratique ? 'pratique ' : 'ne pratique auc'}une activité sportive ?`
    const nBon = pratique
      ? sexeChoisi === 'fille'
        ? fs.toString()
        : gs.toString()
      : sexeChoisi === 'fille'
        ? fns.toString()
        : gns.toString()
    const totalBon = sexeChoisi === 'fille' ? tf.toString() : tg.toString()
    const sol = `\\dfrac{${nBon}}{${totalBon}}`
    const dist1 = `\\dfrac{${nBon}}{${tt}}`
    const dist2 = `\\dfrac{${pratique ? ts.toString() : tns.toString()}}{${tt}}`
    const dist3 = `\\dfrac{${nBon}}{${pratique ? ts.toString() : tns.toString()}}`

    this.reponses = [sol, dist1, dist2, dist3].map((el) => `$${el}$`)

    this.correction = `Il y a $${tt}$ élèves au total, dont $${totalBon}$ ${sexeChoisi === 'garçon' ? 'garçons' : 'filles'}.<br>
    Parmi ces $${totalBon}$ ${sexeChoisi === 'garçon' ? 'garçons' : 'filles'}, $${nBon}$ ${sexeChoisi === 'garçon' ? 'garçons' : 'filles'} ${pratique ? 'pratiquent' : 'ne pratiquent pas'} une activité sportive.<br>
    Donc la probabilité qu'un élève choisi au hasard parmi les ${sexeChoisi}s ${pratique ? 'pratique' : 'ne pratique pas'} une activité sportive est :<br>
    $p=${miseEnEvidence(sol)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(90, 200, 210, 300, 'garçon', false)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    let compteur = 0
    do {
      const fns = randint(8, 30)
      const gns = randint(8, 30, fns)
      const fs = randint(8, 30, [fns, gns])
      const gs = randint(8, 30, [fns, gns, fs])

      this.appliquerLesValeurs(
        fns,
        gns,
        fs,
        gs,
        choice(['garçon', 'fille']),
        choice([true, false]),
      )
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Quelle est la probabilité (qu'(?:il|elle) .*) \?\s*$/,
        (_, evenement: string) =>
          this.interactif
            ? `La probabilité ${evenement} est `
            : `Calculer la probabilité ${evenement}.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
