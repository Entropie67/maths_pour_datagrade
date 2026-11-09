// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Des équipes enseignantes souhaitent adhérer à un site d'éditeur pour télécharger des vidéos pédagogiques de vulgarisation scientifique. Deux offres F et G sont envisageables.

#align(center)[
  #box(stroke: 0.7pt + rgb("#2f5597"), radius: 4pt, inset: 8pt, width: 15cm)[
    *Offre F*\
    0,70~€ par téléchargement de vidéo.

    #v(0.3cm)

    *Offre G*\
    Abonnement forfaitaire de 13~€ auquel s'ajoute un montant fixe par téléchargement.
  ]
]

*1.* L'équipe enseignante d'une première école opte pour l'offre F. Déterminer l'expression de la fonction $f$ qui, au nombre de vidéos téléchargées, associe le coût en euros.

*2.* L'équipe enseignante d'une seconde école opte pour l'offre G. Les enseignants ont téléchargé 142 vidéos pour un montant de 98,20~€.

#sub("a", [Déterminer le montant fixe par téléchargement avec l'offre G.])
#sub("b", [On note $g$ la fonction qui, au nombre de vidéos téléchargées, associe le coût en euros avec l'offre G. On admet que l'expression de $g$ est donnée par $g(x) = display(frac(3, 5)) x + 13$. Calculer $g(4)$.])
#sub("c", [Dans le contexte de l'exercice, que représente l'image de 10 par la fonction $g$ ?])
#sub("d", [L'équipe enseignante d'une troisième école a opté pour l'offre G et a payé 95,20~€. Combien de vidéos a-t-elle téléchargées ?])

*3.* À partir de combien de vidéos l'offre G devient-elle plus intéressante que l'offre F ? Justifier votre réponse.

*4.* La feuille de tableur ci-après détermine le montant de la dépense en fonction du nombre de vidéos téléchargées selon l'offre choisie.

#align(center)[#image("crpe_l3_2024_g3_ex2-tableur.png", width: 14cm)]

#sub("a", [Quelle formule peut être saisie dans la cellule B2 et étirée sur toute la ligne pour obtenir le montant de la dépense avec l'offre F ?])
#sub("b", [Un tarif promotionnel permet de bénéficier d'une réduction de 20~% sur le montant total avec l'offre G. Quelle formule peut être saisie dans la cellule B3 et étirée sur toute la ligne pour obtenir le montant de la dépense avec l'offre G en tenant compte de la réduction ?])
