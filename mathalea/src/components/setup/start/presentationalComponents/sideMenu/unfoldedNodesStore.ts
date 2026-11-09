import { writable } from 'svelte/store'

/**
 * État déplié/replié des nœuds du menu des référentiels, indexé par
 * l'identifiant du nœud (chemin des titres depuis la racine).
 * Conservé en mémoire pour retrouver l'arborescence telle que l'utilisateur
 * l'avait laissée après un passage par une autre vue (réglages du lien élève,
 * export LaTeX, etc.) qui démonte le menu.
 */
export const unfoldedNodes = writable<Record<string, boolean>>({})
