document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const TEXT_SCAN_STORAGE_KEY = 'bib-text-scans';
    const CAMERA_SCAN_STORAGE_KEY = 'bib-camera-scans';

    // --- Screen Management Elements ---
    const selectionScreen = document.getElementById('selection-screen');
    const textScannerScreen = document.getElementById('text-scanner-screen');
    const cameraScannerScreen = document.getElementById('camera-scanner-screen');

    const btnSelectCamera = document.getElementById('btn-select-camera');
    const btnSelectText = document.getElementById('btn-select-text');
    const backButtons = document.querySelectorAll('.btn-back');

    // --- Text Scanner Elements ---
    const barcodeInput = document.getElementById('barcode-input');
    const textHistoryList = document.getElementById('text-history-list');

    // --- Camera Scanner Elements ---
    const cameraReader = document.getElementById('reader');
    const cameraScanResult = document.getElementById('camera-scan-result');
    const cameraHistoryList = document.getElementById('camera-history-list');
    let html5QrCode; // Will be initialized later

    // --- Screen Management Logic ---
    const showScreen = (screen) => {
        selectionScreen.classList.add('hidden');
        textScannerScreen.classList.add('hidden');
        cameraScannerScreen.classList.add('hidden');

        if (screen) {
            screen.classList.remove('hidden');
        }
    };

    // --- History & Storage Logic ---
    const renderHistory = (listElement, history) => {
        listElement.innerHTML = '';
        history.forEach(code => {
            const li = document.createElement('li');
            li.textContent = code;
            listElement.appendChild(li);
        });
    };

    const getHistory = (storageKey) => {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    };

    const saveScan = (code, storageKey) => {
        const history = getHistory(storageKey);
        if (code && !history.includes(code)) {
            history.unshift(code);
            localStorage.setItem(storageKey, JSON.stringify(history));
        }
        return history;
    };

    // --- Camera Logic ---
    const startCamera = () => {
        if (typeof Html5Qrcode === 'undefined') {
            cameraScanResult.textContent = "❌ Erreur: La librairie de scan n'a pas pu être chargée.";
            return;
        }

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }
        cameraScanResult.textContent = "Démarrage de la caméra...";
        
        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            cameraScanResult.textContent = `✅ Scan réussi : ${decodedText}`;
            const updatedHistory = saveScan(decodedText, CAMERA_SCAN_STORAGE_KEY);
            renderHistory(cameraHistoryList, updatedHistory);
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
            .catch(err => {
                cameraScanResult.textContent = `❌ Erreur: ${err}. Assurez-vous d'utiliser HTTPS.`;
                console.error("Unable to start scanning.", err);
            });
    };

    const stopCamera = () => {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
                console.log("QR Code scanning stopped.");
                cameraScanResult.textContent = "";
            }).catch(err => {
                console.error("Failed to stop scanning.", err);
            });
        }
    };

    // --- Event Listeners ---

    // Navigation
    btnSelectText.addEventListener('click', () => {
        showScreen(textScannerScreen);
        const history = getHistory(TEXT_SCAN_STORAGE_KEY);
        renderHistory(textHistoryList, history);
        setTimeout(() => barcodeInput.focus(), 0);
    });

    btnSelectCamera.addEventListener('click', () => {
        showScreen(cameraScannerScreen);
        const history = getHistory(CAMERA_SCAN_STORAGE_KEY);
        renderHistory(cameraHistoryList, history);
        startCamera();
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            stopCamera(); // Stop camera if it's running
            showScreen(selectionScreen);
        });
    });

    // Text Scanner Logic
    barcodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const code = barcodeInput.value.trim();
            if (code) {
                const updatedHistory = saveScan(code, TEXT_SCAN_STORAGE_KEY);
                renderHistory(textHistoryList, updatedHistory);
                barcodeInput.value = '';
            }
        }
    });
    
    barcodeInput.addEventListener('blur', () => {
        setTimeout(() => barcodeInput.focus(), 100);
    });

    // --- Initial State ---
    showScreen(selectionScreen);
});
