// === script.js ===
// Stand: 2025-04-05, inkl. Start-/Endzeit

document.addEventListener('DOMContentLoaded', function() {

    // === 1. Konstanten & Referenzen auf HTML-Elemente ===
    const formularDiv = document.getElementById('fahrt-formular');
    const tripEntryForm = document.getElementById('trip-entry-form');
    const speichernButton = document.getElementById('speichern-btn');
    const cancelEditButton = document.getElementById('cancel-edit-btn');
    const fahrtenListeDiv = document.getElementById('fahrten-liste');
    // Eingabefelder
    const datumInput = document.getElementById('datum');
    const startTimeInput = document.getElementById('start-zeit'); // NEU
    const endTimeInput = document.getElementById('end-zeit');   // NEU
    const startOrtInput = document.getElementById('start-ort');
    const zielOrtInput = document.getElementById('ziel-ort');
    const kmStartInput = document.getElementById('km-start');
    const kmEndeInput = document.getElementById('km-ende');
    const distanzInput = document.getElementById('distanz');
    const zweckSelect = document.getElementById('zweck');
    // Weitere Elemente
    const exportButton = document.getElementById('export-csv-btn');
    const zusammenfassungDiv = document.getElementById('zusammenfassung');
    const exportJsonButton = document.getElementById('export-json-btn');
    const importJsonButton = document.getElementById('import-json-btn');
    const importJsonFileInput = document.getElementById('import-json-file');
    const addNewButton = document.getElementById('add-new-btn');

    // === 2. Statusvariable ===
    let editId = null;

    // === 3. Hilfsfunktionen ===
    function formatDateDE(isoDate) { /* ... unverändert ... */ if (!isoDate) return ''; const p = isoDate.split('-'); if (p.length === 3) return `${p[2]}.${p[1]}.${p[0]}`; return isoDate; }
    function getDatumString() { /* ... unverändert ... */ return "2025-04-05"; } // Datum aktualisiert

    // === 4. Initialisierung der App ===
    function initialisiereApp() {
        console.log("Initialisiere App...");
        // Sicherheitscheck erweitert um Zeit-Inputs
        if (!formularDiv || !tripEntryForm || !speichernButton || !cancelEditButton || !fahrtenListeDiv || !datumInput || !startTimeInput || !endTimeInput || !startOrtInput || !zielOrtInput || !kmStartInput || !kmEndeInput || !distanzInput || !zweckSelect || !exportButton || !zusammenfassungDiv || !exportJsonButton || !importJsonButton || !importJsonFileInput || !addNewButton) {
             console.error("FEHLER: Ein oder mehrere HTML-Elemente wurden nicht gefunden!"); alert("Initialisierungsfehler!"); return;
        }
        try { datumInput.value = getDatumString(); } catch (e) {} // Datum vorbelegen
        ladeGespeicherteFahrten(); updateZusammenfassung(); felderFuerNeueFahrtVorbereiten(); setupEventListeners();
        console.log("App initialisiert.");
    }
    function felderFuerNeueFahrtVorbereiten() {
        if (editId !== null) return; // Nicht im Edit-Modus ausführen
        console.log("Bereite Felder für neue Fahrt vor...");
        try {
            const alleFahrten = ladeFahrtenAusLocalStorage();
            let letzteEndZeit = null; // NEU: Letzte Endzeit merken
            if (alleFahrten.length > 0) {
                const letzteFahrt = alleFahrten[alleFahrten.length - 1]; // Letzte im sortierten Array
                if (letzteFahrt) {
                    startOrtInput.value = letzteFahrt.zielOrt || '';
                    kmStartInput.value = letzteFahrt.kmEnde || '';
                    letzteEndZeit = letzteFahrt.endTime; // NEU
                } else { startOrtInput.value = ''; kmStartInput.value = ''; }
            } else { startOrtInput.value = ''; kmStartInput.value = ''; }
            // Datum, Ziel, Distanz leeren
            datumInput.value = getDatumString(); zielOrtInput.value = ''; distanzInput.value = '';
            // NEU: Zeitfelder vorbelegen oder leeren
            // Option 1: Startzeit = Letzte Endzeit (falls vorhanden)
            // startTimeInput.value = letzteEndZeit || '';
            // Option 2: Startzeit = Aktuelle Uhrzeit
            // const now = new Date();
            // const hours = String(now.getHours()).padStart(2, '0');
            // const minutes = String(now.getMinutes()).padStart(2, '0');
            // startTimeInput.value = `${hours}:${minutes}`;
            // Option 3: Zeitfelder einfach leeren (aktuell)
            startTimeInput.value = '';
            endTimeInput.value = '';

        } catch (e) { console.error("Fehler beim Vorbelegen:", e); }
    }

    // === 5. Event Listener Setup ===
    function setupEventListeners() { /* ... unverändert ... */ console.log("Setze Event Listeners..."); if (addNewButton) { addNewButton.addEventListener('click', handleAddNewClick); } else { console.error("Listener Fehler: addNewButton fehlt!"); } if (speichernButton) { speichernButton.addEventListener('click', handleFormularSpeichern); } else { console.error("Listener Fehler: speichernButton fehlt!"); } if (cancelEditButton) { cancelEditButton.addEventListener('click', () => abbrechenEditModus(true)); } else { console.error("Listener Fehler: cancelEditButton fehlt!"); } if (fahrtenListeDiv) { fahrtenListeDiv.addEventListener('click', handleListClick); } else { console.error("Listener Fehler: fahrtenListeDiv fehlt!"); } if (exportButton) { exportButton.addEventListener('click', exportiereAlsCsv); } else { console.error("Listener Fehler: exportButton fehlt!"); } if (exportJsonButton) { exportJsonButton.addEventListener('click', exportiereAlsJson); } else { console.error("Listener Fehler: exportJsonButton fehlt!"); } if (importJsonButton) { importJsonButton.addEventListener('click', () => { if(importJsonFileInput) {importJsonFileInput.click();} else { console.error("Import File Input fehlt!");} }); } else { console.error("Listener Fehler: importJsonButton fehlt!"); } if (importJsonFileInput) { importJsonFileInput.addEventListener('change', importiereAusJson); } else { console.error("Listener Fehler: importJsonFileInput fehlt!"); } console.log("Event Listeners gesetzt."); }
    function handleAddNewClick() { /* ... leicht angepasst ... */ console.log("Add New Button geklickt"); if (formularDiv.classList.contains('form-visible') && editId === null) { formularDiv.classList.remove('form-visible'); console.log("Formular geschlossen."); } else { abbrechenEditModus(false); formularDiv.classList.add('form-visible'); felderFuerNeueFahrtVorbereiten(); console.log("Formular für neue Fahrt geöffnet."); datumInput.focus(); formularDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }
    function handleListClick(event) { /* ... unverändert ... */ const editButton = event.target.closest('.edit-btn'); const deleteButton = event.target.closest('.delete-btn'); const fahrtElement = event.target.closest('[data-fahrt-id]'); if (!fahrtElement) return; const fahrtId = fahrtElement.getAttribute('data-fahrt-id'); if (editButton) { starteEditModus(fahrtId); } else if (deleteButton) { if (confirm('Soll dieser Eintrag wirklich gelöscht werden?')) { fahrtLoeschen(fahrtId); } } }

    // === 6. Kernfunktionen (Speichern, Update, Edit-Modus) ===
    function handleFormularSpeichern() { /* ... unverändert ... */ let success = false; if (editId !== null) { success = fahrtAktualisieren(editId); } else { success = fahrtSpeichern(); } if (success && formularDiv) { formularDiv.classList.remove('form-visible'); console.log("Formular nach Erfolg geschlossen."); } else { console.log("Speichern/Update nicht erfolgreich oder Formular nicht gefunden."); } }

    // Startet Edit-Modus (ANGEPASST: Zeitfelder füllen)
    function starteEditModus(fahrtId) {
        console.log("Starte Edit ID:", fahrtId);
        const fahrten = ladeFahrtenAusLocalStorage(); const fahrt = fahrten.find(f => f.id.toString() === fahrtId.toString()); if (!fahrt) { alert("Fehler: Eintrag nicht gefunden!"); return; }
        // Formular füllen inkl. Zeit
        datumInput.value = fahrt.datum || '';
        startTimeInput.value = fahrt.startTime || ''; // NEU
        endTimeInput.value = fahrt.endTime || '';   // NEU
        startOrtInput.value = fahrt.startOrt || ''; zielOrtInput.value = fahrt.zielOrt || '';
        kmStartInput.value = fahrt.kmStart || ''; kmEndeInput.value = fahrt.kmEnde || ''; distanzInput.value = fahrt.distanz || '';
        zweckSelect.value = fahrt.zweck || 'geschaeftlich';
        // Status setzen
        editId = fahrtId; speichernButton.textContent = 'Änderung speichern'; if(cancelEditButton) cancelEditButton.style.display = 'inline-block';
        // Sichtbar machen & scrollen
        if (formularDiv) { formularDiv.classList.add('form-visible'); formularDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        datumInput.focus();
    }

    // Bricht Edit-Modus ab (reset leert auch Zeitfelder)
    function abbrechenEditModus(doScroll = true) { /* ... unverändert, reset() sollte Zeit leeren ... */ console.log("Breche Edit ab / Reset Form."); editId = null; if(tripEntryForm) { tripEntryForm.reset(); console.log("Formular Reset."); } else { console.error("tripEntryForm nicht gefunden!"); } if (formularDiv) { formularDiv.classList.remove('form-visible'); console.log("Formular versteckt."); } speichernButton.textContent = 'Fahrt speichern'; if(cancelEditButton) cancelEditButton.style.display = 'none'; felderFuerNeueFahrtVorbereiten(); console.log("Edit abgebrochen."); }

    // Aktualisiert Fahrt (ANGEPASST: Zeitfelder berücksichtigen)
    function fahrtAktualisieren(id) {
        console.log("Update ID:", id);
        const fahrt = { // Aktuelle Formulardaten holen inkl. Zeit
            id: id, datum: datumInput.value,
            startTime: startTimeInput.value, // NEU
            endTime: endTimeInput.value,     // NEU
            startOrt: startOrtInput.value, zielOrt: zielOrtInput.value,
            kmStart: kmStartInput.value, kmEnde: kmEndeInput.value, distanz: distanzInput.value, zweck: zweckSelect.value
        };
        if (!validateFahrt(fahrt, false)) return false; // Validieren (ohne Kontinuität)
        let fahrten = ladeFahrtenAusLocalStorage(); const index = fahrten.findIndex(f => f.id.toString() === id.toString());
        if (index !== -1) {
            fahrten[index] = fahrt; speichereAlleFahrten(fahrten); // Speichert inkl. neuer Sortierung
            console.log("Fahrt aktualisiert.");
            ladeGespeicherteFahrten(); updateZusammenfassung();
            return true; // Erfolg
        } else { alert("Fehler beim Aktualisieren!"); abbrechenEditModus(); return false; } // Fehler
    }

    // Speichert neue Fahrt (ANGEPASST: Zeitfelder berücksichtigen)
    function fahrtSpeichern() {
        console.log("Speichere neue Fahrt...");
        const neueFahrt = { // Neues Objekt inkl. Zeit
            id: Date.now(), datum: datumInput.value,
            startTime: startTimeInput.value, // NEU
            endTime: endTimeInput.value,     // NEU
            startOrt: startOrtInput.value, zielOrt: zielOrtInput.value,
            kmStart: kmStartInput.value, kmEnde: kmEndeInput.value, distanz: distanzInput.value, zweck: zweckSelect.value
        };
        if (!validateFahrt(neueFahrt, true)) return false; // Validieren (mit Kontinuität)
        console.log('Neue Fahrt validiert:', neueFahrt);
        speichereNeueFahrtImLocalStorage(neueFahrt); // Fügt hinzu und speichert (sortiert)
        ladeGespeicherteFahrten(); updateZusammenfassung(); felderFuerNeueFahrtVorbereiten(); zielOrtInput.focus();
        return true; // Erfolg
    }

    // === 7. Validierungsfunktion (ANGEPASST: Zeitprüfung) ===
    function validateFahrt(fahrt, checkKmContinuity) {
        console.log("Validiere Fahrt:", fahrt, "Kontinuität prüfen:", checkKmContinuity);
        // Basisprüfung Pflichtfelder (inkl. Zeit)
        if (!fahrt.datum || !fahrt.startTime || !fahrt.endTime || !fahrt.startOrt || !fahrt.zielOrt || !fahrt.kmStart || !fahrt.kmEnde || !fahrt.zweck) {
             alert('Bitte füllen Sie alle Pflichtfelder aus (inkl. Start- und Endzeit)!'); return false;
        }
        // Prüfung KM-Werte
        const kmStartNum = parseFloat(fahrt.kmStart); const kmEndeNum = parseFloat(fahrt.kmEnde);
        if (isNaN(kmStartNum) || isNaN(kmEndeNum)) { alert('Bitte gültige KM-Stände eingeben.'); return false; }
        if (kmEndeNum < kmStartNum) { alert('End-KM muss >= Start-KM sein.'); return false; }

        // NEU: Prüfung Zeit (Endzeit >= Startzeit, nur wenn Datum gleich ist - Vereinfachung!)
        // Das HTML5 time input gibt Zeit als "HH:MM" String zurück. String-Vergleich funktioniert hier.
        if (fahrt.endTime < fahrt.startTime) {
             // Hier könnte man noch prüfen, ob das Datum unterschiedlich ist (Fahrt über Mitternacht).
             // Für Einfachheit: Fehler, wenn Endzeit < Startzeit.
             alert('Fehler: Die Endzeit darf nicht vor der Startzeit liegen.');
             return false;
        }

        // Distanz berechnen/prüfen
        let distanzNum = parseFloat(fahrt.distanz); const berechneteDistanz = kmEndeNum - kmStartNum;
        if (isNaN(distanzNum) || distanzNum <= 0) { fahrt.distanz = berechneteDistanz.toFixed(1); console.log("Distanz auto:", fahrt.distanz); }
        else { if (Math.abs(distanzNum - berechneteDistanz) > 1) { if (!confirm(`Distanz (${distanzNum} km) vs Differenz (${berechneteDistanz.toFixed(1)} km). Speichern?`)) { return false; } } fahrt.distanz = distanzNum.toFixed(1); }

        // KM-Kontinuitätsprüfung (nur bei NEUEN Fahrten)
        if (checkKmContinuity) {
            const alleFahrten = ladeFahrtenAusLocalStorage();
            if (alleFahrten.length > 0) {
                let maxKmEnde = 0; alleFahrten.forEach(f => { const k = parseFloat(f.kmEnde); if (!isNaN(k) && k > maxKmEnde) maxKmEnde = k; });
                console.log("Kontinuitätsprüfung: Neuer Start =", kmStartNum, "Max Ende bisher =", maxKmEnde);
                // Strenge Prüfung (optional): Check gegen Ende der *letzten* Fahrt (nach neuer Sortierung)
                // const letzteFahrt = alleFahrten[alleFahrten.length - 1];
                // if (letzteFahrt && kmStartNum < parseFloat(letzteFahrt.kmEnde)) { /* ... Fehler ...*/ }
                // Einfache Prüfung (wie bisher):
                 if (kmStartNum < maxKmEnde) { alert(`Fehler: Start-KM (${kmStartNum}) < max. bisheriger End-KM (${maxKmEnde}). Lücken?`); return false; }
            }
        }
        console.log("Validierung OK.");
        return true; // Alles OK
    }

    // === 8. Speicher / Ladefunktionen (localStorage) ===
    // Speichert Array (ANGEPASST: Sortierung nach Datum UND Startzeit)
    function speichereAlleFahrten(fahrtenArray) {
         fahrtenArray.sort((a, b) => {
              // Kombiniere Datum und Zeit für Vergleich, falls vorhanden
              const dateTimeA = a.datum + 'T' + (a.startTime || '00:00');
              const dateTimeB = b.datum + 'T' + (b.startTime || '00:00');
              if (dateTimeA < dateTimeB) return -1;
              if (dateTimeA > dateTimeB) return 1;
              // Wenn Datum & Zeit gleich sind (unwahrscheinlich, aber möglich), nach KM sortieren
              return parseFloat(a.kmStart) - parseFloat(b.kmStart);
         });
         try { localStorage.setItem('fahrtenbuchEintraege', JSON.stringify(fahrtenArray)); console.log(`${fahrtenArray.length} Fahrten im LS gespeichert (sortiert nach Zeit).`); }
         catch (e) { console.error("Fehler LS Speichern:", e); alert("Fehler beim Speichern!"); }
    }
    // Fügt neue Fahrt hinzu und speichert (nutzt speichereAlleFahrten für Sortierung)
    function speichereNeueFahrtImLocalStorage(neueFahrt) { /* ... unverändert ... */ let f=ladeFahrtenAusLocalStorage(); if(!f.some(x=>x.id===neueFahrt.id)){f.push(neueFahrt); speichereAlleFahrten(f);}else{console.warn("ID doppelt:", neueFahrt.id);} }
    // Lädt Fahrten (gibt sortiertes Array zurück)
    function ladeFahrtenAusLocalStorage() { /* ... unverändert ... */ const d=localStorage.getItem('fahrtenbuchEintraege'); try{return d?JSON.parse(d):[];}catch(e){console.error("LS Parse Fehler:", e); return [];} }

    // === 9. Löschfunktion ===
    function fahrtLoeschen(fahrtId) { /* ... unverändert ... */ console.log("Lösche ID:", fahrtId); let f=ladeFahrtenAusLocalStorage(); const a=f.length; const upd=f.filter(x=>x.id.toString()!==fahrtId.toString()); if(a !== upd.length){ speichereAlleFahrten(upd); ladeGespeicherteFahrten(); updateZusammenfassung(); console.log(`ID ${fahrtId} gelöscht.`); if(editId === fahrtId){ abbrechenEditModus(false); } }else{ console.warn("Zu löschende ID nicht gefunden:", fahrtId);} }

    // === 10. Anzeige-Funktionen (Liste, Zusammenfassung) ===
    // Baut Liste neu auf
    function ladeGespeicherteFahrten() { /* ... unverändert (lädt sortierte Daten) ... */ const f=ladeFahrtenAusLocalStorage(); console.log(`${f.length} Fahrten für Anzeige.`); if(!fahrtenListeDiv){console.error("Liste Div fehlt!"); return;} fahrtenListeDiv.innerHTML=''; if(f.length===0){fahrtenListeDiv.innerHTML='<p>Noch keine Fahrten gespeichert.</p>';}else{ f.forEach(x=>{fahrtZurListeHinzufuegen(x, true);}); } } // true=append (älteste unten)

    // Erzeugt HTML für Listeneintrag (ANGEPASST: Zeit anzeigen)
    function fahrtZurListeHinzufuegen(fahrt, append = false) {
         if(!fahrtenListeDiv) return;
         const p=fahrtenListeDiv.querySelector('p'); if(p) p.remove();

         const el = document.createElement('div'); el.classList.add('fahrt-item'); el.setAttribute('data-fahrt-id', fahrt.id);
         const s=fahrt.kmStart||'0'; const e=fahrt.kmEnde||'0'; const d=fahrt.distanz||'0.0'; const dat=formatDateDE(fahrt.datum);
         const startTime = fahrt.startTime || '--:--'; // NEU
         const endTime = fahrt.endTime || '--:--';     // NEU
         const startOrt = fahrt.startOrt || '-'; const zielOrt = fahrt.zielOrt || '-'; const zweck = fahrt.zweck || '-';
         // Buttons
         const btns=`<div class="buttons-container"><button class="edit-btn" title="Bearbeiten"><i class="fa-solid fa-pencil"></i></button><button class="delete-btn" title="Löschen"><i class="fa-solid fa-trash-can"></i></button></div>`;
         // HTML Struktur mit Zeit
         el.innerHTML=`
            <div class="list-item-header">
                <div class="list-item-date">
                    <span class="list-label">Datum:</span><span class="value-tag">${dat}</span>
                    <span style="margin-left: 10px;">(<span class="value-tag">${startTime}</span> - <span class="value-tag">${endTime}</span> Uhr)</span> </div>
                ${btns}
            </div>
            <div class="list-item-details">
                <div><span class="list-label">Von:</span><span class="value-tag">${startOrt}</span></div>
                <div><span class="list-label">Nach:</span><span class="value-tag">${zielOrt}</span></div>
                <div><span class="list-label">KM-Start:</span><span class="value-tag">${s}</span></div>
                <div><span class="list-label">KM-Ende:</span><span class="value-tag">${e}</span></div>
                <div><span class="list-label">Distanz:</span><span class="value-tag">${d} km</span></div>
                <div><span class="list-label">Zweck:</span><span class="value-tag">${zweck}</span></div>
            </div>`;
         if(append){ fahrtenListeDiv.appendChild(el); } // Unten anfügen
         else { fahrtenListeDiv.insertBefore(el, fahrtenListeDiv.firstChild); } // Oben einfügen
     }
    // Aktualisiert Zusammenfassung (unverändert)
    function updateZusammenfassung() { /* ... unverändert ... */ if(!zusammenfassungDiv){return;} const f=ladeFahrtenAusLocalStorage(); let t=0,g=0,p=0,a=0; f.forEach(x=>{const d=parseFloat(x.distanz); if(!isNaN(d)){t+=d; switch(x.zweck){case 'geschaeftlich':g+=d; break; case 'privat':p+=d; break; case 'arbeitsweg':a+=d; break;}}}); zusammenfassungDiv.innerHTML=`<h2>Zusammenfassung</h2><p><strong>Gesamt:</strong> ${t.toFixed(1)} km</p><ul><li>Geschäftlich: ${g.toFixed(1)} km</li><li>Privat: ${p.toFixed(1)} km</li><li>Arbeitsweg: ${a.toFixed(1)} km</li></ul>`; }

    // === 11. Export/Import Funktionen (ANGEPASST: Zeitfelder) ===
    // Exportiert als CSV (mit Zeit)
    function exportiereAlsCsv() {
        console.log('CSV Export...');
        const fahrten = ladeFahrtenAusLocalStorage(); if(fahrten.length===0){alert('Keine Fahrten.'); return;}
        // Sortierung nach Datum+Zeit ist schon im Speicher
        const header = ["Datum", "Startzeit", "Endzeit", "Start-Ort", "Ziel-Ort", "KM-Start", "KM-Ende", "Distanz (km)", "Zweck"]; // NEU: Zeitspalten
        const esc=(fld)=>{const s=String(fld==null?'':fld); if(s.includes(';')||s.includes('"')||s.includes('\n'))return `"${s.replace(/"/g,'""')}"`; return s;};
        let csvContent = header.join(';') + '\n';
        fahrten.forEach(x => { const row=[x.datum, x.startTime || '', x.endTime || '', x.startOrt, x.zielOrt, x.kmStart, x.kmEnde, x.distanz, x.zweck]; csvContent += row.map(esc).join(';') + '\n'; }); // NEU: Zeit in Zeile
        triggerDownload(csvContent,'text/csv;charset=utf-8;',`fahrtenbuch_${getDatumString()}.csv`);
    }
    // Exportiert als JSON (Zeit ist automatisch drin)
    function exportiereAlsJson() { /* ... unverändert ... */ console.log("Exportiere JSON..."); try{const f=ladeFahrtenAusLocalStorage(); if(f.length===0){alert("Keine Fahrten."); return;} const json=JSON.stringify(f,null,2); triggerDownload(json,'application/json;charset=utf-8;',`fahrtenbuch_backup_${getDatumString()}.json`);} catch(e){console.error("Fehler JSON Export:", e); alert("Fehler Backup.");} }
    // Importiert aus JSON (ANGEPASST: Validierung prüft auf Zeitfelder)
    function importiereAusJson(event) {
        console.log("Importiere JSON...");
        const file=event.target.files[0]; if(!file){return;}
        if(!confirm(`ACHTUNG:\nAlle Fahrten werden durch Inhalt der Datei "${file.name}" ersetzt.\n\nFortfahren?`)){event.target.value=null; return;}
        const reader=new FileReader();
        reader.onload=function(e){
            try{
                const json=e.target.result; const impF=JSON.parse(json);
                // Einfache Prüfung, ob es ein Array ist und ob erste Fahrt plausible Felder hat (inkl. Zeit)
                if(!Array.isArray(impF) || (impF.length>0 && (typeof impF[0].id==='undefined' || typeof impF[0].datum==='undefined' || typeof impF[0].startTime==='undefined'))) {
                    throw new Error("Datei scheint kein gültiges Fahrtenbuch-Backup zu sein (fehlende Felder?).");
                }
                speichereAlleFahrten(impF); // Speichert importierte Daten (inkl. Sortierung)
                console.log(`Erfolgreich ${impF.length} Fahrten importiert.`);
                initialisiereApp(); // Lädt alles neu
                alert(`Erfolgreich ${impF.length} Fahrten importiert!`);
            } catch(e){ console.error("Fehler JSON Import:", e); alert(`Fehler Import:\n${e.message}`); }
            finally{ event.target.value=null; } // Input zurücksetzen
        };
        reader.onerror=function(){console.error("Fehler Lesen:", reader.error); alert("Fehler beim Lesen der Datei."); event.target.value=null;};
        reader.readAsText(file);
    }
    // Hilfsfunktion Download (unverändert)
    function triggerDownload(content, mimeType, filename) { /* ... unverändert ... */ const BOM=mimeType.includes('csv')?'\uFEFF':''; const blob=new Blob([BOM+content],{type:mimeType}); const link=document.createElement("a"); if(link.download!==undefined){const url=URL.createObjectURL(blob); link.setAttribute("href",url); link.setAttribute("download",filename); link.style.visibility='hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); console.log(`Datei ${filename} angeboten.`);}else{alert("Direkter Download nicht unterstützt.");}}

    // === 12. App starten ===
    initialisiereApp(); // Startet die Anwendung

}); // Ende DOMContentLoaded Listener