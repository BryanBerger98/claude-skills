# Spécification de design — <sujet>

> Document généré par la skill `audit-my-design`. Le livrable s'arrête à la spécification ; l'exécution visuelle est confiée à `frontend-design`.

- **Mode** : <creation | redesign>
- **Date** : <YYYY-MM-DD>
- **Périmètre** : <pages/écrans/flux couverts>
- **Sources auditées** : <chemins / routes / URL — en mode redesign>

## 1. Contexte & objectifs

- **Sujet** : <ce qu'est le produit/la page, son domaine>
- **Audience** : <qui l'utilise, contexte, contraintes>
- **Job principal de l'écran** : <la tâche unique et prioritaire>
- **Objectifs** (classés) : <objectifs métier + utilisateur>
- **Critères de succès** : <comment on saura que le design fonctionne — mesurable si possible>

## 2. Périmètre

- **Inclus** : <…>
- **Exclu** : <…>
- **Contraintes** : <marque, design system, stack technique, i18n, performance, échéances>

## 3. Audit de l'existant

> Section présente uniquement en mode **redesign**. À supprimer entièrement en mode création.

Synthèse fusionnée des constats code + UX + UI, classée par sévérité.

| # | axe (code/UX/UI) | constat | sévérité | preuve (écran / `file:line`) | impact sur l'objectif |
|---|------------------|---------|----------|------------------------------|-----------------------|
| 1 | <…> | <…> | blocker/major/minor | <…> | <…> |

## 4. Direction de design cible

Une direction cohérente (et non deux avis juxtaposés). Résoudre ici les conflits UX/UI.

- **Principes directeurs** : <2–4 principes propres à ce sujet>
- **Expérience cible (UX)** : flux principal, architecture de l'information, états (vide / chargement / erreur / succès / accès refusé), microcopie.
- **Système de tokens (UI)** :
  - Couleurs : 4–6 valeurs hex nommées, avec ratio de contraste WCAG pour chaque paire de texte.
  - Typographie : rôles display / corps / utilitaire — familles, échelle, graisses.
  - Espacement & grille : unité de base, échelle, grille de mise en page.
  - **Signature** : l'élément unique dont ce design se souviendra, dérivé du sujet.
  - États de composant : défaut / survol / focus / actif / désactivé.

## 5. Spécifications de changement

Le cœur du document. Chaque ligne trace vers un objectif/critère de succès ou une heuristique nommée. Classer P0 → P2 par impact.

| # | élément | état actuel | changement | raison (besoin / heuristique) | effort | priorité |
|---|---------|-------------|------------|-------------------------------|--------|----------|
| 1 | <…> | <…> | <…> | <…> | S/M/L | P0/P1/P2 |

## 6. Accessibilité (WCAG 2.2 AA)

Cibles à atteindre : contraste (≥ 4.5:1 texte normal, ≥ 3:1 grand texte), focus visible, navigation clavier complète, HTML sémantique, libellés/alt, gestion des erreurs accessible.

## 7. Mise en œuvre & handoff

- **Séquence d'implémentation** : <étapes ordonnées, par priorité>
- **Handoff** : l'exécution visuelle est confiée à la skill `frontend-design`. Ce document ne contient pas de code de production.
- **Dépendances / risques** : <…>

## 8. Annexes

- Wireframes ASCII, références visuelles, liens, rapports d'agents bruts si utile.
