// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 29b40 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Encadrer un entier'

export const interactifReady = true
export const dateDeModifImportante = '26/08/2025'
/**
 * * Encadrer un nombre entier
 * @author Sébastien Lozano
 */

export const uuid = '29b40'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'], // Primaire anciennement :['9NO2-3'],
}

// selon la precision on veut certains chiffres plus souvant que d'autres ...
function myNombres(nbChiffres: number) {
  let sortie = ''
  // on fabrique le nombre à partir de ses chiffres et on veut des cas limites
  let mu, md, mc, mmu, mmd, mmc
  const N = choice([
    [randint(0, 9, [0]), 0, 0, 0, 0, 0, 0, 0, 0],
    [randint(0, 9, [0]), 9, 9, 9, 9, 9, 9, 9, 9],
    [
      randint(0, 9, [0]),
      randint(0, 9),
      randint(0, 9),
      randint(0, 9),
      randint(0, 9),
      randint(0, 9),
      randint(0, 9),
      randint(0, 9),
      randint(0, 9),
    ],
  ])
  mmc = N[0]
  mmd = N[1]
  mmu = N[2]
  mc = N[3]
  md = N[4]
  mu = N[5]
  const c = N[6]
  const d = N[7]
  const u = N[8]
  switch (nbChiffres) {
    case 4:
      mu = randint(0, 9, [0])
      sortie = mu.toString() + c.toString() + d.toString() + u.toString()
      break
    case 5:
      md = randint(0, 9, [0])
      sortie =
        md.toString() +
        mu.toString() +
        c.toString() +
        d.toString() +
        u.toString()
      break
    case 6:
      mc = randint(0, 9, [0])
      sortie =
        mc.toString() +
        md.toString() +
        mu.toString() +
        c.toString() +
        d.toString() +
        u.toString()
      break
    case 7:
      mmu = randint(0, 9, [0])
      sortie =
        mmu.toString() +
        mc.toString() +
        md.toString() +
        mu.toString() +
        c.toString() +
        d.toString() +
        u.toString()
      break
    case 8:
      mmd = randint(0, 9, [0])
      sortie =
        mmd.toString() +
        mmu.toString() +
        mc.toString() +
        md.toString() +
        mu.toString() +
        c.toString() +
        d.toString() +
        u.toString()
      break
    case 9:
    default:
      mmc = randint(0, 9, [0])
      sortie =
        mmc.toString() +
        mmd.toString() +
        mmu.toString() +
        mc.toString() +
        md.toString() +
        mu.toString() +
        c.toString() +
        d.toString() +
        u.toString()
      break
  }
  return Number(sortie)
}

// une fonction pour les correction à la precision près
function encadrementCorr(nb: number, precision: number) {
  if (precision === 1) {
    return [
      Math.trunc(nb / precision) * precision - precision,
      Math.trunc(nb / precision) * precision + precision,
    ]
  } else {
    if (nb % precision === 0) {
      return [
        Math.trunc(nb / precision) * precision - precision,
        Math.trunc(nb / precision) * precision + precision,
      ]
    } else {
      return [
        Math.trunc(nb / precision) * precision,
        Math.trunc(nb / precision) * precision + precision,
      ]
    }
  }
}
export default class EncadrerUnEntierParDeuxEntiersConsecutifsOld extends Exercice {
  constructor() {
    super()
    this.sup = 1
    this.sup2 = 2
    this.sup3 = 1
    this.nbQuestions = 3
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Type de question',
      'Nombres séparés par des tirets :\n1 : Encadrer entre deux entiers consécutifs\n2 : Encadrer entre deux multiples de 10\n3 : Encadrer entre deux multiples de 100\n4 : Encadrer entre deux multiples de 10, forcément consécutifs\n5 : Encadrer entre deux multiples de 100, forcément consécutifs\n6 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Difficulté',
      'Nombres séparés par des tirets :\n1 : 4 chiffres\n2 : 5 chiffres\n3 : 6 chiffres\n4 : 7 chiffres\n5 : 8 chiffres\n6 : 9 chiffres\n7 : Mélange',
    ]
    this.besoinFormulaire3Numerique = [
      'Énoncé',
      2,
      '1 : Multiple\n2 : Dizaine, centaine',
    ]
  }

  nouvelleVersion() {
    const nbChiffres = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 7,
      defaut: 3,
      nbQuestions: this.nbQuestions,
      melange: 7,
    }).map(Number)
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      defaut: 1,
      nbQuestions: this.nbQuestions,
      melange: 6,
    }).map(Number)
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let pDix = 1
      // pour la précision d'encadrement
      switch (listeTypeDeQuestions[i]) {
        case 2:
        case 4:
          pDix = 10
          break
        case 3:
        case 5:
          pDix = 100
          break
        default:
          pDix = 1
      }
      const nombre = myNombres(nbChiffres[i] + 3)
      // if (listeTypeDeQuestions[i] > 3) nombre = myNombres(nbChiffres[i] + 2) * 10 + randint(1, 9)
      // autant de case que d'elements dans le tableau des situations
      const [inf, sup] = encadrementCorr(nombre, pDix)
      switch (pDix) {
        case 1:
          texte =
            'Compléter avec le nombre entier qui précède et le nombre entier qui suit :'
          break
        case 10:
          if (this.sup3 === 1) {
            texte =
              'Compléter avec le multiple de 10 qui précède et le multiple de 10 qui suit :'
          } else {
            texte =
              'Compléter avec la dizaine qui précède et la dizaine qui suit :'
          }
          break
        case 100:
          if (this.sup3 === 1) {
            texte =
              'Compléter avec le multiple de 100 qui précède et le multiple de 100 qui suit :'
          } else {
            texte =
              'Compléter avec la centaine qui précède et la centaine qui suit :'
          }
          break
      }
      texte += '<br>'
      texte += remplisLesBlancs(
        this,
        i,
        `%{champ1}<${texNombre(nombre, 0)}<%{champ2}`,
        KeyboardType.clavierDeBase,
      )
      texteCorr = `$${miseEnEvidence(texNombre(inf, 0))}<${texNombre(nombre, 0)}<${miseEnEvidence(texNombre(sup, 0))}$`
      handleAnswers(this, i, {
        champ1: { value: String(inf) },
        champ2: { value: String(sup) },
      })

      if (this.questionJamaisPosee(i, nombre)) {
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
