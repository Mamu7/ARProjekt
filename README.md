# stadtlabor

* MongoDB
  * herunterladen
  * installieren (verschiedene Möglichkeiten)
    * (1) als Windows Service (läuft automatisch im Hintergrund)
      * kann mit `net start MongoDB` gestartet werden
      * kann mit `net stop MongoDB` gestoppt werden
    * (2) alternativ (muss jedes mal manuell gestartet werden)
      *
      * `mongod --dbpath=/data` in Eingabeaufforderung
    * (3) Für andere Systeme [Dokumentation](https://docs.mongodb.com/manual/installation/) befolgen

* node.js
* `npm install`
* SSL Zertifikate erstellen `openssl req -nodes -new -x509 -keyout server.key -out server.cert`
* `npm start`
