// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 40c12 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 06/10/2026 (commit 3ca3967a1).
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '07/01/2026'
export const uuid = '40c12'
// @Author Gilles Mora
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Utiliser une proportion pour trouver le tout'
export default class ProblemesPourcentagesOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    typeQuestion: string,
    valeurDonnee: number,
    pourcentageDonne: number,
    pourcentageCache: number,
    unite: string,
  ): void {
    const total = Math.round((valeurDonnee * 100) / pourcentageDonne)

    let situation = ''
    let explication = ''

    switch (typeQuestion) {
      case 'iceberg1':
        // Énoncé : "90% sous l'eau" + on donne la partie VISIBLE (10%)
        situation = `$90 \\,\\%$ du volume d'un iceberg est situé sous la surface de l'eau.<br>
La hauteur totale d'un iceberg dont la partie visible est $${valeurDonnee}$ ${unite} est d'environ :`
        explication = `La partie visible représente $${pourcentageDonne} \\,\\%$ du total.<br>
Comme celle-ci est $${valeurDonnee}$ ${unite}, on retrouve la hauteur totale en la multipliant par $10$.<br>
$${valeurDonnee} \\text{ ${unite}} \\times 10 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break

      case 'iceberg2':
        // Énoncé : "10% au-dessus" + on donne la partie SOUS L'EAU (90%)
        situation = `$10 \\,\\%$ du volume d'un iceberg est situé au-dessus de la surface de l'eau.<br>
La hauteur totale d'un iceberg dont la partie sous l'eau est $${texNombre(valeurDonnee)}$ ${unite} est d'environ :`
        explication = `La partie sous l'eau représente $${pourcentageDonne} \\,\\%$ du total.<br>
Pour trouver la hauteur totale, on divise la hauteur sous l'eau par $${pourcentageDonne / 10}$ (pour avoir $10\\,\\%$), puis on multiplie par $10$ (pour avoir $100\\,\\%$) :<br>
$(${texNombre(valeurDonnee)} \\div ${pourcentageDonne / 10}) \\times 10 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break

      case 'recyclage1':
        // Énoncé : "recycle 30%" + on donne les déchets NON RECYCLÉS (70%)
        situation = `Une ville recycle $30 \\,\\%$ de ses déchets.<br>
Si elle ne recycle pas $${texNombre(valeurDonnee)}$ ${unite} de déchets, la masse totale de déchets produits est  :`
        explication = `Les déchets non recyclés représentent $${pourcentageDonne} \\,\\%$ du total.<br>
Pour trouver la masse totale, on divise par $${pourcentageDonne / 10}$ (pour avoir $10\\,\\%$), puis on multiplie par $10$ (pour avoir $100\\,\\%$) :<br>
$(${texNombre(valeurDonnee)} \\div ${pourcentageDonne / 10}) \\times 10 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break

      case 'recyclage2':
        // Énoncé : "ne recycle pas 70%" + on donne les déchets RECYCLÉS (30%)
        situation = `Une ville ne recycle pas $70 \\,\\%$ de ses déchets.<br>
Si elle recycle $${texNombre(valeurDonnee)}$ ${unite}, la masse totale de déchets produits est  :`
        explication = `Les déchets recyclés représentent $${pourcentageDonne} \\,\\%$ du total.<br>
Pour trouver la masse totale, on divise par $${pourcentageDonne / 10}$ (pour avoir $10\\,\\%$), puis on multiplie par $10$ (pour avoir $100\\,\\%$) :<br>
$(${texNombre(valeurDonnee)} \\div ${pourcentageDonne / 10}) \\times 10 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break

      case 'budget1':
        // Énoncé : "25% loisirs" + on donne les AUTRES dépenses (75%)
        situation = `Une famille consacre $25 \\,\\%$ de son budget aux loisirs.<br>
Si elle dépense $${texNombre(valeurDonnee)}$ ${unite} pour les autres dépenses, son budget total est  :`
        explication = `Les autres dépenses représentent $${pourcentageDonne} \\,\\%$ du total.<br>
On cherche d'abord ce que représentent $${pourcentageCache} \\,\\%$ en divisant par $3$ :<br>
$${texNombre(valeurDonnee)} \\div 3 = ${texNombre(valeurDonnee / 3)}$ ${unite}<br>
Puis on multiplie par $4$ pour obtenir le total ($100 \\,\\%$) :<br>
$${texNombre(valeurDonnee / 3)} \\times 4 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break

      case 'budget2':
        // Énoncé : "75% autres dépenses" + on donne les dépenses de LOISIRS (25%)
        situation = `Une famille consacre $75 \\,\\%$ de son budget aux dépenses autres que les loisirs.<br>
Si elle dépense $${texNombre(valeurDonnee)}$ ${unite} pour les loisirs, son budget total est  :`
        explication = `Les loisirs représentent $${pourcentageDonne} \\,\\%$ du total.<br>
Pour trouver le budget total, on multiplie par $4$ (car $25\\,\\% \\times 4 = 100\\,\\%$) :<br>
$${texNombre(valeurDonnee)} \\times 4 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break

      case 'deplacements1':
        // Énoncé : "20% vélo" + on donne les déplacements SANS vélo (80%)
        situation = `Dans une ville, $20 \\,\\%$ des déplacements se font à vélo.<br>
Si $${texNombre(valeurDonnee)}$ ${unite} se font autrement qu'à vélo, le nombre total de déplacements est  :`
        explication = `Les déplacements sans vélo représentent $${pourcentageDonne} \\,\\%$ du total.<br>
Pour trouver le nombre total, on divise par $${pourcentageDonne / 10}$ (pour avoir $10\\,\\%$), puis on multiplie par $10$ (pour avoir $100\\,\\%$) :<br>
$(${texNombre(valeurDonnee)} \\div ${pourcentageDonne / 10}) \\times 10 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break

      case 'deplacements2':
        // Énoncé : "80% autres modes" + on donne les déplacements À vélo (20%)
        situation = `Dans une ville, $80 \\,\\%$ des déplacements se font autrement qu'à vélo.<br>
Si $${texNombre(valeurDonnee)}$ ${unite} se font à vélo, le nombre total de déplacements est  :`
        explication = `Les déplacements à vélo représentent $${pourcentageDonne} \\,\\%$ du total.<br>
Pour trouver le nombre total, on divise par $${pourcentageDonne / 10}$ (pour avoir $10\\,\\%$), puis on multiplie par $10$ (pour avoir $100\\,\\%$) :<br>
$(${texNombre(valeurDonnee)} \\div ${pourcentageDonne / 10}) \\times 10 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break

      case 'lecture1':
        // Énoncé : "40% lu" + on donne les pages RESTANTES (60%)
        situation = `Marie a lu $40 \\,\\%$ de son livre.<br>
S'il lui reste $${valeurDonnee}$ ${unite} à lire, le nombre total de pages du livre est  :`
        explication = `Les pages restantes représentent $${pourcentageDonne} \\,\\%$ du total.<br>
Pour trouver le nombre total de pages, on divise le nombre de pages restantes par $${pourcentageDonne / 10}$ (pour avoir $10\\,\\%$), puis on multiplie par $10$ (pour avoir $100\\,\\%$) :<br>
$(${valeurDonnee} \\div ${pourcentageDonne / 10}) \\times 10 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break

      case 'lecture2':
        // Énoncé : "60% reste à lire" + on donne les pages DÉJÀ LUES (40%)
        situation = `Il reste à Marie $60 \\,\\%$ de son livre à lire.<br>
Si elle a déjà lu $${valeurDonnee}$ ${unite}, le nombre total de pages du livre est  :`
        explication = `Les pages lues représentent $${pourcentageDonne} \\,\\%$ du total.<br>
Pour trouver le nombre total de pages, on divise le nombre de pages déjà luespar $${pourcentageDonne / 10}$ (pour avoir $10\\,\\%$), puis on multiplie par $10$ (pour avoir $100\\,\\%$) :<br>
$(${valeurDonnee} \\div ${pourcentageDonne / 10}) \\times 10 = ${miseEnEvidence(texNombre(total))}$ $${miseEnEvidence(`\\text{${unite}}`)}$`
        break
    }

    this.enonce = situation
    this.correction = explication

    // Génération des distracteurs garantissant 4 réponses distinctes
    const reponsesSet = new Set<number>()
    reponsesSet.add(total) // Bonne réponse

    // Distracteur 1 : multiplication par 10
    let dist1 = valeurDonnee * 10
    if (reponsesSet.has(dist1)) dist1 = Math.round(total * 0.9)
    reponsesSet.add(dist1)

    // Distracteur 2 : calcul avec le mauvais pourcentage
    let dist2 = Math.round((valeurDonnee * 100) / pourcentageCache)
    while (reponsesSet.has(dist2)) {
      dist2 = Math.round(total * 1.05)
    }
    reponsesSet.add(dist2)

    // Distracteur 3 : autre erreur
    let dist3 = Math.round(total * 1.1)
    while (reponsesSet.has(dist3)) {
      dist3 = Math.round(total * 0.95)
    }
    reponsesSet.add(dist3)

    const distracteurs = Array.from(reponsesSet)
    distracteurs.shift() // Enlever la bonne réponse

    this.reponses = [
      `$${texNombre(total)}$ ${unite}`, // Bonne réponse
      `$${texNombre(distracteurs[0])}$ ${unite}`,
      `$${texNombre(distracteurs[1])}$ ${unite}`,
      `$${texNombre(distracteurs[2])}$ ${unite}`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs('iceberg1', 35, 10, 90, 'm')
  }

  versionAleatoire = () => {
    const choix = choice([
      // Cas iceberg : "90% sous l'eau" + visible OU "10% au-dessus" + sous l'eau
      {
        type: 'iceberg1',
        valeur: randint(30, 40),
        pourcDonne: 10,
        pourcCache: 90,
        unite: 'm',
      },
      {
        type: 'iceberg2',
        valeur: choice([90, 180, 270, 360]),
        pourcDonne: 90,
        pourcCache: 10,
        unite: 'm',
      },

      // Cas recyclage : "recycle 30%" + non recyclés OU "ne recycle pas 70%" + recyclés
      {
        type: 'recyclage1',
        valeur: choice([7000, 14000, 21000, 28000]),
        pourcDonne: 70,
        pourcCache: 30,
        unite: 'tonnes',
      },
      {
        type: 'recyclage2',
        valeur: choice([3000, 6000, 9000, 12000]),
        pourcDonne: 30,
        pourcCache: 70,
        unite: 'tonnes',
      },

      // Cas budget : "25% loisirs" + autres OU "75% autres" + loisirs
      {
        type: 'budget1',
        valeur: choice([1500, 3000, 4500, 6000]),
        pourcDonne: 75,
        pourcCache: 25,
        unite: '€',
      },
      {
        type: 'budget2',
        valeur: choice([500, 1000, 1500, 2000]),
        pourcDonne: 25,
        pourcCache: 75,
        unite: '€',
      },

      // Cas déplacements : "20% vélo" + autres OU "80% autres" + vélo
      {
        type: 'deplacements1',
        valeur: choice([8000, 16000, 24000, 32000]),
        pourcDonne: 80,
        pourcCache: 20,
        unite: 'déplacements',
      },
      {
        type: 'deplacements2',
        valeur: choice([2000, 4000, 6000, 8000]),
        pourcDonne: 20,
        pourcCache: 80,
        unite: 'déplacements',
      },

      // Cas lecture : "40% lu" + restant OU "60% reste" + lu
      {
        type: 'lecture1',
        valeur: choice([120, 180, 240, 300]),
        pourcDonne: 60,
        pourcCache: 40,
        unite: 'pages',
      },
      {
        type: 'lecture2',
        valeur: choice([80, 120, 160, 200]),
        pourcDonne: 40,
        pourcCache: 60,
        unite: 'pages',
      },
    ])

    this.appliquerLesValeurs(
      choix.type,
      choix.valeur,
      choix.pourcDonne,
      choix.pourcCache,
      choix.unite,
    )
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
