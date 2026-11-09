import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { glisseNombreInteractif } from '../../lib/apps/glisse_nombre_interactif'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  coloreUnSeulChiffre,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDansLaPartieEntiere,
} from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const titre = 'Multiplier un nombre décimal par $10$, $100$ ou $1\\,000$'
export const dateDePublication = '20/09/2025'

/**
 * Multiplication d'un nombre décimal dans différentes écritures par 10, 100, 1000
 * @author Éric Elter et IA_Claude (basé sur 6N2autoD)
 */
export const uuid = '5ec3c'

export const refs = {
  'fr-fr': ['6N2autoD-1', '5N1autoE-1'],
  'fr-2016': [''],
  'fr-ch': ['9R1NO6E-7', '9R2NO6E-7', '9R3NO6E-7', 'PRQNO06A-7'],
}

export function donneNomClasse(valeur: number): string[] {
  switch (valeur) {
    case 1:
      return ['unités', 'unités']
    case 10:
      return ['dixièmes', 'dizaines']
    case 100:
      return ['centièmes', 'centaines']
    case 1000:
      return ['millièmes', 'milliers']
    default:
      throw new Error('Valeur non prise en charge. Utilise 10, 100 ou 1000.')
  }
}

export function chiffreAPositionDecimale(
  nombre: number,
  position: number,
): number {
  // Convertir le nombre en chaîne pour extraire les chiffres
  const nombreStr = Math.abs(nombre).toString()
  const partieDecimale = nombreStr.split('.')[1] || ''

  // Calculer l'index dans la partie décimale
  const indexDecimal = Math.log10(position)

  if (indexDecimal >= 0 && indexDecimal < partieDecimale.length) {
    return parseInt(partieDecimale[indexDecimal]) || 0
  }
  return 0
}

export function analyserNombre(nombre: number): {
  estEntier: boolean
  doublonUnites: boolean
} {
  const estEntier = Math.floor(nombre) === nombre
  // Étape 1 : récupérer le chiffre des unités
  const chiffreUnites = Math.abs(Math.floor(nombre)) % 10

  // Étape 2 : transformer le nombre en chaîne, sans le signe
  const chiffres = Math.abs(nombre).toString().replace('.', '')

  // Étape 3 : compter combien de fois le chiffre des unités apparaît
  const occurrences = chiffres
    .split('')
    .filter((chiffre) => parseInt(chiffre) === chiffreUnites)

  // Il y a un doublon si le chiffre des unités apparaît au moins deux fois
  const doublonUnites = occurrences.length > 1

  return { estEntier, doublonUnites }
}

export default class MultiplierDecimauxPar101001000 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Nombre à trouver',
      [
        'Nombres séparés par des tirets  :',
        '1 : Produit',
        '2 : Premier facteur',
        '3 : Deuxième facteur',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type du premier facteur',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entiers',
        '2 : Décimaux',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3Texte = [
      'Taille du premier facteur',
      [
        'Nombres séparés par des tirets  :',
        '1 : Plus petit que la puissance de 10',
        '2 : Plus grand que la puissance de 10',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire4CaseACocher = ['Avec glisse-nombres']
    this.sup = '1-2'
    this.sup2 = '3'
    this.sup3 = '3'
    this.sup4 = true
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 8
    this.comment =
      'Le premier paramètre permet de déterminer le nombre à rechercher dans chaque multiplication.<br><br>'
    this.comment +=
      'Le deuxième paramètre permet de choisir si le premier facteur est un nombre entier, un nombre décimal ou un mélange des deux.<br><br>'
    this.comment +=
      'Le troisième paramètre permet de choisir si le premier facteur est inférieur ou supérieur à la puissance de 10 utilisée.<br><br>'
    this.comment +=
      "Le quatrième paramètre permet de choisir si cet exercice dispose d'un glisse-nombre.<br><br>"
    this.comment +=
      'Le cinquième paramètre permet de choisir si cet exercice propose une correction sèche ou une correction détaillée.'
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.consigne = 'Compléter.'
  }

  nouvelleVersion() {
    const typesDeNombresCherches = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const typesDeNombres = combinaisonListes(
      typesDeNombresCherches,
      this.nbQuestions,
    )

    const typesDeFacteursDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })

    const typesDeResultatsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })

    if (context.isHtml && this.sup4) {
      this.consigne = 'Compléter.'
      this.consigne += '<br>Un glisse-nombre est à disposition pour répondre '
      this.consigne +=
        this.nbQuestions === 1 ? 'à la question.' : 'aux questions.'
      this.consigne += glisseNombreInteractif({ number: 2.025 })
    } else {
      this.consigne = 'Compléter.'
    }

    const puissances = combinaisonListes([1, 2, 3], this.nbQuestions)

    for (
      let i = 0, texte, cpt = 0, a, b, choixPuissance10, aEntier;
      i < this.nbQuestions && cpt < 50;
    ) {
      aEntier = choice([randint(11, 99), randint(101, 999)])
      b = puissances[i]

      // D'abord, générer a selon la comparaison avec la puissance de 10
      if (typesDeResultatsDisponibles[i] === 1) {
        // a plus petit que la puissance de 10
        if (Math.pow(10, b) === 10) {
          // Pour ×10, a doit être < 10
          a = arrondi(randint(1, 9) + Math.random())
        } else if (Math.pow(10, b) === 100) {
          // Pour ×100, a doit être < 100
          a = arrondi(randint(1, 99) + Math.random())
        } else {
          // Pour ×1000, a doit être < 1000
          a = arrondi(randint(1, 999) + Math.random())
        }
      } else if (typesDeResultatsDisponibles[i] === 2) {
        // a plus grand que la puissance de 10
        if (Math.pow(10, b) === 10) {
          // Pour ×10, a doit être > 10
          a = arrondi(randint(11, 999) + Math.random())
        } else if (Math.pow(10, b) === 100) {
          // Pour ×100, a doit être > 100
          a = arrondi(randint(101, 999) + Math.random())
        } else {
          // Pour ×1000, a doit être > 1000
          a = arrondi(randint(1001, 9999) + Math.random())
        }
      } else {
        // Mélange : générer normalement
        choixPuissance10 = Math.pow(10, randint(-3, -1))
        a = arrondi(aEntier * choixPuissance10)
      }

      // Ensuite, ajuster selon le type de facteur demandé
      if (typesDeFacteursDisponibles[i] === 1) {
        // Pour avoir un entier
        a = Math.floor(a)
        if (a === 0) a = aEntier // Sécurité
      } else {
        // Pour avoir un décimal avec variété
        // 1. Partie entière : 1 à 4 chiffres avec variété
        let partieEntiere = Math.floor(a)
        if (partieEntiere >= 1000) {
          // Parfois réduire pour avoir moins de chiffres
          if (Math.random() < 0.3) partieEntiere = randint(1, 999)
          else if (Math.random() < 0.5) partieEntiere = randint(100, 999)
        } else if (partieEntiere >= 100) {
          // Parfois réduire pour avoir moins de chiffres
          if (Math.random() < 0.4) partieEntiere = randint(1, 99)
        }

        // 2. Partie décimale : 1 à 3 chiffres avec variété
        const nbDecimales = choice([1, 2, 3])
        let partieDecimale = 0

        if (nbDecimales === 1) {
          partieDecimale = randint(1, 9) / 10
        } else if (nbDecimales === 2) {
          partieDecimale = randint(1, 99) / 100
        } else {
          partieDecimale = randint(1, 999) / 1000
        }

        a = arrondi(partieEntiere + partieDecimale)

        // Vérifier encore la contrainte de taille si nécessaire
        if (typesDeResultatsDisponibles[i] === 1 && a >= Math.pow(10, b)) {
          // Réduire la partie entière
          partieEntiere = randint(1, Math.pow(10, b) - 1)
          a = arrondi(partieEntiere + partieDecimale)
        } else if (
          typesDeResultatsDisponibles[i] === 2 &&
          a <= Math.pow(10, b)
        ) {
          // Augmenter la partie entière
          partieEntiere = randint(Math.pow(10, b) + 1, Math.pow(10, b) * 10)
          a = arrondi(partieEntiere + partieDecimale)
        }
      }

      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre

        const choixClasseEntiere = donneNomClasse(Math.pow(10, b))[0]
        const choixClasseDecimale = donneNomClasse(Math.pow(10, b))[1]
        const chiffreDesUnites = Math.abs(Math.floor(a)) % 10

        // Pour identifier correctement le chiffre qui se déplace et sa destination
        const nombreStr = a.toString()
        const partieDecimale = nombreStr.split('.')[1] || ''
        let chiffreQuiSeDeplace = chiffreDesUnites
        let positionOriginale = 'unités'
        let positionDestination = choixClasseDecimale

        // Si a < 1, le chiffre significatif est dans la partie décimale
        if (a < 1 && partieDecimale.length > 0) {
          // Trouver le premier chiffre non nul dans la partie décimale
          for (let i = 0; i < partieDecimale.length; i++) {
            const chiffre = parseInt(partieDecimale[i])
            if (chiffre !== 0) {
              chiffreQuiSeDeplace = chiffre
              if (i === 0) {
                positionOriginale = 'dixièmes'
                // dixièmes × 10 = unités, × 100 = dizaines, × 1000 = centaines
                if (b === 1) positionDestination = 'unités'
                else if (b === 2) positionDestination = 'dizaines'
                else if (b === 3) positionDestination = 'centaines'
              } else if (i === 1) {
                positionOriginale = 'centièmes'
                // centièmes × 10 = dixièmes, × 100 = unités, × 1000 = dizaines
                if (b === 1) positionDestination = 'dixièmes'
                else if (b === 2) positionDestination = 'unités'
                else if (b === 3) positionDestination = 'dizaines'
              } else if (i === 2) {
                positionOriginale = 'millièmes'
                // millièmes × 10 = centièmes, × 100 = dixièmes, × 1000 = unités
                if (b === 1) positionDestination = 'centièmes'
                else if (b === 2) positionDestination = 'dixièmes'
                else if (b === 3) positionDestination = 'unités'
              }
              break
            }
          }
        } else {
          // Pour les nombres ≥ 1, le chiffre des unités devient la position donnée par choixClasseDecimale
          positionOriginale = 'unités'
          positionDestination = choixClasseDecimale
        }

        let texteCorr = ''
        let reponse = 0

        switch (typesDeNombres[i]) {
          case 1: // Recherche du produit
            texte = `$${texNombre(a)}\\times${texNombre(Math.pow(10, b))}=$`

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
              )
            } else texte += sp() + '$ \\ldots$'

            if (this.correctionDetaillee) {
              texteCorr = `Quand on multiplie par $${texNombre(Math.pow(10, b))}$, tous les chiffres prennent une position $${texNombre(Math.pow(10, b))}$ fois plus grande.<br>`
              texteCorr += `En particulier, quand on multiplie $${texNombre(a)}$ par $${texNombre(Math.pow(10, b))}$, alors `
              texteCorr += `le chiffre des ${positionOriginale} de $${texNombre(a)}$ (${analyserNombre(a).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreQuiSeDeplace, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a), bleuMathalea, 1)}$) devient le chiffre des ${positionDestination}.<br>`
            }
            texteCorr += `$${texNombre(a)} \\times ${texNombre(
              Math.pow(10, b),
            )} = ${miseEnEvidence(texNombre(a * Math.pow(10, b)))}$`
            reponse = arrondi(a * Math.pow(10, b))
            // Important laisser ici les deux options de comparaison
            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })

            break
          case 2: // Recherche du premier facteur
            texte = `$\\times${texNombre(Math.pow(10, b))}=${texNombre(a * Math.pow(10, b))}$`

            if (this.interactif) {
              texte = ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                { texteApres: texte },
              )
            } else texte = '$ \\ldots$' + texte

            if (this.correctionDetaillee) {
              texteCorr = `Quand on multiplie par $${texNombre(Math.pow(10, b))}$, tous les chiffres prennent une position $${texNombre(Math.pow(10, b))}$ fois plus grande.<br>`
              const produit = a * Math.pow(10, b)
              if (produit >= 10) {
                texteCorr += `Notamment, le chiffre des ${choixClasseEntiere} devient le chiffre des ${choixClasseDecimale}.<br>`
                texteCorr += `Dans $${coloreUnSeulChiffre(texNombre(produit), bleuMathalea, Math.pow(10, b))}$ (le résultat du calcul), le chiffre des ${choixClasseDecimale} est $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$`
                texteCorr += ` donc le chiffre des ${choixClasseEntiere} du nombre recherché est $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$.<br>`
              } else {
                texteCorr += `Notamment, le chiffre des unités devient le chiffre des ${choixClasseDecimale}.<br>`
                texteCorr += `Dans $${coloreUnSeulChiffre(texNombre(produit), bleuMathalea, Math.pow(10, b))}$ (le résultat du calcul), le chiffre des ${choixClasseDecimale} est $${miseEnEvidence(chiffreQuiSeDeplace, bleuMathalea)}$`
                texteCorr += ` donc le chiffre des unités du nombre recherché est $${miseEnEvidence(chiffreQuiSeDeplace, bleuMathalea)}$.<br>`
              }
            }
            texteCorr += `$${miseEnEvidence(texNombre(a))} \\times ${texNombre(
              Math.pow(10, b),
            )} = ${texNombre(a * Math.pow(10, b))}$`
            reponse = a
            // Important laisser ici les deux options de comparaison
            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })
            break
          case 3: // Recherche de la puissance de 10
          default:
            texte = `$${texNombre(a)}~\\times$`

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                { texteApres: `$=${texNombre(a * Math.pow(10, b))}$` },
              )
            } else {
              texte +=
                sp() +
                '$ \\ldots$' +
                sp() +
                `$=${texNombre(a * Math.pow(10, b))}$`
            }

            if (this.correctionDetaillee) {
              texteCorr = `Quand on multiplie par $${texNombre(Math.pow(10, b))}$, tous les chiffres prennent une position $${texNombre(Math.pow(10, b))}$ fois plus grande.<br>`
              const produit = a * Math.pow(10, b)
              if (a < 1) {
                texteCorr += `Le chiffre des ${positionOriginale} de $${texNombre(a)}$ (${analyserNombre(arrondi(produit)).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreQuiSeDeplace, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a), bleuMathalea, Math.pow(10, -b))}$`
                texteCorr += `) devient le chiffre des ${positionDestination} (dans $${coloreUnSeulChiffre(texNombre(produit), bleuMathalea, Math.pow(10, b))}$).<br>`
              } else {
                texteCorr += `Le chiffre des unités de $${texNombre(a)}$ (${analyserNombre(arrondi(a)).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a), bleuMathalea, 1)}$`
                texteCorr += `) devient le chiffre des ${positionDestination} (dans $${coloreUnSeulChiffre(texNombre(produit), bleuMathalea, Math.pow(10, b))}$).<br>`
              }
              texteCorr += `Tous les chiffres prennent donc une position $${texNombre(Math.pow(10, b))}$ fois plus grande.<br>`
            }

            texteCorr += `$${texNombre(a)} \\times ${miseEnEvidence(
              texNombre(Math.pow(10, b)),
            )} = ${texNombre(a * Math.pow(10, b))}$`
            reponse = Math.pow(10, b)

            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { nombreDecimalSeulement: true },
              },
            })
            break
        }

        if (this.sup4) {
          texteCorr += glisseNombreInteractif({ number: a, animation: b })
        }

        if (context.isAmc) {
          this.autoCorrectionAMC[i].enonce = texte
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          this.autoCorrectionAMC[i].propositions = [{ texte: texteCorr }]
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          const amcParam = ensureAmcParam(this, i)
          amcParam.digits =
            nombreDeChiffresDansLaPartieEntiere(reponse) +
            nombreDeChiffresDansLaPartieDecimale(reponse) +
            2
          amcParam.decimals = nombreDeChiffresDansLaPartieDecimale(reponse) + 1
          amcParam.signe = false
          amcParam.exposantNbChiffres = 0
        }
        this.listeQuestions[i] = texte.replaceAll('$$', '')
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
