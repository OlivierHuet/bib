# Plan de Projet : Bib

Ce document sert à suivre l'avancement du développement de l'application "Bib". Cochez les cases au fur et à mesure que les étapes sont complétées.

## Feuille de Route

- [x] **Étape 1 : La Structure de Base (HTML & CSS)**
    - [x] Créer le fichier `index.html`.
    - [x] Définir les 3 sections (`div`) pour les écrans de l'application.
    - [x] Créer le fichier `css/style.css` avec les styles de base pour masquer les écrans inactifs.
    - **Validation :** Ouvrir `index.html` et vérifier que seul l'écran de sélection est visible.

- [x] **Étape 2 : Le Sélecteur de Mode et la Logique Principale**
    - [x] Créer le fichier `js/app.js`.
    - [x] Implémenter la logique pour afficher/cacher les écrans au clic sur les boutons.
    - [x] Ajouter un bouton "Retour" fonctionnel sur chaque écran de scan.
    - **Validation :** Naviguer entre les différents écrans via les boutons.

- [x] **Étape 3 : Implémentation du Mode Lecteur Externe (HID)**
    - [x] Ajouter les éléments HTML (`input`, `ul`) à l'écran du lecteur externe.
    - [x] Implémenter la logique de capture (`Enter`), de sauvegarde (`localStorage`) et d'affichage de l'historique.
    - [x] Assurer la mise au focus automatique de l'input.
    - **Validation :** Utiliser le mode lecteur externe, ajouter des entrées et vérifier qu'elles persistent après rechargement.

- [ ] **Étape 4 : Implémentation du Mode Caméra**
    - [ ] Ajouter les éléments HTML (`div#reader`, `ul`) à l'écran de la caméra.
    - [ ] Inclure la librairie `html5-qrcode` dans `index.html`.
    - [ ] Implémenter la logique d'initialisation, de scan, et d'arrêt de la caméra.
    - [ ] Connecter le scan réussi à la fonction de sauvegarde (`localStorage`).
    - **Validation :** (Sur HTTPS) Utiliser le mode caméra, scanner un code et vérifier qu'il s'ajoute à l'historique.

- [ ] **Étape 5 : Activation du Mode Hors-Ligne (Service Worker)**
    - [ ] Créer le fichier `sw.js` à la racine.
    - [ ] Lister tous les assets de l'application à mettre en cache.
    - [ ] Ajouter le script d'enregistrement du Service Worker dans `js/app.js`.
    - **Validation :** Charger l'application, se déconnecter d'internet, et recharger la page. L'application doit fonctionner.

- [ ] **Étape 6 : Finalisation et Améliorations**
    - [ ] Ajouter un bouton "Vider l'historique" fonctionnel.
    - [ ] Afficher des messages d'erreur clairs (ex: "HTTPS requis").
    - [ ] Peaufiner le CSS pour une meilleure expérience.
    - **Validation :** L'application est robuste et l'expérience utilisateur est fluide.
