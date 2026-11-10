import { amcConvert } from '../../lib/amc/amcBuilders'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureNombreRelatif,
  ecritureNombreRelatifc,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieEntiere,
} from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = 'Opérations avec deux entiers relatifs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Effectuer des opérations avec 2 nombres relatifs
 *
 * * On peut choisir les 4 opérations
 * @author Mickael Guironnet - Rémi Angot
 */
export const uuid = '0b020'

export const refs = {
  'fr-fr': ['4C10-7', '3AutoN02-2'],
  'fr-ch': ['10LCNO2C-5', '10LSNO2C-5', '11CTNO1B-5', 'PRQNO06B-13'],
}
export default class ExerciceOperationsRelatifs extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Écriture des nombres relatifs',
      3,
      [
        '1 : Toutes les parenthèses',
        '2 : Un minimum de parenthèses',
        '3 : Un minimum de parenthèses et sommes algébriques',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Multiplication',
        '2 : Division',
        '3 : Addition',
        '4 : Soustraction',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3Numerique = ['Valeur maximale', 99999]
    this.sup = 1 // 1 : toutes les parenthèses ; 2 : minimum de parenthèses ; 3 : minimum de parenthèses et sommes algébriques
    this.sup2 = 5 // Mélange par défaut
    this.sup3 = 10 // Valeur maximum
    this.consigne = 'Calculer.'
    this.spacing = 2
  }

  nouvelleVersion() {
    const listeTypeDeSignes = combinaisonListes(
      ['-+', '+-', '--', '-+', '+-', '--', '++'],
      this.nbQuestions,
    )
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
      max: 4,
      melange: 5,
      defaut: 2,
    })
    // Mode d'écriture des relatifs :
    //  1 : toutes les parenthèses (ex. (+4) - (+5))
    //  2 : un minimum de parenthèses (ex. 4 - (+5))
    //  3 : un minimum de parenthèses et sommes algébriques (ex. 4 - 5)
    // Compatibilité : l'ancienne case à cocher « écritures simplifiées » cochée correspond au mode 2.
    let modeEcriture = 1
    if (this.sup === true || Number(this.sup) === 2) {
      modeEcriture = 2
    } else if (Number(this.sup) === 3) {
      modeEcriture = 3
    }
    for (
      let i = 0, a, b, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      switch (listeTypeDeQuestions[i]) {
        case 2:
          b = randint(2, 9)
          a = b * randint(2, this.sup3)
          break
        case 1:
        case 3:
        case 4:
        default:
          b = randint(2, this.sup3)
          a = randint(2, this.sup3)
          break
      }
      switch (listeTypeDeSignes[i]) {
        case '-+':
          a *= -1
          break
        case '+-':
          b *= -1
          break
        case '--':
        default:
          a *= -1
          b *= -1
          break
      }
      switch (listeTypeDeQuestions[i]) {
        case 1: // multiplications
          if (modeEcriture === 1) {
            texte = `$ ${ecritureNombreRelatif(a)}  \\times ${ecritureNombreRelatif(b)}$`
            texteCorr = `$ ${ecritureNombreRelatifc(a)} \\times ${ecritureNombreRelatifc(b)}  = ${ecritureNombreRelatifc(a * b, { color: orangeMathalea })} $`
          } else {
            // Modes 2 et 3 : une multiplication ne comporte pas de somme algébrique.
            texte = `$ ${a}  \\times ${ecritureParentheseSiNegatif(b)}$`
            texteCorr = `$ ${a}  \\times ${ecritureParentheseSiNegatif(b)} = ${arrondi(a * b)} $`
          }
          handleAnswers(
            this,
            i,
            { reponse: { value: a * b } },
            {
              signe: true,
              digits: Math.max(2, nombreDeChiffresDansLaPartieEntiere(a * b)),
              decimals: 0,
            },
          )
          break
        case 2: // quotients
          if (modeEcriture === 1) {
            texte = `$ ${ecritureNombreRelatif(a)}  \\div ${ecritureNombreRelatif(b)}$`
            texteCorr = `$ ${ecritureNombreRelatifc(a)}  \\div ${ecritureNombreRelatifc(b)} = ${ecritureNombreRelatifc(a / b, { color: orangeMathalea })}$`
          } else {
            // Modes 2 et 3 : une division ne comporte pas de somme algébrique.
            texte = `$ ${texNombre(a)} \\div ${ecritureParentheseSiNegatif(b)}$`
            texteCorr = `$ ${texNombre(a)} \\div ${ecritureParentheseSiNegatif(b)} = ${texNombre(arrondi(a / b))}$`
          }
          handleAnswers(
            this,
            i,
            { reponse: { value: arrondi(a / b) } },
            { signe: true, digits: 1, decimals: 0 },
          )
          break
        case 3: // additions
          if (modeEcriture === 1) {
            texte = `$ ${ecritureNombreRelatif(a)} + ${ecritureNombreRelatif(b)} $`
            texteCorr = `$  ${ecritureNombreRelatifc(a)} + ${ecritureNombreRelatifc(b)} = ${ecritureNombreRelatifc(a + b, { color: orangeMathalea })} $`
          } else if (modeEcriture === 3) {
            // Somme algébrique : + (+b) devient + b, + (-b) devient - b.
            texte = `$ ${a} ${b >= 0 ? '+' : '-'} ${Math.abs(b)} $`
            texteCorr = `$ ${a} ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${arrondi(a + b)} $`
          } else {
            texte = `$ ${a} + ${ecritureParentheseSiNegatif(b)} $`
            texteCorr = `$ ${a} + ${ecritureParentheseSiNegatif(b)}  = ${arrondi(a + b)} $`
          }
          handleAnswers(
            this,
            i,
            { reponse: { value: a + b } },
            {
              signe: true,
              digits: Math.max(2, nombreDeChiffresDansLaPartieEntiere(a + b)),
              decimals: 0,
            },
          )
          break
        case 4: // soustractions
        default:
          if (modeEcriture === 1) {
            texte = `$ ${ecritureNombreRelatif(a)} - ${ecritureNombreRelatif(b)} $`
            texteCorr = `$  ${ecritureNombreRelatifc(a)} - ${ecritureNombreRelatifc(b)} = ${ecritureNombreRelatifc(a - b, { color: orangeMathalea })} $`
          } else if (modeEcriture === 3) {
            // Somme algébrique : - (+b) devient - b, - (-b) devient + b.
            texte = `$ ${a} ${b >= 0 ? '-' : '+'} ${Math.abs(b)} $`
            texteCorr = `$ ${a} ${b >= 0 ? '-' : '+'} ${Math.abs(b)} = ${a - b} $`
          } else {
            texte = `$ ${a} - ${ecritureNombreRelatif(b)}$`
            texteCorr = `$ ${a} - ${ecritureNombreRelatif(b)} = ${a - b} $`
          }
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: [(a - b).toString(), `(${ecritureAlgebrique(a - b)})`],
              },
            },
            {
              signe: true,
              digits: Math.max(2, nombreDeChiffresDansLaPartieEntiere(a - b)),
              decimals: 0,
            },
          )
          break
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
        texteAvant: sp() + '$=$',
      })

      if (modeEcriture !== 1) {
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras

        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`

        // Fin de cette uniformisation
      }

      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], a, b)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: sp() + '$=$',
        })
        if (context.isAmc) {
          this.autoCorrectionAMC[i].propositions = [
            { statut: 0, sanscadre: false, texte: texteCorr },
          ]
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          this.autoCorrectionAMC[i].enonce = 'Calculer.\\\\' + texte
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
