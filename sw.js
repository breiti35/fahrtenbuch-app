// sw.js - Service Worker für Fahrtenbuch PWA

// Name des Caches (Versionierung ist wichtig bei Updates!)
const CACHE_NAME = "fahrtenbuch-cache-v1";

// Dateien, die für die App-Shell benötigt werden und gecacht werden sollen
const FILES_TO_CACHE = [
  "/", // Startseite (falls abweichend von fahrtenbuch.html)
  "fahrtenbuch.html", // Haupt-HTML-Datei
  "style.css", // Haupt-CSS-Datei
  "script.js", // Haupt-JavaScript-Datei
  // Optional: Füge hier Pfade zu Icons oder anderen wichtigen Assets hinzu,
  // die immer offline verfügbar sein sollen.
  // z.B. 'images/icon-192.png', 'images/icon-512.png'
  // Font Awesome wird per CDN geladen und ist offline nicht verfügbar,
  // es sei denn, du hostest die Dateien selbst und fügst sie hier hinzu.
];

// Event Listener: Installation des Service Workers
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installiere...");
  // Warte, bis der Cache geöffnet und alle Dateien hinzugefügt wurden
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching App Shell");
      // Füge alle definierten Dateien zum Cache hinzu
      // 'addAll' ist atomar: Wenn eine Datei fehlschlägt, schlägt alles fehl.
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Event Listener: Aktivierung des Service Workers
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Aktiviere...");
  // Lösche alte Caches, die nicht mehr benötigt werden
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // Wenn der Cache-Name nicht der aktuelle ist, lösche ihn
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Lösche alten Cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Sorge dafür, dass der neue Service Worker sofort die Kontrolle übernimmt
  return self.clients.claim();
});

// Event Listener: Abfangen von Netzwerk-Anfragen (Fetch)
self.addEventListener("fetch", (event) => {
  console.log("[Service Worker] Fetch:", event.request.url);

  // Wir wenden eine "Cache First"-Strategie für unsere App-Shell-Dateien an.
  // Für andere Anfragen (z.B. API-Calls später) gehen wir direkt zum Netzwerk.

  // Prüfe, ob die Anfrage eine der zu cachenden Dateien ist
  // (Einfache Prüfung anhand der URL - könnte verfeinert werden)
  const isAppShellRequest = FILES_TO_CACHE.some((fileUrl) =>
    event.request.url.endsWith(fileUrl)
  );

  if (isAppShellRequest) {
    // Cache First Strategie
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Wenn im Cache gefunden, gib die gecachte Antwort zurück
        if (response) {
          console.log("[Service Worker] Antwort aus Cache:", event.request.url);
          return response;
        }
        // Wenn nicht im Cache, gehe zum Netzwerk
        console.log(
          "[Service Worker] Nicht im Cache, gehe zum Netzwerk:",
          event.request.url
        );
        return fetch(event.request);
      })
    );
  } else {
    // Für alle anderen Anfragen (z.B. API, externe Ressourcen): Nur Netzwerk
    // console.log('[Service Worker] Nicht-AppShell-Anfrage, nur Netzwerk:', event.request.url);
    // Standard-Netzwerkverhalten (kein event.respondWith)
    return; // Lässt den Browser die Anfrage normal behandeln
  }
});
