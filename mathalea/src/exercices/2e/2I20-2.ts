import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Calculer une évolution en pourcentages, une valeur finale ou une valeur initiale'
export const interactifReady = true

export const dateDePublication = '06/01/2022'
export const dateDeModifImportante = '04/10/2025'

/**
 * Problèmes de variations en pourcentage
 *
 * * Situations variées : prix soldé ou augmenté, effectif d'un collège ou lycée, facture, population d'une ville
 *
 * * Calculer le résultat d'une évolution
 * * Exprimer l'évolution en pourcentage
 * * Retrouver la situation initiale
 * * Mélange des 3 types de problèmes
 * @author Rémi Angot + Florence Tapiero (correction version seconde)
 */
export const uuid = '12444'

export const refs = {
  'fr-fr': ['2I20-2', 'BP2AutoB2'],
  'fr-ch': ['10CTFA1E-6', '10LCFA1E-6', '10LSFA1E-6'],
}
type TypeDeQuestion = 'finale' | 'evolution' | 'initiale'

// Taux dont le coefficient multiplicateur n'a qu'une décimale (1,1 ; 0,8 ; 1,5…) :
// diviser par ce coefficient revient à diviser 10 fois la valeur finale par un entier
const tauxFacilesPourLaValeurInitiale = [10, 20, 30, 40, 50]

const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b))

/**
 * Tire une valeur initiale et un taux d'évolution simples, calculables sans calculatrice :
 * taux usuels et valeurs « rondes » pour que la variation soit entière et facile à obtenir de tête.
 * Pour retrouver la valeur initiale, le coefficient multiplicateur n'a qu'une décimale
 * et la valeur initiale un seul chiffre significatif : la division se fait sans fraction.
 * @returns [valeur initiale, taux d'évolution en %]
 */
function valeursSansCalculatrice(
  situation: string,
  typeDeQuestion: TypeDeQuestion,
): [number, number] {
  const mantisse = (n: number) => {
    let m = n
    while (m % 10 === 0) m /= 10
    return m
  }
  const tirer = (listeTaux: number[], listeDeparts: number[]) => {
    const tauxPossibles =
      typeDeQuestion === 'initiale'
        ? listeTaux.filter((t) => tauxFacilesPourLaValeurInitiale.includes(t))
        : listeTaux
    const taux = choice(tauxPossibles)
    const departsPossibles = listeDeparts.filter((depart) => {
      const variation = (depart * taux) / 100
      // Variation entière, avec au plus deux chiffres significatifs (pas 375 ni 6 250)
      if (!Number.isInteger(variation) || mantisse(variation) >= 100)
        return false
      // Valeur initiale à un seul chiffre significatif : 10 × Vf se divise de tête par 10 × CM
      return typeDeQuestion !== 'initiale' || mantisse(depart) < 10
    })
    return [choice(departsPossibles), taux * choice([-1, 1])] as [
      number,
      number,
    ]
  }
  switch (situation) {
    case 'prix':
      return tirer(
        [5, 10, 15, 20, 25, 30, 40, 50],
        [20, 40, 60, 80, 100, 120, 150, 200, 250, 300, 400],
      )
    case 'etablissement':
      return tirer(
        [5, 10, 15, 20, 25],
        [200, 300, 400, 500, 600, 800, 1000, 1200],
      )
    case 'facture':
      return tirer(
        [5, 10, 15, 20, 25, 30],
        [400, 500, 600, 800, 1000, 1200, 1500, 2000],
      )
    case 'population':
      return tirer(
        [5, 10, 15, 20, 25],
        [2000, 4000, 5000, 8000, 10000, 12000, 20000, 25000, 40000, 50000],
      )
    case 'chiffreAffaires':
      return tirer(
        [5, 10, 15, 20, 25, 30, 40],
        [50000, 80000, 100000, 120000, 150000, 200000, 250000, 300000, 400000],
      )
    case 'abonnement':
    default:
      return tirer([10, 20, 25], [10, 12, 16, 20, 24, 30, 40, 50])
  }
}

/**
 * Calcul mental de taux % de valeur, présenté étape par étape.
 * @returns [texte de la démarche, résultat]
 */
function pourcentageDeTete(taux: number, valeur: number): [string, number] {
  const resultat = (taux * valeur) / 100
  const v = texNombre(valeur, 2)
  const r = texNombre(resultat, 2)
  const pourcent = `$${taux}\\,\\%$`
  const dix = texNombre(valeur / 10, 2)
  switch (taux) {
    case 50:
      return [
        `Prendre ${pourcent} d'une quantité, c'est en prendre la moitié : $${v} \\div 2 = ${r}$.`,
        resultat,
      ]
    case 25:
      return [
        `Prendre ${pourcent} d'une quantité, c'est en prendre le quart : $${v} \\div 4 = ${r}$.`,
        resultat,
      ]
    case 10:
      return [
        `Prendre ${pourcent} d'une quantité, c'est la diviser par $10$ : $${v} \\div 10 = ${r}$.`,
        resultat,
      ]
    case 5:
      return [
        `$10\\,\\%$ de $${v}$ est égal à $${v} \\div 10 = ${dix}$.<br>${pourcent} est la moitié de $10\\,\\%$ : $${dix} \\div 2 = ${r}$.`,
        resultat,
      ]
    case 15: {
      const cinq = texNombre(valeur / 20, 2)
      return [
        `$10\\,\\%$ de $${v}$ est égal à $${v} \\div 10 = ${dix}$.<br>$5\\,\\%$ est la moitié de $10\\,\\%$ : $${cinq}$.<br>${pourcent} $=10\\,\\% + 5\\,\\%$ donc : $${dix} + ${cinq} = ${r}$.`,
        resultat,
      ]
    }
    default:
      return [
        `$10\\,\\%$ de $${v}$ est égal à $${v} \\div 10 = ${dix}$.<br>Pour prendre ${pourcent}, on multiplie par $${taux / 10}$ : $${dix} \\times ${taux / 10} = ${r}$.`,
        resultat,
      ]
  }
}

/**
 * Démarche de calcul mental pour la correction « Sans calculatrice ».
 * Le résultat final est laissé à la phrase de conclusion de la situation.
 */
function correctionDeTete(
  typeDeQuestion: TypeDeQuestion,
  depart: number,
  taux: number,
): string {
  const t = Math.abs(taux)
  const variation = (t * depart) / 100
  const arrive = taux > 0 ? depart + variation : depart - variation
  const vi = texNombre(depart, 2)
  const vf = texNombre(arrive, 2)
  const va = texNombre(variation, 2)
  switch (typeDeQuestion) {
    case 'finale': {
      const [demarche] = pourcentageDeTete(t, depart)
      return taux > 0
        ? `${demarche}<br>L'augmentation est donc de $${va}$, d'où $${vi} + ${va} = ${vf}$.`
        : `${demarche}<br>La baisse est donc de $${va}$, d'où $${vi} - ${va} = ${vf}$.`
    }
    case 'initiale': {
      // Coefficient multiplicateur à une décimale : diviser par CM, c'est diviser 10 × Vf par 10 × CM
      const coeff = texNombre((100 + taux) / 100, 1)
      const diviseur = (100 + taux) / 10
      const verbe = taux > 0 ? 'Augmenter' : 'Diminuer'
      const signe = taux > 0 ? '+' : '-'
      let texte = `${verbe} de $${t}\\,\\%$ revient à multiplier par $1 ${signe} ${texNombre(t / 100, 2)} = ${coeff}$.`
      texte += `<br>La valeur initiale $V_i$ vérifie donc $V_i \\times ${coeff} = ${vf}$, d'où $V_i = \\dfrac{${vf}}{${coeff}} = \\dfrac{${texNombre(arrive * 10, 2)}}{${diviseur}} = ${vi}$.`
      return texte
    }
    case 'evolution':
    default: {
      // Fraction variation / valeur initiale simplifiée, puis ramenée à un dénominateur 100
      const d = pgcd(t, 100)
      const a = t / d
      const b = 100 / d
      const moins = taux > 0 ? '' : '-'
      const ecart = texNombre(arrive - depart, 2)
      const etapes = [`\\dfrac{${ecart}}{${vi}}`]
      if (depart !== 100 && b !== depart)
        etapes.push(`${moins}\\dfrac{${a}}{${b}}`)
      if (depart !== 100 && b !== 100) etapes.push(`${moins}\\dfrac{${t}}{100}`)
      const fractions = etapes.join(' = ')
      return `$V_f - V_i = ${vf} - ${vi} = ${ecart}$.<br>On utilise la formule du cours : $t = \\dfrac{V_f - V_i}{V_i} = ${fractions}$.`
    }
  }
}

export default class EvolutionsEnPourcentage extends Exercice {
  onlyMoney = false
  constructor() {
    super()

    this.nbQuestions = 4
    this.spacing = 1.5

    this.sup = 4 // type de questions
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      "1 : Déterminer le résultat après une évolution en pourcentage\n2 : Calculer un taux d'évolution\n3 : Calculer la valeur initiale en connaissant le taux d'évolution et la valeur finale\n4 : Mélange",
    ]
    this.besoinFormulaire2CaseACocher = ['Sans calculatrice', false]
    this.sup2 = false
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles: ('finale' | 'evolution' | 'initiale')[] =
      []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = ['finale']
    }
    if (this.sup === 2) {
      typesDeQuestionsDisponibles = ['evolution']
    }
    if (this.sup === 3) {
      typesDeQuestionsDisponibles = ['initiale']
    }
    if (this.sup === 4) {
      typesDeQuestionsDisponibles = ['finale', 'evolution', 'initiale']
    }
    const situationsDisponibles = this.onlyMoney
      ? ['prix', 'facture', 'abonnement']
      : [
          'prix',
          'etablissement',
          'facture',
          'population',
          'chiffreAffaires',
          'abonnement',
        ] //

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    const typesDeSituations = combinaisonListes(
      situationsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    let date, cetteAnnee, anneeDerniere, etablissement, facture, nb
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let depart: number
      let taux: number
      let tauxDec: number
      let coeff: number
      let arrive: number
      let texte = ''
      let texteCorr = ''
      let reponse: number
      switch (typesDeSituations[i]) {
        case 'prix':
          if (this.sup2) {
            ;[depart, taux] = valeursSansCalculatrice(
              typesDeSituations[i],
              listeTypeDeQuestions[i],
            )
          } else {
            switch (randint(1, 3)) {
              case 1:
                depart = randint(11, 99) / 10
                taux = randint(1, 7) * 10 * choice([-1, 1])
                break
              case 2:
                depart = randint(11, 99)
                taux = randint(5, 60) * choice([-1, 1])
                break
              case 3:
              default:
                depart = randint(11, 99) * 10
                taux = randint(5, 60) * choice([-1, 1])
                break
            }
          }
          tauxDec = taux / 100
          coeff = tauxDec + 1
          arrive = depart * coeff
          switch (listeTypeDeQuestions[i]) {
            case 'finale':
              if (taux > 0) {
                texte = `Un article coûtait $${texPrix(depart)}$ € et son prix a augmenté de $${taux}~\\%$. <br>
                Calculer son nouveau prix.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texPrix(depart)}\\times ${texNombre(coeff, 2)} = ${texPrix(arrive)}$`
                texteCorr += `<br>Le nouveau prix de cet article est $${miseEnEvidence(`${texPrix(arrive)}`)}$ €.`
                reponse = arrive
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteAvant: '<br>',
                    texteApres: '€',
                  },
                )
              } else {
                texte = `Un article coûtait $${texPrix(depart)}$ € et son prix est soldé à $${taux}~\\%$.<br>
                 Calculer son nouveau prix.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texPrix(depart)}\\times ${texNombre(coeff, 2)} = ${texPrix(arrive)}$`
                texteCorr += `<br>Le nouveau prix de cet article est $${miseEnEvidence(`${texPrix(arrive)}`)}$ €.`
                reponse = arrive
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteAvant: '<br>',
                    texteApres: '€',
                  },
                )
              }
              break
            case 'initiale':
              if (taux > 0) {
                texte = `Après une augmentation de $${taux}~\\%$ un article coûte $${texPrix(arrive)}$ €. <br>
                Calculer son prix avant l'augmentation.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver le prix initial, on va donc diviser le prix final par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texPrix(arrive)}}{${texNombre(coeff, 2)}} = ${texPrix(depart)}$`
                texteCorr += `<br>Avant l'augmentation, cet article coûtait $${miseEnEvidence(`${texPrix(depart)}`)}$ €.`
                reponse = depart
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteAvant: '<br>',
                    texteApres: '€',
                  },
                )
              } else {
                texte = `Soldé à $${abs(taux)}~\\%$ un article coûte $${texPrix(arrive)}$ €. <br>
                Calculer son prix avant les soldes.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver le prix initial, on va donc diviser le prix final par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texPrix(arrive)}}{${texNombre(coeff, 2)}} = ${texPrix(depart)}$`
                texteCorr += `<br>Avant les soldes cet article coûtait $${miseEnEvidence(`${texPrix(depart)}`)}$ €.`
                reponse = depart
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteAvant: '<br>',
                    texteApres: '€',
                  },
                )
              }
              break
            case 'evolution':
            default:
              if (taux > 0) {
                texte = `Un article qui coûtait $${texPrix(depart)}$ € coûte maintenant $${texPrix(arrive)}$ €.<br>
                 Calculer le taux d'évolution du prix en pourcentage.`
                texteCorr =
                  "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
                texteCorr += `<br><br>Ici : $t=\\dfrac{${texPrix(arrive)}-${texPrix(depart)}}{${texPrix(depart)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
                texteCorr += `<br>L'évolution du prix est $${miseEnEvidence(`${taux}`)}~\\%$.<br><br>`
                texteCorr +=
                  'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
                texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texPrix(arrive)}}{${texPrix(depart)}} = ${texNombre(coeff, 2)}$<br>
                $t = ${texNombre(coeff, 2)}-1= ${miseEnEvidence(`${taux}`)}~\\%$`
                reponse = taux
              } else {
                texte = `Un article qui coûtait $${texPrix(depart)}$ € coûte maintenant $${texPrix(arrive)}$ €. <br>
                Calculer le taux d'évolution du prix en pourcentage.`
                texteCorr =
                  "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
                texteCorr += `<br><br>Ici : $t=\\dfrac{${texPrix(arrive)}-${texPrix(depart)}}{${texPrix(depart)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
                texteCorr += `<br>L'évolution du prix est $${miseEnEvidence(taux)}~\\%$.<br><br>`
                texteCorr +=
                  'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
                texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texPrix(arrive)}}{${texPrix(depart)}} = ${texNombre(coeff, 2)}$<br>
                $t = ${texNombre(coeff, 2)}-1= ${taux}~\\%$`
                reponse = taux
              }
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '%',
                },
              )
              break
          }
          break
        case 'etablissement':
          // Le nombre d'élève doit être entier
          // Multiple de 50 et multiple de 2%
          // Multiple de 20 et multiple de 5%
          // Multiple de 100 et n%
          if (this.sup2) {
            ;[depart, taux] = valeursSansCalculatrice(
              typesDeSituations[i],
              listeTypeDeQuestions[i],
            )
          } else {
            switch (randint(1, 3)) {
              case 1:
                depart = 50 * randint(7, 24)
                taux = 2 * randint(1, 5) * choice([-1, 1])
                break
              case 2:
                depart = 20 * randint(17, 60)
                taux = 5 * randint(1, 3) * choice([-1, 1])
                break
              case 3:
              default:
                depart = 100 * randint(4, 12)
                taux = randint(1, 11) * choice([-1, 1])
                break
            }
          }
          tauxDec = taux / 100
          coeff = tauxDec + 1
          arrive = coeff * depart
          date = new Date()
          cetteAnnee = date.getFullYear()
          anneeDerniere = cetteAnnee - 1
          etablissement = choice(['collège', 'lycée'])
          switch (listeTypeDeQuestions[i]) {
            case 'finale':
              if (taux > 0) {
                texte = `Un ${etablissement} avait $${texNombre(depart, 0)}$ élèves en ${anneeDerniere}. Depuis, le nombre d'élèves a augmenté de $${taux}~\\%$.<br>
                 Calculer le nombre d'élèves dans ce ${etablissement} cette année.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texNombre(depart, 0)}\\times ${texNombre(coeff, 2)} = ${texNombre(arrive, 0)}$`
                texteCorr += `<br>Il y a maintenant $${miseEnEvidence(`${texNombre(arrive, 0)}`)}$ élèves dans ce ${etablissement}.`
                reponse = arrive
              } else {
                texte = `Un ${etablissement} avait $${texNombre(depart, 0)}$ élèves en ${anneeDerniere}. Depuis, le nombre d'élèves a diminué de $${abs(taux)}~\\%$. <br>
                Calculer le nombre d'élèves dans ce ${etablissement} cette année.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texNombre(depart, 0)}\\times ${texNombre(coeff, 2)} = ${texNombre(arrive, 0)}$`
                texteCorr += `<br>Il y a maintenant $${miseEnEvidence(`${texNombre(arrive, 0)}`)}$ élèves dans ce ${etablissement}.`
                reponse = arrive
              }
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: 'élèves',
                },
              )
              break
            case 'initiale':
              if (taux > 0) {
                texte = `Depuis ${anneeDerniere}, le nombre d'élèves d'un ${etablissement} a augmenté de $${taux}~\\%$. Il y a maintenant $${texNombre(arrive, 2)}$ élèves.<br>
                 Calculer le nombre d'élèves en ${anneeDerniere} dans cet établissement.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver le nombre initial d'élèves, on va donc diviser le nombre actuel d'élèves par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texNombre(arrive, 0)}}{${texNombre(coeff, 2)}} = ${texNombre(depart, 0)}$`
                texteCorr += `<br>En ${anneeDerniere}, il y avait $${miseEnEvidence(`${texNombre(depart, 0)}`)}$ élèves dans ce ${etablissement}.`
                reponse = depart
              } else {
                texte = `Depuis ${anneeDerniere}, le nombre d'élèves d'un ${etablissement} a diminué de $${abs(taux)}~\\%$. Il y a maintenant $${texNombre(arrive, 2)}$ élèves.<br>
                 Calculer le nombre d'élèves en ${anneeDerniere} dans cet établissement.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$..<br>Pour retrouver le nombre initial d'élèves, on va donc diviser le nombre actuel d'élèves par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texNombre(arrive, 0)}}{${texNombre(coeff, 2)}} = ${texNombre(depart, 0)}$`
                texteCorr += `<br>En ${anneeDerniere}, il y avait $${miseEnEvidence(`${texNombre(depart, 0)}`)}$ élèves dans ce ${etablissement}.`
                reponse = depart
              }
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: 'élèves',
                },
              )
              break
            case 'evolution':
            default:
              texte = `En ${anneeDerniere}, il y avait $${texNombre(depart, 0)}$ élèves dans un ${etablissement}. En ${cetteAnnee}, ils sont $${texNombre(arrive, 2)}$. <br>
              Déterminer le taux d'évolution du nombre d'élèves de cet établissement en pourcentage.`
              if (taux > 0) {
                texteCorr =
                  "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
                texteCorr += `<br><br>Ici : $t=\\dfrac{${texNombre(arrive, 2)}-${texNombre(depart, 0)}}{${texPrix(depart)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
                texteCorr += `<br>Le nombre d'élèves a donc augmenté de $${miseEnEvidence(`${taux}`)}~\\%$.<br><br>`
                texteCorr +=
                  'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
                texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texNombre(arrive, 2)}}{${texNombre(depart, 2)}} = ${texNombre(coeff, 2)}$<br>
                $t = ${texNombre(coeff, 2)}-1= ${taux}~\\%$`
                reponse = taux
              } else {
                texteCorr =
                  "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
                texteCorr += `<br><br>Ici : $t=\\dfrac{${texNombre(arrive, 2)}-${texNombre(depart, 0)}}{${texPrix(depart)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
                texteCorr += `<br>Le taux d'évolution est $${miseEnEvidence(taux)}~\\%$.<br><br>`
                texteCorr +=
                  'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
                texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texNombre(arrive, 2)}}{${texNombre(depart, 2)}} = ${texNombre(coeff, 2)}$<br>
                $t = ${texNombre(coeff, 2)}-1= ${taux}~\\%$`
                reponse = taux
              }
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '%',
                },
              )
              break
          }
          break
        case 'facture': {
          if (this.sup2) {
            ;[depart, taux] = valeursSansCalculatrice(
              typesDeSituations[i],
              listeTypeDeQuestions[i],
            )
          } else {
            depart = randint(700, 1400)
            taux = randint(2, 30) * choice([-1, 1])
          }
          tauxDec = taux / 100
          coeff = tauxDec + 1
          arrive = coeff * depart
          facture = choice([
            "ma facture annuelle d'électricité",
            'ma facture annuelle de gaz',
            "ma taxe d'habitation",
            'mon ordinateur',
            'mon vélo électrique',
          ])
          const prixOuMontant =
            facture.substring(0, 2) === 'ma' ? 'montant' : 'prix'
          switch (listeTypeDeQuestions[i]) {
            case 'finale':
              if (taux > 0) {
                texte = `Le ${prixOuMontant} de ${facture} était de $${texPrix(depart)}$ € l'année dernière et il a augmenté de $${taux}~\\%$.<br>
                 Calculer son nouveau ${prixOuMontant}.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texPrix(depart)}\\times ${texNombre(coeff, 2)} = ${texPrix(arrive)}$`
                texteCorr += `<br>Le ${prixOuMontant} de ${facture} est maintenant de $${miseEnEvidence(`${texPrix(arrive)}`)}$ €.`
                reponse = arrive
              } else {
                texte = `Le ${prixOuMontant} de ${facture} était de $${texPrix(depart)}$ € l'année dernière et il a diminué de $${abs(taux)}~\\%$. <br>
                Calculer son nouveau ${prixOuMontant}.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texPrix(depart)}\\times ${texNombre(coeff, 2)} = ${texPrix(arrive)}$.`
                texteCorr += `<br>Le ${prixOuMontant} de ${facture} est maintenant de $${miseEnEvidence(`${texPrix(arrive)}`)}$ €.`
                reponse = arrive
              }
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '€',
                },
              )
              break
            case 'initiale':
              if (taux > 0) {
                texte = `Après une augmentation de $${taux}~\\%$ le ${prixOuMontant} de ${facture} est maintenant $${texPrix(arrive)}$ €.<br>
                 Calculer son ${prixOuMontant} avant l'augmentation.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver le ${prixOuMontant} initial, on va donc diviser le ${prixOuMontant} final par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texPrix(arrive)}}{${texNombre(coeff, 2)}} = ${texPrix(depart)}$`
                texteCorr += `<br>Avant l'augmentation le ${prixOuMontant} de ${facture} était de $${miseEnEvidence(`${texPrix(depart)}`)}$ €.`
                reponse = depart
              } else {
                texte = `Après une diminution de $${abs(taux)}~\\%$ ${facture} coûte maintenant $${texPrix(arrive)}$ €. <br>
                Calculer son ${prixOuMontant} avant la diminution.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver le ${prixOuMontant} initial, on va donc diviser le ${prixOuMontant} final par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texPrix(arrive)}}{${texNombre(coeff, 2)}} = ${texPrix(depart)}$.`
                texteCorr += `<br>Avant la diminution le ${prixOuMontant} de ${facture} était de $${miseEnEvidence(`${texPrix(depart)}`)}$ €.`
                reponse = depart
              }
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '€',
                },
              )
              break
            case 'evolution':
              if (taux > 0) {
                texte = `Le ${prixOuMontant} de ${facture} est passé de $${texPrix(depart)}$ € à $${texPrix(arrive)}$ €.<br>
                 Calculer le taux d'évolution du ${prixOuMontant} en pourcentage.`
                texteCorr =
                  "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
                texteCorr += `<br><br>Ici : $t=\\dfrac{${texPrix(arrive)}-${texPrix(depart)}}{${texPrix(depart)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
                texteCorr += `<br>Le taux d'évolution du ${prixOuMontant} est $${miseEnEvidence(taux)}~\\%$.<br><br>`
                texteCorr +=
                  'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
                texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texPrix(arrive)}}{${texPrix(depart)}} = ${texNombre(coeff, 2)}$<br>
                $t = ${texNombre(coeff, 2)}-1= ${taux}~\\%$`
                reponse = taux
              } else {
                texte = `Le ${prixOuMontant} de ${facture} est passé de $${texPrix(depart)}$ € à $${texPrix(arrive)}$ €. <br>
                Calculer le taux d'évolution du ${prixOuMontant} en pourcentage.`
                texteCorr =
                  "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
                texteCorr += `<br><br>Ici : $t=\\dfrac{${texPrix(arrive)}-${texPrix(depart)}}{${texPrix(depart)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
                texteCorr += `<br>Le taux d'évolution du ${prixOuMontant} est $${miseEnEvidence(taux)}~\\%$.<br><br>`
                texteCorr +=
                  'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
                texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texPrix(arrive)}}{${texPrix(depart)}} = ${texNombre(coeff, 2)}$<br>
                $t = ${texNombre(coeff, 2)}-1= ${taux}~\\%$`
                reponse = taux
              }
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '%',
                },
              )
              break
          }
          break
        }
        case 'population':
          if (this.sup2) {
            ;[depart, taux] = valeursSansCalculatrice(
              typesDeSituations[i],
              listeTypeDeQuestions[i],
            )
          } else {
            depart = choice([randint(11, 99) * 1000, randint(11, 99) * 10000])
            taux = randint(5, 35) * choice([-1, 1])
          }
          tauxDec = taux / 100
          coeff = tauxDec + 1
          arrive = coeff * depart
          nb = randint(5, 15)
          switch (listeTypeDeQuestions[i]) {
            case 'finale':
              if (taux > 0) {
                texte = `Il y a $${nb}$ ans, la population d'une ville était de $${texNombre(depart, 0)}$ habitants. Depuis, elle a augmenté de $${taux}~\\%$.<br>
                 Calculer le nombre d'habitants actuel de cette ville.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texNombre(depart, 0)}\\times ${texNombre(coeff, 2)} = ${texNombre(arrive, 2)}$`
                texteCorr += `<br>La population de cette ville est maintenant de $${miseEnEvidence(`${texNombre(arrive, 2)}`)}$ habitants.`
              } else {
                texte = `Il y a $${nb}$ ans, la population d'une ville était de $${texNombre(depart, 0)}$ habitants. Depuis, elle a diminué de $${abs(taux)}~\\%$.<br>
                 Calculer le nombre d'habitants actuel de cette ville.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texNombre(depart, 0)}\\times ${texNombre(coeff, 2)} = ${texNombre(arrive, 2)}$.`
                texteCorr += `<br>La population de cette ville est maintenant de $${miseEnEvidence(`${texNombre(arrive, 2)}`)}$ habitants.`
              }
              reponse = arrive
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: 'habitants',
                },
              )
              break
            case 'initiale':
              if (taux > 0) {
                texte = `En $${nb}$ ans, la population d'une ville a augmenté de $${taux}~\\%$. Il y a maintenant $${texNombre(arrive, 2)}$ habitants. <br>
                Calculer sa population d'il y a $${nb}$ ans.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver la population initiale, on va donc diviser le nombre d'habitants actuel par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texNombre(arrive, 2)}}{${texNombre(coeff, 2)}} = ${texNombre(depart, 0)}$`
                texteCorr += `<br>Il y a $${nb}$ ans cette ville comptait $${miseEnEvidence(`${texNombre(depart, 0)}`)}$ habitants.`
              } else {
                texte = `En $${nb}$ ans, la population d'une ville a diminué de $${abs(taux)}~\\%$. Il y a maintenant $${texNombre(arrive, 2)}$ habitants.<br>
                 Calculer sa population d'il y a $${nb}$ ans.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver la population initiale, on va donc diviser le nombre d'habitants actuel par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texNombre(arrive, 2)}}{${texNombre(coeff, 2)}} = ${texNombre(depart, 0)}$.`
                texteCorr += `<br>Il y a $${nb}$ ans cette ville comptait $${miseEnEvidence(`${texNombre(depart, 0)}`)}$ habitants.`
              }
              reponse = depart
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: 'habitants',
                },
              )
              break
            case 'evolution':
              if (taux > 0) {
                texte = `En $${nb}$ ans, la population d'une ville est passée de $${texNombre(depart, 0)}$ à $${texNombre(arrive, 2)}$ habitants.<br>
                 Calculer le taux d'évolution de la population de cette ville en pourcentage.`
                texteCorr =
                  "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
                texteCorr += `<br><br>Ici : $t=\\dfrac{${texNombre(arrive, 2)}-${texNombre(depart, 0)}}{${texPrix(depart)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
                texteCorr += `<br>Le taux d'évolution de la population est $${miseEnEvidence(taux)}~\\%$.<br><br>`
                texteCorr +=
                  'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
                texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texNombre(arrive, 2)}}{${texNombre(depart, 2)}} = ${texNombre(coeff, 2)}$<br>
                $t = ${texNombre(coeff, 2)}-1= ${taux}~\\%$`
              } else {
                texte = `En $${nb}$ ans, la population d'une ville est passée de $${texNombre(depart, 0)}$ à $${texNombre(arrive, 2)}$ habitants. <br>
                Calculer le taux d'évolution de la population de cette ville en pourcentage.`
                texteCorr =
                  "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
                texteCorr += `<br><br>Ici : $t=\\dfrac{${texNombre(arrive, 2)}-${texNombre(depart, 0)}}{${texPrix(depart)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
                texteCorr += `<br>Le taux d'évolution de la population est $${miseEnEvidence(taux)}~\\%$.<br><br>`
                texteCorr +=
                  'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
                texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texNombre(arrive, 2)}}{${texNombre(depart, 2)}} = ${texNombre(coeff, 2)}$<br>
                $t = ${texNombre(coeff, 2)}-1= ${taux}~\\%$`
              }
              reponse = taux
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '%',
                },
              )
              break
          }
          break

        case 'chiffreAffaires': {
          // Chiffre d'affaires entre 50k€ et 500k€
          if (this.sup2) {
            ;[depart, taux] = valeursSansCalculatrice(
              typesDeSituations[i],
              listeTypeDeQuestions[i],
            )
          } else {
            switch (randint(1, 3)) {
              case 1:
                depart = randint(5, 20) * 10000 // 50k à 200k
                taux = randint(2, 8) * 5 * choice([-1, 1]) // -40% à +40% par pas de 10
                break
              case 2:
                depart = randint(20, 50) * 10000 // 200k à 500k
                taux = randint(1, 6) * 5 * choice([-1, 1]) // -30% à +30% par pas de 5
                break
              case 3:
              default:
                depart = randint(10, 30) * 10000 // 100k à 300k
                taux = randint(2, 12) * choice([-1, 1]) // -12% à +12%
                break
            }
          }
          tauxDec = taux / 100
          coeff = tauxDec + 1
          arrive = coeff * depart
          const annee1 = randint(2020, 2023)
          const annee2 = annee1 + 1
          const entreprise = choice([
            'une entreprise',
            'une PME',
            'un commerce',
            'une start-up',
            'un restaurant',
          ])

          switch (listeTypeDeQuestions[i]) {
            case 'finale':
              if (taux > 0) {
                texte = `En ${annee1}, le chiffre d'affaires d'${entreprise} était de $${texNombre(depart, 0)}$ €. En ${annee2}, il a augmenté de $${taux}~\\%$.<br>
         Calculer le chiffre d'affaires de ${annee2}.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texNombre(depart, 0)}\\times ${texNombre(coeff, 2)} = ${texNombre(arrive, 2)}$`
                texteCorr += `<br>Le chiffre d'affaires en ${annee2} est de $${miseEnEvidence(`${texNombre(arrive, 2)}`)}$ €.`
              } else {
                texte = `En ${annee1}, le chiffre d'affaires d'${entreprise} était de $${texNombre(depart, 0)}$ €. En ${annee2}, il a diminué de $${abs(taux)}~\\%$.<br>
         Calculer le chiffre d'affaires de ${annee2}.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texNombre(depart, 0)}\\times ${texNombre(coeff, 2)} = ${texNombre(arrive, 2)}$`
                texteCorr += `<br>Le chiffre d'affaires en ${annee2} est de $${miseEnEvidence(`${texNombre(arrive, 2)}`)}$ €.`
              }
              reponse = arrive
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '€',
                },
              )
              break

            case 'initiale':
              if (taux > 0) {
                texte = `Après une augmentation de $${taux}~\\%$, le chiffre d'affaires d'${entreprise} est de $${texNombre(arrive, 2)}$ € en ${annee2}.<br>
         Calculer le chiffre d'affaires de ${annee1}.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver le chiffre d'affaires initial, on va donc diviser le chiffre d'affaires final par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texNombre(arrive, 2)}}{${texNombre(coeff, 2)}} = ${texNombre(depart, 0)}$`
                texteCorr += `<br>Le chiffre d'affaires en ${annee1} était de $${miseEnEvidence(`${texNombre(depart, 0)}`)}$ €.`
              } else {
                texte = `Après une diminution de $${abs(taux)}~\\%$, le chiffre d'affaires d'${entreprise} est de $${texNombre(arrive, 2)}$ € en ${annee2}.<br>
         Calculer le chiffre d'affaires de ${annee1}.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver le chiffre d'affaires initial, on va donc diviser le chiffre d'affaires final par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texNombre(arrive, 2)}}{${texNombre(coeff, 2)}} = ${texNombre(depart, 0)}$`
                texteCorr += `<br>Le chiffre d'affaires en ${annee1} était de $${miseEnEvidence(`${texNombre(depart, 0)}`)}$ €.`
              }
              reponse = depart
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '€',
                },
              )
              break

            case 'evolution':
            default:
              texte = `Le chiffre d'affaires d'${entreprise} est passé de $${texNombre(depart, 0)}$ € en ${annee1} à $${texNombre(arrive, 2)}$ € en ${annee2}.<br>
       Calculer le taux d'évolution du chiffre d'affaires en pourcentage.`
              texteCorr =
                "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
              texteCorr += `<br><br>Ici : $t=\\dfrac{${texNombre(arrive, 2)}-${texNombre(depart, 0)}}{${texNombre(depart, 0)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
              texteCorr += `<br>Le taux d'évolution du chiffre d'affaires est $${miseEnEvidence(taux)}~\\%$.<br><br>`
              texteCorr +=
                'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
              texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texNombre(arrive, 2)}}{${texNombre(depart, 2)}} = ${texNombre(coeff, 2)}$<br>
      $t = ${texNombre(coeff, 2)}-1= ${taux}~\\%$`
              reponse = taux
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '%',
                },
              )
              break
          }
          break
        }

        case 'abonnement':
        default: {
          // Prix d'abonnement entre 5€ et 50€
          if (this.sup2) {
            ;[depart, taux] = valeursSansCalculatrice(
              typesDeSituations[i],
              listeTypeDeQuestions[i],
            )
          } else {
            switch (randint(1, 3)) {
              case 1:
                depart = randint(5, 15) // 5€ à 15€
                taux = randint(1, 6) * 5 * choice([-1, 1]) // -30% à +30% par pas de 5
                break
              case 2:
                depart = randint(10, 30) // 10€ à 30€
                taux = randint(2, 10) * choice([-1, 1]) // -10% à +10%
                break
              case 3:
              default:
                depart = randint(20, 50) // 20€ à 50€
                taux = randint(1, 4) * 5 * choice([-1, 1]) // -20% à +20% par pas de 5
                break
            }
          }
          tauxDec = taux / 100
          coeff = tauxDec + 1
          arrive = coeff * depart
          const typeAbonnement = choice([
            'un abonnement de streaming',
            'un abonnement téléphonique',
            'un abonnement Internet',
            'un abonnement de transport',
          ])
          const periode = choice(['mensuel', 'mensuel', 'trimestriel'])

          switch (listeTypeDeQuestions[i]) {
            case 'finale':
              if (taux > 0) {
                texte = `Le prix ${periode} d'${typeAbonnement} était de $${texPrix(depart)}$ € et il a augmenté de $${taux}~\\%$.<br>
         Calculer son nouveau prix.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texPrix(depart)}\\times ${texNombre(coeff, 2)} = ${texPrix(arrive)}$`
                texteCorr += `<br>Le nouveau prix de l'abonnement est $${miseEnEvidence(`${texPrix(arrive)}`)}$ €.`
              } else {
                texte = `Le prix ${periode} d'${typeAbonnement} était de $${texPrix(depart)}$ € et il a diminué de $${abs(taux)}~\\%$.<br>
         Calculer son nouveau prix.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$${texPrix(depart)}\\times ${texNombre(coeff, 2)} = ${texPrix(arrive)}$`
                texteCorr += `<br>Le nouveau prix de l'abonnement est $${miseEnEvidence(`${texPrix(arrive)}`)}$ €.`
              }
              reponse = arrive
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '€',
                },
              )
              break

            case 'initiale':
              if (taux > 0) {
                texte = `Après une augmentation de $${taux}~\\%$, le prix ${periode} d'${typeAbonnement} est maintenant de $${texPrix(arrive)}$ €.<br>
         Calculer son prix avant l'augmentation.`
                texteCorr = `Augmenter de $${taux}~\\%$ revient à multiplier par $1 + \\dfrac{${taux}}{100} = 1+ ${texNombre(tauxDec, 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver le prix initial, on va donc diviser le prix final par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texPrix(arrive)}}{${texNombre(coeff, 2)}} = ${texPrix(depart)}$`
                texteCorr += `<br>Avant l'augmentation, l'abonnement coûtait $${miseEnEvidence(`${texPrix(depart)}`)}$ €.`
              } else {
                texte = `Après une diminution de $${abs(taux)}~\\%$, le prix ${periode} d'${typeAbonnement} est maintenant de $${texPrix(arrive)}$ €.<br>
         Calculer son prix avant la diminution.`
                texteCorr = `Diminuer de $${abs(taux)}~\\%$ revient à multiplier par $1 - \\dfrac{${abs(taux)}}{100} = 1- ${texNombre(Math.abs(tauxDec), 2)} = ${texNombre(coeff, 2)}$.<br>Pour retrouver le prix initial, on va donc diviser le prix final par $${texNombre(coeff, 2)}$.`
                texteCorr += `<br>$\\dfrac{${texPrix(arrive)}}{${texNombre(coeff, 2)}} = ${texPrix(depart)}$`
                texteCorr += `<br>Avant la diminution, l'abonnement coûtait $${miseEnEvidence(`${texPrix(depart)}`)}$ €.`
              }
              reponse = depart
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '€',
                },
              )
              break

            case 'evolution':
            default:
              texte = `Le prix ${periode} d'${typeAbonnement} est passé de $${texPrix(depart)}$ € à $${texPrix(arrive)}$ €.<br>
       Calculer le taux d'évolution du prix en pourcentage.`
              texteCorr =
                "On utilise la formule du cours qui exprime le taux d'évolution $t$ en fonction de la valeur initiale $V_i$ et la valeur finale $V_f$ : $t=\\dfrac{V_f-V_i}{V_i}$."
              texteCorr += `<br><br>Ici : $t=\\dfrac{${texPrix(arrive)}-${texPrix(depart)}}{${texPrix(depart)}}=${texNombre(tauxDec, 2)}=\\dfrac{${taux}}{100}$.`
              texteCorr += `<br>Le taux d'évolution du prix est $${miseEnEvidence(taux)}~\\%$.<br><br>`
              texteCorr +=
                'Méthode $2$ : On arrive aussi au même résultat en passant par le coefficient multiplicateur : '
              texteCorr += `<br>$CM=\\dfrac{V_f}{V_i}=\\dfrac{${texPrix(arrive)}}{${texPrix(depart)}} = ${texNombre(coeff, 2)}$<br>
      $t = ${texNombre(coeff, 2)}-1= ${taux}~\\%$`
              reponse = taux
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: '<br>',
                  texteApres: '%',
                },
              )
              break
          }
          break
        }
      }
      if (this.sup2) {
        // Correction « Sans calculatrice » : démarche de calcul mental, puis la conclusion de la situation
        const type = listeTypeDeQuestions[i]
        const marque = miseEnEvidence(taux)
        const conclusion =
          type === 'evolution'
            ? '<br>' +
              (texteCorr
                .split('<br>')
                .find((ligne) => ligne.includes(marque)) ?? '')
            : texteCorr.slice(texteCorr.lastIndexOf('<br>'))
        texteCorr = correctionDeTete(type, depart, taux) + conclusion
      }
      handleAnswers(this, i, { reponse: { value: arrondi(reponse) } })
      if (this.interactif) texte += '<br><br>'
      if (this.questionJamaisPosee(i, depart, taux, typesDeSituations[i])) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
