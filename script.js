// === script.js ===
// Stand: 2025-04-06, Final Formatiert & Kommentiert

// DE: Wartet, bis das gesamte HTML-Dokument vollständig geladen und verarbeitet wurde.
// EN: Waits until the entire HTML document is fully loaded and parsed.
document.addEventListener('DOMContentLoaded', function() {

    // ========================================================================
    // === 1. Konstanten & Referenzen auf HTML-Elemente ===
    // DE: Speichert Referenzen auf häufig verwendete HTML-Elemente für schnellen Zugriff.
    // EN: Stores references to frequently used HTML elements for quick access.
    // ========================================================================
    const formularDiv = document.getElementById('fahrt-formular');      // Der Container Div für das (einklappbare) Formular
    const tripEntryForm = document.getElementById('trip-entry-form'); // Das eigentliche <form>-Element für Reset
    const speichernButton = document.getElementById('speichern-btn');   // Button zum Speichern / Aktualisieren
    const cancelEditButton = document.getElementById('cancel-edit-btn');// Button zum Abbrechen des Editierens
    const fahrtenListeDiv = document.getElementById('fahrten-liste');    // Div, in dem die Liste der Fahrten angezeigt wird
    // Eingabefelder im Formular
    const datumInput = document.getElementById('datum');
    const startTimeInput = document.getElementById('start-zeit');
    const endTimeInput = document.getElementById('end-zeit');
    const startOrtInput = document.getElementById('start-ort');
    const zielOrtInput = document.getElementById('ziel-ort');
    const kmStartInput = document.getElementById('km-start');
    const kmEndeInput = document.getElementById('km-ende');
    const distanzInput = document.getElementById('distanz');
    const carSelect = document.getElementById('car-select'); // Fahrzeugauswahl
    const zweckSelect = document.getElementById('zweck');
    // Weitere Elemente für Aktionen/Anzeige
    const exportButton = document.getElementById('export-csv-btn');     // CSV Export Button
    const zusammenfassungDiv = document.getElementById('zusammenfassung'); // Div für die Kilometer-Zusammenfassung
    const exportJsonButton = document.getElementById('export-json-btn');  // JSON Backup Button
    const importJsonButton = document.getElementById('import-json-btn');  // JSON Restore Button
    const importJsonFileInput = document.getElementById('import-json-file');// Verstecktes File Input für Restore
    const addNewButton = document.getElementById('add-new-btn');         // Button zum Öffnen des Formulars für neue Fahrt
    // Fahrzeugverwaltung
    const addCarForm = document.getElementById('add-car-form');
    const carNameInput = document.getElementById('car-name');
    const carPlateInput = document.getElementById('car-plate');
    const addCarButton = document.getElementById('add-car-btn');
    const carListUl = document.getElementById('car-list');
    const themeToggleButton = document.getElementById('theme-toggle-btn'); // Theme Toggle Button

    // ========================================================================
    // === 2. Statusvariablen ===
    // DE: Variablen, die den Zustand der Anwendung speichern.
    // EN: Variables holding the application's state.
    // ========================================================================
    let editId = null; // Speichert die ID der Fahrt, die gerade bearbeitet wird (null = keine Bearbeitung)
    let cars = [];     // Array, das die Liste der angelegten Fahrzeuge speichert

    // ========================================================================
    // === 3. Hilfsfunktionen ===
    // DE: Kleine Helferlein für wiederkehrende Aufgaben.
    // EN: Small helper functions for recurring tasks.
    // ========================================================================

    /**
     * DE: Formatiert ein ISO-Datum (JJJJ-MM-TT) in das deutsche Format (TT.MM.JJJJ).
     * EN: Formats an ISO date string (YYYY-MM-DD) into German format (DD.MM.YYYY).
     * @param {string} isoDate - Das Datum im ISO-Format. / The date string in ISO format.
     * @returns {string} Das formatierte Datum oder der Originalstring bei Fehlern. / The formatted date or original string on error.
     */
    function formatDateDE(isoDate) {
        if (!isoDate) return '';
        const p = isoDate.split('-');
        if (p.length === 3) return `${p[2]}.${p[1]}.${p[0]}`;
        return isoDate;
    }

    /**
     * DE: Gibt das aktuelle Datum als String im JJJJ-MM-TT Format zurück.
     * EN: Returns the current date as a string in YYYY-MM-DD format.
     * @returns {string} Datumsstring / Date string.
     */
    function getDatumString() {
        // return new Date().toISOString().slice(0, 10); // Dynamisch
        return "2025-04-06"; // Statisch (Datum aktualisiert für Konsistenz)
    }

    // ========================================================================
    // === 4. Theme (Dark Mode) Funktionen ===
    // DE: Funktionen zur Verwaltung des Farbschemas.
    // EN: Functions for managing the color theme.
    // ========================================================================

    /**
     * DE: Setzt das Theme (CSS-Klasse und Icon) basierend auf dem Modus ('light' oder 'dark').
     * EN: Sets the theme (CSS class and icon) based on the mode ('light' or 'dark').
     * @param {string} mode - 'light' oder 'dark'.
     */
    function setTheme(mode) {
        const icon = themeToggleButton?.querySelector('i.fa-solid');
        if (mode === 'dark') {
            document.body.classList.add('dark-mode');
            if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
            themeToggleButton?.setAttribute('title', 'Light Mode aktivieren');
            console.log("Theme: Dark Mode");
        } else {
            document.body.classList.remove('dark-mode');
            if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
            themeToggleButton?.setAttribute('title', 'Dark Mode aktivieren');
            console.log("Theme: Light Mode");
        }
    }

    /**
     * DE: Handler für Klick auf den Theme-Toggle-Button. Wechselt Theme und speichert Präferenz.
     * EN: Handler for theme toggle button click. Toggles theme and saves preference.
     */
    function handleThemeToggle() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newMode = isDarkMode ? 'light' : 'dark';
        setTheme(newMode);
        try {
            localStorage.setItem('theme', newMode); // Präferenz speichern
            console.log("Theme-Präferenz gespeichert:", newMode);
        } catch (e) {
            console.error("Fehler beim Speichern der Theme-Präferenz:", e);
        }
    }

    /**
     * DE: Lädt die Theme-Präferenz beim Start und wendet sie an.
     * EN: Loads the theme preference on startup and applies it.
     */
    function loadAndSetInitialTheme() {
        let preferredTheme = 'light'; // Standard ist Light
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                preferredTheme = savedTheme;
                console.log("Gespeichertes Theme gefunden:", preferredTheme);
            } else {
                // Wenn nichts gespeichert ist, prüfe Systemeinstellung
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    preferredTheme = 'dark';
                    console.log("System-Präferenz Dark Mode erkannt.");
                } else {
                    console.log("Keine Präferenz gefunden, nutze Light Mode.");
                }
            }
        } catch (e) {
            console.error("Fehler beim Lesen der Theme-Präferenz:", e);
        }
        setTheme(preferredTheme); // Initiales Theme anwenden
    }


    // ========================================================================
    // === 5. Fahrzeug-Verwaltungsfunktionen ===
    // DE: Funktionen zum Laden, Speichern, Anzeigen von Fahrzeugen.
    // EN: Functions for loading, saving, and displaying cars.
    // ========================================================================

    /**
     * DE: Lädt die Fahrzeugliste aus dem localStorage.
     * EN: Loads the car list from localStorage.
     */
    function loadCars() {
        const storedCars = localStorage.getItem('fahrtenbuchCars');
        try { cars = storedCars ? JSON.parse(storedCars) : []; console.log(`${cars.length} Fahrzeuge geladen.`); }
        catch (e) { console.error("Fehler Laden Fahrzeuge:", e); cars = []; }
        cars.forEach(car => { if (!car.id) car.id = Date.now() + Math.random(); }); // Add IDs if missing
    }

    /**
     * DE: Speichert das aktuelle 'cars'-Array im localStorage.
     * EN: Saves the current 'cars' array to localStorage.
     */
    function saveCars() {
        try { localStorage.setItem('fahrtenbuchCars', JSON.stringify(cars)); console.log("Fahrzeuge gespeichert."); }
        catch (e) { console.error("Fehler Speichern Fahrzeuge:", e); alert("Fehler Speichern Fahrzeuge!"); }
    }

    /**
     * DE: Bereitet die Formularfelder für die Eingabe einer neuen Fahrt vor (z.B. Start-Ort/KM).
     * EN: Prepares the form fields for entering a new trip (e.g., start location/KM).
     */
    function felderFuerNeueFahrtVorbereiten() {
        if (editId !== null) return; // Nicht im Edit-Modus
        console.log("Bereite Felder für neue Fahrt vor...");
        try {
            const alleFahrten = ladeFahrtenAusLocalStorage();
            if (alleFahrten.length > 0) {
                const letzteFahrt = alleFahrten[alleFahrten.length - 1]; // Letzte im sortierten Array
                if (letzteFahrt) { startOrtInput.value = letzteFahrt.zielOrt || ''; kmStartInput.value = letzteFahrt.kmEnde || ''; }
                else { startOrtInput.value = ''; kmStartInput.value = ''; }
            } else { startOrtInput.value = ''; kmStartInput.value = ''; }
            datumInput.value = getDatumString(); zielOrtInput.value = ''; distanzInput.value = '';
            startTimeInput.value = ''; endTimeInput.value = ''; carSelect.value = ''; // Auto auch zurücksetzen
            berechneUndZeigeDistanz(); // Initial distance calculation/clearing
        } catch (e) { console.error("Fehler Vorbelegen:", e); }
    } // Ende felderFuerNeueFahrtVorbereiten

    /**
     * DE: Zeigt die Liste der angelegten Fahrzeuge im HTML an.
     * EN: Displays the list of created cars in the HTML.
     */
    function displayCarList() {
        if (!carListUl) { console.error("Car List UL not found!"); return; }
        carListUl.innerHTML = ''; // Liste leeren
        if (cars.length === 0) {
            carListUl.innerHTML = '<li>Keine Fahrzeuge angelegt.</li>';
        } else {
            cars.forEach(car => {
                const li = document.createElement('li');
                li.textContent = `${car.name || 'Unbenannt'}`;
                if (car.plate) { const ps = document.createElement('strong'); ps.textContent = ` (${car.plate})`; li.appendChild(ps); }
                // TODO: Später evtl. Delete/Edit Buttons pro Auto
                carListUl.appendChild(li);
            });
        }
    }

    /**
     * DE: Füllt das Dropdown-Menü (#car-select) im Hauptformular mit den Fahrzeugen.
     * EN: Populates the dropdown menu (#car-select) in the main form with the cars.
     */
    function populateCarDropdown() {
        if (!carSelect) { console.error("Car Select dropdown not found!"); return; }
        const aktuellerWert = carSelect.value; // Aktuellen Wert merken
        while (carSelect.options.length > 1) { carSelect.remove(1); } // Alte Optionen löschen
        cars.forEach(car => { // Neue Optionen hinzufügen
            const option = document.createElement('option');
            option.value = car.id; option.textContent = `${car.name || 'Unbenannt'}${car.plate ? ` (${car.plate})` : ''}`;
            carSelect.appendChild(option);
        });
        // DE: Versucht, die vorherige Auswahl wiederherzustellen (wichtig für Edit-Modus)
        // EN: Tries to restore the previous selection (important for edit mode)
        carSelect.value = aktuellerWert;
    }

    /**
     * DE: Event-Handler für Klick auf "Fahrzeug hinzufügen".
     * EN: Event handler for "Add Car" button click.
     */
    function handleAddCar() {
        const name = carNameInput?.value.trim(); // Optional chaining für Sicherheit
        const plate = carPlateInput?.value.trim().toUpperCase();
        if (!name || !plate) { alert("Bitte Name/Modell und Kennzeichen eingeben."); return; }
        if (cars.some(car => car.plate === plate)) { if (!confirm(`Kennzeichen "${plate}" existiert bereits. Trotzdem?`)) { return; } }
        // DE: Erstellt ein neues Fahrzeugobjekt mit einer wahrscheinlich eindeutigeren ID
        // EN: Creates a new car object with a probably more unique ID
        const newCar = { id: Date.now() + Math.random().toString(16).slice(2), name: name, plate: plate };
        cars.push(newCar); saveCars(); displayCarList(); populateCarDropdown();
        addCarForm?.reset(); // Formular zurücksetzen
        console.log("Neues Fahrzeug:", newCar); alert(`Fahrzeug "${name} (${plate})" hinzugefügt!`);
    }

    // ========================================================================
    // === 6. Initialisierung der App ===
    // ========================================================================
    /**
     * DE: Startet die gesamte Anwendung nach Laden des HTML.
     * EN: Starts the entire application after the HTML is loaded.
     */
    function initialisiereApp() {
        console.log("Initialisiere App...");
        // DE: Sicherheitscheck: Sind alle benötigten Elemente im HTML vorhanden?
        // EN: Safety check: Are all required HTML elements present?
        const requiredElements = [formularDiv, tripEntryForm, speichernButton, cancelEditButton, fahrtenListeDiv, datumInput, startTimeInput, endTimeInput, startOrtInput, zielOrtInput, kmStartInput, kmEndeInput, distanzInput, carSelect, zweckSelect, exportButton, zusammenfassungDiv, exportJsonButton, importJsonButton, importJsonFileInput, addNewButton, addCarForm, carNameInput, carPlateInput, addCarButton, carListUl, themeToggleButton];
        if (requiredElements.some(el => !el)) {
             console.error("FEHLER: Init - Wichtige HTML-Elemente fehlen! Bitte HTML und Element-IDs überprüfen.");
             alert("Initialisierungsfehler! Wichtige Elemente fehlen.");
             return; // Abbruch
        }
        // DE: Initiale Aktionen in korrekter Reihenfolge
        // EN: Initial actions in correct order
        try { datumInput.value = getDatumString(); } catch (e) { console.error("Fehler Datum setzen:", e); }
        loadCars();                     // 1. Autos laden
        ladeGespeicherteFahrten();      // 2. Fahrten laden
        updateZusammenfassung();        // 3. Zusammenfassung berechnen
        displayCarList();               // 4. Autoliste anzeigen
        populateCarDropdown();          // 5. Auto-Dropdown füllen
        loadAndSetInitialTheme();       // 6. Gespeichertes/System-Theme laden und anwenden
        felderFuerNeueFahrtVorbereiten();// 7. Formular vorbereiten
        setupEventListeners();          // 8. Event-Handler aktivieren
        console.log("App initialisiert.");
    }

    // ========================================================================
    // === 7. Event Listener Setup ===
    // ========================================================================
    /**
     * DE: Hängt alle notwendigen Event Listener an die HTML-Elemente.
     * EN: Attaches all necessary event listeners to the HTML elements.
     */
    function setupEventListeners() {
        console.log("Setze Event Listeners...");
        // DE: Optional Chaining (?.) für sichereren Zugriff auf Elemente.
        // EN: Optional Chaining (?.) for safer access to elements.
        addNewButton?.addEventListener('click', handleAddNewClick);
        speichernButton?.addEventListener('click', handleFormularSpeichern);
        cancelEditButton?.addEventListener('click', () => abbrechenEditModus(true));
        fahrtenListeDiv?.addEventListener('click', handleListClick);
        exportButton?.addEventListener('click', exportiereAlsCsv);
        exportJsonButton?.addEventListener('click', exportiereAlsJson);
        importJsonButton?.addEventListener('click', () => importJsonFileInput?.click());
        importJsonFileInput?.addEventListener('change', importiereAusJson);
        addCarButton?.addEventListener('click', handleAddCar);
        themeToggleButton?.addEventListener('click', handleThemeToggle); // Listener für Theme Toggle
        // Listener für automatische Distanzberechnung
        kmStartInput?.addEventListener('input', berechneUndZeigeDistanz);
        kmEndeInput?.addEventListener('input', berechneUndZeigeDistanz);
        console.log("Event Listeners gesetzt.");
    }

    /** DE: Handler für Klick auf "+ Neue Fahrt hinzufügen" */
    /** EN: Handler for "+ Add New Trip" button click */
    function handleAddNewClick() {
        console.log("Add New geklickt");
        if (formularDiv?.classList.contains('form-visible') && editId === null) {
             formularDiv.classList.remove('form-visible'); console.log("Form geschlossen.");
        } else {
             abbrechenEditModus(false); // Stellt Add-Modus her & versteckt Formular
             formularDiv?.classList.add('form-visible'); // Öffnen
             // felderFuerNeueFahrtVorbereiten(); // Wird schon in abbrechenEditModus gemacht
             console.log("Form für neue Fahrt geöffnet.");
             datumInput?.focus(); // Fokus auf erstes Feld
             formularDiv?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Sanft hinscrollen
        }
    }

    /** DE: Handler für Klicks in der Fahrtenliste (Edit/Delete/Toggle) */
    /** EN: Handler for clicks within the trip list (Edit/Delete/Toggle) */
    function handleListClick(event) {
        const fahrtElement = event.target.closest('[data-fahrt-id]'); // Finde Listenelement
        if (!fahrtElement) return;
        const fahrtId = fahrtElement.getAttribute('data-fahrt-id');

        // Prüfe auf Klick auf verschiedene Buttons im Item
        if (event.target.closest('.edit-btn')) { starteEditModus(fahrtId); return; }
        if (event.target.closest('.delete-btn')) { if (confirm('Eintrag löschen?')) { fahrtLoeschen(fahrtId); } return; }
        const toggleButton = event.target.closest('.toggle-details-btn');
        if (toggleButton) { // Klick auf Toggle Button
            fahrtElement.classList.toggle('details-collapsed'); // Klasse umschalten
            const icon = toggleButton.querySelector('i.fa-solid');
            if (icon) { // Icon wechseln
                if (fahrtElement.classList.contains('details-collapsed')) {
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down'); toggleButton.setAttribute('title', 'Details anzeigen');
                } else {
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up'); toggleButton.setAttribute('title', 'Details ausblenden');
                }
            }
            return;
        }
    }

    // ========================================================================
    // === 8. Kernfunktionen (Speichern, Update, Edit-Modus) ===
    // ========================================================================

    /** DE: Wird aufgerufen, wenn der Haupt-Speichern/Update-Button geklickt wird */
    /** EN: Called when the main Save/Update button is clicked */
    function handleFormularSpeichern() {
        console.log("Speichern/Update. Edit ID:", editId);
        let erfolg = false;
        if (editId !== null) { erfolg = fahrtAktualisieren(editId); } // Update
        else { erfolg = fahrtSpeichern(); }                         // Neu
        if (erfolg && formularDiv) { formularDiv.classList.remove('form-visible'); console.log("Form nach Erfolg geschlossen."); }
        else { console.log("Speichern/Update nicht erfolgreich."); }
    }

    /** DE: Startet den Bearbeitungsmodus für eine Fahrt */
    /** EN: Starts the edit mode for a trip */
    function starteEditModus(fahrtId) {
        console.log("Starte Edit ID:", fahrtId);
        const fahrten = ladeFahrtenAusLocalStorage(); const fahrt = fahrten.find(f => f.id.toString() === fahrtId.toString());
        if (!fahrt) { alert("Fehler: Eintrag nicht gefunden!"); return; }
        // Formular füllen
        datumInput.value = fahrt.datum || ''; startTimeInput.value = fahrt.startTime || ''; endTimeInput.value = fahrt.endTime || '';
        startOrtInput.value = fahrt.startOrt || ''; zielOrtInput.value = fahrt.zielOrt || ''; kmStartInput.value = fahrt.kmStart || '';
        kmEndeInput.value = fahrt.kmEnde || ''; distanzInput.value = fahrt.distanz || ''; carSelect.value = fahrt.carId || '';
        zweckSelect.value = fahrt.zweck || 'geschaeftlich';
        // Status setzen
        editId = fahrtId; speichernButton.textContent = 'Änderung speichern'; cancelEditButton?.style.setProperty('display', 'inline-block');
        // Formular sichtbar machen
        if (formularDiv) { formularDiv.classList.add('form-visible'); formularDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        datumInput?.focus();
    }

    /** DE: Bricht den Edit-Modus ab oder setzt Formular zurück */
    /** EN: Cancels edit mode or resets the form */
    function abbrechenEditModus(doScroll = true) {
        console.log("Breche Edit ab / Reset Form.");
        editId = null;
        if(tripEntryForm){ tripEntryForm.reset(); console.log("Formular Reset."); }
        else { console.error("tripEntryForm nicht gefunden!"); }
        if (formularDiv) { formularDiv.classList.remove('form-visible'); console.log("Formular versteckt."); }
        if(speichernButton) speichernButton.textContent = 'Fahrt speichern';
        if(cancelEditButton) cancelEditButton.style.display = 'none';
        felderFuerNeueFahrtVorbereiten(); // Setzt Felder für nächste *neue* Fahrt
        console.log("Edit abgebrochen.");
    }

    /** DE: Aktualisiert eine vorhandene Fahrt. Gibt true bei Erfolg, false bei Fehler. */
    /** EN: Updates an existing trip. Returns true on success, false on error. */
    function fahrtAktualisieren(id) {
        console.log("Update ID:", id);
        const fahrt = { id: id, datum: datumInput.value, startTime: startTimeInput.value, endTime: endTimeInput.value, startOrt: startOrtInput.value, zielOrt: zielOrtInput.value, kmStart: kmStartInput.value, kmEnde: kmEndeInput.value, distanz: distanzInput.value, carId: carSelect.value, zweck: zweckSelect.value };
        if (!validateFahrt(fahrt, false)) return false; // Validieren
        let fahrten = ladeFahrtenAusLocalStorage(); const index = fahrten.findIndex(f => f.id.toString() === id.toString());
        if (index !== -1) {
            fahrten[index] = fahrt; speichereAlleFahrten(fahrten); console.log("Fahrt aktualisiert.");
            ladeGespeicherteFahrten(); updateZusammenfassung(); return true; // Erfolg
        } else { alert("Fehler Update: Eintrag nicht gefunden!"); abbrechenEditModus(); return false; } // Fehler
    }

    /** DE: Speichert eine komplett neue Fahrt. Gibt true bei Erfolg, false bei Fehler. */
    /** EN: Saves a completely new trip. Returns true on success, false on error. */
    function fahrtSpeichern() {
        console.log("Speichere neue Fahrt...");
        const neueFahrt = { id: Date.now(), datum: datumInput.value, startTime: startTimeInput.value, endTime: endTimeInput.value, startOrt: startOrtInput.value, zielOrt: zielOrtInput.value, kmStart: kmStartInput.value, kmEnde: kmEndeInput.value, distanz: distanzInput.value, carId: carSelect.value, zweck: zweckSelect.value };
        if (!validateFahrt(neueFahrt, true)) return false; // Validieren
        console.log('Neue Fahrt validiert:', neueFahrt);
        speichereNeueFahrtImLocalStorage(neueFahrt); ladeGespeicherteFahrten(); updateZusammenfassung();
        felderFuerNeueFahrtVorbereiten(); zielOrtInput?.focus();
        return true; // Erfolg
    }

    // ========================================================================
    // === 9. Validierungsfunktion ===
    // ========================================================================
    /**
     * DE: Prüft ein Fahrt-Objekt auf Gültigkeit.
     * EN: Validates a trip object for correctness.
     * @param {object} fahrt - Das zu prüfende Fahrt-Objekt.
     * @param {boolean} checkKmContinuity - Soll die KM-Kontinuität geprüft werden?
     * @returns {boolean} true, wenn valide, sonst false.
     */
    function validateFahrt(fahrt, checkKmContinuity) {
        console.log("Validiere Fahrt:", fahrt, "Kontinuität:", checkKmContinuity);
        // Pflichtfelder
        if (!fahrt.datum || !fahrt.startTime || !fahrt.endTime || !fahrt.startOrt || !fahrt.zielOrt || !fahrt.kmStart || !fahrt.kmEnde || !fahrt.distanz || !fahrt.carId || !fahrt.zweck) { alert('Pflichtfelder (inkl. Zeit, Fahrzeug)! Distanz wird automatisch berechnet.'); return false; }
        // KM
        const s=parseFloat(fahrt.kmStart), e=parseFloat(fahrt.kmEnde); if (isNaN(s)||isNaN(e)){ alert('Ungültige KM!'); return false; } if (e < s) { alert('End-KM < Start-KM!'); return false; }
        // Zeit
        if (fahrt.endTime < fahrt.startTime) { alert('Endzeit < Startzeit!'); return false; }
        // Distanz
        const d = parseFloat(fahrt.distanz); if (isNaN(d)) { alert('Distanz ungültig.'); return false; }
        const b = e - s; if (Math.abs(d - b) > 0.01) { console.warn(`Validierung: Berechnete Distanz (${d}) stimmt nicht exakt mit KM-Differenz (${b}) überein.`);} // Nur Warnung
        // KM Kontinuität (Prüfung pro Fahrzeug)
        if (checkKmContinuity) {
            const alleFahrten = ladeFahrtenAusLocalStorage(); // Bereits sortiert
            let letzteFahrtDesAutos = null;
            for (let i = alleFahrten.length - 1; i >= 0; i--) { if (alleFahrten[i].carId === fahrt.carId) { letzteFahrtDesAutos = alleFahrten[i]; break; } } // Finde letzte Fahrt des Autos
            if (letzteFahrtDesAutos) { // Wenn es eine vorherige Fahrt gibt
                const letzterKM = parseFloat(letzteFahrtDesAutos.kmEnde);
                if (!isNaN(letzterKM) && s < letzterKM) { // Wenn neuer Start < letztes Ende
                    alert(`Fehler: Start-KM (${s}) < letzter End-KM (${letzterKM}) dieses Fahrzeugs!`);
                    return false; // Ungültig
                }
            }
        }
        console.log("Validierung OK."); return true;
    }

    // ========================================================================
    // === 10. Speicher / Ladefunktionen (localStorage) ===
    // ========================================================================
    /** DE: Speichert das komplette (sortierte!) Fahrten-Array im localStorage. */
    /** EN: Saves the complete (sorted!) trips array to localStorage. */
    function speichereAlleFahrten(fahrtenArray) { fahrtenArray.sort((a, b) => { const dtA = a.datum + 'T' + (a.startTime || '00:00'); const dtB = b.datum + 'T' + (b.startTime || '00:00'); if (dtA < dtB) return -1; if (dtA > dtB) return 1; return parseFloat(a.kmStart) - parseFloat(b.kmStart); }); try { localStorage.setItem('fahrtenbuchEintraege', JSON.stringify(fahrtenArray)); console.log(`${fahrtenArray.length} Fahrten im LS.`); } catch (e) { console.error("Fehler LS Speichern:", e); alert("Fehler beim Speichern!"); } }
    /** DE: Fügt eine neue Fahrt hinzu und speichert das Array. */
    /** EN: Adds a new trip and saves the array. */
    function speichereNeueFahrtImLocalStorage(neueFahrt) { let f = ladeFahrtenAusLocalStorage(); if (!f.some(x => x.id === neueFahrt.id)) { f.push(neueFahrt); speichereAlleFahrten(f); } else { console.warn("ID doppelt:", neueFahrt.id); } }
    /** DE: Lädt alle Fahrten aus dem localStorage (gibt sortiertes Array zurück). */
    /** EN: Loads all trips from localStorage (returns sorted array). */
    function ladeFahrtenAusLocalStorage() { const d = localStorage.getItem('fahrtenbuchEintraege'); try { return d ? JSON.parse(d) : []; } catch (e) { console.error("LS Parse Fehler:", e); return []; } }

    // ========================================================================
    // === 11. Löschfunktion ===
    // ========================================================================
    /** DE: Löscht eine Fahrt anhand ihrer ID. */
    /** EN: Deletes a trip by its ID. */
    function fahrtLoeschen(fahrtId) { console.log("Lösche ID:", fahrtId); let f = ladeFahrtenAusLocalStorage(); const a = f.length; const upd = f.filter(x => x.id.toString() !== fahrtId.toString()); if (a !== upd.length) { speichereAlleFahrten(upd); ladeGespeicherteFahrten(); updateZusammenfassung(); console.log(`ID ${fahrtId} gelöscht.`); if (editId && editId.toString() === fahrtId.toString()) { abbrechenEditModus(false); } } else { console.warn("Zu löschende ID nicht gefunden:", fahrtId); } }

    // ========================================================================
    // === 12. Anzeige-Funktionen ===
    // ========================================================================
    /** DE: Baut die komplette HTML-Liste der Fahrten neu auf. */
    /** EN: Rebuilds the entire HTML list of trips. */
    function ladeGespeicherteFahrten() { const f = ladeFahrtenAusLocalStorage(); console.log(`${f.length} Fahrten für Anzeige.`); if (!fahrtenListeDiv) { return; } fahrtenListeDiv.innerHTML = ''; if (f.length === 0) { fahrtenListeDiv.innerHTML = '<p>Noch keine Fahrten gespeichert.</p>'; } else { f.forEach(x => { fahrtZurListeHinzufuegen(x, true); }); } } // true=append

    /** DE: Erzeugt das HTML für einen einzelnen Listeneintrag und fügt ihn hinzu. */
    /** EN: Creates the HTML for a single list item and adds it. */
    function fahrtZurListeHinzufuegen(fahrt, append = false) {
        if (!fahrtenListeDiv) { console.error("FEHLER: fahrtenListeDiv nicht gefunden!"); return; }
        const p = fahrtenListeDiv.querySelector('p'); if (p) p.remove(); // Platzhalter entfernen

        const el = document.createElement('div'); el.classList.add('fahrt-item'); el.setAttribute('data-fahrt-id', fahrt.id);
        // Werte vorbereiten
        const s = fahrt.kmStart || '0'; const e = fahrt.kmEnde || '0'; const d = fahrt.distanz || '0.0'; const dat = formatDateDE(fahrt.datum);
        const startTime = fahrt.startTime || '--:--'; const endTime = fahrt.endTime || '--:--';
        const startOrt = fahrt.startOrt || '-'; const zielOrt = fahrt.zielOrt || '-'; const zweck = fahrt.zweck || '-';
        const car = cars.find(c => c.id.toString() === (fahrt.carId || '').toString());
        const carDisplay = car ? car.name : 'Unbekannt';
        const carTitle = car ? `${car.name}${car.plate ? ` (${car.plate})` : ''}` : 'Unbekanntes Fzg.';
        // Buttons HTML
        const btnsHTML = `<div class="buttons-container"><button class="edit-btn" title="Bearbeiten"><i class="fa-solid fa-pencil"></i></button><button class="delete-btn" title="Löschen"><i class="fa-solid fa-trash-can"></i></button></div>`;
        // Toggle Button HTML
        const toggleBtnHTML = `<button class="toggle-details-btn" title="Details ausblenden"><i class="fa-solid fa-chevron-up"></i></button>`;
        // HTML Struktur
        el.innerHTML = `
           <div class="list-item-header">
               <div class="list-item-date-time">
                   <span class="list-item-info date-info"><i class="fa-solid fa-calendar-days fa-fw list-icon"></i> ${dat}</span>
                   <span class="list-item-info time-info"><i class="fa-solid fa-clock fa-fw list-icon"></i> (${startTime} - ${endTime} Uhr)</span>
                   <span class="list-item-info car-info" title="${carTitle}" style="margin-left: 15px; color: var(--text-secondary);"> <i class="fa-solid fa-car fa-fw list-icon"></i>
                        <span style="max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom;">${carDisplay}</span>
                   </span>
               </div>
               ${btnsHTML}
           </div>
           <div class="list-item-details">
               <div><span class="list-label">Von:</span>${startOrt}</div>
               <div><span class="list-label">Nach:</span>${zielOrt}</div>
               <div><span class="list-label">KM-Start:</span>${s}</div>
               <div><span class="list-label">KM-Ende:</span>${e}</div>
               <div><span class="list-label">Distanz:</span>${d} km</div>
               <div><span class="list-label">Zweck:</span>${zweck}</div>
           </div>
           ${toggleBtnHTML}
       `; // Ende innerHTML Zuweisung

        // Eintrag zum HTML hinzufügen
        if (append) { fahrtenListeDiv.appendChild(el); } // Unten anfügen (beim Laden)
        else { fahrtenListeDiv.insertBefore(el, fahrtenListeDiv.firstChild); } // Oben einfügen (optional)
    } // Ende fahrtZurListeHinzufuegen

    /** DE: Aktualisiert die Kilometer-Zusammenfassung in der rechten Spalte. */
    /** EN: Updates the kilometer summary in the right column. */
    function updateZusammenfassung() { if (!zusammenfassungDiv) { return; } const f = ladeFahrtenAusLocalStorage(); let t = 0, g = 0, p = 0, a = 0; f.forEach(x => { const d = parseFloat(x.distanz); if (!isNaN(d)) { t += d; switch (x.zweck) { case 'geschaeftlich': g += d; break; case 'privat': p += d; break; case 'arbeitsweg': a += d; break; } } }); zusammenfassungDiv.innerHTML = `<h2>Zusammenfassung</h2><p><strong>Gesamt:</strong> ${t.toFixed(1)} km</p><ul><li>Geschäftlich: ${g.toFixed(1)} km</li><li>Privat: ${p.toFixed(1)} km</li><li>Arbeitsweg: ${a.toFixed(1)} km</li></ul>`; }

    /** DE: Funktion zur Live-Berechnung der Distanz im Formular */
    /** EN: Function for live calculation of distance in the form */
    function berechneUndZeigeDistanz() { const sT = kmStartInput?.value || ''; const eT = kmEndeInput?.value || ''; const s = parseFloat(sT); const e = parseFloat(eT); if (!isNaN(s) && !isNaN(e) && e >= s) { const d = (e - s).toFixed(1); if (distanzInput) distanzInput.value = d; } else { if (distanzInput) distanzInput.value = ''; } }

    // ========================================================================
    // === 12. Export/Import Funktionen ===
    // ========================================================================
    /** DE: Exportiert die Daten als CSV-Datei. */
    /** EN: Exports the data as a CSV file. */
    function exportiereAlsCsv() { console.log('CSV Export...'); const f=ladeFahrtenAusLocalStorage(); if(f.length===0){alert('Keine Fahrten.'); return;} const h=["Datum","Startzeit","Endzeit","Start-Ort","Ziel-Ort","KM-Start","KM-Ende","Distanz (km)","Zweck","Fahrzeug ID","Fahrzeug Name","Fahrzeug Kennzeichen"]; const esc=(fld)=>(String(fld==null?'':fld).includes(';')||String(fld==null?'':fld).includes('"')||String(fld==null?'':fld).includes('\n'))?`"${String(fld).replace(/"/g,'""')}"`:String(fld==null?'':fld); let csv=h.join(';')+'\n'; f.forEach(x=>{const car=cars.find(c=>c.id.toString()===(x.carId||'').toString()); const cN=car?car.name:''; const cP=car?car.plate:''; const r=[x.datum, x.startTime||'', x.endTime||'', x.startOrt,x.zielOrt,x.kmStart,x.kmEnde,x.distanz,x.zweck,x.carId||'',cN,cP]; csv+=r.map(esc).join(';')+'\n';}); triggerDownload(csv,'text/csv;charset=utf-8;',`fahrtenbuch_${getDatumString()}.csv`); }
    /** DE: Exportiert die Daten als JSON-Datei (Backup). */
    /** EN: Exports the data as a JSON file (Backup). */
    function exportiereAlsJson() { console.log("Exportiere JSON..."); try{const f=ladeFahrtenAusLocalStorage(); const backupData={fahrten:f,autos:cars}; const json=JSON.stringify(backupData,null,2); triggerDownload(json,'application/json;charset=utf-8;',`fahrtenbuch_backup_${getDatumString()}.json`);} catch(e){console.error("Fehler JSON Export:", e); alert("Fehler Backup.");} }
    /** DE: Importiert Daten aus einer JSON-Datei (Restore). */
    /** EN: Imports data from a JSON file (Restore). */
    function importiereAusJson(event) { console.log("Importiere JSON..."); const file=event.target.files[0]; if(!file){return;} if(!confirm(`ACHTUNG:\nAlle Fahrten UND Fahrzeuge werden ersetzt.\n\nFortfahren?`)){event.target.value=null; return;} const reader=new FileReader(); reader.onload=function(e){ try{ const json=e.target.result; const importData=JSON.parse(json); if(!importData||!Array.isArray(importData.fahrten)||!Array.isArray(importData.autos)){throw new Error("Backup-Format ungültig (fahrten/autos fehlt).");} if(importData.fahrten.length>0&&(typeof importData.fahrten[0].id==='undefined'||typeof importData.fahrten[0].datum==='undefined')){throw new Error("Fahrten-Daten ungültig.");} /* Optional: Prüfung auf carId? */ if(importData.autos.length>0&&(typeof importData.autos[0].id==='undefined'||typeof importData.autos[0].name==='undefined'||typeof importData.autos[0].plate==='undefined')){throw new Error("Fahrzeug-Daten ungültig.");} cars=importData.autos; saveCars(); speichereAlleFahrten(importData.fahrten); console.log(`Import: ${importData.fahrten.length} Fahrten, ${importData.autos.length} Fahrzeuge.`); initialisiereApp(); alert(`Import erfolgreich!`);} catch(e){console.error("Fehler JSON Import:", e); alert(`Fehler Import:\n${e.message}`);} finally{event.target.value=null;} }; reader.onerror=function(){console.error("Fehler Lesen:", reader.error); alert("Fehler beim Lesen der Datei."); event.target.value=null;}; reader.readAsText(file); }
    /** DE: Hilfsfunktion, um den Download einer Datei anzustoßen. */
    /** EN: Helper function to trigger a file download. */
    function triggerDownload(content, mimeType, filename) { const BOM=mimeType.includes('csv')?'\uFEFF':''; const blob=new Blob([BOM+content],{type:mimeType}); const link=document.createElement("a"); if(link.download!==undefined){const url=URL.createObjectURL(blob); link.setAttribute("href",url); link.setAttribute("download",filename); link.style.visibility='hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); console.log(`Datei ${filename} angeboten.`);}else{alert("Direkter Download nicht unterstützt.");}}

    // ========================================================================
    // === 13. App starten ===
    // DE: Ruft die Initialisierungsfunktion auf, sobald das HTML bereit ist.
    // EN: Calls the initialization function once the HTML is ready.
    // ========================================================================
    initialisiereApp();

}); // Ende DOMContentLoaded Listener