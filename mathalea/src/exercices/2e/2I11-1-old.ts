// Copie figée : dépendance d'un exercice archivé, gelée pour que ses
// tirages ne bougent plus. Ne plus la modifier : toute correction va
// dans la version courante du fichier d'origine.
// Gelée à la révision d4a8a7c35 pour 5P1B-1.ts (dérive du 10/10/2026).
import { amcConvert } from '../../lib/amc/amcBuilders'
import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer une proportion ou appliquer un pourcentage'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '9/12/2021'
export const dateDeModifImportante = '28/04/2023' // ajout du cas entreprise
/**
 * Problèmes de proportions
 *
 * * Situations variées : spectacle, cadeau, réserve, entreprise
 *
 * * Déterminer l'effectif de la sous population
 * * Calculer une proportion
 * * Retrouver l'effectif de la population totale'
 * * Mélange des 3 types de problèmes
 * @author Florence Tapiero
 * * ajout de lignes pour l'export AMC par Jean-claude Lhote
 * 2I10-1
 * ajout du cas entreprise par Gilles Mora
 */
export const uuid = '13347'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

type Situation = 'spectacle' | 'cadeau' | 'réserve' | 'entreprise'
type TypeDeQuestion = 'sous-population' | 'proportion' | 'population-totale'

// Pourcentages qui permettent de retrouver facilement le total de tête (× 20, × 10, × 5, × 4, × 2)
const tauxFacilesPourLeTotal = [5, 10, 20, 25, 50]

/**
 * Tire un effectif total et un pourcentage simples, calculables sans calculatrice :
 * pourcentages usuels (10 %, 25 %, 50 %…) et effectifs « ronds » pour que la
 * sous-population soit entière et facile à obtenir de tête.
 * Pour retrouver la population totale, seuls les pourcentages les plus simples sont proposés.
 * @returns [effectif total, pourcentage]
 */
function valeursSansCalculatrice(
  situation: Situation,
  typeDeQuestion: TypeDeQuestion,
): [number, number] {
  const tauxPossibles = (liste: number[]) =>
    typeDeQuestion === 'population-totale'
      ? liste.filter((taux) => tauxFacilesPourLeTotal.includes(taux))
      : liste
  switch (situation) {
    case 'spectacle':
      return [
        100 * randint(2, 30),
        choice(tauxPossibles([5, 10, 20, 25, 30, 40, 50, 75])),
      ]
    case 'réserve':
      return [100 * randint(5, 30), choice([5, 10, 20, 25, 50])]
    case 'cadeau': {
      const taux = choice([10, 20, 25, 50])
      return [choice([20, 40, 60, 80, 100, 120, 160, 200]), taux]
    }
    case 'entreprise':
    default: {
      const taux = choice(tauxPossibles([2, 5, 10, 20, 25, 30, 40, 50]))
      const totale = choice(
        [50, 100, 150, 200, 250, 300, 400, 500].filter(
          (effectif) => (effectif * taux) % 100 === 0,
        ),
      )
      return [totale, taux]
    }
  }
}
const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b))

/**
 * Calcul mental de taux % de total, présenté étape par étape.
 * @returns [texte de la démarche, résultat]
 */
function pourcentageDeTete(taux: number, total: number): [string, number] {
  const resultat = (taux * total) / 100
  const t = texNombre(total, 0)
  const r = texNombre(resultat, 0)
  const pourcent = `$${taux}\\,\\%$`
  switch (taux) {
    case 50:
      return [
        `Prendre ${pourcent} d'une quantité, c'est en prendre la moitié : $${t} \\div 2 = ${r}$.`,
        resultat,
      ]
    case 25:
      return [
        `Prendre ${pourcent} d'une quantité, c'est en prendre le quart : $${t} \\div 4 = ${r}$.`,
        resultat,
      ]
    case 75: {
      const quart = texNombre(total / 4, 0)
      return [
        `Prendre ${pourcent} d'une quantité, c'est en prendre les trois quarts.<br>Le quart de $${t}$ est $${t} \\div 4 = ${quart}$, donc les trois quarts sont $${quart} \\times 3 = ${r}$.`,
        resultat,
      ]
    }
    case 10:
      return [
        `Prendre ${pourcent} d'une quantité, c'est la diviser par $10$, soit $${t} \\div 10 = ${r}$.`,
        resultat,
      ]
    case 5: {
      const dix = texNombre(total / 10, 0)
      return [
        `$10\\,\\%$ de $${t}$, c'est $${t} \\div 10 = ${dix}$.<br>${pourcent}, c'est la moitié de $10\\,\\%$ : $${dix} \\div 2 = ${r}$.`,
        resultat,
      ]
    }
    default: {
      if (taux % 10 === 0) {
        const dix = texNombre(total / 10, 0)
        return [
          `$10\\,\\%$ de $${t}$, c'est $${t} \\div 10 = ${dix}$.<br>${pourcent}, c'est $${taux / 10}$ fois plus : $${dix} \\times ${taux / 10} = ${r}$.`,
          resultat,
        ]
      }
      const un = texNombre(total / 100, 0)
      return [
        `$1\\,\\%$ de $${t}$, c'est $${t} \\div 100 = ${un}$.<br>${pourcent}, c'est $${taux}$ fois plus : $${un} \\times ${taux} = ${r}$.`,
        resultat,
      ]
    }
  }
}

/**
 * Démarche de calcul mental pour la correction « Sans calculatrice ».
 * Le résultat final est laissé à la phrase de conclusion de la situation.
 */
function correctionDeTete(
  typeDeQuestion: TypeDeQuestion,
  taux: number,
  total: number,
  sous: number,
  complement: boolean,
): string {
  switch (typeDeQuestion) {
    case 'sous-population': {
      const [demarche, resultat] = pourcentageDeTete(taux, total)
      if (!complement) return demarche
      return `${demarche}<br>Ce sont les personnes mineures ; les personnes majeures sont les autres : $${texNombre(total, 0)} - ${texNombre(resultat, 0)} = ${texNombre(total - resultat, 0)}$.`
    }
    case 'population-totale': {
      const facteur = 100 / taux
      const detail =
        taux === 5
          ? `, c'est-à-dire multiplier par $2$ puis par $10$, soit $${texNombre(sous, 0)} \\times 2 = ${texNombre(2 * sous, 0)}$ et $${texNombre(2 * sous, 0)} \\times 10 = ${texNombre(total, 0)}$`
          : `, soit $${texNombre(sous, 0)} \\times ${facteur} = ${texNombre(total, 0)}$`
      return `$${texNombre(sous, 0)}$ représente $${taux}\\,\\%$ du total. <br>Comme $${taux}\\,\\% \\times ${facteur} = 100\\,\\%$, il suffit de multiplier par $${facteur}$${detail}.`
    }
    case 'proportion':
    default: {
      const s = texNombre(sous, 0)
      const t = texNombre(total, 0)
      let calcul: string
      if (total === 100) {
        calcul = `$\\dfrac{${s}}{100}$`
      } else if (total % 100 === 0 && total / 100 <= 10) {
        const k = total / 100
        calcul = `$\\dfrac{${s}}{${t}} = \\dfrac{${s} \\div ${k}}{${t} \\div ${k}} = \\dfrac{${taux}}{100}$`
      } else if (100 % total === 0) {
        const k = 100 / total
        calcul = `$\\dfrac{${s}}{${t}} = \\dfrac{${s} \\times ${k}}{${t} \\times ${k}} = \\dfrac{${taux}}{100}$`
      } else {
        // On reconnaît d'abord une fraction simple, puis on se ramène à un dénominateur 100
        const d = pgcd(sous, total)
        const a = sous / d
        const b = total / d
        const k = 100 / b
        const dTex = texNombre(d, 0)
        calcul = `$\\dfrac{${s}}{${t}} = \\dfrac{${a} \\times ${dTex}}{${b} \\times ${dTex}} = \\dfrac{${a}}{${b}}`
        calcul +=
          k === 1
            ? '$'
            : ` = \\dfrac{${a} \\times ${k}}{${b} \\times ${k}} = \\dfrac{${taux}}{100}$`
      }
      return `La proportion est donnée par le quotient de l'effectif de la sous-population par l'effectif total.<br> On l'écrit sous la forme d'une fraction de dénominateur $100$ :<br>${calcul}.`
    }
  }
}

export default class ProportionsOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      "1 : Déterminer l'effectif d'une sous-population \n2 : Calculer une proportion en pourcentage\n3 : Calculer l'effectif de la population totale \n4 : Mélange",
    ]

    this.besoinFormulaire2CaseACocher = ['Sans calculatrice', false]

    this.nbQuestions = 2

    this.sup = 4 // type de questions mettre 4
    this.sup2 = false

    this.spacingCorr = 2
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles: TypeDeQuestion[] = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = ['sous-population']
    }
    if (this.sup === 2) {
      typesDeQuestionsDisponibles = ['proportion']
    }
    if (this.sup === 3) {
      typesDeQuestionsDisponibles = ['population-totale']
    }
    if (this.sup === 4) {
      typesDeQuestionsDisponibles = [
        'sous-population',
        'proportion',
        'population-totale',
      ]
    }
    if (typesDeQuestionsDisponibles.length === 0) {
      typesDeQuestionsDisponibles = [
        'sous-population',
        'proportion',
        'population-totale',
      ]
    }
    const situationsDisponibles: Situation[] = [
      'spectacle',
      'cadeau',
      'réserve',
      'entreprise',
    ] //
    // const situationsDisponibles = ['cadeau'] pour test de chaque situation
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    const typesDeSituations = combinaisonListes(
      situationsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    let prénom, espèces
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let totale: number
      let taux: number
      let p: number
      let sous: number
      let sous2: number
      let texte = ''
      let texteCorr = ''
      let reponse: number = 0
      let paramAMC
      let complement = false // question portant sur le complémentaire (personnes majeures)
      switch (typesDeSituations[i]) {
        case 'spectacle':
          // Le nombre de spectateurs doit être entier
          // Multiple de 50 et multiple de 2%
          // Multiple de 20 et multiple de 5%
          // Multiple de 100 et n%
          if (this.sup2) {
            ;[totale, taux] = valeursSansCalculatrice(
              'spectacle',
              listeTypeDeQuestions[i],
            )
          } else {
            switch (randint(1, 3)) {
              case 1:
                totale = 50 * randint(2, 60)
                taux = 2 * randint(3, 30)
                break
              case 2:
                totale = 20 * randint(5, 150)
                taux = 5 * randint(1, 16)
                break
              case 3:
              default:
                totale = 100 * randint(1, 30)
                taux = randint(10, 80)
                break
            }
          }
          p = taux / 100
          sous = p * totale
          sous2 = totale - sous
          switch (listeTypeDeQuestions[i]) {
            case 'sous-population':
              switch (randint(1, 2)) {
                case 1:
                  texte = `$${texNombre(totale, 0)}$ personnes assistent à un concert. $${taux}~\\%$ ont moins de $18$ ans. <br>Calculer le nombre de personnes mineures dans le public.`
                  texteCorr = `Pour appliquer une proportion à une valeur, on multiplie celle-ci par la proportion $p$. <br>Comme $${taux}~\\%$ des $${texNombre(totale, 0)}$ personnes sont mineures, le nombre de personnes mineures est donné par :`
                  texteCorr += `<br>$\\dfrac{${taux}}{100} \\times ${texNombre(totale, 0)} = ${texNombre(p, 2)} \\times ${texNombre(totale, 0)}=${texNombre(sous, 2)}$`
                  texteCorr += `<br>Il y a donc $${miseEnEvidence(texNombre(sous))}$ personnes mineures dans le public.`
                  reponse = arrondi(sous)
                  break
                case 2:
                  texte = `$${texNombre(totale, 0)}$ personnes assistent à un concert. $${taux}~\\%$ ont moins de $18$ ans. <br>Calculer le nombre de personnes majeures dans le public.`
                  complement = true
                  texteCorr = `On commence par déterminer la proportion de personnes majeures avec ce calcul : <br> $100-${taux}=${100 - taux}$.<br>`
                  texteCorr +=
                    'Pour appliquer une proportion à une valeur, on multiplie celle-ci par la proportion $p$.'
                  texteCorr += `<br>Comme $${100 - taux}~\\%$ des $${texNombre(totale, 0)}$ personnes sont majeures, le nombre de personnes majeures est donné par :`
                  texteCorr += `<br>$\\dfrac{${100 - taux}}{100} \\times ${texNombre(totale, 0)} = ${texNombre(1 - p, 4)} \\times ${texNombre(totale, 0)} = ${texNombre(sous2, 2)}$`
                  texteCorr += `<br>Il y a donc $${miseEnEvidence(texNombre(sous2, 2))}$ personnes majeures dans le public.`
                  reponse = arrondi(sous2)
                  break
              }
              paramAMC = { digits: 4, decimals: 0, signe: false, approx: 0 } // on mets 4 chiffres même si la plupart des réponses n'en ont que 3 pour ne pas contraindre les réponses
              break
            case 'population-totale':
              texte = `Lors d'un concert, il y a $${texNombre(sous, 2)}$ spectateurs de plus de $60$ ans, ce qui représente $${taux}~\\%$ du public. <br>Combien de spectateurs ont assisté au concert ?`
              texteCorr = `Soit $x$ le nombre total de spectateur. <br> Comme $${taux}~\\%$ de $x$ est égal à $${texNombre(sous, 2)}$, on a :`
              texteCorr += `<br>$\\begin{aligned}
              \\dfrac{${taux}}{100} \\times x &= ${texNombre(sous, 2)} \\\\\\
              ${texNombre(p, 2)} \\times x &= ${texNombre(sous, 2)} \\\\
              x &= \\dfrac{${texNombre(sous, 2)}}{${texNombre(p, 2)}} \\\\
              x &= ${texNombre(totale, 0)}
              \\end{aligned}$`
              texteCorr += `<br>Il y avait donc $${miseEnEvidence(texNombre(totale, 0))}$ spectateurs.`
              reponse = arrondi(totale)
              paramAMC = { digits: 4, decimals: 0, signe: false, approx: 0 } // Le nombre attendu a bien 4 chiffres maxi
              break
            case 'proportion':
            default:
              texte = `Parmi les $${texNombre(totale, 0)}$ spectateurs d'un concert, $${texNombre(sous, 2)}$ ont moins de $18$ ans. <br>Calculer la proportion des personnes mineures dans le public en pourcentage.`
              texteCorr = `La proportion $p$ est donnée par le quotient : $\\dfrac{${texNombre(sous, 2)}}{${texNombre(totale, 0)}} = ${texNombre(p, 2)}$.`
              texteCorr += `<br>$${texNombre(p, 2)}=\\dfrac{${texNombre(taux, 0)}}{100}$. Il y a donc $${miseEnEvidence(taux)}~\\%$ de personnes mineures dans le public.`
              reponse = arrondi(taux)
              paramAMC = { digits: 2, decimals: 0, signe: false, approx: 0 } // Le taux est ici inférieur à 100%
              break
          }
          break
        case 'cadeau':
          if (this.sup2) {
            ;[totale, taux] = valeursSansCalculatrice(
              'cadeau',
              listeTypeDeQuestions[i],
            )
          } else {
            switch (randint(1, 3)) {
              case 1:
                totale = 50 * randint(1, 3, 2)
                taux = 2 * randint(3, 17)
                break
              case 2:
                totale = 20 * randint(2, 8, 5)
                taux = 5 * randint(2, 7)
                break
              case 3:
              default:
                totale = 10 * randint(1, 15)
                taux = 10 * randint(1, 3)
                break
            }
          }
          p = taux / 100
          sous = p * totale
          sous2 = totale - sous
          prénom = choice([
            'Frédéric',
            'Brice',
            'Marion',
            'Christelle',
            'Léo',
            'Gabriel',
            'Maël',
            'Louise',
            'Lina',
            'Mia',
            'Rose',
            'Mohamed',
            'Mehdi',
            'Rayan',
            'Karim',
            'Yasmine',
            'Noûr',
            'Kaïs',
            'Louna',
            'Nora',
            'Fatima',
            'Nora',
            'Nadia',
            'Sohan',
            'Timothée',
            'Jamal',
          ])
          switch (listeTypeDeQuestions[i]) {
            case 'sous-population':
              texte = `Le cadeau commun que nous souhaitons faire à ${prénom} coûte $${texPrix(totale)}$ €. Je participe à hauteur de $${taux}~\\%$ du prix total. <br>Combien ai-je donné pour le cadeau de ${prénom} ?`
              texteCorr = `Pour appliquer une proportion à une valeur, on multiplie celle-ci par la proportion $p$. <br>Comme ma participation représente $${taux}~\\%$ de $${texPrix(totale)}$, j'ai donné :`
              texteCorr += `<br>$\\dfrac{${taux}}{100} \\times ${texNombre(totale, 0)} = ${texNombre(p, 2)} \\times ${texNombre(totale, 0)}=${texNombre(sous, 2)}$`
              texteCorr += `<br>Ma participation au cadeau est de $${miseEnEvidence(texPrix(sous))}$ €.`
              reponse = arrondi(sous)
              paramAMC = { digits: 3, decimals: 0, signe: false, approx: 0 } // la participation n'a que 2 chiffres mais on ne contraint pas la réponse
              break
            case 'population-totale':
              texte = `Pour le cadeau de ${prénom}, j'ai donné $${texPrix(sous)}$ €. Cela représente $${taux}~\\%$ du prix total du cadeau. <br>Quel est le montant du cadeau ?`
              texteCorr = `Soit $x$ le montant du cadeau. <br> Comme $${taux}~\\%$ de $x$ est égal à $${texPrix(sous)}$, on a :`
              texteCorr += `<br>$\\begin{aligned}
              \\dfrac{${taux}}{100} \\times x &= ${texNombre(sous)} \\\\\\
              ${texNombre(p, 2)} \\times x &= ${texNombre(sous)} \\\\
              x &= \\dfrac{${texNombre(sous)}}{${texNombre(p, 2)}} \\\\
              x &= ${texPrix(totale)}
              \\end{aligned}$`
              texteCorr += `<br>Le cadeau coûte $${miseEnEvidence(texPrix(totale))}$ €.`
              reponse = arrondi(totale)
              paramAMC = { digits: 3, decimals: 0, signe: false, approx: 0 }
              break
            case 'proportion':
            default:
              texte = `Le cadeau commun que nous souhaitons faire à ${prénom} coûte $${texPrix(totale)}$ €. Je participe à hauteur de $${texPrix(sous)}$ €. <br>Calculer la proportion en pourcentage de ma participation sur le prix total du cadeau.`
              texteCorr = `La proportion $p$ est donnée par le quotient : $\\dfrac{${texPrix(sous)}}{${texPrix(totale)}} = ${texNombre(p, 2)}$.`
              texteCorr += `<br>$${texNombre(p, 2)}=\\dfrac{${texNombre(taux, 0)}}{100}$. J'ai donc donné $${miseEnEvidence(taux)}~\\%$ du montant total du cadeau.`
              reponse = arrondi(taux)
              paramAMC = { digits: 2, decimals: 0, signe: false, approx: 0 } // Le taux est ici inférieur à 100%
              break
          }
          break
        case 'réserve':
          if (this.sup2) {
            ;[totale, taux] = valeursSansCalculatrice(
              'réserve',
              listeTypeDeQuestions[i],
            )
          } else {
            switch (randint(1, 3)) {
              case 1:
                totale = 50 * randint(10, 60)
                taux = 2 * randint(3, 20)
                break
              case 2:
                totale = 20 * randint(25, 150)
                taux = 5 * randint(1, 9)
                break
              case 3:
              default:
                totale = 100 * randint(5, 30)
                taux = randint(8, 40)
                break
            }
          }
          p = taux / 100
          sous = p * totale
          sous2 = totale - sous
          // espèce = choice(['pic noir', 'pipit farlouse', 'bruant des roseaux']) au singulier, inutile à priori
          espèces = choice([
            'pics noirs',
            'pipits farlouse',
            'bruants des roseaux',
          ])
          switch (listeTypeDeQuestions[i]) {
            case 'sous-population':
              texte = `Une réserve de protection d'oiseaux contient $${texNombre(totale, 0)}$ individus d'oiseaux. On dénombre $${taux}~\\%$ de ${espèces}.<br>Quel est le nombre de ${espèces} ?`
              texteCorr = `Pour appliquer une proportion à une valeur, on multiplie celle-ci par la proportion $p$. <br>Comme les ${espèces} représentent $${taux}~\\%$ de $${texNombre(totale, 0)}$, leur nombre est donné par :`
              texteCorr += `<br>$\\dfrac{${taux}}{100} \\times ${texNombre(totale, 0)} = ${texNombre(p, 2)} \\times ${texNombre(totale, 0)}=${texNombre(sous, 2)}$`
              texteCorr += `<br>Il y a $${miseEnEvidence(texNombre(sous, 2))}$ ${espèces} dans la réserve.`
              reponse = arrondi(sous)
              paramAMC = { digits: 4, decimals: 0, signe: false, approx: 0 } // on mets 4 chiffres même si la plupart des réponses n'en ont que 3 pour ne pas contraindre les réponses

              break
            case 'population-totale':
              texte = `Dans une réserve de protection d'oiseaux, il y a $${texNombre(sous, 2)}$ ${espèces}, ce qui représente $${taux}~\\%$ du nombre total d'oiseaux. <br>Quel est le nombre d'oiseaux de cette réserve ?`
              texteCorr = `Soit $x$ le nombre d'oiseaux. <br> Comme $${taux}~\\%$ de $x$ est égal à $${texNombre(sous, 2)}$, on a :`
              texteCorr += `<br>$\\begin{aligned}
                \\dfrac{${taux}}{100} \\times x &= ${texNombre(sous, 2)} \\\\\\
                ${texNombre(p, 2)} \\times x &= ${texNombre(sous, 2)} \\\\
                x &= \\dfrac{${texNombre(sous, 2)}}{${texNombre(p, 2)}} \\\\
                x &= ${texNombre(totale, 0)}
                \\end{aligned}$`
              texteCorr += `<br>Il y a $${miseEnEvidence(texNombre(totale, 0))}$ oiseaux dans la réserve.`
              reponse = arrondi(totale)
              paramAMC = { digits: 4, decimals: 0, signe: false, approx: 0 } // population à 4 chiffres (souvent)

              break
            case 'proportion':
            default:
              texte = `Une réserve de protection d'oiseaux contient $${texNombre(totale, 0)}$ individus d'oiseaux. On dénombre $${texNombre(sous, 2)}$ ${espèces}. <br>Calculer la proportion en pourcentage de ${espèces} dans la réserve.`
              texteCorr = `La proportion $p$ est donnée par le quotient : $\\dfrac{${texNombre(sous, 2)}}{${texNombre(totale, 0)}} = ${texNombre(p, 2)}$.`
              texteCorr += `<br>$${texNombre(p, 2)}=\\dfrac{${texNombre(taux, 0)}}{100}$. Le pourcentage de ${espèces} dans la réserve est donc de $${miseEnEvidence(taux)}~\\%$.`
              reponse = arrondi(taux)
              paramAMC = { digits: 2, decimals: 0, signe: false, approx: 0 } // Le taux est ici inférieur à 100%
              break
          }
          break

        case 'entreprise':
        default:
          if (this.sup2) {
            ;[totale, taux] = valeursSansCalculatrice(
              'entreprise',
              listeTypeDeQuestions[i],
            )
          } else {
            switch (randint(1, 3)) {
              case 1:
                totale = 50 * randint(1, 9, 2)
                taux = 2 * randint(3, 17)
                break
              case 2:
                totale = 50 * randint(1, 9, 2)
                taux = 2 * randint(3, 29)
                break
              case 3:
              default:
                totale = 10 * randint(3, 25)
                taux = 10 * randint(1, 4)
                break
            }
          }
          p = taux / 100
          sous = p * totale
          sous2 = totale - sous
          switch (listeTypeDeQuestions[i]) {
            case 'sous-population':
              texte = `Dans une entreprise de $${texNombre(totale, 0)}$ salariés, il y a  $${taux}\\,\\%$ de cadres. <br>Combien y a-t-il de cadres dans cette entreprise ?`
              texteCorr = `Pour appliquer une proportion à une valeur, on multiplie celle-ci par la proportion $p$. <br>Comme il y a  $${taux}\\,\\%$ des $${texNombre(totale, 0)}$ salariés qui sont cadres, le nombre de cadres est donné par :`
              texteCorr += `<br>$\\dfrac{${taux}}{100} \\times ${texNombre(totale, 0)} = ${texNombre(p, 2)} \\times ${texNombre(totale, 0)}=${texNombre(sous, 2)}$`
              texteCorr += `<br>Il y a donc  $${miseEnEvidence(texNombre(sous))}$  cadres dans cette entreprise.`
              reponse = arrondi(sous)
              paramAMC = { digits: 3, decimals: 0, signe: false, approx: 0 } // la participation n'a que 2 chiffres mais on ne contraint pas la réponse
              break
            case 'population-totale':
              texte = `Dans un entreprise, il y a  $${texNombre(sous)}$ cadres. Ils  représentent $${taux}\\,\\%$ du nombre total de salariés. <br>Quel est le nombre total de salariés dans cette entreprise ?`
              texteCorr = `Soit $n$ le nombre total de salariés dans l'entreprise. <br> Comme $${taux}\\,\\%$ de $n$ est égal à $${texNombre(sous)}$, on a :`
              texteCorr += `<br>$\\begin{aligned}
                \\dfrac{${taux}}{100} \\times n &= ${texNombre(sous)} \\\\\\
                ${texNombre(p, 2)} \\times n &= ${texNombre(sous)} \\\\
                n &= \\dfrac{${texNombre(sous, 2)}}{${texNombre(p, 2)}} \\\\
                n &= ${texNombre(totale, 2)}
                \\end{aligned}$`
              texteCorr += `<br>Le nombre total de salariés dans l'entreprise est $${miseEnEvidence(texNombre(totale))}$.`
              reponse = arrondi(totale)
              paramAMC = { digits: 3, decimals: 0, signe: false, approx: 0 }
              break
            case 'proportion':
            default:
              texte = `Dans une entreprise, il y a $${texNombre(totale)}$ salariés au total. Parmi eux, on dénombre  $${texNombre(sous)}$ cadres. <br>Calculer la proportion en pourcentage de cadres dans cette entreprise.`
              texteCorr = `La proportion $p$ est donnée par le quotient : $\\dfrac{${texNombre(sous)}}{${texNombre(totale)}} = ${texNombre(p, 2)}$.`
              texteCorr += `<br>$${texNombre(p, 2)}=\\dfrac{${texNombre(taux, 0)}}{100}$. Il y a donc $${miseEnEvidence(taux)}\\,\\%$ de cadres dans cette entreprise.`
              reponse = arrondi(taux)
              paramAMC = { digits: 2, decimals: 0, signe: false, approx: 0 }
              break
          }
          break
      }
      if (this.sup2) {
        // Correction « Sans calculatrice » : démarche de calcul mental, puis la conclusion de la situation
        let conclusion = texteCorr.slice(texteCorr.lastIndexOf('<br>'))
        if (listeTypeDeQuestions[i] === 'proportion') {
          conclusion = conclusion.replace(/^<br>\$[^$]*\$\. /, '<br>')
        }
        texteCorr =
          correctionDeTete(
            listeTypeDeQuestions[i],
            taux,
            totale,
            sous,
            complement,
          ) + conclusion
      }
      handleAnswers(this, i, { reponse: { value: reponse.toString() } })
      if (context.isAmc) {
        if (!Array.isArray(this.autoCorrectionAMC)) {
          this.autoCorrectionAMC = []
        }
        const interactiveEntry = this.autoCorrectionAMC[i] ?? {}
        const interactiveReponse = interactiveEntry.reponse ?? {}
        this.autoCorrectionAMC[i] = {
          ...interactiveEntry,
          reponse: {
            ...interactiveReponse,
            param: paramAMC,
          },
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (listeTypeDeQuestions[i] === 'proportion') {
        if (context.isAmc) {
          if (!Array.isArray(this.autoCorrectionAMC)) {
            this.autoCorrectionAMC = []
          }
          if (this.autoCorrectionAMC[i] == null) {
            this.autoCorrectionAMC[i] = {}
          }
          const entry = this.autoCorrectionAMC[i]
          if (entry.reponse == null) {
            entry.reponse = {}
          }
          entry.reponse.display = {
            labelPosition: 'left',
            label: '\\\\En \\% : ',
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
      }

      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteApres:
          listeTypeDeQuestions[i] === 'proportion'
            ? ' %'
            : typesDeSituations[i] === 'cadeau' &&
                listeTypeDeQuestions[i] !== 'proportion'
              ? '€'
              : '',
      })

      if (this.questionJamaisPosee(i, taux, totale, sous)) {
        // on utilise donc cette fonction basée sur les variables aléatoires pour éviter les doublons
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
