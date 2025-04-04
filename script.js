// === script.js ===
// Haupt-Skript für die Fahrtenbuch-Anwendung

// Wartet, bis das gesamte HTML-Dokument vollständig geladen und verarbeitet wurde.
document.addEventListener('DOMContentLoaded', function() {

    // ========================================================================
    // === 1. Konstanten & Referenzen auf HTML-Elemente ===
    // ========================================================================
    // Diese Konstanten speichern Referenzen auf die HTML-Elemente, mit denen
    // das Skript interagieren muss. IDs müssen im HTML korrekt gesetzt sein.
    const formularDiv = document.getElementById('fahrt-formular');      // Der Container Div für das (einklappbare) Formular
    const tripEntryForm = document.getElementById('trip-entry-form'); // Das eigentliche <form>-Element für Reset
    const speichernButton = document.getElementById('speichern-btn');   // Button zum Speichern / Aktualisieren
    const cancelEditButton = document.getElementById('cancel-edit-btn');// Button zum Abbrechen des Editierens
    const fahrtenListeDiv = document.getElementById('fahrten-liste');   // Div, in dem die Liste der Fahrten angezeigt wird
    // Eingabefelder im Formular
    const datumInput = document.getElementById('datum');
    const startOrtInput = document.getElementById('start-ort');
    const zielOrtInput = document.getElementById('ziel-ort');
    const kmStartInput = document.getElementById('km-start');
    const kmEndeInput = document.getElementById('km-ende');
    const distanzInput = document.getElementById('distanz');
    const zweckSelect = document.getElementById('zweck');
    // Weitere Elemente für Aktionen/Anzeige
    const exportButton = document.getElementById('export-csv-btn');     // CSV Export Button
    const zusammenfassungDiv = document.getElementById('zusammenfassung'); // Div für die Kilometer-Zusammenfassung
    const exportJsonButton = document.getElementById('export-json-btn');  // JSON Backup Button
    const importJsonButton = document.getElementById('import-json-btn');  // JSON Restore Button
    const importJsonFileInput = document.getElementById('import-json-file');// Verstecktes File Input für Restore
    const addNewButton = document.getElementById('add-new-btn');         // Button zum Öffnen des Formulars für neue Fahrt

    // ========================================================================
    // === 2. Statusvariable ===
    // ========================================================================
    // Diese Variable speichert den Zustand, ob gerade ein Eintrag bearbeitet wird.
    let editId = null; // null = "Neue Fahrt"-Modus, eine ID = "Bearbeiten"-Modus für diese Fahrt-ID

    // ========================================================================
    // === 3. Hilfsfunktionen ===
    // ========================================================================

    /**
     * Formatiert ein ISO-Datum (JJJJ-MM-TT) in das deutsche Format (TT.MM.JJJJ).
     * @param {string} isoDate - Das Datum im ISO-Format.
     * @returns {string} Das formatierte Datum oder der Originalstring bei Fehlern.
     */
    function formatDateDE(isoDate) {
        if (!isoDate) return ''; // Leeren String zurückgeben, wenn kein Datum da ist
        const p = isoDate.split('-'); // Trennt bei Bindestrichen -> ['JJJJ', 'MM', 'TT']
        if (p.length === 3) return `${p[2]}.${p[1]}.${p[0]}`; // Zusammensetzen
        return isoDate; // Fallback, falls das Format unerwartet ist
    }

    /**
     * Gibt das aktuelle Datum als String im JJJJ-MM-TT Format zurück.
     * @returns {string} Datumsstring.
     */
    function getDatumString() {
         // return new Date().toISOString().slice(0, 10); // Dynamisch: Nimmt das heutige Datum des Browsers
         return "2025-04-04"; // Statisch: Nimmt das feste Datum aus dem User-Kontext
    }

    // ========================================================================
    // === 4. Initialisierung der App ===
    // ========================================================================

    /**
     * Wird einmal aufgerufen, wenn die Seite geladen ist.
     * Setzt initiale Werte, lädt Daten und hängt Event Listener an.
     */
    function initialisiereApp() {
        console.log("Initialisiere App...");
        // Sicherheitscheck: Sind alle wichtigen HTML-Elemente vorhanden?
        if (!formularDiv || !tripEntryForm || !speichernButton || !cancelEditButton || !fahrtenListeDiv || !datumInput || !startOrtInput || !zielOrtInput || !kmStartInput || !kmEndeInput || !distanzInput || !zweckSelect || !exportButton || !zusammenfassungDiv || !exportJsonButton || !importJsonButton || !importJsonFileInput || !addNewButton) {
             console.error("FEHLER: Ein oder mehrere HTML-Elemente wurden nicht gefunden! Überprüfe die IDs im HTML und JS.");
             alert("Initialisierungsfehler! Einige Elemente der Seite fehlen.");
             return; // Abbruch der Initialisierung
        }

        try { datumInput.value = getDatumString(); } // Heutiges Datum ins Datumsfeld eintragen
        catch (e) { console.error("Fehler beim Setzen des Anfangsdatums:", e); }

        ladeGespeicherteFahrten();      // Gespeicherte Fahrten aus localStorage laden und anzeigen
        updateZusammenfassung();       // Zusammenfassung berechnen und anzeigen
        felderFuerNeueFahrtVorbereiten(); // Felder für die *erste* neue Fahrt vorbelegen (z.B. Start-KM)
        setupEventListeners();          // Alle Event Listener für Buttons etc. aktivieren
        console.log("App initialisiert und bereit.");
    }

    /**
     * Bereitet die Formularfelder für die Eingabe einer *neuen* Fahrt vor.
     * Wird bei Initialisierung und nach dem Speichern/Abbrechen aufgerufen.
     * Setzt z.B. den Start-Ort und Start-KM basierend auf der letzten Fahrt.
     */
    function felderFuerNeueFahrtVorbereiten() {
        // Diese Funktion nur ausführen, wenn wir *nicht* im Bearbeitungsmodus sind.
        if (editId !== null) return;

        console.log("Bereite Felder für neue Fahrt vor...");
        try {
            const alleFahrten = ladeFahrtenAusLocalStorage(); // Hole gespeicherte Fahrten
            if (alleFahrten.length > 0) {
                // Finde die Fahrt mit dem höchsten End-KM (normalerweise die chronologisch letzte)
                let letzteFahrt = null; let maxKmEnde = -1;
                // (Annahme: ladeFahrten... gibt sortiert nach Datum/KM zurück)
                letzteFahrt = alleFahrten[alleFahrten.length - 1]; // Die letzte im sortierten Array

                if (letzteFahrt) {
                    startOrtInput.value = letzteFahrt.zielOrt || ''; // Nimm Zielort als neuen Startort
                    kmStartInput.value = letzteFahrt.kmEnde || ''; // Nimm End-KM als neuen Start-KM
                } else { // Sollte nicht vorkommen, wenn Fahrten > 0
                    startOrtInput.value = ''; kmStartInput.value = '';
                }
            } else { // Wenn noch gar keine Fahrten gespeichert sind
                startOrtInput.value = ''; kmStartInput.value = '';
            }
            // Setze immer das Datum auf "heute" und leere Ziel/Distanz für neue Fahrten
            datumInput.value = getDatumString(); zielOrtInput.value = ''; distanzInput.value = '';
        } catch (e) { console.error("Fehler beim Vorbelegen der Felder:", e); }
    }

    // ========================================================================
    // === 5. Event Listener Setup ===
    // ========================================================================

    /**
     * Hängt alle notwendigen Event Listener an die HTML-Elemente.
     * Wird einmal bei der Initialisierung aufgerufen.
     */
    function setupEventListeners() {
        console.log("Setze Event Listeners...");
        // Sicherstellen, dass Elemente existieren, bevor Listener hinzugefügt werden
        if (addNewButton) { addNewButton.addEventListener('click', handleAddNewClick); } else { console.error("Listener Fehler: addNewButton fehlt!"); }
        if (speichernButton) { speichernButton.addEventListener('click', handleFormularSpeichern); } else { console.error("Listener Fehler: speichernButton fehlt!"); }
        if (cancelEditButton) { cancelEditButton.addEventListener('click', () => abbrechenEditModus(true)); } else { console.error("Listener Fehler: cancelEditButton fehlt!"); }
        if (fahrtenListeDiv) { fahrtenListeDiv.addEventListener('click', handleListClick); } else { console.error("Listener Fehler: fahrtenListeDiv fehlt!"); }
        if (exportButton) { exportButton.addEventListener('click', exportiereAlsCsv); } else { console.error("Listener Fehler: exportButton fehlt!"); }
        if (exportJsonButton) { exportJsonButton.addEventListener('click', exportiereAlsJson); } else { console.error("Listener Fehler: exportJsonButton fehlt!"); }
        if (importJsonButton) { importJsonButton.addEventListener('click', () => { if(importJsonFileInput) {importJsonFileInput.click();} else { console.error("Import File Input fehlt!");} }); } else { console.error("Listener Fehler: importJsonButton fehlt!"); }
        if (importJsonFileInput) { importJsonFileInput.addEventListener('change', importiereAusJson); } else { console.error("Listener Fehler: importJsonFileInput fehlt!"); }
         console.log("Event Listeners erfolgreich gesetzt.");
    }

    // --- Einzelne Event Handler ---

    // Wird aufgerufen, wenn der "+ Neue Fahrt hinzufügen" Button geklickt wird
    function handleAddNewClick() {
        console.log("Add New Button geklickt");
        // Wenn Formular sichtbar ist UND wir im "Add"-Modus sind -> Schließen
        if (formularDiv.classList.contains('form-visible') && editId === null) {
             formularDiv.classList.remove('form-visible');
             console.log("Formular geschlossen.");
        } else {
             // Ansonsten: Sicherstellen, dass Edit-Modus aus ist, Felder vorbereiten und Formular öffnen
             abbrechenEditModus(false); // Stellt Add-Modus her, versteckt Formular, scrollt nicht
             formularDiv.classList.add('form-visible'); // Explizit öffnen
             felderFuerNeueFahrtVorbereiten(); // Felder korrekt vorbelegen (wird in abbrechenEditModus schon gemacht, aber doppelt schadet nicht)
             console.log("Formular für neue Fahrt geöffnet.");
             datumInput.focus(); // Fokus auf erstes Feld
             formularDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Sanft hinscrollen
        }
    }

    // Wird aufgerufen, wenn *irgendwo* in der Fahrtenliste geklickt wird (Event Delegation)
    function handleListClick(event) {
        // Finde heraus, ob auf einen Edit- oder Delete-Button geklickt wurde
        const editButton = event.target.closest('.edit-btn');
        const deleteButton = event.target.closest('.delete-btn');
        // Finde das zugehörige Listenelement, um die ID zu bekommen
        const fahrtElement = event.target.closest('[data-fahrt-id]');

        if (!fahrtElement) return; // Klick war nicht auf einem relevanten Element
        const fahrtId = fahrtElement.getAttribute('data-fahrt-id');

        if (editButton) { starteEditModus(fahrtId); } // Edit-Modus starten
        else if (deleteButton) {                      // Löschen-Button
             if (confirm('Soll dieser Eintrag wirklich gelöscht werden?')) { // Sicherheitsabfrage
                 fahrtLoeschen(fahrtId);
             }
        }
    }

    // ========================================================================
    // === 6. Kernfunktionen (Speichern, Update, Edit-Modus) ===
    // ========================================================================

    // Entscheidet, ob eine neue Fahrt gespeichert oder eine bestehende aktualisiert wird
    function handleFormularSpeichern() {
        console.log("Speichern/Update wird ausgeführt. Edit ID:", editId);
        let erfolg = false; // Flag für Erfolg
        if (editId !== null) { erfolg = fahrtAktualisieren(editId); } // Update
        else { erfolg = fahrtSpeichern(); }                         // Neu speichern

        if (erfolg && formularDiv) { // Nur bei Erfolg das Formular schließen
             formularDiv.classList.remove('form-visible');
             console.log("Formular nach Erfolg geschlossen.");
        } else {
             console.log("Speichern/Update nicht erfolgreich oder Formular nicht gefunden.");
        }
    }

    // Startet den Bearbeitungsmodus für eine Fahrt (füllt Formular, ändert Buttons)
    function starteEditModus(fahrtId) {
        console.log("Starte Edit ID:", fahrtId);
        const fahrten = ladeFahrtenAusLocalStorage();
        const fahrt = fahrten.find(f => f.id.toString() === fahrtId.toString()); // Finde Fahrt im Array
        if (!fahrt) { alert("Fehler: Eintrag zum Bearbeiten nicht gefunden!"); return; }

        // Fülle Formularfelder
        datumInput.value = fahrt.datum || ''; startOrtInput.value = fahrt.startOrt || ''; zielOrtInput.value = fahrt.zielOrt || '';
        kmStartInput.value = fahrt.kmStart || ''; kmEndeInput.value = fahrt.kmEnde || ''; distanzInput.value = fahrt.distanz || '';
        zweckSelect.value = fahrt.zweck || 'geschaeftlich';

        // Setze Status: Edit-ID merken, Button-Text ändern, Cancel-Button zeigen
        editId = fahrtId; speichernButton.textContent = 'Änderung speichern'; if(cancelEditButton) cancelEditButton.style.display = 'inline-block';

        // Mache Formular sichtbar und scrolle hin
        if (formularDiv) { formularDiv.classList.add('form-visible'); formularDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        datumInput.focus();
    }

    // Bricht den Edit-Modus ab oder setzt einfach das Formular in den "Add"-Zustand zurück
    function abbrechenEditModus(doScroll = true) {
        console.log("Breche Edit ab / Reset Form.");
        editId = null; // Wichtig: Edit-Modus beenden
        if(tripEntryForm) { tripEntryForm.reset(); console.log("Formular Reset."); } // Das <form> Element zurücksetzen
        else { console.error("tripEntryForm nicht gefunden!"); }
        if (formularDiv) { formularDiv.classList.remove('form-visible'); console.log("Formular versteckt."); } // Container verstecken
        speichernButton.textContent = 'Fahrt speichern'; // Button Text zurücksetzen
        if(cancelEditButton) cancelEditButton.style.display = 'none'; // Cancel Button verstecken
        felderFuerNeueFahrtVorbereiten(); // Felder für nächste NEUE Fahrt vorbereiten (Datum, Start KM/Ort)
        console.log("Edit abgebrochen.");
        // Optional: Scrollen, z.B. zur Liste?
        // if (doScroll) { document.getElementById('fahrten-liste-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }

    // Aktualisiert eine vorhandene Fahrt. Gibt true bei Erfolg, false bei Fehler zurück.
    function fahrtAktualisieren(id) {
        console.log("Update ID:", id);
        const fahrt = { // Aktuelle Formulardaten holen
            id: id, datum: datumInput.value, startOrt: startOrtInput.value, zielOrt: zielOrtInput.value,
            kmStart: kmStartInput.value, kmEnde: kmEndeInput.value, distanz: distanzInput.value, zweck: zweckSelect.value
        };
        // Validieren (false = keine KM-Kontinuitätsprüfung beim Update)
        if (!validateFahrt(fahrt, false)) return false;

        let fahrten = ladeFahrtenAusLocalStorage();
        const index = fahrten.findIndex(f => f.id.toString() === id.toString()); // Finde Index im Array
        if (index !== -1) {
            fahrten[index] = fahrt; // Ersetze alten Eintrag im Array
            speichereAlleFahrten(fahrten); // Speichere das gesamte (sortierte) Array
            console.log("Fahrt aktualisiert.");
            ladeGespeicherteFahrten(); // Baue die Liste im HTML neu auf
            updateZusammenfassung();   // Aktualisiere die Summenanzeige
            return true; // Erfolg melden
        } else { alert("Fehler beim Aktualisieren!"); abbrechenEditModus(); return false; } // Fehler melden
    }

    // Speichert eine komplett neue Fahrt. Gibt true bei Erfolg, false bei Fehler zurück.
    function fahrtSpeichern() {
        console.log("Speichere neue Fahrt...");
        const neueFahrt = { // Neues Objekt mit neuer ID
            id: Date.now(), datum: datumInput.value, startOrt: startOrtInput.value, zielOrt: zielOrtInput.value,
            kmStart: kmStartInput.value, kmEnde: kmEndeInput.value, distanz: distanzInput.value, zweck: zweckSelect.value
        };
        // Validieren (true = KM-Kontinuität prüfen)
        if (!validateFahrt(neueFahrt, true)) return false;

        console.log('Neue Fahrt validiert:', neueFahrt);
        speichereNeueFahrtImLocalStorage(neueFahrt); // Fügt hinzu und speichert (sortiert)
        ladeGespeicherteFahrten(); // Baue Liste neu auf (neue Fahrt erscheint)
        updateZusammenfassung();   // Aktualisiere Summen
        felderFuerNeueFahrtVorbereiten(); // Bereite Formular für nächste Eingabe vor
        zielOrtInput.focus(); // Fokus für schnelle Eingabe
        return true; // Erfolg melden
    }

    // === 7. Validierungsfunktion ===
    // Prüft ein Fahrt-Objekt auf Gültigkeit. Passt ggf. die Distanz an.
    function validateFahrt(fahrt, checkKmContinuity) {
        console.log("Validiere Fahrt:", fahrt, "Kontinuität prüfen:", checkKmContinuity);
        // Basisprüfung Pflichtfelder
        if (!fahrt.datum || !fahrt.startOrt || !fahrt.zielOrt || !fahrt.kmStart || !fahrt.kmEnde || !fahrt.zweck) { alert('Bitte füllen Sie alle Pflichtfelder aus!'); return false; }
        // Prüfung KM-Werte (Zahlen?)
        const kmStartNum = parseFloat(fahrt.kmStart); const kmEndeNum = parseFloat(fahrt.kmEnde);
        if (isNaN(kmStartNum) || isNaN(kmEndeNum)) { alert('Bitte geben Sie gültige Zahlen für die Kilometerstände ein.'); return false; }
        // Prüfung End-KM >= Start-KM
        if (kmEndeNum < kmStartNum) { alert('Der Kilometerstand am Ende muss größer oder gleich dem Kilometerstand am Start sein.'); return false; }
        // Distanz berechnen/prüfen (wenn leer oder 0), Wert im Objekt wird angepasst!
        let distanzNum = parseFloat(fahrt.distanz);
        const berechneteDistanz = kmEndeNum - kmStartNum;
        if (isNaN(distanzNum) || distanzNum <= 0) {
            fahrt.distanz = berechneteDistanz.toFixed(1); // Automatisch berechnen
            console.log("Distanz automatisch berechnet:", fahrt.distanz);
        } else {
            if (Math.abs(distanzNum - berechneteDistanz) > 1) { // Toleranz 1km
                 console.warn(`Distanz (${distanzNum} km) vs Differenz (${berechneteDistanz.toFixed(1)} km)`);
                 if (!confirm(`Die eingegebene Distanz (${distanzNum} km) weicht von der KM-Differenz (${berechneteDistanz.toFixed(1)} km) ab.\nTrotzdem speichern?`)) { return false; }
            }
            fahrt.distanz = distanzNum.toFixed(1); // Formatieren
        }
        // KM-Kontinuitätsprüfung (nur bei NEUEN Fahrten)
        if (checkKmContinuity) {
            const alleFahrten = ladeFahrtenAusLocalStorage();
            if (alleFahrten.length > 0) {
                let maxKmEnde = 0; // Finde höchsten bisherigen End-KM
                alleFahrten.forEach(f => { const k = parseFloat(f.kmEnde); if (!isNaN(k) && k > maxKmEnde) maxKmEnde = k; });
                console.log("Prüfe Kontinuität: Neuer Start =", kmStartNum, "Max Ende bisher =", maxKmEnde);
                if (kmStartNum < maxKmEnde) { alert(`Fehler: Start-KM (${kmStartNum}) ist niedriger als max. bisheriger End-KM (${maxKmEnde}). Lücken im Fahrtenbuch?`); return false; }
            }
        }
        console.log("Validierung erfolgreich.");
        return true; // Alles OK
    }

    // === 8. Speicher / Ladefunktionen (localStorage) ===
    // Speichert das komplette Fahrten-Array (sortiert!) im localStorage
    function speichereAlleFahrten(fahrtenArray) {
         fahrtenArray.sort((a, b) => { // Sortiere nach Datum (aufsteigend), dann nach Start-KM (aufsteigend)
              const dateDiff = new Date(a.datum) - new Date(b.datum);
              if (dateDiff !== 0) return dateDiff;
              return parseFloat(a.kmStart) - parseFloat(b.kmStart);
         });
         try {
             localStorage.setItem('fahrtenbuchEintraege', JSON.stringify(fahrtenArray));
             console.log(`${fahrtenArray.length} Fahrten im LS gespeichert (sortiert).`);
         } catch (e) {
              console.error("Fehler beim Speichern im LocalStorage:", e);
              alert("Fehler beim Speichern der Daten! Möglicherweise ist der Speicherplatz voll.");
         }
    }
    // Fügt eine neue Fahrt hinzu und speichert das gesamte Array
    function speichereNeueFahrtImLocalStorage(neueFahrt) {
        let fahrten = ladeFahrtenAusLocalStorage();
        if (!fahrten.some(x => x.id === neueFahrt.id)) {
            fahrten.push(neueFahrt); speichereAlleFahrten(fahrten);
        } else { console.warn("ID doppelt:", neueFahrt.id); }
    }
    // Lädt alle Fahrten aus dem localStorage (gibt sortiertes Array zurück)
    function ladeFahrtenAusLocalStorage() {
        const daten = localStorage.getItem('fahrtenbuchEintraege');
        try { return daten ? JSON.parse(daten) : []; }
        catch (e) { console.error("Fehler LS Parse:", e); alert("Fehler beim Laden der Daten!"); return []; }
    }

    // === 9. Löschfunktion ===
    // Löscht eine Fahrt anhand ihrer ID
    function fahrtLoeschen(fahrtId) {
        console.log("Lösche ID:", fahrtId);
        let fahrten = ladeFahrtenAusLocalStorage(); const anzahlVorher = fahrten.length;
        const aktualisierteFahrten = fahrten.filter(fahrt => fahrt.id.toString() !== fahrtId.toString());
        if (anzahlVorher !== aktualisierteFahrten.length) {
             speichereAlleFahrten(aktualisierteFahrten); ladeGespeicherteFahrten(); updateZusammenfassung();
             console.log(`ID ${fahrtId} gelöscht.`);
             // Formular schließen, falls der gelöschte Eintrag gerade bearbeitet wurde
             if (editId === fahrtId) { abbrechenEditModus(false); }
        } else { console.warn("Zu löschende ID nicht gefunden:", fahrtId); }
    }

    // === 10. Anzeige-Funktionen (Liste, Zusammenfassung) ===
    // Baut die komplette HTML-Liste der Fahrten neu auf
    function ladeGespeicherteFahrten() {
        const fahrten = ladeFahrtenAusLocalStorage(); // Holt sortierte Daten (älteste zuerst)
        console.log(`${fahrten.length} Fahrten für Anzeige geladen.`);
        if(!fahrtenListeDiv){console.error("Liste Div fehlt!"); return;}
        fahrtenListeDiv.innerHTML = ''; // Liste immer leeren
        if (fahrten.length === 0) { fahrtenListeDiv.innerHTML = '<p>Noch keine Fahrten gespeichert.</p>'; }
        else { fahrten.forEach(fahrt => { fahrtZurListeHinzufuegen(fahrt, true); }); } // true = Anfügen (append)
    }
    // Erzeugt das HTML für einen einzelnen Listeneintrag und fügt ihn hinzu
    function fahrtZurListeHinzufuegen(fahrt, append = false) {
         if(!fahrtenListeDiv) return;
         const platzhalter = fahrtenListeDiv.querySelector('p'); if(platzhalter) platzhalter.remove();

         const el = document.createElement('div'); el.classList.add('fahrt-item'); el.setAttribute('data-fahrt-id', fahrt.id);
         const s=fahrt.kmStart||'0'; const e=fahrt.kmEnde||'0'; const d=fahrt.distanz||'0.0'; const dat=formatDateDE(fahrt.datum);
         const btns=`<div class="buttons-container"><button class="edit-btn" title="Bearbeiten"><i class="fa-solid fa-pencil"></i></button><button class="delete-btn" title="Löschen"><i class="fa-solid fa-trash-can"></i></button></div>`;
         el.innerHTML=`
            <div class="list-item-header"><div class="list-item-date"><span class="list-label">Datum:</span>${dat}</div>${btns}</div>
            <div class="list-item-details">
                <div><span class="list-label">Von:</span>${fahrt.startOrt||'-'}</div>
                <div><span class="list-label">Nach:</span>${fahrt.zielOrt||'-'}</div>
                <div><span class="list-label">KM-Start:</span>${s}</div>
                <div><span class="list-label">KM-Ende:</span>${e}</div>
                <div><span class="list-label">Distanz:</span>${d} km</div>
                <div><span class="list-label">Zweck:</span>${fahrt.zweck||'-'}</div>
            </div>`;
         if(append){ fahrtenListeDiv.appendChild(el); } // Beim Laden unten anfügen
         else { fahrtenListeDiv.insertBefore(el, fahrtenListeDiv.firstChild); } // Bei neuem Eintrag oben einfügen
     }
    // Aktualisiert die Kilometer-Zusammenfassung
    function updateZusammenfassung() {
        if (!zusammenfassungDiv) { console.error("Zusammenfassungs-Div fehlt!"); return; }
        const fahrten = ladeFahrtenAusLocalStorage(); let t=0,g=0,p=0,a=0;
        fahrten.forEach(f=>{const d=parseFloat(f.distanz); if(!isNaN(d)){t+=d; switch(f.zweck){case 'geschaeftlich':g+=d; break; case 'privat':p+=d; break; case 'arbeitsweg':a+=d; break;}}});
        zusammenfassungDiv.innerHTML = `<h2>Zusammenfassung</h2><p><strong>Gesamt:</strong> ${t.toFixed(1)} km</p><ul><li>Geschäftlich: ${g.toFixed(1)} km</li><li>Privat: ${p.toFixed(1)} km</li><li>Arbeitsweg: ${a.toFixed(1)} km</li></ul>`;
    }

    // === 11. Export/Import Funktionen ===
    function exportiereAlsCsv() { /*...*/ console.log('CSV Export...'); const f=ladeFahrtenAusLocalStorage(); if(f.length===0){alert('Keine Fahrten.'); return;} f.sort((a,b)=>{const d=new Date(a.datum)-new Date(b.datum); return d!==0?d:parseFloat(a.kmStart)-parseFloat(b.kmStart);}); const h=["Datum","Start-Ort","Ziel-Ort","KM-Start","KM-Ende","Distanz (km)","Zweck"]; const esc=(fld)=>{const s=String(fld==null?'':fld); if(s.includes(';')||s.includes('"')||s.includes('\n'))return `"${s.replace(/"/g,'""')}"`; return s;}; let csv=h.join(';')+'\n'; f.forEach(x=>{const r=[x.datum,x.startOrt,x.zielOrt,x.kmStart,x.kmEnde,x.distanz,x.zweck]; csv+=r.map(esc).join(';')+'\n';}); triggerDownload(csv,'text/csv;charset=utf-8;',`fahrtenbuch_${getDatumString()}.csv`); }
    function exportiereAlsJson() { /*...*/ console.log("Exportiere JSON..."); try{const f=ladeFahrtenAusLocalStorage(); if(f.length===0){alert("Keine Fahrten."); return;} const json=JSON.stringify(f,null,2); triggerDownload(json,'application/json;charset=utf-8;',`fahrtenbuch_backup_${getDatumString()}.json`);} catch(e){console.error("Fehler JSON Export:", e); alert("Fehler Backup.");} }
    function importiereAusJson(event) { /*...*/ console.log("Importiere JSON..."); const file=event.target.files[0]; if(!file){return;} if(!confirm(`ACHTUNG:\nAlle Fahrten werden durch Inhalt der Datei "${file.name}" ersetzt.\n\nFortfahren?`)){event.target.value=null; return;} const reader=new FileReader(); reader.onload=function(e){ try{ const json=e.target.result; const impF=JSON.parse(json); if(!Array.isArray(impF)||(impF.length>0&&(typeof impF[0].id==='undefined'||typeof impF[0].datum==='undefined'))){throw new Error("Datei scheint kein gültiges Backup zu sein.");} speichereAlleFahrten(impF); console.log(`Erfolgreich ${impF.length} Fahrten importiert.`); initialisiereApp(); alert(`Erfolgreich ${impF.length} Fahrten importiert!`);} catch(e){console.error("Fehler JSON Import:", e); alert(`Fehler Import:\n${e.message}`);} finally{event.target.value=null;} }; reader.onerror=function(){console.error("Fehler Lesen:", reader.error); alert("Fehler beim Lesen der Datei."); event.target.value=null;}; reader.readAsText(file); }
    // Hilfsfunktion für Datei-Downloads
    function triggerDownload(content, mimeType, filename) { const BOM=mimeType.includes('csv')?'\uFEFF':''; const blob=new Blob([BOM+content],{type:mimeType}); const link=document.createElement("a"); if(link.download!==undefined){const url=URL.createObjectURL(blob); link.setAttribute("href",url); link.setAttribute("download",filename); link.style.visibility='hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); console.log(`Datei ${filename} angeboten.`);}else{alert("Direkter Download nicht unterstützt.");}}

    // === 12. App starten ===
    initialisiereApp(); // Führt die Initialisierung aus, wenn das DOM bereit ist

}); // Ende DOMContentLoaded Listener