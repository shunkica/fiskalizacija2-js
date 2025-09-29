import type {
    IEvidentirajERacunZahtjev,
    IEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev,
    IEvidentirajNaplatuZahtjev,
    IEvidentirajOdbijanjeZahtjev
} from "../../src";
import { XmlSigner } from "../../src/util/signing";
import * as fs from "node:fs";
import * as path from "node:path";
import { getCurrentDateTimeString } from "../../src/util/time";

export class XmlTestProvider {
    static mockPrivateKey = fs.readFileSync(path.join(__dirname, "key.pem"), "utf8");

    static mockPublicCert = fs.readFileSync(path.join(__dirname, "cert.pem"), "utf8");

    static mockPrivateKey2 = fs.readFileSync(path.join(__dirname, "key2.pem"), "utf8");

    static mockPublicCert2 = fs.readFileSync(path.join(__dirname, "cert2.pem"), "utf8");

    static ublInvoiceFull = fs.readFileSync(path.join(__dirname, "ubl-invoice-full.xml"), "utf8");

    static ublInvoiceMinimal = fs.readFileSync(path.join(__dirname, "ubl-invoice-minimal.xml"), "utf8");

    static ublInvoiceInvalid = fs.readFileSync(path.join(__dirname, "ubl-invoice-invalid.xml"), "utf8");

    static EvidentirajERacunZahtjev = fs.readFileSync(path.join(__dirname, "EvidentirajERacunZahtjev.xml"), "utf8");
    static EvidentirajERacunZahtjev_ID = "cfa9dd33-9d9a-4a2a-8ef0-dd65fe476d8b";
    static EvidentirajERacunZahtjev_brojDokumenta = "5-P1-1";

    static EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev = fs.readFileSync(
        path.join(__dirname, "EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev.xml"),
        "utf8"
    );
    static EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev_brojDokumenta = "1234/2024/01";

    static EvidentirajNaplatuZahtjev = fs.readFileSync(path.join(__dirname, "EvidentirajNaplatuZahtjev.xml"), "utf8");
    static EvidentirajNaplatuZahtjev_brojDokumenta = "1234-2024-06";

    static EvidentirajOdbijanjeZahtjev = fs.readFileSync(path.join(__dirname, "EvidentirajOdbijanjeZahtjev.xml"), "utf8");
    static EvidentirajOdbijanjeZahtjev_brojDokumenta = "1234/2024/06";

    static mockEvidentirajERacunZahtjev(brojDokumenta: string, oib: string, vrsta: "I" | "U" = "I"): IEvidentirajERacunZahtjev {
        const datum = new Date().toISOString().split("T")[0];

        const issuer = { ime: "IZDAVATELJ", oibPorezniBroj: oib, oibOperatera: "12345678901" };
        const recipient = { ime: "PRIMATELJ", oibPorezniBroj: "11111111119" };
        if (vrsta === "U") {
            [issuer.ime, recipient.ime, issuer.oibPorezniBroj, recipient.oibPorezniBroj] = [
                recipient.ime,
                issuer.ime,
                recipient.oibPorezniBroj,
                issuer.oibPorezniBroj
            ];
        }

        return {
            _id: XmlSigner.generateId("ID"),
            Zaglavlje: {
                datumVrijemeSlanja: getCurrentDateTimeString(),
                vrstaERacuna: vrsta
            },
            ERacun: [
                {
                    brojDokumenta: brojDokumenta,
                    datumIzdavanja: datum,
                    vrstaDokumenta: "380",
                    valutaERacuna: "EUR",
                    datumDospijecaPlacanja: datum,
                    vrstaPoslovnogProcesa: "P1",
                    Izdavatelj: issuer,
                    Primatelj: recipient,
                    PrijenosSredstava: [
                        {
                            identifikatorRacunaZaPlacanje: "HRXXXXXXXXXXXXXXXX"
                        }
                    ],
                    DokumentUkupanIznos: {
                        neto: 100,
                        trosak: 5,
                        iznosBezPdv: 100,
                        pdv: 25,
                        iznosSPdv: 125,
                        iznosKojiDospijevaZaPlacanje: 125
                    },
                    RaspodjelaPdv: [
                        {
                            kategorijaPdv: "S",
                            oporeziviIznos: 100,
                            iznosPoreza: 25,
                            stopa: 25,
                            hrOznakaKategorijaPdv: "HR:PDV25"
                        }
                    ],
                    DokumentPopust: [
                        {
                            iznosPopust: 10,
                            kategorijaPdv: "S",
                            stopaPdv: 25,
                            tekstRazlogaPopusta: "Popust za redovite kupce"
                        }
                    ],
                    DokumentTrosak: [
                        {
                            iznosTrosak: 5,
                            kategorijaPdv: "S",
                            stopaPdv: 25,
                            hrOznakaPorezneKategorije: "HR:PDV25"
                        }
                    ],
                    StavkaERacuna: [
                        {
                            kolicina: 1,
                            jedinicaMjere: "H87",
                            neto: 100,
                            artiklNetoCijena: 100,
                            artiklBrutoCijena: 110,
                            artiklOsnovnaKolicina: 1,
                            artiklJedinicaMjereZaOsnovnuKolicinu: "H87",
                            artiklKategorijaPdv: "S",
                            artiklStopaPdv: 25,
                            artiklNaziv: "Proizvod",
                            artiklOpis: "Opis proizvoda",
                            artiklHrOznakaKategorijaPdv: "HR:PDV25",
                            ArtiklIdentifikatorKlasifikacija: [
                                {
                                    identifikatorKlasifikacije: "62.90.90",
                                    identifikatorSheme: "CG"
                                }
                            ]
                        }
                    ],
                    indikatorKopije: false
                }
            ]
        };
    }

    static mockEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev(brojDokumenta: string, oib: string): IEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev {
        const datum = new Date().toISOString().split("T")[0];
        return {
            _id: XmlSigner.generateId("ID"),
            Zaglavlje: {
                datumVrijemeSlanja: getCurrentDateTimeString(),
                vrstaRacuna: "IR"
            },
            Racun: [
                {
                    brojDokumenta: brojDokumenta,
                    datumIzdavanja: datum,
                    vrstaDokumenta: "380",
                    valutaRacuna: "EUR",
                    datumDospijecaPlacanja: datum,
                    vrstaPoslovnogProcesa: "P1",
                    Izdavatelj: {
                        ime: "IZDAVATELJ",
                        oibPorezniBroj: oib,
                        oibOperatera: "12345678901"
                    },
                    Primatelj: {
                        ime: "PRIMATELJ",
                        oibPorezniBroj: "11111111119"
                    },
                    PrijenosSredstava: [
                        {
                            identifikatorRacunaZaPlacanje: "HRXXXXXXXXXXXXXXXX"
                        }
                    ],
                    DokumentUkupanIznos: {
                        neto: 100,
                        iznosBezPdv: 100,
                        pdv: 25,
                        iznosSPdv: 125,
                        iznosKojiDospijevaZaPlacanje: 125
                    },
                    RaspodjelaPdv: [
                        {
                            kategorijaPdv: "S",
                            oporeziviIznos: 100,
                            iznosPoreza: 25,
                            stopa: 25
                        }
                    ],
                    StavkaRacuna: [
                        {
                            kolicina: 1,
                            jedinicaMjere: "H87",
                            neto: 100,
                            artiklNetoCijena: 100,
                            artiklBrutoCijena: 110,
                            artiklOsnovnaKolicina: 1,
                            artiklJedinicaMjereZaOsnovnuKolicinu: "H87",
                            artiklKategorijaPdv: "S",
                            artiklStopaPdv: 25,
                            artiklNaziv: "Proizvod",
                            artiklOpis: "Opis proizvoda",
                            artiklHrOznakaKategorijaPdv: "HR:PDV25",
                            ArtiklIdentifikatorKlasifikacija: [
                                {
                                    identifikatorKlasifikacije: "62.90.90",
                                    identifikatorSheme: "CG"
                                }
                            ]
                        }
                    ],
                    indikatorKopije: false
                }
            ]
        };
    }

    static mockEvidentirajNaplatuZahtjev(brojDokumenta: string, oib: string): IEvidentirajNaplatuZahtjev {
        const datum = new Date().toISOString().split("T")[0];
        return {
            _id: XmlSigner.generateId("ID"),
            Zaglavlje: {
                datumVrijemeSlanja: getCurrentDateTimeString()
            },
            Naplata: [
                {
                    brojDokumenta: brojDokumenta,
                    datumIzdavanja: datum,
                    oibPorezniBrojIzdavatelja: oib,
                    oibPorezniBrojPrimatelja: "11111111119",
                    datumNaplate: datum,
                    naplaceniIznos: 100,
                    nacinPlacanja: "T"
                }
            ]
        };
    }

    static mockEvidentirajOdbijanjeZahtjev(brojDokumenta: string, oib: string): IEvidentirajOdbijanjeZahtjev {
        const datum = new Date().toISOString().split("T")[0];
        return {
            _id: XmlSigner.generateId("ID"),
            Zaglavlje: {
                datumVrijemeSlanja: getCurrentDateTimeString()
            },
            Odbijanje: [
                {
                    brojDokumenta: brojDokumenta,
                    datumIzdavanja: datum,
                    oibPorezniBrojIzdavatelja: "11111111119",
                    oibPorezniBrojPrimatelja: oib,
                    datumOdbijanja: datum,
                    vrstaRazlogaOdbijanja: "O",
                    razlogOdbijanja: "Neispravni podaci"
                }
            ]
        };
    }
}
