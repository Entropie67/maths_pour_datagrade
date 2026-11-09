Notons $T$ l'aire du triangle équilatéral de départ et $c$ la longueur de son côté. Chaque côté de la pièce est, au choix :

- rectiligne : sa longueur est $c$ et il ne change pas l'aire ;
- « bombé » : le côté est remplacé par un arc de longueur $L$, qui ajoute à l'aire un « segment de disque » d'aire $S$ ;
- « creusé » : le côté est remplacé par un arc de même longueur $L$, qui retire à l'aire un segment de disque d'aire $S$.

Les arcs ont tous la même longueur et le même rayon, donc tous les segments de disque sont identiques (même aire $S$). De plus, un arc est plus long que le segment qui joint ses extrémités : $L > c$.

On en déduit, pour chaque pièce, son aire et son périmètre :

#align(center)[
  #table(
    columns: (auto, auto, auto, auto, auto, auto),
    align: center + horizon,
    inset: 5pt,
    table.header([*Pièce*], [*Côtés rectilignes*], [*Côtés bombés*], [*Côtés creusés*], [*Aire*], [*Périmètre*]),
    [A], [3], [0], [0], [$T$], [$3 c$],
    [B], [2], [1], [0], [$T + S$], [$2 c + L$],
    [C], [0], [3], [0], [$T + 3 S$], [$3 L$],
    [D], [1], [2], [0], [$T + 2 S$], [$c + 2 L$],
    [E], [2], [0], [1], [$T - S$], [$2 c + L$],
    [F], [1], [0], [2], [$T - 2 S$], [$c + 2 L$],
    [G], [1], [1], [1], [$T$], [$c + 2 L$],
    [H], [0], [0], [3], [$T - 3 S$], [$3 L$],
    [I], [0], [1], [2], [$T - S$], [$3 L$],
    [J], [0], [2], [1], [$T + S$], [$3 L$],
    [K], [1], [1], [1], [$T$], [$c + 2 L$],
  )
]

*1.* La plus grande aire est $T + 3 S$ : c'est la pièce *C*.

*2.* La plus petite aire est $T - 3 S$ : c'est la pièce *H*.

*3.* Les pièces qui ont le même périmètre $3 L$ sont C, H, I et J. Leurs aires sont $T + 3 S$, $T - 3 S$, $T - S$ et $T + S$, toutes différentes. Les pièces *C, H, I et J* conviennent.

*4.* On cherche des pièces de même aire mais de périmètres différents :
- B et J ont la même aire $T + S$, mais des périmètres $2 c + L$ et $3 L$, différents (car $L > c$) ;
- E et I ont la même aire $T - S$, mais des périmètres $2 c + L$ et $3 L$, différents ;
- A et G ont la même aire $T$, mais des périmètres $3 c$ et $c + 2 L$, différents.

Les trois paires *(B, J), (E, I) et (A, G)* conviennent. (On pouvait aussi choisir la paire (A, K) à la place de (A, G).)
