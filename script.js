// === script.js ===
// Stand: 2025-04-05, FINAL KORRIGIERTE VERSION (inkl. Auto, Kommentare, Bugfixes)

document.addEventListener('DOMContentLoaded', function() {

    // === 1. Konstanten & Referenzen auf HTML-Elemente ===
    const formularDiv = document.getElementById('fahrt-formular');
    const tripEntryForm = document.getElementById('trip-entry-form');
    const speichernButton = document.getElementById('speichern-btn');
    const cancelEditButton = document.getElementById('cancel-edit-btn');
    const fahrtenListeDiv = document.getElementById('fahrten-liste');
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
    const exportButton = document.getElementById('export-csv-btn');
    const zusammenfassungDiv = document.getElementById('zusammenfassung');
    const exportJsonButton = document.getElementById('export-json-btn');
    const importJsonButton = document.getElementById('import-json-btn');
    const importJsonFileInput = document.getElementById('import-json-file');
    const addNewButton = document.getElementById('add-new-btn');
    const addCarForm = document.getElementById('add-car-form');
    const carNameInput = document.getElementById('car-name');
    const carPlateInput = document.getElementById('car-plate');
    const addCarButton = document.getElementById('add-car-btn');
    const carListUl = document.getElementById('car-list');

    // === 2. Statusvariablen ===
    let editId = null;
    let cars = [];

    // === 3. Hilfsfunktionen ===
    function formatDateDE(isoDate) { if (!isoDate) return ''; const p = isoDate.split('-'); if (p.length === 3) return `${p[2]}.${p[1]}.${p[0]}`; return isoDate; }
    function getDatumString() { return "2025-04-05"; }

    // === 4. Fahrzeug-Verwaltungsfunktionen ===
    function loadCars() {
        const storedCars = localStorage.getItem('fahrtenbuchCars');
        try { cars = storedCars ? JSON.parse(storedCars) : []; console.log(`${cars.length} Fahrzeuge geladen.`); }
        catch(e) { console.error("Fehler Laden Fahrzeuge:", e); cars = []; }
        cars.forEach(car => { if (!car.id) car.id = Date.now() + Math.random(); });
    }
    function saveCars() {
        try { localStorage.setItem('fahrtenbuchCars', JSON.stringify(cars)); console.log("Fahrzeuge gespeichert."); }
        catch (e) { console.error("Fehler Speichern Fahrzeuge:", e); alert("Fehler Speichern Fahrzeuge!"); }
    }
    // Wird für Initialisierung und nach Speichern/Abbrechen gebraucht
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
        } catch (e) { console.error("Fehler Vorbelegen:", e); }
    } // Ende felderFuerNeueFahrtVorbereiten

    function displayCarList() {
        if (!carListUl) return; carListUl.innerHTML = '';
        if (cars.length === 0) { carListUl.innerHTML = '<li>Keine Fahrzeuge angelegt.</li>'; }
        else { cars.forEach(car => { const li = document.createElement('li'); li.textContent = `${car.name || 'Unbenannt'}`; if (car.plate) { const ps = document.createElement('strong'); ps.textContent = ` (${car.plate})`; li.appendChild(ps); } carListUl.appendChild(li); }); }
    }
    function populateCarDropdown() {
        if (!carSelect) return;
        while (carSelect.options.length > 1) { carSelect.remove(1); }
        cars.forEach(car => { const o = document.createElement('option'); o.value = car.id; o.textContent = `${car.name || 'Unbenannt'}${car.plate ? ` (${car.plate})` : ''}`; carSelect.appendChild(o); });
    }
    function handleAddCar() {
        const name = carNameInput.value.trim(); const plate = carPlateInput.value.trim().toUpperCase();
        if (!name || !plate) { alert("Bitte Name/Modell und Kennzeichen eingeben."); return; }
        if (cars.some(car => car.plate === plate)) { if (!confirm(`Kennzeichen "${plate}" existiert bereits. Trotzdem?`)) { return; } }
        const newCar = { id: Date.now(), name: name, plate: plate };
        cars.push(newCar); saveCars(); displayCarList(); populateCarDropdown(); addCarForm.reset();
        console.log("Neues Fahrzeug:", newCar); alert(`Fahrzeug "${name} (${plate})" hinzugefügt!`);
    }

    // === 5. Initialisierung der App ===
    function initialisiereApp() {
        console.log("Initialisiere App...");
        if (!formularDiv || !tripEntryForm || !speichernButton || !cancelEditButton || !fahrtenListeDiv || !datumInput || !startTimeInput || !endTimeInput || !startOrtInput || !zielOrtInput || !kmStartInput || !kmEndeInput || !distanzInput || !carSelect || !zweckSelect || !exportButton || !zusammenfassungDiv || !exportJsonButton || !importJsonButton || !importJsonFileInput || !addNewButton || !addCarForm || !carNameInput || !carPlateInput || !addCarButton || !carListUl ) {
             console.error("FEHLER: HTML-Elemente fehlen!"); alert("Initialisierungsfehler!"); return;
        }
        try { datumInput.value = getDatumString(); } catch (e) {}
        loadCars(); ladeGespeicherteFahrten(); updateZusammenfassung(); displayCarList(); populateCarDropdown();
        felderFuerNeueFahrtVorbereiten(); setupEventListeners();
        console.log("App initialisiert.");
    }

    // === 6. Event Listener Setup ===
    function setupEventListeners() {
        console.log("Setze Event Listeners...");
        if (addNewButton) { addNewButton.addEventListener('click', handleAddNewClick); } else { console.error("Listener Fehler: addNewButton fehlt!"); }
        if (speichernButton) { speichernButton.addEventListener('click', handleFormularSpeichern); } else { console.error("Listener Fehler: speichernButton fehlt!"); }
        if (cancelEditButton) { cancelEditButton.addEventListener('click', () => abbrechenEditModus(true)); } else { console.error("Listener Fehler: cancelEditButton fehlt!"); }
        if (fahrtenListeDiv) { fahrtenListeDiv.addEventListener('click', handleListClick); } else { console.error("Listener Fehler: fahrtenListeDiv fehlt!"); }
        if (exportButton) { exportButton.addEventListener('click', exportiereAlsCsv); } else { console.error("Listener Fehler: exportButton fehlt!"); }
        if (exportJsonButton) { exportJsonButton.addEventListener('click', exportiereAlsJson); } else { console.error("Listener Fehler: exportJsonButton fehlt!"); }
        if (importJsonButton) { importJsonButton.addEventListener('click', () => { if(importJsonFileInput) importJsonFileInput.click(); }); } else { console.error("Listener Fehler: importJsonButton fehlt!"); }
        if (importJsonFileInput) { importJsonFileInput.addEventListener('change', importiereAusJson); } else { console.error("Listener Fehler: importJsonFileInput fehlt!"); }
        if (addCarButton) { addCarButton.addEventListener('click', handleAddCar); } else { console.error("Listener Fehler: addCarButton fehlt!"); }
        console.log("Event Listeners gesetzt.");
    }
    function handleAddNewClick() { console.log("Add New geklickt"); if (formularDiv.classList.contains('form-visible') && editId === null) { formularDiv.classList.remove('form-visible'); console.log("Form geschlossen."); } else { abbrechenEditModus(false); formularDiv.classList.add('form-visible'); felderFuerNeueFahrtVorbereiten(); console.log("Form geöffnet."); datumInput.focus(); formularDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }
    function handleListClick(event) { const editBtn = event.target.closest('.edit-btn'); const delBtn = event.target.closest('.delete-btn'); const item = event.target.closest('[data-fahrt-id]'); if (!item) return; const id = item.getAttribute('data-fahrt-id'); if (editBtn) { starteEditModus(id); } else if (delBtn) { if (confirm('Eintrag löschen?')) { fahrtLoeschen(id); } } }

    // === 7. Kernfunktionen ===
    function handleFormularSpeichern() { console.log("Speichern/Update. Edit ID:", editId); let success = false; if (editId !== null) { success = fahrtAktualisieren(editId); } else { success = fahrtSpeichern(); } if (success && formularDiv) { formularDiv.classList.remove('form-visible'); console.log("Form nach Erfolg geschlossen."); } else { console.log("Speichern/Update nicht erfolgreich."); } }
    function starteEditModus(fahrtId) { console.log("Starte Edit ID:", fahrtId); const fahrten=ladeFahrtenAusLocalStorage(); const fahrt=fahrten.find(f=>f.id.toString()===fahrtId.toString()); if(!fahrt){alert("Fehler: Eintrag nicht gefunden!"); return;} datumInput.value=fahrt.datum||''; startTimeInput.value=fahrt.startTime||''; endTimeInput.value=fahrt.endTime||''; startOrtInput.value=fahrt.startOrt||''; zielOrtInput.value=fahrt.zielOrt||''; kmStartInput.value=fahrt.kmStart||''; kmEndeInput.value=fahrt.kmEnde||''; distanzInput.value=fahrt.distanz||''; carSelect.value=fahrt.carId||''; zweckSelect.value=fahrt.zweck||'geschaeftlich'; editId=fahrtId; speichernButton.textContent='Änderung speichern'; if(cancelEditButton)cancelEditButton.style.display='inline-block'; if(formularDiv){formularDiv.classList.add('form-visible'); formularDiv.scrollIntoView({behavior:'smooth',block:'nearest'});} datumInput.focus(); }
    function abbrechenEditModus(doScroll = true) { console.log("Breche Edit ab / Reset Form."); editId = null; if(tripEntryForm){tripEntryForm.reset(); console.log("Formular Reset.");} else {console.error("tripEntryForm nicht gefunden!");} if(formularDiv){formularDiv.classList.remove('form-visible'); console.log("Formular versteckt.");} speichernButton.textContent='Fahrt speichern'; if(cancelEditButton)cancelEditButton.style.display='none'; felderFuerNeueFahrtVorbereiten(); console.log("Edit abgebrochen."); }
    function fahrtAktualisieren(id) { console.log("Update ID:", id); const fahrt={id:id, datum:datumInput.value, startTime:startTimeInput.value, endTime:endTimeInput.value, startOrt:startOrtInput.value, zielOrt:zielOrtInput.value, kmStart:kmStartInput.value, kmEnde:kmEndeInput.value, distanz:distanzInput.value, carId:carSelect.value, zweck:zweckSelect.value}; if(!validateFahrt(fahrt,false)) return false; let fahrten=ladeFahrtenAusLocalStorage(); const index=fahrten.findIndex(f=>f.id.toString()===id.toString()); if(index!==-1){fahrten[index]=fahrt; speichereAlleFahrten(fahrten); console.log("Fahrt aktualisiert."); ladeGespeicherteFahrten(); updateZusammenfassung(); return true;} else {alert("Fehler beim Aktualisieren!"); abbrechenEditModus(); return false;} }
    function fahrtSpeichern() { console.log("Speichere neue Fahrt..."); const neueFahrt={id:Date.now(), datum:datumInput.value, startTime:startTimeInput.value, endTime:endTimeInput.value, startOrt:startOrtInput.value, zielOrt:zielOrtInput.value, kmStart:kmStartInput.value, kmEnde:kmEndeInput.value, distanz:distanzInput.value, carId:carSelect.value, zweck:zweckSelect.value}; if(!validateFahrt(neueFahrt,true)) return false; console.log('Neue Fahrt validiert:', neueFahrt); speichereNeueFahrtImLocalStorage(neueFahrt); ladeGespeicherteFahrten(); updateZusammenfassung(); felderFuerNeueFahrtVorbereiten(); zielOrtInput.focus(); return true; }

    // === 8. Validierungsfunktion ===
    function validateFahrt(fahrt, checkKmContinuity) { console.log("Validiere Fahrt:", fahrt, "Kontinuität:", checkKmContinuity); if(!fahrt.datum||!fahrt.startTime||!fahrt.endTime||!fahrt.startOrt||!fahrt.zielOrt||!fahrt.kmStart||!fahrt.kmEnde||!fahrt.carId||!fahrt.zweck){alert('Pflichtfelder (inkl. Zeit, Fahrzeug)!');return false;} const s=parseFloat(fahrt.kmStart),e=parseFloat(fahrt.kmEnde); if(isNaN(s)||isNaN(e)){alert('Ungültige KM!');return false;} if(e<s){alert('End-KM < Start-KM!');return false;} if(fahrt.endTime<fahrt.startTime){alert('Endzeit < Startzeit!');return false;} let d=parseFloat(fahrt.distanz); const b=e-s; if(isNaN(d)||d<=0){fahrt.distanz=b.toFixed(1);}else{if(Math.abs(d-b)>1){if(!confirm(`Distanz (${d} km) vs Differenz (${b.toFixed(1)} km). Speichern?`)){return false;}} fahrt.distanz=d.toFixed(1);} if(checkKmContinuity){const a=ladeFahrtenAusLocalStorage(); if(a.length>0){let m=0; a.forEach(f=>{const k=parseFloat(f.kmEnde); if(!isNaN(k)&&k>m)m=k;}); console.warn("Kontinuitätsprüfung global!"); if(s<m){alert(`Warnung: Start(${s})<MaxEnd(${m})!`);}}} console.log("Validierung OK."); return true; }

    // === 9. Speicher / Ladefunktionen ===
    function speichereAlleFahrten(fahrtenArray) { fahrtenArray.sort((a,b)=>{const dtA=a.datum+'T'+(a.startTime||'00:00'); const dtB=b.datum+'T'+(b.startTime||'00:00'); if(dtA<dtB)return -1; if(dtA>dtB)return 1; return parseFloat(a.kmStart)-parseFloat(b.kmStart);}); try{localStorage.setItem('fahrtenbuchEintraege',JSON.stringify(fahrtenArray)); console.log(`${fahrtenArray.length} Fahrten im LS.`);} catch(e){console.error("Fehler LS Speichern:", e); alert("Fehler beim Speichern!");} }
    function speichereNeueFahrtImLocalStorage(neueFahrt) { let f=ladeFahrtenAusLocalStorage(); if(!f.some(x=>x.id===neueFahrt.id)){f.push(neueFahrt); speichereAlleFahrten(f);}else{console.warn("ID doppelt:", neueFahrt.id);} }
    function ladeFahrtenAusLocalStorage() { const d=localStorage.getItem('fahrtenbuchEintraege'); try{return d?JSON.parse(d):[];}catch(e){console.error("LS Parse Fehler:", e); return [];} }

    // === 10. Löschfunktion ===
    function fahrtLoeschen(fahrtId) { console.log("Lösche ID:", fahrtId); let f=ladeFahrtenAusLocalStorage(); const a=f.length; const upd=f.filter(x=>x.id.toString()!==fahrtId.toString()); if(a!==upd.length){speichereAlleFahrten(upd); ladeGespeicherteFahrten(); updateZusammenfassung(); console.log(`ID ${fahrtId} gelöscht.`); if(editId && editId.toString() === fahrtId.toString()){abbrechenEditModus(false);}}else{console.warn("Zu löschende ID nicht gefunden:", fahrtId);} } // editId muss auch geprüft werden, ob es existiert

    // === 11. Anzeige-Funktionen ===
    function ladeGespeicherteFahrten() { const f=ladeFahrtenAusLocalStorage(); console.log(`${f.length} Fahrten für Anzeige.`); if(!fahrtenListeDiv){return;} fahrtenListeDiv.innerHTML=''; if(f.length===0){fahrtenListeDiv.innerHTML='<p>Noch keine Fahrten gespeichert.</p>';}else{f.forEach(x=>{fahrtZurListeHinzufuegen(x, true);});} }

    // Erzeugt HTML für Listeneintrag (mit Auto-Anzeige)
    // DIESE FUNKTION IST JETZT NUR EINMAL DEFINIERT!
    function fahrtZurListeHinzufuegen(fahrt, append = false) {
         if(!fahrtenListeDiv) { console.error("FEHLER: fahrtenListeDiv nicht gefunden!"); return; }
         const p=fahrtenListeDiv.querySelector('p'); if(p) p.remove();

         const el = document.createElement('div'); el.classList.add('fahrt-item'); el.setAttribute('data-fahrt-id', fahrt.id);
         const s=fahrt.kmStart||'0'; const e=fahrt.kmEnde||'0'; const d=fahrt.distanz||'0.0'; const dat=formatDateDE(fahrt.datum);
         const startTime = fahrt.startTime || '--:--'; const endTime = fahrt.endTime || '--:--';
         const startOrt = fahrt.startOrt || '-'; const zielOrt = fahrt.zielOrt || '-'; const zweck = fahrt.zweck || '-';
         // Fahrzeugnamen ermitteln
         const car = cars.find(c => c.id.toString() === (fahrt.carId || '').toString());
         const carDisplay = car ? `${car.name}${car.plate ? ` (${car.plate})` : ''}` : 'Unbekannt'; // Kurzer Fallback
         // Buttons HTML
         const btnsHTML = `<div class="buttons-container"><button class="edit-btn" title="Bearbeiten"><i class="fa-solid fa-pencil"></i></button><button class="delete-btn" title="Löschen"><i class="fa-solid fa-trash-can"></i></button></div>`;
         // HTML Struktur
         el.innerHTML=`
            <div class="list-item-header">
                <div class="list-item-date-time">
                    <span class="list-item-info date-info"><i class="fa-solid fa-calendar-days fa-fw list-icon"></i> ${dat}</span>
                    <span class="list-item-info time-info"><i class="fa-solid fa-clock fa-fw list-icon"></i> (${startTime} - ${endTime} Uhr)</span>
                    <span class="list-item-info car-info" title="${carDisplay}" style="margin-left: 15px; color: #5a6a7d;">
                         <i class="fa-solid fa-car fa-fw list-icon"></i>
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
            </div>`;
        if(append){ fahrtenListeDiv.appendChild(el); } else { fahrtenListeDiv.insertBefore(el, fahrtenListeDiv.firstChild); }
    } // Ende fahrtZurListeHinzufuegen

    function updateZusammenfassung() { if(!zusammenfassungDiv){return;} const f=ladeFahrtenAusLocalStorage(); let t=0,g=0,p=0,a=0; f.forEach(x=>{const d=parseFloat(x.distanz); if(!isNaN(d)){t+=d; switch(x.zweck){case 'geschaeftlich':g+=d; break; case 'privat':p+=d; break; case 'arbeitsweg':a+=d; break;}}}); zusammenfassungDiv.innerHTML=`<h2>Zusammenfassung</h2><p><strong>Gesamt:</strong> ${t.toFixed(1)} km</p><ul><li>Geschäftlich: ${g.toFixed(1)} km</li><li>Privat: ${p.toFixed(1)} km</li><li>Arbeitsweg: ${a.toFixed(1)} km</li></ul>`; }

    // === 12. Export/Import Funktionen ===
    function exportiereAlsCsv() { console.log('CSV Export...'); const f=ladeFahrtenAusLocalStorage(); if(f.length===0){alert('Keine Fahrten.'); return;} const h=["Datum","Startzeit","Endzeit","Start-Ort","Ziel-Ort","KM-Start","KM-Ende","Distanz (km)","Zweck","Fahrzeug ID","Fahrzeug Name","Fahrzeug Kennzeichen"]; const esc=(fld)=>(String(fld==null?'':fld).includes(';')||String(fld==null?'':fld).includes('"')||String(fld==null?'':fld).includes('\n'))?`"${String(fld).replace(/"/g,'""')}"`:String(fld==null?'':fld); let csv=h.join(';')+'\n'; f.forEach(x=>{const car=cars.find(c=>c.id.toString()===(x.carId||'').toString()); const cN=car?car.name:''; const cP=car?car.plate:''; const r=[x.datum,x.startTime||'',x.endTime||'',x.startOrt,x.zielOrt,x.kmStart,x.kmEnde,x.distanz,x.zweck,x.carId||'',cN,cP]; csv+=r.map(esc).join(';')+'\n';}); triggerDownload(csv,'text/csv;charset=utf-8;',`fahrtenbuch_${getDatumString()}.csv`); }
    function exportiereAlsJson() { console.log("Exportiere JSON..."); try{const f=ladeFahrtenAusLocalStorage(); const backupData={fahrten:f,autos:cars}; const json=JSON.stringify(backupData,null,2); triggerDownload(json,'application/json;charset=utf-8;',`fahrtenbuch_backup_${getDatumString()}.json`);} catch(e){console.error("Fehler JSON Export:", e); alert("Fehler Backup.");} }
    function importiereAusJson(event) { console.log("Importiere JSON..."); const file=event.target.files[0]; if(!file){return;} if(!confirm(`ACHTUNG:\nAlle Fahrten UND Fahrzeuge werden ersetzt.\n\nFortfahren?`)){event.target.value=null; return;} const reader=new FileReader(); reader.onload=function(e){ try{ const json=e.target.result; const importData=JSON.parse(json); if(!importData||!Array.isArray(importData.fahrten)||!Array.isArray(importData.autos)){throw new Error("Backup-Format ungültig (fahrten/autos fehlt).");} if(importData.fahrten.length>0&&(typeof importData.fahrten[0].id==='undefined'||typeof importData.fahrten[0].datum==='undefined'||typeof importData.fahrten[0].carId==='undefined')){throw new Error("Fahrten-Daten ungültig.");} if(importData.autos.length>0&&(typeof importData.autos[0].id==='undefined'||typeof importData.autos[0].name==='undefined'||typeof importData.autos[0].plate==='undefined')){throw new Error("Fahrzeug-Daten ungültig.");} cars=importData.autos; saveCars(); speichereAlleFahrten(importData.fahrten); console.log(`Import: ${importData.fahrten.length} Fahrten, ${importData.autos.length} Fahrzeuge.`); initialisiereApp(); alert(`Import erfolgreich!`);} catch(e){console.error("Fehler JSON Import:", e); alert(`Fehler Import:\n${e.message}`);} finally{event.target.value=null;} }; reader.onerror=function(){console.error("Fehler Lesen:", reader.error); alert("Fehler beim Lesen der Datei."); event.target.value=null;}; reader.readAsText(file); }
    function triggerDownload(content, mimeType, filename) { const BOM=mimeType.includes('csv')?'\uFEFF':''; const blob=new Blob([BOM+content],{type:mimeType}); const link=document.createElement("a"); if(link.download!==undefined){const url=URL.createObjectURL(blob); link.setAttribute("href",url); link.setAttribute("download",filename); link.style.visibility='hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); console.log(`Datei ${filename} angeboten.`);}else{alert("Direkter Download nicht unterstützt.");}}

    // === 13. App starten ===
    initialisiereApp(); // Startet alles

}); // Ende DOMContentLoaded Listener