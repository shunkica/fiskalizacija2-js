import { XmlDocument, XmlElement } from "libxml2-wasm";
import type { IERacun, IRacun } from "../types";
import { usingXmlDocument } from "../util/xml";
import { ERacun, Racun } from "../models";
import { ValidationError } from "../util/error";

const NS = {
    inv: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    cn: "urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
};

function findUblElement(el: XmlElement): XmlElement {
    const ublElement = (el.get("//inv:Invoice", NS) as XmlElement) || (el.get("//cn:CreditNote", NS) as XmlElement) || null;

    if (!ublElement) {
        throw new ValidationError("No UBL Invoice or CreditNote element found in the document.", el.toString());
    }

    return ublElement;
}

export function getERacunFromUbl(doc: string | Buffer | XmlDocument | XmlElement): IERacun {
    // If it's a string or Buffer, parse it and process within the document's lifetime
    if (!(doc instanceof XmlElement) && !(doc instanceof XmlDocument)) {
        try {
            return usingXmlDocument(doc, (xmlDoc: XmlDocument) => {
                return getERacunFromUbl(xmlDoc);
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError("Failed to parse XML document.", error);
        }
    }

    // Get the root element
    const rootEl = doc instanceof XmlDocument ? doc.root : doc;

    // Extract the UBL element (handles both direct UBL and SBD-wrapped UBL)
    const ublEl = findUblElement(rootEl);
    const type = ublEl.name as "Invoice" | "CreditNote";

    return ERacun.fromUblElement(ublEl, type);
}

export function getRacunFromUbl(doc: string | Buffer | XmlDocument | XmlElement): IRacun {
    // If it's a string or Buffer, parse it and process within the document's lifetime
    if (!(doc instanceof XmlElement) && !(doc instanceof XmlDocument)) {
        return usingXmlDocument(doc, (xmlDoc: XmlDocument) => {
            return getRacunFromUbl(xmlDoc);
        });
    }

    // Get the root element
    const rootEl = doc instanceof XmlDocument ? doc.root : doc;

    // Extract the UBL element (handles both direct UBL and SBD-wrapped UBL)
    const ublEl = findUblElement(rootEl);
    const type = ublEl.name as "Invoice" | "CreditNote";

    return Racun.fromUblElement(ublEl, type);
}
