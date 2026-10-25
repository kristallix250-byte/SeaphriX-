# Website-Prüfung vom 25. Oktober 2026

Stand: Änderungsvorschlag, keine Produktionsfreigabe. Ausgangspunkt: main bei
1432b78888e3584d65b0b77d18efc5ef5e6d333f. Bestehende Backend-PRs werden nicht verändert.

## Belegter technischer Stand

- `netlify.toml` veröffentlicht das Projektverzeichnis. Das statische Formular
  `anfrage` enthält `data-netlify`, `form-name` und das Honeypot-Feld `bot-field`.
  Das ist eine Netlify-Vorbereitung, kein Nachweis für einen aktiven Deploy.
- Im Hauptzweig fehlen Hostinger-Konfiguration, Domainzuordnung/CNAME und ein
  eigener Formularserver. GitHub weist für den Hauptcommit keine Commit-Statuschecks aus.
- Die geprüfte Hostinger-Mitteilung vom 22. Oktober bestätigt die Wiederherstellung
  von Cloud Startup Hosting. Sie nennt weder dieses Repository noch die Zieldomain.
  Die geprüften Netlify-Mitteilungen belegen ein bestehendes Team, aber keine
  Zuordnung dieser Unternehmenswebsite. Private Konten- und Vertragsdetails werden
  hier bewusst nicht dokumentiert.
- Die Suche nach der exakten Zieldomain in den verfügbaren E-Mails liefert keinen
  Treffer. DNS/HTTPS können in der Prüfumgebung wegen Netzwerk-/Auflösungsproblemen
  nicht verlässlich geprüft werden. Auch die bestehende OS-Adresse ist dort nicht
  prüfbar. Das beweist weder Nichtexistenz noch Offline-Status einer Domain.

## Umgesetzte Korrekturen

- Formular einschließlich Absende-Button bereits im HTML deaktiviert, auch ohne
  JavaScript; deutlicher Hinweis vor der Eingabe. Netlify-Blueprint bleibt erhalten.
  Keine Umleitung an einen unbelegten Empfänger und kein neuer Dienst.
- Dankeseite behauptet beim direkten Aufruf keinen Nachrichteneingang mehr.
- Feldlängen begrenzt; Honeypot aus Tastaturfokus genommen.
- Datenschutz auf nachgewiesenen Quellcode begrenzt; keine unbelegte Behauptung
  eines Live-Hosters, einer Zertifizierung oder einer bestimmten Rechtsgrundlage.
- Impressum benennt die fehlenden Betreiberangaben ausdrücklich. Die spekulative
  Kleinunternehmer-/USt-Alternative und ein pauschaler zweiter Inhaltsverantwortlicher
  wurden entfernt. Steuerstatus wird nicht aus fehlenden Daten abgeleitet.
- Werkstatt-Funktionen und Abo-Modell als Entwicklungsumfang gekennzeichnet.
- Sprunglink, Hauptinhalt, sichtbarer Tastaturfokus, Ankerabstand zur Navigation
  und Berücksichtigung reduzierter Bewegung ergänzt. Startseite vorerst noindex.

## Prüfung und Grenze

Lokale HTML-Verweise und Fragmente, Formular-Blueprint und HTML-Sperre,
fehlende externe Skripte sowie Diff-Format wurden kontrolliert.
Browser-Vorschau: Kontaktbereich visuell geprüft; Namenseingabe und Absenden
sind deaktiviert; direkter Aufruf der Kontaktabschlussseite zeigt keine
Empfangsbestätigung. Kein echter Formularversand, keine Bestätigung von
Serverannahme, Speicherung oder E-Mail-Zustellung. Kein mobiler Gerätetest.

## Vor geschäftlicher Freigabe

1. **Betreiberangaben:** rechtlicher Name, ladungsfähige Geschäftsanschrift,
   geschäftliche E-Mail und unmittelbare Kontaktmöglichkeit. Rechtsform,
   Vertretung, Register-/Identifikationsangaben und weitere besondere Pflichten
   nur ergänzen, soweit sie auf den tatsächlichen Betreiber zutreffen. Keine
   private Steuernummer veröffentlichen.
2. **Bestehendes Hosting zuordnen:** im vorhandenen Dashboard Live-URL,
   Deploymentquelle, Hostinganbieter und zuständige Vertragspartei feststellen.
   Vorhandenes Hostinger-Paket und Netlify-Projekt prüfen; keinen weiteren Vertrag
   abschließen. Nicht benötigte Verträge nicht ohne Auftrag kündigen.
3. **Domain nachweisen:** beim bisherigen Registrar Registrierung und Inhaberschaft
   von `saephrix-industries.de`, Nameserver, A/AAAA/CNAME für Apex und www,
   Weiterleitung, HTTPS-Zertifikat und das ausgelieferte Projekt kontrollieren.
   Keine Domain kaufen oder DNS umstellen, solange die Zuordnung ungeklärt ist.
4. **Datenschutz vervollständigen:** tatsächliche Hosting-/Formularverarbeitung,
   Auftragsverarbeitung, Empfänger, Speicher-/Löschkonzept und gegebenenfalls
   Drittlandgrundlage belegen. Erst dann die Rechtstexte finalisieren.
5. **Formular aktivieren und testen:** bei Netlify Formularerkennung und
   Benachrichtigungsziel prüfen; bei Hostinger zuerst einen passenden serverseitigen
   Endpunkt mit Validierung, Missbrauchsschutz und Fehlerbehandlung einrichten.
   Anschließend in einer isolierten Vorschau mit synthetischen Daten testen:
   vollständige Felder einschließlich Thema, Sonderzeichen, Pflichtfelder, Honeypot,
   Serverfehler, Verbindungsabbruch, Doppeleinsendung und tatsächlichen Empfang.
   Erfolg nur nach verifizierter Verarbeitung bestätigen. HTML-Sperre und Hinweise
   erst zusammen mit der getesteten Verarbeitung entfernen.
6. Änderungen gemeinsam prüfen; erst mit Freigabe zusammenführen/veröffentlichen.
   `noindex` danach bewusst prüfen. Es ist kein Zugriffsschutz.

Technische Referenzen:
- https://docs.netlify.com/manage/forms/setup/
- https://docs.netlify.com/manage/forms/troubleshooting-tips/
- https://www.gesetze-im-internet.de/ddg/__5.html
