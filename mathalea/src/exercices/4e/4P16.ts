import Decimal from 'decimal.js'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre = 'Convertir des grandeurs composées'
export const interactifReady = true

export const dateDePublication = '23/05/2022'

/**
 * @author Guillaume Valmont

 */
export const uuid = '63cdb'

export const refs = {
  'fr-fr': ['4P16'],
  'fr-ch': ['11CTGM4A-1', '11LCGM4A-1', '11LSGM4A-1', 'PRQMG04E-1', 'PRQPF03C-1'],
}
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des problèmes',
      'Nombres séparés par des tirets :\n1 : m/h\n2 : m$^3$/h\n3 : L/h\n4 : L/m$^2$\n5 : m$^2$/h\n6 : Wh\n7 : VA\n8 : Mélange',
    ]
    this.sup = 8
  }

  nouvelleVersion() {
    const valMaxParametre = 8
    const listeDesProblemes = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      melange: valMaxParametre,
      max: valMaxParametre - 1,
      defaut: 1,
    })

    type Unite = {
      unite: string
      coef: number
    }

    const unitesLongueur: Unite[] = [
      {
        unite: 'mm',
        coef: 1,
      },
      {
        unite: 'cm',
        coef: 10 ** 1,
      },
      {
        unite: 'dm',
        coef: 10 ** 2,
      },
      {
        unite: 'm',
        coef: 10 ** 3,
      },
      {
        unite: 'dam',
        coef: 10 ** 4,
      },
      {
        unite: 'hm',
        coef: 10 ** 5,
      },
      {
        unite: 'km',
        coef: 10 ** 6,
      },
    ]
    const unitesSurface: Unite[] = [
      {
        unite: 'mm$^2$',
        coef: 1,
      },
      {
        unite: '$\\text{cm}^2$',
        coef: 10 ** 2,
      },
      {
        unite: 'dm$^2$',
        coef: 10 ** 4,
      },
      {
        unite: 'm$^2$',
        coef: 10 ** 6,
      },
      {
        unite: 'dam$^2$',
        coef: 10 ** 8,
      },
      {
        unite: 'hm$^2$',
        coef: 10 ** 10,
      },
      {
        unite: 'km$^2$',
        coef: 10 ** 12,
      },
    ]
    const unitesVolume: Unite[] = [
      {
        unite: 'mm$^3$',
        coef: 1,
      },
      {
        unite: 'cm$^3$',
        coef: 10 ** 3,
      },
      {
        unite: 'dm$^3$',
        coef: 10 ** 6,
      },
      {
        unite: 'm$^3$',
        coef: 10 ** 9,
      },
    ]
    const unitesContenance: Unite[] = [
      {
        unite: 'mL',
        coef: 1,
      },
      {
        unite: 'cL',
        coef: 10 ** 1,
      },
      {
        unite: 'dL',
        coef: 10 ** 2,
      },
      {
        unite: 'L',
        coef: 10 ** 3,
      },
    ]
    const unitesTemps: Unite[] = [
      {
        unite: 's',
        coef: 1,
      },
      {
        unite: 'min',
        coef: 60,
      },
      {
        unite: 'h',
        coef: 3600,
      },
    ]
    const unitesPuissance: Unite[] = [
      {
        unite: 'mW',
        coef: 1,
      },
      {
        unite: 'W',
        coef: 10 ** 3,
      },
      {
        unite: 'kW',
        coef: 10 ** 6,
      },
    ]
    const unitesTension: Unite[] = [
      {
        unite: 'mV',
        coef: 1,
      },
      {
        unite: 'V',
        coef: 10 ** 3,
      },
      {
        unite: 'kV',
        coef: 10 ** 6,
      },
    ]
    const unitesIntensite: Unite[] = [
      {
        unite: 'mA',
        coef: 1,
      },
      {
        unite: 'A',
        coef: 10 ** 3,
      },
    ]
    let unite1Depart: Unite = { unite: '', coef: 1 }
    let unite2Depart: Unite = { unite: '', coef: 1 }
    let unite1Arrivee: Unite = { unite: '', coef: 1 }
    let unite2Arrivee: Unite = { unite: '', coef: 1 }
    let valeurDepart: number
    let valeurArrivee: Decimal = new Decimal(1)
    let typeDeComposition: 'quotient' | 'produit'
    let coef1: Decimal = new Decimal(1)
    let coef2: Decimal = new Decimal(1)
    let operateur, cfrac, times

    function fixeUnites(unite1: Unite[], unite2: Unite[]) {
      let index1Depart
      let index2Depart
      let index1Arrivee: number
      let index2Arrivee: number
      do {
        index1Depart = randint(0, unite1.length - 1)
        index2Depart = randint(0, unite2.length - 1)
        index1Arrivee = randint(0, unite1.length - 1, [index1Depart])
        index2Arrivee = randint(0, unite2.length - 1, [index2Depart])
        unite1Depart = unite1[index1Depart]
        unite2Depart = unite2[index2Depart]
        unite1Arrivee = unite1[index1Arrivee]
        unite2Arrivee = unite2[index2Arrivee]
        coef1 = new Decimal(unite1Depart.coef).div(unite1Arrivee.coef)
        coef2 = new Decimal(unite2Depart.coef).div(unite2Arrivee.coef)
        valeurArrivee = new Decimal(valeurDepart).times(coef1)
        if (typeDeComposition === 'quotient') {
          operateur = '/'
          cfrac = ' \\cfrac '
          times = ''
          valeurArrivee = valeurArrivee.div(coef2)
        } else {
          operateur = '.'
          cfrac = ''
          times = ' \\times '
          valeurArrivee = valeurArrivee.times(coef2)
        }
      } while (Math.abs(Math.log10(valeurArrivee.toNumber())) > 6)
    }

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      valeurDepart = randint(1, 80) * 9 // Comme ça même si on doit diviser par 3600 le résultat restera décimal
      typeDeComposition = 'quotient'
      if (listeDesProblemes[i] === 1) {
        // Vitesse
        fixeUnites(unitesLongueur, unitesTemps)
      } else if (listeDesProblemes[i] === 2) {
        // Débit (m$^3$)
        fixeUnites(unitesVolume, unitesTemps)
      } else if (listeDesProblemes[i] === 3) {
        // Débit (L)
        fixeUnites(unitesContenance, unitesTemps)
      } else if (listeDesProblemes[i] === 4) {
        // L/m$^2$
        fixeUnites(unitesContenance, unitesSurface)
      } else if (listeDesProblemes[i] === 5) {
        // m$^2$/h
        fixeUnites(unitesSurface, unitesTemps)
      } else if (listeDesProblemes[i] === 6) {
        // Wh
        typeDeComposition = 'produit'
        fixeUnites(unitesPuissance, unitesTemps)
      } else if (listeDesProblemes[i] === 7) {
        // VA
        typeDeComposition = 'produit'
        fixeUnites(unitesTension, unitesIntensite)
      } else {
        window.notify(
          'listeDesProblemes[i] a une valeur inattendue.\nPeut-être que valMaxParametre est incorrect ?',
          {
            listeDesProblemes,
            i,
            valMaxParametre,
          },
        )
      }
      texte = `Convertir $${valeurDepart}$ ${unite1Depart.unite}${operateur}${unite2Depart.unite} en ${unite1Arrivee.unite}${operateur}${unite2Arrivee.unite}.`
      texteCorr = `$${valeurDepart}\\text{ ${unite1Depart.unite}${operateur}${unite2Depart.unite}}
      = ${cfrac}{${valeurDepart}\\text{ ${unite1Depart.unite}}}${times}{1 \\text{ ${unite2Depart.unite}}}
      = ${cfrac}{${valeurDepart} \\times ${fraction(unite1Depart.coef, unite1Arrivee.coef).texFractionSimplifiee} \\text{ ${unite1Arrivee.unite}}}
      ${times}{${fraction(unite2Depart.coef, unite2Arrivee.coef).texFractionSimplifiee} \\text{ ${unite2Arrivee.unite}}}
      = ${miseEnEvidence(texNombre(valeurArrivee, valeurArrivee.decimalPlaces()))}\\text{ ${unite1Arrivee.unite}${operateur}${unite2Arrivee.unite}}$`
      if (this.interactif && context.isHtml) {
        handleAnswers(this, i, { reponse: { value: valeurArrivee } })
        texte += `<br> $${valeurDepart}$ ${unite1Depart.unite}${operateur}${unite2Depart.unite} = `
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        texte += ` ${unite1Arrivee.unite}${operateur}${unite2Arrivee.unite}`
      }
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
