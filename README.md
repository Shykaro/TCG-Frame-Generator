# TCG-Frame-Generator
A generator to calculate custom picture frame sizes and cutout passepartouts for an individual number and size of TCG Cards


# Card Atelier – TCG-Rahmenplaner

Statische Anwendung ohne Build-Schritt oder externe Abhängigkeiten. `index.html`, `style.css` und `app.js` gemeinsam im Browser oder auf einem statischen Webserver öffnen.

## GitHub Pages

Die drei Dateien und `.nojekyll` in das Root-Verzeichnis des Repositorys übernehmen. Unter **Settings → Pages → Build and deployment → Deploy from a branch** den gewünschten Branch und **/(root)** auswählen. Die Anwendung liegt bereits im Root-Verzeichnis dieses Repositorys. Nach dem Commit und Push kann GitHub Pages direkt daraus veröffentlichen.

## Bedienung

Karten in beliebiger Anzahl hinzufügen; Formate und Einzelmaße sind editierbar. Karten ziehen oder per X/Y positionieren. Raster, Abstand, Mindestrand, Zentrierung und horizontale/vertikale Spiegelung unterstützen symmetrische Anordnungen. Pfeiltasten bewegen die fokussierte Karte um 1 mm, Shift um 10 mm. Rückgängig hält 50 Schritte vor.

„Rahmen passend berechnen“ ergibt das minimale Innenmaß inklusive Rand. „Nächstes Standardformat“ sucht das kleinste passende Format aus einer hinterlegten Liste, inklusive Querformat. Die Liste ist keine Verfügbarkeitsgarantie. Rahmenprofile sind illustrative Vorschauen; die tatsächliche Leistenbreite, Falz, nutzbare Sichtfläche und Tiefe beim Anbieter prüfen. Slab-Maße unterscheiden sich je nach Anbieter.

Die SVG-Schablone hat physische Millimetermaße und markiert Kartenumrisse. Sie eignet sich als Platzierungshilfe und als Ausgangspunkt für einen Passepartout-Zuschnitt. Für ein haltendes Passepartout müssen Ausschnitte passend zur gewünschten Überdeckung manuell kleiner gewählt werden. Druck/PDF öffnet ein eigenes Druckfenster im Gesamtformat. Immer 100 % / Originalgröße einstellen und Maße am Ausdruck überprüfen. Ein automatischer A4-Kachelexport ist nicht enthalten; dafür Posterdruck in einem geeigneten externen Druckprogramm verwenden.

Projekte werden lokal im Browser gespeichert und als JSON exportiert/importiert. Es gibt keinen Server und keine Uploads. Die Anzahl ist nicht künstlich limitiert; die Browserleistung setzt die praktische Grenze.
