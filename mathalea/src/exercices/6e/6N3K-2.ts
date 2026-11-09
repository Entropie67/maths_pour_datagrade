import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { nombreDeChiffresDe } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { representationFraction } from '../../modules/representationsFractions'

export const titre = 'Mettre bout à bout des segments'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Représenter une somme de fractions de même dénominateur sur un segment gradué de façon adaptée.
 * @author Jean-claude Lhote (AMC par EE)
 * 6N14-2
 * Relecture : Novembre 2021 par EE
 */
export const uuid = '6a17f'

export const refs = {
  'fr-fr': ['6N3K-2'],
  'fr-2016': ['6N22-2'],
  'fr-ch': ['9R3NO4K-1'],
}
export default class AjouterDesFractionsDunite extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    let sc, objets
    const ppc = 20
    if (context.isHtml) {
      sc = 0.5
    } else {
      sc = 0.3
    }

    let params
    let den
    const num = [0, 0, 0, 0]
    const f: FractionEtendue[] = []

    const liste = combinaisonListes([5, 6, 7, 8], this.nbQuestions)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      objets = []
      den = liste[i]
      num[0] = randint(1, den - 1)
      num[1] = randint(1, den - 1, num[0])
      num[2] = randint(1, den - 1, num[1])
      num[3] = randint(1, den - 1, [num[2], num[0]])
      for (let j = 0; j < 4; j++) {
        f[j] = fraction(num[j], den)
      }

      texte = `On place bout à bout 4 segments de longueurs respectives $${f[0].texFraction}$, $${f[1].texFraction}$, $${f[2].texFraction}$ et $${f[3].texFraction}$.<br>`
      texte += 'Quelle est la longueur du segment obtenu ?'
      handleAnswers(
        this,
        i,
        {
          reponse: {
            value: new FractionEtendue(num[0] + num[1] + num[2] + num[3], den),
            options: { fractionEgale: true },
          },
        },
        {
          digitsNum:
            nombreDeChiffresDe(num[0] + num[1] + num[2] + num[3]) +
            randint(0, 1),
          digitsDen: nombreDeChiffresDe(den) + randint(0, 1),
          signe: false,
        },
      )
      if (this.interactif && !context.isAmc) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
        )
      }
      texteCorr =
        'Voici sur ces dessins, coloriés en rouge, les différents segments :<br>'
      for (let j = 0; j < 4; j++) {
        objets.push(
          representationFraction(
            f[j],
            0,
            5 - j * 1.25,
            5,
            0,
            'segment',
            'red',
            0,
            1,
            1,
          ),
        )
      }
      params = {
        xmin: -0.4,
        ymin: -1.5,
        xmax: 6,
        ymax: 6,
        pixelsParCm: ppc,
        scale: 0.5,
      }
      texteCorr += mathalea2d(params, ...objets)
      texteCorr += 'Ce qui donne en les mettant bout à bout :<br>'
      params = {
        xmin: -0.4,
        ymin: -1.5,
        xmax: 20,
        ymax: 1,
        pixelsParCm: ppc,
        scale: sc,
      }
      texteCorr += mathalea2d(
        params,
        representationFraction(
          fraction(num[0] + num[1] + num[2] + num[3], den),
          0,
          0,
          5,
          0,
          'segment',
          'red',
          0,
          1,
          1,
        ),
      )
      texteCorr += `La longueur du segment ainsi obtenu est : $${fraction(num[0] + num[1] + num[2] + num[3], den).texFraction}$.`
      if (this.listeQuestions.indexOf(texte) === -1) {
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
