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

export const titre = 'Diviser un nombre décimal par $10$, $100$ ou $1\\,000$'
export const dateDePublication = '05/07/2025'

/**
 * Division d'un nombre décimal dans différentes écritures par 10, 100, 1000
 * @author Éric Elter (sur les bases de 6C30-1)
 */
export const uuid = 'fcf1b'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6C30-1a'],
  'fr-ch': [],
}

export function donneNomClasse(valeur: number): string[] {
  switch (valeur) {
    case 1:
      return ['unités', 'unités']
    case 10:
      return ['dizaines', 'dixièmes']
    case 100:
      return ['centaines', 'centièmes']
    case 1000:
      return ['milliers', 'millièmes']
    default:
      throw new Error('Valeur non prise en charge. Utilise 10, 100 ou 1000.')
  }
}

export function chiffreAPositionDecimale(
  nombre: number,
  position: number,
): number {
  const partieDecimale = Math.abs(nombre)
  const decale = Math.floor(partieDecimale * position)
  return decale % 10
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
    .filter((chiffre, _index, _arr) => parseInt(chiffre) === chiffreUnites)

  // Il y a un doublon si le chiffre des unités apparaît au moins deux fois
  const doublonUnites = occurrences.length > 1

  return { estEntier, doublonUnites }
}

export default class DiviserDecimauxPar101001000Old extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Nombre à trouver',
      [
        'Nombres séparés par des tirets  :',
        '1 : Quotient',
        '2 : Dividende',
        '3 : Diviseur',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type du dividende',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entiers',
        '2 : Décimaux',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3Texte = [
      'Taille du quotient',
      [
        'Nombres séparés par des tirets  :',
        '1 : Plus petit que 1',
        '2 : Plus grand que 1',
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
      'Le premier paramètre permet de déterminer le nombre à rechercher dans chaque division.<br><br>'
    this.comment +=
      'Le deuxième paramètre permet de choisir si le dividende est un nombre entier, un nombre décimal, une fraction ou un mélange des trois.<br><br>'
    this.comment +=
      'Le troisième paramètre permet de choisir si le quotient est inférieur ou supérieur à 1.<br><br>'
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
      this.consigne += glisseNombreInteractif({ number: 20.25 })
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

      if (typesDeFacteursDisponibles[i] === 1) {
        choixPuissance10 = Math.pow(10, randint(0, 3))
      } else {
        choixPuissance10 = Math.pow(10, randint(-3 + b, Math.min(-3 + b, -1)))
      }
      a = arrondi(aEntier * choixPuissance10)

      if (typesDeResultatsDisponibles[i] === 1 && a / Math.pow(10, b) > 1) {
        while (a / Math.pow(10, b) > 1) {
          a = Math.floor(a / 10)
        }
      } else if (
        typesDeResultatsDisponibles[i] === 2 &&
        a / Math.pow(10, b) < 1
      ) {
        while (a / Math.pow(10, b) < 1) {
          a = arrondi(a * 10)
        }
      }

      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre

        const choixClasseEntiere = donneNomClasse(Math.pow(10, b))[0]
        const choixClasseDecimale = donneNomClasse(Math.pow(10, b))[1]
        const chiffreDesUnites = Math.abs(Math.floor(a)) % 10
        const chiffrePartieDecimale = chiffreAPositionDecimale(
          a,
          Math.pow(10, -b),
        )

        let texteCorr = ''
        let reponse = 0

        switch (typesDeNombres[i]) {
          case 1: // Recherche du quotient
            texte = `$${texNombre(a)}\\div${texNombre(Math.pow(10, b))}=$`

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
              )
            } else texte += sp() + '$ \\ldots$'

            if (this.correctionDetaillee) {
              texteCorr = `Quand on divise par $${texNombre(Math.pow(10, b))}$, tous les chiffres prennent une position $${texNombre(Math.pow(10, b))}$ fois plus petite.<br>`
              texteCorr += `En particulier, quand on divise $${texNombre(a)}$ par $${texNombre(Math.pow(10, b))}$, alors `
              texteCorr += `le chiffre des unités de $${texNombre(a)}$ (${analyserNombre(a).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a), bleuMathalea, 1)}$) devient le chiffre des ${choixClasseDecimale}.<br>`
            }
            texteCorr += `$${texNombre(a)} \\div ${texNombre(
              Math.pow(10, b),
            )} = ${miseEnEvidence(texNombre(a / Math.pow(10, b)))}$`
            reponse = arrondi(a / Math.pow(10, b))
            // Important laisser ici les deux options de comparaison
            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })

            break
          case 2: // Recherche du dividende
            texte = `$\\div${texNombre(Math.pow(10, b))}=${texNombre(a / Math.pow(10, b))}$`

            if (this.interactif) {
              texte = ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                { texteApres: texte },
              )
            } else texte = '$ \\ldots$' + texte

            if (this.correctionDetaillee) {
              texteCorr = `Quand on divise par $${texNombre(Math.pow(10, b))}$, tous les chiffres prennent une position $${texNombre(Math.pow(10, b))}$ fois plus petite.<br>`
              if (chiffreAPositionDecimale(a / Math.pow(10, b), 1) === 0) {
                texteCorr += `Notamment, le chiffre des unités devient le chiffre des ${choixClasseDecimale}.<br>`
                texteCorr += `Dans $${coloreUnSeulChiffre(texNombre(a / Math.pow(10, b)), bleuMathalea, Math.pow(10, -b))}$ (le résultat du calcul), le chiffre des ${choixClasseDecimale} est $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$`
                texteCorr += ` donc le chiffre des unités du nombre recherché est $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$.<br>`
              } else {
                texteCorr += `Notamment, le chiffre des ${choixClasseEntiere} devient le chiffre des unités.<br>`
                texteCorr += `Dans $${coloreUnSeulChiffre(texNombre(a / Math.pow(10, b)), bleuMathalea, 1)}$ (le résultat du calcul), le chiffre des unités est $${miseEnEvidence(chiffrePartieDecimale, bleuMathalea)}$`
                texteCorr += ` donc le chiffre des ${choixClasseEntiere} du nombre recherché est $${miseEnEvidence(chiffrePartieDecimale, bleuMathalea)}$.<br>`
              }
            }
            texteCorr += `$${miseEnEvidence(texNombre(a))} \\div ${texNombre(
              Math.pow(10, b),
            )} = ${texNombre(a / Math.pow(10, b))}$`
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
            texte = `$${texNombre(a)}~\\div$`

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                { texteApres: `$=${texNombre(a / Math.pow(10, b))}$` },
              )
            } else {
              texte +=
                sp() +
                '$ \\ldots$' +
                sp() +
                `$=${texNombre(a / Math.pow(10, b))}$`
            }

            if (this.correctionDetaillee) {
              texteCorr = `Quand on divise par $${texNombre(Math.pow(10, b))}$, tous les chiffres prennent une position $${texNombre(Math.pow(10, b))}$ fois plus petite.<br>`
              if (chiffreAPositionDecimale(a / Math.pow(10, b), 1) === 0) {
                texteCorr += `Notamment, le chiffre des unités devient le chiffre des ${choixClasseDecimale}.<br>`
                texteCorr += `Dans $${coloreUnSeulChiffre(texNombre(a / Math.pow(10, b)), bleuMathalea, Math.pow(10, -b))}$ (le résultat du calcul), le chiffre des ${choixClasseDecimale} est $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$`
                texteCorr += ` donc le chiffre des unités du nombre recherché est $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$.<br>`
              } else {
                texteCorr += `Notamment, le chiffre des ${choixClasseEntiere} devient le chiffre des unités.<br>`
                texteCorr += `Dans $${coloreUnSeulChiffre(texNombre(a / Math.pow(10, b)), bleuMathalea, 1)}$ (le résultat du calcul), le chiffre des unités est $${miseEnEvidence(chiffrePartieDecimale, bleuMathalea)}$`
                texteCorr += ` donc le chiffre des ${choixClasseEntiere} du nombre recherché est $${miseEnEvidence(chiffrePartieDecimale, bleuMathalea)}$.<br>`
              }
            }
            if (this.correctionDetaillee) {
              texteCorr =
                a / Math.pow(10, b) < 1
                  ? `Le chiffre des unités de $${texNombre(a)}$ (${analyserNombre(arrondi(a)).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a), bleuMathalea, 1)}$` +
                    `) devient le chiffre des ${choixClasseDecimale} (dans $${coloreUnSeulChiffre(texNombre(a / Math.pow(10, b)), bleuMathalea, Math.pow(10, -b))}$).<br>`
                  : `Le chiffre des ${choixClasseEntiere} de $${texNombre(a)}$ (${analyserNombre(arrondi(a / Math.pow(10, b))).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffrePartieDecimale, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a), bleuMathalea, Math.pow(10, b))}$` +
                    `) devient le chiffre des unités (dans $${coloreUnSeulChiffre(texNombre(a / Math.pow(10, b)), bleuMathalea, 1)}$).<br>`
              texteCorr += `Tous les chiffres prennent donc une position $${texNombre(Math.pow(10, b))}$ fois plus petite.<br>`
            }

            texteCorr += `$${texNombre(a)} \\div ${miseEnEvidence(
              texNombre(Math.pow(10, b)),
            )} = ${texNombre(a / Math.pow(10, b))}$`
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
          texteCorr += glisseNombreInteractif({ number: a, animation: -b })
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
