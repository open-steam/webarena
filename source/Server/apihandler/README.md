Ein API Handler (dispatcher) leitet Anfragen, die in Form Events von außen kommen, an
innere Controller weiter, die die eigentliche Arbeit erledigen.

Jede Schnittstelle hat hierbei einen API-Handler, z.b.:
- InternalDispatcher: Ist für Anfragen zuständig, die von Plugin-Applikationen kommen, die von Applikationen kommen die im selben NodeJS-Prozess laufen
- TcpDispatcher: bearbeitet Events, die über eine TcpVerbindung kommen
- Dispatcher: bearbeitet Events, die aus dem Browser der Nutzer kommen