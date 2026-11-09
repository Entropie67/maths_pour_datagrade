import { codageSegments } from '../../../lib/2d/CodageSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un volume'
export const interactifReady = true

export const uuid = '8ddbo'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ30 extends ExerciceCan {
  enonce(c1?: number, c2?: number, p?: number) {
    if (c1 == null || c2 == null || p == null) {
      p = randint(5, 6) // Profondeur
      c1 = p - 1 // Côté du grand carré
      c2 = randint(2, c1 - 2) // Côté du petit carré évidé
    }

    // --- COORDONNÉES 2D FIXES POUR LE DESSIN ---
    // On dessine une belle perspective figée qui ne bougera pas,
    // quelles que soient les valeurs de c1, c2 et p.

    // Face avant (Grand carré)
    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(4, 0)
    const C = pointAbstrait(4, 4)
    const D = pointAbstrait(0, 4)

    // Trou avant (Petit carré centré)
    const E = pointAbstrait(1, 1)
    const F = pointAbstrait(3, 1)
    const G = pointAbstrait(3, 3)
    const H = pointAbstrait(1, 3)

    // Vecteur de fuite (Profondeur)
    const dx = 2.7
    const dy = 1.8

    // Face arrière (Grand carré)
    const Ap = pointAbstrait(dx, dy)
    const Bp = pointAbstrait(4 + dx, dy)
    const Cp = pointAbstrait(4 + dx, 4 + dy)
    const Dp = pointAbstrait(dx, 4 + dy)

    // Face arrière du trou (Petit carré)
    const Ep = pointAbstrait(1 + dx, 1 + dy)
    const Fp = pointAbstrait(3 + dx, 1 + dy)
    const Gp = pointAbstrait(3 + dx, 3 + dy)
    const Hp = pointAbstrait(1 + dx, 3 + dy)

    // --- SEGMENTS VISIBLES (Traits pleins) ---
    const sAB = segment(A, B)
    const sBC = segment(B, C)
    const sCD = segment(C, D)
    const sDA = segment(D, A)
    sDA.epaisseur = 2 // On épaissit un peu le trait du bas pour compenser l'effet de perspective
    sCD.epaisseur = 1.5
    sBC.epaisseur = 1.5
    sAB.epaisseur = 1.5

    const sEF = segment(E, F)
    const sFG = segment(F, G)
    const sGH = segment(G, H)
    const sHE = segment(H, E)
    sEF.epaisseur = 1.5
    sFG.epaisseur = 1.5
    sGH.epaisseur = 1.5
    sHE.epaisseur = 1.5

    const sBBp = segment(B, Bp)
    const sCCp = segment(C, Cp)
    const sDDp = segment(D, Dp)

    const sCpDp = segment(Cp, Dp)
    const sBpCp = segment(Bp, Cp)
    sBBp.epaisseur = 1.5
    sCCp.epaisseur = 1.5
    sDDp.epaisseur = 1.5
    sCpDp.epaisseur = 1.5
    sBpCp.epaisseur = 1.5

    const solidEdges = [
      sAB,
      sBC,
      sCD,
      sDA,
      sEF,
      sFG,
      sGH,
      sHE,
      sBBp,
      sCCp,
      sDDp,
      sCpDp,
      sBpCp,
    ]

    // --- SEGMENTS CACHÉS (Pointillés) ---
    const sAAp = segment(A, Ap)
    const sApBp = segment(Ap, Bp)
    const sApDp = segment(Ap, Dp)
    sAAp.epaisseur = 1.5
    sApBp.epaisseur = 1.5
    sApDp.epaisseur = 1.5

    // Tous les traits du trou qui partent vers l'arrière sont en pointillés
    const sEEp = segment(E, Ep)
    const sFFp = segment(F, Fp)
    const sGGp = segment(G, Gp)
    const sHHp = segment(H, Hp)
    sEEp.epaisseur = 1.5
    sFFp.epaisseur = 1.5
    sGGp.epaisseur = 1.5
    sHHp.epaisseur = 1.5

    const sEpFp = segment(Ep, Fp)
    const sFpGp = segment(Fp, Gp)
    const sGpHp = segment(Gp, Hp)
    const sHpEp = segment(Hp, Ep)
    sEpFp.epaisseur = 1.5
    sFpGp.epaisseur = 1.5
    sGpHp.epaisseur = 1.5
    sHpEp.epaisseur = 1.5

    const dashedEdges = [
      sAAp,
      sApBp,
      sApDp,
      sEEp,
      sFFp,
      sGGp,
      sHHp,
      sEpFp,
      sFpGp,
      sGpHp,
      sHpEp,
    ]
    dashedEdges.forEach((s) => {
      s.pointilles = 5
    })

    // --- CODAGES ET ÉTIQUETTES ---
    // Codages (traits sur les segments)
    const ticks1 = codageSegments('|', 'black', sAB, sBC, sCD, sDA)
    const ticks2 = codageSegments('||', 'black', sEF, sFG, sGH, sHE)
    const ticks3 = codageSegments('|||', 'black', sBBp, sCCp, sDDp)

    // Étiquettes dynamiques (on inverse les sommets pour écrire "en dessous" ou "au-dessus")
    const labelC1 = placeLatexSurSegment(`${c1}\\text{ cm}`, B, A, {
      color: 'black',
      letterSize: 'small',
    })
    const labelC2 = placeLatexSurSegment(`${c2}\\text{ cm}`, G, H, {
      distance: 0.4,
      color: 'black',
      letterSize: 'small',
    })
    const labelP = placeLatexSurSegment(`${p}\\text{ cm}`, Dp, D, {
      distance: -0.5,
      color: 'black',
      letterSize: 'small',
    })

    const objets = [
      ...solidEdges,
      ...dashedEdges,
      ticks1,
      ticks2,
      ticks3,
      labelP,
      labelC1,
      labelC2,
    ]

    // --- CALCULS DU VOLUME ---
    const volGrandPave = c1 * c1 * p
    const volPetitPave = c2 * c2 * p
    const volume = volGrandPave - volPetitPave

    this.reponse = String(volume)
    this.question = 'Calculer le volume de ce solide.<br>'
    this.question += mathalea2d(
      Object.assign({}, { pixelsParCm: 35, scale: 1 }, fixeBordures(objets)),
      objets,
    )

    this.correction = `Le volume du solide est égal à la différence entre le volume du grand pavé droit et le volume de la partie évidée (le petit pavé droit).<br>
$\\bullet$ Volume du grand pavé droit :<br>
$\\mathcal{V}_{\\text{grand}} = ${c1} \\times ${c1} \\times ${p} = ${volGrandPave}\\text{ cm}^3$<br>
$\\bullet$ Volume de la partie évidée :<br>
$\\mathcal{V}_{\\text{petit}} = ${c2} \\times ${c2} \\times ${p} = ${volPetitPave}\\text{ cm}^3$<br>
$\\bullet$ Volume total :<br>
$\\mathcal{V} = \\mathcal{V}_{\\text{grand}} - \\mathcal{V}_{\\text{petit}} = ${volGrandPave} - ${volPetitPave} = ${miseEnEvidence(texNombre(volume, 0))}\\text{ cm}^3$`

    this.canReponseACompleter = '$\\ldots\\text{ cm}^3$'

    this.optionsChampTexte = { texteApres: '$\\text{ cm}^3$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(4, 2, 5)
    else this.enonce()
  }
}
