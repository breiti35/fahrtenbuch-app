# 🚗 Fahrtenbuch Web App

Eine mit HTML, CSS und JavaScript erstellte Webanwendung zur Verwaltung von Fahrtenbüchern. Speichert Daten lokal im Browser (`localStorage`). Bietet eine moderne Oberfläche mit Dark Mode und verschiedenen Komfortfunktionen.

**Demo:** [[Link zu deiner GitHub Pages Seite](https://breiti35.github.io/fahrtenbuch-app/fahrtenbuch.html)]

---

## Entwicklung 🧑‍💻

Dieses Projekt wurde mit Unterstützung von Gemini, einer KI von Google, entwickelt.

---

## Funktionen ✨

- **Fahrten:**
  - Erfassen, Bearbeiten, Löschen (Datum, Zeit, Ort, KM, Zweck, Fahrzeug).
  - Automatische Distanzberechnung.
  - Sortierte Listenansicht (Neueste zuerst) mit Paginierung.
  - Einklappbare Detailansicht pro Fahrt.
  - Filterung nach Fahrzeug, Zweck und Zeitraum.
- **Fahrzeuge:**
  - Hinzufügen, Bearbeiten, Löschen über Modal-Dialog.
  - Verhindert doppelte Kennzeichen und Löschen bei Nutzung (in Fahrten/Ausgaben).
  - Übersichtliche Liste mit Aktionen.
- **Ausgabenverwaltung:**
  - Erfassen, Bearbeiten, Löschen von Ausgaben (Tanken, Reparatur, Versicherung etc.) über Modal-Dialog.
  - Anzeige der Ausgaben in einer eigenen, sortierten Liste.
- **Berichte & Statistiken:**
  - Eigener "Berichte"-Bereich zur Anzeige von Fahrzeugstatistiken.
  - Berechnung und Anzeige von Gesamtdistanz, Gesamtkosten, Kosten/km pro Fahrzeug.
  - Aufschlüsselung nach Jahr und Monat für Distanz und Kosten.
  - Berechnung und Anzeige von durchschnittlicher Distanz/Kosten pro Monat (bezogen auf aktive Monate) pro Jahr.
  - Monatsdetails in Jahresübersicht einklappbar für bessere Übersicht.
- **Grafische Diagramme (NEU):**
  - Eigener "Diagramme"-Bereich zur Visualisierung von Statistiken.
  - Anzeige von Kilometer/Monat und Kosten/Monat (Balkendiagramme).
  - Anzeige der Kostenverteilung nach Typ (Ringdiagramm).
  - Interaktive Auswahl von Fahrzeug und Jahr.
  - Basiert auf Chart.js.
- **Ansicht & Bedienung:**
  - Responsives 3-Spalten-Layout.
  - Einklappbare Sidebar und Filterbox.
  - Umschaltbare Hauptansicht (Fahrten, Ausgaben, Berichte, **Diagramme**). _(Diagramme hinzugefügt)_
  * Dark Mode (automatisch/manuell).
  * Dynamische Kilometer-Zusammenfassung (basiert auf Filter).
  * Verbesserte Nutzerführung:
    - Inline-Validierungsfehler im Formular.
    - Benutzerdefinierter Dialog für Löschbestätigungen.
    - Nicht-blockierende Benachrichtigungen (Erfolg/Fehler) mit Fortschrittsbalken.
  * Verbesserte Darstellung der Statistik-Karten.
- **Daten:**
  - Lokale Speicherung (`localStorage`).
  - Export als CSV (Trennzeichen wählbar) und JSON (Backup, inkl. Ausgaben).
  - Import aus JSON-Backup (mit Bestätigung, inkl. Ausgaben).
- **Einstellungen:**
  - Standardwerte (Fzg./Zweck) festlegen.
  - CSV-Trennzeichen wählen.
  - Alle Daten löschen (via Modal mit Bestätigung, inkl. Ausgaben).
- **Validierung:**
  - Prüfung von Pflichtfeldern, Zeiten, KM-Ständen (Fahrten & Ausgaben).
  - KM-Kontinuitätsprüfung pro Fahrzeug bei neuen Fahrten.
  - Prüfung auf doppelte Kennzeichen.
- **PWA (Progressive Web App):**
  - Installierbar auf Desktop (und Mobile).
  - Grundlegende Offline-Fähigkeit (App-Shell Caching).

_(Weitere Features können folgen)_
