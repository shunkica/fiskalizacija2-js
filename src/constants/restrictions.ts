import { ValidationError } from "../util/error";
import { DateTime } from "luxon";

export type ValidatorFunction = (value: string, restriction: RestrictionType) => void;

export type DateRestrictionType = {
    type: "date";
    regex?: RegExp;
    minInclusive?: DateTime;
    maxInclusive?: DateTime;
    validator?: ValidatorFunction;
};

export type NumberRestrictionType = {
    type: "number";
    regex?: RegExp;
    totalDigits?: number;
    fractionDigits?: number;
    validator?: ValidatorFunction;
};

export type StringRestrictionType = {
    type: "string";
    regex?: RegExp;
    enumeration?: string[];
    minLength?: number;
    maxLength?: number;
    validator?: ValidatorFunction;
};

export type RestrictionType = DateRestrictionType | NumberRestrictionType | StringRestrictionType;

export const RESTRICTIONS: { [key: string]: RestrictionType } = {
    integer: {
        type: "number",
        regex: /^\d+$/
    },
    boolean: {
        type: "string",
        enumeration: ["true", "false", "1", "0"]
    },
    datumVrijemeSlanja: {
        type: "date",
        regex: /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{4}$/,
        minInclusive: DateTime.fromISO("2026-01-01T00:00:00.0000", { zone: "Europe/Zagreb" }),
        maxInclusive: DateTime.fromISO("2100-01-01T00:00:00.0000", { zone: "Europe/Zagreb" })
    },
    fiskalizacija_vrstaERacuna: {
        type: "string",
        enumeration: ["I", "U"]
    },
    izvjestavanje_vrstaERacuna: {
        type: "string",
        enumeration: ["IR"]
    },
    datum: {
        type: "date",
        regex: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
        maxInclusive: DateTime.fromISO("2100-01-01", { zone: "Europe/Zagreb" })
    },
    datumIzdavanja: {
        type: "date",
        regex: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
        minInclusive: DateTime.fromISO("2026-01-01", { zone: "Europe/Zagreb" }),
        maxInclusive: DateTime.fromISO("2100-01-01", { zone: "Europe/Zagreb" })
    },
    razlogOdbijanja: {
        type: "string",
        enumeration: ["N", "U", "O"]
    },
    uuid: {
        type: "string",
        regex: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
    },
    jedinicaMjere: {
        type: "string",
        regex: /^[A-Z0-9]{2,3}$/
    },
    izuzecePdv: {
        type: "string",
        enumeration: [
            "VATEX-EU-79-C",
            "vatex-eu-79-c",
            "VATEX-EU-132",
            "vatex-eu-132",
            "VATEX-EU-132-1A",
            "vatex-eu-132-1a",
            "VATEX-EU-132-1B",
            "vatex-eu-132-1b",
            "VATEX-EU-132-1C",
            "vatex-eu-132-1c",
            "VATEX-EU-132-1D",
            "vatex-eu-132-1d",
            "VATEX-EU-132-1E",
            "vatex-eu-132-1e",
            "VATEX-EU-132-1F",
            "vatex-eu-132-1f",
            "VATEX-EU-132-1G",
            "vatex-eu-132-1g",
            "VATEX-EU-132-1H",
            "vatex-eu-132-1h",
            "VATEX-EU-132-1I",
            "vatex-eu-132-1i",
            "VATEX-EU-132-1J",
            "vatex-eu-132-1j",
            "VATEX-EU-132-1K",
            "vatex-eu-132-1k",
            "VATEX-EU-132-1L",
            "vatex-eu-132-1l",
            "VATEX-EU-132-1M",
            "vatex-eu-132-1m",
            "VATEX-EU-132-1N",
            "vatex-eu-132-1n",
            "VATEX-EU-132-1O",
            "vatex-eu-132-1o",
            "VATEX-EU-132-1P",
            "vatex-eu-132-1p",
            "VATEX-EU-132-1Q",
            "vatex-eu-132-1q",
            "VATEX-EU-143",
            "vatex-eu-143",
            "VATEX-EU-143-1A",
            "vatex-eu-143-1a",
            "VATEX-EU-143-1B",
            "vatex-eu-143-1b",
            "VATEX-EU-143-1C",
            "vatex-eu-143-1c",
            "VATEX-EU-143-1D",
            "vatex-eu-143-1d",
            "VATEX-EU-143-1E",
            "vatex-eu-143-1e",
            "VATEX-EU-143-1F",
            "vatex-eu-143-1f",
            "VATEX-EU-143-1FA",
            "vatex-eu-143-1fa",
            "VATEX-EU-143-1G",
            "vatex-eu-143-1g",
            "VATEX-EU-143-1H",
            "vatex-eu-143-1h",
            "VATEX-EU-143-1I",
            "vatex-eu-143-1i",
            "VATEX-EU-143-1J",
            "vatex-eu-143-1j",
            "VATEX-EU-143-1K",
            "vatex-eu-143-1k",
            "VATEX-EU-143-1L",
            "vatex-eu-143-1l",
            "VATEX-EU-148",
            "vatex-eu-148",
            "VATEX-EU-148-A",
            "vatex-eu-148-a",
            "VATEX-EU-148-B",
            "vatex-eu-148-b",
            "VATEX-EU-148-C",
            "vatex-eu-148-c",
            "VATEX-EU-148-D",
            "vatex-eu-148-d",
            "VATEX-EU-148-E",
            "vatex-eu-148-e",
            "VATEX-EU-148-F",
            "vatex-eu-148-f",
            "VATEX-EU-148-G",
            "vatex-eu-148-g",
            "VATEX-EU-151",
            "vatex-eu-151",
            "VATEX-EU-151-1A",
            "vatex-eu-151-1a",
            "VATEX-EU-151-1AA",
            "vatex-eu-151-1aa",
            "VATEX-EU-151-1B",
            "vatex-eu-151-1b",
            "VATEX-EU-151-1C",
            "vatex-eu-151-1c",
            "VATEX-EU-151-1D",
            "vatex-eu-151-1d",
            "VATEX-EU-151-1E",
            "vatex-eu-151-1e",
            "VATEX-EU-309",
            "vatex-eu-309",
            "VATEX-EU-AE",
            "vatex-eu-ae",
            "VATEX-EU-D",
            "vatex-eu-d",
            "VATEX-EU-F",
            "vatex-eu-f",
            "VATEX-EU-G",
            "vatex-eu-g",
            "VATEX-EU-I",
            "vatex-eu-i",
            "VATEX-EU-IC",
            "vatex-eu-ic",
            "VATEX-EU-J",
            "vatex-eu-j",
            "VATEX-EU-O",
            "vatex-eu-o",
            "VATEX-FR-FRANCHISE",
            "vatex-fr-franchise",
            "VATEX-FR-CNWVAT",
            "vatex-fr-cnwvat"
        ]
    },
    valuta: {
        type: "string",
        regex: /^[A-Z]{3}$/,
        enumeration: [
            "AED",
            "AFN",
            "ALL",
            "AMD",
            "ANG",
            "AOA",
            "ARS",
            "AUD",
            "AWG",
            "AZN",
            "BAM",
            "BBD",
            "BDT",
            "BGN",
            "BHD",
            "BIF",
            "BMD",
            "BND",
            "BOB",
            "BOV",
            "BRL",
            "BSD",
            "BTN",
            "BWP",
            "BYN",
            "BZD",
            "CAD",
            "CDF",
            "CHE",
            "CHF",
            "CHW",
            "CLF",
            "CLP",
            "CNY",
            "COP",
            "COU",
            "CRC",
            "CUC",
            "CUP",
            "CVE",
            "CZK",
            "DJF",
            "DKK",
            "DOP",
            "DZD",
            "EGP",
            "ERN",
            "ETB",
            "EUR",
            "FJD",
            "FKP",
            "GBP",
            "GEL",
            "GHS",
            "GIP",
            "GMD",
            "GNF",
            "GTQ",
            "GYD",
            "HKD",
            "HNL",
            "HRK",
            "HTG",
            "HUF",
            "IDR",
            "ILS",
            "INR",
            "IQD",
            "IRR",
            "ISK",
            "JMD",
            "JOD",
            "JPY",
            "KES",
            "KGS",
            "KHR",
            "KMF",
            "KPW",
            "KRW",
            "KWD",
            "KYD",
            "KZT",
            "LAK",
            "LBP",
            "LKR",
            "LRD",
            "LSL",
            "LYD",
            "MAD",
            "MDL",
            "MGA",
            "MKD",
            "MMK",
            "MNT",
            "MOP",
            "MRU",
            "MUR",
            "MVR",
            "MWK",
            "MXN",
            "MXV",
            "MYR",
            "MZN",
            "NAD",
            "NGN",
            "NIO",
            "NOK",
            "NPR",
            "NZD",
            "OMR",
            "PAB",
            "PEN",
            "PGK",
            "PHP",
            "PKR",
            "PLN",
            "PYG",
            "QAR",
            "RON",
            "RSD",
            "RUB",
            "RWF",
            "SAR",
            "SBD",
            "SCR",
            "SDG",
            "SEK",
            "SGD",
            "SHP",
            "SLE",
            "SLL",
            "SOS",
            "SRD",
            "SSP",
            "STN",
            "SVC",
            "SYP",
            "SZL",
            "THB",
            "TJS",
            "TMT",
            "TND",
            "TOP",
            "TRY",
            "TTD",
            "TWD",
            "TZS",
            "UAH",
            "UGX",
            "USD",
            "USN",
            "UYI",
            "UYU",
            "UYW",
            "UZS",
            "VES",
            "VND",
            "VUV",
            "WST",
            "XAF",
            "XAG",
            "XAU",
            "XBA",
            "XBB",
            "XBC",
            "XBD",
            "XCD",
            "XDR",
            "XOF",
            "XPD",
            "XPF",
            "XPT",
            "XSU",
            "XTS",
            "XUA",
            "XXX",
            "YER",
            "ZAR",
            "ZMW",
            "ZWL"
        ]
    },
    vrstaDokumenta: {
        type: "string",
        enumeration: [
            "71",
            "80",
            "81",
            "82",
            "83",
            "84",
            "102",
            "130",
            "202",
            "203",
            "204",
            "211",
            "218",
            "219",
            "261",
            "262",
            "295",
            "296",
            "308",
            "325",
            "326",
            "331",
            "380",
            "381",
            "382",
            "383",
            "384",
            "385",
            "386",
            "387",
            "388",
            "389",
            "390",
            "393",
            "394",
            "395",
            "396",
            "420",
            "456",
            "457",
            "458",
            "527",
            "532",
            "553",
            "575",
            "623",
            "633",
            "751",
            "780",
            "817",
            "870",
            "875",
            "876",
            "877",
            "935"
        ]
    },
    nacinPlacanja: {
        type: "string",
        enumeration: ["T", "O", "Z"]
    },
    kategorijaPdv: {
        type: "string",
        enumeration: ["S", "O", "E", "AE", "Z", "K", "G", "L", "M"]
    },
    klasifikacijaArtikla: {
        type: "string",
        enumeration: ["CG"]
    },
    hrKategorijaPdv: {
        type: "string",
        enumeration: ["HR:PDV25", "HR:PDV13", "HR:PDV5", "HR:Z", "HR:K", "HR:G", "HR:AE", "HR:E", "HR:POVNAK", "HR:PP", "HR:PPMV", "HR:O", "HR:N"]
    },
    razlogPopusta: {
        type: "string",
        enumeration: ["64", "95", "100", "102", "103", "104", "105", "106", "109", "98"]
    },
    OIBTip: {
        type: "string",
        regex: /^\d{11}$/,
        validator: (value, _) => {
            // OIB validation using ISO 7064, MOD 11-10 algorithm
            if (value.length !== 11) {
                throw new ValidationError(`[OIBTip] OIB mora sadržavati točno 11 znamenki: ${value}`, value);
            }
            let checksum = 10;
            for (let i = 0; i < 10; i++) {
                checksum = (checksum + parseInt(value[i], 10)) % 10;
                if (checksum === 0) {
                    checksum = 10;
                }
                checksum = (checksum * 2) % 11;
            }
            const controlDigit = (11 - checksum) % 10;
            if (controlDigit !== parseInt(value[10], 10)) {
                throw new ValidationError(`[OIBTip] Neispravan kontrolni broj OIB-a: ${value}`, value);
            }
        }
    },
    tekst10: {
        type: "string",
        minLength: 1,
        maxLength: 10
    },
    tekst100: {
        type: "string",
        minLength: 1,
        maxLength: 100
    },
    tekst200: {
        type: "string",
        minLength: 1,
        maxLength: 200
    },
    tekst500: {
        type: "string",
        minLength: 1,
        maxLength: 500
    },
    tekst1024: {
        type: "string",
        minLength: 1,
        maxLength: 1024
    },
    tekst4096: {
        type: "string",
        minLength: 1,
        maxLength: 4096
    },
    decimal2: {
        type: "number",
        totalDigits: 20,
        fractionDigits: 2
    },
    decimal30i10: {
        type: "number",
        totalDigits: 30,
        fractionDigits: 10
    },
    fiskalizacija_greska: {
        type: "string",
        enumeration: ["S001", "S002", "S003", "S004", "S005", "S006", "S007", "S008", "S011", "S012"]
    },
    izvjestavanje_greska: {
        type: "string",
        enumeration: ["S001", "S002", "S003", "S004", "S005", "S006", "S007", "S008", "S009", "S010", "S011", "S012"]
    }
};

export type RestrictionName = keyof typeof RESTRICTIONS;

export function assertRestriction(value: string, restrictionName: RestrictionName) {
    const restriction = RESTRICTIONS[restrictionName];

    // Call custom validator first if present
    if (restriction.validator) {
        restriction.validator(value, restriction);
    }

    if (restriction.regex && !restriction.regex.test(value)) {
        throw new ValidationError(`[${restrictionName}] Vrijednost ne zadovoljava regex '${restriction.regex}'`, value);
    }

    if (restriction.type === "string") {
        if (restriction.enumeration && !restriction.enumeration.includes(value)) {
            throw new ValidationError(
                `[${restriction.enumeration}] Vrijednost ne zadovoljava enumeraciju '${restriction.enumeration.join(",").substring(0, 100)}`,
                value
            );
        }
        if (restriction.minLength !== undefined && value.length < restriction.minLength) {
            throw new ValidationError(`[${restrictionName}] Vrijednost je kraća od minimalne dužine ${restriction.minLength}`, value);
        }
        if (restriction.maxLength !== undefined && value.length > restriction.maxLength) {
            throw new ValidationError(`[${restrictionName}] Vrijednost je duža od maksimalne dužine ${restriction.maxLength}`, value);
        }
    } else if (restriction.type === "number") {
        const numValue = Number(value);
        if (isNaN(numValue)) {
            throw new ValidationError(`[${restrictionName}] Vrijednost nije valjan broj`, value);
        }
        if (value.includes(".")) {
            const parts = value.split(".");
            const integerDigits = parts[0].replace("-", "").length;
            const fractionDigits = parts[1].length;
            const totalDigits = integerDigits + fractionDigits;
            if (restriction.totalDigits !== undefined && totalDigits > restriction.totalDigits) {
                throw new ValidationError(
                    `[${restrictionName}] Ukupan broj znamenki (${totalDigits}) prelazi maksimalni dozvoljeni (${restriction.totalDigits})`,
                    value
                );
            }
            if (restriction.fractionDigits !== undefined && fractionDigits > restriction.fractionDigits) {
                throw new ValidationError(
                    `[${restrictionName}] Broj decimalnih mjesta (${fractionDigits}) prelazi maksimalni dozvoljeni (${restriction.fractionDigits})`,
                    value
                );
            }
        } else {
            const integerDigits = value.replace("-", "").length;
            if (restriction.totalDigits !== undefined && integerDigits > restriction.totalDigits) {
                throw new ValidationError(
                    `[${restrictionName}] Ukupan broj znamenki (${integerDigits}) prelazi maksimalni dozvoljeni (${restriction.totalDigits})`,
                    value
                );
            }
        }
    } else if (restriction.type === "date") {
        const dateValue = DateTime.fromISO(value, { zone: "Europe/Zagreb" });

        if (!dateValue.isValid) {
            throw new ValidationError(`[${restrictionName}] Vrijednost nije valjan datum`, value);
        }

        if (restriction.minInclusive && dateValue < restriction.minInclusive) {
            throw new ValidationError(
                `[${restrictionName}] Datum je prije minimalnog dozvoljenog datuma ${restriction.minInclusive.toISODate()}`,
                value
            );
        }

        if (restriction.maxInclusive && dateValue > restriction.maxInclusive) {
            throw new ValidationError(
                `[${restrictionName}] Datum je nakon maksimalnog dozvoljenog datuma ${restriction.maxInclusive.toISODate()}`,
                value
            );
        }
    }
}
