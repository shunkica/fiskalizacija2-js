import type {
    IArtiklIdentifikatorKlasifikacija,
    IDokumentUkupanIznos,
    IIzdavatelj,
    IOdgovor,
    IPrijenosSredstava,
    IPrimatelj,
    IRaspodjelaPdv,
    IDokumentPopust,
    IDokumentTrosak
} from "./common";
import type { XmlSerializable } from "./util";

/**
 * Zaglavlje sadrži osnovne informacije o zahtjevu, uključujući datum i vrijeme slanja te vrstu eRačuna, koja može biti ulazna ili izlazna.
 */
export interface IZaglavljeFiskalizacija {
    /**
     * Datum i vrijeme slanja zahtjeva
     * @restriction datumVrijemeSlanja
     */
    datumVrijemeSlanja: string;
    /**
     * Vrsta računa
     * I - Izlazni eRačun, U - Ulazni eRačun
     * @restriction fiskalizacija_vrstaERacuna
     */
    vrstaERacuna: string;
}

export type ZaglavljeFiskalizacijaSerializable = XmlSerializable<IZaglavljeFiskalizacija>;

/**
 * Informacije o jednom ili više prethodnih eRačuna.
 * @bt BG-3
 */
export interface IPrethodniERacun {
    /**
     * Broj eRačuna istog izdavatelja na koji se eRačun referencira.
     * @bt BT-25
     * @restriction tekst100
     */
    brojDokumenta: string;

    /**
     * Datum izdavanja prethodnog računa na koji se novi referencira.
     * @bt BT-26
     * @restriction datum
     */
    datumIzdavanja: string;
}

export type PrethodniERacunSerializable = XmlSerializable<IPrethodniERacun>;

/**
 * Informacije o pojedinačnim stavkama računa.
 * @bt BG-25
 */
export interface IStavkaERacuna {
    /**
     * Količina artikala (robe ili usluga) koje se obračunavaju na stavki računa.
     * @bt BT-129
     * @restriction decimal30i10
     */
    kolicina: number | string;

    /**
     * Jedinica mjere koja se primjenjuje na količinu fakturiranu na računu.
     * @bt BT-130
     * @restriction jedinicaMjere
     */
    jedinicaMjere: string;

    /**
     * Ukupan iznos stavke računa, uključujući popuste i troškove na razini stavke kao i druge relevantne poreze.
     * @bt BT-131
     * @restriction decimal2
     */
    neto: number | string;

    /**
     * Cijena artikla bez PDV-a, nakon oduzimanja popusta na cijenu artikla.
     * @bt BT-146
     * @restriction decimal30i10
     */
    artiklNetoCijena: number | string;

    /**
     * Jedinična cijena bez PDV-a prije oduzimanja popusta na cijenu artikla.
     * @bt BT-148
     * @restriction decimal30i10
     */
    artiklBrutoCijena?: number | string;

    /**
     * Broj jedinica artikla na koji se primjenjuje cijena.
     * @bt BT-149
     * @restriction decimal30i10
     */
    artiklOsnovnaKolicina?: number | string;

    /**
     * Šifra jedinica mjere koja se primjenjuje na osnovnu količinu za cijenu artikla.
     * @bt BT-150
     * @restriction jedinicaMjere
     */
    artiklJedinicaMjereZaOsnovnuKolicinu?: string;

    /**
     * Šifra kategorije PDV-a za fakturirani artikl po UNCL5305.
     * @bt BT-151
     * @restriction kategorijaPdv
     */
    artiklKategorijaPdv: string;

    /**
     * Stopa PDV-a prikazana u obliku postotka koji vrijedi za fakturirani artikl.
     * @bt BT-152
     * @restriction decimal30i10
     */
    artiklStopaPdv?: number | string;

    /**
     * Naziv artikla.
     * @bt BT-153
     * @restriction tekst1024
     */
    artiklNaziv: string;

    /**
     * Opis artikla.
     * @bt BT-154
     * @restriction tekst4096
     */
    artiklOpis?: string;

    /**
     * Podrška za stavke koje su oslobođene PDV-a ili ne podliježu PDV-u.
     * @bt HR-BT-12
     * @restriction hrKategorijaPdv
     */
    artiklHrOznakaKategorijaPdv?: string;

    /**
     * CPA nomenklatura označava se oznakom 'CG'.
     */
    ArtiklIdentifikatorKlasifikacija?: IArtiklIdentifikatorKlasifikacija[];
}

export type StavkaERacunaSerializable = XmlSerializable<IStavkaERacuna>;

export interface IERacun {
    /**
     * Broj eRačuna, dio identifikatora eRačuna.
     * @bt BT-1
     * @restriction tekst100
     */
    brojDokumenta: string;
    /**
     * Datum izdavanja eRačuna, dio identifikatora eRačuna.
     * @bt BT-2
     * @restriction datumIzdavanja
     */
    datumIzdavanja: string;
    /**
     * Šifra vrste eRačuna, dio identifikatora eRačuna.
     * @bt BT-3
     * @restriction vrstaDokumenta
     */
    vrstaDokumenta: string;
    /**
     * Šifra valute po ISO4217 u kojoj se iskazuju svi iznosi na računu, osim za ukupni iznos PDV-a u računovodstvenoj valuti. Napomena: koristi se šifra valute EUR
     * @bt BT-5
     * @restriction valuta
     */
    valutaERacuna: string;
    /**
     * Datum kada plaćanje dospijeva na naplatu.
     * @bt BT-9
     * @restriction datum
     */
    datumDospijecaPlacanja?: string;
    /**
     * Identifikator poslovnog procesa u kojem se obavlja transakcija, kako bi se kupcu omogućila obrada na odgovarajući način. Moguće vrste su navedene u Dodatku: Vrsta poslovnog procesa.
     * @bt BT-23
     * @restriction tekst200
     */
    vrstaPoslovnogProcesa: string;
    /**
     * Identifikacija ugovora koja mora biti jedinstvena u kontekstu specifičnog trgovinskog odnosa i za određeno razdoblje.
     * @bt BT-12
     * @restriction tekst1024
     */
    referencaNaUgovor?: string;
    /**
     * Datum na koji se obavlja ili dovršava isporuke robe ili usluga
     * @bt BT-72
     * @restriction datum
     */
    datumIsporuke?: string;
    /**
     * Informacije o jednom ili više prethodnih eRačuna.
     */
    PrethodniERacun?: IPrethodniERacun[];
    /**
     * Informacije o izdavatelju.
     */
    Izdavatelj: IIzdavatelj;
    /**
     * Informacije o primatelju.
     */
    Primatelj: IPrimatelj;
    /**
     * Informacije o plaćanju.
     */
    PrijenosSredstava?: IPrijenosSredstava[];
    /**
     * Informacije o ukupnim novčanim iznosima za eRačun.
     */
    DokumentUkupanIznos: IDokumentUkupanIznos;
    /**
     * Informacije o rekapitulaciji PDV-a po različitim kategorijama, stopama i razlozima izuzeća.
     */
    RaspodjelaPdv: IRaspodjelaPdv[];
    /**
     * Skupina poslovnih pojmova koji nude informacije o popustima.
     */
    DokumentPopust?: IDokumentPopust[];
    /**
     * Skupina poslovnih pojmova koji pružaju informacije o troškovima i porezima osim PDV-a.
     */
    DokumentTrosak?: IDokumentTrosak[];
    /**
     * Informacije o pojedinačnim stavkama računa.
     */
    StavkaERacuna: IStavkaERacuna[];
    /**
     * Indikator kopije računa koji pokazuje radi li se o kopiji računa (true) ili ne (false).
     * @bt HR-BT-1
     * @restriction boolean
     */
    indikatorKopije: boolean;
}

export type ERacunSerializable = XmlSerializable<IERacun>;

export interface IEvidentirajERacunZahtjev {
    /**
     * Atribut za referenciranje potpisanog elementa.
     */
    _id: string;
    /**
     * Zaglavlje zahtjeva
     */
    Zaglavlje: IZaglavljeFiskalizacija;
    /**
     * Podaci o eRačunu
     */
    ERacun: IERacun[];
}

export type EvidentirajERacunZahtjevSerializable = XmlSerializable<IEvidentirajERacunZahtjev>;

export interface IEvidentirajERacunOdgovor {
    /**
     * Atribut za referenciranje potpisanog elementa.
     */
    _id: string;
    /**
     * Datum i vrijeme slanja odgovora
     * @restriction datumVrijemeSlanja
     */
    datumVrijemeSlanja: string;
    /**
     * Podaci o odgovoru.
     */
    Odgovor: IOdgovor;
}

export type EvidentirajERacunOdgovorSerializable = XmlSerializable<IEvidentirajERacunOdgovor>;
