import type {
    ERacunSerializable,
    EvidentirajERacunOdgovorSerializable,
    EvidentirajERacunZahtjevSerializable,
    IERacun,
    IEvidentirajERacunOdgovor,
    IEvidentirajERacunZahtjev,
    IPrethodniERacun,
    IStavkaERacuna,
    IZaglavljeFiskalizacija,
    PrethodniERacunSerializable,
    StavkaERacunaSerializable,
    ZaglavljeFiskalizacijaSerializable
} from "../types";
import { FISK_NS, UBL_NS } from "../constants/const";
import type { ExtractionOptions } from "../util/xml";
import {
    normalizeDecimal,
    extractElement,
    extractElements,
    extractOptionalElements,
    getAttributeValue,
    getBusinessGroupXpath,
    getBusinessTermXpath,
    getElementContent,
    getOptionalElementContent,
    toValidatedDecimalString,
    toValidatedDecimalStringOptional,
    usingXmlDocument,
    xmlEscape
} from "../util/xml";
import type { XmlElement } from "libxml2-wasm";
import { XmlDocument } from "libxml2-wasm";
import {
    ArtiklIdentifikatorKlasifikacija,
    DokumentUkupanIznos,
    Izdavatelj,
    PrijenosSredstava,
    Primatelj,
    RaspodjelaPdv,
    Odgovor,
    DokumentPopust,
    DokumentTrosak
} from "./common";
import { ValidationError } from "../util/error";

export class EvidentirajERacunZahtjev implements EvidentirajERacunZahtjevSerializable {
    _id: string;
    Zaglavlje: ZaglavljeFiskalizacija;
    ERacun: ERacun[];

    constructor(args: IEvidentirajERacunZahtjev) {
        this._id = args._id;
        this.Zaglavlje = new ZaglavljeFiskalizacija(args.Zaglavlje);
        this.ERacun = args.ERacun.map(eracun => new ERacun(eracun));
    }

    public static fromXml(xml: string | Uint8Array | XmlDocument | XmlElement): IEvidentirajERacunZahtjev {
        if (typeof xml === "string") {
            return usingXmlDocument(XmlDocument.fromString(xml), doc => {
                return EvidentirajERacunZahtjev.fromXml(doc);
            });
        } else if (Buffer.isBuffer(xml)) {
            return usingXmlDocument(XmlDocument.fromBuffer(xml), doc => {
                return EvidentirajERacunZahtjev.fromXml(doc);
            });
        } else if (xml instanceof XmlDocument) {
            return EvidentirajERacunZahtjev.fromXml(xml.root);
        } else {
            let el = xml as XmlElement;
            if (el.name === "Envelope" && el.namespaceUri === FISK_NS.soapenv) {
                const el2 = el.get("/soapenv:Envelope/soapenv:Body/efis:EvidentirajERacunZahtjev", FISK_NS) as XmlElement | null;
                if (!el2) {
                    throw new ValidationError("Expected 'EvidentirajERacunZahtjev' element in SOAP body", xml);
                }
                el = el2;
            }
            if (el.name !== "EvidentirajERacunZahtjev" || el.namespaceUri !== FISK_NS.efis) {
                throw new ValidationError(`Expected 'EvidentirajERacunZahtjev' element with namespace '${FISK_NS.efis}'`, xml);
            }
            return EvidentirajERacunZahtjev.fromXmlElement(el);
        }
    }

    static fromXmlElement(el: XmlElement): IEvidentirajERacunZahtjev {
        return {
            _id: getAttributeValue(el, "efis:id", FISK_NS),
            Zaglavlje: extractElement(el, "efis:Zaglavlje", FISK_NS, ZaglavljeFiskalizacija.fromXmlElement),
            ERacun: extractElements(el, "efis:ERacun", FISK_NS, ERacun.fromXmlElement)
        };
    }

    public toXmlString() {
        let res = "";
        res += `<efis:EvidentirajERacunZahtjev xmlns:ds="${FISK_NS["ds"]}" xmlns:efis="${FISK_NS["efis"]}" efis:id="${xmlEscape(this._id)}">`;
        res += this.Zaglavlje.toXmlString();
        this.ERacun.forEach(eracun => (res += eracun.toXmlString()));
        res += "</efis:EvidentirajERacunZahtjev>";
        return res;
    }
}

export class ZaglavljeFiskalizacija implements ZaglavljeFiskalizacijaSerializable {
    datumVrijemeSlanja: string;
    vrstaERacuna: string;

    constructor(args: IZaglavljeFiskalizacija) {
        this.datumVrijemeSlanja = args.datumVrijemeSlanja;
        this.vrstaERacuna = args.vrstaERacuna;
    }

    public toXmlString() {
        let res = "";
        res += "<efis:Zaglavlje>";
        res += `<efis:datumVrijemeSlanja>${xmlEscape(this.datumVrijemeSlanja)}</efis:datumVrijemeSlanja>`;
        res += `<efis:vrstaERacuna>${xmlEscape(this.vrstaERacuna)}</efis:vrstaERacuna>`;
        res += "</efis:Zaglavlje>";
        return res;
    }

    static fromXmlElement(el: XmlElement): IZaglavljeFiskalizacija {
        return {
            datumVrijemeSlanja: getElementContent(el, "efis:datumVrijemeSlanja", FISK_NS, { restrictionName: "datumVrijemeSlanja" }),
            vrstaERacuna: getElementContent(el, "efis:vrstaERacuna", FISK_NS, { restrictionName: "fiskalizacija_vrstaERacuna" })
        };
    }
}

export class ERacun implements ERacunSerializable {
    brojDokumenta: string;
    datumIzdavanja: string;
    vrstaDokumenta: string;
    valutaERacuna: string;
    datumDospijecaPlacanja?: string | undefined;
    vrstaPoslovnogProcesa: string;
    referencaNaUgovor?: string | undefined;
    datumIsporuke?: string | undefined;
    PrethodniERacun?: PrethodniERacun[] | undefined;
    Izdavatelj: Izdavatelj;
    Primatelj: Primatelj;
    PrijenosSredstava?: PrijenosSredstava[] | undefined;
    DokumentUkupanIznos: DokumentUkupanIznos;
    RaspodjelaPdv: RaspodjelaPdv[];
    DokumentPopust?: DokumentPopust[] | undefined;
    DokumentTrosak?: DokumentTrosak[] | undefined;
    StavkaERacuna: StavkaERacuna[];
    indikatorKopije: boolean;

    constructor(args: IERacun) {
        this.brojDokumenta = args.brojDokumenta;
        this.datumIzdavanja = args.datumIzdavanja;
        this.vrstaDokumenta = args.vrstaDokumenta;
        this.valutaERacuna = args.valutaERacuna;
        this.datumDospijecaPlacanja = args.datumDospijecaPlacanja;
        this.vrstaPoslovnogProcesa = args.vrstaPoslovnogProcesa;
        this.referencaNaUgovor = args.referencaNaUgovor;
        this.datumIsporuke = args.datumIsporuke;
        this.PrethodniERacun = args.PrethodniERacun?.map(i => new PrethodniERacun(i));
        this.Izdavatelj = new Izdavatelj(args.Izdavatelj, "efis");
        this.Primatelj = new Primatelj(args.Primatelj, "efis");
        this.PrijenosSredstava = args.PrijenosSredstava?.map(i => new PrijenosSredstava(i, "efis"));
        this.DokumentUkupanIznos = new DokumentUkupanIznos(args.DokumentUkupanIznos, "efis");
        this.RaspodjelaPdv = args.RaspodjelaPdv.map(i => new RaspodjelaPdv(i, "efis"));
        this.DokumentPopust = args.DokumentPopust?.map(i => new DokumentPopust(i, "efis"));
        this.DokumentTrosak = args.DokumentTrosak?.map(i => new DokumentTrosak(i, "efis"));
        this.StavkaERacuna = args.StavkaERacuna.map(i => new StavkaERacuna(i));
        this.indikatorKopije = args.indikatorKopije;
    }

    toXmlString(): string {
        let res = "";
        res += "<efis:ERacun>";
        res += "<efis:brojDokumenta>" + xmlEscape(this.brojDokumenta) + "</efis:brojDokumenta>";
        res += "<efis:datumIzdavanja>" + xmlEscape(this.datumIzdavanja) + "</efis:datumIzdavanja>";
        res += "<efis:vrstaDokumenta>" + xmlEscape(this.vrstaDokumenta) + "</efis:vrstaDokumenta>";
        res += "<efis:valutaERacuna>" + xmlEscape(this.valutaERacuna) + "</efis:valutaERacuna>";
        if (this.datumDospijecaPlacanja) {
            res += "<efis:datumDospijecaPlacanja>" + xmlEscape(this.datumDospijecaPlacanja) + "</efis:datumDospijecaPlacanja>";
        }
        res += "<efis:vrstaPoslovnogProcesa>" + xmlEscape(this.vrstaPoslovnogProcesa) + "</efis:vrstaPoslovnogProcesa>";
        if (this.referencaNaUgovor) {
            res += "<efis:referencaNaUgovor>" + xmlEscape(this.referencaNaUgovor) + "</efis:referencaNaUgovor>";
        }
        if (this.datumIsporuke) {
            res += "<efis:datumIsporuke>" + xmlEscape(this.datumIsporuke) + "</efis:datumIsporuke>";
        }
        if (this.PrethodniERacun) {
            this.PrethodniERacun.forEach(i => (res += i.toXmlString()));
        }
        res += this.Izdavatelj.toXmlString();
        res += this.Primatelj.toXmlString();
        if (this.PrijenosSredstava) {
            this.PrijenosSredstava.forEach(i => (res += i.toXmlString()));
        }
        res += this.DokumentUkupanIznos.toXmlString();
        this.RaspodjelaPdv.forEach(i => (res += i.toXmlString()));
        if (this.DokumentPopust) {
            this.DokumentPopust.forEach(i => (res += i.toXmlString()));
        }
        if (this.DokumentTrosak) {
            this.DokumentTrosak.forEach(i => (res += i.toXmlString()));
        }
        this.StavkaERacuna.forEach(i => (res += i.toXmlString()));
        res += `<efis:indikatorKopije>${xmlEscape(String(this.indikatorKopije))}</efis:indikatorKopije>`;
        res += "</efis:ERacun>";
        return res;
    }

    static fromXmlElement(el: XmlElement): IERacun {
        return {
            brojDokumenta: getElementContent(el, "efis:brojDokumenta", FISK_NS, { restrictionName: "tekst100" }),
            datumIzdavanja: getElementContent(el, "efis:datumIzdavanja", FISK_NS, { restrictionName: "datumIzdavanja" }),
            vrstaDokumenta: getElementContent(el, "efis:vrstaDokumenta", FISK_NS, { restrictionName: "vrstaDokumenta" }),
            valutaERacuna: getElementContent(el, "efis:valutaERacuna", FISK_NS, { restrictionName: "valuta" }),
            datumDospijecaPlacanja: getOptionalElementContent(el, "efis:datumDospijecaPlacanja", FISK_NS, { restrictionName: "datum" }),
            vrstaPoslovnogProcesa: getElementContent(el, "efis:vrstaPoslovnogProcesa", FISK_NS, { restrictionName: "tekst200" }),
            referencaNaUgovor: getOptionalElementContent(el, "efis:referencaNaUgovor", FISK_NS, { restrictionName: "tekst1024" }),
            datumIsporuke: getOptionalElementContent(el, "efis:datumIsporuke", FISK_NS, { restrictionName: "datum" }),
            PrethodniERacun: extractOptionalElements(el, "efis:PrethodniERacun", FISK_NS, PrethodniERacun.fromXmlElement),
            Izdavatelj: extractElement(el, "efis:Izdavatelj", FISK_NS, Izdavatelj.fromXmlElement),
            Primatelj: extractElement(el, "efis:Primatelj", FISK_NS, Primatelj.fromXmlElement),
            PrijenosSredstava: extractOptionalElements(el, "efis:PrijenosSredstava", FISK_NS, PrijenosSredstava.fromXmlElement),
            DokumentUkupanIznos: extractElement(el, "efis:DokumentUkupanIznos", FISK_NS, DokumentUkupanIznos.fromXmlElement),
            RaspodjelaPdv: extractElements(el, "efis:RaspodjelaPdv", FISK_NS, RaspodjelaPdv.fromXmlElement),
            DokumentPopust: extractOptionalElements(el, "efis:DokumentPopust", FISK_NS, DokumentPopust.fromXmlElement),
            DokumentTrosak: extractOptionalElements(el, "efis:DokumentTrosak", FISK_NS, DokumentTrosak.fromXmlElement),
            StavkaERacuna: extractElements(el, "efis:StavkaERacuna", FISK_NS, StavkaERacuna.fromXmlElement),
            indikatorKopije: ["true", "1"].includes(getElementContent(el, "efis:indikatorKopije", FISK_NS, { restrictionName: "boolean" }))
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions): IERacun {
        const _options = { ...options, restrictionName: "tekst100" as const };
        return {
            brojDokumenta: getElementContent(el, getBusinessTermXpath("BT-1", type), UBL_NS, { ...options, restrictionName: "tekst100" }),
            datumIzdavanja: getElementContent(el, getBusinessTermXpath("BT-2", type), UBL_NS, { ...options, restrictionName: "datumIzdavanja" }),
            vrstaDokumenta: getElementContent(el, getBusinessTermXpath("BT-3", type), UBL_NS, { ...options, restrictionName: "vrstaDokumenta" }),
            valutaERacuna: getElementContent(el, getBusinessTermXpath("BT-5", type), UBL_NS, { ...options, restrictionName: "valuta" }),
            datumDospijecaPlacanja: getOptionalElementContent(el, getBusinessTermXpath("BT-9", type), UBL_NS, {
                ...options,
                restrictionName: "datum"
            }),
            vrstaPoslovnogProcesa: getElementContent(el, getBusinessTermXpath("BT-23", type), UBL_NS, { ...options, restrictionName: "tekst200" }),
            referencaNaUgovor: getOptionalElementContent(el, getBusinessTermXpath("BT-12", type), UBL_NS, {
                ...options,
                restrictionName: "tekst1024"
            }),
            datumIsporuke: getOptionalElementContent(el, getBusinessTermXpath("BT-72", type), UBL_NS, { ...options, restrictionName: "datum" }),
            PrethodniERacun: PrethodniERacun.fromUblElement(el, type, options),
            Izdavatelj: Izdavatelj.fromUblElement(el, type, options),
            Primatelj: Primatelj.fromUblElement(el, type, options),
            PrijenosSredstava: PrijenosSredstava.fromUblElement(el, type, options),
            DokumentUkupanIznos: DokumentUkupanIznos.fromUblElement(el, type, options),
            RaspodjelaPdv: RaspodjelaPdv.fromUblElement(el, type, options),
            DokumentPopust: DokumentPopust.fromUblElement(el, type, options),
            DokumentTrosak: DokumentTrosak.fromUblElement(el, type, options),
            StavkaERacuna: StavkaERacuna.fromUblElement(el, type, options),
            indikatorKopije: ["true", "1"].includes(
                getOptionalElementContent(el, getBusinessTermXpath("HR-BT-1", type), UBL_NS, { ...options, restrictionName: "boolean" }) || ""
            )
        };
    }
}

export class PrethodniERacun implements PrethodniERacunSerializable {
    brojDokumenta: string;
    datumIzdavanja: string;

    constructor(args: IPrethodniERacun) {
        this.brojDokumenta = args.brojDokumenta;
        this.datumIzdavanja = args.datumIzdavanja;
    }

    toXmlString(): string {
        let res = "";
        res += "<efis:PrethodniERacun>";
        res += `<efis:brojDokumenta>${xmlEscape(this.brojDokumenta)}</efis:brojDokumenta>`;
        res += `<efis:datumIzdavanja>${xmlEscape(this.datumIzdavanja)}</efis:datumIzdavanja>`;
        res += "</efis:PrethodniERacun>";
        return res;
    }

    static fromXmlElement(el: XmlElement): IPrethodniERacun {
        return {
            brojDokumenta: getElementContent(el, "efis:brojDokumenta", FISK_NS, { restrictionName: "tekst100" }),
            datumIzdavanja: getElementContent(el, "efis:datumIzdavanja", FISK_NS, { restrictionName: "datum" })
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions): IPrethodniERacun[] | undefined {
        const groups = el.find(getBusinessGroupXpath("BG-3", type), UBL_NS) as XmlElement[];
        if (groups.length === 0) {
            return undefined;
        }
        return groups.map(groupEl => {
            return {
                brojDokumenta: getElementContent(groupEl, getBusinessTermXpath("BT-25", type, "BG-3"), UBL_NS, {
                    ...options,
                    restrictionName: "tekst100"
                }),
                datumIzdavanja: getElementContent(groupEl, getBusinessTermXpath("BT-26", type, "BG-3"), UBL_NS, {
                    ...options,
                    restrictionName: "datum"
                })
            };
        });
    }
}

export class StavkaERacuna implements StavkaERacunaSerializable {
    kolicina: string;
    jedinicaMjere: string;
    neto: number | string;
    artiklNetoCijena: string;
    artiklBrutoCijena?: string | undefined;
    artiklOsnovnaKolicina?: string | undefined;
    artiklJedinicaMjereZaOsnovnuKolicinu?: string | undefined;
    artiklKategorijaPdv: string;
    artiklStopaPdv?: string | undefined;
    artiklNaziv: string;
    artiklOpis?: string | undefined;
    artiklHrOznakaKategorijaPdv?: string | undefined;
    ArtiklIdentifikatorKlasifikacija?: ArtiklIdentifikatorKlasifikacija[] | undefined;

    constructor(args: IStavkaERacuna) {
        this.kolicina = toValidatedDecimalString(args.kolicina);
        this.jedinicaMjere = args.jedinicaMjere;
        this.neto = args.neto;
        this.artiklNetoCijena = toValidatedDecimalString(args.artiklNetoCijena);
        this.artiklBrutoCijena = toValidatedDecimalStringOptional(args.artiklBrutoCijena);
        this.artiklOsnovnaKolicina = toValidatedDecimalStringOptional(args.artiklOsnovnaKolicina);
        this.artiklJedinicaMjereZaOsnovnuKolicinu = args.artiklJedinicaMjereZaOsnovnuKolicinu;
        this.artiklKategorijaPdv = args.artiklKategorijaPdv;
        this.artiklStopaPdv = toValidatedDecimalStringOptional(args.artiklStopaPdv);
        this.artiklNaziv = args.artiklNaziv;
        this.artiklOpis = args.artiklOpis;
        this.artiklHrOznakaKategorijaPdv = args.artiklHrOznakaKategorijaPdv;
        this.ArtiklIdentifikatorKlasifikacija = args.ArtiklIdentifikatorKlasifikacija?.map(i => new ArtiklIdentifikatorKlasifikacija(i, "efis"));
    }

    toXmlString(): string {
        let res = "";
        res += "<efis:StavkaERacuna>";
        res += `<efis:kolicina>${xmlEscape(this.kolicina)}</efis:kolicina>`;
        res += `<efis:jedinicaMjere>${xmlEscape(this.jedinicaMjere)}</efis:jedinicaMjere>`;
        res += `<efis:neto>${normalizeDecimal(this.neto, 2)}</efis:neto>`;
        res += `<efis:artiklNetoCijena>${xmlEscape(this.artiklNetoCijena)}</efis:artiklNetoCijena>`;
        if (this.artiklBrutoCijena !== undefined) {
            res += `<efis:artiklBrutoCijena>${xmlEscape(this.artiklBrutoCijena)}</efis:artiklBrutoCijena>`;
        }
        if (this.artiklOsnovnaKolicina !== undefined) {
            res += `<efis:artiklOsnovnaKolicina>${xmlEscape(this.artiklOsnovnaKolicina)}</efis:artiklOsnovnaKolicina>`;
        }
        if (this.artiklJedinicaMjereZaOsnovnuKolicinu !== undefined) {
            res += `<efis:artiklJedinicaMjereZaOsnovnuKolicinu>${xmlEscape(this.artiklJedinicaMjereZaOsnovnuKolicinu)}</efis:artiklJedinicaMjereZaOsnovnuKolicinu>`;
        }
        res += `<efis:artiklKategorijaPdv>${xmlEscape(this.artiklKategorijaPdv)}</efis:artiklKategorijaPdv>`;
        if (this.artiklStopaPdv !== undefined) {
            res += `<efis:artiklStopaPdv>${xmlEscape(this.artiklStopaPdv)}</efis:artiklStopaPdv>`;
        }
        res += `<efis:artiklNaziv>${xmlEscape(this.artiklNaziv)}</efis:artiklNaziv>`;
        if (this.artiklOpis !== undefined) {
            res += `<efis:artiklOpis>${xmlEscape(this.artiklOpis)}</efis:artiklOpis>`;
        }
        if (this.artiklHrOznakaKategorijaPdv !== undefined) {
            res += `<efis:artiklHrOznakaKategorijaPdv>${xmlEscape(this.artiklHrOznakaKategorijaPdv)}</efis:artiklHrOznakaKategorijaPdv>`;
        }
        if (this.ArtiklIdentifikatorKlasifikacija) {
            this.ArtiklIdentifikatorKlasifikacija.forEach(a => (res += a.toXmlString()));
        }
        res += "</efis:StavkaERacuna>";
        return res;
    }

    static fromXmlElement(el: XmlElement): IStavkaERacuna {
        return {
            kolicina: getElementContent(el, "efis:kolicina", FISK_NS, { restrictionName: "decimal30i10" }),
            jedinicaMjere: getElementContent(el, "efis:jedinicaMjere", FISK_NS, { restrictionName: "jedinicaMjere" }),
            neto: getElementContent(el, "efis:neto", FISK_NS, { restrictionName: "decimal2" }),
            artiklNetoCijena: getElementContent(el, "efis:artiklNetoCijena", FISK_NS, { restrictionName: "decimal30i10" }),
            artiklBrutoCijena: getOptionalElementContent(el, "efis:artiklBrutoCijena", FISK_NS, { restrictionName: "decimal30i10" }),
            artiklOsnovnaKolicina: getOptionalElementContent(el, "efis:artiklOsnovnaKolicina", FISK_NS, { restrictionName: "decimal30i10" }),
            artiklJedinicaMjereZaOsnovnuKolicinu: getOptionalElementContent(el, "efis:artiklJedinicaMjereZaOsnovnuKolicinu", FISK_NS, {
                restrictionName: "jedinicaMjere"
            }),
            artiklKategorijaPdv: getElementContent(el, "efis:artiklKategorijaPdv", FISK_NS, { restrictionName: "kategorijaPdv" }),
            artiklStopaPdv: getOptionalElementContent(el, "efis:artiklStopaPdv", FISK_NS, { restrictionName: "decimal30i10" }),
            artiklNaziv: getElementContent(el, "efis:artiklNaziv", FISK_NS, { restrictionName: "tekst1024" }),
            artiklOpis: getOptionalElementContent(el, "efis:artiklOpis", FISK_NS, { restrictionName: "tekst4096" }),
            artiklHrOznakaKategorijaPdv: getOptionalElementContent(el, "efis:artiklHrOznakaKategorijaPdv", FISK_NS, {
                restrictionName: "hrKategorijaPdv"
            }),
            ArtiklIdentifikatorKlasifikacija: extractOptionalElements(
                el,
                "efis:ArtiklIdentifikatorKlasifikacija",
                FISK_NS,
                ArtiklIdentifikatorKlasifikacija.fromXmlElement
            )
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions) {
        const groups = el.find(getBusinessGroupXpath("BG-25", type), UBL_NS) as XmlElement[];
        if (groups.length === 0) {
            const err = new ValidationError(
                `Nije pronađena ni jedna grupa 'BG-25' (${getBusinessGroupXpath("BG-25", type)}) u dokumentu '${type}'`,
                undefined
            );
            if (options?.lenient) {
                if (options.errors) {
                    options.errors.push(err);
                }
                return [];
            }
            throw err;
        }
        return groups.map(groupEl => {
            return {
                kolicina: getElementContent(groupEl, getBusinessTermXpath("BT-129", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal30i10"
                }),
                jedinicaMjere: getElementContent(groupEl, getBusinessTermXpath("BT-130", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "jedinicaMjere"
                }),
                neto: getElementContent(groupEl, getBusinessTermXpath("BT-131", type, "BG-25"), UBL_NS, { ...options, restrictionName: "decimal2" }),
                artiklNetoCijena: getElementContent(groupEl, getBusinessTermXpath("BT-146", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal30i10"
                }),
                artiklBrutoCijena: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-148", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal30i10"
                }),
                artiklOsnovnaKolicina: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-149", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal30i10"
                }),
                artiklJedinicaMjereZaOsnovnuKolicinu: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-150", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "jedinicaMjere"
                }),
                artiklKategorijaPdv: getElementContent(groupEl, getBusinessTermXpath("BT-151", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "kategorijaPdv"
                }),
                artiklStopaPdv: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-152", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal30i10"
                }),
                artiklNaziv: getElementContent(groupEl, getBusinessTermXpath("BT-153", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "tekst1024"
                }),
                artiklOpis: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-154", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "tekst4096"
                }),
                artiklHrOznakaKategorijaPdv: getOptionalElementContent(groupEl, getBusinessTermXpath("HR-BT-12", type, "BG-25"), UBL_NS, {
                    ...options,
                    restrictionName: "hrKategorijaPdv"
                }),
                ArtiklIdentifikatorKlasifikacija: extractOptionalElements(groupEl, getBusinessTermXpath("BT-158", type, "BG-25"), UBL_NS, el =>
                    ArtiklIdentifikatorKlasifikacija.fromUblElement(el, type, options)
                )
            };
        });
    }
}

export class EvidentirajERacunOdgovor implements EvidentirajERacunOdgovorSerializable {
    _id: string;
    datumVrijemeSlanja: string;
    Odgovor: Odgovor;

    constructor(args: IEvidentirajERacunOdgovor) {
        this._id = args._id;
        this.datumVrijemeSlanja = args.datumVrijemeSlanja;
        this.Odgovor = new Odgovor(args.Odgovor, "efis");
    }

    public static fromXmlElement(el: XmlElement, options?: { lenient?: boolean; errors?: ValidationError[] }): IEvidentirajERacunOdgovor {
        const { lenient = false, errors } = options || {};
        return {
            _id: getAttributeValue(el, "efis:id", FISK_NS),
            datumVrijemeSlanja: getElementContent(el, "efis:datumVrijemeSlanja", FISK_NS, { restrictionName: "datumVrijemeSlanja", lenient, errors }),
            Odgovor: extractElement(el, "efis:Odgovor", FISK_NS, odgovorEl => Odgovor.fromXmlElement(odgovorEl, options))
        };
    }

    toXmlString(): string {
        throw new Error("Method not implemented.");
    }
}
