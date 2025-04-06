# Fahrtenbuch Web App

Eine via Browser im `localStorage` speichernde Webanwendung zur Verwaltung von Fahrtenbüchern, erstellt mit HTML, CSS und JavaScript.

**Demo:** [https://breiti35.github.io/fahrtenbuch-app/fahrtenbuch.html] *(<- Füge hier nochmal deinen Link ein!)*

## Entwicklung

Dieses Projekt wurde mit Unterstützung von Gemini, einer KI von Google, entwickelt.

## Funktionen

* **Fahrten:** Erfassen, Bearbeiten und Löschen von Fahrten mit:
    * Datum, Start-/Endzeit
    * Start-/End-Ort
    * Start-/End-Kilometerstand
    * Automatischer Distanzberechnung im Formular
    * Zweck der Fahrt (Geschäftlich, Privat, Arbeitsweg)
    * Fahrzeugauswahl
* **Fahrzeugverwaltung:** Anlegen von mehreren Fahrzeugen (Name/Modell, Kennzeichen).
* **Ansicht:**
    * Übersichtliche Liste der Fahrten (sortiert nach Datum/Zeit).
    * Einklappbare Detailansicht pro Fahrt.
    * Anzeige des verwendeten Fahrzeugs pro Fahrt.
    * Dynamische Zusammenfassung der Kilometer nach Zweck.
* **Daten:**
    * Speicherung aller Daten lokal im Browser (`localStorage`).
    * Export der Fahrtenliste als CSV-Datei.
    * Backup der gesamten Daten (Fahrten & Fahrzeuge) als JSON-Datei.
    * Wiederherstellung der Daten aus einer JSON-Backup-Datei.
* **Bedienung & Design:**
    * Responsives 3-Spalten-Layout.
    * Aufgeräumte Oberfläche mit Icons und modernem Styling.
    * Einklappbares Formular für neue/zu bearbeitende Einträge.
* **Validierung:** Überprüfung von Pflichtfeldern, Kilometerständen und Zeiten.

*(Weitere Features können folgen)*