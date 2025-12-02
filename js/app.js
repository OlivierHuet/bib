// --- Enregistrement du Service Worker ---
const appVersion = new URL(location.href).searchParams.get('v') || 'dev';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(`/bib/sw.js?v=${appVersion}`)
            .then(registration => {
                console.log('Service Worker enregistré avec succès, version:', appVersion);
            })
            .catch(error => {
                console.log('Échec de l\'enregistrement du Service Worker:', error);
            });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Affichage de la version
    const versionSpan = document.getElementById('app-version');
    if (versionSpan) {
        versionSpan.textContent = appVersion;
    }

    // --- Éléments du DOM ---
    const selectionScreen = document.getElementById('selection-screen');
    const textScannerScreen = document.getElementById('text-scanner-screen');
    const cameraScannerScreen = document.getElementById('camera-scanner-screen');

    const btnSelectCamera = document.getElementById('btn-select-camera');
    const btnSelectText = document.getElementById('btn-select-text');
    const btnClearHistory = document.getElementById('btn-clear-history');
    const btnSyncHistory = document.getElementById('btn-sync-history');
    const backButtons = document.querySelectorAll('.btn-back');

    const barcodeInput = document.getElementById('barcode-input');
    const cameraScanResult = document.getElementById('camera-scan-result');
    const httpsWarningMessage = document.getElementById('https-warning-message');

    // --- State de l'application ---
    let barcodeHistory = []; // Now stores objects: { isbn: string, bookInfo: object|null, status: 'pending'|'loaded'|'error' }
    const historyKey = 'barcodeHistory';
    let html5QrCode = null;
    let isFetchingBookInfo = false; // To block new scans during API call

    // --- Fonctions ---

    /**
     * Active ou désactive les éléments de scan (input texte et boutons de sélection de mode).
     * @param {boolean} disabled Si true, désactive les éléments; si false, les active.
     */
    function toggleScanInputs(disabled) {
        barcodeInput.disabled = disabled;
        btnSelectText.disabled = disabled;
        // btnSelectCamera is handled separately due to HTTPS warning,
        // but we can disable it if it's not already disabled by HTTPS check.
        if (window.location.protocol === 'https:') { // Only enable if HTTPS is available
            btnSelectCamera.disabled = disabled;
        }
    }

    /**
     * Affiche un écran et masque les autres.
     * @param {HTMLElement} screenToShow L'écran à afficher.
     */
    function showScreen(screenToShow) {
        [selectionScreen, textScannerScreen, cameraScannerScreen].forEach(screen => {
            screen.classList.add('hidden');
        });
        screenToShow.classList.remove('hidden');
    }

    /**
     * Charge l'historique depuis le localStorage.
     */
    function loadHistory() {
        barcodeHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
    }

    /**
     * Affiche l'historique dans toutes les listes d'historique.
     */
    function renderHistory() {
        const historyLists = document.querySelectorAll('.history-list');
        historyLists.forEach(list => {
            list.innerHTML = ''; // Clear the list first
            barcodeHistory.forEach(item => { // item is now an object { isbn, bookInfo, status }
                const li = document.createElement('li');
                let displayContent = item.isbn;

                if (item.status === 'pending') {
                    displayContent += ' (Chargement...)';
                } else if (item.bookInfo && item.bookInfo.title) {
                    const { title, authors, publishedDate, publisher } = item.bookInfo;
                    const authorStr = authors && authors.length > 0 ? `par ${authors.join(', ')}` : '';
                    const yearStr = publishedDate ? `(${publishedDate.substring(0, 4)})` : '';
                    const publisherStr = publisher ? `, ${publisher}` : '';
                    displayContent = `${item.isbn} - ${title} ${authorStr} ${yearStr}${publisherStr}`;
                } else if (item.bookInfo && item.bookInfo.error) {
                    displayContent += ` - erreur:[${item.bookInfo.error}]`;
                }

                li.textContent = displayContent;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.classList.add('delete-barcode-btn');
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent li click if any
                    deleteBarcode(item.isbn); // Pass ISBN to delete
                });

                li.appendChild(deleteButton);
                list.appendChild(li);
            });
        });
    }

    /**
     * Supprime un code-barres de l'historique.
     * @param {string} isbnToDelete L'ISBN à supprimer.
     */
    function deleteBarcode(isbnToDelete) {
        barcodeHistory = barcodeHistory.filter(item => item.isbn !== isbnToDelete);
        localStorage.setItem(historyKey, JSON.stringify(barcodeHistory));
        renderHistory();
    }

    /**
     * Vide complètement l'historique.
     */
    function clearHistory() {
        if (confirm("Êtes-vous sûr de vouloir vider tout l'historique ? Cette action est irréversible.")) {
            barcodeHistory = [];
            localStorage.removeItem(historyKey);
            renderHistory();
            console.log("L'historique a été vidé.");
        }
    }

    /**
     * Synchronise l'historique avec le backend Google Sheets.
     */
    async function syncHistory() {
        const historyToSync = barcodeHistory
            .filter(item => item.status === 'loaded' && item.bookInfo && !item.bookInfo.error)
            .map(item => ({
                Isbn: item.isbn,
                Title: item.bookInfo.title,
                Authors: item.bookInfo.authors,
                PublishedDate: item.bookInfo.publishedDate,
                Publisher: item.bookInfo.publisher
            }));

        if (historyToSync.length === 0) {
            alert("Il n'y a aucun livre dans l'historique à synchroniser.");
            return;
        }

        const sheetUrl = prompt("Veuillez entrer l'URL de votre feuille Google Sheets :");
        if (!sheetUrl) {
            alert("Synchronisation annulée.");
            return;
        }

        // Afficher un indicateur de chargement
        const syncButton = document.getElementById('btn-sync-history');
        const originalButtonText = syncButton.textContent;
        syncButton.textContent = 'Synchronisation...';
        syncButton.disabled = true;

        try {
            const response = await fetch(`${config.backendUrl}/api/sync`, {
                method: 'POST',
                credentials: 'include', // Important for sending cookies cross-origin
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    SheetUrl: sheetUrl,
                    History: historyToSync
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Synchronisation réussie ! ${result.updates.updatedRows || 0} ligne(s) ajoutée(s).`);
            } else if (response.status === 401) {
                alert("Votre session a expiré. Veuillez vous reconnecter.");
                // Rediriger vers la page de connexion du backend, en lui passant l'URL de retour
                window.location.href = `${config.backendUrl}/api/auth/login?returnUrl=${encodeURIComponent(window.location.href)}`;
            } else {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `Le serveur a répondu avec le statut ${response.status}`);
            }
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            alert(`Échec de la synchronisation : ${error.message}`);
        } finally {
            // Restaurer le bouton
            syncButton.textContent = originalButtonText;
            syncButton.disabled = false;
        }
    }

    /**
     * Ajoute un code-barres à l'historique, sauvegarde et met à jour l'affichage.
     * @param {string} barcode Le code-barres à ajouter.
     */
    async function addBarcode(barcode) { // Make it async for future API call
        if (barcode && !barcodeHistory.some(item => item.isbn === barcode)) { // Évite les doublons
            const newItem = { isbn: barcode, bookInfo: null, status: 'pending' }; // Add status for loading indicator
            barcodeHistory.unshift(newItem); // Ajoute au début pour voir les plus récents en premier
            localStorage.setItem(historyKey, JSON.stringify(barcodeHistory));
            renderHistory();
            fetchAndDisplayBookInfo(newItem); // Call the new function to fetch info
        }
    }

    /**
     * Récupère les informations d'un livre depuis l'API Google Books.
     * @param {object} item L'objet de l'historique contenant l'ISBN.
     * @returns {Promise<object>} Une promesse qui résout avec les informations du livre ou un objet d'erreur.
     */
    async function fetchAndDisplayBookInfo(item) {
        isFetchingBookInfo = true;
        toggleScanInputs(true); // Disable inputs at the start of API call

        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${item.isbn}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.totalItems > 0 && data.items && data.items[0].volumeInfo) {
                const volumeInfo = data.items[0].volumeInfo;
                item.bookInfo = {
                    title: volumeInfo.title || 'Titre inconnu',
                    authors: volumeInfo.authors || ['Auteur inconnu'],
                    publishedDate: volumeInfo.publishedDate || 'Date inconnue',
                    publisher: volumeInfo.publisher || 'Éditeur inconnu'
                };
                item.status = 'loaded';
            } else {
                item.bookInfo = { error: 'Livre non trouvé' };
                item.status = 'error';
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des infos du livre:", error);
            item.bookInfo = { error: `API_ERROR: ${error.message}` };
            item.status = 'error';
            // Check for rate limit error (Étape 7.5)
            if (error.message.includes('403') || error.message.includes('rate limit')) { // Basic check, might need refinement
                alert("Attention : La limite d'utilisation de l'API Google Books a peut-être été atteinte.");
            }
        } finally {
            localStorage.setItem(historyKey, JSON.stringify(barcodeHistory));
            renderHistory();
            isFetchingBookInfo = false;
            toggleScanInputs(false); // Enable inputs after API call
        }
    }

    /**
     * Gère le succès du scan par caméra.
     * @param {string} decodedText Le code-barres décodé.
     */
    function onScanSuccess(decodedText) {
        cameraScanResult.textContent = `✅ Scan réussi : ${decodedText}`;
        addBarcode(decodedText);
    }

    /**
     * Démarre le scanner de la caméra.
     */
    function startCameraScanner() {
        if (typeof Html5Qrcode === 'undefined') {
            cameraScanResult.textContent = "❌ Erreur: La librairie de scan n'a pas pu être chargée.";
            return;
        }

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        if (html5QrCode.isScanning) {
            return;
        }
        
        showScreen(cameraScannerScreen); // Ensure screen is visible before starting scanner
        renderHistory(); // Affiche l'historique sur l'écran caméra
        cameraScanResult.textContent = "Démarrage de la caméra...";
        
        const readerDiv = document.getElementById('reader');
        console.log('Dimensions of #reader before start:', readerDiv.offsetWidth, readerDiv.offsetHeight);

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
            .then(() => {
                console.log("Scanner démarré.");
            })
            .catch(err => {
                cameraScanResult.textContent = `❌ Erreur: ${err}. Assurez-vous d'utiliser HTTPS.`;
                console.error("Erreur au démarrage de la caméra : ", err);
                console.error("Détails de l'erreur :", err.name, err.message, err.stack);
                showScreen(selectionScreen); // Retour au menu en cas d'erreur
            });
    }

    /**
     * Arrête le scanner de la caméra.
     */
    function stopCameraScanner() {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop()
                .then(() => {
                    console.log("Scanner arrêté.");
                    cameraScanResult.textContent = "";
                })
                .catch(err => console.error("Erreur à l'arrêt du scanner : ", err));
        }
    }

    // --- Écouteurs d'événements ---

    btnSelectCamera.addEventListener('click', startCameraScanner);

    btnSelectText.addEventListener('click', () => {
        showScreen(textScannerScreen);
        renderHistory(); // Affiche l'historique sur l'écran texte
        setTimeout(() => barcodeInput.focus(), 0); // Focus après la transition
    });

    btnClearHistory.addEventListener('click', clearHistory);

    btnSyncHistory.addEventListener('click', syncHistory);

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            stopCameraScanner();
            showScreen(selectionScreen);
        });
    });

    barcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const barcode = barcodeInput.value.trim();
            if (barcode) {
                addBarcode(barcode);
                barcodeInput.value = '';
            }
        }
    });
    
    // Maintient le focus sur l'input en mode texte
    barcodeInput.addEventListener('blur', () => {
        // Le timeout évite des problèmes si on change d'écran
        if (!textScannerScreen.classList.contains('hidden')) {
            setTimeout(() => barcodeInput.focus(), 100);
        }
    });

    // --- Initialisation ---
    loadHistory();
    showScreen(selectionScreen); // Affiche l'écran de sélection au démarrage
    renderHistory(); // Initial render in case there's old data

    // Vérification HTTPS au démarrage
    if (window.location.protocol !== 'https:') {
        httpsWarningMessage.classList.remove('hidden');
        btnSelectCamera.disabled = true;
        btnSelectCamera.textContent = "Scanner avec la caméra (HTTPS requis)";
        btnSelectCamera.style.opacity = '0.6';
        btnSelectCamera.style.cursor = 'not-allowed';
    }
});
