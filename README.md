# 🚗 Fahrtenbuch Web App

Eine mit HTML, CSS und JavaScript erstellte Webanwendung zur Verwaltung von Fahrtenbüchern. Speichert Daten lokal im Browser (`localStorage`). Bietet eine moderne Oberfläche mit Dark Mode und verschiedenen Komfortfunktionen.

**Demo:** [[Link zu deiner GitHub Pages Seite](https://breiti35.github.io/fahrtenbuch-app/fahrtenbuch.html)] 

---

## Entwicklung 🧑‍💻

Dieses Projekt wurde mit Unterstützung von Gemini, einer KI von Google, entwickelt.

---

## Funktionen ✨

-   **Fahrten:**
    -   Erfassen, Bearbeiten, Löschen (Datum, Zeit, Ort, KM, Zweck, Fahrzeug).
    -   Automatische Distanzberechnung.
    -   Sortierte Listenansicht (Neueste zuerst) mit Paginierung.
    -   Einklappbare Detailansicht pro Fahrt.
    -   Filterung nach Fahrzeug, Zweck und Zeitraum.
-   **Fahrzeuge:**
    -   Hinzufügen, Bearbeiten, Löschen über Modal-Dialog.
    -   Verhindert doppelte Kennzeichen und Löschen bei Nutzung (in Fahrten/Ausgaben).
    -   Übersichtliche Liste mit Aktionen.
-   **Ausgabenverwaltung (NEU):**
    -   Erfassen, Bearbeiten, Löschen von Ausgaben (Tanken, Reparatur, Versicherung etc.) über Modal-Dialog.
    -   Anzeige der Ausgaben in einer eigenen, sortierten Liste.
-   **Ansicht & Bedienung:**
    -   Responsives 3-Spalten-Layout.
    -   Einklappbare Sidebar und Filterbox.
    -   Umschaltbare Hauptansicht (Fahrten, Ausgaben, Formular) (NEU).
    * Dark Mode (automatisch/manuell).
    * Dynamische Kilometer-Zusammenfassung (basiert auf Filter).
    * Verbesserte Nutzerführung:
        * Inline-Validierungsfehler im Formular.
        * Benutzerdefinierter Dialog für Löschbestätigungen.
        * Nicht-blockierende Benachrichtigungen (Erfolg/Fehler) mit Fortschrittsbalken.
-   **Daten:**
    * Lokale Speicherung (`localStorage`).
    * Export als CSV (Trennzeichen wählbar) und JSON (Backup, inkl. Ausgaben).
    * Import aus JSON-Backup (mit Bestätigung, inkl. Ausgaben).
-   **Einstellungen:**
    * Standardwerte (Fzg./Zweck) festlegen.
    * CSV-Trennzeichen wählen.
    * Alle Daten löschen (via Modal mit Bestätigung, inkl. Ausgaben).
-   **Validierung:**
    * Prüfung von Pflichtfeldern, Zeiten, KM-Ständen (Fahrten & Ausgaben).
    * KM-Kontinuitätsprüfung pro Fahrzeug bei neuen Fahrten.
    * Prüfung auf doppelte Kennzeichen.
-   **PWA (Progressive Web App) (NEU):**
    * Installierbar auf Desktop (und Mobile).
    * Grundlegende Offline-Fähigkeit (App-Shell Caching).

_(Weitere Features können folgen)_
