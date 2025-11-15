document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments du DOM ---
    const selectionScreen = document.getElementById('selection-screen');
    const textScannerScreen = document.getElementById('text-scanner-screen');
    const cameraScannerScreen = document.getElementById('camera-scanner-screen');

    const btnSelectCamera = document.getElementById('btn-select-camera');
    const btnSelectText = document.getElementById('btn-select-text');
    const btnClearHistory = document.getElementById('btn-clear-history');
    const backButtons = document.querySelectorAll('.btn-back');

    const barcodeInput = document.getElementById('barcode-input');
    const cameraScanResult = document.getElementById('camera-scan-result');
    const httpsWarningMessage = document.getElementById('https-warning-message');

    // --- State de l'application ---
    let barcodeHistory = [];
    const historyKey = 'barcodeHistory';
    let html5QrCode = null;

    // --- Fonctions ---

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
            barcodeHistory.forEach(barcode => {
                const li = document.createElement('li');
                li.textContent = barcode;
                list.appendChild(li);
            });
        });
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
     * Ajoute un code-barres à l'historique, sauvegarde et met à jour l'affichage.
     * @param {string} barcode Le code-barres à ajouter.
     */
    function addBarcode(barcode) {
        if (barcode && !barcodeHistory.includes(barcode)) { // Évite les doublons
            barcodeHistory.unshift(barcode); // Ajoute au début pour voir les plus récents en premier
            localStorage.setItem(historyKey, JSON.stringify(barcodeHistory));
            renderHistory();
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
        
        cameraScanResult.textContent = "Démarrage de la caméra...";
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
            .then(() => {
                console.log("Scanner démarré.");
                showScreen(cameraScannerScreen);
                renderHistory(); // Affiche l'historique sur l'écran caméra
            })
            .catch(err => {
                cameraScanResult.textContent = `❌ Erreur: ${err}. Assurez-vous d'utiliser HTTPS.`;
                console.error("Erreur au démarrage de la caméra : ", err);
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
    renderHistory(); // Initial render in case there's old data
    showScreen(selectionScreen); // Affiche l'écran de sélection au démarrage

    // Vérification HTTPS au démarrage
    if (window.location.protocol !== 'https:') {
        httpsWarningMessage.classList.remove('hidden');
        btnSelectCamera.disabled = true;
        btnSelectCamera.textContent = "Scanner avec la caméra (HTTPS requis)";
        btnSelectCamera.style.opacity = '0.6';
        btnSelectCamera.style.cursor = 'not-allowed';
    }
});

// --- Enregistrement du Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker enregistré avec succès:', registration);
            })
            .catch(error => {
                console.log('Échec de l\'enregistrement du Service Worker:', error);
            });
    });
}
