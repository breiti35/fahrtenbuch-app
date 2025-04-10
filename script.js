// === script.js ===
// Stand: 2025-04-08, Finale Version mit Modal-Dialog für Fahrzeuge

document.addEventListener('DOMContentLoaded', function() {

    console.log("Fahrtenbuch App: DOM geladen.");

    // ========================================================================
    // === 1. Konstanten & Referenzen auf HTML-Elemente ===
    // ========================================================================
    // Hauptformular (Fahrten)
    const formularDiv = document.getElementById('fahrt-formular');
    const tripEntryForm = document.getElementById('trip-entry-form');
    const speichernButton = document.getElementById('speichern-btn');
    const cancelEditButton = document.getElementById('cancel-edit-btn');
    const datumInput = document.getElementById('datum');
    const startTimeInput = document.getElementById('start-zeit');
    const endTimeInput = document.getElementById('end-zeit');
    const startOrtInput = document.getElementById('start-ort');
    const zielOrtInput = document.getElementById('ziel-ort');
    const kmStartInput = document.getElementById('km-start');
    const kmEndeInput = document.getElementById('km-ende');
    const distanzInput = document.getElementById('distanz');
    const carSelect = document.getElementById('car-select');
    const zweckSelect = document.getElementById('zweck');
    // Listen & Anzeigen
    const fahrtenListeDiv = document.getElementById('fahrten-liste');
    const zusammenfassungDiv = document.getElementById('zusammenfassung');
    const carListUl = document.getElementById('car-list'); // Fahrzeugliste rechts
    // Sidebar & Header Buttons
    const exportButton = document.getElementById('export-csv-btn');
    const exportJsonButton = document.getElementById('export-json-btn');
    const importJsonButton = document.getElementById('import-json-btn');
    const importJsonFileInput = document.getElementById('import-json-file');
    const addNewButton = document.getElementById('add-new-btn'); // + Neue Fahrt
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const sidebarToggleButton = document.getElementById('sidebar-toggle-internal'); // Sidebar-Toggle
    const addCarMenuButton = document.getElementById('add-car-btn-menu'); // Neues Fahrzeug im Menü
    // Fahrzeug Modal Elemente
    const addCarModal = document.getElementById('add-car-modal');
    const modalCloseButton = document.getElementById('modal-close-btn');
    const modalCancelButton = document.getElementById('modal-cancel-car-btn');
    const modalSaveButton = document.getElementById('modal-save-car-btn');
    const modalCarForm = document.getElementById('modal-car-form');
    const modalCarNameInput = document.getElementById('modal-car-name');
    const modalCarPlateInput = document.getElementById('modal-car-plate');
    const modalCarError = document.getElementById('modal-car-error');


    // ========================================================================
    // === 2. Statusvariablen ===
    // ========================================================================
    let editId = null; // ID der Fahrt, die bearbeitet wird (null = keine Bearbeitung)
    let editCarId = null; // ID des Fahrzeugs, das bearbeitet wird (null = keine Bearbeitung)
    let cars = [];     // Array für die Fahrzeugliste


    // ========================================================================
    // === 3. Hilfsfunktionen ===
    // ========================================================================
    /**
     * Formatiert ein ISO-Datum (JJJJ-MM-TT) in das deutsche Format (TT.MM.JJJJ).
     */
    function formatDateDE(isoDate) {
        if (!isoDate) return '';
        const p = isoDate.split('-');
        if (p.length === 3) return `${p[2]}.${p[1]}.${p[0]}`;
        return isoDate;
    }

    /**
     * Gibt das aktuelle Datum als String im JJJJ-MM-TT Format zurück.
     * (Aktuell statisch für Konsistenz beim Testen)
     */
    function getDatumString() {
        // return new Date().toISOString().slice(0, 10); // Dynamisch
        return "2025-04-08"; // Statisch
    }


    // ========================================================================
    // === 4. Theme (Dark Mode) Funktionen ===
    // ========================================================================
    /**
     * Setzt das Theme (CSS-Klasse am Body und Icon im Button).
     * @param {string} mode - 'light' oder 'dark'.
     */
    function setTheme(mode) {
        const icon = themeToggleButton?.querySelector('i.fa-solid');
        if (mode === 'dark') {
            document.body.classList.add('dark-mode');
            if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
            themeToggleButton?.setAttribute('title', 'Light Mode aktivieren');
        } else {
            document.body.classList.remove('dark-mode');
            if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
            themeToggleButton?.setAttribute('title', 'Dark Mode aktivieren');
        }
        console.log("Theme gesetzt:", mode);
    }

    /**
     * Handler für Klick auf den Theme-Toggle-Button.
     */
    function handleThemeToggle() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newMode = isDarkMode ? 'light' : 'dark';
        setTheme(newMode);
        try {
            localStorage.setItem('theme', newMode);
        } catch (e) {
            console.error("Fehler beim Speichern der Theme-Präferenz:", e);
        }
    }

    /**
     * Lädt die Theme-Präferenz beim Start (localStorage oder System) und wendet sie an.
     */
    function loadAndSetInitialTheme() {
        let preferredTheme = 'light'; // Standard
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                preferredTheme = savedTheme;
            } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
                preferredTheme = 'dark';
            }
        } catch (e) {
            console.error("Fehler beim Lesen der Theme-Präferenz:", e);
        }
        setTheme(preferredTheme);
    }


    // ========================================================================
    // === 5. Sidebar Toggle Funktionen ===
    // ========================================================================
    /**
     * Setzt den Sidebar-Zustand (CSS-Klasse am Body und Icon im Button).
     * @param {boolean} collapsed - true, wenn Sidebar eingeklappt sein soll.
     */
    function setSidebarState(collapsed) {
        const icon = sidebarToggleButton?.querySelector('i.fa-solid');
        if (collapsed) {
            document.body.classList.add('sidebar-collapsed');
            if (icon) { icon.classList.remove('fa-chevron-left'); icon.classList.add('fa-bars'); }
            sidebarToggleButton?.setAttribute('title', 'Menü öffnen');
        } else {
            document.body.classList.remove('sidebar-collapsed');
            if (icon) { icon.classList.remove('fa-bars'); icon.classList.add('fa-chevron-left'); }
            sidebarToggleButton?.setAttribute('title', 'Menü schließen');
        }
    }

    /**
     * Handler für Klick auf den Sidebar-Toggle-Button.
     */
    function handleSidebarToggle() {
        const isCollapsed = document.body.classList.contains('sidebar-collapsed');
        setSidebarState(!isCollapsed); // Zustand umschalten
        try {
            localStorage.setItem('sidebarCollapsed', !isCollapsed);
        } catch (e) {
            console.error("Fehler beim Speichern des Sidebar-Zustands:", e);
        }
    }

    /**
     * Lädt den Sidebar-Zustand beim Start (localStorage) und wendet ihn an.
     */
    function loadAndSetInitialSidebarState() {
        let collapsed = false; // Standard: ausgeklappt
        try {
            const savedState = localStorage.getItem('sidebarCollapsed');
            if (savedState === 'true') { // localStorage speichert Strings
                collapsed = true;
            }
        } catch (e) {
            console.error("Fehler beim Laden des Sidebar-Zustands:", e);
        }
        setSidebarState(collapsed); // Initialen Zustand anwenden
    }


    // ========================================================================
    // === 6. Fahrzeug-Verwaltungsfunktionen ===
    // ========================================================================
    /**
     * Lädt die Fahrzeugliste aus dem localStorage.
     */
    function loadCars() {
        const storedCars = localStorage.getItem('fahrtenbuchCars');
        try {
            // Stellt sicher, dass cars immer ein Array ist
            const parsedCars = storedCars ? JSON.parse(storedCars) : [];
            cars = Array.isArray(parsedCars) ? parsedCars : [];
            console.log(`${cars.length} Fahrzeuge geladen.`);
        } catch (e) {
            console.error("Fehler beim Laden der Fahrzeuge:", e);
            cars = []; // Im Fehlerfall leeres Array
        }
        // Stellt sicher, dass jedes Auto eine ID hat (für Altdaten)
        cars.forEach(car => {
            if (!car.id) {
                car.id = Date.now() + Math.random().toString(16).slice(2);
            }
        });
        // Optional: Zurückspeichern, falls IDs hinzugefügt wurden
        // if (cars.some(car => !storedCars || !storedCars.includes(car.id))) {
        //    saveCars();
        // }
    }

    /**
     * Speichert das aktuelle 'cars'-Array im localStorage.
     */
    function saveCars() {
        try {
            localStorage.setItem('fahrtenbuchCars', JSON.stringify(cars));
            console.log("Fahrzeuge gespeichert.");
        } catch (e) {
            console.error("Fehler beim Speichern der Fahrzeuge:", e);
            alert("Fehler beim Speichern der Fahrzeuge!");
        }
    }

/**
     * Zeigt die Liste der angelegten Fahrzeuge im HTML (rechte Spalte) an,
     * jetzt mit Bearbeiten- und Löschen-Buttons.
     */
function displayCarList() {
    if (!carListUl) {
        console.error("Element für Fahrzeugliste (UL) nicht gefunden!");
        return;
    }
    carListUl.innerHTML = ''; // Liste leeren
    if (cars.length === 0) {
        carListUl.innerHTML = '<li>Keine Fahrzeuge angelegt.</li>';
    } else {
        // Sortieren nach Name für konsistente Anzeige
        cars.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        cars.forEach(car => {
            const li = document.createElement('li');
            // WICHTIG: Füge Flexbox-Styling direkt zum li hinzu für die Ausrichtung
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            // Setze data-car-id direkt am li, damit wir es später leichter finden
            li.setAttribute('data-car-id', car.id);

            const carNameText = car.name || 'Unbenannt';
            const carPlateText = car.plate ? ` (${car.plate})` : '';

            // Container für Icon, Name und Kennzeichen
            const carInfoSpan = document.createElement('span');
            carInfoSpan.innerHTML = `
                <i class="fa-solid fa-car-side fa-fw car-list-icon" style="margin-right: 8px;"></i>
                <span>${carNameText}</span>
                <strong style="margin-left: 5px;">${carPlateText}</strong>
            `;

            // Container für die Buttons
            const carActionsSpan = document.createElement('span');
            carActionsSpan.classList.add('car-actions'); // Klasse für Styling
            carActionsSpan.innerHTML = `
                <button class="edit-car-btn" title="Fahrzeug bearbeiten" data-car-id="${car.id}" style="background: none; border: none; cursor: pointer; font-size: 0.9rem; padding: 2px 5px; color: var(--text-secondary); margin-left: 8px;">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="delete-car-btn" title="Fahrzeug löschen" data-car-id="${car.id}" style="background: none; border: none; cursor: pointer; font-size: 0.9rem; padding: 2px 5px; color: var(--text-secondary); margin-left: 4px;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            li.appendChild(carInfoSpan);
            li.appendChild(carActionsSpan);
            carListUl.appendChild(li);
        });
    }
}

    /**
     * Füllt das Dropdown-Menü im Hauptformular (Fahrten) mit den Fahrzeugen.
     */
    function populateCarDropdown() {
        if (!carSelect) {
            console.error("Fahrzeugauswahl-Dropdown nicht gefunden!");
            return;
        }
        const aktuellerWert = carSelect.value; // Aktuellen Wert merken
        // Alle Optionen außer der ersten (-- Bitte wählen --) entfernen
        while (carSelect.options.length > 1) {
            carSelect.remove(1);
        }
        // Sortierte Fahrzeuge hinzufügen
        cars.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        cars.forEach(car => {
            const option = document.createElement('option');
            option.value = car.id;
            option.textContent = `${car.name || 'Unbenannt'}${car.plate ? ` (${car.plate})` : ''}`;
            carSelect.appendChild(option);
        });
        // Versuchen, den alten Wert wieder auszuwählen
        carSelect.value = aktuellerWert;
    }

    // --- Modal-Funktionen für Fahrzeuge ---
    /**
     * Öffnet den Modal-Dialog zum Hinzufügen eines Fahrzeugs.
     */
    function openAddCarModal() {
        if (!addCarModal || !modalCarForm) return;
        console.log("Öffne Fahrzeug-Modal...");
        modalCarForm.reset();
        if (modalCarError) {
            modalCarError.textContent = '';
            modalCarError.style.display = 'none';
        }
        addCarModal.classList.add('modal-visible');
        setTimeout(() => {
            modalCarNameInput?.focus();
        }, 50);
    }

 /**
     * Schließt den Modal-Dialog zum Hinzufügen/Bearbeiten eines Fahrzeugs
     * und setzt den Bearbeitungsstatus zurück.
     */
 function closeAddCarModal() {
    if (!addCarModal) return;
    addCarModal.classList.remove('modal-visible');

    // WICHTIG: Bearbeitungsstatus zurücksetzen
    editCarId = null;

    // Titel und Button-Text auf Standard zurücksetzen
    const modalTitle = addCarModal.querySelector('.modal-header h2');
    if (modalTitle) modalTitle.textContent = 'Neues Fahrzeug hinzufügen';
    if (modalSaveButton) modalSaveButton.textContent = 'Fahrzeug speichern';

    // Optional: Formular leeren, falls gewünscht (war vorher nicht drin)
    // modalCarForm?.reset();
    // if (modalCarError) {
    //     modalCarError.textContent = '';
    //     modalCarError.style.display = 'none';
    // }
    console.log("Modal geschlossen, Edit-Status zurückgesetzt.");
}

    /**
     * Verarbeitet das Speichern aus dem Modal-Dialog.
     * Unterscheidet zwischen Hinzufügen eines neuen Fahrzeugs und
     * Aktualisieren eines bestehenden Fahrzeugs.
     */
    function handleModalSaveCar() {
        const name = modalCarNameInput?.value.trim();
        const plate = modalCarPlateInput?.value.trim();

        // --- Grundlegende Validierung (gilt für Neu und Bearbeiten) ---
        if (!name || !plate) {
            showModalError("Bitte Name/Modell und Kennzeichen eingeben.");
            return; // Nicht weitermachen, wenn Felder leer sind
        }

        // --- Prüfen, ob wir im Bearbeiten-Modus sind ---
        if (editCarId !== null) {
            // === BEARBEITEN-MODUS ===
            console.log("Speichere Änderungen für Fahrzeug-ID:", editCarId);

            // Zusätzliche Validierung: Prüfen, ob ein *anderes* Auto dieses Kennzeichen bereits hat
            const otherCarHasSamePlate = cars.some(car =>
                car.id.toString() !== editCarId.toString() && // Ignoriere das Auto, das wir gerade bearbeiten
                car.plate.toLowerCase() === plate.toLowerCase() // Prüfe auf gleiches Kennzeichen (Groß/Klein egal)
            );
            if (otherCarHasSamePlate) {
                showModalError(`Ein anderes Fahrzeug (${cars.find(c => c.plate.toLowerCase() === plate.toLowerCase())?.name || '?'}) hat bereits das Kennzeichen "${plate}".`);
                return; // Speichern verhindern
            }

            // Finde das zu bearbeitende Auto im Array
            const carToUpdate = cars.find(car => car.id.toString() === editCarId.toString());

            if (carToUpdate) {
                // Aktualisiere die Daten des Autos im Array
                carToUpdate.name = name;
                carToUpdate.plate = plate;

                // Speichern, UI aktualisieren und Modal schließen
                saveCars();
                displayCarList();
                populateCarDropdown();
                console.log("Fahrzeug erfolgreich aktualisiert:", carToUpdate);
                closeAddCarModal(); // Schließt Modal und setzt editCarId zurück
                // alert("Änderungen gespeichert."); // Optional
            } else {
                console.error("Fehler beim Speichern: Zu bearbeitendes Fahrzeug nicht mehr im Array gefunden, ID:", editCarId);
                alert("Fehler: Das zu bearbeitende Fahrzeug konnte nicht gefunden werden.");
                closeAddCarModal(); // Modal trotzdem schließen
            }

        } else {
            // === HINZUFÜGEN-MODUS (Original-Logik) ===
            console.log("Speichere neues Fahrzeug...");

            // Validierung (Original): Prüfen, ob Kennzeichen schon existiert
            if (cars.some(car => car.plate.toLowerCase() === plate.toLowerCase())) {
                // Hinweis statt Fehler, Speichern trotzdem erlauben (wie vorher)
                showModalError(`Hinweis: Ein Fahrzeug mit dem Kennzeichen "${plate}" existiert bereits.`);
                return;
                // Optional: return; wenn Duplikate komplett verhindert werden sollen
            } else {
                 // Alten Fehler löschen, wenn keine Duplikatwarnung nötig ist
                 if (modalCarError) {
                    modalCarError.textContent = '';
                    modalCarError.style.display = 'none';
                 }
            }

            // Neues Fahrzeugobjekt
            const newCar = {
                id: Date.now() + Math.random().toString(16).slice(2),
                name: name,
                plate: plate
            };

            // Speichern und UI aktualisieren
            cars.push(newCar);
            saveCars();
            displayCarList();
            populateCarDropdown();

            console.log("Neues Fahrzeug gespeichert (via Modal):", newCar);
            closeAddCarModal(); // Schließt Modal
        }
    }
    /**
     * Öffnet den Modal-Dialog zum Bearbeiten eines vorhandenen Fahrzeugs.
     * @param {string|number} carId Die ID des zu bearbeitenden Fahrzeugs.
     */
    function openEditCarModal(carId) {
    if (!addCarModal || !modalCarForm) return;
    console.log("Öffne Fahrzeug-Modal zum Bearbeiten für ID:", carId);

    // Finde das zu bearbeitende Fahrzeug im 'cars'-Array
    const carToEdit = cars.find(car => car.id.toString() === carId.toString());

    if (!carToEdit) {
        console.error("Zu bearbeitendes Fahrzeug nicht gefunden, ID:", carId);
        alert("Fehler: Zu bearbeitendes Fahrzeug nicht gefunden.");
        return;
    }

    // Setze die globale Variable für den Bearbeitungsmodus
    editCarId = carId;

    // Modal-Formular mit den Daten des Fahrzeugs füllen
    modalCarNameInput.value = carToEdit.name;
    modalCarPlateInput.value = carToEdit.plate;

    // Fehlermeldung zurücksetzen
    if (modalCarError) {
        modalCarError.textContent = '';
        modalCarError.style.display = 'none';
    }

    // Titel und Button-Text im Modal anpassen
    const modalTitle = addCarModal.querySelector('.modal-header h2');
    if (modalTitle) modalTitle.textContent = 'Fahrzeug bearbeiten';
    if (modalSaveButton) modalSaveButton.textContent = 'Änderungen speichern';

    // Modal sichtbar machen
    addCarModal.classList.add('modal-visible');
    setTimeout(() => {
        modalCarNameInput?.focus(); // Fokus auf erstes Feld
    }, 50);
    }
    /**
     * Zeigt eine Fehlermeldung im Modal an.
     * @param {string} message - Die anzuzeigende Fehlermeldung.
     */
    function showModalError(message) {
        if (!modalCarError) return;
        modalCarError.textContent = message;
        modalCarError.style.display = 'block';
    }


    // ========================================================================
    // === 7. Kernfunktionen (Fahrten: Speichern, Update, Edit-Modus) ===
    // ========================================================================
    /**
     * Bereitet die Formularfelder für die Eingabe einer neuen Fahrt vor.
     * Versucht, Start-Ort und KM-Stand von der letzten Fahrt zu übernehmen.
     */
    function felderFuerNeueFahrtVorbereiten() {
        if (editId !== null) return; // Nur ausführen, wenn nicht im Edit-Modus

        console.log("Bereite Felder für neue Fahrt vor...");
        try {
            const alleFahrten = ladeFahrtenAusLocalStorage(); // Holt sortierte Fahrten
            if (alleFahrten.length > 0) {
                // Finde die absolut letzte Fahrt (unabhängig vom Fahrzeug)
                const letzteFahrt = alleFahrten[alleFahrten.length - 1];
                if (letzteFahrt) {
                    startOrtInput.value = letzteFahrt.zielOrt || '';
                    kmStartInput.value = letzteFahrt.kmEnde || '';
                    // Optional: Fahrzeug der letzten Fahrt vorauswählen?
                    // carSelect.value = letzteFahrt.carId || '';
                } else {
                    startOrtInput.value = '';
                    kmStartInput.value = '';
                }
            } else {
                // Wenn noch keine Fahrten existieren
                startOrtInput.value = '';
                kmStartInput.value = '';
            }
            // Restliche Felder zurücksetzen
            datumInput.value = getDatumString();
            zielOrtInput.value = '';
            distanzInput.value = '';
            startTimeInput.value = '';
            endTimeInput.value = '';
            zweckSelect.value = 'geschaeftlich'; // Standardzweck
            if (!carSelect.value && cars.length > 0) {
                 // Wenn kein Auto ausgewählt ist, aber Autos existieren, das erste auswählen?
                 // carSelect.value = cars[0].id; // Sortiert nach Name
            }
            berechneUndZeigeDistanz(); // Initiale Distanzberechnung (wird 0 sein)
        } catch (e) {
            console.error("Fehler beim Vorbelegen der Felder für neue Fahrt:", e);
        }
    }

    /**
     * Handler für Klick auf "Fahrt speichern" / "Änderung speichern".
     */
    function handleFormularSpeichern() {
        console.log("Speichern/Update Button geklickt. Edit ID:", editId);
        let erfolg = false;
        if (editId !== null) {
            erfolg = fahrtAktualisieren(editId);
        } else {
            erfolg = fahrtSpeichern();
        }
        // Formular nur bei Erfolg schließen
        if (erfolg && formularDiv) {
            formularDiv.classList.remove('form-visible');
            console.log("Formular nach erfolgreichem Speichern/Update geschlossen.");
        } else {
            console.log("Speichern/Update nicht erfolgreich oder Formular nicht gefunden.");
        }
    }

    /**
     * Startet den Bearbeitungsmodus für eine Fahrt.
     * @param {string|number} fahrtId - Die ID der zu bearbeitenden Fahrt.
     */
    function starteEditModus(fahrtId) {
        console.log("Starte Edit-Modus für ID:", fahrtId);
        const fahrten = ladeFahrtenAusLocalStorage();
        const fahrt = fahrten.find(f => f.id.toString() === fahrtId.toString());

        if (!fahrt) {
            alert("Fehler: Zu bearbeitender Eintrag nicht gefunden!");
            return;
        }

        // Formular mit den Daten der Fahrt füllen
        datumInput.value = fahrt.datum || '';
        startTimeInput.value = fahrt.startTime || '';
        endTimeInput.value = fahrt.endTime || '';
        startOrtInput.value = fahrt.startOrt || '';
        zielOrtInput.value = fahrt.zielOrt || '';
        kmStartInput.value = fahrt.kmStart || '';
        kmEndeInput.value = fahrt.kmEnde || '';
        distanzInput.value = fahrt.distanz || '';
        carSelect.value = fahrt.carId || '';
        zweckSelect.value = fahrt.zweck || 'geschaeftlich';

        // Status setzen und UI anpassen
        editId = fahrtId; // Wichtig: Setzt den Edit-Modus
        speichernButton.textContent = 'Änderung speichern';
        cancelEditButton?.style.setProperty('display', 'inline-block'); // Abbrechen-Button zeigen

        // Formular anzeigen und hinscrollen
        if (formularDiv) {
            formularDiv.classList.add('form-visible');
            formularDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        datumInput?.focus(); // Fokus auf erstes Feld
    }

    /**
     * Bricht den Edit-Modus ab oder setzt das Formular zurück.
     * @param {boolean} [doScroll=true] - Ob zum Formular gescrollt werden soll (relevant?)
     */
    function abbrechenEditModus(doScroll = true) { // doScroll wird hier nicht wirklich verwendet
        console.log("Breche Edit ab / Setze Formular zurück.");
        editId = null; // Edit-Modus beenden
        if (tripEntryForm) {
            tripEntryForm.reset(); // Formular-Inhalte löschen
        } else {
            console.error("tripEntryForm nicht gefunden zum Zurücksetzen!");
        }
        // Formular ausblenden (wird ggf. direkt danach wieder eingeblendet)
        if (formularDiv) {
            formularDiv.classList.remove('form-visible');
        }
        // Button-Texte und Sichtbarkeiten zurücksetzen
        if (speichernButton) speichernButton.textContent = 'Fahrt speichern';
        if (cancelEditButton) cancelEditButton.style.display = 'none';

        // Felder für *neue* Fahrt vorbereiten (setzt Datum, KM etc.)
        felderFuerNeueFahrtVorbereiten();
        console.log("Edit abgebrochen / Formular zurückgesetzt.");
    }

    /**
     * Aktualisiert eine vorhandene Fahrt im Speicher und in der Anzeige.
     * @param {string|number} id - Die ID der zu aktualisierenden Fahrt.
     * @returns {boolean} - true bei Erfolg, false bei Fehler.
     */
    function fahrtAktualisieren(id) {
        console.log("Aktualisiere Fahrt mit ID:", id);
        const fahrtData = {
            id: id, // Behält die Original-ID
            datum: datumInput.value,
            startTime: startTimeInput.value,
            endTime: endTimeInput.value,
            startOrt: startOrtInput.value,
            zielOrt: zielOrtInput.value,
            kmStart: kmStartInput.value,
            kmEnde: kmEndeInput.value,
            distanz: distanzInput.value,
            carId: carSelect.value,
            zweck: zweckSelect.value
        };

        // Validieren (ohne KM-Kontinuitätsprüfung beim Update)
        if (!validateFahrt(fahrtData, false)) {
            return false; // Validierung fehlgeschlagen
        }

        let fahrten = ladeFahrtenAusLocalStorage();
        const index = fahrten.findIndex(f => f.id.toString() === id.toString());

        if (index !== -1) {
            fahrten[index] = fahrtData; // Ersetze alte Daten
            speichereAlleFahrten(fahrten); // Speicher das geänderte Array
            console.log("Fahrt erfolgreich aktualisiert.");
            ladeGespeicherteFahrten(); // Liste neu laden
            updateZusammenfassung();   // Zusammenfassung aktualisieren
            abbrechenEditModus(false); // Edit-Modus beenden und Formular zurücksetzen/schließen
            return true;
        } else {
            alert("Fehler beim Update: Eintrag nicht gefunden!");
            abbrechenEditModus(false); // Edit-Modus trotzdem beenden
            return false;
        }
    }

    /**
     * Speichert eine komplett neue Fahrt.
     * @returns {boolean} - true bei Erfolg, false bei Fehler.
     */
    function fahrtSpeichern() {
        console.log("Speichere neue Fahrt...");
        const neueFahrt = {
            id: Date.now(), // Zeitstempel als einfache ID
            datum: datumInput.value,
            startTime: startTimeInput.value,
            endTime: endTimeInput.value,
            startOrt: startOrtInput.value,
            zielOrt: zielOrtInput.value,
            kmStart: kmStartInput.value,
            kmEnde: kmEndeInput.value,
            distanz: distanzInput.value,
            carId: carSelect.value,
            zweck: zweckSelect.value
        };

        // Validieren (MIT KM-Kontinuitätsprüfung)
        if (!validateFahrt(neueFahrt, true)) {
            return false; // Validierung fehlgeschlagen
        }

        console.log('Neue Fahrt validiert:', neueFahrt);
        speichereNeueFahrtImLocalStorage(neueFahrt); // Zum Array hinzufügen und speichern
        ladeGespeicherteFahrten(); // Liste neu laden
        updateZusammenfassung();   // Zusammenfassung aktualisieren
        felderFuerNeueFahrtVorbereiten(); // Felder für die *nächste* neue Fahrt vorbereiten
        zielOrtInput?.focus(); // Fokus auf Zielort für schnelle Folgeeingabe?
        return true;
    }


    // ========================================================================
    // === 8. Validierungsfunktion (Fahrten) ===
    // ========================================================================
    /**
     * Prüft ein Fahrt-Objekt auf Gültigkeit.
     * @param {object} fahrt - Das zu prüfende Fahrt-Objekt.
     * @param {boolean} checkKmContinuity - Soll die KM-Kontinuität geprüft werden?
     * @returns {boolean} true, wenn valide, sonst false.
     */
    function validateFahrt(fahrt, checkKmContinuity) {
        console.log("Validiere Fahrt:", fahrt, "Kontinuität prüfen:", checkKmContinuity);

        // Pflichtfelder prüfen
        if (!fahrt.datum || !fahrt.startTime || !fahrt.endTime || !fahrt.startOrt || !fahrt.zielOrt || fahrt.kmStart === '' || fahrt.kmEnde === '' || !fahrt.distanz || !fahrt.carId || !fahrt.zweck) {
            alert('Bitte alle Felder ausfüllen (Datum, Zeiten, Orte, KM-Stände, Fahrzeug, Zweck). Die Distanz wird automatisch berechnet.');
            return false;
        }

        // KM prüfen
        const s = parseFloat(fahrt.kmStart);
        const e = parseFloat(fahrt.kmEnde);
        if (isNaN(s) || isNaN(e)) {
            alert('Ungültige Kilometerstände! Bitte nur Zahlen eingeben.');
            return false;
        }
        if (e < s) {
            alert('Fehler: Der End-Kilometerstand muss größer oder gleich dem Start-Kilometerstand sein.');
            return false;
        }

        // Zeit prüfen
        if (fahrt.endTime < fahrt.startTime) {
            alert('Fehler: Die Endzeit darf nicht vor der Startzeit liegen.');
            return false;
        }

        // Distanz prüfen (sollte eigentlich immer berechnet sein)
        const d = parseFloat(fahrt.distanz);
        if (isNaN(d)) {
            alert('Fehler: Die Distanz konnte nicht berechnet werden oder ist ungültig.');
            return false;
        }
        // Sicherstellen, dass berechnete Distanz zu KM passt (mit kleiner Toleranz)
        if (Math.abs(d - (e - s)) > 0.01) {
             console.warn("Validierung: Berechnete Distanz weicht von KM-Differenz ab.", `Distanz: ${d}`, `KM: ${e}-${s}=${e-s}`);
             // Hier keinen Fehler werfen, da Rundung im Input Feld möglich ist.
        }


        // KM Kontinuität prüfen (nur bei NEUER Fahrt)
        if (checkKmContinuity && fahrt.carId) {
            const alleFahrten = ladeFahrtenAusLocalStorage(); // Holt sortierte Fahrten
            let letzteFahrtDesAutos = null;
            // Finde die letzte Fahrt für das ausgewählte Auto
            for (let i = alleFahrten.length - 1; i >= 0; i--) {
                if (alleFahrten[i].carId === fahrt.carId) {
                    letzteFahrtDesAutos = alleFahrten[i];
                    break;
                }
            }

            if (letzteFahrtDesAutos) { // Wenn es eine vorherige Fahrt für dieses Auto gibt
                const letzterKM = parseFloat(letzteFahrtDesAutos.kmEnde);
                if (!isNaN(letzterKM) && s < letzterKM) { // Wenn neuer Start < letztes Ende
                    const carName = cars.find(c => c.id === fahrt.carId)?.name || 'Unbekannt';
                    alert(`Kontinuitätsfehler für Fahrzeug "${carName}":\nDer Start-Kilometerstand (${s}) ist niedriger als der letzte bekannte End-Kilometerstand (${letzterKM}) dieses Fahrzeugs.`);
                    return false; // Ungültig
                }
            }
        } // Ende KM Kontinuitätsprüfung

        console.log("Fahrt-Validierung erfolgreich.");
        return true; // Alles OK
    }


    // ========================================================================
    // === 9. Speicher / Ladefunktionen (localStorage) ===
    // ========================================================================
    /**
     * Speichert das komplette (sortierte!) Fahrten-Array im localStorage.
     */
    function speichereAlleFahrten(fahrtenArray) {
        // Sortieren nach Datum, dann Startzeit, dann KM-Start
        fahrtenArray.sort((a, b) => {
            const dtA = (a.datum || '') + 'T' + (a.startTime || '00:00');
            const dtB = (b.datum || '') + 'T' + (b.startTime || '00:00');
            if (dtA < dtB) return -1;
            if (dtA > dtB) return 1;
            // Bei gleicher Startzeit nach KM-Start sortieren
            return parseFloat(a.kmStart || 0) - parseFloat(b.kmStart || 0);
        });
        try {
            localStorage.setItem('fahrtenbuchEintraege', JSON.stringify(fahrtenArray));
            console.log(`${fahrtenArray.length} Fahrten im localStorage gespeichert.`);
        } catch (e) {
            console.error("Fehler beim Speichern der Fahrten im localStorage:", e);
            alert("Fehler beim Speichern der Fahrten!");
        }
    }

    /**
     * Fügt eine neue Fahrt hinzu und speichert das Array.
     */
    function speichereNeueFahrtImLocalStorage(neueFahrt) {
        let fahrten = ladeFahrtenAusLocalStorage();
        // Sicherstellen, dass keine Fahrt mit gleicher ID hinzugefügt wird
        if (!fahrten.some(f => f.id === neueFahrt.id)) {
            fahrten.push(neueFahrt);
            speichereAlleFahrten(fahrten); // Speichert das aktualisierte, sortierte Array
        } else {
            console.warn("Versuch, Fahrt mit bereits existierender ID zu speichern:", neueFahrt.id);
        }
    }

    /**
     * Lädt alle Fahrten aus dem localStorage (gibt sortiertes Array zurück).
     * Enthält Fix für TypeError.
     */
    function ladeFahrtenAusLocalStorage() {
        const rawData = localStorage.getItem('fahrtenbuchEintraege');
        // console.log("DEBUG: ladeFahrtenAusLocalStorage - Rohdaten aus LS:", rawData);
        try {
            const parsedData = rawData ? JSON.parse(rawData) : [];
            // Sicherstellen, dass immer ein Array zurückgegeben wird
            const result = Array.isArray(parsedData) ? parsedData : [];
            // console.log("DEBUG: ladeFahrtenAusLocalStorage - Gibt zurück:", result);
            return result;
        } catch (e) {
            console.error("Fehler beim Parsen der Fahrten aus localStorage:", e);
            return []; // Leeres Array im Fehlerfall
        }
    }


    // ========================================================================
    // === 10. Löschfunktion (Fahrten) ===
    // ========================================================================
    /**
     * Löscht eine Fahrt anhand ihrer ID.
     * @param {string|number} fahrtId - Die ID der zu löschenden Fahrt.
     */
    function fahrtLoeschen(fahrtId) {
        console.log("Lösche Fahrt mit ID:", fahrtId);
        let fahrten = ladeFahrtenAusLocalStorage();
        const anzahlVorher = fahrten.length;
        const aktualisierteFahrten = fahrten.filter(f => f.id.toString() !== fahrtId.toString());

        if (anzahlVorher !== aktualisierteFahrten.length) {
            speichereAlleFahrten(aktualisierteFahrten); // Aktualisierte Liste speichern
            ladeGespeicherteFahrten(); // Anzeige aktualisieren
            updateZusammenfassung();   // Zusammenfassung aktualisieren
            console.log(`Fahrt mit ID ${fahrtId} erfolgreich gelöscht.`);
            // Wenn die gelöschte Fahrt gerade bearbeitet wurde, Edit-Modus beenden
            if (editId && editId.toString() === fahrtId.toString()) {
                abbrechenEditModus(false);
            }
        } else {
            console.warn("Zu löschende Fahrt-ID nicht gefunden:", fahrtId);
        }
    }


    // ========================================================================
    // === 11. Anzeige-Funktionen (Fahrtenliste, Zusammenfassung, Distanz) ===
    // ========================================================================
    /**
     * Baut die komplette HTML-Liste der Fahrten neu auf.
     * Enthält Fix für TypeError.
     */
    function ladeGespeicherteFahrten() {
        const fahrten = ladeFahrtenAusLocalStorage(); // Holt Array

        // Prüfung, ob 'f' ein Array ist (Sicherheitsmaßnahme)
        if (!Array.isArray(fahrten)) {
             console.error("FEHLER: ladeFahrtenAusLocalStorage hat kein Array zurückgegeben!", fahrten);
             return;
        }
        // Prüfung, ob das Ziel-Div existiert
        if (!fahrtenListeDiv) {
            console.error("FEHLER: Div für Fahrtenliste ('fahrten-liste') nicht gefunden!");
            return;
        }

        console.log(`${fahrten.length} Fahrten werden für die Anzeige geladen.`);
        fahrtenListeDiv.innerHTML = ''; // Liste leeren

        if (fahrten.length === 0) {
            fahrtenListeDiv.innerHTML = '<p>Noch keine Fahrten gespeichert.</p>';
        } else {
            // Fahrten werden bereits sortiert aus ladeFahrtenAusLocalStorage geliefert (durch speichereAlleFahrten)
            fahrten.forEach(fahrt => {
                fahrtZurListeHinzufuegen(fahrt, true); // An Liste anhängen
            });
        }
    }

    /**
     * Erzeugt das HTML für einen einzelnen Listeneintrag und fügt ihn hinzu.
     * @param {object} fahrt - Das Fahrt-Objekt.
     * @param {boolean} [append=false] - true: unten anhängen, false: oben einfügen.
     */
    function fahrtZurListeHinzufuegen(fahrt, append = false) {
        if (!fahrtenListeDiv) return; // Sicherheitscheck

        // Platzhalter entfernen, falls vorhanden
        const placeholder = fahrtenListeDiv.querySelector('p');
        if (placeholder) placeholder.remove();

        const listItem = document.createElement('div');
        listItem.classList.add('fahrt-item');
        listItem.setAttribute('data-fahrt-id', fahrt.id);

        // Werte vorbereiten und formatieren
        const kmStart = fahrt.kmStart || '0';
        const kmEnde = fahrt.kmEnde || '0';
        const distanz = parseFloat(fahrt.distanz || '0').toFixed(1); // Immer eine Nachkommastelle
        const datumFormatiert = formatDateDE(fahrt.datum);
        const startTime = fahrt.startTime || '--:--';
        const endTime = fahrt.endTime || '--:--';
        const startOrt = fahrt.startOrt || '-';
        const zielOrt = fahrt.zielOrt || '-';
        const zweck = fahrt.zweck || '-';
        const car = cars.find(c => c.id.toString() === (fahrt.carId || '').toString());
        const carDisplay = car ? (car.name || 'Unbenannt') : 'Unbekannt';
        const carTitle = car ? `${car.name || 'Unbenannt'}${car.plate ? ` (${car.plate})` : ''}` : 'Unbekanntes Fahrzeug';

        // HTML-Struktur des Listeneintrags
        const buttonsHTML = `
            <div class="buttons-container">
                <button class="edit-btn" title="Bearbeiten"><i class="fa-solid fa-pencil"></i></button>
                <button class="delete-btn" title="Löschen"><i class="fa-solid fa-trash-can"></i></button>
            </div>`;
        const toggleBtnHTML = `
            <button class="toggle-details-btn" title="Details ausblenden">
                <i class="fa-solid fa-chevron-up"></i> </button>`;

        listItem.innerHTML = `
           <div class="list-item-header">
               <div class="list-item-date-time">
                   <span class="list-item-info date-info"><i class="fa-solid fa-calendar-days fa-fw list-icon"></i> ${datumFormatiert}</span>
                   <span class="list-item-info time-info"><i class="fa-solid fa-clock fa-fw list-icon"></i> (${startTime} - ${endTime} Uhr)</span>
                   <span class="list-item-info car-info" title="${carTitle}" style="margin-left: 15px; color: var(--text-secondary);">
                        <i class="fa-solid fa-car fa-fw list-icon"></i>
                        <span style="max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom;">${carDisplay}</span>
                   </span>
               </div>
               ${buttonsHTML}
           </div>
           <div class="list-item-details">
               <div><span class="list-label">Von:</span>${startOrt}</div>
               <div><span class="list-label">Nach:</span>${zielOrt}</div>
               <div><span class="list-label">KM-Start:</span>${kmStart}</div>
               <div><span class="list-label">KM-Ende:</span>${kmEnde}</div>
               <div><span class="list-label">Distanz:</span>${distanz} km</div>
               <div><span class="list-label">Zweck:</span>${zweck}</div>
           </div>
           ${toggleBtnHTML}
       `;

        // Eintrag zum HTML hinzufügen
        if (append) {
            fahrtenListeDiv.appendChild(listItem); // Unten anfügen (Standard beim Laden)
        } else {
            fahrtenListeDiv.insertBefore(listItem, fahrtenListeDiv.firstChild); // Oben einfügen
        }
    }

    /**
     * Aktualisiert die Kilometer-Zusammenfassung in der rechten Spalte.
     */
    function updateZusammenfassung() {
        if (!zusammenfassungDiv) return;
        const fahrten = ladeFahrtenAusLocalStorage();
        let totalKm = 0, geschaeftlichKm = 0, privatKm = 0, arbeitswegKm = 0;

        fahrten.forEach(fahrt => {
            const dist = parseFloat(fahrt.distanz);
            if (!isNaN(dist)) {
                totalKm += dist;
                switch (fahrt.zweck) {
                    case 'geschaeftlich': geschaeftlichKm += dist; break;
                    case 'privat': privatKm += dist; break;
                    case 'arbeitsweg': arbeitswegKm += dist; break;
                }
            }
        });
        // HTML für die Zusammenfassung generieren
        zusammenfassungDiv.innerHTML = `
            <h2>Zusammenfassung</h2>
            <p><strong>Gesamt:</strong> ${totalKm.toFixed(1)} km</p>
            <ul>
                <li>Geschäftlich: ${geschaeftlichKm.toFixed(1)} km</li>
                <li>Privat: ${privatKm.toFixed(1)} km</li>
                <li>Arbeitsweg: ${arbeitswegKm.toFixed(1)} km</li>
            </ul>`;
    }

    /**
     * Funktion zur Live-Berechnung der Distanz im Formular, wenn KM-Stände geändert werden.
     */
    function berechneUndZeigeDistanz() {
        const startVal = kmStartInput?.value || '';
        const endVal = kmEndeInput?.value || '';
        const startKm = parseFloat(startVal);
        const endKm = parseFloat(endVal);

        if (!isNaN(startKm) && !isNaN(endKm) && endKm >= startKm) {
            const dist = (endKm - startKm).toFixed(1); // Immer eine Nachkommastelle
            if (distanzInput) distanzInput.value = dist;
        } else {
            if (distanzInput) distanzInput.value = ''; // Feld leeren bei ungültiger Eingabe
        }
    }


    // ========================================================================
    // === 12. Export/Import Funktionen ===
    // ========================================================================
    /**
     * Exportiert die Daten als CSV-Datei.
     */
    function exportiereAlsCsv() {
        console.log('CSV Export wird gestartet...');
        const fahrten = ladeFahrtenAusLocalStorage();
        if (fahrten.length === 0) {
            alert('Keine Fahrten zum Exportieren vorhanden.');
            return;
        }
        const header = ["Datum", "Startzeit", "Endzeit", "Start-Ort", "Ziel-Ort", "KM-Start", "KM-Ende", "Distanz (km)", "Zweck", "Fahrzeug ID", "Fahrzeug Name", "Fahrzeug Kennzeichen"];
        // Hilfsfunktion zum Escapen von Feldern für CSV
        const escapeCsvField = (field) => {
            const stringField = String(field == null ? '' : field);
            if (stringField.includes(';') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`; // Doppelte Anführungszeichen ersetzen und in Anführungszeichen setzen
            }
            return stringField;
        };

        let csvContent = header.join(';') + '\n'; // Header-Zeile
        // Datenzeilen hinzufügen
        fahrten.forEach(fahrt => {
            const car = cars.find(c => c.id.toString() === (fahrt.carId || '').toString());
            const carName = car ? car.name : '';
            const carPlate = car ? car.plate : '';
            const row = [
                fahrt.datum,
                fahrt.startTime || '',
                fahrt.endTime || '',
                fahrt.startOrt,
                fahrt.zielOrt,
                fahrt.kmStart,
                fahrt.kmEnde,
                fahrt.distanz,
                fahrt.zweck,
                fahrt.carId || '',
                carName,
                carPlate
            ];
            csvContent += row.map(escapeCsvField).join(';') + '\n';
        });

        triggerDownload(csvContent, 'text/csv;charset=utf-8;', `fahrtenbuch_${getDatumString()}.csv`);
    }

    /**
     * Exportiert alle Daten (Fahrten & Fahrzeuge) als JSON-Datei (Backup).
     */
    function exportiereAlsJson() {
        console.log("JSON Backup wird gestartet...");
        try {
            const fahrten = ladeFahrtenAusLocalStorage();
            // Stelle sicher, dass 'cars' aktuell ist (sollte durch loadCars() sein)
            const backupData = {
                fahrten: fahrten,
                autos: cars // Nimmt das aktuelle 'cars'-Array
            };
            const jsonString = JSON.stringify(backupData, null, 2); // Mit Einrückung für Lesbarkeit
            triggerDownload(jsonString, 'application/json;charset=utf-8;', `fahrtenbuch_backup_${getDatumString()}.json`);
        } catch (e) {
            console.error("Fehler beim Erstellen des JSON Backups:", e);
            alert("Fehler beim Erstellen des Backups.");
        }
    }

    /**
     * Importiert Daten aus einer JSON-Datei (Restore).
     * @param {Event} event - Das Change-Event des File-Input-Elements.
     */
    function importiereAusJson(event) {
        console.log("JSON Restore wird gestartet...");
        const file = event.target.files[0];
        if (!file) {
            return; // Keine Datei ausgewählt
        }

        // Sicherheitsabfrage
        if (!confirm(`ACHTUNG:\nAlle aktuell gespeicherten Fahrten UND Fahrzeuge werden durch den Inhalt der Datei "${file.name}" ersetzt.\n\nFortfahren?`)) {
            event.target.value = null; // File Input zurücksetzen
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonContent = e.target.result;
                const importData = JSON.parse(jsonContent);

                // Validierung der Importdaten-Struktur
                if (!importData || typeof importData !== 'object') {
                     throw new Error("Ungültiges Format: Importierte Daten sind kein Objekt.");
                }
                if (!Array.isArray(importData.fahrten) || !Array.isArray(importData.autos)) {
                    throw new Error("Ungültiges Backup-Format: 'fahrten' oder 'autos' Array fehlt oder ist kein Array.");
                }
                // Optionale tiefere Prüfung (Beispiel)
                if (importData.fahrten.length > 0 && (typeof importData.fahrten[0].id === 'undefined' || typeof importData.fahrten[0].datum === 'undefined')) {
                    console.warn("Warnung: Struktur der importierten Fahrten-Daten scheint unvollständig.");
                }
                if (importData.autos.length > 0 && (typeof importData.autos[0].id === 'undefined' || typeof importData.autos[0].name === 'undefined')) {
                     console.warn("Warnung: Struktur der importierten Fahrzeug-Daten scheint unvollständig.");
                }

                // Daten überschreiben
                cars = importData.autos; // Überschreibe das globale 'cars'-Array
                saveCars(); // Speichere die neuen Fahrzeuge im localStorage
                speichereAlleFahrten(importData.fahrten); // Überschreibe und speichere Fahrten (wird sortiert)

                console.log(`Import erfolgreich: ${importData.fahrten.length} Fahrten, ${importData.autos.length} Fahrzeuge geladen.`);

                // Wichtig: UI komplett neu initialisieren, um alle Änderungen anzuzeigen
                initialisiereApp(); // Lädt alles neu basierend auf den importierten Daten

                alert(`Import erfolgreich abgeschlossen!`);

            } catch (err) {
                console.error("Fehler beim JSON Import:", err);
                alert(`Import fehlgeschlagen:\n${err.message}`);
            } finally {
                // File Input immer zurücksetzen
                event.target.value = null;
            }
        };
        reader.onerror = function() {
            console.error("Fehler beim Lesen der Datei:", reader.error);
            alert("Fehler beim Lesen der ausgewählten Datei.");
            event.target.value = null;
        };
        reader.readAsText(file); // Datei als Text lesen
    }

    /**
     * Hilfsfunktion, um den Download einer Datei im Browser anzustoßen.
     * @param {string} content - Der Dateiinhalt.
     * @param {string} mimeType - Der MIME-Typ der Datei.
     * @param {string} filename - Der gewünschte Dateiname.
     */
    function triggerDownload(content, mimeType, filename) {
        // BOM (Byte Order Mark) für Excel-Kompatibilität bei CSV hinzufügen
        const BOM = mimeType.includes('csv') ? '\uFEFF' : '';
        const blob = new Blob([BOM + content], { type: mimeType });
        const link = document.createElement("a");

        if (link.download !== undefined) { // Prüft, ob Browser Download-Attribut unterstützt
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click(); // Simuliert Klick auf den Link
            document.body.removeChild(link); // Link wieder entfernen
            URL.revokeObjectURL(url); // Speicher freigeben
            console.log(`Download für ${filename} angeboten.`);
        } else {
            // Fallback für ältere Browser (selten nötig)
            alert("Automatischer Download wird von Ihrem Browser nicht unterstützt.");
        }
    }

/**
     * Handler für Klicks innerhalb der Fahrzeugliste (delegiert an Buttons).
     * Kümmert sich um das Löschen und Bearbeiten von Fahrzeugen.
     * @param {Event} event - Das Klick-Event.
     */
function handleCarListClick(event) {
    // Prüfen, ob auf einen Löschen-Button geklickt wurde
    const deleteButton = event.target.closest('.delete-car-btn');
    if (deleteButton) {
        const carIdToDelete = deleteButton.dataset.carId;
        console.log("Versuche Fahrzeug zu löschen, ID:", carIdToDelete);

        if (confirm('Soll dieses Fahrzeug wirklich endgültig gelöscht werden?')) {
            const index = cars.findIndex(car => car.id.toString() === carIdToDelete.toString());
            if (index !== -1) {
                // Prüfen, ob das zu löschende Auto gerade bearbeitet wird und ggf. abbrechen
                if (editCarId && editCarId.toString() === carIdToDelete.toString()) {
                    editCarId = null; // Bearbeitungsmodus beenden
                    // Modal ggf. schließen oder Zustand zurücksetzen (optional, da es eh gelöscht wird)
                    closeAddCarModal(); // Sicherstellen, dass Modal zu ist
                }

                cars.splice(index, 1);
                console.log("Fahrzeug aus Array entfernt.");
                saveCars();
                displayCarList();
                populateCarDropdown();
                console.log("Fahrzeug erfolgreich gelöscht und UI aktualisiert.");
                // alert("Fahrzeug wurde gelöscht."); // Alert kann ggf. weg
            } else {
                console.warn("Zu löschendes Fahrzeug nicht im Array gefunden, ID:", carIdToDelete);
                alert("Fehler: Zu löschendes Fahrzeug nicht gefunden.");
            }
        } else {
            console.log("Löschvorgang abgebrochen.");
        }
        return; // Wichtig: Funktion hier beenden, wenn delete geklickt wurde
    }

    // Prüfen, ob auf einen Edit-Button geklickt wurde (NEU)
    const editButton = event.target.closest('.edit-car-btn');
    if (editButton) {
        const carIdToEdit = editButton.dataset.carId;
        console.log("Edit-Button für Fahrzeug geklickt, ID:", carIdToEdit);
        openEditCarModal(carIdToEdit); // Rufe die neue Funktion auf
        return; // Wichtig: Funktion hier beenden
    }
}


    // ========================================================================
    // === 13. Event Listener Setup ===
    // ========================================================================
    /**
     * Hängt alle notwendigen Event Listener an die HTML-Elemente.
     * Wird einmal beim Initialisieren aufgerufen.
     */
    function setupEventListeners() {
        console.log("Initialisiere Event Listeners...");

        // Fahrten-Formular Listener
        addNewButton?.addEventListener('click', handleAddNewClick);
        speichernButton?.addEventListener('click', handleFormularSpeichern);
        cancelEditButton?.addEventListener('click', () => abbrechenEditModus(true));

        // Fahrten-Liste Listener (für Edit/Delete/Toggle)
        fahrtenListeDiv?.addEventListener('click', handleListClick);

        // Export/Import Listener
        exportButton?.addEventListener('click', exportiereAlsCsv);
        exportJsonButton?.addEventListener('click', exportiereAlsJson);
        importJsonButton?.addEventListener('click', () => importJsonFileInput?.click()); // Öffnet Datei-Dialog
        importJsonFileInput?.addEventListener('change', importiereAusJson); // Verarbeitet ausgewählte Datei

        // Theme & Sidebar Listener
        themeToggleButton?.addEventListener('click', handleThemeToggle);
        sidebarToggleButton?.addEventListener('click', handleSidebarToggle);

        // Live Distanz Listener
        kmStartInput?.addEventListener('input', berechneUndZeigeDistanz);
        kmEndeInput?.addEventListener('input', berechneUndZeigeDistanz);

        // Listener für das Fahrzeug-Modal
        addCarMenuButton?.addEventListener('click', openAddCarModal); // Menü-Button öffnet Modal
        modalCloseButton?.addEventListener('click', closeAddCarModal); // X schließt Modal
        modalCancelButton?.addEventListener('click', closeAddCarModal); // Abbrechen schließt Modal
        modalSaveButton?.addEventListener('click', handleModalSaveCar); // Speichern verarbeitet Modal
        carListUl?.addEventListener('click', handleCarListClick); // Listener für Fahrzeugliste (Edit/Delete) NEU
        // Schließen bei Klick auf den Overlay-Hintergrund
        addCarModal?.addEventListener('click', (event) => {
            if (event.target === addCarModal) { // Nur wenn direkt auf Overlay geklickt wird
                closeAddCarModal();
            }
        });

        console.log("Event Listeners initialisiert.");
    }


    // ========================================================================
    // === 14. Handlers für UI-Aktionen (Neue Fahrt aufklappen, Listen-Klicks) ===
    // ========================================================================
    /**
     * Handler für Klick auf "+ Neue Fahrt hinzufügen". Klappt das Formular ein/aus.
     */
    function handleAddNewClick() {
        console.log("Button '+ Neue Fahrt' geklickt.");
        if (!formularDiv) {
            console.error("FEHLER: formularDiv ist null in handleAddNewClick!");
            return;
        }

        // Wenn Formular sichtbar ist UND wir nicht im Edit-Modus sind -> schließen
        if (formularDiv.classList.contains('form-visible') && editId === null) {
            formularDiv.classList.remove('form-visible');
            console.log("Fahrten-Formular geschlossen.");
        } else {
            // Wenn Formular versteckt ist ODER wir im Edit-Modus sind:
            // Erstmal sicherstellen, dass wir im "Neu"-Modus sind (Edit abbrechen)
            abbrechenEditModus(false); // Setzt Edit-ID zurück, leert Felder, schließt Formular kurz
            // Dann Formular (wieder) öffnen
            formularDiv.classList.add('form-visible');
            console.log("Fahrten-Formular für neue Fahrt geöffnet.");
            // Fokus setzen und hinscrollen
            datumInput?.focus();
            formularDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Handler für Klicks innerhalb der Fahrtenliste (delegiert an Buttons).
     * @param {Event} event - Das Klick-Event.
     */
    function handleListClick(event) {
        // Finde das übergeordnete Fahrt-Item, auf das geklickt wurde
        const fahrtElement = event.target.closest('[data-fahrt-id]');
        if (!fahrtElement) return; // Klick war außerhalb eines Items

        const fahrtId = fahrtElement.getAttribute('data-fahrt-id');

        // Prüfe, ob auf einen der Buttons im Item geklickt wurde
        if (event.target.closest('.edit-btn')) {
            starteEditModus(fahrtId);
            return;
        }
        if (event.target.closest('.delete-btn')) {
            if (confirm('Soll dieser Fahrteintrag wirklich gelöscht werden?')) {
                fahrtLoeschen(fahrtId);
            }
            return;
        }
        // Prüfe, ob auf den Toggle-Button für Details geklickt wurde
        const toggleButton = event.target.closest('.toggle-details-btn');
        if (toggleButton) {
            fahrtElement.classList.toggle('details-collapsed'); // Klasse umschalten
            const icon = toggleButton.querySelector('i.fa-solid');
            if (icon) { // Icon wechseln
                if (fahrtElement.classList.contains('details-collapsed')) {
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    toggleButton.setAttribute('title', 'Details anzeigen');
                } else {
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    toggleButton.setAttribute('title', 'Details ausblenden');
                }
            }
            return;
        }
    }


    // ========================================================================
    // === 15. Initialisierung der App ===
    // ========================================================================
    /**
     * Startet die gesamte Anwendung nach Laden des HTML.
     */
    function initialisiereApp() {
        console.log("Initialisiere App...");

        // Sicherheitscheck für alle benötigten Elemente
        const requiredElementIds = [
            'fahrt-formular', 'trip-entry-form', 'speichern-btn', 'cancel-edit-btn', 'fahrten-liste',
            'datum', 'start-zeit', 'end-zeit', 'start-ort', 'ziel-ort',
            'km-start', 'km-ende', 'distanz', 'car-select', 'zweck',
            'export-csv-btn', 'zusammenfassung', 'export-json-btn', 'import-json-btn', 'import-json-file',
            'add-new-btn', 'theme-toggle-btn', 'sidebar-toggle-internal',
            'car-list', 'add-car-btn-menu',
            'add-car-modal', 'modal-close-btn', 'modal-cancel-car-btn', 'modal-save-car-btn',
            'modal-car-form', 'modal-car-name', 'modal-car-plate', 'modal-car-error'
        ];
        let missingElements = [];
        requiredElementIds.forEach(id => {
            if (!document.getElementById(id)) {
                missingElements.push(id);
            }
        });

        if (missingElements.length > 0) {
             console.error("FEHLER: Init - Folgende HTML-Elemente fehlen oder haben falsche IDs:", missingElements);
             alert(`Initialisierungsfehler! ${missingElements.length} wichtige Elemente fehlen. Details in der Konsole (F12).`);
             return; // Abbruch, da App nicht korrekt funktionieren kann
        }
        console.log("Alle benötigten HTML-Elemente gefunden.");

        // Initiale Aktionen in definierter Reihenfolge
        try { datumInput.value = getDatumString(); } catch (e) { console.error("Fehler beim Setzen des Datums:", e); }
        loadCars();                     // 1. Fahrzeuge laden
        ladeGespeicherteFahrten();      // 2. Fahrten laden (Anzeige)
        updateZusammenfassung();        // 3. Zusammenfassung berechnen
        displayCarList();               // 4. Fahrzeugliste anzeigen (rechts)
        populateCarDropdown();          // 5. Fahrzeug-Dropdown im Fahrtenformular füllen
        loadAndSetInitialTheme();       // 6. Theme laden/setzen
        loadAndSetInitialSidebarState();// 7. Sidebar Zustand laden/setzen
        felderFuerNeueFahrtVorbereiten();// 8. Formular für neue Fahrt vorbereiten
        setupEventListeners();          // 9. Event-Handler aktivieren (wichtig: nach Laden der Daten)

        console.log("App initialisiert und bereit.");
    }


    // ========================================================================
    // === 16. App starten ===
    // ========================================================================
    initialisiereApp();

}); // Ende DOMContentLoaded Listener