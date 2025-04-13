// === script.js ===
// Stand: 2025-04-11, Mit Filter-Funktion und Custom Confirm Modal

document.addEventListener("DOMContentLoaded", function () {
  console.log("Fahrtenbuch App: DOM geladen.");

  // ========================================================================
  // === 1. Konstanten & Referenzen auf HTML-Elemente ===
  // ========================================================================
  // Hauptformular (Fahrten)
  const formularDiv = document.getElementById("fahrt-formular");
  const tripEntryForm = document.getElementById("trip-entry-form");
  const speichernButton = document.getElementById("speichern-btn");
  const cancelEditButton = document.getElementById("cancel-edit-btn");
  const datumInput = document.getElementById("datum");
  const startTimeInput = document.getElementById("start-zeit");
  const endTimeInput = document.getElementById("end-zeit");
  const startOrtInput = document.getElementById("start-ort");
  const zielOrtInput = document.getElementById("ziel-ort");
  const kmStartInput = document.getElementById("km-start");
  const kmEndeInput = document.getElementById("km-ende");
  const distanzInput = document.getElementById("distanz");
  const carSelect = document.getElementById("car-select"); // Hauptformular
  const zweckSelect = document.getElementById("zweck");
  // Listen & Anzeigen
  const fahrtenListeDiv = document.getElementById("fahrten-liste");
  const zusammenfassungDiv = document.getElementById("zusammenfassung");
  const carListUl = document.getElementById("car-list"); // Fahrzeugliste rechts
  // Sidebar & Header Buttons
  const exportButton = document.getElementById("export-csv-btn");
  const exportJsonButton = document.getElementById("export-json-btn");
  const importJsonButton = document.getElementById("import-json-btn");
  const importJsonFileInput = document.getElementById("import-json-file");
  const addNewButton = document.getElementById("add-new-btn"); // + Neue Fahrt
  const themeToggleButton = document.getElementById("theme-toggle-btn");
  const sidebarToggleButton = document.getElementById(
    "sidebar-toggle-internal"
  ); // Sidebar-Toggle
  const addCarMenuButton = document.getElementById("add-car-btn-menu"); // Neues Fahrzeug im Menü
  // Fahrzeug Modal Elemente
  const addCarModal = document.getElementById("add-car-modal");
  const modalCloseButton = document.getElementById("modal-close-btn");
  const modalCancelButton = document.getElementById("modal-cancel-car-btn");
  const modalSaveButton = document.getElementById("modal-save-car-btn");
  const modalCarForm = document.getElementById("modal-car-form");
  const modalCarNameInput = document.getElementById("modal-car-name");
  const modalCarPlateInput = document.getElementById("modal-car-plate");
  const modalCarError = document.getElementById("modal-car-error");
  // Filter Elemente
  const filterControlsDiv = document.getElementById("filter-controls");
  const filterCarSelect = document.getElementById("filter-car"); // Filter-Dropdown
  const filterPurposeSelect = document.getElementById("filter-purpose");
  const filterDateStartInput = document.getElementById("filter-date-start");
  const filterDateEndInput = document.getElementById("filter-date-end");
  const applyFilterButton = document.getElementById("apply-filter-btn");
  const resetFilterButton = document.getElementById("reset-filter-btn");
  const toggleFilterButton = document.getElementById("toggle-filter-btn");
  // NEU: Referenzen für Bestätigungs-Modal
  const confirmModal = document.getElementById("confirm-delete-modal");
  const confirmModalMessage = document.getElementById("modal-confirm-message");
  const confirmModalConfirmBtn = document.getElementById(
    "modal-confirm-confirm-btn"
  );
  const confirmModalCancelBtn = document.getElementById(
    "modal-confirm-cancel-btn"
  );
  const confirmModalCloseBtn = document.getElementById(
    "modal-confirm-close-btn"
  );
  // NEU: Referenz für Formular-Fehler Div
  const formErrorDiv = document.getElementById("form-error-message");
  // NEU: Referenz für Notification Container
  const notificationContainer = document.getElementById(
    "notification-container"
  );
  // NEU: Referenzen für Einstellungen-Modal & Button
  const settingsMenuButton = document.getElementById("settings-menu-btn");
  const settingsModal = document.getElementById("settings-modal");
  const settingsModalCloseBtn = document.getElementById(
    "settings-modal-close-btn"
  );
  const settingsModalCancelBtn = document.getElementById(
    "settings-modal-cancel-btn"
  );
  const settingsModalSaveBtn = document.getElementById(
    "settings-modal-save-btn"
  );
  const settingsForm = document.getElementById("settings-form");
  // Referenzen zu den Einstellungs-Feldern (werden später mehr genutzt)
  const settingDefaultCarSelect = document.getElementById(
    "setting-default-car"
  );
  const settingDefaultPurposeSelect = document.getElementById(
    "setting-default-purpose"
  );
  const settingDeleteAllBtn = document.getElementById("setting-delete-all-btn");
  // Radio-Buttons für CSV-Delimiter (Name wird für Query benötigt)
  const csvDelimiterRadioName = "setting-csv-delimiter";
  // NEU: Referenzen für Paginierung
  const paginationControls = document.getElementById("pagination-controls");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const pageInfoSpan = document.getElementById("page-info-span");

  // ========================================================================
  // === 2. Statusvariablen ===
  // ========================================================================
  let editId = null; // ID der Fahrt, die bearbeitet wird (null = keine Bearbeitung)
  let editCarId = null; // ID des Fahrzeugs, das bearbeitet wird (null = keine Bearbeitung)
  let cars = []; // Array für die Fahrzeugliste
  let confirmModalCallback = null; // Speicher für die "Ja"-Aktion des Bestätigungs-Modals
  let currentPage = 1; // Startet immer auf Seite 1
  const itemsPerPage = 10; // Anzahl Fahrten pro Seite (kannst du anpassen)
  let fullTripListForPagination = []; // Speichert die komplette Liste (gefiltert oder alle) für die Paginierung

  // ========================================================================
  // === 3. Hilfsfunktionen ===
  // ========================================================================
  /**
   * Formatiert ein ISO-Datum (JJJJ-MM-TT) in das deutsche Format (TT.MM.JJJJ).
   */
  function formatDateDE(isoDate) {
    if (!isoDate) return "";
    const p = isoDate.split("-");
    if (p.length === 3) return `${p[2]}.${p[1]}.${p[0]}`;
    return isoDate;
  }

  /**
   * Gibt das aktuelle Datum als String im JJJJ-MM-TT Format zurück.
   */
  function getDatumString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // ========================================================================
  // === Funktion zum Anzeigen von Benachrichtigungen ===
  // ========================================================================

  /**
   * Zeigt eine kurze Benachrichtigung (Toast) mit Fortschrittsbalken an.
   * @param {string} message Die anzuzeigende Nachricht.
   * @param {string} [type='success'] Typ der Nachricht ('success', 'error', 'info') - beeinflusst Styling.
   * @param {number} [duration=10000] Anzeigedauer in Millisekunden (Standard: 10 Sekunden).
   */
  function showNotification(message, type = "success", duration = 10000) {
    // Standard-Dauer auf 10s erhöht
    if (!notificationContainer) {
      console.error("Notification-Container nicht gefunden!");
      return;
    }

    // Neues Div für die gesamte Nachricht (Text + Balken)
    const notificationDiv = document.createElement("div");
    notificationDiv.classList.add("notification");
    notificationDiv.classList.add(`notification-${type}`); // Typ-Klasse für Styling (z.B. Randfarbe)

    // Element für den Nachrichtentext
    const messageElement = document.createElement("div"); // div statt p für einfacheres Styling
    messageElement.textContent = message;

    // Container für den Fortschrittsbalken
    const progressBarContainer = document.createElement("div");
    progressBarContainer.classList.add("notification-progress-bar");

    // Innerer Fortschrittsbalken (der animiert wird)
    const progressBarInner = document.createElement("div");
    progressBarInner.classList.add("notification-progress-bar-inner");
    progressBarInner.classList.add(`progress-bar-${type}`); // Klasse für Farbe des Balkens
    // Setze die Animationsdauer über Inline-Style, basierend auf 'duration'
    progressBarInner.style.animationDuration = `${duration / 1000}s`;

    // Elemente zusammenbauen
    progressBarContainer.appendChild(progressBarInner);
    notificationDiv.appendChild(messageElement);
    notificationDiv.appendChild(progressBarContainer);

    // Komplette Nachricht zum Container hinzufügen
    notificationContainer.appendChild(notificationDiv);

    // Nachricht nach 'duration' Millisekunden wieder entfernen
    setTimeout(() => {
      // Fade-Out Animation (optional, CSS muss das unterstützen)
      notificationDiv.style.animation = "fadeOut 0.5s ease-out forwards";
      // Nach der Fade-Out Animation entfernen
      setTimeout(() => notificationDiv.remove(), 500);
    }, duration);
  }
  /**
   * Aktualisiert die Paginierungs-Steuerelemente (Buttons, Seitenzahl).
   * Blendet die Steuerung aus, wenn es nur eine Seite oder weniger gibt.
   * @param {number} currentPage Aktuelle Seite.
   * @param {number} totalPages Gesamtanzahl der Seiten.
   */
  function updatePaginationControls(currentPage, totalPages) {
    if (!paginationControls || !prevPageBtn || !nextPageBtn || !pageInfoSpan) {
      console.error("Paginierungs-Steuerelemente nicht gefunden!");
      return;
    }

    if (totalPages <= 1) {
      paginationControls.style.display = "none"; // Verstecken, wenn nicht benötigt
      return;
    }

    paginationControls.style.display = "block"; // Anzeigen (oder 'flex', je nach Styling)
    pageInfoSpan.textContent = `Seite ${currentPage} von ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  }
  // ========================================================================
  // === 4. Theme (Dark Mode) Funktionen ===
  // ========================================================================
  /**
   * Setzt das Theme (CSS-Klasse am Body und Icon im Button).
   * @param {string} mode - 'light' oder 'dark'.
   */
  function setTheme(mode) {
    const icon = themeToggleButton?.querySelector("i.fa-solid");
    if (mode === "dark") {
      document.body.classList.add("dark-mode");
      if (icon) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
      }
      themeToggleButton?.setAttribute("title", "Light Mode aktivieren");
    } else {
      document.body.classList.remove("dark-mode");
      if (icon) {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
      }
      themeToggleButton?.setAttribute("title", "Dark Mode aktivieren");
    }
    console.log("Theme gesetzt:", mode);
  }

  /**
   * Handler für Klick auf den Theme-Toggle-Button.
   */
  function handleThemeToggle() {
    const isDarkMode = document.body.classList.contains("dark-mode");
    const newMode = isDarkMode ? "light" : "dark";
    setTheme(newMode);
    try {
      localStorage.setItem("theme", newMode);
    } catch (e) {
      console.error("Fehler beim Speichern der Theme-Präferenz:", e);
    }
  }

  /**
   * Lädt die Theme-Präferenz beim Start (localStorage oder System) und wendet sie an.
   */
  function loadAndSetInitialTheme() {
    let preferredTheme = "light"; // Standard
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        preferredTheme = savedTheme;
      } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        preferredTheme = "dark";
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
    const icon = sidebarToggleButton?.querySelector("i.fa-solid");
    if (collapsed) {
      document.body.classList.add("sidebar-collapsed");
      if (icon) {
        icon.classList.remove("fa-chevron-left");
        icon.classList.add("fa-bars");
      }
      sidebarToggleButton?.setAttribute("title", "Menü öffnen");
    } else {
      document.body.classList.remove("sidebar-collapsed");
      if (icon) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-chevron-left");
      }
      sidebarToggleButton?.setAttribute("title", "Menü schließen");
    }
  }

  /**
   * Handler für Klick auf den Sidebar-Toggle-Button.
   */
  function handleSidebarToggle() {
    const isCollapsed = document.body.classList.contains("sidebar-collapsed");
    setSidebarState(!isCollapsed); // Zustand umschalten
    try {
      localStorage.setItem("sidebarCollapsed", !isCollapsed);
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
      const savedState = localStorage.getItem("sidebarCollapsed");
      if (savedState === "true") {
        collapsed = true;
      }
    } catch (e) {
      console.error("Fehler beim Laden des Sidebar-Zustands:", e);
    }
    setSidebarState(collapsed);
  }

  // ========================================================================
  // === 6. Fahrzeug-Verwaltungsfunktionen ===
  // ========================================================================
  /**
   * Lädt die Fahrzeugliste aus dem localStorage.
   */
  function loadCars() {
    const storedCars = localStorage.getItem("fahrtenbuchCars");
    try {
      const parsedCars = storedCars ? JSON.parse(storedCars) : [];
      cars = Array.isArray(parsedCars) ? parsedCars : [];
      console.log(`${cars.length} Fahrzeuge geladen.`);
    } catch (e) {
      console.error("Fehler beim Laden der Fahrzeuge:", e);
      cars = [];
    }
    cars.forEach((car) => {
      if (!car.id) {
        car.id = Date.now() + Math.random().toString(16).slice(2);
      }
    });
  }

  /**
   * Speichert das aktuelle 'cars'-Array im localStorage.
   */
  function saveCars() {
    try {
      localStorage.setItem("fahrtenbuchCars", JSON.stringify(cars));
      console.log("Fahrzeuge gespeichert.");
    } catch (e) {
      console.error("Fehler beim Speichern der Fahrzeuge:", e);
      alert("Fehler beim Speichern der Fahrzeuge!");
    }
  }

  /**
   * Zeigt die Liste der angelegten Fahrzeuge im HTML (rechte Spalte) an.
   * (Angepasst: Nutzt CSS Klassen statt Inline-Styles für Buttons/Layout)
   */
  function displayCarList() {
    if (!carListUl) {
      console.error("Element für Fahrzeugliste (UL) nicht gefunden!");
      return;
    }
    carListUl.innerHTML = ""; // Liste leeren
    if (cars.length === 0) {
      // Optional: Klasse für leere Liste hinzufügen, falls spezifisches Styling gewünscht
      carListUl.innerHTML =
        '<li class="car-list-item-empty">Keine Fahrzeuge angelegt.</li>';
    } else {
      cars.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      cars.forEach((car) => {
        const li = document.createElement("li");
        li.classList.add("car-list-item"); // Klasse für LI
        li.setAttribute("data-car-id", car.id);

        const carNameText = car.name || "Unbenannt";
        const carPlateText = car.plate ? ` (${car.plate})` : "";

        // Span für Info-Teil (Icon, Name, Kennzeichen)
        const carInfoSpan = document.createElement("span");
        carInfoSpan.classList.add("car-list-info"); // Klasse für Info-Span
        // Verwende list-icon Klasse für das Icon
        carInfoSpan.innerHTML = `
                <i class="fa-solid fa-car-side fa-fw list-icon"></i>
                <span class="car-name">${carNameText}</span>
                <strong class="car-plate">${carPlateText}</strong>
            `;

        // Span für Aktions-Buttons
        const carActionsSpan = document.createElement("span");
        carActionsSpan.classList.add("car-list-actions"); // Klasse für Action-Span

        // Edit Button erstellen und Klassen hinzufügen
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.title = "Fahrzeug bearbeiten";
        editBtn.dataset.carId = car.id;
        editBtn.classList.add("car-list-button", "edit-car-btn"); // Basis-Klasse + spezifische Klasse
        editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';

        // Delete Button erstellen und Klassen hinzufügen
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.title = "Fahrzeug löschen";
        deleteBtn.dataset.carId = car.id;
        deleteBtn.classList.add("car-list-button", "delete-car-btn"); // Basis-Klasse + spezifische Klasse
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

        // Buttons zum Action-Span hinzufügen
        carActionsSpan.appendChild(editBtn);
        carActionsSpan.appendChild(deleteBtn);

        // Spans zum LI hinzufügen
        li.appendChild(carInfoSpan);
        li.appendChild(carActionsSpan);

        // LI zur UL hinzufügen
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
    const aktuellerWert = carSelect.value;
    while (carSelect.options.length > 1) {
      carSelect.remove(1);
    }
    cars.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    cars.forEach((car) => {
      const option = document.createElement("option");
      option.value = car.id;
      option.textContent = `${car.name || "Unbenannt"}${
        car.plate ? ` (${car.plate})` : ""
      }`;
      carSelect.appendChild(option);
    });
    carSelect.value = aktuellerWert;
  }

  /**
   * Füllt das Dropdown-Menü im Filterbereich mit den Fahrzeugen.
   */
  function populateFilterCarDropdown() {
    if (!filterCarSelect) {
      console.error("Fahrzeugauswahl-Dropdown im Filter nicht gefunden!");
      return;
    }
    const aktuellerWert = filterCarSelect.value;
    while (filterCarSelect.options.length > 1) {
      filterCarSelect.remove(1);
    }
    cars.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    cars.forEach((car) => {
      const option = document.createElement("option");
      option.value = car.id;
      option.textContent = `${car.name || "Unbenannt"}${
        car.plate ? ` (${car.plate})` : ""
      }`;
      filterCarSelect.appendChild(option);
    });
    filterCarSelect.value = aktuellerWert;
    console.log("Filter-Fahrzeug-Dropdown befüllt.");
  }

  // --- Modal-Funktionen für Fahrzeuge ---
  /**
   * Öffnet den Modal-Dialog zum Hinzufügen eines Fahrzeugs.
   */
  function openAddCarModal() {
    if (!addCarModal || !modalCarForm) return;
    console.log("Öffne Fahrzeug-Modal zum Hinzufügen...");
    editCarId = null; // Sicherstellen, dass wir im Hinzufügen-Modus sind
    modalCarForm.reset();
    if (modalCarError) {
      modalCarError.textContent = "";
      modalCarError.style.display = "none";
    }
    // Titel und Button auf Standard setzen
    const modalTitle = addCarModal.querySelector(".modal-header h2");
    if (modalTitle) modalTitle.textContent = "Neues Fahrzeug hinzufügen";
    if (modalSaveButton) modalSaveButton.textContent = "Fahrzeug speichern";

    addCarModal.classList.add("modal-visible"); // Klasse nutzen
    setTimeout(() => {
      modalCarNameInput?.focus();
    }, 50);
  }

  /**
   * Öffnet den Modal-Dialog zum Bearbeiten eines vorhandenen Fahrzeugs.
   * @param {string|number} carId Die ID des zu bearbeitenden Fahrzeugs.
   */
  function openEditCarModal(carId) {
    if (!addCarModal || !modalCarForm) return;
    console.log("Öffne Fahrzeug-Modal zum Bearbeiten für ID:", carId);

    const carToEdit = cars.find(
      (car) => car.id.toString() === carId.toString()
    );
    if (!carToEdit) {
      console.error("Zu bearbeitendes Fahrzeug nicht gefunden, ID:", carId);
      alert("Fehler: Zu bearbeitendes Fahrzeug nicht gefunden.");
      return;
    }

    editCarId = carId; // Globale Variable setzen

    modalCarNameInput.value = carToEdit.name;
    modalCarPlateInput.value = carToEdit.plate;

    if (modalCarError) {
      modalCarError.textContent = "";
      modalCarError.style.display = "none";
    }

    const modalTitle = addCarModal.querySelector(".modal-header h2");
    if (modalTitle) modalTitle.textContent = "Fahrzeug bearbeiten";
    if (modalSaveButton) modalSaveButton.textContent = "Änderungen speichern";

    addCarModal.classList.add("modal-visible"); // Klasse nutzen
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
    addCarModal.classList.remove("modal-visible"); // Klasse nutzen

    editCarId = null; // Bearbeitungsstatus zurücksetzen

    // Titel und Button-Text auf Standard zurücksetzen (wird in openAdd/Edit gesetzt)
    // const modalTitle = addCarModal.querySelector('.modal-header h2');
    // if (modalTitle) modalTitle.textContent = 'Neues Fahrzeug hinzufügen';
    // if (modalSaveButton) modalSaveButton.textContent = 'Fahrzeug speichern';

    console.log("Fahrzeug-Modal geschlossen, Edit-Status zurückgesetzt.");
  }

  /**
   * Verarbeitet das Speichern aus dem Modal-Dialog (Fahrzeug).
   * Unterscheidet zwischen Hinzufügen und Aktualisieren.
   */
  function handleModalSaveCar() {
    const name = modalCarNameInput?.value.trim();
    const plate = modalCarPlateInput?.value.trim();

    if (!name || !plate) {
      showModalError("Bitte Name/Modell und Kennzeichen eingeben.");
      return;
    }

    if (editCarId !== null) {
      // BEARBEITEN-MODUS
      console.log("Speichere Änderungen für Fahrzeug-ID:", editCarId);
      const otherCarHasSamePlate = cars.some(
        (car) =>
          car.id.toString() !== editCarId.toString() &&
          car.plate.toLowerCase() === plate.toLowerCase()
      );
      if (otherCarHasSamePlate) {
        showModalError(
          `Ein anderes Fahrzeug (${
            cars.find((c) => c.plate.toLowerCase() === plate.toLowerCase())
              ?.name || "?"
          }) hat bereits das Kennzeichen "${plate}".`
        );
        return;
      }
      const carToUpdate = cars.find(
        (car) => car.id.toString() === editCarId.toString()
      );
      if (carToUpdate) {
        carToUpdate.name = name;
        carToUpdate.plate = plate;
        saveCars();
        displayCarList();
        populateCarDropdown();
        populateFilterCarDropdown(); // Filter auch aktualisieren
        console.log("Fahrzeug erfolgreich aktualisiert:", carToUpdate);
        closeAddCarModal();
      } else {
        console.error(
          "Fehler beim Speichern: Zu bearbeitendes Fahrzeug nicht mehr im Array gefunden, ID:",
          editCarId
        );
        alert(
          "Fehler: Das zu bearbeitende Fahrzeug konnte nicht gefunden werden."
        );
        closeAddCarModal();
      }
    } else {
      // HINZUFÜGEN-MODUS
      console.log("Speichere neues Fahrzeug...");
      if (cars.some((car) => car.plate.toLowerCase() === plate.toLowerCase())) {
        showModalError(
          `Fehler: Ein Fahrzeug mit dem Kennzeichen "${plate}" existiert bereits.`
        );
        return; // Hinzufügen verhindern
      } else {
        if (modalCarError) {
          modalCarError.textContent = "";
          modalCarError.style.display = "none";
        }
      }
      const newCar = {
        id: Date.now() + Math.random().toString(16).slice(2),
        name: name,
        plate: plate,
      };
      cars.push(newCar);
      saveCars();
      displayCarList();
      populateCarDropdown();
      populateFilterCarDropdown(); // Filter auch aktualisieren
      console.log("Neues Fahrzeug gespeichert (via Modal):", newCar);
      closeAddCarModal();
    }
  }
  /**
   * Zeigt eine Fehlermeldung im Fahrzeug-Modal an.
   * @param {string} message - Die anzuzeigende Fehlermeldung.
   */
  function showModalError(message) {
    if (!modalCarError) return;
    modalCarError.textContent = message;
    modalCarError.style.display = "block";
  }
  // NEU: Funktion zum Füllen des Fahrzeug-Dropdowns im Einstellungs-Modal
  /**
   * Füllt das Dropdown-Menü für das Standard-Fahrzeug im Einstellungs-Modal.
   */
  function populateSettingsCarDropdown() {
    if (!settingDefaultCarSelect) {
      console.error(
        "Dropdown für Standard-Fahrzeug in Einstellungen nicht gefunden!"
      );
      return;
    }
    // Aktuellen Wert merken (wird beim Laden der Einstellungen wichtig)
    const aktuellerWert = settingDefaultCarSelect.value;

    // Alle Optionen außer der ersten ("-- Kein Standard --") entfernen
    while (settingDefaultCarSelect.options.length > 1) {
      settingDefaultCarSelect.remove(1);
    }
    // Sortierte Fahrzeuge hinzufügen
    cars.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    cars.forEach((car) => {
      const option = document.createElement("option");
      option.value = car.id; // ID als Wert
      option.textContent = `${car.name || "Unbenannt"}${
        car.plate ? ` (${car.plate})` : ""
      }`;
      settingDefaultCarSelect.appendChild(option);
    });
    // Versuchen, den alten Wert wieder auszuwählen
    // (Dieser Teil wird relevanter, wenn wir das Laden implementieren)
    settingDefaultCarSelect.value = aktuellerWert;
    console.log("Einstellungen: Standard-Fahrzeug-Dropdown befüllt.");
  }
  // ========================================================================
  // === NEU: Funktionen für Bestätigungs-Modal ===
  // ========================================================================

  /**
   * Öffnet das Bestätigungs-Modal mit einer Nachricht und speichert die Callback-Funktion.
   * (Mit zusätzlichem Debugging für Element-Referenzen)
   * @param {string} message Die Nachricht, die im Modal angezeigt werden soll.
   * @param {function} onConfirm Die Funktion, die ausgeführt wird, wenn "Bestätigen" geklickt wird.
   */
  function openConfirmModal(message, onConfirm) {
    if (!confirmModal || !confirmModalMessage) {
      console.error("Bestätigungs-Modal Elemente NICHT gefunden!");
      return;
    }
    confirmModalMessage.textContent = message;
    confirmModalCallback = onConfirm;
    // Nur Klasse hinzufügen:
    confirmModal.classList.add("modal-visible");
  }

  /**
   * Schließt das Bestätigungs-Modal und setzt den Callback zurück.
   * (Finale, saubere Version)
   */
  function closeConfirmModal() {
    if (!confirmModal) {
      console.error("Modal Element in closeConfirmModal NICHT gefunden!");
      return;
    }
    // Nur Klasse entfernen:
    confirmModal.classList.remove("modal-visible");
    confirmModalCallback = null;
  }
  // ========================================================================
  // === NEU: Funktionen für Einstellungs-Modal ===
  // ========================================================================

  /**
   * Lädt die Einstellungen aus dem Local Storage.
   * Gibt ein Objekt mit Standardwerten zurück, falls nichts gespeichert ist.
   * @returns {object} Das Einstellungs-Objekt.
   */
  function loadSettings() {
    const defaultSettings = {
      defaultCar: "",
      defaultPurpose: "",
      csvDelimiter: ";", // Standard-Trennzeichen
    };
    try {
      const storedSettings = localStorage.getItem("fahrtenbuchAppSettings");
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Stelle sicher, dass alle Schlüssel vorhanden sind, füge ggf. Defaults hinzu
        return { ...defaultSettings, ...parsedSettings };
      } else {
        return defaultSettings; // Keine Einstellungen gespeichert, Defaults nutzen
      }
    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen:", error);
      return defaultSettings; // Bei Fehler Defaults nutzen
    }
  }

  /**
   * Speichert das übergebene Einstellungs-Objekt im Local Storage.
   * @param {object} settings Das zu speichernde Einstellungs-Objekt.
   */
  function saveSettings(settings) {
    try {
      localStorage.setItem("fahrtenbuchAppSettings", JSON.stringify(settings));
      console.log("Einstellungen gespeichert:", settings);
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
      showNotification(
        "Fehler beim Speichern der Einstellungen!",
        "error",
        5000
      );
    }
  }

  /**
   * Öffnet das Einstellungs-Modal und befüllt die Felder mit gespeicherten Werten.
   */
  function openSettingsModal() {
    if (!settingsModal) return;
    console.log("Öffne Einstellungs-Modal...");

    // Dropdown für Standard-Fahrzeug füllen (muss vor dem Setzen des Wertes geschehen)
    populateSettingsCarDropdown();

    // Gespeicherte Einstellungen laden
    const currentSettings = loadSettings();
    console.log("Geladene Einstellungen:", currentSettings);

    // Formularfelder mit geladenen Werten befüllen
    settingDefaultCarSelect.value = currentSettings.defaultCar || "";
    settingDefaultPurposeSelect.value = currentSettings.defaultPurpose || "";

    // Korrekten Radio-Button für CSV-Trennzeichen auswählen
    const delimiterValue = currentSettings.csvDelimiter || ";"; // Fallback auf Semikolon
    try {
      const selectedRadio = document.querySelector(
        `input[name="${csvDelimiterRadioName}"][value="${delimiterValue}"]`
      );
      if (selectedRadio) {
        selectedRadio.checked = true;
      } else {
        // Fallback, falls gespeicherter Wert ungültig ist -> Standard auswählen
        document.querySelector(
          `input[name="${csvDelimiterRadioName}"][value=";"]`
        ).checked = true;
      }
    } catch (e) {
      console.error("Fehler beim Setzen des CSV-Delimiters:", e);
      // Fallback im Fehlerfall
      document.querySelector(
        `input[name="${csvDelimiterRadioName}"][value=";"]`
      ).checked = true;
    }

    settingsModal.classList.add("modal-visible"); // Modal anzeigen
  }

  /**
   * Schließt das Einstellungs-Modal.
   */
  function closeSettingsModal() {
    if (!settingsModal) return;
    settingsModal.classList.remove("modal-visible"); // Modal verstecken
    console.log("Einstellungs-Modal geschlossen.");
  }

  /**
   * Handler für das Speichern der Einstellungen.
   */
  function handleSaveSettings() {
    console.log("Speichere Einstellungen...");

    // Werte aus dem Formular lesen
    const selectedCar = settingDefaultCarSelect.value;
    const selectedPurpose = settingDefaultPurposeSelect.value;
    let selectedDelimiter = ";"; // Default
    try {
      const checkedRadio = document.querySelector(
        `input[name="${csvDelimiterRadioName}"]:checked`
      );
      if (checkedRadio) {
        selectedDelimiter = checkedRadio.value;
      }
    } catch (e) {
      console.error(
        "Fehler beim Lesen des CSV-Delimiters, verwende Standard ';'",
        e
      );
    }

    // Neues Einstellungs-Objekt erstellen
    const newSettings = {
      defaultCar: selectedCar,
      defaultPurpose: selectedPurpose,
      csvDelimiter: selectedDelimiter,
    };

    // Einstellungen speichern
    saveSettings(newSettings);

    // Modal schließen
    closeSettingsModal();

    // Erfolgsmeldung anzeigen
    showNotification("Einstellungen erfolgreich gespeichert.", "success");
  }
  /**
   * NEU: Handler für Klick auf "Alle Daten löschen".
   */
  function handleDeleteAllData() {
    console.log("Button 'Alle Daten löschen' geklickt.");

    const deleteAllAction = () => {
      console.log("Bestätigung erhalten, lösche alle Daten...");
      try {
        // Alle relevanten Daten aus localStorage entfernen
        localStorage.removeItem("fahrtenbuchEintraege");
        localStorage.removeItem("fahrtenbuchCars");
        localStorage.removeItem("fahrtenbuchAppSettings");
        // Ggf. auch Theme und Sidebar-Status zurücksetzen? Optional.
        // localStorage.removeItem('theme');
        // localStorage.removeItem('sidebarCollapsed');

        // Lokale Variablen zurücksetzen
        cars = [];
        editId = null;
        editCarId = null;
        // confirmModalCallback wird in closeConfirmModal zurückgesetzt

        // UI komplett neu initialisieren, um leeren Zustand anzuzeigen
        initialisiereApp(); // Einfachster Weg, alles zurückzusetzen

        // Erfolgsmeldung anzeigen (nachdem Modal geschlossen wurde)
        // Wird jetzt in initialisiereApp indirekt gemacht, aber hier nochmal explizit?
        // Besser nach dem Schließen des Settings-Modals
        // showNotification("Alle Anwendungsdaten wurden gelöscht.", "success", 5000);
      } catch (error) {
        console.error("Fehler beim Löschen aller Daten:", error);
        showNotification("Fehler beim Löschen der Daten!", "error", 5000);
      } finally {
        // Schließe das Einstellungs-Modal, NACHDEM die Aktion ausgeführt wurde
        // (oder bevor initialisiereApp alles neu baut)
        closeSettingsModal();
        // Zeige Meldung erst nach dem Schließen, damit sie sichtbar ist
        setTimeout(
          () =>
            showNotification(
              "Alle Anwendungsdaten wurden gelöscht.",
              "success",
              5000
            ),
          100
        );
      }
    };

    // Bestätigungs-Modal anzeigen
    openConfirmModal(
      "ACHTUNG!\nSollen wirklich ALLE Fahrten, ALLE Fahrzeuge und ALLE Einstellungen unwiderruflich gelöscht werden?",
      deleteAllAction
    );
  }

  // ========================================================================
  // === 7. Kernfunktionen (Fahrten: Speichern, Update, Edit-Modus) ===
  // ========================================================================
  /**
   * Bereitet die Formularfelder für die Eingabe einer neuen Fahrt vor.
   */
  function felderFuerNeueFahrtVorbereiten() {
    if (editId !== null) return;
    console.log("Bereite Felder für neue Fahrt vor...");
    // Gespeicherte Einstellungen laden
    const settings = loadSettings(); // <<< NEU

    try {
      const alleFahrten = ladeFahrtenAusLocalStorage();
      if (alleFahrten.length > 0) {
        const letzteFahrt = alleFahrten[alleFahrten.length - 1];
        if (letzteFahrt) {
          startOrtInput.value = letzteFahrt.zielOrt || "";
          kmStartInput.value = letzteFahrt.kmEnde || "";
        } else {
          startOrtInput.value = "";
          kmStartInput.value = "";
        }
      } else {
        startOrtInput.value = "";
        kmStartInput.value = "";
      }
      datumInput.value = getDatumString();
      zielOrtInput.value = "";
      distanzInput.value = "";
      startTimeInput.value = "";
      endTimeInput.value = "";
      zweckSelect.value = "geschaeftlich";
      carSelect.value = settings.defaultCar || ""; // Leerer String, falls kein Default
      zweckSelect.value = settings.defaultPurpose || "geschaeftlich"; // Fallback auf 'geschaeftlich'
      // Fehler-Div leeren
      if (formErrorDiv) {
        formErrorDiv.innerHTML = "";
        formErrorDiv.style.display = "none";
      }
      berechneUndZeigeDistanz();
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
    if (erfolg && formularDiv) {
      formularDiv.classList.remove("form-visible");
      console.log("Formular nach erfolgreichem Speichern/Update geschlossen.");
    } else {
      console.log(
        "Speichern/Update nicht erfolgreich oder Formular nicht gefunden."
      );
    }
  }

  /**
   * Startet den Bearbeitungsmodus für eine Fahrt.
   */
  function starteEditModus(fahrtId) {
    console.log("Starte Edit-Modus für ID:", fahrtId);
    const fahrten = ladeFahrtenAusLocalStorage();
    const fahrt = fahrten.find((f) => f.id.toString() === fahrtId.toString());

    if (!fahrt) {
      alert("Fehler: Zu bearbeitender Eintrag nicht gefunden!"); // Hier evtl. auch ersetzen?
      return;
    }

    datumInput.value = fahrt.datum || "";
    startTimeInput.value = fahrt.startTime || "";
    endTimeInput.value = fahrt.endTime || "";
    startOrtInput.value = fahrt.startOrt || "";
    zielOrtInput.value = fahrt.zielOrt || "";
    kmStartInput.value = fahrt.kmStart || "";
    kmEndeInput.value = fahrt.kmEnde || "";
    distanzInput.value = fahrt.distanz || "";
    carSelect.value = fahrt.carId || "";
    zweckSelect.value = fahrt.zweck || "geschaeftlich";

    editId = fahrtId;
    speichernButton.textContent = "Änderung speichern";
    cancelEditButton?.style.setProperty("display", "inline-block");

    // Fehler-Div leeren beim Starten des Edits
    if (formErrorDiv) {
      formErrorDiv.innerHTML = "";
      formErrorDiv.style.display = "none";
    }

    if (formularDiv) {
      formularDiv.classList.add("form-visible");
      formularDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    datumInput?.focus();
  }

  /**
   * Bricht den Edit-Modus ab oder setzt das Formular zurück.
   */
  function abbrechenEditModus(doScroll = true) {
    console.log("Breche Edit ab / Setze Formular zurück.");
    editId = null;
    if (tripEntryForm) {
      tripEntryForm.reset();
    } else {
      console.error("tripEntryForm nicht gefunden zum Zurücksetzen!");
    }
    if (formularDiv) {
      formularDiv.classList.remove("form-visible");
    }
    if (speichernButton) speichernButton.textContent = "Fahrt speichern";
    if (cancelEditButton) cancelEditButton.style.display = "none";
    // Fehler-Div leeren
    if (formErrorDiv) {
      formErrorDiv.innerHTML = "";
      formErrorDiv.style.display = "none";
    }
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
      id: id,
      datum: datumInput.value,
      startTime: startTimeInput.value,
      endTime: endTimeInput.value,
      startOrt: startOrtInput.value,
      zielOrt: zielOrtInput.value,
      kmStart: kmStartInput.value,
      kmEnde: kmEndeInput.value,
      distanz: distanzInput.value,
      carId: carSelect.value,
      zweck: zweckSelect.value,
    };

    if (!validateFahrt(fahrtData, false)) {
      return false;
    }

    let fahrten = ladeFahrtenAusLocalStorage();
    const index = fahrten.findIndex((f) => f.id.toString() === id.toString());

    if (index !== -1) {
      fahrten[index] = fahrtData;
      speichereAlleFahrten(fahrten);
      console.log("Fahrt erfolgreich aktualisiert.");
      currentPage = 1;
      // NEU: Erfolgsmeldung anzeigen
      showNotification("Änderungen erfolgreich gespeichert!", "success");

      handleApplyFilter(); // Anzeige aktualisieren
      abbrechenEditModus(false);
      return true;
    } else {
      // alert("Fehler beim Update: Eintrag nicht gefunden."); // Ersetzt durch Notification?
      showNotification("Fehler: Eintrag beim Update nicht gefunden!", "error"); // Optional: Fehlermeldung
      abbrechenEditModus(false);
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
      id: Date.now(),
      datum: datumInput.value,
      startTime: startTimeInput.value,
      endTime: endTimeInput.value,
      startOrt: startOrtInput.value,
      zielOrt: zielOrtInput.value,
      kmStart: kmStartInput.value,
      kmEnde: kmEndeInput.value,
      distanz: distanzInput.value,
      carId: carSelect.value,
      zweck: zweckSelect.value,
    };

    if (!validateFahrt(neueFahrt, true)) {
      return false;
    }

    console.log("Neue Fahrt validiert:", neueFahrt);
    speichereNeueFahrtImLocalStorage(neueFahrt);
    currentPage = 1;
    // NEU: Erfolgsmeldung anzeigen
    showNotification("Fahrt erfolgreich gespeichert!", "success");

    handleApplyFilter(); // Anzeige aktualisieren
    felderFuerNeueFahrtVorbereiten();
    // zielOrtInput?.focus(); // Fokus vielleicht nicht ideal, wenn Meldung erscheint
    return true;
  }

  // ========================================================================
  // === 8. Validierungsfunktion (Fahrten) ===
  // ========================================================================
  /**
   * Prüft ein Fahrt-Objekt auf Gültigkeit und zeigt Fehler gesammelt an.
   * @param {object} fahrt - Das zu prüfende Fahrt-Objekt.
   * @param {boolean} checkKmContinuity - Soll die KM-Kontinuität geprüft werden?
   * @returns {boolean} true, wenn valide, sonst false.
   */
  function validateFahrt(fahrt, checkKmContinuity) {
    console.log(
      "Validiere Fahrt:",
      fahrt,
      "Kontinuität prüfen:",
      checkKmContinuity
    );
    const errorMessages = []; // Array zum Sammeln von Fehlermeldungen
    // const errorDiv = document.getElementById('form-error-message'); // Globale Variable nutzen: formErrorDiv
    if (!formErrorDiv) {
      console.error("Fehler-Div #form-error-message nicht gefunden!");
      alert(
        "Interner Fehler: Fehleranzeige-Element nicht gefunden. Validierung nicht möglich."
      );
      return false;
    }
    formErrorDiv.innerHTML = "";
    formErrorDiv.style.display = "none";

    // --- Pflichtfelder prüfen ---
    if (!fahrt.datum) errorMessages.push("Bitte Datum eingeben.");
    if (!fahrt.startTime) errorMessages.push("Bitte Startzeit eingeben.");
    if (!fahrt.endTime) errorMessages.push("Bitte Endzeit eingeben.");
    if (!fahrt.startOrt) errorMessages.push("Bitte Start-Ort eingeben.");
    if (!fahrt.zielOrt) errorMessages.push("Bitte Ziel-Ort eingeben.");
    if (!fahrt.carId) errorMessages.push("Bitte Fahrzeug auswählen.");
    if (!fahrt.zweck) errorMessages.push("Bitte Zweck auswählen.");

    // --- KM prüfen ---
    const s = parseFloat(fahrt.kmStart);
    const e = parseFloat(fahrt.kmEnde);
    if (fahrt.kmStart === "" || isNaN(s)) {
      errorMessages.push("Bitte gültigen Start-Kilometerstand eingeben.");
    }
    if (fahrt.kmEnde === "" || isNaN(e)) {
      errorMessages.push("Bitte gültigen End-Kilometerstand eingeben.");
    }
    if (!isNaN(s) && !isNaN(e) && e < s) {
      errorMessages.push(
        "End-Kilometerstand muss größer oder gleich dem Start-Kilometerstand sein."
      );
    }

    // --- Zeit prüfen ---
    if (fahrt.startTime && fahrt.endTime && fahrt.endTime < fahrt.startTime) {
      errorMessages.push("Endzeit darf nicht vor der Startzeit liegen.");
    }

    // --- KM Kontinuität prüfen (nur bei NEUER Fahrt und wenn bisher keine Fehler) ---
    if (
      errorMessages.length === 0 &&
      checkKmContinuity &&
      fahrt.carId &&
      !isNaN(s)
    ) {
      const alleFahrten = ladeFahrtenAusLocalStorage();
      let letzteFahrtDesAutos = null;
      for (let i = alleFahrten.length - 1; i >= 0; i--) {
        if (alleFahrten[i].carId === fahrt.carId) {
          letzteFahrtDesAutos = alleFahrten[i];
          break;
        }
      }
      if (letzteFahrtDesAutos) {
        const letzterKM = parseFloat(letzteFahrtDesAutos.kmEnde);
        if (!isNaN(letzterKM) && s < letzterKM) {
          const carName =
            cars.find((c) => c.id.toString() === fahrt.carId.toString())
              ?.name || "Unbekannt";
          errorMessages.push(
            `Kontinuitätsfehler für Fahrzeug "${carName}": Der Start-KM (${s}) ist niedriger als der letzte End-KM (${letzterKM}) dieses Fahrzeugs.`
          );
        }
      }
    } // Ende KM Kontinuitätsprüfung

    // --- Ergebnis der Validierung ---
    if (errorMessages.length > 0) {
      formErrorDiv.innerHTML = errorMessages.join("<br>");
      formErrorDiv.style.display = "block";
      formErrorDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
      console.warn("Validierung fehlgeschlagen:", errorMessages);
      return false;
    }

    console.log("Fahrt-Validierung erfolgreich.");
    return true;
  }

  // ========================================================================
  // === 9. Speicher / Ladefunktionen (localStorage) ===
  // ========================================================================
  /**
   * Speichert das komplette (sortierte!) Fahrten-Array im localStorage.
   */
  function speichereAlleFahrten(fahrtenArray) {
    // Sortieren nach Datum, dann Startzeit, dann KM-Start
    if (!Array.isArray(fahrtenArray)) {
      console.error(
        "speichereAlleFahrten wurde kein Array übergeben!",
        fahrtenArray
      );
      return;
    }
    fahrtenArray.sort((a, b) => {
      const dtA = (a.datum || "") + "T" + (a.startTime || "00:00");
      const dtB = (b.datum || "") + "T" + (b.startTime || "00:00");
      if (dtA < dtB) return -1;
      if (dtA > dtB) return 1;
      return parseFloat(a.kmStart || 0) - parseFloat(b.kmStart || 0);
    });
    try {
      localStorage.setItem(
        "fahrtenbuchEintraege",
        JSON.stringify(fahrtenArray)
      );
      console.log(
        `${fahrtenArray.length} Fahrten im localStorage gespeichert.`
      );
    } catch (e) {
      console.error("Fehler beim Speichern der Fahrten im localStorage:", e);
      alert("Fehler beim Speichern der Fahrten!"); // Hier evtl. auch ersetzen?
    }
  }

  /**
   * Fügt eine neue Fahrt hinzu und speichert das Array.
   */
  function speichereNeueFahrtImLocalStorage(neueFahrt) {
    let fahrten = ladeFahrtenAusLocalStorage();
    if (!fahrten.some((f) => f.id === neueFahrt.id)) {
      fahrten.push(neueFahrt);
      speichereAlleFahrten(fahrten);
    } else {
      console.warn(
        "Versuch, Fahrt mit bereits existierender ID zu speichern:",
        neueFahrt.id
      );
    }
  }

  /**
   * Lädt alle Fahrten aus dem localStorage.
   * Gibt immer ein Array zurück (ggf. leer).
   */
  function ladeFahrtenAusLocalStorage() {
    const rawData = localStorage.getItem("fahrtenbuchEintraege");
    try {
      const parsedData = rawData ? JSON.parse(rawData) : [];
      const result = Array.isArray(parsedData) ? parsedData : [];
      return result;
    } catch (e) {
      console.error("Fehler beim Parsen der Fahrten aus localStorage:", e);
      return [];
    }
  }

  // ========================================================================
  // === 10. Löschfunktion (Fahrten) ===
  // ========================================================================
  /**
   * Löscht eine Fahrt anhand ihrer ID (jetzt mit Bestätigungs-Modal).
   * @param {string|number} fahrtId - Die ID der zu löschenden Fahrt.
   */
  function fahrtLoeschen(fahrtId) {
    console.log("Lösche Fahrt mit ID:", fahrtId);
    const deleteAction = () => {
      console.log("Bestätigung erhalten, lösche Fahrt:", fahrtId);
      let fahrten = ladeFahrtenAusLocalStorage();
      const anzahlVorher = fahrten.length;
      const aktualisierteFahrten = fahrten.filter(
        (f) => f.id.toString() !== fahrtId.toString()
      );

      if (anzahlVorher !== aktualisierteFahrten.length) {
        speichereAlleFahrten(aktualisierteFahrten);
        currentPage = 1;
        handleApplyFilter(); // Anzeige aktualisieren
        console.log(`Fahrt mit ID ${fahrtId} erfolgreich gelöscht.`);
        // NEU: Erfolgsmeldung anzeigen
        showNotification("Fahrt erfolgreich gelöscht.", "success"); // Oder 'info'
        if (editId && editId.toString() === fahrtId.toString()) {
          abbrechenEditModus(false);
        }
      } else {
        console.warn("Zu löschende Fahrt-ID nicht gefunden:", fahrtId);
        showNotification("Fehler: Zu löschende Fahrt nicht gefunden!", "error"); // Optional
      }
    };
    openConfirmModal(
      "Soll dieser Fahrteintrag wirklich gelöscht werden?",
      deleteAction
    );
  }

  // ========================================================================
  // === 11. Anzeige-Funktionen (Fahrtenliste, Zusammenfassung, Distanz) ===
  // ========================================================================
  /**
   * Zeigt eine übergebene Liste von Fahrten im HTML an,
   * berücksichtigt dabei die Paginierung und sortiert korrekt (Neueste zuerst).
   * @param {Array} tripsToDisplay - Das Array ALLER Fahrten, die potenziell angezeigt werden sollen (gefiltert oder alle).
   */
  function displayTrips(tripsToDisplay) {
    if (!fahrtenListeDiv) {
      console.error(
        "FEHLER: Div für Fahrtenliste ('fahrten-liste') nicht gefunden!"
      );
      return;
    }

    // 1. Komplette Liste zuerst sortieren (Neueste zuerst)
    tripsToDisplay.sort((a, b) => {
      const dtA = (a.datum || "") + "T" + (a.startTime || "00:00");
      const dtB = (b.datum || "") + "T" + (b.startTime || "00:00");
      // Vergleiche B mit A für absteigende Reihenfolge (neueste zuerst)
      if (dtB < dtA) return -1;
      if (dtB > dtA) return 1;
      // Sekundäre Sortierung bei gleicher Startzeit (bleibt aufsteigend nach KM)
      return parseFloat(a.kmStart || 0) - parseFloat(b.kmStart || 0);
    });

    // 2. Sortierte komplette Liste speichern (für Paginierungs-Buttons)
    fullTripListForPagination = tripsToDisplay;

    // 3. Berechnungen für Paginierung (basierend auf der sortierten Liste)
    const totalItems = fullTripListForPagination.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    currentPage = Math.max(
      1,
      Math.min(currentPage, totalPages === 0 ? 1 : totalPages)
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // 4. Slice aus der SORTIERTEN Liste erstellen
    const pageTrips = fullTripListForPagination.slice(startIndex, endIndex);

    console.log(
      `Zeige Seite ${currentPage}/${totalPages} an (${pageTrips.length} von ${totalItems} Fahrten)`
    );

    // 5. Liste leeren und Fahrten der aktuellen Seite anzeigen (ohne erneutes Sortieren!)
    fahrtenListeDiv.innerHTML = "";
    if (pageTrips.length === 0 && totalItems === 0) {
      fahrtenListeDiv.innerHTML = "<p>Noch keine Fahrten gespeichert.</p>";
    } else if (pageTrips.length === 0 && totalItems > 0) {
      // Dieser Fall sollte seltener auftreten, da wir currentPage anpassen
      fahrtenListeDiv.innerHTML = "<p>Keine Fahrten auf dieser Seite.</p>";
    } else {
      // Die pageTrips sind bereits korrekt sortiert (als Teil der großen Liste)
      pageTrips.forEach((fahrt) => {
        fahrtZurListeHinzufuegen(fahrt, true); // An Liste anhängen
      });
    }

    // 6. Paginierungs-Steuerung aktualisieren
    updatePaginationControls(currentPage, totalPages);
  }

  /**
   * Lädt alle gespeicherten Fahrten aus dem localStorage und zeigt sie an.
   * Wird hauptsächlich für Initialisierung und Reset benötigt.
   */
  function ladeGespeicherteFahrten() {
    // Diese Funktion wird jetzt weniger direkt genutzt
    const alleFahrten = ladeFahrtenAusLocalStorage();
    if (!Array.isArray(alleFahrten)) {
      console.error(
        "FEHLER: ladeFahrtenAusLocalStorage hat kein Array zurückgegeben!",
        alleFahrten
      );
      return;
    }
    displayTrips(alleFahrten);
  }

  /**
   * Erzeugt das HTML für einen einzelnen Listeneintrag und fügt ihn hinzu.
   * @param {object} fahrt - Das Fahrt-Objekt.
   * @param {boolean} [append=true] - true: unten anhängen.
   */
  /**
   * Erzeugt das HTML für einen einzelnen Listeneintrag (Fahrt) und fügt ihn hinzu.
   * (Angepasst: Nutzt CSS Klassen statt Inline-Styles)
   * @param {object} fahrt - Das Fahrt-Objekt.
   * @param {boolean} [append=true] - true: unten anhängen.
   */
  function fahrtZurListeHinzufuegen(fahrt, append = true) {
    if (!fahrtenListeDiv) return;
    const placeholder = fahrtenListeDiv.querySelector("p");
    if (placeholder) placeholder.remove();

    const listItem = document.createElement("div");
    listItem.classList.add("fahrt-item");
    listItem.setAttribute("data-fahrt-id", fahrt.id);

    // Daten vorbereiten
    const kmStart = fahrt.kmStart || "0";
    const kmEnde = fahrt.kmEnde || "0";
    const distanz = parseFloat(fahrt.distanz || "0").toFixed(1);
    const datumFormatiert = formatDateDE(fahrt.datum);
    const startTime = fahrt.startTime || "--:--";
    const endTime = fahrt.endTime || "--:--";
    const startOrt = fahrt.startOrt || "-";
    const zielOrt = fahrt.zielOrt || "-";
    const zweck = fahrt.zweck || "-";
    const car = cars.find(
      (c) => c.id.toString() === (fahrt.carId || "").toString()
    );
    const carDisplay = car ? car.name || "Unbenannt" : "Unbekannt";
    const carTitle = car
      ? `${car.name || "Unbenannt"}${car.plate ? ` (${car.plate})` : ""}`
      : "Unbekanntes Fahrzeug";

    // HTML-Struktur mit Klassen erstellen, statt innerHTML mit viel Markup
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("list-item-header");

    const dateTimeDiv = document.createElement("div");
    dateTimeDiv.classList.add("list-item-date-time");
    // Erstelle die Info-Spans einzeln, um Klassen besser zu setzen
    const dateSpan = document.createElement("span");
    dateSpan.classList.add("list-item-info", "date-info");
    dateSpan.innerHTML = `<i class="fa-solid fa-calendar-days fa-fw list-icon"></i> ${datumFormatiert}`;
    const timeSpan = document.createElement("span");
    timeSpan.classList.add("list-item-info", "time-info");
    timeSpan.innerHTML = `<i class="fa-solid fa-clock fa-fw list-icon"></i> (${startTime} - ${endTime} Uhr)`;
    const carSpan = document.createElement("span");
    carSpan.classList.add("list-item-info", "car-info");
    carSpan.title = carTitle;
    carSpan.innerHTML = `<i class="fa-solid fa-car fa-fw list-icon"></i> <span>${carDisplay}</span>`;

    dateTimeDiv.appendChild(dateSpan);
    dateTimeDiv.appendChild(timeSpan);
    dateTimeDiv.appendChild(carSpan);

    // Container und Buttons für Aktionen
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons-container");

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.title = "Bearbeiten";
    editBtn.classList.add("list-action-button", "edit-btn"); // Basis-Klasse + spezifische Klasse
    editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.title = "Löschen";
    deleteBtn.classList.add("list-action-button", "delete-btn"); // Basis-Klasse + spezifische Klasse
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    buttonsContainer.appendChild(editBtn);
    buttonsContainer.appendChild(deleteBtn);

    headerDiv.appendChild(dateTimeDiv);
    headerDiv.appendChild(buttonsContainer);

    // Details-Bereich
    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("list-item-details");
    detailsDiv.innerHTML = `
        <div><span class="list-label">Von:</span>${startOrt}</div>
        <div><span class="list-label">Nach:</span>${zielOrt}</div>
        <div><span class="list-label">KM-Start:</span>${kmStart}</div>
        <div><span class="list-label">KM-Ende:</span>${kmEnde}</div>
        <div><span class="list-label">Distanz:</span>${distanz} km</div>
        <div><span class="list-label">Zweck:</span>${zweck}</div>`;

    // Toggle-Button für Details
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.classList.add("toggle-details-btn");
    toggleBtn.title = "Details ausblenden";
    toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';

    // Alles zum Listenelement hinzufügen
    listItem.appendChild(headerDiv);
    listItem.appendChild(detailsDiv);
    listItem.appendChild(toggleBtn);

    // Listenelement zur Liste hinzufügen
    if (append) {
      fahrtenListeDiv.appendChild(listItem);
    } else {
      fahrtenListeDiv.insertBefore(listItem, fahrtenListeDiv.firstChild);
    }
  }

  /**
   * Aktualisiert die Kilometer-Zusammenfassung für die übergebene Liste von Fahrten.
   * @param {Array} fahrten - Das Array der Fahrten, die berücksichtigt werden sollen.
   */
  function updateZusammenfassung(fahrten) {
    if (!zusammenfassungDiv) {
      console.error("Zusammenfassungs-Div nicht gefunden!");
      return;
    }
    if (!Array.isArray(fahrten)) {
      console.error(
        "Fehler: updateZusammenfassung wurde ohne gültiges Array aufgerufen.",
        fahrten
      );
      zusammenfassungDiv.innerHTML = `
                <h2>Zusammenfassung</h2>
                <p>Fehler bei der Berechnung.</p>
                <ul><li>-</li><li>-</li><li>-</li></ul>`;
      return;
    }

    let totalKm = 0,
      geschaeftlichKm = 0,
      privatKm = 0,
      arbeitswegKm = 0;
    fahrten.forEach((fahrt) => {
      const dist = parseFloat(fahrt.distanz);
      if (!isNaN(dist)) {
        totalKm += dist;
        switch (fahrt.zweck) {
          case "geschaeftlich":
            geschaeftlichKm += dist;
            break;
          case "privat":
            privatKm += dist;
            break;
          case "arbeitsweg":
            arbeitswegKm += dist;
            break;
        }
      }
    });
    zusammenfassungDiv.innerHTML = `
            <h2>Zusammenfassung</h2>
            <p><strong>Angezeigt:</strong> ${totalKm.toFixed(1)} km</p>
            <ul>
                <li>Geschäftlich: ${geschaeftlichKm.toFixed(1)} km</li>
                <li>Privat: ${privatKm.toFixed(1)} km</li>
                <li>Arbeitsweg: ${arbeitswegKm.toFixed(1)} km</li>
            </ul>`;
    console.log("Zusammenfassung aktualisiert für angezeigte Fahrten.");
  }

  /**
   * Funktion zur Live-Berechnung der Distanz im Formular.
   */
  function berechneUndZeigeDistanz() {
    const startVal = kmStartInput?.value || "";
    const endVal = kmEndeInput?.value || "";
    const startKm = parseFloat(startVal);
    const endKm = parseFloat(endVal);

    if (!isNaN(startKm) && !isNaN(endKm) && endKm >= startKm) {
      const dist = (endKm - startKm).toFixed(1);
      if (distanzInput) distanzInput.value = dist;
    } else {
      if (distanzInput) distanzInput.value = "";
    }
  }

  // ========================================================================
  // === 12. Export/Import Funktionen ===
  // ========================================================================
  /**
   * Exportiert die Daten als CSV-Datei.
   */
  function exportiereAlsCsv() {
    console.log("CSV Export wird gestartet...");
    // WICHTIG: Immer ALLE Fahrten exportieren, nicht nur die gefilterten!
    const fahrten = ladeFahrtenAusLocalStorage();
    if (fahrten.length === 0) {
      alert("Keine Fahrten zum Exportieren vorhanden."); // Hier evtl. auch ersetzen?
      return;
    }
    // Einstellung für Trennzeichen laden <<< NEU
    const settings = loadSettings();
    const delimiter = settings.csvDelimiter || ";"; // Fallback auf Semikolon
    console.log(`CSV Export mit Trennzeichen: "${delimiter}"`);

    const header = [
      "Datum",
      "Startzeit",
      "Endzeit",
      "Start-Ort",
      "Ziel-Ort",
      "KM-Start",
      "KM-Ende",
      "Distanz (km)",
      "Zweck",
      "Fahrzeug ID",
      "Fahrzeug Name",
      "Fahrzeug Kennzeichen",
    ];
    const escapeCsvField = (field) => {
      const stringField = String(field == null ? "" : field);
      if (
        stringField.includes(";") ||
        stringField.includes('"') ||
        stringField.includes("\n")
      ) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    // Verwende das geladene Trennzeichen <<< NEU
    let csvContent = header.join(delimiter) + "\n";
    fahrten.forEach((fahrt) => {
      const car = cars.find(
        (c) => c.id.toString() === (fahrt.carId || "").toString()
      );
      const carName = car ? car.name : "";
      const carPlate = car ? car.plate : "";
      const row = [
        fahrt.datum,
        fahrt.startTime || "",
        fahrt.endTime || "",
        fahrt.startOrt,
        fahrt.zielOrt,
        fahrt.kmStart,
        fahrt.kmEnde,
        fahrt.distanz,
        fahrt.zweck,
        fahrt.carId || "",
        carName,
        carPlate,
      ];
      // Verwende das geladene Trennzeichen <<< NEU
      csvContent += row.map(escapeCsvField).join(delimiter) + "\n";
    });

    triggerDownload(
      csvContent,
      "text/csv;charset=utf-8;",
      `fahrtenbuch_${getDatumString()}.csv`
    );
  }

  /**
   * Exportiert alle Daten (Fahrten & Fahrzeuge) als JSON-Datei (Backup).
   */
  function exportiereAlsJson() {
    console.log("JSON Backup wird gestartet...");
    try {
      const fahrten = ladeFahrtenAusLocalStorage(); // Immer alle exportieren
      const backupData = {
        fahrten: fahrten,
        autos: cars,
      };
      const jsonString = JSON.stringify(backupData, null, 2);
      triggerDownload(
        jsonString,
        "application/json;charset=utf-8;",
        `fahrtenbuch_backup_${getDatumString()}.json`
      );
    } catch (e) {
      console.error("Fehler beim Erstellen des JSON Backups:", e);
      alert("Fehler beim Erstellen des Backups."); // Hier evtl. auch ersetzen?
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
    const fileInput = event.target; // Referenz auf das Input-Element speichern

    // Definiere die Aktion, die bei Bestätigung ausgeführt werden soll
    const performImport = () => {
      console.log("Bestätigung für Import erhalten.");
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const jsonContent = e.target.result;
          const importData = JSON.parse(jsonContent);

          if (!importData || typeof importData !== "object") {
            throw new Error(
              "Ungültiges Format: Importierte Daten sind kein Objekt."
            );
          }
          const hasFahrten = Array.isArray(importData.fahrten);
          const hasAutos = Array.isArray(importData.autos);

          if (!hasFahrten && !hasAutos) {
            throw new Error(
              "Ungültiges Backup-Format: Weder 'fahrten' noch 'autos' Array gefunden."
            );
          }

          if (hasAutos) {
            cars = importData.autos;
            saveCars(); // Speichert neue Fahrzeuge (ggf. mit Fehler-Notification)
            console.log(`Import: ${cars.length} Fahrzeuge geladen.`);
          } else {
            console.log(
              "Import: Kein 'autos'-Array in der Datei gefunden, Fahrzeuge nicht überschrieben."
            );
          }

          if (hasFahrten) {
            speichereAlleFahrten(importData.fahrten); // Speichert neue Fahrten (ggf. mit Fehler-Notification)
            console.log(
              `Import: ${importData.fahrten.length} Fahrten geladen.`
            );
          } else {
            console.log(
              "Import: Kein 'fahrten'-Array in der Datei gefunden, Fahrten nicht überschrieben."
            );
          }

          // UI komplett neu initialisieren
          initialisiereApp(); // Lädt alles neu

          showNotification("Import erfolgreich abgeschlossen!", "success"); // Erfolgsmeldung
        } catch (err) {
          console.error("Fehler beim JSON Import:", err);
          // Zeige Fehler als Notification statt alert
          showNotification(
            `Import fehlgeschlagen: ${err.message}`,
            "error",
            5000
          ); // Längere Anzeige für Fehler
        } finally {
          // File Input immer zurücksetzen (jetzt über gespeicherte Referenz)
          if (fileInput) {
            fileInput.value = null;
          }
        }
      };
      reader.onerror = function () {
        console.error("Fehler beim Lesen der Datei:", reader.error);
        // Zeige Fehler als Notification statt alert
        showNotification(
          "Fehler beim Lesen der ausgewählten Datei.",
          "error",
          5000
        );
        if (fileInput) {
          fileInput.value = null; // File Input zurücksetzen
        }
      };
      reader.readAsText(file);
    };

    // Öffne das Bestätigungs-Modal statt confirm()
    openConfirmModal(
      `ACHTUNG:\nAlle aktuell gespeicherten Fahrten UND Fahrzeuge werden durch den Inhalt der Datei "${file.name}" ersetzt.\n\nFortfahren?`,
      performImport
    );

    // Wichtig: File Input sofort zurücksetzen, falls Nutzer im Modal abbricht
    if (fileInput) {
      fileInput.value = null;
    }
  }

  /**
   * Hilfsfunktion, um den Download einer Datei im Browser anzustoßen.
   */
  function triggerDownload(content, mimeType, filename) {
    const BOM = mimeType.includes("csv") ? "\uFEFF" : "";
    const blob = new Blob([BOM + content], { type: mimeType });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log(`Download für ${filename} angeboten.`);
    } else {
      alert("Automatischer Download wird von Ihrem Browser nicht unterstützt."); // Hier evtl. auch ersetzen?
    }
  }

  // ========================================================================
  // === 13. Event Listener Setup ===
  // ========================================================================
  /**
   * Hängt alle notwendigen Event Listener an die HTML-Elemente.
   */
  function setupEventListeners() {
    console.log("Initialisiere Event Listeners...");

    // Fahrten-Formular Listener
    addNewButton?.addEventListener("click", handleAddNewClick);
    speichernButton?.addEventListener("click", handleFormularSpeichern);
    cancelEditButton?.addEventListener("click", () => abbrechenEditModus(true));

    // Fahrten-Liste Listener (für Edit/Delete/Toggle)
    fahrtenListeDiv?.addEventListener("click", handleListClick);

    // Listener für Fahrzeugliste (Edit/Delete)
    carListUl?.addEventListener("click", handleCarListClick);

    // Listener für Filter-Buttons
    applyFilterButton?.addEventListener("click", handleApplyFilter);
    resetFilterButton?.addEventListener("click", handleResetFilter);

    // Export/Import Listener
    exportButton?.addEventListener("click", exportiereAlsCsv);
    exportJsonButton?.addEventListener("click", exportiereAlsJson);
    importJsonButton?.addEventListener("click", () =>
      importJsonFileInput?.click()
    );
    importJsonFileInput?.addEventListener("change", importiereAusJson);

    // Theme & Sidebar Listener
    themeToggleButton?.addEventListener("click", handleThemeToggle);
    sidebarToggleButton?.addEventListener("click", handleSidebarToggle);

    // Live Distanz Listener
    kmStartInput?.addEventListener("input", berechneUndZeigeDistanz);
    kmEndeInput?.addEventListener("input", berechneUndZeigeDistanz);

    // Listener für das Fahrzeug-Modal
    addCarMenuButton?.addEventListener("click", openAddCarModal);
    modalCloseButton?.addEventListener("click", closeAddCarModal);
    modalCancelButton?.addEventListener("click", closeAddCarModal);
    modalSaveButton?.addEventListener("click", handleModalSaveCar);
    addCarModal?.addEventListener("click", (event) => {
      if (event.target === addCarModal) {
        closeAddCarModal();
      }
    });

    // Listener für das Bestätigungs-Modal
    confirmModalConfirmBtn?.addEventListener("click", () => {
      console.log("Listener: Confirm Button geklickt."); // DEBUG Log
      if (typeof confirmModalCallback === "function") {
        confirmModalCallback();
      }
      closeConfirmModal(); // Ruft closeConfirmModal auf
    });
    confirmModalCancelBtn?.addEventListener("click", () => {
      console.log("Listener: Cancel Button geklickt."); // DEBUG Log
      closeConfirmModal(); // Ruft closeConfirmModal auf
    });
    confirmModalCloseBtn?.addEventListener("click", () => {
      console.log("Listener: Close (X) Button geklickt."); // DEBUG Log
      closeConfirmModal(); // Ruft closeConfirmModal auf
    });
    confirmModal?.addEventListener("click", (event) => {
      if (event.target === confirmModal) {
        console.log("Listener: Overlay geklickt."); // DEBUG Log
        closeConfirmModal(); // Ruft closeConfirmModal auf
      }
    });
    // Listener für Einstellungen-Modal öffnen/schließen
    settingsMenuButton?.addEventListener("click", openSettingsModal);
    settingsModalCloseBtn?.addEventListener("click", closeSettingsModal);
    settingsModalCancelBtn?.addEventListener("click", closeSettingsModal);
    settingsModal?.addEventListener("click", (event) => {
      if (event.target === settingsModal) {
        closeSettingsModal();
      }
    });

    // NEU: Listener für Speichern-Button im Einstellungs-Modal
    settingsModalSaveBtn?.addEventListener("click", handleSaveSettings);

    // Listener für "Alle löschen" kommt später hinzu
    settingDeleteAllBtn?.addEventListener("click", handleDeleteAllData);
    toggleFilterButton?.addEventListener("click", handleToggleFilterBox);
    // NEU: Listener für Paginierungs-Buttons
    prevPageBtn?.addEventListener("click", handlePrevPage);
    nextPageBtn?.addEventListener("click", handleNextPage);

    console.log("Event Listeners initialisiert.");
  }

  // ========================================================================
  // === 14. Handlers für UI-Aktionen ===
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
    if (formularDiv.classList.contains("form-visible") && editId === null) {
      formularDiv.classList.remove("form-visible");
      console.log("Fahrten-Formular geschlossen.");
    } else {
      abbrechenEditModus(false);
      formularDiv.classList.add("form-visible");
      console.log("Fahrten-Formular für neue Fahrt geöffnet.");
      datumInput?.focus();
      formularDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /**
   * Handler für Klicks innerhalb der Fahrtenliste (delegiert an Buttons).
   * @param {Event} event - Das Klick-Event.
   */
  function handleListClick(event) {
    const fahrtElement = event.target.closest("[data-fahrt-id]");
    if (!fahrtElement) return;
    const fahrtId = fahrtElement.getAttribute("data-fahrt-id");

    if (event.target.closest(".edit-btn")) {
      starteEditModus(fahrtId);
      return;
    }
    if (event.target.closest(".delete-btn")) {
      fahrtLoeschen(fahrtId); // Ruft jetzt Funktion auf, die Modal öffnet
      return;
    }
    const toggleButton = event.target.closest(".toggle-details-btn");
    if (toggleButton) {
      fahrtElement.classList.toggle("details-collapsed");
      const icon = toggleButton.querySelector("i.fa-solid");
      if (icon) {
        if (fahrtElement.classList.contains("details-collapsed")) {
          icon.classList.replace("fa-chevron-up", "fa-chevron-down");
          toggleButton.setAttribute("title", "Details anzeigen");
        } else {
          icon.classList.replace("fa-chevron-down", "fa-chevron-up");
          toggleButton.setAttribute("title", "Details ausblenden");
        }
      }
      return;
    }
  }

  /**
   * Handler für Klicks innerhalb der Fahrzeugliste (delegiert an Buttons).
   * @param {Event} event - Das Klick-Event.
   */
  function handleCarListClick(event) {
    const deleteButton = event.target.closest(".delete-car-btn");
    if (deleteButton) {
      const carIdToDelete = deleteButton.dataset.carId;
      console.log("Versuche Fahrzeug zu löschen, ID:", carIdToDelete);
      const deleteCarAction = () => {
        console.log("Bestätigung erhalten, lösche Fahrzeug:", carIdToDelete);
        const index = cars.findIndex(
          (car) => car.id.toString() === carIdToDelete.toString()
        );
        if (index !== -1) {
          if (editCarId && editCarId.toString() === carIdToDelete.toString()) {
            editCarId = null;
            closeAddCarModal();
          }
          cars.splice(index, 1);
          saveCars();
          displayCarList();
          populateCarDropdown();
          populateFilterCarDropdown();
          console.log("Fahrzeug erfolgreich gelöscht und UI aktualisiert.");
          // >>> HIER kommt die Erfolgsmeldung hin <<<
          showNotification("Fahrzeug erfolgreich gelöscht.", "success");
        } else {
          console.warn(
            "Zu löschendes Fahrzeug nicht im Array gefunden, ID:",
            carIdToDelete
          );
          // >>> HIER kann optional die Fehlermeldung hin <<<
          showNotification(
            "Fehler: Zu löschendes Fahrzeug nicht gefunden!",
            "error"
          );
          // alert("Fehler: Zu löschendes Fahrzeug nicht gefunden."); // Ersetzt durch Modal
        }
      };
      // Prüfen, ob Fahrten dieses Auto noch nutzen (Datenintegrität - Basic Check)
      const fahrten = ladeFahrtenAusLocalStorage();
      const isCarUsed = fahrten.some((fahrt) => fahrt.carId === carIdToDelete);
      let message = "Soll dieses Fahrzeug wirklich endgültig gelöscht werden?";
      if (isCarUsed) {
        message +=
          "\n\nAchtung: Es gibt noch Fahrten, die diesem Fahrzeug zugeordnet sind!";
        // Hier könnte man später komplexere Logik einbauen (Fahrten neu zuordnen etc.)
      }
      openConfirmModal(message, deleteCarAction);
      return;
    }

    const editButton = event.target.closest(".edit-car-btn");
    if (editButton) {
      const carIdToEdit = editButton.dataset.carId;
      console.log("Edit-Button für Fahrzeug geklickt, ID:", carIdToEdit);
      openEditCarModal(carIdToEdit);
      return;
    }
  }

  /**
   * Handler für Klick auf "Filter anwenden".
   */
  function handleApplyFilter() {
    console.log("Button 'Filter anwenden' geklickt.");
    const selectedCarId = filterCarSelect.value;
    const selectedPurpose = filterPurposeSelect.value;
    const startDate = filterDateStartInput.value;
    const endDate = filterDateEndInput.value;
    console.log("Filter Kriterien:", {
      selectedCarId,
      selectedPurpose,
      startDate,
      endDate,
    });

    const alleFahrten = ladeFahrtenAusLocalStorage();
    let gefilterteFahrten = alleFahrten;
    currentPage = 1;
    displayTrips(gefilterteFahrten);
    updateZusammenfassung(gefilterteFahrten);

    if (selectedCarId) {
      gefilterteFahrten = gefilterteFahrten.filter(
        (fahrt) => fahrt.carId === selectedCarId
      );
    }
    if (selectedPurpose) {
      gefilterteFahrten = gefilterteFahrten.filter(
        (fahrt) => fahrt.zweck === selectedPurpose
      );
    }
    if (startDate) {
      gefilterteFahrten = gefilterteFahrten.filter(
        (fahrt) => fahrt.datum >= startDate
      );
    }
    if (endDate) {
      gefilterteFahrten = gefilterteFahrten.filter(
        (fahrt) => fahrt.datum <= endDate
      );
    }

    displayTrips(gefilterteFahrten);
    updateZusammenfassung(gefilterteFahrten);
  }

  /**
   * Handler für Klick auf "Filter zurücksetzen".
   */
  function handleResetFilter() {
    console.log("Button 'Filter zurücksetzen' geklickt.");
    filterCarSelect.value = "";
    filterPurposeSelect.value = "";
    filterDateStartInput.value = "";
    filterDateEndInput.value = "";
    console.log("Filterfelder zurückgesetzt.");

    currentPage = 1;
    const alleFahrten = ladeFahrtenAusLocalStorage();
    displayTrips(alleFahrten);
    updateZusammenfassung(alleFahrten);
  }
  /**
   * Handler für Klick auf "Zurück"-Button der Paginierung.
   */
  function handlePrevPage() {
    if (currentPage > 1) {
      currentPage--;
      displayTrips(fullTripListForPagination); // Zeige vorherige Seite der zuletzt angezeigten Liste
    }
  }

  /**
   * Handler für Klick auf "Weiter"-Button der Paginierung.
   */
  function handleNextPage() {
    const totalPages = Math.ceil(
      fullTripListForPagination.length / itemsPerPage
    );
    if (currentPage < totalPages) {
      currentPage++;
      displayTrips(fullTripListForPagination); // Zeige nächste Seite der zuletzt angezeigten Liste
    }
  }
  /**
   * Handler für Klick auf den Filter-Toggle-Button.
   * Klappt die Filter-Box ein oder aus.
   */
  function handleToggleFilterBox() {
    if (!filterControlsDiv) return;

    const isVisible = filterControlsDiv.classList.toggle("filter-visible");
    const icon = toggleFilterButton?.querySelector("i.fa-solid");

    if (isVisible) {
      console.log("Filter-Box wird angezeigt.");
      toggleFilterButton?.setAttribute("title", "Filter ausblenden");
      // Optional: Icon ändern, z.B. auf Chevron Up oder Filter mit X
      if (icon) icon.classList.replace("fa-filter", "fa-filter-circle-xmark"); // Beispiel
    } else {
      console.log("Filter-Box wird versteckt.");
      toggleFilterButton?.setAttribute("title", "Filter einblenden");
      // Optional: Icon zurück ändern
      if (icon) icon.classList.replace("fa-filter-circle-xmark", "fa-filter"); // Beispiel
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
    const requiredElementIds = [
      "fahrt-formular",
      "trip-entry-form",
      "speichern-btn",
      "cancel-edit-btn",
      "fahrten-liste",
      "datum",
      "start-zeit",
      "end-zeit",
      "start-ort",
      "ziel-ort",
      "km-start",
      "km-ende",
      "distanz",
      "car-select",
      "zweck",
      "export-csv-btn",
      "zusammenfassung",
      "export-json-btn",
      "import-json-btn",
      "import-json-file",
      "add-new-btn",
      "theme-toggle-btn",
      "sidebar-toggle-internal",
      "car-list",
      "add-car-btn-menu",
      "add-car-modal",
      "modal-close-btn",
      "modal-cancel-car-btn",
      "modal-save-car-btn",
      "modal-car-form",
      "modal-car-name",
      "modal-car-plate",
      "modal-car-error",
      "filter-controls",
      "filter-car",
      "filter-purpose",
      "filter-date-start",
      "filter-date-end",
      "apply-filter-btn",
      "reset-filter-btn",
      "confirm-delete-modal",
      "modal-confirm-message",
      "modal-confirm-confirm-btn",
      "modal-confirm-cancel-btn",
      "modal-confirm-close-btn",
      "form-error-message",
      "notification-container",
      "settings-menu-btn",
      "settings-modal",
      "settings-modal-close-btn",
      "settings-modal-cancel-btn",
      "settings-modal-save-btn",
      "settings-form",
      "setting-default-car",
      "setting-default-purpose",
      "setting-delete-all-btn",
    ];
    let missingElements = [];
    requiredElementIds.forEach((id) => {
      if (!document.getElementById(id)) {
        missingElements.push(id);
      }
    });

    if (missingElements.length > 0) {
      console.error(
        "FEHLER: Init - Folgende HTML-Elemente fehlen oder haben falsche IDs:",
        missingElements
      );
      alert(
        `Initialisierungsfehler! ${missingElements.length} wichtige Elemente fehlen. Details in der Konsole (F12).`
      );
      return;
    }
    console.log("Alle benötigten HTML-Elemente gefunden.");

    try {
      datumInput.value = getDatumString();
    } catch (e) {
      console.error("Fehler beim Setzen des Datums:", e);
    }
    loadCars();

    const alleFahrten = ladeFahrtenAusLocalStorage();
    if (!Array.isArray(alleFahrten)) {
      console.error(
        "FEHLER: ladeFahrtenAusLocalStorage hat beim Initialisieren kein Array zurückgegeben!",
        alleFahrten
      );
      displayTrips([]);
      updateZusammenfassung([]);
    } else {
      displayTrips(alleFahrten);
      updateZusammenfassung(alleFahrten);
    }

    displayCarList();
    populateCarDropdown();
    populateFilterCarDropdown();
    loadAndSetInitialTheme();
    loadAndSetInitialSidebarState();
    felderFuerNeueFahrtVorbereiten();
    setupEventListeners();

    console.log("App initialisiert und bereit.");
  }

  // ========================================================================
  // === 16. App starten ===
  // ========================================================================
  initialisiereApp();
}); // Ende DOMContentLoaded Listener
