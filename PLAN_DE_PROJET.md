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

- [x] **Étape 4 : Implémentation du Mode Caméra**
    - [x] Ajouter les éléments HTML (`div#reader`, `ul`) à l'écran de la caméra.
    - [x] Inclure la librairie `html5-qrcode` dans `index.html`.
    - [x] Implémenter la logique d'initialisation, de scan, et d'arrêt de la caméra.
    - [x] Connecter le scan réussi à la fonction de sauvegarde (`localStorage`).
    - **Validation :** (Sur HTTPS) Utiliser le mode caméra, scanner un code et vérifier qu'il s'ajoute à l'historique.

- [x] **Étape 4.1 : Unification des Historiques**
    - [x] Modifier la logique pour que les deux modes de scan (caméra et lecteur externe) utilisent la même liste d'historique (`<ul>`) et la même clé `localStorage`.
    - **Validation :**
        1.  Scanner un code-barres en mode lecteur externe.
        2.  Passer en mode caméra et vérifier que le code précédent est visible.
        3.  Scanner un nouveau code-barres avec la caméra.
        4.  Retourner au mode lecteur externe et vérifier que les deux codes sont présents dans l'historique.
        5.  Recharger la page et s'assurer que l'historique unifié persiste.

- [x] **Étape 5 : Activation du Mode Hors-Ligne (Service Worker)**
    - [x] Créer le fichier `sw.js` à la racine.
    - [x] Lister tous les assets de l'application à mettre en cache.
    - [x] Ajouter le script d'enregistrement du Service Worker dans `js/app.js`.
    - **Validation :** Charger l'application, se déconnecter d'internet, et recharger la page. L'application doit fonctionner.

- [x] **Étape 6 : Finalisation et Améliorations**
    - [x] Ajouter un bouton "Vider l'historique" fonctionnel.
    - [x] Afficher des messages d'erreur clairs (ex: "HTTPS requis").
    - [x] Peaufiner le CSS pour une meilleure expérience.
    - **Validation :** L'application est robuste et l'expérience utilisateur est fluide.

- [] **Étape 6.1 : Résoudre le problème de la caméra qui ne se charge pas**

- [] **Étape 6.2 : Afficher la liste historique dans la page d'acceuil sous le bouton réinitialser**

- [] **Étape 6.3 : En face de chaque ligne de l'historique mettre un bouton pour supprimer la lgne**
