import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = '8cc86'
export const refs = {
  'fr-fr': ['1A-C01-4', '2A-N1-3'],
  'fr-ch': ['9R1QCMNO-1', '9R2QCMNO-1', '9R3QCMNO-1'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Ordonner des nombres par ordre croissant'
export const dateDePublication = '28/08/2025'
export const dateDeModifImportante = '08/10/2026'

type Nombre = { tex: string; val: number }

const mille = texNombre(1000)
// Triplets de nombres à ranger : fractions et nombres décimaux mélangés
const listeTriplets: [Nombre, Nombre, Nombre][] = [
  [
    { tex: '\\dfrac{2}{5}', val: 0.4 },
    { tex: '\\dfrac{37}{100}', val: 0.37 },
    { tex: '0{,}42', val: 0.42 },
  ],
  [
    { tex: '\\dfrac{3}{10}', val: 0.3 },
    { tex: '\\dfrac{1}{4}', val: 0.25 },
    { tex: '0{,}31', val: 0.31 },
  ],
  [
    { tex: '0{,}125', val: 0.125 },
    { tex: `\\dfrac{127}{${mille}}`, val: 0.127 },
    { tex: '\\dfrac{3}{25}', val: 0.12 },
  ],
  [
    { tex: '\\dfrac{23}{100}', val: 0.23 },
    { tex: '0{,}2', val: 0.2 },
    { tex: '\\dfrac{1}{4}', val: 0.25 },
  ],
  [
    { tex: '\\dfrac{3}{8}', val: 0.375 },
    { tex: '0{,}4', val: 0.4 },
    { tex: '\\dfrac{36}{100}', val: 0.36 },
  ],
  [
    { tex: `\\dfrac{333}{${mille}}`, val: 0.333 },
    { tex: '\\dfrac{3}{10}', val: 0.3 },
    { tex: '0{,}33', val: 0.33 },
  ],
  [
    { tex: '\\dfrac{7}{10}', val: 0.7 },
    { tex: '0{,}65', val: 0.65 },
    { tex: '\\dfrac{3}{5}', val: 0.6 },
  ],
  [
    { tex: '0{,}45', val: 0.45 },
    { tex: '\\dfrac{11}{25}', val: 0.44 },
    { tex: '\\dfrac{47}{100}', val: 0.47 },
  ],
  [
    { tex: `\\dfrac{125}{${mille}}`, val: 0.125 },
    { tex: '0{,}13', val: 0.13 },
    { tex: '\\dfrac{3}{25}', val: 0.12 },
  ],
  [
    { tex: '\\dfrac{3}{5}', val: 0.6 },
    { tex: '\\dfrac{58}{100}', val: 0.58 },
    { tex: '0{,}61', val: 0.61 },
  ],
  [
    { tex: '0{,}75', val: 0.75 },
    { tex: '\\dfrac{7}{10}', val: 0.7 },
    { tex: '\\dfrac{74}{100}', val: 0.74 },
  ],
  [
    { tex: '\\dfrac{7}{100}', val: 0.07 },
    { tex: '\\dfrac{2}{25}', val: 0.08 },
    { tex: '0{,}075', val: 0.075 },
  ],
  [
    { tex: '\\dfrac{4}{10}', val: 0.4 },
    { tex: '0{,}399', val: 0.399 },
    { tex: '\\dfrac{21}{50}', val: 0.42 },
  ],
  [
    { tex: `\\dfrac{167}{${mille}}`, val: 0.167 },
    { tex: '\\dfrac{1}{5}', val: 0.2 },
    { tex: '0{,}16', val: 0.16 },
  ],
  [
    { tex: '0{,}9', val: 0.9 },
    { tex: '\\dfrac{89}{100}', val: 0.89 },
    { tex: '\\dfrac{22}{25}', val: 0.88 },
  ],
  [
    { tex: '\\dfrac{4}{5}', val: 0.8 },
    { tex: '0{,}82', val: 0.82 },
    { tex: `\\dfrac{835}{${mille}}`, val: 0.835 },
  ],
  [
    { tex: '\\dfrac{13}{100}', val: 0.13 },
    { tex: '\\dfrac{1}{8}', val: 0.125 },
    { tex: '0{,}14', val: 0.14 },
  ],
  [
    { tex: '0{,}375', val: 0.375 },
    { tex: '\\dfrac{38}{100}', val: 0.38 },
    { tex: '\\dfrac{7}{20}', val: 0.35 },
  ],
  [
    { tex: '\\dfrac{6}{10}', val: 0.6 },
    { tex: '\\dfrac{31}{50}', val: 0.62 },
    { tex: '0{,}59', val: 0.59 },
  ],
  [
    { tex: `\\dfrac{275}{${mille}}`, val: 0.275 },
    { tex: '0{,}27', val: 0.27 },
    { tex: '\\dfrac{7}{25}', val: 0.28 },
  ],
]

/**
 *
 * @author Gilles Mora
 *
 */
export default class OrdonnerCroissant extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1
    this.besoinFormulaireCaseACocher = ['Version QCM', false]
    this.sup = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Pour comparer des nombres, selon les situations, il est souvent plus pratique de tous les écrire :
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>sous forme de fractions de même dénominateur,</li>
    <li>sous forme décimale,</li>
    <li>en notation scientifique.</li>
  </ul>
   <p style="margin: 0 0 10px 0;">
   Le plus simple dans cet exercice est de les écrire sous forme décimale.
  </p>
 `
  }

  // Conversion intermédiaire vers une fraction sur 100 (dénominateurs 20, 25 ou 50)
  private conversionIntermediaire(tex: string): string {
    const match = tex.match(/\\dfrac\{(\d+)\}\{(\d+)\}/)
    if (!match) return ''
    const numerateur = Number(match[1])
    const denominateur = Number(match[2])
    if (![20, 25, 50].includes(denominateur)) return ''
    const k = 100 / denominateur
    return `\\dfrac{${numerateur} \\times ${k}}{${denominateur}\\times ${k}} = \\dfrac{${numerateur * k}}{100}=`
  }

  private ligneCorrection({ tex, val }: Nombre): string {
    // Un nombre déjà décimal n'a pas besoin d'être converti
    if (!tex.includes('dfrac')) return `$${tex}$<br><br>`
    return `$${tex} = ${this.conversionIntermediaire(tex)}${texNombre(val, 3)}$<br><br>`
  }

  nouvelleVersion() {
    const versionQcm = context.isAmc || Boolean(this.sup)
    this.consigne = versionQcm
      ? ''
      : "Ranger les trois nombres dans l'ordre croissant."
    const triplets = combinaisonListes(listeTriplets, this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const [a, b, c] = triplets[i]
      const nombresTries = [a, b, c].sort((x, y) => x.val - y.val)
      const ordre = (nombres: Nombre[]) => nombres.map((n) => n.tex).join(' < ')
      const bonOrdre = ordre(nombresTries)

      const texteCorr =
        'Pour comparer ces trois nombres, on les écrit sous forme décimale :<br>' +
        [a, b, c].map((n) => this.ligneCorrection(n)).join('') +
        `On a donc : $${nombresTries.map((n) => texNombre(n.val, 3)).join(' < ')}$.<br>` +
        `Finalement : $${miseEnEvidence(bonOrdre)}$.`
      let texte: string
      let texteCorrFinale = texteCorr

      if (versionQcm) {
        texte = `Voici trois nombres.<br>$${a.tex}$ ${sp(6)} $${b.tex}$ ${sp(6)} $${c.tex}$<br>
    Le classement par ordre croissant de ces trois nombres est :`
        const distracteurs = [
          [a, b, c],
          [a, c, b],
          [b, a, c],
          [b, c, a],
          [c, a, b],
          [c, b, a],
        ]
          .map(ordre)
          .filter((o) => o !== bonOrdre)
          .slice(0, 3)
        const propositions = shuffle([bonOrdre, ...distracteurs]).map((o) => ({
          texte: `$${o}$`,
          statut: o === bonOrdre,
        }))
        const qcmOptions = { radio: true, vertical: true }
        handleAnswers(
          this,
          i,
          {
            qcm: {
              enonce: texte,
              propositions,
              correction: texteCorr,
              options: qcmOptions,
            },
          },
          { formatInteractif: 'mathalea-qcm' },
        )
        if (context.isHtml) {
          texte += addMathaleaQcm(this, i, {
            ...qcmOptions,
            interactivityOn: this.interactif,
          })
        } else if (!context.isAmc) {
          const qcmLatex = propositionsQcm(this, i)
          texte += qcmLatex.texte
          texteCorrFinale += qcmLatex.texteCorr
        }
      } else {
        texte = `$${a.tex} ; ${b.tex} ; ${c.tex}.$`
        // Les blancs n'apparaissent pas en HTML non interactif (pas de champ à remplir).
        if (this.interactif || !context.isHtml || context.isTypst) {
          texte +=
            '<br><br>' +
            remplisLesBlancs(
              this,
              i,
              '%{champ1}<%{champ2}<%{champ3}',
              'fillInTheBlank ' + KeyboardType.clavierDeBaseAvecFraction,
            )
        }
        if (this.interactif) {
          handleAnswers(
            this,
            i,
            {
              bareme: toutPourUnPoint,
              champ1: { value: nombresTries[0].tex },
              champ2: { value: nombresTries[1].tex },
              champ3: { value: nombresTries[2].tex },
            },
            { formatInteractif: 'fillInTheBlank' },
          )
        }
      }

      if (this.questionJamaisPosee(i, a.tex, b.tex, c.tex)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorrFinale
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
