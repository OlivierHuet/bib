# Projet Bib : Scanner de Codes-Barres Offline

Application web progressive (PWA) conçue pour le scan de codes-barres en mode hors-ligne. L'objectif est de permettre la collecte rapide et fiable de données sur le terrain, même sans connexion internet stable.

## Suivi du Projet

Pour suivre l'avancement du développement, consultez notre [Plan de Projet](PLAN_DE_PROJET.md).

## Fonctionnalités Principales

- **Double Mode de Saisie :** L'utilisateur peut choisir entre :
    1.  **Scan par Caméra :** Utilise la caméra du smartphone ou de la tablette pour scanner les codes-barres directement.
    2.  **Scan par Lecteur Externe :** Compatible avec les lecteurs de codes-barres externes (type douchette Bluetooth ou Linea Pro) qui fonctionnent en émulation clavier (mode HID).

- **Mode Hors-Ligne (Offline-First) :** Grâce à un Service Worker, l'application est entièrement fonctionnelle sans connexion internet après son premier chargement.

- **Historique Local :** Tous les codes-barres scannés sont sauvegardés localement dans le navigateur (`localStorage`). L'historique est consultable à tout moment.

- **Gestion des Données :**
    - Affichage de la liste des codes scannés.
    - Possibilité d'effacer l'historique.
    - (Futur) Exportation de la liste des codes (format CSV, JSON, etc.).

- **Portabilité :** Développé en HTML, CSS et JavaScript standards, le projet est compatible avec la majorité des navigateurs modernes sur mobile et ordinateur.

## Pile Technique

Le projet "Bib" est une application web côté client construite avec les technologies suivantes :

-   **HTML5** : Pour la structure sémantique des pages web.
-   **CSS3** : Pour la mise en forme et le style de l'interface utilisateur.
-   **JavaScript (ES6+)** : Pour la logique client-side, l'interactivité et la manipulation du DOM.
-   **html5-qrcode library** : Une bibliothèque JavaScript tierce utilisée pour le scan de codes QR et de codes-barres via la caméra.
-   **Web APIs** :
    -   **localStorage** : Pour le stockage persistant de l'historique des codes-barres scannés.
    -   **Service Worker API** : Pour implémenter les fonctionnalités de Progressive Web App (PWA), notamment le mode hors-ligne et la mise en cache des ressources.

## Configuration Requise

### Pour le Développement

Pour utiliser le **mode caméra** en développement local, une connexion **HTTPS** est obligatoire.

1.  **Installer `mkcert`** (un outil simple pour créer des certificats de confiance locaux) :
    - Sur Windows (via Chocolatey) : `choco install mkcert`
    - Sur macOS (via Homebrew) : `brew install mkcert`
2.  **Installer l'autorité de certification locale :**
    ```sh
    mkcert -install
    ```
3.  **Générer un certificat** pour votre adresse IP locale (remplacez `192.168.1.XX`) :
    ```sh
    mkcert 192.168.1.XX
    ```
4.  **Configurer votre serveur de développement** (par exemple, `live-server` sur VS Code) pour utiliser les fichiers `cert.pem` et `key.pem` générés.

### Pour les Lecteurs Externes (Mode HID)

Pour que le **mode lecteur externe** fonctionne correctement, assurez-vous que votre matériel est configuré pour :
1.  Émuler un clavier (mode HID).
2.  Envoyer un suffixe **"Enter"** (ou retour à la ligne) après chaque code-barres scanné.

## Structure du Projet (à définir)

- `/index.html` : Point d'entrée de l'application.
- `/css/style.css` : Styles de l'application.
- `/js/app.js` : Logique principale de l'application (gestion des modes, UI, événements).
- `/js/scanner.js` : Code spécifique au scan par caméra.
- `/sw.js` : Le Service Worker pour la gestion du mode hors-ligne.
- `/assets/` : Icônes et autres ressources.
