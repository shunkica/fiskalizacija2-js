import type {
    ArtiklIdentifikatorKlasifikacijaSerializable,
    DokumentPopustSerializable,
    DokumentTrosakSerializable,
    DokumentUkupanIznosSerializable,
    GreskaSerializable,
    IArtiklIdentifikatorKlasifikacija,
    IDokumentPopust,
    IDokumentTrosak,
    IDokumentUkupanIznos,
    IGreska,
    IIzdavatelj,
    IOdgovor,
    IPrijenosSredstava,
    IPrimatelj,
    IRaspodjelaPdv,
    IzdavateljSerializable,
    OdgovorSerializable,
    PrijenosSredstavaSerializable,
    PrimateljSerializable,
    RaspodjelaPdvSerializable
} from "../types";
import type { ExtractionOptions } from "../util/xml";
import {
    normalizeDecimal,
    extractOptionalElement,
    getAttributeValue,
    getBusinessGroupXpath,
    getBusinessTermXpath,
    getElementContent,
    getOptionalAttributeValue,
    getOptionalElementContent,
    toValidatedDecimalStringOptional,
    xmlEscape
} from "../util/xml";
import type { XmlElement } from "libxml2-wasm";
import { FISK_NS, getFiskNsPrefix, UBL_NS } from "../constants/const";
import { ValidationError } from "../util/error";
import { assertRestriction } from "../constants/restrictions";

export class Izdavatelj implements IzdavateljSerializable {
    private readonly _prefix: "efis" | "eizv";
    ime: string;
    oibPorezniBroj: string;
    oibOperatera: string;

    constructor(args: IIzdavatelj, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.ime = args.ime;
        this.oibPorezniBroj = args.oibPorezniBroj;
        this.oibOperatera = args.oibOperatera;
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:Izdavatelj>`;
        res += `<${this._prefix}:ime>${xmlEscape(this.ime)}</${this._prefix}:ime>`;
        res += `<${this._prefix}:oibPorezniBroj>${xmlEscape(this.oibPorezniBroj)}</${this._prefix}:oibPorezniBroj>`;
        res += `<${this._prefix}:oibOperatera>${xmlEscape(this.oibOperatera)}</${this._prefix}:oibOperatera>`;
        res += `</${this._prefix}:Izdavatelj>`;
        return res;
    }

    static fromXmlElement(el: XmlElement): IIzdavatelj {
        const prefix = getFiskNsPrefix(el.namespaceUri);
        return {
            ime: getElementContent(el, `${prefix}:ime`, FISK_NS, { restrictionName: "tekst1024" }),
            oibPorezniBroj: getElementContent(el, `${prefix}:oibPorezniBroj`, FISK_NS, { restrictionName: "OIBTip" }),
            oibOperatera: getElementContent(el, `${prefix}:oibOperatera`, FISK_NS, { restrictionName: "OIBTip" })
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions): IIzdavatelj {
        const groupEl = el.get(getBusinessGroupXpath("BG-4", type), UBL_NS) as XmlElement | null;
        if (!groupEl) {
            const err = new ValidationError(`Grupa 'BG-4' (${getBusinessGroupXpath("BG-4", type)}) nije pronađena u dokumentu '${type}'`, undefined);
            if (options?.lenient) {
                if (options.errors) {
                    options.errors.push(err);
                }
                return {
                    ime: "",
                    oibPorezniBroj: "",
                    oibOperatera: ""
                };
            }
            throw err;
        }

        let oibPorezniBroj = getOptionalElementContent(groupEl, getBusinessTermXpath("BT-31", type, "BG-4"), UBL_NS, {
            ...options
        });

        if (oibPorezniBroj) {
            if (oibPorezniBroj.startsWith("HR")) {
                oibPorezniBroj = oibPorezniBroj.substring(2);
            }
        } else {
            oibPorezniBroj = getElementContent(groupEl, getBusinessTermXpath("BT-34", type, "BG-4"), UBL_NS, {
                ...options
            });
        }

        try {
            assertRestriction(oibPorezniBroj, "OIBTip");
        } catch (err) {
            if (err instanceof ValidationError) {
                if (options?.errors) {
                    options.errors.push(err);
                }
            }
            if (!options?.lenient) {
                throw err;
            }
        }

        return {
            ime: getElementContent(groupEl, getBusinessTermXpath("BT-27", type, "BG-4"), UBL_NS, { ...options, restrictionName: "tekst1024" }),
            oibPorezniBroj: oibPorezniBroj,
            oibOperatera: getElementContent(groupEl, getBusinessTermXpath("HR-BT-5", type, "BG-4"), UBL_NS, { ...options, restrictionName: "OIBTip" })
        };
    }
}

export class Primatelj implements PrimateljSerializable {
    private readonly _prefix: "efis" | "eizv";
    ime: string;
    oibPorezniBroj: string;

    constructor(args: IPrimatelj, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.ime = args.ime;
        this.oibPorezniBroj = args.oibPorezniBroj;
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:Primatelj>`;
        res += `<${this._prefix}:ime>${xmlEscape(this.ime)}</${this._prefix}:ime>`;
        res += `<${this._prefix}:oibPorezniBroj>${xmlEscape(this.oibPorezniBroj)}</${this._prefix}:oibPorezniBroj>`;
        res += `</${this._prefix}:Primatelj>`;
        return res;
    }

    static fromXmlElement(el: XmlElement): IPrimatelj {
        const prefix = getFiskNsPrefix(el.namespaceUri);
        return {
            ime: getElementContent(el, `${prefix}:ime`, FISK_NS, { restrictionName: "tekst1024" }),
            oibPorezniBroj: getElementContent(el, `${prefix}:oibPorezniBroj`, FISK_NS, { restrictionName: "OIBTip" })
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions): IPrimatelj {
        const groupEl = el.get(getBusinessGroupXpath("BG-7", type), UBL_NS) as XmlElement | null;
        if (!groupEl) {
            const err = new ValidationError(`Grupa 'BG-7' (${getBusinessGroupXpath("BG-7", type)}) nije pronađena u dokumentu '${type}'`, undefined);
            if (options?.lenient) {
                if (options.errors) {
                    options.errors.push(err);
                }
                return {
                    ime: "",
                    oibPorezniBroj: ""
                };
            }
            throw err;
        }
        return {
            ime: getElementContent(groupEl, getBusinessTermXpath("BT-44", type, "BG-7"), UBL_NS, { ...options, restrictionName: "tekst1024" }),
            // TODO: Iako je u specifikaciji navedeno da u ovo polje može ići OIB ili porezni broj,
            //       ako se šalje porezni broj, na demo serveru se poruka odbija sa greškom:
            //       S006: PT nije ovlaštena za dostavu podataka na fiskalizaciju.Inicijalna provjera za valjanost oib-a kod evidentiranja ulaznog eRačuna (Record: 1)
            //       stoga za sada mičemo "HR" dio iz polja BT-48
            oibPorezniBroj: getElementContent(groupEl, getBusinessTermXpath("BT-48", type, "BG-7"), UBL_NS, {
                ...options,
                restrictionName: "tekst200"
            }).replace(/^HR/, "")
        };
    }
}

export class PrijenosSredstava implements PrijenosSredstavaSerializable {
    private readonly _prefix: "efis" | "eizv";
    identifikatorRacunaZaPlacanje: string;
    nazivRacunaZaPlacanje?: string | undefined;
    identifikatorPruzateljaPlatnihUsluga?: string | undefined;

    constructor(args: IPrijenosSredstava, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.identifikatorRacunaZaPlacanje = args.identifikatorRacunaZaPlacanje;
        this.nazivRacunaZaPlacanje = args.nazivRacunaZaPlacanje;
        this.identifikatorPruzateljaPlatnihUsluga = args.identifikatorPruzateljaPlatnihUsluga;
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:PrijenosSredstava>`;
        res += `<${this._prefix}:identifikatorRacunaZaPlacanje>${xmlEscape(this.identifikatorRacunaZaPlacanje)}</${this._prefix}:identifikatorRacunaZaPlacanje>`;
        if (this.nazivRacunaZaPlacanje) {
            res += `<${this._prefix}:nazivRacunaZaPlacanje>${xmlEscape(this.nazivRacunaZaPlacanje)}</${this._prefix}:nazivRacunaZaPlacanje>`;
        }
        if (this.identifikatorPruzateljaPlatnihUsluga) {
            res += `<${this._prefix}:identifikatorPruzateljaPlatnihUsluga>${xmlEscape(this.identifikatorPruzateljaPlatnihUsluga)}</${this._prefix}:identifikatorPruzateljaPlatnihUsluga>`;
        }
        res += `</${this._prefix}:PrijenosSredstava>`;
        return res;
    }

    static fromXmlElement(el: XmlElement): IPrijenosSredstava {
        const prefix = getFiskNsPrefix(el.namespaceUri);
        return {
            identifikatorRacunaZaPlacanje: getElementContent(el, `${prefix}:identifikatorRacunaZaPlacanje`, FISK_NS, { restrictionName: "tekst200" }),
            nazivRacunaZaPlacanje: getOptionalElementContent(el, `${prefix}:nazivRacunaZaPlacanje`, FISK_NS, { restrictionName: "tekst500" }),
            identifikatorPruzateljaPlatnihUsluga: getOptionalElementContent(el, `${prefix}:identifikatorPruzateljaPlatnihUsluga`, FISK_NS, {
                restrictionName: "tekst200"
            })
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions): IPrijenosSredstava[] | undefined {
        const groups = el.find(getBusinessGroupXpath("BG-17", type), UBL_NS) as XmlElement[];
        if (groups.length === 0) {
            return undefined;
        }
        return groups.map(groupEl => {
            return {
                identifikatorRacunaZaPlacanje: getElementContent(groupEl, getBusinessTermXpath("BT-84", type, "BG-17"), UBL_NS, {
                    ...options,
                    restrictionName: "tekst200"
                }),
                nazivRacunaZaPlacanje: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-85", type, "BG-17"), UBL_NS, {
                    ...options,
                    restrictionName: "tekst500"
                }),
                identifikatorPruzateljaPlatnihUsluga: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-86", type, "BG-17"), UBL_NS, {
                    ...options,
                    restrictionName: "tekst200"
                })
            };
        });
    }
}

export class DokumentUkupanIznos implements DokumentUkupanIznosSerializable {
    private readonly _prefix: "efis" | "eizv";
    neto: number | string;
    popust?: number | string | undefined;
    trosak?: number | string | undefined;
    iznosBezPdv: number | string;
    pdv: number | string;
    iznosSPdv: number | string;
    placeniIznos?: number | string | undefined;
    iznosKojiDospijevaZaPlacanje: number | string;

    constructor(args: IDokumentUkupanIznos, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.neto = args.neto;
        this.popust = args.popust;
        this.trosak = args.trosak;
        this.iznosBezPdv = args.iznosBezPdv;
        this.pdv = args.pdv;
        this.iznosSPdv = args.iznosSPdv;
        this.placeniIznos = args.placeniIznos;
        this.iznosKojiDospijevaZaPlacanje = args.iznosKojiDospijevaZaPlacanje;
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:DokumentUkupanIznos>`;
        res += `<${this._prefix}:neto>${normalizeDecimal(this.neto, 2)}</${this._prefix}:neto>`;
        if (this.popust !== undefined) {
            res += `<${this._prefix}:popust>${normalizeDecimal(this.popust, 2)}</${this._prefix}:popust>`;
        }
        if (this.trosak !== undefined) {
            res += `<${this._prefix}:trosak>${normalizeDecimal(this.trosak, 2)}</${this._prefix}:trosak>`;
        }
        res += `<${this._prefix}:iznosBezPdv>${normalizeDecimal(this.iznosBezPdv, 2)}</${this._prefix}:iznosBezPdv>`;
        res += `<${this._prefix}:pdv>${normalizeDecimal(this.pdv, 2)}</${this._prefix}:pdv>`;
        res += `<${this._prefix}:iznosSPdv>${normalizeDecimal(this.iznosSPdv, 2)}</${this._prefix}:iznosSPdv>`;
        if (this.placeniIznos !== undefined) {
            res += `<${this._prefix}:placeniIznos>${normalizeDecimal(this.placeniIznos, 2)}</${this._prefix}:placeniIznos>`;
        }
        res += `<${this._prefix}:iznosKojiDospijevaZaPlacanje>${normalizeDecimal(this.iznosKojiDospijevaZaPlacanje, 2)}</${this._prefix}:iznosKojiDospijevaZaPlacanje>`;
        res += `</${this._prefix}:DokumentUkupanIznos>`;
        return res;
    }

    static fromXmlElement(el: XmlElement): IDokumentUkupanIznos {
        const prefix = getFiskNsPrefix(el.namespaceUri);
        return {
            neto: getElementContent(el, `${prefix}:neto`, FISK_NS, { restrictionName: "decimal2" }),
            popust: getOptionalElementContent(el, `${prefix}:popust`, FISK_NS, { restrictionName: "decimal2" }),
            trosak: getOptionalElementContent(el, `${prefix}:trosak`, FISK_NS, { restrictionName: "decimal2" }),
            iznosBezPdv: getElementContent(el, `${prefix}:iznosBezPdv`, FISK_NS, { restrictionName: "decimal2" }),
            pdv: getElementContent(el, `${prefix}:pdv`, FISK_NS, { restrictionName: "decimal2" }),
            iznosSPdv: getElementContent(el, `${prefix}:iznosSPdv`, FISK_NS, { restrictionName: "decimal2" }),
            placeniIznos: getOptionalElementContent(el, `${prefix}:placeniIznos`, FISK_NS, { restrictionName: "decimal2" }),
            iznosKojiDospijevaZaPlacanje: getElementContent(el, `${prefix}:iznosKojiDospijevaZaPlacanje`, FISK_NS, { restrictionName: "decimal2" })
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions): IDokumentUkupanIznos {
        return {
            neto: getElementContent(el, getBusinessTermXpath("BT-106", type), UBL_NS, { ...options, restrictionName: "decimal2" }),
            popust: getOptionalElementContent(el, getBusinessTermXpath("BT-107", type), UBL_NS, { ...options, restrictionName: "decimal2" }),
            trosak: getOptionalElementContent(el, getBusinessTermXpath("BT-108", type), UBL_NS, { ...options, restrictionName: "decimal2" }),
            iznosBezPdv: getElementContent(el, getBusinessTermXpath("BT-109", type), UBL_NS, { ...options, restrictionName: "decimal2" }),
            /** BT-110 nije obvezan u specifikaciji eRacuna, ali je pdv obvezan u specifikaciji fiskalizacije */
            pdv: getOptionalElementContent(el, getBusinessTermXpath("BT-110", type), UBL_NS, { ...options, restrictionName: "decimal2" }) || 0,
            iznosSPdv: getElementContent(el, getBusinessTermXpath("BT-112", type), UBL_NS, { ...options, restrictionName: "decimal2" }),
            placeniIznos: getOptionalElementContent(el, getBusinessTermXpath("BT-113", type), UBL_NS, { ...options, restrictionName: "decimal2" }),
            iznosKojiDospijevaZaPlacanje: getElementContent(el, getBusinessTermXpath("BT-115", type), UBL_NS, {
                ...options,
                restrictionName: "decimal2"
            })
        };
    }
}

export class RaspodjelaPdv implements RaspodjelaPdvSerializable {
    private readonly _prefix: "efis" | "eizv";
    kategorijaPdv: string;
    oporeziviIznos: number | string;
    iznosPoreza: number | string;
    stopa?: string | undefined;
    razlogOslobodenja?: string | undefined;
    tekstRazlogaOslobodenja?: string | undefined;
    hrOznakaKategorijaPdv?: string | undefined;

    constructor(args: IRaspodjelaPdv, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.kategorijaPdv = args.kategorijaPdv;
        this.oporeziviIznos = args.oporeziviIznos;
        this.iznosPoreza = args.iznosPoreza;
        this.stopa = toValidatedDecimalStringOptional(args.stopa);
        this.razlogOslobodenja = args.razlogOslobodenja;
        this.tekstRazlogaOslobodenja = args.tekstRazlogaOslobodenja;
        this.hrOznakaKategorijaPdv = args.hrOznakaKategorijaPdv;
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:RaspodjelaPdv>`;
        res += `<${this._prefix}:kategorijaPdv>${xmlEscape(this.kategorijaPdv)}</${this._prefix}:kategorijaPdv>`;
        res += `<${this._prefix}:oporeziviIznos>${normalizeDecimal(this.oporeziviIznos, 2)}</${this._prefix}:oporeziviIznos>`;
        res += `<${this._prefix}:iznosPoreza>${normalizeDecimal(this.iznosPoreza, 2)}</${this._prefix}:iznosPoreza>`;
        if (this.stopa !== undefined) {
            res += `<${this._prefix}:stopa>${xmlEscape(this.stopa)}</${this._prefix}:stopa>`;
        }
        if (this.razlogOslobodenja !== undefined) {
            res += `<${this._prefix}:razlogOslobodenja>${xmlEscape(this.razlogOslobodenja)}</${this._prefix}:razlogOslobodenja>`;
        }
        if (this.tekstRazlogaOslobodenja !== undefined) {
            res += `<${this._prefix}:tekstRazlogaOslobodenja>${xmlEscape(this.tekstRazlogaOslobodenja)}</${this._prefix}:tekstRazlogaOslobodenja>`;
        }
        if (this.hrOznakaKategorijaPdv !== undefined) {
            res += `<${this._prefix}:hrOznakaKategorijaPdv>${xmlEscape(this.hrOznakaKategorijaPdv)}</${this._prefix}:hrOznakaKategorijaPdv>`;
        }
        res += `</${this._prefix}:RaspodjelaPdv>`;
        return res;
    }

    static fromXmlElement(el: XmlElement): IRaspodjelaPdv {
        const prefix = getFiskNsPrefix(el.namespaceUri);
        return {
            kategorijaPdv: getElementContent(el, `${prefix}:kategorijaPdv`, FISK_NS, { restrictionName: "kategorijaPdv" }),
            oporeziviIznos: getElementContent(el, `${prefix}:oporeziviIznos`, FISK_NS, { restrictionName: "decimal2" }),
            iznosPoreza: getElementContent(el, `${prefix}:iznosPoreza`, FISK_NS, { restrictionName: "decimal2" }),
            stopa: getOptionalElementContent(el, `${prefix}:stopa`, FISK_NS, { restrictionName: "decimal30i10" }),
            razlogOslobodenja: getOptionalElementContent(el, `${prefix}:razlogOslobodenja`, FISK_NS, { restrictionName: "izuzecePdv" }),
            tekstRazlogaOslobodenja: getOptionalElementContent(el, `${prefix}:tekstRazlogaOslobodenja`, FISK_NS, { restrictionName: "tekst1024" }),
            hrOznakaKategorijaPdv: getOptionalElementContent(el, `${prefix}:hrOznakaKategorijaPdv`, FISK_NS, { restrictionName: "hrKategorijaPdv" })
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions): IRaspodjelaPdv[] {
        const hrfiskGroups = el.find(getBusinessGroupXpath("HR-BG-2", type), UBL_NS) as XmlElement[];
        if (hrfiskGroups.length > 0) {
            return hrfiskGroups.map(groupEl => {
                return {
                    kategorijaPdv: getElementContent(groupEl, getBusinessTermXpath("HR-BT-18", type, "HR-BG-2"), UBL_NS, {
                        ...options,
                        restrictionName: "kategorijaPdv"
                    }),
                    oporeziviIznos: getElementContent(groupEl, getBusinessTermXpath("HR-BT-16", type, "HR-BG-2"), UBL_NS, {
                        ...options,
                        restrictionName: "decimal2"
                    }),
                    iznosPoreza: getElementContent(groupEl, getBusinessTermXpath("HR-BT-17", type, "HR-BG-2"), UBL_NS, {
                        ...options,
                        restrictionName: "decimal2"
                    }),
                    stopa: getOptionalElementContent(groupEl, getBusinessTermXpath("HR-BT-19", type, "HR-BG-2"), UBL_NS, {
                        ...options,
                        restrictionName: "decimal30i10"
                    }),
                    razlogOslobodenja: getOptionalElementContent(groupEl, getBusinessTermXpath("HR-BT-21", type, "HR-BG-2"), UBL_NS, {
                        ...options,
                        restrictionName: "izuzecePdv"
                    }),
                    tekstRazlogaOslobodenja: getOptionalElementContent(groupEl, getBusinessTermXpath("HR-BT-20", type, "HR-BG-2"), UBL_NS, {
                        ...options,
                        restrictionName: "tekst1024"
                    }),
                    hrOznakaKategorijaPdv: getOptionalElementContent(groupEl, getBusinessTermXpath("HR-BT-22", type, "HR-BG-2"), UBL_NS, {
                        ...options,
                        restrictionName: "hrKategorijaPdv"
                    })
                };
            });
        }

        const groups = el.find(getBusinessGroupXpath("BG-23", type), UBL_NS) as XmlElement[];
        if (groups.length === 0) {
            const err = new ValidationError(
                `Nije pronađena ni jedna grupa 'BG-23' (${getBusinessGroupXpath("BG-23", type)}) u dokumentu '${type}'`,
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
                kategorijaPdv: getElementContent(groupEl, getBusinessTermXpath("BT-118", type, "BG-23"), UBL_NS, {
                    ...options,
                    restrictionName: "kategorijaPdv"
                }),
                oporeziviIznos: getElementContent(groupEl, getBusinessTermXpath("BT-116", type, "BG-23"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal2"
                }),
                iznosPoreza: getElementContent(groupEl, getBusinessTermXpath("BT-117", type, "BG-23"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal2"
                }),
                stopa: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-119", type, "BG-23"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal30i10"
                }),
                razlogOslobodenja: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-121", type, "BG-23"), UBL_NS, {
                    ...options,
                    restrictionName: "izuzecePdv"
                }),
                tekstRazlogaOslobodenja: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-120", type, "BG-23"), UBL_NS, {
                    ...options,
                    restrictionName: "tekst1024"
                }),
                hrOznakaKategorijaPdv: undefined
            };
        });
    }
}

export class ArtiklIdentifikatorKlasifikacija implements ArtiklIdentifikatorKlasifikacijaSerializable {
    private readonly _prefix: "efis" | "eizv";
    identifikatorKlasifikacije: string;
    identifikatorSheme: string;
    verzijaSheme?: string | undefined;

    constructor(args: IArtiklIdentifikatorKlasifikacija, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.identifikatorKlasifikacije = args.identifikatorKlasifikacije;
        this.identifikatorSheme = args.identifikatorSheme;
        this.verzijaSheme = args.verzijaSheme;
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:ArtiklIdentifikatorKlasifikacija>`;
        res += `<${this._prefix}:identifikatorKlasifikacije>${xmlEscape(this.identifikatorKlasifikacije)}</${this._prefix}:identifikatorKlasifikacije>`;
        res += `<${this._prefix}:identifikatorSheme>${xmlEscape(this.identifikatorSheme)}</${this._prefix}:identifikatorSheme>`;
        if (this.verzijaSheme !== undefined) {
            res += `<${this._prefix}:verzijaSheme>${xmlEscape(this.verzijaSheme)}</${this._prefix}:verzijaSheme>`;
        }
        res += `</${this._prefix}:ArtiklIdentifikatorKlasifikacija>`;
        return res;
    }

    static fromXmlElement(el: XmlElement): IArtiklIdentifikatorKlasifikacija {
        const prefix = getFiskNsPrefix(el.namespaceUri);
        return {
            identifikatorKlasifikacije: getElementContent(el, `${prefix}:identifikatorKlasifikacije`, FISK_NS, { restrictionName: "tekst10" }),
            identifikatorSheme: getElementContent(el, `${prefix}:identifikatorSheme`, FISK_NS, { restrictionName: "klasifikacijaArtikla" }),
            verzijaSheme: getOptionalElementContent(el, `${prefix}:verzijaSheme`, FISK_NS, { restrictionName: "tekst10" })
        };
    }

    static fromUblElement(el: XmlElement, _type: "Invoice" | "CreditNote", options?: ExtractionOptions) {
        return {
            identifikatorKlasifikacije: getElementContent(el, ".", UBL_NS, { ...options, restrictionName: "tekst10" }),
            identifikatorSheme: getAttributeValue(el, "listID", UBL_NS),
            verzijaSheme: getOptionalAttributeValue(el, "listVersionID", UBL_NS) || undefined
        };
    }
}

export class Odgovor implements OdgovorSerializable {
    private readonly _prefix: "efis" | "eizv";
    idZahtjeva: string;
    prihvacenZahtjev: boolean;
    greska?: Greska | undefined;

    constructor(props: IOdgovor, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.idZahtjeva = props.idZahtjeva;
        this.prihvacenZahtjev = props.prihvacenZahtjev;
        if (props.greska) {
            this.greska = new Greska(props.greska, prefix);
        }
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:Odgovor>`;
        res += `<${this._prefix}:idZahtjeva>${xmlEscape(this.idZahtjeva)}</${this._prefix}:idZahtjeva>`;
        res += `<${this._prefix}:prihvacenZahtjev>${this.prihvacenZahtjev}</${this._prefix}:prihvacenZahtjev>`;
        if (this.greska) {
            res += this.greska.toXmlString();
        }
        res += `</${this._prefix}:Odgovor>`;
        return res;
    }

    public static fromXmlElement(el: XmlElement, options?: { lenient?: boolean; errors?: ValidationError[] }): IOdgovor {
        const { lenient = false, errors } = options || {};
        const prefix = getFiskNsPrefix(el.namespaceUri);
        return {
            idZahtjeva: getElementContent(el, `${prefix}:idZahtjeva`, FISK_NS, { restrictionName: "uuid", lenient, errors }),
            prihvacenZahtjev:
                getElementContent(el, `${prefix}:prihvacenZahtjev`, FISK_NS, { restrictionName: "boolean", lenient, errors }) === "true",
            greska: extractOptionalElement(el, `${prefix}:greska`, FISK_NS, greskaEl => Greska.fromXmlElement(greskaEl, options))
        };
    }
}

export class Greska implements GreskaSerializable {
    private readonly _prefix: "efis" | "eizv";
    sifra: string;
    redniBrojZapisa: string;
    opis: string;

    constructor(props: IGreska, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.sifra = props.sifra;
        this.redniBrojZapisa = props.redniBrojZapisa;
        this.opis = props.opis;
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:Greska>`;
        res += `<${this._prefix}:sifra>${xmlEscape(this.sifra)}</${this._prefix}:sifra>`;
        res += `<${this._prefix}:redniBrojZapisa>${xmlEscape(this.redniBrojZapisa)}</${this._prefix}:redniBrojZapisa>`;
        res += `<${this._prefix}:opis>${xmlEscape(this.opis)}</${this._prefix}:opis>`;
        res += `</${this._prefix}:Greska>`;
        return res;
    }

    static fromXmlElement(el: XmlElement, options?: { lenient?: boolean; errors?: ValidationError[] }): IGreska {
        const { lenient = false, errors } = options || {};
        const prefix = getFiskNsPrefix(el.namespaceUri);
        const greskaRestriction = prefix === "efis" ? "fiskalizacija_greska" : "izvjestavanje_greska";
        return {
            sifra: getElementContent(el, `${prefix}:sifra`, FISK_NS, { restrictionName: greskaRestriction, lenient, errors }),
            redniBrojZapisa: getElementContent(el, `${prefix}:redniBrojZapisa`, FISK_NS, { restrictionName: "integer", lenient, errors }),
            opis: getElementContent(el, `${prefix}:opis`, FISK_NS, { restrictionName: "tekst1024", lenient, errors })
        };
    }
}

export class DokumentPopust implements DokumentPopustSerializable {
    private readonly _prefix: "efis" | "eizv";
    iznosPopust: number | string;
    kategorijaPdv: string;
    stopaPdv?: string | undefined;
    tekstRazlogaPopusta?: string | undefined;
    razlogPopusta?: string | undefined;

    constructor(args: IDokumentPopust, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.iznosPopust = args.iznosPopust;
        this.kategorijaPdv = args.kategorijaPdv;
        this.stopaPdv = toValidatedDecimalStringOptional(args.stopaPdv);
        this.tekstRazlogaPopusta = args.tekstRazlogaPopusta;
        this.razlogPopusta = args.razlogPopusta;
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:DokumentPopust>`;
        res += `<${this._prefix}:iznosPopust>${normalizeDecimal(this.iznosPopust, 2)}</${this._prefix}:iznosPopust>`;
        res += `<${this._prefix}:kategorijaPdv>${xmlEscape(this.kategorijaPdv)}</${this._prefix}:kategorijaPdv>`;
        if (this.stopaPdv !== undefined) {
            res += `<${this._prefix}:stopaPdv>${xmlEscape(this.stopaPdv)}</${this._prefix}:stopaPdv>`;
        }
        if (this.tekstRazlogaPopusta !== undefined) {
            res += `<${this._prefix}:tekstRazlogaPopusta>${xmlEscape(this.tekstRazlogaPopusta)}</${this._prefix}:tekstRazlogaPopusta>`;
        }
        if (this.razlogPopusta !== undefined) {
            res += `<${this._prefix}:razlogPopusta>${xmlEscape(this.razlogPopusta)}</${this._prefix}:razlogPopusta>`;
        }
        res += `</${this._prefix}:DokumentPopust>`;
        return res;
    }

    static fromXmlElement(el: XmlElement): IDokumentPopust {
        const prefix = getFiskNsPrefix(el.namespaceUri);
        return {
            iznosPopust: getElementContent(el, `${prefix}:iznosPopust`, FISK_NS, { restrictionName: "decimal2" }),
            kategorijaPdv: getElementContent(el, `${prefix}:kategorijaPdv`, FISK_NS, { restrictionName: "kategorijaPdv" }),
            stopaPdv: getOptionalElementContent(el, `${prefix}:stopaPdv`, FISK_NS, { restrictionName: "decimal30i10" }),
            tekstRazlogaPopusta: getOptionalElementContent(el, `${prefix}:tekstRazlogaPopusta`, FISK_NS, { restrictionName: "tekst1024" }),
            razlogPopusta: getOptionalElementContent(el, `${prefix}:razlogPopusta`, FISK_NS, { restrictionName: "razlogPopusta" })
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions): IDokumentPopust[] | undefined {
        const groups = el.find(getBusinessGroupXpath("BG-20", type), UBL_NS) as XmlElement[];
        if (groups.length === 0) {
            return undefined;
        }
        // Filter only AllowanceCharge elements where ChargeIndicator is false (discounts)
        const filteredGroups = groups.filter(groupEl => {
            const chargeIndicator = getOptionalElementContent(groupEl, "cbc:ChargeIndicator", UBL_NS, {
                restrictionName: "boolean"
            });
            return chargeIndicator === "false";
        });
        if (filteredGroups.length === 0) {
            return undefined;
        }
        return filteredGroups.map(groupEl => {
            return {
                iznosPopust: getElementContent(groupEl, getBusinessTermXpath("BT-92", type, "BG-20"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal2"
                }),
                kategorijaPdv: getElementContent(groupEl, getBusinessTermXpath("BT-95", type, "BG-20"), UBL_NS, {
                    ...options,
                    restrictionName: "kategorijaPdv"
                }),
                stopaPdv: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-96", type, "BG-20"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal30i10"
                }),
                tekstRazlogaPopusta: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-97", type, "BG-20"), UBL_NS, {
                    ...options,
                    restrictionName: "tekst1024"
                }),
                razlogPopusta: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-98", type, "BG-20"), UBL_NS, {
                    ...options,
                    restrictionName: "razlogPopusta"
                })
            };
        });
    }
}

export class DokumentTrosak implements DokumentTrosakSerializable {
    private readonly _prefix: "efis" | "eizv";
    iznosTrosak: number | string;
    kategorijaPdv: string;
    hrOznakaPorezneKategorije?: string | undefined;
    stopaPdv?: string | undefined;
    tekstRazlogaOslobodenjaPdv?: string | undefined;
    razlogOslobodenjaPdv?: string | undefined;

    constructor(args: IDokumentTrosak, prefix: "efis" | "eizv") {
        this._prefix = prefix;
        this.iznosTrosak = args.iznosTrosak;
        this.kategorijaPdv = args.kategorijaPdv;
        this.hrOznakaPorezneKategorije = args.hrOznakaPorezneKategorije;
        this.stopaPdv = toValidatedDecimalStringOptional(args.stopaPdv);
        this.tekstRazlogaOslobodenjaPdv = args.tekstRazlogaOslobodenjaPdv;
        this.razlogOslobodenjaPdv = args.razlogOslobodenjaPdv;
    }

    toXmlString(): string {
        let res = "";
        res += `<${this._prefix}:DokumentTrosak>`;
        res += `<${this._prefix}:iznosTrosak>${normalizeDecimal(this.iznosTrosak, 2)}</${this._prefix}:iznosTrosak>`;
        res += `<${this._prefix}:kategorijaPdv>${xmlEscape(this.kategorijaPdv)}</${this._prefix}:kategorijaPdv>`;
        if (this.hrOznakaPorezneKategorije !== undefined) {
            res += `<${this._prefix}:hrOznakaPorezneKategorije>${xmlEscape(this.hrOznakaPorezneKategorije)}</${this._prefix}:hrOznakaPorezneKategorije>`;
        }
        if (this.stopaPdv !== undefined) {
            res += `<${this._prefix}:stopaPdv>${xmlEscape(this.stopaPdv)}</${this._prefix}:stopaPdv>`;
        }
        if (this.tekstRazlogaOslobodenjaPdv !== undefined) {
            res += `<${this._prefix}:tekstRazlogaOslobodenjaPdv>${xmlEscape(this.tekstRazlogaOslobodenjaPdv)}</${this._prefix}:tekstRazlogaOslobodenjaPdv>`;
        }
        if (this.razlogOslobodenjaPdv !== undefined) {
            res += `<${this._prefix}:razlogOslobodenjaPdv>${xmlEscape(this.razlogOslobodenjaPdv)}</${this._prefix}:razlogOslobodenjaPdv>`;
        }
        res += `</${this._prefix}:DokumentTrosak>`;
        return res;
    }

    static fromXmlElement(el: XmlElement): IDokumentTrosak {
        const prefix = getFiskNsPrefix(el.namespaceUri);
        return {
            iznosTrosak: getElementContent(el, `${prefix}:iznosTrosak`, FISK_NS, { restrictionName: "decimal2" }),
            kategorijaPdv: getElementContent(el, `${prefix}:kategorijaPdv`, FISK_NS, { restrictionName: "kategorijaPdv" }),
            hrOznakaPorezneKategorije: getOptionalElementContent(el, `${prefix}:hrOznakaPorezneKategorije`, FISK_NS, {
                restrictionName: "hrKategorijaPdv"
            }),
            stopaPdv: getOptionalElementContent(el, `${prefix}:stopaPdv`, FISK_NS, { restrictionName: "decimal30i10" }),
            tekstRazlogaOslobodenjaPdv: getOptionalElementContent(el, `${prefix}:tekstRazlogaOslobodenjaPdv`, FISK_NS, {
                restrictionName: "tekst1024"
            }),
            razlogOslobodenjaPdv: getOptionalElementContent(el, `${prefix}:razlogOslobodenjaPdv`, FISK_NS, { restrictionName: "izuzecePdv" })
        };
    }

    static fromUblElement(el: XmlElement, type: "Invoice" | "CreditNote", options?: ExtractionOptions): IDokumentTrosak[] | undefined {
        const groups = el.find(getBusinessGroupXpath("BG-21", type), UBL_NS) as XmlElement[];
        if (groups.length === 0) {
            return undefined;
        }
        // Filter only AllowanceCharge elements where ChargeIndicator is true (charges)
        const filteredGroups = groups.filter(groupEl => {
            const chargeIndicator = getOptionalElementContent(groupEl, "cbc:ChargeIndicator", UBL_NS, {
                restrictionName: "boolean"
            });
            return chargeIndicator === "true";
        });
        if (filteredGroups.length === 0) {
            return undefined;
        }
        return filteredGroups.map(groupEl => {
            return {
                iznosTrosak: getElementContent(groupEl, getBusinessTermXpath("BT-99", type, "BG-21"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal2"
                }),
                kategorijaPdv: getElementContent(groupEl, getBusinessTermXpath("BT-102", type, "BG-21"), UBL_NS, {
                    ...options,
                    restrictionName: "kategorijaPdv"
                }),
                hrOznakaPorezneKategorije: getOptionalElementContent(groupEl, getBusinessTermXpath("HR-BT-6", type, "BG-21"), UBL_NS, {
                    ...options,
                    restrictionName: "hrKategorijaPdv"
                }),
                stopaPdv: getOptionalElementContent(groupEl, getBusinessTermXpath("BT-103", type, "BG-21"), UBL_NS, {
                    ...options,
                    restrictionName: "decimal30i10"
                }),
                tekstRazlogaOslobodenjaPdv: getOptionalElementContent(groupEl, getBusinessTermXpath("HR-BT-7", type, "BG-21"), UBL_NS, {
                    ...options,
                    restrictionName: "tekst1024"
                }),
                razlogOslobodenjaPdv: getOptionalElementContent(groupEl, getBusinessTermXpath("HR-BT-8", type, "BG-21"), UBL_NS, {
                    ...options,
                    restrictionName: "izuzecePdv"
                })
            };
        });
    }
}
