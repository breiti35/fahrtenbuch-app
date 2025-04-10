# 🚗 Fahrtenbuch Web App

**EN:** A web application for managing logbooks, saving data locally in the browser via `localStorage`, built with HTML, CSS, and JavaScript. Features a redesigned collapsible sidebar and allows adding, editing, and deleting vehicles via a modal dialog.

**DE:** Eine via Browser im `localStorage` speichernde Webanwendung zur Verwaltung von Fahrtenbüchern, erstellt mit HTML, CSS und JavaScript. Mit neu gestalteter, einklappbarer Seitenleiste und der Möglichkeit, Fahrzeuge über einen Modal-Dialog hinzuzufügen, zu bearbeiten und zu löschen.

**Demo:** [[Link zu deiner GitHub Pages Seite](https://breiti35.github.io/fahrtenbuch-app/fahrtenbuch.html)] 

---

## Entwicklung / Development 🧑‍💻

**EN:** This project was developed with assistance from Gemini, an AI from Google.
**DE:** Dieses Projekt wurde mit Unterstützung von Gemini, einer KI von Google, entwickelt.

---

## Funktionen / Features ✨

* **📝 Fahrten / Trips:**
    * **EN:** Add, edit, and delete trips including: Date, Start/End Time, Start/End Location, Start/End Odometer reading.
    * **EN:** Automatic distance calculation in the form.
    * **EN:** Purpose of the trip (Business, Private, Commute).
    * **EN:** Car selection for each trip.
    * **DE:** Erfassen, Bearbeiten und Löschen von Fahrten mit: Datum, Start-/Endzeit, Start-/End-Ort, Start-/End-Kilometerstand.
    * **DE:** Automatischer Distanzberechnung im Formular.
    * **DE:** Zweck der Fahrt (Geschäftlich, Privat, Arbeitsweg).
    * **DE:** Fahrzeugauswahl pro Fahrt.

* **🚙 Fahrzeugverwaltung / Car Management:**
    * **EN:** Add, **edit, and delete** multiple vehicles (Name/Model, License Plate) via a **modal dialog**.
    * **EN:** Display list of added vehicles with **icons** and action buttons.
    * **EN:** Prevents adding vehicles with duplicate license plates.
    * **DE:** Anlegen, **Bearbeiten und Löschen** von mehreren Fahrzeugen (Name/Modell, Kennzeichen) über einen **Modal-Dialog**.
    * **DE:** Anzeige der angelegten Fahrzeuge in einer Liste mit **Icons** und Aktions-Buttons.
    * **DE:** Verhindert das Hinzufügen von Fahrzeugen mit doppeltem Kennzeichen.

* **📊 Ansicht & Bedienung / View & Usability:**
    * **EN:** Clear list of trips (sorted by date/time).
    * **EN:** Collapsible detail view per trip (toggle button).
    * **EN:** Display of the used car per trip.
    * **EN:** Dynamic summary of kilometers by purpose.
    * **EN:** Responsive 3-column layout where the **middle column adjusts** its width.
    * **EN:** Redesigned **collapsible sidebar** with internal toggle button.
    * **EN:** Clean user interface with icons (Font Awesome) and modern styling.
    * **EN:** Collapsible form for adding/editing trips.
    * **EN:** Dark Mode (automatic detection or manual toggle via header button).
    * **DE:** Übersichtliche Liste der Fahrten (sortiert nach Datum/Zeit).
    * **DE:** Einklappbare Detailansicht pro Fahrt (Umschalt-Button).
    * **DE:** Anzeige des verwendeten Fahrzeugs pro Fahrt.
    * **DE:** Dynamische Zusammenfassung der Kilometer nach Zweck.
    * **DE:** Responsives 3-Spalten-Layout, bei dem sich die **mittlere Spalte anpasst**.
    * **DE:** Neu gestaltete, **einklappbare Seitenleiste** mit internem Umschalt-Button.
    * **DE:** Aufgeräumte Oberfläche mit Icons (Font Awesome) und modernem Styling.
    * **DE:** Einklappbares Formular für neue/zu bearbeitende Fahrten.
    * **DE:** Dark Mode (automatische Erkennung oder manueller Wechsel über Button in Kopfleiste).

* **💾 Daten / Data:**
    * **EN:** All data stored locally in the browser (`localStorage`).
    * **EN:** Export trip list as a CSV file.
    * **EN:** Backup all data (trips & cars) as a JSON file.
    * **EN:** Restore data from a JSON backup file.
    * **DE:** Speicherung aller Daten lokal im Browser (`localStorage`).
    * **DE:** Export der Fahrtenliste als CSV-Datei.
    * **DE:** Backup der gesamten Daten (Fahrten & Fahrzeuge) als JSON-Datei.
    * **DE:** Wiederherstellung der Daten aus einer JSON-Backup-Datei.

* **✔️ Validierung / Validation:**
    * **EN:** Checks for required fields, times, and odometer readings (incl. **per-car continuity check** for new trips).
    * **EN:** Checks for duplicate license plates when adding/editing vehicles.
    * **DE:** Überprüfung von Pflichtfeldern, Zeiten und Kilometerständen (inkl. **Prüfung der Kontinuität pro Fahrzeug** bei neuen Fahrten).
    * **DE:** Prüfung auf doppelte Kennzeichen beim Hinzufügen/Bearbeiten von Fahrzeugen.

*(EN: More features may follow)*
*(DE: Weitere Features können folgen)*