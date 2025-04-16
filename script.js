// === script.js ===
// Stand: 2025-04-14, Mit Ausgaben-Erfassung, -Anzeige, -Edit, -Delete

document.addEventListener("DOMContentLoaded", function () {
  console.log("Fahrtenbuch App: DOM geladen.");

  // ========================================================================
  // === 1. Konstanten & Referenzen auf HTML-Elemente ===
  // ========================================================================

  // --- Haupt-Container in der mittleren Spalte ---
  const formularDiv = document.getElementById("fahrt-formular");
  const fahrtenListeContainer = document.getElementById(
    "fahrten-liste-container"
  );
  const ausgabenListeContainer = document.getElementById(
    "ausgaben-liste-container"
  );
  const berichteContainer = document.getElementById("berichte-container"); // NEU

  // --- Inhaltsbereiche der Listen ---
  const fahrtenListeDiv = document.getElementById("fahrten-liste");
  const ausgabenListeDiv = document.getElementById("ausgaben-liste"); // Div für Ausgaben-Items
  const berichteInhaltDiv = document.getElementById("berichte-inhalt"); // NEU
  console.log("Prüfe Container:", {
    ausgabenListeContainer,
    berichteContainer,
  });

  // --- Formular (Fahrten) ---
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
  const carSelect = document.getElementById("car-select");
  const zweckSelect = document.getElementById("zweck");
  const formErrorDiv = document.getElementById("form-error-message");

  // --- Sidebar & Header Buttons ---
  const addNewButton = document.getElementById("add-new-btn");
  const addCarMenuButton = document.getElementById("add-car-btn-menu");
  const addExpenseMenuButton = document.getElementById("add-expense-btn-menu");
  const showExpensesButton = document.getElementById("show-expenses-btn-menu");
  const showReportsButton = document.getElementById("show-reports-btn-menu"); // NEU
  const settingsMenuButton = document.getElementById("settings-menu-btn");
  const exportButton = document.getElementById("export-csv-btn");
  const exportJsonButton = document.getElementById("export-json-btn");
  const importJsonButton = document.getElementById("import-json-btn");
  const importJsonFileInput = document.getElementById("import-json-file");
  const themeToggleButton = document.getElementById("theme-toggle-btn");
  const sidebarToggleButton = document.getElementById(
    "sidebar-toggle-internal"
  );

  // --- Fahrzeug Modal Elemente ---
  const addCarModal = document.getElementById("add-car-modal");
  // Verwende eindeutige IDs für Schließen-Buttons, falls möglich, um Verwechslungen zu vermeiden
  const modalCarCloseButton = document.getElementById("modal-close-btn"); // Geteilt? Prüfen!
  const modalCancelCarButton = document.getElementById("modal-cancel-car-btn");
  const modalSaveCarButton = document.getElementById("modal-save-car-btn");
  const modalCarForm = document.getElementById("modal-car-form");
  const modalCarNameInput = document.getElementById("modal-car-name");
  const modalCarPlateInput = document.getElementById("modal-car-plate");
  const modalCarError = document.getElementById("modal-car-error");

  // --- Ausgaben Modal Elemente ---
  const addExpenseModal = document.getElementById("add-expense-modal");
  const modalExpenseCloseButton = document.getElementById(
    "modal-expense-close-btn"
  );
  const modalCancelExpenseButton = document.getElementById(
    "modal-cancel-expense-btn"
  );
  const modalSaveExpenseButton = document.getElementById(
    "modal-save-expense-btn"
  );
  const modalExpenseForm = document.getElementById("modal-expense-form");
  const modalExpenseDateInput = document.getElementById("modal-expense-date");
  const modalExpenseVehicleSelect = document.getElementById(
    "modal-expense-vehicle"
  );
  const modalExpenseTypeSelect = document.getElementById("modal-expense-type");
  const modalExpenseDescriptionInput = document.getElementById(
    "modal-expense-description"
  );
  const modalExpenseAmountInput = document.getElementById(
    "modal-expense-amount"
  );
  const modalExpenseOdometerInput = document.getElementById(
    "modal-expense-odometer"
  );
  const modalExpenseError = document.getElementById("modal-expense-error");

  // --- Filter Elemente ---
  const filterControlsDiv = document.getElementById("filter-controls");
  const filterCarSelect = document.getElementById("filter-car");
  const filterPurposeSelect = document.getElementById("filter-purpose");
  const filterDateStartInput = document.getElementById("filter-date-start");
  const filterDateEndInput = document.getElementById("filter-date-end");
  const applyFilterButton = document.getElementById("apply-filter-btn");
  const resetFilterButton = document.getElementById("reset-filter-btn");
  const toggleFilterButton = document.getElementById("toggle-filter-btn");

  // --- Bestätigungs-Modal ---
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

  // --- Einstellungs-Modal ---
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
  const settingDefaultCarSelect = document.getElementById(
    "setting-default-car"
  );
  const settingDefaultPurposeSelect = document.getElementById(
    "setting-default-purpose"
  );
  const settingDeleteAllBtn = document.getElementById("setting-delete-all-btn");
  const csvDelimiterRadioName = "setting-csv-delimiter";

  // --- Paginierung (Fahrten) ---
  const paginationControls = document.getElementById("pagination-controls");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const pageInfoSpan = document.getElementById("page-info-span");

  // --- Rechte Spalte ---
  const zusammenfassungDiv = document.getElementById("zusammenfassung");
  const carListUl = document.getElementById("car-list");

  // --- Benachrichtigungen ---
  const notificationContainer = document.getElementById(
    "notification-container"
  );

  // ========================================================================
  // === 2. Statusvariablen ===
  // ========================================================================
  let editId = null; // ID der Fahrt, die bearbeitet wird
  let editCarId = null; // ID des Fahrzeugs, das bearbeitet wird
  let editExpenseId = null; // ID der Ausgabe, die bearbeitet wird
  let cars = []; // Array für die Fahrzeugliste
  let expenses = []; // Array für die Ausgabenliste
  let confirmModalCallback = null; // Callback für Bestätigungs-Modal
  let currentPage = 1; // Aktuelle Seite für Fahrten-Paginierung
  const itemsPerPage = 10; // Einträge pro Seite (Fahrten)
  let fullTripListForPagination = []; // Komplette (gefilterte) Fahrtenliste

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

  /**
   * Zeigt eine kurze Benachrichtigung (Toast) an.
   * @param {string} message Nachricht.
   * @param {string} [type='success'] Typ ('success', 'error', 'info').
   * @param {number} [duration=5000] Dauer in ms.
   */
  function showNotification(message, type = "success", duration = 5000) {
    if (!notificationContainer) return;
    const notificationDiv = document.createElement("div");
    notificationDiv.classList.add("notification", `notification-${type}`);
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    const progressBarContainer = document.createElement("div");
    progressBarContainer.classList.add("notification-progress-bar");
    const progressBarInner = document.createElement("div");
    progressBarInner.classList.add(
      "notification-progress-bar-inner",
      `progress-bar-${type}`
    );
    progressBarInner.style.animationDuration = `${duration / 1000}s`;
    progressBarContainer.appendChild(progressBarInner);
    notificationDiv.appendChild(messageElement);
    notificationDiv.appendChild(progressBarContainer);
    notificationContainer.appendChild(notificationDiv);
    requestAnimationFrame(() => {
      notificationDiv.classList.add("notification-visible");
    });
    const fadeOutTransitionDuration = 500;
    setTimeout(() => {
      notificationDiv.classList.remove("notification-visible");
      setTimeout(() => {
        if (notificationDiv.parentNode === notificationContainer) {
          notificationContainer.removeChild(notificationDiv);
        }
      }, fadeOutTransitionDuration);
    }, duration);
  }

  /**
   * Aktualisiert die Paginierungs-Steuerelemente für Fahrten.
   */
  function updatePaginationControls(currentPage, totalPages) {
    if (!paginationControls || !prevPageBtn || !nextPageBtn || !pageInfoSpan)
      return;
    if (totalPages <= 1) {
      paginationControls.style.display = "none";
      return;
    }
    paginationControls.style.display = "block";
    pageInfoSpan.textContent = `Seite ${currentPage} von ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  }

  /**
   * Steuert die Sichtbarkeit der Haupt-Container in der mittleren Spalte.
   * Blendet alle aus und zeigt nur den gewünschten an.
   * @param {'formular' | 'fahrten' | 'ausgaben' | 'berichte'} viewToShow - Die anzuzeigende Ansicht.
   */
  function showMiddleColumnView(viewToShow) {
    // Die detaillierten Logs wurden entfernt. Nur das initiale Log bleibt.
    console.log("Zeige mittlere Spaltenansicht:", viewToShow);

    // 1. Alle potentiellen Haupt-Container ausblenden
    if (formularDiv) formularDiv.classList.remove("form-visible");
    if (fahrtenListeContainer) fahrtenListeContainer.style.display = "none";
    if (ausgabenListeContainer) ausgabenListeContainer.style.display = "none";
    if (berichteContainer) berichteContainer.style.display = "none";

    // 2. Gewünschten Container einblenden und passende Funktion aufrufen
    switch (viewToShow) {
      case "formular":
        if (formularDiv) formularDiv.classList.add("form-visible");
        break;
      case "fahrten":
        if (fahrtenListeContainer)
          fahrtenListeContainer.style.display = "block";
        break;
      case "ausgaben":
        if (ausgabenListeContainer)
          ausgabenListeContainer.style.display = "block";
        displayExpenses();
        break;
      case "berichte":
        if (berichteContainer) berichteContainer.style.display = "block";
        displayStatistics();
        break;
      default:
        console.warn("Unbekannte Ansicht angefordert:", viewToShow); // Warnung bleibt
        if (fahrtenListeContainer)
          fahrtenListeContainer.style.display = "block"; // Fallback
    }
  }
  /**
   * NEU: Konstante mit deutschen Monatsabkürzungen.
   */
  const monthNamesDE = [
    "Jan",
    "Feb",
    "Mär",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
  ];

  /**
   * NEU: Gibt den deutschen Monatsnamen für eine gegebene Monatsnummer (1-12) zurück.
   * @param {number} monthNumber - Die Monatsnummer (1 für Januar, 12 für Dezember).
   * @returns {string} Die Abkürzung des Monatsnamens oder "?".
   */
  function getMonthNameDE(monthNumber) {
    // monthNumber ist 1-basiert
    // Stellt sicher, dass die Nummer im gültigen Bereich liegt
    if (monthNumber >= 1 && monthNumber <= 12) {
      return monthNamesDE[monthNumber - 1];
    }
    return "?"; // Fallback für ungültige Nummern
  }

  // ========================================================================
  // === 4. Theme (Dark Mode) Funktionen ===
  // ========================================================================
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
  function handleSidebarToggle() {
    const isCollapsed = document.body.classList.contains("sidebar-collapsed");
    setSidebarState(!isCollapsed); // Zustand umschalten
    try {
      localStorage.setItem("sidebarCollapsed", !isCollapsed);
    } catch (e) {
      console.error("Fehler beim Speichern des Sidebar-Zustands:", e);
    }
  }
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
    // Ensure IDs exist (for older data potentially without IDs)
    cars.forEach((car) => {
      if (!car.id) {
        car.id = Date.now() + Math.random().toString(16).slice(2);
      }
    });
  }
  function saveCars() {
    try {
      localStorage.setItem("fahrtenbuchCars", JSON.stringify(cars));
      console.log("Fahrzeuge gespeichert.");
    } catch (e) {
      console.error("Fehler beim Speichern der Fahrzeuge:", e);
      showNotification("Fehler beim Speichern der Fahrzeuge!", "error");
    }
  }
  function displayCarList() {
    if (!carListUl) return;
    carListUl.innerHTML = "";
    if (cars.length === 0) {
      carListUl.innerHTML =
        '<li class="car-list-item-empty">Keine Fahrzeuge angelegt.</li>';
    } else {
      // Sort cars by name before displaying
      const sortedCars = [...cars].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      sortedCars.forEach((car) => {
        const li = document.createElement("li");
        li.classList.add("car-list-item");
        li.setAttribute("data-car-id", car.id);
        const carNameText = car.name || "Unbenannt";
        const carPlateText = car.plate ? ` (${car.plate})` : "";
        const carInfoSpan = document.createElement("span");
        carInfoSpan.classList.add("car-list-info");
        carInfoSpan.innerHTML = `
          <i class="fa-solid fa-car-side fa-fw list-icon"></i>
          <span class="car-name">${carNameText}</span>
          <strong class="car-plate">${carPlateText}</strong>`;
        const carActionsSpan = document.createElement("span");
        carActionsSpan.classList.add("car-list-actions");
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.title = "Fahrzeug bearbeiten";
        editBtn.dataset.carId = car.id;
        editBtn.classList.add("car-list-button", "edit-car-btn");
        editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.title = "Fahrzeug löschen";
        deleteBtn.dataset.carId = car.id;
        deleteBtn.classList.add("car-list-button", "delete-car-btn");
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        carActionsSpan.appendChild(editBtn);
        carActionsSpan.appendChild(deleteBtn);
        li.appendChild(carInfoSpan);
        li.appendChild(carActionsSpan);
        carListUl.appendChild(li);
      });
    }
  }
  function populateCarDropdown() {
    if (!carSelect) return;
    const aktuellerWert = carSelect.value;
    while (carSelect.options.length > 1) carSelect.remove(1);
    const sortedCars = [...cars].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
    sortedCars.forEach((car) => {
      const option = document.createElement("option");
      option.value = car.id;
      option.textContent = `${car.name || "Unbenannt"}${
        car.plate ? ` (${car.plate})` : ""
      }`;
      carSelect.appendChild(option);
    });
    carSelect.value = aktuellerWert;
  }
  function populateFilterCarDropdown() {
    if (!filterCarSelect) return;
    const aktuellerWert = filterCarSelect.value;
    while (filterCarSelect.options.length > 1) filterCarSelect.remove(1);
    const sortedCars = [...cars].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
    sortedCars.forEach((car) => {
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
  function openAddCarModal() {
    if (!addCarModal || !modalCarForm) return;
    console.log("Öffne Fahrzeug-Modal zum Hinzufügen...");
    editCarId = null;
    modalCarForm.reset();
    if (modalCarError) {
      modalCarError.textContent = "";
      modalCarError.style.display = "none";
    }
    const modalTitle = addCarModal.querySelector(".modal-header h2");
    if (modalTitle) modalTitle.textContent = "Neues Fahrzeug hinzufügen";
    if (modalSaveCarButton)
      modalSaveCarButton.textContent = "Fahrzeug speichern";
    addCarModal.classList.add("modal-visible");
    setTimeout(() => {
      modalCarNameInput?.focus();
    }, 50);
  }
  function openEditCarModal(carId) {
    if (!addCarModal || !modalCarForm) return;
    console.log("Öffne Fahrzeug-Modal zum Bearbeiten für ID:", carId);
    const carToEdit = cars.find(
      (car) => car.id.toString() === carId.toString()
    );
    if (!carToEdit) {
      console.error("Zu bearbeitendes Fahrzeug nicht gefunden, ID:", carId);
      showNotification(
        "Fehler: Zu bearbeitendes Fahrzeug nicht gefunden.",
        "error"
      );
      return;
    }
    editCarId = carId;
    modalCarNameInput.value = carToEdit.name;
    modalCarPlateInput.value = carToEdit.plate;
    if (modalCarError) {
      modalCarError.textContent = "";
      modalCarError.style.display = "none";
    }
    const modalTitle = addCarModal.querySelector(".modal-header h2");
    if (modalTitle) modalTitle.textContent = "Fahrzeug bearbeiten";
    if (modalSaveCarButton)
      modalSaveCarButton.textContent = "Änderungen speichern";
    addCarModal.classList.add("modal-visible");
    setTimeout(() => {
      modalCarNameInput?.focus();
    }, 50);
  }
  function closeAddCarModal() {
    if (!addCarModal) return;
    addCarModal.classList.remove("modal-visible");
    editCarId = null;
    console.log("Fahrzeug-Modal geschlossen, Edit-Status zurückgesetzt.");
  }
  function handleModalSaveCar() {
    const name = modalCarNameInput?.value.trim();
    const plate = modalCarPlateInput?.value.trim();
    if (!name || !plate) {
      showModalError("Bitte Name/Modell und Kennzeichen eingeben.");
      return;
    }
    if (editCarId !== null) {
      // BEARBEITEN
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
        populateFilterCarDropdown();
        populateExpenseVehicleDropdown(); // Update expense dropdown too
        console.log("Fahrzeug erfolgreich aktualisiert:", carToUpdate);
        showNotification("Fahrzeug erfolgreich aktualisiert.", "success");
        closeAddCarModal();
      } else {
        console.error(
          "Fehler beim Speichern: Zu bearbeitendes Fahrzeug nicht mehr gefunden, ID:",
          editCarId
        );
        showNotification(
          "Fehler: Das zu bearbeitende Fahrzeug konnte nicht gefunden werden.",
          "error"
        );
        closeAddCarModal();
      }
    } else {
      // HINZUFÜGEN
      console.log("Speichere neues Fahrzeug...");
      if (cars.some((car) => car.plate.toLowerCase() === plate.toLowerCase())) {
        showModalError(
          `Fehler: Ein Fahrzeug mit dem Kennzeichen "${plate}" existiert bereits.`
        );
        return;
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
      populateFilterCarDropdown();
      populateExpenseVehicleDropdown(); // Update expense dropdown too
      console.log("Neues Fahrzeug gespeichert (via Modal):", newCar);
      showNotification("Neues Fahrzeug erfolgreich hinzugefügt.", "success");
      closeAddCarModal();
    }
  }
  function showModalError(message) {
    if (!modalCarError) return;
    modalCarError.textContent = message;
    modalCarError.style.display = "block";
  }
  function populateSettingsCarDropdown() {
    if (!settingDefaultCarSelect) return;
    const aktuellerWert = settingDefaultCarSelect.value;
    while (settingDefaultCarSelect.options.length > 1)
      settingDefaultCarSelect.remove(1);
    const sortedCars = [...cars].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
    sortedCars.forEach((car) => {
      const option = document.createElement("option");
      option.value = car.id;
      option.textContent = `${car.name || "Unbenannt"}${
        car.plate ? ` (${car.plate})` : ""
      }`;
      settingDefaultCarSelect.appendChild(option);
    });
    settingDefaultCarSelect.value = aktuellerWert;
    console.log("Einstellungen: Standard-Fahrzeug-Dropdown befüllt.");
  }

  // ========================================================================
  // === 7. Ausgaben-Verwaltungsfunktionen ===
  // ========================================================================

  /**
   * Lädt die Ausgabenliste aus dem localStorage.
   */
  function loadExpenses() {
    const storedExpenses = localStorage.getItem("fahrtenbuchExpenses");
    try {
      const parsedExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      expenses = Array.isArray(parsedExpenses) ? parsedExpenses : [];
      console.log(`${expenses.length} Ausgaben geladen.`);
      // Ensure IDs exist
      expenses.forEach((exp) => {
        if (!exp.id) {
          exp.id = Date.now() + Math.random().toString(16).slice(2);
        }
      });
    } catch (e) {
      console.error("Fehler beim Laden der Ausgaben:", e);
      expenses = [];
    }
  }

  /**
   * Speichert das aktuelle 'expenses'-Array (sortiert nach Datum) im localStorage.
   */
  function saveExpenses() {
    try {
      // Sortieren nach Datum absteigend (neueste zuerst)
      expenses.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      localStorage.setItem("fahrtenbuchExpenses", JSON.stringify(expenses));
      console.log("Ausgaben gespeichert.");
    } catch (e) {
      console.error("Fehler beim Speichern der Ausgaben:", e);
      showNotification("Fehler beim Speichern der Ausgaben!", "error");
    }
  }

  /**
   * Füllt das Fahrzeug-Dropdown im Ausgaben-Modal.
   */
  function populateExpenseVehicleDropdown() {
    if (!modalExpenseVehicleSelect) {
      console.error(
        "Fahrzeugauswahl-Dropdown im Ausgaben-Modal nicht gefunden!"
      );
      return;
    }
    const aktuellerWert = modalExpenseVehicleSelect.value;
    while (modalExpenseVehicleSelect.options.length > 1) {
      modalExpenseVehicleSelect.remove(1);
    }
    const sortedCars = [...cars].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
    sortedCars.forEach((car) => {
      const option = document.createElement("option");
      option.value = car.id;
      option.textContent = `${car.name || "Unbenannt"}${
        car.plate ? ` (${car.plate})` : ""
      }`;
      modalExpenseVehicleSelect.appendChild(option);
    });
    modalExpenseVehicleSelect.value = aktuellerWert;
    console.log("Ausgaben-Modal: Fahrzeug-Dropdown befüllt.");
  }

  /**
   * Öffnet den Modal-Dialog zum Hinzufügen einer Ausgabe.
   */
  function openAddExpenseModal() {
    if (!addExpenseModal || !modalExpenseForm) return;
    console.log("Öffne Ausgaben-Modal zum Hinzufügen...");
    editExpenseId = null; // Sicherstellen, dass wir im Hinzufügen-Modus sind
    modalExpenseForm.reset();
    populateExpenseVehicleDropdown();
    modalExpenseDateInput.value = getDatumString();

    const modalTitle = addExpenseModal.querySelector(".modal-header h2");
    if (modalTitle) modalTitle.textContent = "Neue Ausgabe erfassen";
    if (modalSaveExpenseButton)
      modalSaveExpenseButton.textContent = "Ausgabe speichern";

    if (modalExpenseError) {
      modalExpenseError.textContent = "";
      modalExpenseError.style.display = "none";
    }
    addExpenseModal.classList.add("modal-visible");
    setTimeout(() => {
      modalExpenseDateInput?.focus();
    }, 50);
  }

  /**
   * Startet den Bearbeitungsmodus für eine Ausgabe.
   * @param {string|number} expenseId Die ID der zu bearbeitenden Ausgabe.
   */
  function startEditExpenseMode(expenseId) {
    if (!addExpenseModal || !modalExpenseForm) return;
    console.log("Starte Edit-Modus für Ausgabe-ID:", expenseId);

    const expenseToEdit = expenses.find(
      (exp) => exp.id.toString() === expenseId.toString()
    );
    if (!expenseToEdit) {
      showNotification(
        "Fehler: Zu bearbeitende Ausgabe nicht gefunden!",
        "error"
      );
      return;
    }

    editExpenseId = expenseId; // Globale Variable setzen

    // Formular mit vorhandenen Daten füllen
    populateExpenseVehicleDropdown(); // Dropdown füllen, bevor Wert gesetzt wird
    modalExpenseDateInput.value = expenseToEdit.date || "";
    modalExpenseVehicleSelect.value = expenseToEdit.vehicleId || "";
    modalExpenseTypeSelect.value = expenseToEdit.type || "";
    modalExpenseDescriptionInput.value = expenseToEdit.description || "";
    modalExpenseAmountInput.value = expenseToEdit.amount || "";
    modalExpenseOdometerInput.value =
      expenseToEdit.odometer !== null ? expenseToEdit.odometer : ""; // Leeren String, wenn null

    // Titel und Button für "Bearbeiten"-Modus anpassen
    const modalTitle = addExpenseModal.querySelector(".modal-header h2");
    if (modalTitle) modalTitle.textContent = "Ausgabe bearbeiten";
    if (modalSaveExpenseButton)
      modalSaveExpenseButton.textContent = "Änderungen speichern";

    if (modalExpenseError) {
      // Fehler ggf. löschen
      modalExpenseError.textContent = "";
      modalExpenseError.style.display = "none";
    }

    addExpenseModal.classList.add("modal-visible"); // Modal anzeigen
    setTimeout(() => {
      modalExpenseDateInput?.focus();
    }, 50); // Fokus setzen
  }

  /**
   * Schließt den Modal-Dialog (Ausgaben) und setzt den Edit-Status zurück.
   */
  function closeAddExpenseModal() {
    if (!addExpenseModal) return;
    addExpenseModal.classList.remove("modal-visible");
    editExpenseId = null; // WICHTIG: Edit-Status immer zurücksetzen
    console.log("Ausgaben-Modal geschlossen, Edit-Status zurückgesetzt.");
  }

  /**
   * Zeigt eine Fehlermeldung im Ausgaben-Modal an.
   */
  function showExpenseModalError(message) {
    if (!modalExpenseError) return;
    modalExpenseError.textContent = message;
    modalExpenseError.style.display = "block";
  }

  /**
   * Validiert die Eingaben im Ausgaben-Modal.
   * @returns {object|null} Das validierte Ausgabenobjekt oder null bei Fehlern.
   */
  function validateAndGetExpenseData() {
    const expenseData = {
      date: modalExpenseDateInput.value,
      vehicleId: modalExpenseVehicleSelect.value,
      type: modalExpenseTypeSelect.value,
      description: modalExpenseDescriptionInput.value.trim(),
      amount: modalExpenseAmountInput.value,
      odometer: modalExpenseOdometerInput.value.trim(),
    };
    const errors = [];
    if (!expenseData.date) errors.push("Bitte Datum eingeben.");
    if (!expenseData.vehicleId) errors.push("Bitte Fahrzeug auswählen.");
    if (!expenseData.type) errors.push("Bitte Art der Ausgabe auswählen.");
    if (
      !expenseData.amount ||
      isNaN(parseFloat(expenseData.amount)) ||
      parseFloat(expenseData.amount) <= 0
    ) {
      errors.push("Bitte einen gültigen, positiven Betrag eingeben.");
    }
    if (
      expenseData.odometer !== "" &&
      (isNaN(parseInt(expenseData.odometer, 10)) ||
        parseInt(expenseData.odometer, 10) < 0)
    ) {
      errors.push(
        "Bitte einen gültigen, nicht-negativen Kilometerstand eingeben oder das Feld leer lassen."
      );
    }
    if (errors.length > 0) {
      showExpenseModalError(errors.join("\n"));
      return null;
    }
    if (modalExpenseError) {
      modalExpenseError.textContent = "";
      modalExpenseError.style.display = "none";
    }
    expenseData.amount = parseFloat(expenseData.amount);
    expenseData.odometer =
      expenseData.odometer !== "" ? parseInt(expenseData.odometer, 10) : null;
    return expenseData;
  }

  /**
   * Verarbeitet das Speichern aus dem Modal-Dialog (Ausgabe).
   * Unterscheidet jetzt zwischen Hinzufügen und Bearbeiten.
   */
  function handleSaveExpense() {
    console.log(
      "Speichern-Button im Ausgaben-Modal geklickt. Edit-ID:",
      editExpenseId
    );
    const validatedData = validateAndGetExpenseData();
    if (!validatedData) {
      console.warn("Validierung der Ausgabe fehlgeschlagen.");
      return; // Abbruch bei Validierungsfehler
    }

    if (editExpenseId !== null) {
      // --- BEARBEITEN-MODUS ---
      const index = expenses.findIndex(
        (exp) => exp.id.toString() === editExpenseId.toString()
      );
      if (index !== -1) {
        expenses[index] = { ...expenses[index], ...validatedData }; // Update mit Beibehaltung der ID
        saveExpenses();
        console.log("Ausgabe erfolgreich aktualisiert:", expenses[index]);
        showNotification("Änderung erfolgreich gespeichert!", "success");
        closeAddExpenseModal(); // Schließt Modal und setzt editExpenseId zurück
        displayExpenses(); // Liste neu anzeigen
      } else {
        console.error(
          "Fehler beim Update: Zu bearbeitende Ausgabe nicht gefunden, ID:",
          editExpenseId
        );
        showNotification(
          "Fehler: Ausgabe beim Speichern nicht gefunden!",
          "error"
        );
        closeAddExpenseModal();
      }
    } else {
      // --- HINZUFÜGEN-MODUS ---
      const newExpense = {
        id: Date.now() + Math.random().toString(16).slice(2),
        ...validatedData,
      };
      expenses.push(newExpense);
      saveExpenses();
      console.log("Neue Ausgabe gespeichert:", newExpense);
      showNotification("Ausgabe erfolgreich gespeichert!", "success");
      closeAddExpenseModal();
      // Nur Liste neu zeichnen, wenn sie gerade sichtbar ist
      if (ausgabenListeContainer?.style.display === "block") {
        displayExpenses();
      }
    }
  }

  /**
   * Löscht eine Ausgabe nach Bestätigung.
   * @param {string|number} expenseId Die ID der zu löschenden Ausgabe.
   */
  function deleteExpense(expenseId) {
    console.log("Lösche Ausgabe mit ID:", expenseId);

    const deleteAction = () => {
      console.log("Bestätigung erhalten, lösche Ausgabe:", expenseId);
      const initialLength = expenses.length;
      expenses = expenses.filter(
        (exp) => exp.id.toString() !== expenseId.toString()
      ); // Filtern

      if (expenses.length < initialLength) {
        saveExpenses(); // Geändertes Array speichern
        console.log(`Ausgabe mit ID ${expenseId} erfolgreich gelöscht.`);
        showNotification("Ausgabe erfolgreich gelöscht.", "success");
        displayExpenses(); // Anzeige aktualisieren

        // Falls die gelöschte Ausgabe gerade bearbeitet wurde, Modal schließen
        if (
          editExpenseId &&
          editExpenseId.toString() === expenseId.toString()
        ) {
          closeAddExpenseModal();
        }
      } else {
        console.warn("Zu löschende Ausgabe-ID nicht gefunden:", expenseId);
        showNotification(
          "Fehler: Zu löschende Ausgabe nicht gefunden!",
          "error"
        );
      }
    };

    // Bestätigungs-Modal anzeigen
    openConfirmModal(
      "Soll diese Ausgabe wirklich gelöscht werden?",
      deleteAction
    );
  }

  // ========================================================================
  // === NEU: Statistik-Berechnungsfunktionen ===
  // ========================================================================
  /**
   * Stellt sicher, dass die verschachtelte Struktur für Statistiken
   * für ein gegebenes Fahrzeug, Jahr und Monat existiert.
   * Initialisiert fehlende Strukturen mit Standardwerten.
   * @param {object} statsObject - Das Haupt-Statistikobjekt (statsByVehicle).
   * @param {string} vehicleId - Die ID des Fahrzeugs.
   * @param {string} vehicleName - Der Name des Fahrzeugs.
   * @param {number} year - Das Jahr.
   * @param {number} month - Der Monat (1-12).
   */
  function ensureStatsStructure(
    statsObject,
    vehicleId,
    vehicleName,
    year,
    month
  ) {
    // Fahrzeug-Ebene sicherstellen
    if (!statsObject[vehicleId]) {
      statsObject[vehicleId] = {
        vehicleId: vehicleId,
        vehicleName: vehicleName,
        statsByYear: {},
      };
    }
    // Jahr-Ebene sicherstellen
    if (!statsObject[vehicleId].statsByYear[year]) {
      statsObject[vehicleId].statsByYear[year] = {
        totalDistanceYear: 0,
        totalCostsYear: 0,
        byMonth: {}, // Leeres Objekt für Monate initialisieren
      };
      // Alle Monate für dieses Jahr initialisieren
      for (let m = 1; m <= 12; m++) {
        statsObject[vehicleId].statsByYear[year].byMonth[m] = {
          distance: 0,
          costs: 0,
        };
      }
    }
    // Monat-Ebene ist durch die Initialisierung oben bereits sichergestellt
  }

  /**
   * Berechnet Statistiken (Distanz, Kosten) pro Fahrzeug,
   * aufgeschlüsselt nach Jahr und Monat.
   *
   * @returns {object} Ein Objekt, bei dem Schlüssel die vehicleId ist und der Wert
   * ein Objekt mit den Jahres-/Monatsstatistiken enthält.
   * Beispiel: { "car-123": { vehicleId: "...", vehicleName: "...", statsByYear: { ... } } }
   */
  function calculateMonthlyYearlyStats() {
    console.log("Berechne monatliche/jährliche Statistiken...");
    const allTrips = ladeFahrtenAusLocalStorage();
    // Globale Variablen 'cars' und 'expenses' werden hier verwendet

    let statsByVehicle = {}; // Objekt zum Speichern der Ergebnisse nach vehicleId

    // 1. Fahrten verarbeiten (Distanzen)
    allTrips.forEach((trip) => {
      if (!trip.carId || !trip.datum || !trip.distanz) return; // Ungültige Daten überspringen

      try {
        const date = new Date(trip.datum);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Monate sind 0-basiert, daher +1
        const distance = parseFloat(trip.distanz || 0);
        const vehicleId = trip.carId;

        if (isNaN(year) || isNaN(month) || isNaN(distance)) return; // Ungültige Werte überspringen

        // Finde Fahrzeugnamen
        const car = cars.find((c) => c.id === vehicleId);
        const vehicleName = car
          ? `${car.name || "Unbenannt"}${car.plate ? ` (${car.plate})` : ""}`
          : "Unbekanntes Fahrzeug";

        // Stelle sicher, dass die Struktur existiert
        ensureStatsStructure(
          statsByVehicle,
          vehicleId,
          vehicleName,
          year,
          month
        );

        // Distanz hinzufügen
        statsByVehicle[vehicleId].statsByYear[year].byMonth[month].distance +=
          distance;
        statsByVehicle[vehicleId].statsByYear[year].totalDistanceYear +=
          distance;
      } catch (e) {
        console.error("Fehler beim Verarbeiten der Fahrt:", trip, e);
      }
    });

    // 2. Ausgaben verarbeiten (Kosten)
    expenses.forEach((expense) => {
      if (!expense.vehicleId || !expense.date || !expense.amount) return; // Ungültige Daten überspringen

      try {
        const date = new Date(expense.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Monate sind 0-basiert, daher +1
        const amount = parseFloat(expense.amount || 0);
        const vehicleId = expense.vehicleId;

        if (isNaN(year) || isNaN(month) || isNaN(amount)) return; // Ungültige Werte überspringen

        // Finde Fahrzeugnamen (falls Fahrzeug noch nicht durch Fahrten erfasst wurde)
        const car = cars.find((c) => c.id === vehicleId);
        const vehicleName = car
          ? `${car.name || "Unbenannt"}${car.plate ? ` (${car.plate})` : ""}`
          : "Unbekanntes Fahrzeug";

        // Stelle sicher, dass die Struktur existiert
        ensureStatsStructure(
          statsByVehicle,
          vehicleId,
          vehicleName,
          year,
          month
        );

        // Kosten hinzufügen
        statsByVehicle[vehicleId].statsByYear[year].byMonth[month].costs +=
          amount;
        statsByVehicle[vehicleId].statsByYear[year].totalCostsYear += amount;
      } catch (e) {
        console.error("Fehler beim Verarbeiten der Ausgabe:", expense, e);
      }
    });

    // 3. Optional: Runden der Jahreswerte am Ende
    Object.values(statsByVehicle).forEach((vehicleStats) => {
      Object.values(vehicleStats.statsByYear).forEach((yearStats) => {
        yearStats.totalDistanceYear = parseFloat(
          yearStats.totalDistanceYear.toFixed(1)
        );
        yearStats.totalCostsYear = parseFloat(
          yearStats.totalCostsYear.toFixed(2)
        );
        // Monate sind schon beim Addieren implizit float
      });
    });

    console.log("Monatliche/jährliche Statistiken berechnet:", statsByVehicle);
    return statsByVehicle; // Gib das Objekt zurück (Schlüssel = vehicleId)
  }


  // ========================================================================
  // === Ende Statistik-Berechnungsfunktionen ===
  // ========================================================================
  // ========================================================================
  // === Funktionen zur Anzeige der Statistiken (NEU) ===
  // ========================================================================

  /**
   * Zeigt die berechneten Fahrzeugstatistiken (inkl. Monats-/Jahresübersicht und Durchschnitte) im HTML an.
   * Zeigt in der Monatstabelle nur Monate mit Aktivität an.
   */
  /**
   * Zeigt die berechneten Fahrzeugstatistiken im HTML an.
   * Die Monatstabelle ist jetzt einklappbar.
   */
  function displayStatistics() {
    if (!berichteInhaltDiv) {
      console.error(
        "FEHLER: Div für Berichte-Inhalt ('berichte-inhalt') nicht gefunden!"
      );
      return;
    }

    const statsByVehicle = calculateMonthlyYearlyStats();
    berichteInhaltDiv.innerHTML = "";

    const vehicleIds = Object.keys(statsByVehicle);

    if (vehicleIds.length === 0) {
      berichteInhaltDiv.innerHTML =
        "<p>Keine Statistiken verfügbar. Erfassen Sie Fahrten und Ausgaben für Ihre Fahrzeuge.</p>";
      return;
    }

    vehicleIds.sort((a, b) =>
      statsByVehicle[a].vehicleName.localeCompare(statsByVehicle[b].vehicleName)
    );

    vehicleIds.forEach((vehicleId) => {
      const vehicleStats = statsByVehicle[vehicleId];
      const card = document.createElement("div");
      card.classList.add("report-card");

      let cardBodyHtml = "";
      const sortedYears = Object.keys(vehicleStats.statsByYear).sort(
        (a, b) => b - a
      );

      sortedYears.forEach((year) => {
        const yearStats = vehicleStats.statsByYear[year];
        const costPerKmYear =
          yearStats.totalDistanceYear > 0
            ? (yearStats.totalCostsYear / yearStats.totalDistanceYear).toFixed(
                2
              ) + " €"
            : "N/A";

        let monthsWithDistance = 0;
        let monthsWithCosts = 0;
        let monthlyTableBodyHtml = "";
        let hasAnyMonthlyActivity = false;

        for (let month = 1; month <= 12; month++) {
          const monthData = yearStats.byMonth[month];
          if (monthData.distance > 0) monthsWithDistance++;
          if (monthData.costs > 0) monthsWithCosts++;

          if (monthData.distance > 0 || monthData.costs > 0) {
            hasAnyMonthlyActivity = true;
            monthlyTableBodyHtml += `
                        <tr>
                            <td>${getMonthNameDE(month)}</td>
                            <td>${monthData.distance.toFixed(1)}</td>
                            <td>${monthData.costs.toFixed(2)}</td>
                        </tr>
                    `;
          }
        }

        const avgDistancePerMonth =
          monthsWithDistance > 0
            ? (yearStats.totalDistanceYear / monthsWithDistance).toFixed(1) +
              " km"
            : "N/A";
        const avgCostsPerMonth =
          monthsWithCosts > 0
            ? (yearStats.totalCostsYear / monthsWithCosts).toFixed(2) + " €"
            : "N/A";

        // Baue den Jahresabschnitt zusammen
        cardBodyHtml += `
                <div class="year-section">
                    <h4>Jahr ${year}</h4>
                    <div class="year-summary">
                        <div class="stat-item"><span class="label">Gesamt-Distanz:</span><span class="value">${yearStats.totalDistanceYear.toFixed(
                          1
                        )} km</span></div>
                        <div class="stat-item"><span class="label">Gesamt-Kosten:</span><span class="value">${yearStats.totalCostsYear.toFixed(
                          2
                        )} €</span></div>
                        <div class="stat-item"><span class="label">Ø Distanz / Monat*:</span><span class="value ${
                          avgDistancePerMonth === "N/A" ? "na" : ""
                        }">${avgDistancePerMonth}</span></div>
                        <div class="stat-item"><span class="label">Ø Kosten / Monat*:</span><span class="value ${
                          avgCostsPerMonth === "N/A" ? "na" : ""
                        }">${avgCostsPerMonth}</span></div>
                        <div class="stat-item"><span class="label">Kosten / km:</span><span class="value ${
                          costPerKmYear === "N/A" ? "na" : "cost-per-km"
                        }">${costPerKmYear}</span></div>
                    </div>
                    <p class="average-hint">* Durchschnitt pro Monat mit Aktivität (Distanz > 0 bzw. Kosten > 0)</p>
            `;

        // Füge einklappbare Details hinzu, WENN es monatliche Aktivität gab
        if (hasAnyMonthlyActivity) {
          cardBodyHtml += `
                    <details class="monthly-details">
                        <summary class="monthly-details-summary">Monatsdetails anzeigen</summary>
                        <table class="monthly-stats-table">
                            <thead><tr><th>Monat</th><th>Distanz (km)</th><th>Kosten (€)</th></tr></thead>
                            <tbody>
                                ${monthlyTableBodyHtml}
                            </tbody>
                        </table>
                    </details>`;
        } else {
          cardBodyHtml += `<p class="no-monthly-activity-hint">Keine monatliche Aktivität erfasst für ${year}.</p>`;
        }

        cardBodyHtml += `</div>`; // Ende .year-section
      }); // Ende forEach year

      // Gesamte Karte zusammensetzen
      card.innerHTML = `
            <h3 class="report-card-title"><i class="fa-solid fa-car fa-fw"></i>${vehicleStats.vehicleName}</h3>
            <div class="report-card-body">${cardBodyHtml}</div>
        `;
      berichteInhaltDiv.appendChild(card);
    });
  }
  // ========================================================================
  // === 8. Funktionen zur Anzeige der Ausgabenliste ===
  // ========================================================================

  /**
   * Zeigt die Liste der gespeicherten Ausgaben im HTML an.
   */
  function displayExpenses() {
    if (!ausgabenListeDiv) {
      console.error("FEHLER: Div für Ausgabenliste nicht gefunden!");
      return;
    }
    console.log(`Zeige ${expenses.length} Ausgaben an.`);
    expenses.sort((a, b) => (b.date || "").localeCompare(a.date || "")); // Neueste zuerst
    ausgabenListeDiv.innerHTML = ""; // Liste leeren
    if (expenses.length === 0) {
      ausgabenListeDiv.innerHTML = "<p>Noch keine Ausgaben erfasst.</p>";
    } else {
      expenses.forEach((expense) => {
        ausgabeZurListeHinzufuegen(expense); // Item hinzufügen
      });
    }
    // TODO: Paginierung für Ausgaben
  }

  /**
   * Erzeugt das HTML für einen einzelnen Ausgaben-Listeneintrag und fügt ihn hinzu.
   * Verwendet jetzt Event Delegation (Listener wird in setupEventListeners hinzugefügt).
   * @param {object} expense - Das Ausgaben-Objekt.
   */
  function ausgabeZurListeHinzufuegen(expense) {
    if (!ausgabenListeDiv) return;

    const listItem = document.createElement("div");
    listItem.classList.add("expense-item");
    listItem.setAttribute("data-expense-id", expense.id); // ID für Klick-Handler

    const vehicle = cars.find(
      (c) => c.id.toString() === (expense.vehicleId || "").toString()
    );
    const vehicleDisplay = vehicle
      ? `${vehicle.name || "Unbenannt"}${
          vehicle.plate ? ` (${vehicle.plate})` : ""
        }`
      : "Unbekanntes Fahrzeug";
    const datumFormatiert = formatDateDE(expense.date);
    const typeDisplay =
      expense.type.charAt(0).toUpperCase() + expense.type.slice(1);

    // Buttons sind jetzt standardmäßig sichtbar (kein style="display: none;")
    listItem.innerHTML = `
          <div class="expense-item-header">
              <div class="expense-item-meta">
                  <span class="expense-item-info date-info">
                      <i class="fa-solid fa-calendar-days fa-fw list-icon"></i> ${datumFormatiert}
                  </span>
                  <span class="expense-item-info type-info">
                      <i class="fa-solid fa-tag fa-fw list-icon"></i> ${typeDisplay}
                  </span>
                  <span class="expense-item-info car-info" title="${vehicleDisplay}">
                      <i class="fa-solid fa-car fa-fw list-icon"></i> ${vehicleDisplay}
                  </span>
              </div>
              <div class="expense-item-amount">
                  ${expense.amount.toFixed(2)} €
              </div>
          </div>
          <div class="expense-item-details">
              ${
                expense.description
                  ? `<span class="description">${expense.description}</span>`
                  : ""
              }
              ${
                expense.odometer !== null
                  ? `<span class="odometer-reading"><i class="fa-solid fa-road fa-fw list-icon"></i> bei ${expense.odometer} km</span>`
                  : ""
              }
          </div>
          <div class="expense-item-actions">
              <button type="button" title="Bearbeiten" class="list-action-button edit-expense-btn">
                  <i class="fa-solid fa-pencil"></i>
              </button>
              <button type="button" title="Löschen" class="list-action-button delete-expense-btn">
                  <i class="fa-solid fa-trash-can"></i>
              </button>
          </div>
      `;

    ausgabenListeDiv.appendChild(listItem);
  }

  // ========================================================================
  // === 9. Bestätigungs-Modal Funktionen ===
  // ========================================================================
  function openConfirmModal(message, onConfirm) {
    if (!confirmModal || !confirmModalMessage) {
      console.error("Bestätigungs-Modal Elemente NICHT gefunden!");
      return;
    }
    confirmModalMessage.textContent = message;
    confirmModalCallback = onConfirm;
    confirmModal.classList.add("modal-visible");
  }
  function closeConfirmModal() {
    if (!confirmModal) return;
    confirmModal.classList.remove("modal-visible");
    confirmModalCallback = null;
  }

  // ========================================================================
  // === 10. Einstellungs-Modal Funktionen ===
  // ========================================================================
  function loadSettings() {
    const defaultSettings = {
      defaultCar: "",
      defaultPurpose: "",
      csvDelimiter: ";",
    };
    try {
      const storedSettings = localStorage.getItem("fahrtenbuchAppSettings");
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        return { ...defaultSettings, ...parsedSettings };
      } else {
        return defaultSettings;
      }
    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen:", error);
      return defaultSettings;
    }
  }
  function saveSettings(settings) {
    try {
      localStorage.setItem("fahrtenbuchAppSettings", JSON.stringify(settings));
      console.log("Einstellungen gespeichert:", settings);
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
      showNotification("Fehler beim Speichern der Einstellungen!", "error");
    }
  }
  function openSettingsModal() {
    if (!settingsModal) return;
    console.log("Öffne Einstellungs-Modal...");
    populateSettingsCarDropdown(); // Muss vor Wertsetzung passieren
    const currentSettings = loadSettings();
    console.log("Geladene Einstellungen:", currentSettings);
    settingDefaultCarSelect.value = currentSettings.defaultCar || "";
    settingDefaultPurposeSelect.value = currentSettings.defaultPurpose || "";
    const delimiterValue = currentSettings.csvDelimiter || ";";
    try {
      const selectedRadio = document.querySelector(
        `input[name="${csvDelimiterRadioName}"][value="${delimiterValue}"]`
      );
      if (selectedRadio) {
        selectedRadio.checked = true;
      } else {
        document.querySelector(
          `input[name="${csvDelimiterRadioName}"][value=";"]`
        ).checked = true;
      }
    } catch (e) {
      console.error("Fehler beim Setzen des CSV-Delimiters:", e);
      document.querySelector(
        `input[name="${csvDelimiterRadioName}"][value=";"]`
      ).checked = true;
    }
    settingsModal.classList.add("modal-visible");
  }
  function closeSettingsModal() {
    if (!settingsModal) return;
    settingsModal.classList.remove("modal-visible");
    console.log("Einstellungs-Modal geschlossen.");
  }
  function handleSaveSettings() {
    console.log("Speichere Einstellungen...");
    const selectedCar = settingDefaultCarSelect.value;
    const selectedPurpose = settingDefaultPurposeSelect.value;
    let selectedDelimiter = ";";
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
    const newSettings = {
      defaultCar: selectedCar,
      defaultPurpose: selectedPurpose,
      csvDelimiter: selectedDelimiter,
    };
    saveSettings(newSettings);
    closeSettingsModal();
    showNotification("Einstellungen erfolgreich gespeichert.", "success");
  }
  function handleDeleteAllData() {
    console.log("Button 'Alle Daten löschen' geklickt.");
    const deleteAllAction = () => {
      console.log("Bestätigung erhalten, lösche alle Daten...");
      try {
        localStorage.removeItem("fahrtenbuchEintraege");
        localStorage.removeItem("fahrtenbuchCars");
        localStorage.removeItem("fahrtenbuchExpenses"); // Auch Ausgaben löschen
        localStorage.removeItem("fahrtenbuchAppSettings");
        cars = [];
        expenses = [];
        editId = null;
        editCarId = null;
        editExpenseId = null;
        initialisiereApp(); // Setzt alles zurück
      } catch (error) {
        console.error("Fehler beim Löschen aller Daten:", error);
        showNotification("Fehler beim Löschen der Daten!", "error");
      } finally {
        closeSettingsModal();
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
    openConfirmModal(
      "ACHTUNG!\nSollen wirklich ALLE Fahrten, ALLE Fahrzeuge, ALLE Ausgaben und ALLE Einstellungen unwiderruflich gelöscht werden?",
      deleteAllAction
    );
  }

  // ========================================================================
  // === 11. Kernfunktionen (Fahrten: Speichern, Update, Edit-Modus) ===
  // ========================================================================
  function felderFuerNeueFahrtVorbereiten() {
    if (editId !== null) return; // Nur ausführen, wenn nicht im Edit-Modus
    console.log("Bereite Felder für neue Fahrt vor...");
    const settings = loadSettings();
    try {
      const alleFahrten = ladeFahrtenAusLocalStorage();
      let letzterKM = "";
      let letzterZielOrt = "";
      // Finde den letzten Eintrag des Standard-Fahrzeugs, falls eines gewählt ist
      if (settings.defaultCar) {
        const letzteFahrtDesAutos = alleFahrten
          .filter((f) => f.carId === settings.defaultCar)
          .sort((a, b) =>
            (b.datum + "T" + b.endTime).localeCompare(a.datum + "T" + a.endTime)
          )[0]; // Neueste Fahrt dieses Autos
        if (letzteFahrtDesAutos) {
          letzterKM = letzteFahrtDesAutos.kmEnde || "";
          letzterZielOrt = letzteFahrtDesAutos.zielOrt || "";
        }
      } else if (alleFahrten.length > 0) {
        // Fallback: Letzte Fahrt überhaupt, wenn kein Standard-Auto gesetzt
        const letzteFahrtGesamt = alleFahrten.sort((a, b) =>
          (b.datum + "T" + b.endTime).localeCompare(a.datum + "T" + a.endTime)
        )[0]; // Neueste Fahrt gesamt
        if (letzteFahrtGesamt) {
          letzterKM = letzteFahrtGesamt.kmEnde || "";
          letzterZielOrt = letzteFahrtGesamt.zielOrt || "";
        }
      }

      startOrtInput.value = letzterZielOrt;
      kmStartInput.value = letzterKM;
      zielOrtInput.value = "";
      distanzInput.value = "";
      startTimeInput.value = "";
      endTimeInput.value = "";
      datumInput.value = getDatumString();
      carSelect.value = settings.defaultCar || "";
      zweckSelect.value = settings.defaultPurpose || "geschaeftlich";

      if (formErrorDiv) {
        formErrorDiv.innerHTML = "";
        formErrorDiv.style.display = "none";
      }
      berechneUndZeigeDistanz();
    } catch (e) {
      console.error("Fehler beim Vorbelegen der Felder für neue Fahrt:", e);
    }
  }
  function handleFormularSpeichern() {
    console.log("Speichern/Update Button geklickt. Edit ID:", editId);
    let erfolg = false;
    if (editId !== null) {
      erfolg = fahrtAktualisieren(editId);
    } else {
      erfolg = fahrtSpeichern();
    }
    if (erfolg) {
      // Wenn speichern/update erfolgreich war
      showMiddleColumnView("fahrten"); // Fahrtenliste anzeigen
      console.log(
        "Formular nach erfolgreichem Speichern/Update geschlossen, zeige Fahrtenliste."
      );
    } else {
      // Bei Fehler bleibt das Formular offen
      console.log("Speichern/Update nicht erfolgreich.");
    }
  }
  function starteEditModus(fahrtId) {
    console.log("Starte Edit-Modus für ID:", fahrtId);
    const fahrten = ladeFahrtenAusLocalStorage();
    const fahrt = fahrten.find((f) => f.id.toString() === fahrtId.toString());
    if (!fahrt) {
      showNotification(
        "Fehler: Zu bearbeitender Eintrag nicht gefunden!",
        "error"
      );
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
    if (formErrorDiv) {
      formErrorDiv.innerHTML = "";
      formErrorDiv.style.display = "none";
    }

    showMiddleColumnView("formular"); // Zeige das Formular
    formularDiv.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    datumInput?.focus();
  }
  function abbrechenEditModus(doScroll = true) {
    console.log("Breche Edit ab / Setze Formular zurück.");
    editId = null;
    if (tripEntryForm) tripEntryForm.reset();
    if (speichernButton) speichernButton.textContent = "Fahrt speichern";
    if (cancelEditButton) cancelEditButton.style.display = "none";
    if (formErrorDiv) {
      formErrorDiv.innerHTML = "";
      formErrorDiv.style.display = "none";
    }

    felderFuerNeueFahrtVorbereiten(); // Felder neu befüllen (mit Defaults)
    showMiddleColumnView("fahrten"); // Fahrtenliste anzeigen
    console.log(
      "Edit abgebrochen / Formular zurückgesetzt, zeige Fahrtenliste."
    );
  }
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
    if (!validateFahrt(fahrtData, false)) return false; // Validierung

    let fahrten = ladeFahrtenAusLocalStorage();
    const index = fahrten.findIndex((f) => f.id.toString() === id.toString());
    if (index !== -1) {
      fahrten[index] = fahrtData;
      speichereAlleFahrten(fahrten);
      console.log("Fahrt erfolgreich aktualisiert.");
      showNotification("Änderungen erfolgreich gespeichert!", "success");
      handleApplyFilter(); // Filter anwenden, um Liste neu zu zeichnen (inkl. Paginierung Reset)
      return true;
    } else {
      showNotification("Fehler: Eintrag beim Update nicht gefunden!", "error");
      return false;
    }
  }
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
    if (!validateFahrt(neueFahrt, true)) return false; // Validierung

    console.log("Neue Fahrt validiert:", neueFahrt);
    speichereNeueFahrtImLocalStorage(neueFahrt);
    showNotification("Fahrt erfolgreich gespeichert!", "success");
    felderFuerNeueFahrtVorbereiten(); // Felder für nächste Eingabe vorbereiten
    handleApplyFilter(); // Filter anwenden, um Liste neu zu zeichnen (inkl. Paginierung Reset)
    return true;
  }

  // ========================================================================
  // === 12. Validierungsfunktion (Fahrten) ===
  // ========================================================================
  function validateFahrt(fahrt, checkKmContinuity) {
    console.log(
      "Validiere Fahrt:",
      fahrt,
      "Kontinuität prüfen:",
      checkKmContinuity
    );
    const errorMessages = [];
    if (!formErrorDiv) {
      console.error("Fehler-Div #form-error-message nicht gefunden!");
      return false;
    }
    formErrorDiv.innerHTML = "";
    formErrorDiv.style.display = "none";

    // Pflichtfelder
    if (!fahrt.datum) errorMessages.push("Bitte Datum eingeben.");
    if (!fahrt.startTime) errorMessages.push("Bitte Startzeit eingeben.");
    if (!fahrt.endTime) errorMessages.push("Bitte Endzeit eingeben.");
    if (!fahrt.startOrt) errorMessages.push("Bitte Start-Ort eingeben.");
    if (!fahrt.zielOrt) errorMessages.push("Bitte Ziel-Ort eingeben.");
    if (!fahrt.carId) errorMessages.push("Bitte Fahrzeug auswählen.");
    if (!fahrt.zweck) errorMessages.push("Bitte Zweck auswählen.");

    // KM
    const s = parseFloat(fahrt.kmStart);
    const e = parseFloat(fahrt.kmEnde);
    if (fahrt.kmStart === "" || isNaN(s))
      errorMessages.push("Bitte gültigen Start-Kilometerstand eingeben.");
    if (fahrt.kmEnde === "" || isNaN(e))
      errorMessages.push("Bitte gültigen End-Kilometerstand eingeben.");
    if (!isNaN(s) && !isNaN(e) && e < s)
      errorMessages.push(
        "End-Kilometerstand muss größer oder gleich dem Start-Kilometerstand sein."
      );

    // Zeit
    if (fahrt.startTime && fahrt.endTime && fahrt.endTime < fahrt.startTime)
      errorMessages.push("Endzeit darf nicht vor der Startzeit liegen.");

    // KM Kontinuität (nur bei NEUER Fahrt und wenn bisher keine Fehler)
    if (
      errorMessages.length === 0 &&
      checkKmContinuity &&
      fahrt.carId &&
      !isNaN(s)
    ) {
      const alleFahrten = ladeFahrtenAusLocalStorage();
      let letzteFahrtDesAutos = null;
      const fahrtenDesAutos = alleFahrten
        .filter((f) => f.carId === fahrt.carId)
        .sort((a, b) =>
          (b.datum + "T" + (b.endTime || b.startTime || "00:00")).localeCompare(
            a.datum + "T" + (a.endTime || a.startTime || "00:00")
          )
        ); // Neueste zuerst (Endzeit oder Startzeit)
      if (fahrtenDesAutos.length > 0) {
        letzteFahrtDesAutos = fahrtenDesAutos[0];
        const letzterKM = parseFloat(letzteFahrtDesAutos.kmEnde);
        if (!isNaN(letzterKM) && s < letzterKM) {
          const carName =
            cars.find((c) => c.id.toString() === fahrt.carId.toString())
              ?.name || "Unbekannt";
          errorMessages.push(
            `Kontinuitätsfehler für "${carName}": Start-KM (${s}) ist niedriger als letzter End-KM (${letzterKM}).`
          );
        }
      }
    }

    // Ergebnis
    if (errorMessages.length > 0) {
      formErrorDiv.innerHTML = errorMessages.join("<br>");
      formErrorDiv.style.display = "block";
      formErrorDiv.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
      console.warn("Validierung fehlgeschlagen:", errorMessages);
      return false;
    }
    console.log("Fahrt-Validierung erfolgreich.");
    return true;
  }

  // ========================================================================
  // === 13. Speicher / Ladefunktionen (localStorage) ===
  // ========================================================================
  function speichereAlleFahrten(fahrtenArray) {
    if (!Array.isArray(fahrtenArray)) {
      console.error(
        "speichereAlleFahrten wurde kein Array übergeben!",
        fahrtenArray
      );
      return;
    }
    // Sortieren nach Datum, dann Startzeit, dann KM-Start (aufsteigend für konsistente Reihenfolge)
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
      showNotification("Fehler beim Speichern der Fahrten!", "error");
    }
  }
  function speichereNeueFahrtImLocalStorage(neueFahrt) {
    let fahrten = ladeFahrtenAusLocalStorage();
    if (!fahrten.some((f) => f.id === neueFahrt.id)) {
      fahrten.push(neueFahrt);
      speichereAlleFahrten(fahrten); // Ruft Speichern mit Sortierung auf
    } else {
      console.warn(
        "Versuch, Fahrt mit bereits existierender ID zu speichern:",
        neueFahrt.id
      );
    }
  }
  function ladeFahrtenAusLocalStorage() {
    const rawData = localStorage.getItem("fahrtenbuchEintraege");
    try {
      const parsedData = rawData ? JSON.parse(rawData) : [];
      const result = Array.isArray(parsedData) ? parsedData : [];
      // Ensure IDs exist (for older data potentially without IDs)
      result.forEach((fahrt) => {
        if (!fahrt.id) {
          fahrt.id = Date.now() + Math.random().toString(16).slice(2);
        }
      });
      return result;
    } catch (e) {
      console.error("Fehler beim Parsen der Fahrten aus localStorage:", e);
      return [];
    }
  }

  // ========================================================================
  // === 14. Löschfunktion (Fahrten) ===
  // ========================================================================
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
        handleApplyFilter(); // Anzeige aktualisieren (setzt auch Paginierung zurück)
        console.log(`Fahrt mit ID ${fahrtId} erfolgreich gelöscht.`);
        showNotification("Fahrt erfolgreich gelöscht.", "success");
        if (editId && editId.toString() === fahrtId.toString()) {
          abbrechenEditModus(false); // Formular schließen, falls die gelöschte Fahrt bearbeitet wurde
        }
      } else {
        console.warn("Zu löschende Fahrt-ID nicht gefunden:", fahrtId);
        showNotification("Fehler: Zu löschende Fahrt nicht gefunden!", "error");
      }
    };
    openConfirmModal(
      "Soll dieser Fahrteintrag wirklich gelöscht werden?",
      deleteAction
    );
  }

  // ========================================================================
  // === 15. Anzeige-Funktionen (Fahrtenliste, Zusammenfassung, Distanz) ===
  // ========================================================================
  function displayTrips(tripsToDisplay) {
    if (!fahrtenListeDiv) {
      console.error(
        "FEHLER: Div für Fahrtenliste ('fahrten-liste') nicht gefunden!"
      );
      return;
    }

    // Komplette Liste sortieren (Neueste zuerst für Anzeige)
    tripsToDisplay.sort((a, b) => {
      const dtA = (a.datum || "") + "T" + (a.startTime || "00:00");
      const dtB = (b.datum || "") + "T" + (b.startTime || "00:00");
      if (dtB < dtA) return -1;
      if (dtB > dtA) return 1;
      return parseFloat(a.kmStart || 0) - parseFloat(b.kmStart || 0);
    });
    fullTripListForPagination = tripsToDisplay; // Für Paginierungs-Buttons speichern

    // Paginierungsberechnung
    const totalItems = fullTripListForPagination.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    currentPage = Math.max(
      1,
      Math.min(currentPage, totalPages === 0 ? 1 : totalPages)
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageTrips = fullTripListForPagination.slice(startIndex, endIndex);
    console.log(
      `Zeige Seite ${currentPage}/${totalPages} an (${pageTrips.length} von ${totalItems} Fahrten)`
    );

    // Liste leeren und Fahrten der aktuellen Seite anzeigen
    fahrtenListeDiv.innerHTML = "";
    if (pageTrips.length === 0 && totalItems === 0) {
      fahrtenListeDiv.innerHTML = "<p>Noch keine Fahrten gespeichert.</p>";
    } else if (pageTrips.length === 0 && totalItems > 0) {
      fahrtenListeDiv.innerHTML = "<p>Keine Fahrten auf dieser Seite.</p>";
    } else {
      pageTrips.forEach((fahrt) => {
        fahrtZurListeHinzufuegen(fahrt, true); // An Liste anhängen
      });
    }
    updatePaginationControls(currentPage, totalPages); // Paginierung aktualisieren
  }
  function ladeGespeicherteFahrten() {
    const alleFahrten = ladeFahrtenAusLocalStorage();
    if (!Array.isArray(alleFahrten)) {
      console.error(
        "FEHLER: ladeFahrtenAusLocalStorage hat kein Array zurückgegeben!",
        alleFahrten
      );
      displayTrips([]);
      updateZusammenfassung([]);
      return;
    }
    // Paginierung auf Seite 1 zurücksetzen, wenn alle Fahrten neu geladen werden
    currentPage = 1;
    displayTrips(alleFahrten);
    updateZusammenfassung(alleFahrten);
  }
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

    // HTML-Struktur mit Klassen
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("list-item-header");
    const dateTimeDiv = document.createElement("div");
    dateTimeDiv.classList.add("list-item-date-time");
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

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons-container");
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.title = "Bearbeiten";
    editBtn.classList.add("list-action-button", "edit-btn");
    editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.title = "Löschen";
    deleteBtn.classList.add("list-action-button", "delete-btn");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    buttonsContainer.appendChild(editBtn);
    buttonsContainer.appendChild(deleteBtn);
    headerDiv.appendChild(dateTimeDiv);
    headerDiv.appendChild(buttonsContainer);

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("list-item-details");
    detailsDiv.innerHTML = `
        <div><span class="list-label">Von:</span>${startOrt}</div>
        <div><span class="list-label">Nach:</span>${zielOrt}</div>
        <div><span class="list-label">KM-Start:</span>${kmStart}</div>
        <div><span class="list-label">KM-Ende:</span>${kmEnde}</div>
        <div><span class="list-label">Distanz:</span>${distanz} km</div>
        <div><span class="list-label">Zweck:</span>${zweck}</div>`;

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.classList.add("toggle-details-btn");
    toggleBtn.title = "Details ausblenden";
    toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';

    listItem.appendChild(headerDiv);
    listItem.appendChild(detailsDiv);
    listItem.appendChild(toggleBtn);

    if (append) {
      fahrtenListeDiv.appendChild(listItem);
    } else {
      fahrtenListeDiv.insertBefore(listItem, fahrtenListeDiv.firstChild);
    }
  }
  function updateZusammenfassung(fahrten) {
    if (!zusammenfassungDiv) return;
    if (!Array.isArray(fahrten)) {
      console.error(
        "Fehler: updateZusammenfassung ohne gültiges Array.",
        fahrten
      );
      zusammenfassungDiv.innerHTML = `<h2>Zusammenfassung</h2><p>Fehler.</p><ul><li>-</li></ul>`;
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
  // === 16. Export/Import Funktionen ===
  // ========================================================================
  function exportiereAlsCsv() {
    console.log("CSV Export wird gestartet...");
    const fahrten = ladeFahrtenAusLocalStorage();
    if (fahrten.length === 0) {
      showNotification("Keine Fahrten zum Exportieren vorhanden.", "info");
      return;
    }
    const settings = loadSettings();
    const delimiter = settings.csvDelimiter || ";";
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
      const needsQuotes =
        (delimiter === "," && stringField.includes(",")) ||
        stringField.includes('"') ||
        stringField.includes("\n") ||
        stringField.includes(";");
      if (needsQuotes) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };
    let csvContent = header.map(escapeCsvField).join(delimiter) + "\n"; // Header mit Escaping
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
      csvContent += row.map(escapeCsvField).join(delimiter) + "\n";
    });
    triggerDownload(
      csvContent,
      "text/csv;charset=utf-8;",
      `fahrtenbuch_${getDatumString()}.csv`
    );
  }
  function exportiereAlsJson() {
    console.log("JSON Backup wird gestartet...");
    try {
      const fahrten = ladeFahrtenAusLocalStorage();
      const backupData = {
        version: 2, // Version hinzufügen für zukünftige Migrationen
        fahrten: fahrten,
        autos: cars,
        ausgaben: expenses, // NEU: Ausgaben hinzufügen
      };
      const jsonString = JSON.stringify(backupData, null, 2);
      triggerDownload(
        jsonString,
        "application/json;charset=utf-8;",
        `fahrtenbuch_backup_v2_${getDatumString()}.json`
      );
    } catch (e) {
      console.error("Fehler beim Erstellen des JSON Backups:", e);
      showNotification("Fehler beim Erstellen des Backups.", "error");
    }
  }
  function importiereAusJson(event) {
    console.log("JSON Restore wird gestartet...");
    const file = event.target.files[0];
    if (!file) return;
    const fileInput = event.target;

    const performImport = () => {
      console.log("Bestätigung für Import erhalten.");
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const jsonContent = e.target.result;
          const importData = JSON.parse(jsonContent);
          if (!importData || typeof importData !== "object")
            throw new Error("Ungültiges Format: Kein Objekt.");

          const hasFahrten = Array.isArray(importData.fahrten);
          const hasAutos = Array.isArray(importData.autos);
          const hasAusgaben = Array.isArray(importData.ausgaben); // NEU: Prüfen auf Ausgaben

          if (!hasFahrten && !hasAutos && !hasAusgaben)
            throw new Error(
              "Formatfehler: Weder 'fahrten', 'autos' noch 'ausgaben' gefunden."
            );

          if (hasAutos) {
            cars = importData.autos;
            saveCars();
            console.log(`Import: ${cars.length} Fahrzeuge geladen.`);
          } else {
            console.log("Import: Kein 'autos'-Array gefunden.");
          }

          if (hasFahrten) {
            speichereAlleFahrten(importData.fahrten);
            console.log(
              `Import: ${importData.fahrten.length} Fahrten geladen.`
            );
          } else {
            console.log("Import: Kein 'fahrten'-Array gefunden.");
          }

          // NEU: Ausgaben importieren
          if (hasAusgaben) {
            expenses = importData.ausgaben;
            saveExpenses();
            console.log(`Import: ${expenses.length} Ausgaben geladen.`);
          } else {
            console.log("Import: Kein 'ausgaben'-Array gefunden.");
            expenses = [];
            saveExpenses();
          } // Leere Ausgaben speichern, falls nicht vorhanden

          initialisiereApp(); // UI komplett neu initialisieren
          showNotification("Import erfolgreich abgeschlossen!", "success");
        } catch (err) {
          console.error("Fehler beim JSON Import:", err);
          showNotification(
            `Import fehlgeschlagen: ${err.message}`,
            "error",
            8000
          );
        } finally {
          if (fileInput) fileInput.value = null;
        }
      };
      reader.onerror = function () {
        console.error("Fehler beim Lesen der Datei:", reader.error);
        showNotification("Fehler beim Lesen der ausgewählten Datei.", "error");
        if (fileInput) fileInput.value = null;
      };
      reader.readAsText(file);
    };
    openConfirmModal(
      `ACHTUNG:\nAlle aktuell gespeicherten Daten (Fahrten, Fahrzeuge, Ausgaben) werden durch den Inhalt der Datei "${file.name}" ersetzt.\n\nFortfahren?`,
      performImport
    );
  }
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
      showNotification(
        "Automatischer Download wird von Ihrem Browser nicht unterstützt.",
        "info"
      );
    }
  }

  // ========================================================================
  // === 17. Event Listener Setup ===
  // ========================================================================
  function setupEventListeners() {
    console.log("Initialisiere Event Listeners...");

    // --- Formular (Fahrten) ---
    speichernButton?.addEventListener("click", handleFormularSpeichern);
    cancelEditButton?.addEventListener("click", () => abbrechenEditModus(true));
    kmStartInput?.addEventListener("input", berechneUndZeigeDistanz);
    kmEndeInput?.addEventListener("input", berechneUndZeigeDistanz);

    // --- Listen (Event Delegation) ---
    fahrtenListeDiv?.addEventListener("click", handleListClick); // Fahrtenliste
    carListUl?.addEventListener("click", handleCarListClick); // Fahrzeugliste (rechte Spalte)
    ausgabenListeDiv?.addEventListener("click", handleExpenseListClick); // NEU: Ausgabenliste

    // --- Filter ---
    applyFilterButton?.addEventListener("click", handleApplyFilter);
    resetFilterButton?.addEventListener("click", handleResetFilter);
    toggleFilterButton?.addEventListener("click", handleToggleFilterBox);

    // --- Sidebar & Header ---
    themeToggleButton?.addEventListener("click", handleThemeToggle);
    sidebarToggleButton?.addEventListener("click", handleSidebarToggle);
    addNewButton?.addEventListener("click", handleAddNewClick); // "+ Neue Fahrt"
    addCarMenuButton?.addEventListener("click", openAddCarModal); // "+ Neues Fahrzeug"
    addExpenseMenuButton?.addEventListener("click", openAddExpenseModal); // "+ Neue Ausgabe"
    showExpensesButton?.addEventListener("click", handleShowExpenses); // "Ausgaben anzeigen"
    showReportsButton?.addEventListener("click", handleShowReports); // NEU: "Berichte anzeigen"
    settingsMenuButton?.addEventListener("click", openSettingsModal); // "Einstellungen"
    exportButton?.addEventListener("click", exportiereAlsCsv); // "CSV Export"
    exportJsonButton?.addEventListener("click", exportiereAlsJson); // "Backup"
    importJsonButton?.addEventListener("click", () =>
      importJsonFileInput?.click()
    ); // "Restore"
    importJsonFileInput?.addEventListener("change", importiereAusJson);

    // --- Modals ---
    // Fahrzeug-Modal
    modalCarCloseButton?.addEventListener("click", closeAddCarModal);
    modalCancelCarButton?.addEventListener("click", closeAddCarModal);
    modalSaveCarButton?.addEventListener("click", handleModalSaveCar);
    addCarModal?.addEventListener("click", (event) => {
      if (event.target === addCarModal) closeAddCarModal();
    });
    // Ausgaben-Modal
    modalExpenseCloseButton?.addEventListener("click", closeAddExpenseModal);
    modalCancelExpenseButton?.addEventListener("click", closeAddExpenseModal);
    modalSaveExpenseButton?.addEventListener("click", handleSaveExpense);
    addExpenseModal?.addEventListener("click", (event) => {
      if (event.target === addExpenseModal) closeAddExpenseModal();
    });
    // Bestätigungs-Modal
    confirmModalConfirmBtn?.addEventListener("click", () => {
      if (typeof confirmModalCallback === "function") confirmModalCallback();
      closeConfirmModal();
    });
    confirmModalCancelBtn?.addEventListener("click", closeConfirmModal);
    confirmModalCloseBtn?.addEventListener("click", closeConfirmModal);
    confirmModal?.addEventListener("click", (event) => {
      if (event.target === confirmModal) closeConfirmModal();
    });
    // Einstellungs-Modal
    settingsModalCloseBtn?.addEventListener("click", closeSettingsModal);
    settingsModalCancelBtn?.addEventListener("click", closeSettingsModal);
    settingsModalSaveBtn?.addEventListener("click", handleSaveSettings);
    settingDeleteAllBtn?.addEventListener("click", handleDeleteAllData);
    settingsModal?.addEventListener("click", (event) => {
      if (event.target === settingsModal) closeSettingsModal();
    });

    // --- Paginierung (Fahrten) ---
    prevPageBtn?.addEventListener("click", handlePrevPage);
    nextPageBtn?.addEventListener("click", handleNextPage);

    console.log("Event Listeners initialisiert.");
  }

  // ========================================================================
  // === 18. Handlers für UI-Aktionen ===
  // ========================================================================
  function handleAddNewClick() {
    console.log("Button '+ Neue Fahrt' geklickt.");
    if (!formularDiv) return;
    if (formularDiv.classList.contains("form-visible") && editId === null) {
      showMiddleColumnView("fahrten");
      console.log("Fahrten-Formular geschlossen, zeige Fahrtenliste.");
    } else {
      abbrechenEditModus(false);
      showMiddleColumnView("formular");
      console.log("Fahrten-Formular für neue Fahrt geöffnet.");
      datumInput?.focus();
      formularDiv.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    }
  }
  function handleListClick(event) {
    const fahrtElement = event.target.closest("[data-fahrt-id]");
    if (!fahrtElement) return;
    const fahrtId = fahrtElement.getAttribute("data-fahrt-id");
    if (event.target.closest(".edit-btn")) {
      starteEditModus(fahrtId);
      return;
    }
    if (event.target.closest(".delete-btn")) {
      fahrtLoeschen(fahrtId);
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
  function handleCarListClick(event) {
    const deleteButton = event.target.closest(".delete-car-btn");
    if (deleteButton) {
      const carIdToDelete = deleteButton.dataset.carId;
      console.log(
        "Prüfe, ob Fahrzeug gelöscht werden kann, ID:",
        carIdToDelete
      );
      const fahrten = ladeFahrtenAusLocalStorage();
      const isCarUsedInTrips = fahrten.some(
        (fahrt) => fahrt.carId === carIdToDelete
      );
      const isCarUsedInExpenses = expenses.some(
        (expense) => expense.vehicleId === carIdToDelete
      ); // Prüfung hinzugefügt
      if (isCarUsedInTrips || isCarUsedInExpenses) {
        console.warn("Löschen verhindert: Fahrzeug wird noch verwendet.");
        let message = "Fahrzeug kann nicht gelöscht werden, da es noch in ";
        if (isCarUsedInTrips && isCarUsedInExpenses)
          message += "Fahrten und Ausgaben";
        else if (isCarUsedInTrips) message += "Fahrten";
        else message += "Ausgaben";
        message += " verwendet wird.";
        showNotification(message, "error", 6000);
      } else {
        console.log("Fahrzeug wird nicht verwendet, zeige Bestätigungs-Modal.");
        const deleteCarAction = () => {
          // --- Tatsächliche Löschlogik ---
          console.log("Bestätigung erhalten, lösche Fahrzeug:", carIdToDelete);
          const index = cars.findIndex(
            (car) => car.id.toString() === carIdToDelete.toString()
          );
          if (index !== -1) {
            if (
              editCarId &&
              editCarId.toString() === carIdToDelete.toString()
            ) {
              editCarId = null;
              closeAddCarModal();
            }
            cars.splice(index, 1);
            saveCars();
            displayCarList();
            populateCarDropdown();
            populateFilterCarDropdown();
            populateExpenseVehicleDropdown();
            console.log("Fahrzeug erfolgreich gelöscht und UI aktualisiert.");
            showNotification("Fahrzeug erfolgreich gelöscht.", "success");
          } else {
            console.warn(
              "Zu löschendes Fahrzeug nicht im Array gefunden:",
              carIdToDelete
            );
            showNotification(
              "Fehler: Zu löschendes Fahrzeug nicht gefunden!",
              "error"
            );
          }
          // --- Ende Löschlogik ---
        };
        openConfirmModal(
          "Soll dieses Fahrzeug wirklich endgültig gelöscht werden?",
          deleteCarAction
        );
      }
      return;
    }
    const editButton = event.target.closest(".edit-car-btn");
    if (editButton) {
      openEditCarModal(editButton.dataset.carId);
      return;
    }
  }

  /**
   * NEU: Handler für Klicks innerhalb der Ausgabenliste (delegiert an Buttons).
   * @param {Event} event - Das Klick-Event.
   */
  function handleExpenseListClick(event) {
    const expenseElement = event.target.closest("[data-expense-id]");
    if (!expenseElement) return; // Klick war nicht innerhalb eines Items

    const expenseId = expenseElement.getAttribute("data-expense-id");

    // Prüfen, ob auf Edit-Button geklickt wurde
    if (event.target.closest(".edit-expense-btn")) {
      console.log("Edit-Button für Ausgabe geklickt, ID:", expenseId);
      startEditExpenseMode(expenseId); // Ruft die neue Edit-Funktion auf
      return;
    }

    // Prüfen, ob auf Delete-Button geklickt wurde
    if (event.target.closest(".delete-expense-btn")) {
      console.log("Delete-Button für Ausgabe geklickt, ID:", expenseId);
      deleteExpense(expenseId); // Ruft die neue Löschfunktion auf
      return;
    }
  }

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

    if (selectedCarId)
      gefilterteFahrten = gefilterteFahrten.filter(
        (fahrt) => fahrt.carId === selectedCarId
      );
    if (selectedPurpose)
      gefilterteFahrten = gefilterteFahrten.filter(
        (fahrt) => fahrt.zweck === selectedPurpose
      );
    if (startDate)
      gefilterteFahrten = gefilterteFahrten.filter(
        (fahrt) => fahrt.datum >= startDate
      );
    if (endDate)
      gefilterteFahrten = gefilterteFahrten.filter(
        (fahrt) => fahrt.datum <= endDate
      );

    currentPage = 1; // Filterung setzt Paginierung zurück
    showMiddleColumnView("fahrten"); // Sicherstellen, dass Fahrtenliste sichtbar ist
    displayTrips(gefilterteFahrten); // Zeigt die gefilterte Liste an
    updateZusammenfassung(gefilterteFahrten); // Aktualisiert Zusammenfassung für gefilterte Liste
  }
  function handleResetFilter() {
    console.log("Button 'Filter zurücksetzen' geklickt.");
    filterCarSelect.value = "";
    filterPurposeSelect.value = "";
    filterDateStartInput.value = "";
    filterDateEndInput.value = "";
    console.log("Filterfelder zurückgesetzt.");

    currentPage = 1; // Paginierung zurücksetzen
    const alleFahrten = ladeFahrtenAusLocalStorage();
    showMiddleColumnView("fahrten"); // Sicherstellen, dass Fahrtenliste sichtbar ist
    displayTrips(alleFahrten); // Zeigt alle Fahrten an
    updateZusammenfassung(alleFahrten); // Aktualisiert Zusammenfassung für alle Fahrten
  }
  function handleToggleFilterBox() {
    if (!filterControlsDiv) return;
    const isVisible = filterControlsDiv.classList.toggle("filter-visible");
    const icon = toggleFilterButton?.querySelector("i.fa-solid");
    if (isVisible) {
      console.log("Filter-Box wird angezeigt.");
      toggleFilterButton?.setAttribute("title", "Filter ausblenden");
      if (icon) icon.classList.replace("fa-filter", "fa-filter-circle-xmark");
    } else {
      console.log("Filter-Box wird versteckt.");
      toggleFilterButton?.setAttribute("title", "Filter einblenden");
      if (icon) icon.classList.replace("fa-filter-circle-xmark", "fa-filter");
    }
  }
  function handlePrevPage() {
    if (currentPage > 1) {
      currentPage--;
      displayTrips(fullTripListForPagination); // Zeige vorherige Seite der zuletzt angezeigten Liste
    }
  }
  function handleNextPage() {
    const totalPages = Math.ceil(
      fullTripListForPagination.length / itemsPerPage
    );
    if (currentPage < totalPages) {
      currentPage++;
      displayTrips(fullTripListForPagination); // Zeige nächste Seite der zuletzt angezeigten Liste
    }
  }
  function handleShowExpenses() {
    console.log("Button 'Ausgaben anzeigen' geklickt.");
    // Blende andere Ansichten aus und zeige die Ausgabenliste
    // Die Funktion displayExpenses() wird innerhalb von showMiddleColumnView aufgerufen
    showMiddleColumnView("ausgaben");
  }
  /**
   * NEU: Handler für Klick auf "Berichte anzeigen" im Menü.
   */
  function handleShowReports() {
    console.log("Button 'Berichte anzeigen' geklickt.");
    // Blende andere Ansichten aus und zeige die Berichte
    // Die Funktion displayStatistics() wird innerhalb von showMiddleColumnView aufgerufen
    showMiddleColumnView("berichte");
  }
  // ========================================================================
  // === 19. Initialisierung der App ===
  // ========================================================================
  function initialisiereApp() {
    console.log("Initialisiere App...");
    // Prüfung auf Elemente ist optional, aber hilfreich
    // ...
    loadCars();
    loadExpenses(); // Ausgaben laden
    const alleFahrten = ladeFahrtenAusLocalStorage();
    displayCarList();
    populateCarDropdown();
    populateFilterCarDropdown();
    loadAndSetInitialTheme();
    loadAndSetInitialSidebarState();
    setupEventListeners();
    showMiddleColumnView("fahrten"); // Standardansicht: Fahrten
    currentPage = 1;
    displayTrips(alleFahrten);
    updateZusammenfassung(alleFahrten);
    felderFuerNeueFahrtVorbereiten();
    console.log("App initialisiert und bereit.");
  }

  // ========================================================================
  // === 20. App starten ===
  // ========================================================================
  initialisiereApp();
}); // Ende DOMContentLoaded Listener
