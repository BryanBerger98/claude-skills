# Interview guide — scoping question bank

Used by `01-scope-need`. Ask what is missing; never dump the whole bank. Prioritize `job_to_be_done`, `goals`, and `success_criteria` — a spec built on a fuzzy goal is worthless.

## Shared (both modes)

**Subject & job**
- En une phrase, qu'est-ce que cette page/cet écran doit permettre de faire ?
- Quelle est l'action unique la plus importante sur cet écran ?

**Audience & context**
- Qui l'utilise ? Dans quel contexte (bureau, mobilité, pression temporelle) ?
- Niveau d'expertise : novices, experts, mixte ?

**Goals & success**
- Quels objectifs métier ? Quels objectifs pour l'utilisateur ?
- Comment saura-t-on que le nouveau design fonctionne ? (métrique, temps de tâche, taux de conversion, satisfaction)

**Scope**
- Quelles pages/écrans/flux sont concernés ? Lesquels sont explicitement hors périmètre ?

**Brand & constraints**
- Charte / système de design existant à respecter ? Liens ?
- Stack technique (framework, librairie UI) ? Contraintes i18n, performance, densité de données ?
- Échéances ou jalons ?

**Content**
- Le contenu réel est-il disponible, ou faut-il du contenu fictif réaliste ?

## Creation branch (greenfield)

- Y a-t-il des produits/écrans de référence que tu aimes (ou détestes) ? Pourquoi ?
- Quel ton/personnalité visuelle vises-tu (sérieux, ludique, premium, dense, aéré) ?
- Quelles plateformes/tailles d'écran prioritaires ?
- Existe-t-il déjà des composants réutilisables, ou on part de zéro ?

## Redesign branch (refonte)

- Où se trouve l'UI actuelle ? (chemins de fichiers, routes, ou URL d'une instance lancée)
- Qu'est-ce qui ne va pas aujourd'hui, concrètement ? (plaintes utilisateurs, métriques en baisse, dette visuelle)
- Qu'est-ce qui DOIT être préservé ? (densité de données, raccourcis experts, conformité, marque)
- Refonte visuelle seule, ou aussi parcours/architecture de l'information ?
- Contraintes de migration : big-bang ou incrémental ? compat ascendante des composants ?

## Confirmation

Toujours reformuler le brief en 5–8 lignes et obtenir une validation explicite avant de lancer les agents. Sans validation, ne pas fan-out.
