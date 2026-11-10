import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDansLaPartieEntiere,
  nombreDeChiffresDe,
  rangeMinMax,
} from '../../lib/outils/nombres'
import { deDevant, numAlpha, sp } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes de proportionnalité en utilisant la linéarité simple'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * On donne une relation de proportionnalité du type n objets coûtent x€ et on demande le prix de y objets
 * et le nombre d'objets qu'on peut acheter avec z€.
 * @author Jean-claude Lhote
 * 03/2021 : ajout de situations de proportionnalité : CGrolleau
 * 08/2021 : Ajout de la version simplifiée et de la possibilité de choisir le type de question : Guillaume Valmont
 * Relecture : Décembre 2021 par EE
 */

type QuestionReturn = {
  qtexte: string
  qtexteCorr: string
  incrementInteractif: number
  incrementAMC: number
}
let versionSimplifiee = false
let indexN: number = 0
const couplePremiersEntreEux: [number, number][] = [
  [3, 4],
  [3, 5],
  [3, 7],
  [6, 7],
  [3, 8],
  [7, 8],
  [7, 9],
  [3, 10],
  [7, 10],
  [9, 10],
  [3, 11],
  [6, 11],
  [7, 11],
  [9, 11],
  [7, 12],
  [9, 12],
  [11, 12],
  [3, 13],
  [6, 13],
  [7, 13],
  [9, 13],
  [11, 13],
  [12, 13],
] // Couples de nombres premiers entre eux

function questionAchat(exo: Exercice, i: number): QuestionReturn {
  // questions d'origine du 6P11 : achat.
  const listeDeLieux: string[] = [
    'dans un magasin de bricolage',
    'dans une animalerie',
    'au supermarché local',
    "à l'épicerie",
    'dans la boutique du musée',
  ]
  const listeDeChoses: string[][] = [[]]
  const listeDePrixUnit: number[][] = [[]]
  listeDeChoses[0] = [
    'articles',
    'outils',
    'accessoires',
    "pièces d'outillage",
    'pinceaux',
    'ampoules',
    'tournevis',
    'spatules',
    'raccords de tuyaux',
  ]
  listeDeChoses[1] = [
    'poissons rouges',
    'cannetons',
    'perruches',
    'phasmes',
    'colliers anti-puces',
    'souris',
    'lapereaux',
    'paquets de graines',
  ]
  listeDeChoses[2] = [
    'sets de tables',
    'verres',
    'assiettes',
    'os à macher',
    'dosettes de café',
    'packs de lait',
    'paquets de pâtes',
  ]
  listeDeChoses[3] = [
    'mangues',
    'ananas',
    'fruits de la passion',
    'melons',
    'paquets de madeleines de Commercy',
    'bergamottes',
    'bredeles',
    'pots de cancoillotte',
  ]
  listeDeChoses[4] = [
    'cartes',
    'livres',
    'gravures',
    'puzzles',
    'maquettes',
    'roches',
    'jeux de société',
  ]
  listeDePrixUnit[0] = [5, 4, 1.25, 3, 0.5, 1.5, 2, 6, 4.5]
  listeDePrixUnit[1] = [1.5, 7, 20, 2.5, 25, 2, 15, 8]
  listeDePrixUnit[2] = [1.25, 1.5, 2, 0.5, 5, 4.5, 3]
  listeDePrixUnit[3] = [2, 2.5, 1.25, 1.5, 4, 7, 12, 3]
  listeDePrixUnit[4] = [0.5, 5, 7, 13.5, 10, 15, 20]
  const index1 = randint(0, 4)
  const prenoms = [prenomF(), prenomM()]
  const index2 = randint(0, listeDeChoses[index1].length - 1)
  const objet = listeDeChoses[index1][index2]
  const pu =
    listeDePrixUnit[index1][index2] * (1 + randint(1, 2) * 0.2 * randint(-1, 1))
  let n, x, y
  if (versionSimplifiee) {
    n = couplePremiersEntreEux[indexN][0]
    x = couplePremiersEntreEux[indexN][1]
    y = n * randint(2, 5)
  } else {
    n = randint(3, 6)
    x = n * pu
    y = n * randint(2, 5)
  }
  let met = false
  let p = null
  let z
  do {
    p = n * randint(2, 5)
    if (p !== y) {
      met = true
    }
  } while (met === false)
  if (versionSimplifiee) {
    z = x * randint(2, 5)
  } else {
    z = p * pu
  }
  let enonceAMC1 =
    `${numAlpha(0)} ${prenoms[0]} a repéré, ${listeDeLieux[index1]}, des ${objet} qui l'intéressent. ` +
    `Elle lit que $${n}$ ${objet} coûtent $${texPrix(x)}$${sp()}€. `
  let texte = enonceAMC1
  enonceAMC1 += `Elle veut en acheter $${y}$.<br> Combien d'euros va-t-elle dépenser${sp()}? `
  texte += `Elle veut en acheter $${y}$.<br> Combien va-t-elle dépenser${sp()}? `
  texte += ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
    texteApres: `${sp()}€`,
  })
  let texteCorr =
    `${numAlpha(0)} $${y}$ ${objet}, c'est $${miseEnEvidence(
      texNombre(y / n),
    )}$ fois $${miseEnEvidence(
      texNombre(n),
      bleuMathalea,
    )}$ ${objet}.<br> Si $${miseEnEvidence(
      texNombre(n),
      bleuMathalea,
    )}$ ${objet} coûtent $${texPrix(x)}$${sp()}€, alors $${miseEnEvidence(
      texNombre(y / n),
    )}$ fois $${miseEnEvidence(
      texNombre(n),
      bleuMathalea,
    )}$ ${objet} coûtent $${miseEnEvidence(
      texNombre(y / n),
    )}$ fois $${texPrix(x)}$${sp()}€.<br>` +
    `$${miseEnEvidence(
      texNombre(y / n),
    )} \\times ${miseEnEvidence(`${texPrix(x)}`, bleuMathalea)}${sp()}$€ = $${texNombre((y * x) / n)}${sp()}$€<br>` +
    `Conclusion : ${prenoms[0]} dépensera $${miseEnEvidence(texPrix((y * x) / n))}$${sp()}€.` +
    '<br>'
  const enonceAMC2 = `${numAlpha(1)} ${
    prenoms[1]
  } veut lui aussi acheter ces ${objet}. Il dispose de $${texPrix(z)}$${sp()}€.<br> Combien peut-il en acheter${sp()}?<br>`
  texte +=
    '<br>' +
    enonceAMC2 +
    ajouteChampTexteMathLive(exo, i + 1, KeyboardType.clavierNumbers, {
      texteApres: ' ' + objet,
    })
  texteCorr += `${numAlpha(1)} $${texPrix(z)}$${sp()}€, c'est $${miseEnEvidence(
    texNombre(z / x),
  )}$ fois $${texPrix(x)}$${sp()}€.<br> Si avec $${texPrix(x)}$${sp()}€ on peut acheter $${miseEnEvidence(
    texNombre(n),
    bleuMathalea,
  )}$ ${objet}, alors avec $${miseEnEvidence(
    texNombre(z / x),
  )}$ fois $${texPrix(x)}$${sp()}€, on peut acheter $${miseEnEvidence(
    texNombre(z / x),
  )}$ fois $${miseEnEvidence(texNombre(n), bleuMathalea)}$ ${objet}.<br>`
  texteCorr += `$${miseEnEvidence(
    texNombre(z / x),
  )} \\times ${miseEnEvidence(texNombre(n), bleuMathalea)} = ${texNombre((z * n) / x)}$<br>`
  texteCorr +=
    `Conclusion : ${prenoms[1]} pourra acheter $${miseEnEvidence(texNombre((z * n) / x))}$ ${objet}.` +
    '<br>'
  if (!context.isAmc) {
    handleAnswers(
      exo,
      i,
      { reponse: { value: ((y * x) / n).toFixed(2) } },
      { formatInteractif: 'mathalea-mathfield' },
    )
    handleAnswers(
      exo,
      i + 1,
      { reponse: { value: ((z * n) / x).toFixed(2) } },
      { formatInteractif: 'mathalea-mathfield' },
    )
  } else {
    exo.autoCorrectionAMC[i] = {
      enonce: '',
      enonceAvant: false,
      options: { multicols: true, barreseparation: true },
      propositions: [
        {
          type: 'AMCNum',

          propositions: [
            {
              texte: texteCorr,
              statut: '',
              reponse: {
                texte: enonceAMC1,
                valeur: [arrondi((y * x) / n, 2)],
                param: {
                  digits: nombreDeChiffresDe(arrondi((y * x) / n, 2)),
                  decimals: nombreDeChiffresDansLaPartieDecimale(
                    arrondi((y * x) / n, 2),
                  ),
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
        {
          type: 'AMCNum',

          propositions: [
            {
              texte: '',
              statut: '',
              reponse: {
                texte: enonceAMC2,
                valeur: [arrondi((z * n) / x, 0)],
                param: {
                  digits: nombreDeChiffresDansLaPartieEntiere((z * n) / x, 0),
                  decimals: 0,
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
      ],
    }
    exo.questionsAMC[i] = amcConvert(exo.autoCorrectionAMC[i])
  }
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    incrementInteractif: 2,
    incrementAMC: 1,
  }
}

function questionRecette(exo: Exercice, i: number): QuestionReturn {
  // questions avec des masses pour un nombre de personne dans des recettes correction : passage à l'unité
  let texte, texteCorr
  const liste = [
    // liste des ingrédients avec différentes recettes associées et masses
    {
      ingredient: 'farine',
      recettes: ['gâteau au citron', 'gaufres', 'crêpes', 'cake'],
      quantites_par_pers: [20, 25, 30, 35, 40, 50], // A voir pour l'instant quantités "simples".
    },
    {
      ingredient: 'sucre',
      recettes: ['gâteau', 'mousse au chocolat', 'pain perdu', 'riz au lait'],
      quantites_par_pers: [15, 20, 25, 30, 35],
    },
    {
      ingredient: 'chocolat',
      recettes: ['gâteau', 'mousse au chocolat', 'flan', 'riz au lait'],
      quantites_par_pers: [10, 15, 20, 25, 30, 35],
    },
    {
      ingredient: 'beurre',
      recettes: ['gâteau', 'mousse au chocolat'],
      quantites_par_pers: [10, 12, 15, 18],
    },
  ]
  const nbPersonneInit = randint(2, 6) // nombre de personnes indiqué dans la recette.
  const alea4 = randint(2, 5)
  const nbPersonneFinal = nbPersonneInit * alea4 // nombre de personnes pour lequel on veut cuisiner
  const alea1 = randint(0, 3) // pour le choix de l'ingredient
  const alea2 = randint(0, liste[alea1].recettes.length - 1) // pour le choix de la recette
  const alea3 = randint(0, liste[alea1].quantites_par_pers.length - 1) // pour le choix de la quantité par personne.
  const quantite = liste[alea1].quantites_par_pers[alea3] * nbPersonneInit // Calcul de la quantité dans la recette à partir de la qtt/personne et du nb de personnes
  const quantite2 = quantite * randint(2, 5, [alea4])
  const quantiteReponse =
    liste[alea1].quantites_par_pers[alea3] * nbPersonneFinal // Pour la correction
  const prenoms = [prenomF(), prenomM()] // Choix de prénoms pour l'énoncé
  let enonceAMC1 =
    `${numAlpha(0)} ${prenoms[0]} lit sur sa recette de ${liste[alea1].recettes[alea2]} pour $${nbPersonneInit}$ personnes qu'il faut $${quantite}$${sp()}g de ${liste[alea1].ingredient}. ` +
    `Elle veut adapter sa recette pour $${nbPersonneFinal}$ personnes.`
  texte = enonceAMC1
  enonceAMC1 += `<br> Quelle masse, en${sp()}g, de ${liste[alea1].ingredient} doit-elle prévoir${sp()}? `
  texte += `<br> Quelle masse de ${liste[alea1].ingredient} doit-elle prévoir${sp()}? `
  texte += ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
    texteApres: ' g',
  })
  texteCorr =
    `${numAlpha(0)} $${nbPersonneFinal}$ personnes, c'est $${miseEnEvidence(texNombre(nbPersonneFinal / nbPersonneInit), bleuMathalea)}$ fois $${nbPersonneInit}$ personnes. ` +
    `Il faut donc $${miseEnEvidence(texNombre(nbPersonneFinal / nbPersonneInit), bleuMathalea)}$ fois plus de ${liste[alea1].ingredient}.<br>` +
    `$${quantite}$${sp()}g $\\times ${miseEnEvidence(texNombre(nbPersonneFinal / nbPersonneInit), bleuMathalea)} = ${quantiteReponse}$${sp()}g. <br>` +
    `Conclusion : ${prenoms[0]} doit utiliser $${miseEnEvidence(quantiteReponse)}${sp()}$g de ${liste[alea1].ingredient} pour $${nbPersonneFinal}$ personnes.<br>`
  const enonceAMC2 = `${numAlpha(1)} ${prenoms[1]} utilise la même recette de ${liste[alea1].recettes[alea2]}. Il dispose de $${quantite2}$${sp()}g de ${liste[alea1].ingredient}.
  Pour combien de personnes au maximum peut-il cuisiner${sp()}?`
  texte +=
    '<br> ' +
    enonceAMC2 +
    ajouteChampTexteMathLive(exo, i + 1, KeyboardType.clavierNumbers, {
      texteApres: ' personnes',
    })
  texteCorr +=
    `${numAlpha(1)} $${quantite2}$${sp()}g, c'est $${miseEnEvidence(texNombre(quantite2 / quantite), bleuMathalea)}$ fois $${quantite}$${sp()}g. ` +
    `${prenoms[1]} peut donc cuisiner pour $${miseEnEvidence(texNombre(quantite2 / quantite), bleuMathalea)}$ fois plus de personnes.<br>` +
    `$${nbPersonneInit}$${sp()}g $\\times ${miseEnEvidence(texNombre(quantite2 / quantite), bleuMathalea)} = ${(nbPersonneInit * quantite2) / quantite}$. <br>` +
    `Conclusion : ${prenoms[1]} peut donc préparer sa recette pour $${miseEnEvidence((nbPersonneInit * quantite2) / quantite)}$ personnes.`
  if (!context.isAmc) {
    handleAnswers(
      exo,
      i,
      { reponse: { value: quantiteReponse } },
      { formatInteractif: 'mathalea-mathfield' },
    )
    handleAnswers(
      exo,
      i + 1,
      {
        reponse: {
          value: ((nbPersonneInit * quantite2) / quantite).toFixed(3),
        },
      },
      { formatInteractif: 'mathalea-mathfield' },
    )
  } else {
    exo.autoCorrectionAMC[i] = {
      enonce: '',
      enonceAvant: false,
      options: { multicols: true, barreseparation: true },
      propositions: [
        {
          type: 'AMCNum',

          propositions: [
            {
              texte: texteCorr,
              statut: '',
              reponse: {
                texte: enonceAMC1,
                valeur: [quantiteReponse],
                param: {
                  digits: nombreDeChiffresDe(quantiteReponse),
                  decimals:
                    nombreDeChiffresDansLaPartieDecimale(quantiteReponse),
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
        {
          type: 'AMCNum',

          propositions: [
            {
              texte: '',
              statut: '',
              reponse: {
                texte: enonceAMC2,
                valeur: [Math.round((nbPersonneInit * quantite2) / quantite)],
                param: {
                  digits: nombreDeChiffresDansLaPartieEntiere(
                    (nbPersonneInit * quantite2) / quantite,
                  ),
                  decimals: 0,
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
      ],
    }
    exo.questionsAMC[i] = amcConvert(exo.autoCorrectionAMC[i])
  }
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    incrementInteractif: 2,
    incrementAMC: 1,
  }
}

function questionDistance(exo: Exercice, i: number): QuestionReturn {
  // questions de distance parcourue à une vitesse moyenne donnée
  let texte, texteCorr
  const liste = [
    // liste des "moyens de locomotion" et vitesses associées
    {
      locomotion: 'piéton',
      vitesse: [3, 3.5, 4, 4.5],
    },
    {
      locomotion: 'cycliste',
      vitesse: [12, 15, 16, 17, 18, 20, 22],
    },
    {
      locomotion: 'camion',
      vitesse: [75, 77.5, 80, 82.5, 85],
    },
    {
      locomotion: 'train',
      vitesse: [125, 150, 175, 185, 195],
    },
  ]
  const alea1 = randint(0, 3) // pour le choix de locomotion
  const duree = [
    {
      temps: '$15$ minutes',
      rapport: 0.25,
    },
    {
      temps: '$30$ minutes',
      rapport: 0.5,
    },
    {
      temps: '$45$ minutes',
      rapport: 0.75,
    },
    {
      temps: '$1$ heure et demie',
      rapport: 1.5,
    },
    {
      temps: '$2$ heures',
      rapport: 2,
    },
    {
      temps: '$2$ heures et demie',
      rapport: 2.5,
    },
    {
      temps: '$3$ heures',
      rapport: 3,
    },
  ]
  /* if (versionSimplifiee) {
    const alea1 = randint(0, 3) // pour le choix de locomotion
    let dureeQ, distance
    if (alea1 === 0) { // Si piéton
      const indice = randint(0, 3)
      dureeQ = couplePremiersEntreEux[indice][0]
      distance = couplePremiersEntreEux[indice][1] * (couplePremiersEntreEux[indice][0] + 1)
    } else {
      dureeQ = couplePremiersEntreEux[indexN][0]
      distance = couplePremiersEntreEux[indexN][1] * 2 * alea1 * alea1 * (couplePremiersEntreEux[indexN][0] + 1)
    }
    const dureeR = dureeQ * randint(2, 5)
    let enonceAMC = `Un ${liste[alea1].locomotion} parcourt en moyenne ${texNombre(distance)}${sp()}$\\text{km}$ en ${dureeQ} heures.`
    texte = enonceAMC
    enonceAMC += `<br> Quelle distance, en${sp()}$\\text{km}$, va-t-il parcourir, à la même vitesse en ${dureeR} heures${sp()}?`
    texte += `<br> Quelle distance va-t-il parcourir, à la même vitesse en ${dureeR} heures${sp()}?` + ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, { texteApres: ' $\\text{km}$' })
    texteCorr = `${miseEnEvidence(texNombre(dureeR))} heures, c'est ${miseEnEvidence(texNombre(dureeR / dureeQ))} fois ${dureeQ} heures.<br> ` +
            `Le ${liste[alea1].locomotion} parcourra donc ${miseEnEvidence(texNombre(dureeR / dureeQ))} fois plus de distance qu'en ${dureeQ} heures.<br>` +
            `${texNombre(distance)}${sp()}$\\text{km}$ $\\times $ ${miseEnEvidence(texNombre(dureeR / dureeQ))} = ${texNombre(distance * dureeR / dureeQ)}${sp()}$\\text{km}$.<br>` +
    `Conclusion : Le ${liste[alea1].locomotion} parcourra ${miseEnEvidence(texNombre(distance * dureeR / dureeQ))}${sp()}$\\text{km}$ à la même vitesse en ${dureeR} heures.`
    if (!context.isAmc) {
      handleAnswers(exo, i, {
        reponse: { value: (distance * dureeR / dureeQ).toFixed(3) },
      })
    } else {
      exo.autoCorrection[i] = {
        enonce: '',
        enonceAvant: false,
        propositions: [
          {
            type: 'AMCNum',

            propositions: [{
              texte: texteCorr,
              statut: '',
              reponse: {
                texte,
                valeur: [arrondi(distance * dureeR / dureeQ, 3)],
                param: {
                  digits: nombreDeChiffresDe(arrondi(distance * dureeR / dureeQ, 3)),
                  decimals: nombreDeChiffresDansLaPartieDecimale((distance * dureeR / dureeQ).toFixed(3)),
                  signe: false,
                  approx: 0
                }
              }
            }]
          }
        ]
      }
    }
  } else {
   */
  const alea2 = randint(0, liste[alea1].vitesse.length - 1) // pour le choix du temps passé
  const rapportQuestion2 = versionSimplifiee
    ? rangeMinMax(2, 5)
    : [0.25, 0.5, 0.75, 1.25, 1.5, 2]
  let alea3 = randint(0, rapportQuestion2.length - 1)
  while (duree[alea2].rapport === rapportQuestion2[alea3]) {
    alea3 = randint(0, rapportQuestion2.length - 1)
  }
  const reponseQ1 = duree[alea2].rapport * liste[alea1].vitesse[alea2]
  const distance = texNombre(
    rapportQuestion2[alea3] * liste[alea1].vitesse[alea2],
  ) // pour question 2
  let enonceAMC1 = `${numAlpha(0)} Un ${liste[alea1].locomotion} parcourt en moyenne $${texNombre(liste[alea1].vitesse[alea2])}\\text{ km}$ en une heure.<br>`
  texte = enonceAMC1
  enonceAMC1 += `Quelle distance, en${sp()}$\\text{km}$, va-t-il parcourir, à la même vitesse, en ${duree[alea2].temps}${sp()}? `
  texte += `Quelle distance va-t-il parcourir, à la même vitesse, en ${duree[alea2].temps}${sp()}? `
  texte += ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
    texteApres: ' $\\text{km}$',
  })
  texteCorr =
    `${numAlpha(0)} ${duree[alea2].temps}, c'est $${miseEnEvidence(texNombre(duree[alea2].rapport), bleuMathalea)}$ fois une heure.<br> ` +
    `En une heure, le ${liste[alea1].locomotion} parcourt $${miseEnEvidence(texNombre(liste[alea1].vitesse[alea2]), bleuMathalea)}\\text{ km}$ donc en ${duree[alea2].temps}, il va parcourir $${miseEnEvidence(texNombre(duree[alea2].rapport), bleuMathalea)}$ fois $${miseEnEvidence(texNombre(liste[alea1].vitesse[alea2]), bleuMathalea)}\\text{ km}$. <br>` +
    `$${miseEnEvidence(texNombre(duree[alea2].rapport), bleuMathalea)} \\times ${miseEnEvidence(texNombre(liste[alea1].vitesse[alea2]), bleuMathalea)}\\text{ km} = ${texNombre(reponseQ1)}\\text{ km}$ <br>` +
    ` Conclusion : Le ${liste[alea1].locomotion} va donc parcourir $${miseEnEvidence(texNombre(reponseQ1))}\\text{ km}$.` +
    '<br>'
  const enonceAMC2 = `${numAlpha(1)} Combien de temps, en minutes, va-t-il mettre pour parcourir $${distance}\\text{ km}$ à cette même vitesse${sp()}? `
  texte +=
    `<br> ${numAlpha(1)} Combien de temps va-t-il mettre pour parcourir $${distance}\\text{ km}$ à cette même vitesse${sp()}? ` +
    ajouteChampTexteMathLive(exo, i + 1, KeyboardType.clavierNumbers, {
      texteApres: ' minutes',
    })
  texteCorr +=
    `${numAlpha(1)} $${distance}\\text{ km}$, c'est $${miseEnEvidence(texNombre(rapportQuestion2[alea3]), bleuMathalea)}$ fois $${texNombre(liste[alea1].vitesse[alea2])}\\text{ km}$.
      Le ${liste[alea1].locomotion} parcourt $${texNombre(liste[alea1].vitesse[alea2])}\\text{ km}$ en une heure. <br>` +
    `Il va mettre donc $${miseEnEvidence(texNombre(rapportQuestion2[alea3]), bleuMathalea)}$ fois une heure à parcourir $${distance}\\text{ km}$. <br>` +
    `Conclusion : Le ${liste[alea1].locomotion} va donc mettre $${texNombre(rapportQuestion2[alea3])}$ heure${rapportQuestion2[alea3] >= 2 ? 's' : ''} à parcourir $${distance}\\text{ km}$, ce qui fait $${miseEnEvidence(rapportQuestion2[alea3] * 60)}$ minutes ($${texNombre(rapportQuestion2[alea3])} \\times 60$ minutes).`
  if (!context.isAmc) {
    handleAnswers(
      exo,
      i,
      { reponse: { value: reponseQ1 } },
      { formatInteractif: 'mathalea-mathfield' },
    )
    handleAnswers(
      exo,
      i + 1,
      { reponse: { value: (rapportQuestion2[alea3] * 60).toFixed(2) } },
      { formatInteractif: 'mathalea-mathfield' },
    )
  } else {
    exo.autoCorrectionAMC[i] = {
      enonce: '',
      enonceAvant: false,
      options: { multicols: true, barreseparation: true },
      propositions: [
        {
          type: 'AMCNum',

          propositions: [
            {
              texte: texteCorr,
              statut: '',
              reponse: {
                texte: enonceAMC1,
                valeur: [reponseQ1],
                param: {
                  digits: nombreDeChiffresDe(reponseQ1),
                  decimals: nombreDeChiffresDansLaPartieDecimale(reponseQ1),
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
        {
          type: 'AMCNum',

          propositions: [
            {
              texte: '',
              statut: '',
              reponse: {
                texte: enonceAMC2,
                valeur: [arrondi(rapportQuestion2[alea3] * 60, 2)],
                param: {
                  digits: nombreDeChiffresDe(
                    arrondi(rapportQuestion2[alea3] * 60, 2),
                  ),
                  decimals: nombreDeChiffresDansLaPartieDecimale(
                    arrondi(rapportQuestion2[alea3] * 60, 2),
                  ),
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
      ],
    }
    exo.questionsAMC[i] = amcConvert(exo.autoCorrectionAMC[i])
  }
  // }
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    incrementInteractif: 2,
    incrementAMC: 1,
  }
}

function questionEchelle(exo: Exercice, i: number): QuestionReturn {
  // X$\\text{ cm}$ sur une carte correspond à x $\\text{km}$ dans la réalité...
  let texte, texteCorr
  const distanceCarte = couplePremiersEntreEux[indexN][0] // Choix d'un nombre de$\\text{ cm}$ sur la carte
  const distanceReel = couplePremiersEntreEux[indexN][1] // Choix d'un nombre de $\\text{km}$ dans la réalité (on évite d'avoir 1cm pour 1$\\text{km}$)
  const rapport = [0.25, 0.5, 0.75, 1.25, 1.5, 2, 3, 4, 5] // rapport entre la référence et la question (rapports simples car niveau 6eme)
  const alea1 = randint(0, rapport.length - 1)
  const alea2 = randint(0, rapport.length - 1, [alea1])
  if (versionSimplifiee) {
    rapport[alea1] = randint(2, 5)
    rapport[alea2] = randint(2, 5, [rapport[alea1]])
  }
  const distanceCarte2 = texNombre(rapport[alea1] * distanceCarte, 2)
  const distanceReelQ2 = texNombre(rapport[alea2] * distanceReel, 2)
  const prenoms = [prenomF(), prenomM()]
  texte = `${numAlpha(0)} Sur une carte sur laquelle $${distanceCarte}\\text{ cm}$ représente $${distanceReel}\\text{ km}$ dans la réalité,
${prenoms[0]} mesure son trajet et elle trouve une distance de $${distanceCarte2}\\text{ cm}$. <br>`
  const enonceAMC1 =
    texte +
    `À quelle distance, en $\\text{km}$, cela correspond-il dans la réalité${sp()}?`
  texte +=
    `À quelle distance cela correspond-il dans la réalité${sp()}? ` +
    ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
      texteApres: ' $\\text{km}$',
    })
  texteCorr =
    `${numAlpha(0)} $${distanceCarte2}\\text{ cm}$, c'est $${miseEnEvidence(texNombre(rapport[alea1]), bleuMathalea)}$ fois $${distanceCarte}\\text{ cm}$. <br>
Dans la réalité, $${distanceCarte}\\text{ cm}$ correspond à $${miseEnEvidence(texNombre(distanceReel), bleuMathalea)}\\text{ km}$ donc` +
    ` $${distanceCarte2}\\text{ cm}$ va correspondre à $${miseEnEvidence(texNombre(rapport[alea1]), bleuMathalea)}$ fois $${miseEnEvidence(texNombre(distanceReel), bleuMathalea)}\\text{ km}$. <br>` +
    `$${miseEnEvidence(texNombre(rapport[alea1]), bleuMathalea)} \\times ${miseEnEvidence(texNombre(distanceReel), bleuMathalea)}\\text{ km} = ${texNombre(rapport[alea1] * distanceReel, 2)}\\text{ km}$ <br>` +
    `Conclusion : Le trajet ${deDevant(prenoms[0])} est de $${miseEnEvidence(texNombre(rapport[alea1] * distanceReel, 2))}\\text{ km}$.<br>`
  let enonceAMC2 = `${numAlpha(1)} Deux villes sont distantes de $${distanceReelQ2}\\text{ km}$. `
  texte += '<br> ' + enonceAMC2
  enonceAMC2 += `Quelle distance, en $\\text{cm}$, va-t-on mesurer sur la carte entre ces deux villes${sp()}?`
  texte +=
    `Quelle distance va-t-on mesurer sur la carte entre ces deux villes${sp()}?` +
    ajouteChampTexteMathLive(exo, i + 1, KeyboardType.clavierNumbers, {
      texteApres: '$\\text{ cm}$',
    })
  texteCorr +=
    `${numAlpha(1)} $${distanceReelQ2}\\text{ km}$, c'est $${miseEnEvidence(texNombre(rapport[alea2]), bleuMathalea)}$ fois $${distanceReel}\\text{ km}$.
Or $${distanceReel}\\text{ km}$ est représenté par $${miseEnEvidence(texNombre(distanceCarte), bleuMathalea)}\\text{ cm}$ sur la carte. <br>` +
    `Donc $${distanceReelQ2}\\text{ km}$ est représenté par $${miseEnEvidence(texNombre(rapport[alea2]), bleuMathalea)}$ fois $${miseEnEvidence(texNombre(distanceCarte), bleuMathalea)}\\text{ cm}$ sur la carte. <br>` +
    `$${miseEnEvidence(texNombre(rapport[alea2]), bleuMathalea)} \\times ${miseEnEvidence(texNombre(distanceCarte), bleuMathalea)}\\text{ cm} = ${texNombre(rapport[alea2] * distanceCarte, 2)}\\text{ cm}$ <br>` +
    `Conclusion : Les deux villes sont séparées de $${miseEnEvidence(texNombre(rapport[alea2] * distanceCarte, 2))}\\text{ cm}$ sur la carte.`
  if (!context.isAmc) {
    handleAnswers(
      exo,
      i,
      { reponse: { value: (rapport[alea1] * distanceReel).toFixed(2) } },
      { formatInteractif: 'mathalea-mathfield' },
    )
    handleAnswers(
      exo,
      i + 1,
      { reponse: { value: (rapport[alea2] * distanceCarte).toFixed(2) } },
      { formatInteractif: 'mathalea-mathfield' },
    )
  } else {
    exo.autoCorrectionAMC[i] = {
      enonce: '',
      enonceAvant: false,
      options: { multicols: true, barreseparation: true },
      propositions: [
        {
          type: 'AMCNum',

          propositions: [
            {
              texte: texteCorr,
              statut: '',
              reponse: {
                texte: enonceAMC1,
                valeur: [arrondi(rapport[alea1] * distanceReel, 2)],
                param: {
                  digits: nombreDeChiffresDe(
                    arrondi(rapport[alea1] * distanceReel, 2),
                  ),
                  decimals: nombreDeChiffresDansLaPartieDecimale(
                    arrondi(rapport[alea1] * distanceReel, 2),
                  ),
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
        {
          type: 'AMCNum',

          propositions: [
            {
              texte: '',
              statut: '',
              reponse: {
                texte: enonceAMC2,
                valeur: [arrondi(rapport[alea2] * distanceCarte, 2)],
                param: {
                  digits: nombreDeChiffresDe(
                    arrondi(rapport[alea2] * distanceCarte, 2),
                  ),
                  decimals: nombreDeChiffresDansLaPartieDecimale(
                    arrondi(rapport[alea2] * distanceCarte, 2),
                  ),
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
      ],
    }
    exo.questionsAMC[i] = amcConvert(exo.autoCorrectionAMC[i])
  }
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    incrementInteractif: 2,
    incrementAMC: 1,
  }
}

function questionRecouvrirSurface(exo: Exercice, i: number): QuestionReturn {
  // peinture, gazon, carrelage pour une surface donnée.
  let texte, texteCorr
  const liste = [
    {
      matiere: 'de la peinture',
      unite: 'L',
      qtt_matiere_unitaire: [0.5, 1, 1.5, 2], // quantité au m²
      qtt_surface: [10, 25, 15], // nombre de m² indiqués sur l'emballage
    },
    {
      matiere: 'du gazon',
      unite: 'kg',
      qtt_matiere_unitaire: [2.5, 3, 5, 10],
      qtt_surface: [200, 175, 150],
    },
    {
      matiere: 'du carrelage',
      unite: 'carreaux',
      qtt_matiere_unitaire: [24, 40, 60, 100],
      qtt_surface: [10, 20, 5],
    },
  ]
  const prenoms = [prenomF(), prenomM()]

  const alea1 = randint(0, liste.length - 1)
  const alea2 = randint(0, liste[alea1].qtt_matiere_unitaire.length - 1)
  const alea3 = randint(0, liste[alea1].qtt_surface.length - 1)
  const rapport = versionSimplifiee
    ? rangeMinMax(2, 5)
    : [0.25, 0.5, 0.75, 1.25, 1.5, 2, 3, 4, 5] // choix parmi des rapports simples (en 6eme cela paraît suffisant)
  const quantite = liste[alea1].qtt_matiere_unitaire[alea2]
  const alea4 = randint(0, rapport.length - 1)
  const surfaceFinale = rapport[alea4] * liste[alea1].qtt_surface[alea3]
  const alea5 = randint(0, rapport.length - 1, [alea4])
  const quantite2 = rapport[alea5] * liste[alea1].qtt_matiere_unitaire[alea2]
  const alea6 = randint(-2, 2, [0])
  const surfaceFinale2 =
    rapport[alea5] * liste[alea1].qtt_surface[alea3] + alea6
  const qttaffichage = texNombre(quantite) // Pour affichage avec virgule en séparateur.
  const enonceAMC1 =
    `${numAlpha(0)} ${prenoms[0]} doit acheter ${liste[alea1].matiere}. ` +
    `Sur la notice, il est indiqué de prévoir $${qttaffichage}$${sp()}${liste[alea1].unite} pour $${liste[alea1].qtt_surface[alea3]}\\text{ m}^2$. <br> ` +
    `Combien de${sp()}${liste[alea1].unite} doit-elle en acheter pour une surface de $${texNombre(surfaceFinale)}\\text{ m}^2$${sp()}?`
  texte =
    enonceAMC1 +
    ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
      texteApres: ' ' + liste[alea1].unite,
    })
  texteCorr =
    `${numAlpha(0)} $${texNombre(surfaceFinale)}\\text{ m}^2$, c'est $${miseEnEvidence(texNombre(rapport[alea4]), bleuMathalea)}$ fois $${liste[alea1].qtt_surface[alea3]}\\text{ m}^2$. <br>` +
    `Il va donc falloir $${miseEnEvidence(texNombre(rapport[alea4]), bleuMathalea)}$ fois $${miseEnEvidence(qttaffichage, bleuMathalea)}$${sp()}${liste[alea1].unite} pour $${texNombre(surfaceFinale)}\\text{ m}^2$. <br>` +
    `$${miseEnEvidence(texNombre(rapport[alea4]), bleuMathalea)} \\times ${miseEnEvidence(qttaffichage, bleuMathalea)}$${sp()}${liste[alea1].unite} $= ${texNombre(rapport[alea4] * quantite, 3)}$${sp()}${liste[alea1].unite}<br>` +
    `Conclusion : ${prenoms[0]} doit acheter $${miseEnEvidence(texNombre(rapport[alea4] * quantite, 3))}$${sp()}${liste[alea1].unite}.` +
    '<br> '
  const enonceAMC2 =
    `${numAlpha(1)} ${prenoms[1]} a acheté ${liste[alea1].matiere}. Il lui en reste $${texNombre(quantite2)}$${sp()}${liste[alea1].unite}. Sur la notice, il est aussi indiqué de prévoir $${qttaffichage}$${sp()}${liste[alea1].unite} pour $${texNombre(liste[alea1].qtt_surface[alea3])}\\text{ m}^2$. <br>` +
    `En a-t-il suffisamment pour la surface de $${texNombre(surfaceFinale2)}\\text{ m}^2$ qu'il lui reste à faire${sp()}?<br>`
  texte +=
    '<br>' +
    enonceAMC2 +
    ajouteChampTexteMathLive(exo, i + 1, KeyboardType.vFON, {
      texteApres: ' (O pour oui ou N pour non)',
    })
  texteCorr +=
    `${numAlpha(1)} $${texNombre(quantite2)}$${sp()}${liste[alea1].unite}, c'est $${miseEnEvidence(texNombre(rapport[alea5]), bleuMathalea)}$ fois $${qttaffichage}$${sp()}${liste[alea1].unite}. <br>` +
    `Avec $${texNombre(quantite2)}$${sp()}${liste[alea1].unite} on peut donc traiter une surface de $${miseEnEvidence(texNombre(rapport[alea5]), bleuMathalea)}$
fois $${miseEnEvidence(texNombre(liste[alea1].qtt_surface[alea3]), bleuMathalea)}\\text{ m}^2$. <br>` +
    `$${miseEnEvidence(texNombre(rapport[alea5]), bleuMathalea)} \\times ${miseEnEvidence(texNombre(liste[alea1].qtt_surface[alea3]), bleuMathalea)}\\text{ m}^2 = ${texNombre(rapport[alea5] * liste[alea1].qtt_surface[alea3], 3)}\\text{ m}^2$<br>`
  texteCorr +=
    rapport[alea5] * liste[alea1].qtt_surface[alea3] < surfaceFinale2
      ? `Conclusion : $${texNombre(rapport[alea5] * liste[alea1].qtt_surface[alea3], 3)}\\text{ m}^2 < ${texNombre(surfaceFinale2)}\\text{ m}^2$ donc ${texteEnCouleurEtGras('non')}, ${prenoms[1]} n'en a pas assez pour $${texNombre(surfaceFinale2)}\\text{ m}^2$.` +
        ' <br>'
      : `Conclusion : $${texNombre(rapport[alea5] * liste[alea1].qtt_surface[alea3], 3)}\\text{ m}^2 > ${texNombre(surfaceFinale2)}\\text{ m}^2$ donc ${texteEnCouleurEtGras('oui')}, ${prenoms[1]} en a suffisamment pour $${texNombre(surfaceFinale2)}\\text{ m}^2$.` +
        ' <br>'

  if (!context.isAmc) {
    handleAnswers(
      exo,
      i,
      { reponse: { value: (rapport[alea4] * quantite).toFixed(3) } },
      { formatInteractif: 'mathalea-mathfield' },
    )
    handleAnswers(
      exo,
      i + 1,
      {
        reponse: {
          value:
            rapport[alea5] * liste[alea1].qtt_surface[alea3] > surfaceFinale2
              ? ['O', 'oui']
              : ['N', 'non'],
          options: { texteSansCasse: true },
        },
      },
      { formatInteractif: 'mathalea-mathfield' },
    )
  } else {
    exo.autoCorrectionAMC[i] = {
      enonce: '',
      enonceAvant: false,
      propositions: [
        {
          type: 'AMCNum',

          propositions: [
            {
              texte: texteCorr,
              statut: '',
              reponse: {
                texte: enonceAMC1,
                valeur: [arrondi(rapport[alea4] * quantite, 3)],
                param: {
                  digits: nombreDeChiffresDe(
                    arrondi(rapport[alea4] * quantite, 3),
                  ),
                  decimals: nombreDeChiffresDansLaPartieDecimale(
                    arrondi(rapport[alea4] * quantite, 3),
                  ),
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
        {
          type: 'AMCOpen',

          propositions: [
            {
              enonce: enonceAMC2,
              statut: 2,
              texte: '',
            },
          ],
        },
      ],
    }
    exo.questionsAMC[i] = amcConvert(exo.autoCorrectionAMC[i])
  }
  // }
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    incrementInteractif: 2,
    incrementAMC: 1,
  }
}

// _______ Fin des fonctions correspondants aux situations problèmes _____

export const uuid = 'f7a14'

export const refs = {
  'fr-fr': ['6P3C', 'BP2AutoL5'],
  'fr-2016': ['6P11', 'BP2AutoL5'],
  'fr-ch': ['9R1FA1C-1', '9R2FA1C-1', '9R3FA1C-1', 'PRQPF03A-11'],
}
export default class ProportionnaliteParLinearite extends Exercice {
  constructor() {
    super()
    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
    this.nbQuestions = 6

    this.besoinFormulaireCaseACocher = [
      'Version simplifiée ne comportant que des nombres entiers',
    ]
    this.sup = false
    this.besoinFormulaire2Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Achat\n2 : Recette\n3 : Distance\n4 : Échelle\n5 : Surface\n6 : Mélange',
    ]
    this.sup2 = 7
  }

  nouvelleVersion() {
    let question
    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1

    if (this.interactif) {
      this.consigne = ''
    } else {
      this.consigne =
        this.nbQuestions === 1
          ? 'Répondre à la question posée en justifiant.'
          : 'Répondre aux questions posées en justifiant.'
    }
    // const incrementInteractif = 0
    let indiceChampTexte = 0

    const listeIndexSituations = gestionnaireFormulaireTexte({
      max: 5,
      defaut: 6,
      melange: 6,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      indexN = randint(0, couplePremiersEntreEux.length - 1)
      if (this.sup) {
        versionSimplifiee = true
      } else {
        versionSimplifiee = false
      }
      switch (listeIndexSituations[i]) {
        case 1:
          question = questionAchat(this, indiceChampTexte)
          /* if (!context.isAmc) {
            incrementInteractif = 2
          } else {
            incrementInteractif = 1
          } */
          break
        case 2:
          question = questionRecette(this, indiceChampTexte)
          break
        /* case 3:
          question = questionDillution(this, indiceChampTexte)
          incrementInteractif = 1
          break
          */
        case 3:
          question = questionDistance(this, indiceChampTexte)
          break
        case 4:
          question = questionEchelle(this, indiceChampTexte)
          break
        case 5:
        default:
          question = questionRecouvrirSurface(this, indiceChampTexte)
          break
      }
      if (this.questionJamaisPosee(i, indexN, question.qtexteCorr)) {
        // Si la question n'a jamais été posée, on la garde.
        this.listeQuestions[i] = question.qtexte
        this.listeCorrections[i] = question.qtexteCorr
        i++
        indiceChampTexte += context.isAmc
          ? question.incrementAMC || 1
          : question.incrementInteractif || 2
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
