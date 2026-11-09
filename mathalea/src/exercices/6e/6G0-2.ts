import { miseEnEvidence } from '../../lib/outils/embellissements'
import { demiDroite, type DemiDroite } from '../../lib/2d/DemiDroite'
import { Droite, droite } from '../../lib/2d/droites'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePointSurDroite } from '../../lib/2d/TracePointSurDroite'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Donner description et notation de droites, segments et demi-droites'
export const amcReady = true
export const amcType = 'qcmMult'
export const interactifReady = true

export const dateDeModifImportante = '07/10/2023' // Interactivité type Qcm par Jean-claude Lhote puis style par Rémi Angot

/**
 * Utiliser les notations des segments, droites et demi-droites
 * @author Rémi Angot
 */
export const uuid = 'd81c6'

export const refs = {
  'fr-fr': ['6G0-2', '6AutoG1'],
  'fr-2016': ['6G10-1'],
  'fr-ch': ['9R1ES1A-2', '9R2ES1A-2', '9R3ES1A-2'],
}
/**
 * Renvoie la permutation de {0, …, n-1} de rang `rang` (modulo n!) en base factorielle.
 */
function permutation(n: number, rang: number): number[] {
  const restants = Array.from({ length: n }, (_, k) => k)
  const resultat: number[] = []
  let r = rang
  for (let taille = n; taille > 0; taille--) {
    resultat.push(...restants.splice(r % taille, 1))
    r = Math.floor(r / taille)
  }
  return resultat
}

export default class DescriptionSegmentDroiteDemiDroite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    this.consigne =
      this.interactif || context.isAmc
        ? 'Cocher les propositions correspondant à la figure.'
        : 'Décrire précisément, avec des mots, la figure et donner sa notation mathématique.'
    const typesDeQuestionsDisponibles = [1, 4, choice([2, 3])]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let listeDeNomsDePolygones: string[] = []
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (i % 5 === 0) listeDeNomsDePolygones = ['QD']
      const p = creerNomDePolygone(2, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(p)
      const A = pointAbstrait(0, randint(0, 20) / 10, p[0])
      const B = pointAbstrait(4, randint(0, 20) / 10, p[1])
      const t1 = tracePointSurDroite(A, B)
      const t2 = tracePointSurDroite(B, A)
      const creerDroiteDemiSegment: (
        A: PointAbstrait,
        B: PointAbstrait,
      ) => {
        trait: Segment | Droite | DemiDroite
        correction: string
        propsQcm: {
          droite: { phrase: string; notation: string; bonneReponse: boolean }
          segment: { phrase: string; notation: string; bonneReponse: boolean }
          demiDroite1: {
            phrase: string
            notation: string
            bonneReponse: boolean
          }
          demiDroite2: {
            phrase: string
            notation: string
            bonneReponse: boolean
          }
        }
      } = (A: PointAbstrait, B: PointAbstrait) => {
        let trait, correction
        const propsQcm = {
          droite: {
            phrase: `La droite passant par $${A.nom}$ et $${B.nom}$`,
            notation: `$(${A.nom}${B.nom})$`,
            bonneReponse: false,
          },
          segment: {
            phrase: `Le segment d'extrémités $${A.nom}$ et $${B.nom}$`,
            notation: `$[${A.nom}${B.nom}]$`,
            bonneReponse: false,
          },
          demiDroite1: {
            phrase: `La demi-droite d'origine $${A.nom}$ passant par $${B.nom}$`,
            notation: `$[${A.nom}${B.nom})$`,
            bonneReponse: false,
          },
          demiDroite2: {
            phrase: `La demi-droite d'origine $${B.nom}$ passant par $${A.nom}$`,
            notation: `$[${B.nom}${A.nom})$`,
            bonneReponse: false,
          },
        }
        switch (listeTypeDeQuestions[i]) {
          case 1:
            trait = droite(A, B)
            correction = `La droite qui passe par les points $${A.nom}$ et $${B.nom}$ se note $${miseEnEvidence(`(${A.nom}${B.nom})`)}$.`
            propsQcm.droite.bonneReponse = true
            break
          case 2:
            trait = demiDroite(A, B)
            correction = `La demi-droite d'origine $${A.nom}$ passant par $${B.nom}$ se note $${miseEnEvidence(`[${A.nom}${B.nom})`)}$.`
            propsQcm.demiDroite1.bonneReponse = true
            break
          case 3:
            trait = demiDroite(B, A)
            correction = `La demi-droite d'origine $${B.nom}$ passant par $${A.nom}$ se note $${miseEnEvidence(`[${B.nom}${A.nom})`)}$.`
            propsQcm.demiDroite2.bonneReponse = true
            break
          case 4:
          default:
            trait = segment(A, B)
            correction = `Le segment d'extrémités $${A.nom}$ et $${B.nom}$ se note $${miseEnEvidence(`[${A.nom}${B.nom}]`)}$.`
            propsQcm.segment.bonneReponse = true
            break
        }
        return { trait, correction, propsQcm }
      }

      const {
        trait: dAB,
        correction: dABCorr,
        propsQcm,
      } = creerDroiteDemiSegment(A, B)
      const labels = labelPoint(A, B)
      texte = mathalea2d(
        {
          xmin: -2,
          ymin: -1,
          xmax: 7,
          ymax: 3,
          pixelsParCm: 40,
          scale: 0.6,
          optionsTikz: ['baseline=(current bounding box.north)'],
        },
        dAB,
        t1,
        t2,
        labels,
      )
      // L'ordre des descriptions et celui des notations sont mélangés sans
      // tirage aléatoire supplémentaire (les valeurs tirées pour une graine
      // donnée ne changent pas) : la graine locale est déduite des ordonnées
      // de A et B. Les notations sont décalées par rapport aux descriptions
      // pour qu'une description ne soit jamais en face de sa notation.
      const graine = Math.round(A.y * 10) * 21 + Math.round(B.y * 10)
      const ordreDescriptions = permutation(4, graine)
      const decalage = 1 + (Math.floor(graine / 24) % 3)
      const propositionsAMelanger = [
        propsQcm.droite,
        propsQcm.demiDroite1,
        propsQcm.demiDroite2,
        propsQcm.segment,
      ]
      const phrases = ordreDescriptions.map((k) => propositionsAMelanger[k])
      const notations = ordreDescriptions.map(
        (_, k) =>
          propositionsAMelanger[
            ordreDescriptions[(k + decalage) % ordreDescriptions.length]
          ],
      )
      this.autoCorrection[i] = {
        enonce: texte,
        options: { vertical: true, ordered: true },
        propositions: [
          ...phrases.map((p) => ({ texte: p.phrase, statut: p.bonneReponse })),
          ...notations.map((p) => ({
            texte: p.notation,
            statut: p.bonneReponse,
          })),
        ],
      }

      const leQcmHtml = propositionsQcm(this, i)
      texte += this.interactif ? leQcmHtml.texte : ''
      if (this.interactif) {
        texteCorr = dABCorr + leQcmHtml.texteCorr
      } else {
        texteCorr = dABCorr
      }

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
