import type { IERacun } from "../../src";
import { expect, assert } from "vitest";

export class XmlTestValidator {
    static validateFullUblInvoice(er: IERacun) {
        expect(er.brojDokumenta).toBe("5-P1-1");
        expect(er.datumIzdavanja).toBe("2025-05-01");
        expect(er.vrstaDokumenta).toBe("380");
        expect(er.valutaERacuna).toBe("EUR");
        expect(er.datumDospijecaPlacanja).toBe("2025-05-31");
        expect(er.datumIsporuke).toBe("2025-05-15");
        expect(er.vrstaPoslovnogProcesa).toBe("P1");
        expect(er.referencaNaUgovor).toBe("REF-12345");
        expect(er.indikatorKopije).toBe(true);
        expect(er.PrethodniERacun).toBeDefined();
        assert(Array.isArray(er.PrethodniERacun));
        expect(er.PrethodniERacun.length).toBe(2);
        expect(er.PrethodniERacun[0].brojDokumenta).toBe("PREV-001");
        expect(er.PrethodniERacun[0].datumIzdavanja).toBe("2024-01-01");
        expect(er.PrethodniERacun[1].brojDokumenta).toBe("PREV-002");
        expect(er.PrethodniERacun[1].datumIzdavanja).toBe("2024-02-01");
        expect(er.Izdavatelj.ime).toBe("FINANCIJSKA AGENCIJA");
        // TODO: Iako je u specifikaciji navedeno da u ovo polje može ići OIB ili porezni broj,
        //       ako se šalje porezni broj, na demo serveru se poruka odbija sa greškom:
        //       S006: PT nije ovlaštena za dostavu podataka na fiskalizaciju.Inicijalna provjera za valjanost oib-a kod evidentiranja izlaznog eRačuna (Record: 1)
        //       stoga za sada mičemo "HR" dio iz polja BT-31
        //expect(er.Izdavatelj.oibPorezniBroj).toBe("HR12345678901");
        expect(er.Izdavatelj.oibPorezniBroj).toBe("12345678901");
        expect(er.Primatelj.ime).toBe("Tvrtka B d.o.o.");
        // TODO: Iako je u specifikaciji navedeno da u ovo polje može ići OIB ili porezni broj,
        //       ako se šalje porezni broj, na demo serveru se poruka odbija sa greškom:
        //       S006: PT nije ovlaštena za dostavu podataka na fiskalizaciju.Inicijalna provjera za valjanost oib-a kod evidentiranja ulaznog eRačuna (Record: 1)
        //       stoga za sada mičemo "HR" dio iz polja BT-48
        //expect(er.Primatelj.oibPorezniBroj).toBe("HR11111111119");
        expect(er.Primatelj.oibPorezniBroj).toBe("11111111119");
        expect(er.PrijenosSredstava).toBeDefined();
        assert(Array.isArray(er.PrijenosSredstava));
        expect(er.PrijenosSredstava.length).toBe(2);
        expect(er.PrijenosSredstava[0].identifikatorRacunaZaPlacanje).toBe("HRXXXXXXXXXXXXXXXX");
        expect(er.PrijenosSredstava[0].nazivRacunaZaPlacanje).toBe("Racun 1");
        expect(er.PrijenosSredstava[0].identifikatorPruzateljaPlatnihUsluga).toBe("BANKHR1X");
        expect(er.PrijenosSredstava[1].identifikatorRacunaZaPlacanje).toBe("HRYYYYYYYYYYYYYY");
        expect(er.PrijenosSredstava[1].nazivRacunaZaPlacanje).toBe("Racun 2");
        expect(er.PrijenosSredstava[1].identifikatorPruzateljaPlatnihUsluga).toBe("BANKHR2Y");
        expect(er.DokumentUkupanIznos.neto).toBe(340.0);
        expect(er.DokumentUkupanIznos.popust).toBe(40.0);
        expect(er.DokumentUkupanIznos.iznosBezPdv).toBe(300.0);
        expect(er.DokumentUkupanIznos.pdv).toBe(50.0);
        expect(er.DokumentUkupanIznos.iznosSPdv).toBe(350.0);
        expect(er.DokumentUkupanIznos.placeniIznos).toBe(30.0);
        expect(er.DokumentUkupanIznos.iznosKojiDospijevaZaPlacanje).toBe(320.0);
        expect(er.RaspodjelaPdv).toBeDefined();
        expect(er.RaspodjelaPdv.length).toBe(2);
        expect(er.RaspodjelaPdv[0].kategorijaPdv).toBe("S");
        expect(er.RaspodjelaPdv[0].oporeziviIznos).toBe(200.0);
        expect(er.RaspodjelaPdv[0].iznosPoreza).toBe(50.0);
        expect(er.RaspodjelaPdv[0].stopa).toBe(25);
        expect(er.RaspodjelaPdv[1].kategorijaPdv).toBe("Z");
        expect(er.RaspodjelaPdv[1].oporeziviIznos).toBe(100.0);
        expect(er.RaspodjelaPdv[1].iznosPoreza).toBe(0);
        expect(er.RaspodjelaPdv[1].stopa).toBe(0);
        expect(er.StavkaERacuna).toBeDefined();
        expect(er.StavkaERacuna.length).toBe(2);
        expect(er.StavkaERacuna[0].kolicina).toBe(2.0);
        expect(er.StavkaERacuna[0].jedinicaMjere).toBe("H87");
        expect(er.StavkaERacuna[0].artiklNetoCijena).toBe(120);
        expect(er.StavkaERacuna[1].artiklOsnovnaKolicina).toBe(1);
        expect(er.StavkaERacuna[1].artiklJedinicaMjereZaOsnovnuKolicinu).toBe("H87");
        expect(er.StavkaERacuna[0].artiklKategorijaPdv).toBe("S");
        expect(er.StavkaERacuna[0].artiklStopaPdv).toBe(25);
        expect(er.StavkaERacuna[0].artiklNaziv).toBe("Proizvod");
        expect(er.StavkaERacuna[0].ArtiklIdentifikatorKlasifikacija).toBeDefined();
        expect(er.StavkaERacuna[0].ArtiklIdentifikatorKlasifikacija!.length).toBe(2);
        expect(er.StavkaERacuna[0].ArtiklIdentifikatorKlasifikacija![0].identifikatorKlasifikacije).toBe("62.90.90");
        expect(er.StavkaERacuna[0].ArtiklIdentifikatorKlasifikacija![0].identifikatorSheme).toBe("CG");
        expect(er.StavkaERacuna[0].ArtiklIdentifikatorKlasifikacija![0].verzijaSheme).toBe("1");
        expect(er.StavkaERacuna[0].ArtiklIdentifikatorKlasifikacija![1].identifikatorKlasifikacije).toBe("62.90.91");
        expect(er.StavkaERacuna[0].ArtiklIdentifikatorKlasifikacija![1].identifikatorSheme).toBe("CG");
        expect(er.StavkaERacuna[1].kolicina).toBe(1);
        expect(er.StavkaERacuna[1].jedinicaMjere).toBe("H87");
        expect(er.StavkaERacuna[1].artiklNetoCijena).toBe(100);
        expect(er.StavkaERacuna[1].artiklOsnovnaKolicina).toBe(1);
        expect(er.StavkaERacuna[1].artiklJedinicaMjereZaOsnovnuKolicinu).toBe("H87");
        expect(er.StavkaERacuna[1].artiklKategorijaPdv).toBe("Z");
        expect(er.StavkaERacuna[1].artiklStopaPdv).toBe(0);
        expect(er.StavkaERacuna[1].artiklNaziv).toBe("Proizvod PDV0");
        expect(er.StavkaERacuna[1].ArtiklIdentifikatorKlasifikacija).toBeDefined;
        assert(Array.isArray(er.StavkaERacuna[1].ArtiklIdentifikatorKlasifikacija));
        expect(er.StavkaERacuna[1].ArtiklIdentifikatorKlasifikacija.length).toBe(1);
        expect(er.StavkaERacuna[1].ArtiklIdentifikatorKlasifikacija[0].identifikatorKlasifikacije).toBe("62.90.90");
        expect(er.StavkaERacuna[1].ArtiklIdentifikatorKlasifikacija[0].identifikatorSheme).toBe("CG");
    }

    static validateMinimalUblInvoice(er: IERacun) {
        expect(er.brojDokumenta).toBe("MINIMAL-001");
        expect(er.datumIzdavanja).toBe("2024-01-15");
        expect(er.vrstaDokumenta).toBe("380");
        expect(er.valutaERacuna).toBe("EUR");
        expect(er.datumDospijecaPlacanja).toBe("2025-05-31");
        expect(er.datumIsporuke).toBeUndefined();
        expect(er.vrstaPoslovnogProcesa).toBe("P1");
        expect(er.referencaNaUgovor).toBeUndefined();
        expect(er.indikatorKopije).toBe(false);
        expect(er.PrethodniERacun).toBeUndefined();
        expect(er.Izdavatelj.ime).toBe("Minimal Supplier");
        // TODO: Iako je u specifikaciji navedeno da u ovo polje može ići OIB ili porezni broj,
        //       ako se šalje porezni broj, na demo serveru se poruka odbija sa greškom:
        //       S006: PT nije ovlaštena za dostavu podataka na fiskalizaciju.Inicijalna provjera za valjanost oib-a kod evidentiranja izlaznog eRačuna (Record: 1)
        //       stoga za sada mičemo "HR" dio iz polja BT-31
        //expect(er.Izdavatelj.oibPorezniBroj).toBe("HR11111111119");
        expect(er.Izdavatelj.oibPorezniBroj).toBe("11111111119");
        expect(er.Primatelj.ime).toBe("Minimal Customer");
        // TODO: Iako je u specifikaciji navedeno da u ovo polje može ići OIB ili porezni broj,
        //       ako se šalje porezni broj, na demo serveru se poruka odbija sa greškom:
        //       S006: PT nije ovlaštena za dostavu podataka na fiskalizaciju.Inicijalna provjera za valjanost oib-a kod evidentiranja ulaznog eRačuna (Record: 1)
        //       stoga za sada mičemo "HR" dio iz polja BT-48
        //expect(er.Primatelj.oibPorezniBroj).toBe("HR22222222222");
        expect(er.Primatelj.oibPorezniBroj).toBe("22222222222");
        expect(er.PrijenosSredstava).toBeUndefined();
        expect(er.DokumentUkupanIznos.neto).toBe(50.0);
        expect(er.DokumentUkupanIznos.popust).toBeUndefined();
        expect(er.DokumentUkupanIznos.iznosBezPdv).toBe(50.0);
        expect(er.DokumentUkupanIznos.pdv).toBe(0.0);
        expect(er.DokumentUkupanIznos.iznosSPdv).toBe(50.0);
        expect(er.DokumentUkupanIznos.placeniIznos).toBeUndefined();
        expect(er.DokumentUkupanIznos.iznosKojiDospijevaZaPlacanje).toBe(50.0);
        expect(er.RaspodjelaPdv.length).toBe(1);
        expect(er.RaspodjelaPdv[0].kategorijaPdv).toBe("Z");
        expect(er.RaspodjelaPdv[0].oporeziviIznos).toBe(50.0);
        expect(er.RaspodjelaPdv[0].iznosPoreza).toBe(0.0);
        expect(er.RaspodjelaPdv[0].stopa).toBe(0.0);
        expect(er.RaspodjelaPdv[0].razlogOslobodenja).toBeUndefined();
        expect(er.RaspodjelaPdv[0].tekstRazlogaOslobodenja).toBeUndefined();
        expect(er.StavkaERacuna.length).toBe(1);
        expect(er.StavkaERacuna[0].kolicina).toBe(2);
        expect(er.StavkaERacuna[0].jedinicaMjere).toBe("H87");
        expect(er.StavkaERacuna[0].artiklNetoCijena).toBe(25.0);
        expect(er.StavkaERacuna[0].artiklOsnovnaKolicina).toBeUndefined();
        expect(er.StavkaERacuna[0].artiklJedinicaMjereZaOsnovnuKolicinu).toBeUndefined();
        expect(er.StavkaERacuna[0].artiklKategorijaPdv).toBe("Z");
        expect(er.StavkaERacuna[0].artiklStopaPdv).toBe(0.0);
        expect(er.StavkaERacuna[0].artiklNaziv).toBe("Consulting Service");
        expect(er.StavkaERacuna[0].ArtiklIdentifikatorKlasifikacija).toBeUndefined();
    }
}
