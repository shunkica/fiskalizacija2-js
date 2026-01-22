import type { XmlElement } from "libxml2-wasm";
import type { RestrictionName } from "../constants/restrictions";
import { assertRestriction, RESTRICTIONS } from "../constants/restrictions";
import { XmlDocument } from "libxml2-wasm";
import { BUSINESS_TERMS } from "../constants/businessTerms";
import { BUSINESS_GROUPS } from "../constants/businessGroups";
import { ValidationError } from "./error";

function removePrefix(str: string, prefix: string) {
    return str.startsWith(prefix) ? str.slice(prefix.length + 1) : str;
}

export function getBusinessTermXpath(
    id: keyof typeof BUSINESS_TERMS,
    type: "Invoice" | "CreditNote",
    group: keyof typeof BUSINESS_GROUPS | null = null
): string {
    const term = BUSINESS_TERMS[id];
    if (group) {
        return removePrefix(term.xpath[type].join("/"), getBusinessGroupXpath(group, type));
    }
    return term.xpath[type].join("/");
}

export function getBusinessGroupXpath(id: keyof typeof BUSINESS_GROUPS, type: "Invoice" | "CreditNote"): string {
    const term = BUSINESS_GROUPS[id];
    return term.xpath[type].join("/");
}

export interface ExtractionOptions {
    restrictionName?: RestrictionName;
    lenient?: boolean;
    errors?: ValidationError[];
}

export function normalizeDecimal(value: string | number, maxFractionDigits: number): string {
    const str = typeof value === "number" ? value.toString() : value.trim();
    if (str.indexOf(".") === -1) {
        return str;
    }
    const [integerPart, fractionPart] = str.split(".", 2);
    if (integerPart.startsWith("-") || integerPart.startsWith("+")) {
        if (!/^\d+$/.test(integerPart.substring(1))) {
            throw new ValidationError(`Neispravan broj`, value);
        }
    } else {
        if (!/^\d+$/.test(integerPart)) {
            throw new ValidationError(`Neispravan broj`, value);
        }
    }
    if (!/^\d+$/.test(fractionPart)) {
        throw new ValidationError(`Neispravan broj`, value);
    }
    if (fractionPart.length <= maxFractionDigits) {
        return str;
    }
    return `${integerPart}.${fractionPart.substring(0, maxFractionDigits)}`;
}

function normalizeContent(content: string, restrictionName?: RestrictionName): string {
    let result = content.trim();
    if (restrictionName) {
        const restriction = RESTRICTIONS[restrictionName];
        if (restriction.type === "string" && restriction.maxLength && result.length > restriction.maxLength) {
            result = result.substring(0, restriction.maxLength);
        }
    }
    return result;
}

export function getElementContent(parentEl: XmlElement, tag: string, ns: Record<string, string>, options: ExtractionOptions = {}): string {
    const { restrictionName, lenient, errors } = options;
    const el = parentEl.get(tag, ns) as XmlElement | null;
    if (!el) {
        const err = new ValidationError(`Element '${tag}' nije pronađen u elementu '${parentEl.prefix}:${parentEl.name}'`, undefined);
        if (lenient) {
            if (errors) {
                errors.push(err);
            }
            return "";
        }
        throw err;
    }
    const trimmedContent = normalizeContent(el.content, restrictionName);
    if (restrictionName) {
        try {
            assertRestriction(trimmedContent, restrictionName);
        } catch (err) {
            if (err instanceof ValidationError) {
                if (errors) {
                    errors.push(err);
                }
                if (lenient) {
                    return trimmedContent;
                }
            }
            throw err;
        }
    }
    return trimmedContent;
}

export function getOptionalElementContent(
    parentEl: XmlElement,
    tag: string,
    ns: Record<string, string>,
    options: ExtractionOptions = {}
): string | undefined {
    const { restrictionName, lenient, errors } = options;
    const el = parentEl.get(tag, ns) as XmlElement | null;
    if (!el) {
        return undefined;
    }
    const trimmedContent = normalizeContent(el.content, restrictionName);
    if (restrictionName) {
        try {
            assertRestriction(trimmedContent, restrictionName);
        } catch (err) {
            if (err instanceof ValidationError) {
                if (errors) {
                    errors.push(err);
                }
                if (lenient) {
                    return trimmedContent;
                }
            }
            throw err;
        }
    }
    return trimmedContent;
}

export function extractElement<T>(parentEl: XmlElement, tag: string, ns: Record<string, string>, fn: (el: XmlElement) => T): T {
    const el = parentEl.get(tag, ns) as XmlElement | null;
    if (!el) {
        throw new ValidationError(`Element '${tag}' nije pronađen u elementu '${parentEl.prefix}:${parentEl.name}'`, undefined);
    }
    return fn(el);
}

export function extractOptionalElement<T>(parentEl: XmlElement, tag: string, ns: Record<string, string>, fn: (el: XmlElement) => T): T | undefined {
    const el = parentEl.get(tag, ns) as XmlElement | null;
    if (!el) {
        return undefined;
    }
    return fn(el);
}

export function extractElements<T>(parentEl: XmlElement, tag: string, ns: Record<string, string>, fn: (el: XmlElement) => T): T[] {
    const elements = parentEl.find(tag, ns);
    if (!elements || elements.length === 0) {
        throw new ValidationError(`Element '${tag}' nije pronađen u elementu '${parentEl.prefix}:${parentEl.name}'`, undefined);
    }
    return elements.map(el => fn(el as XmlElement));
}

export function extractOptionalElements<T>(
    parentEl: XmlElement,
    tag: string,
    ns: Record<string, string>,
    fn: (el: XmlElement) => T
): T[] | undefined {
    const elements = parentEl.find(tag, ns);
    if (!elements || elements.length === 0) {
        return undefined;
    }
    return elements.map(el => fn(el as XmlElement));
}

export function getOptionalAttributeValue(
    el: XmlElement,
    name: string,
    ns: Record<string, string>,
    restrictionName?: keyof typeof RESTRICTIONS
): string | undefined {
    const xpath = `@${name}`;
    const attrs = el.find(xpath, ns);
    if (!attrs || attrs.length === 0) {
        return undefined;
    }
    const value = String(attrs[0].content);
    if (restrictionName) {
        assertRestriction(value, restrictionName);
    }
    return value;
}

export function getAttributeValue(el: XmlElement, name: string, ns: Record<string, string>, restrictionName?: keyof typeof RESTRICTIONS): string {
    const xpath = `@${name}`;
    const attrs = el.find(xpath, ns);
    if (!attrs || attrs.length === 0) {
        throw new ValidationError(`Atribut '${name}' nije pronađen u elementu '${el.prefix}:${el.name}'`, undefined);
    }
    const value = attrs[0].content;
    if (restrictionName) {
        assertRestriction(String(value), restrictionName);
    }
    return value;
}

export function xmlEscape(val: string): string {
    if (!val) {
        return "";
    }
    return val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function usingXmlDocument<T>(doc: string | Uint8Array | XmlDocument, fn: (r: XmlDocument) => T): T {
    if (!doc) {
        throw new Error("XML document is required for processing");
    }
    if (typeof doc === "string") {
        doc = XmlDocument.fromString(doc);
    } else if (doc instanceof Uint8Array) {
        doc = XmlDocument.fromBuffer(doc);
    }
    try {
        return fn(doc);
    } finally {
        doc.dispose();
    }
}

/**
 * Converts a number or string to a validated decimal string (preserves original representation)
 * Used in constructors to accept both input formats while storing as strings
 */
export function toValidatedDecimalString(value: number | string): string {
    if (typeof value === "string") {
        const num = Number(value);
        if (isNaN(num)) {
            throw new ValidationError(`Value is not a valid number: ${value}`, value);
        }
        return value;
    } else {
        return String(value);
    }
}

/**
 * Converts an optional number or string to a validated decimal string (preserves original representation)
 */
export function toValidatedDecimalStringOptional(value: number | string | undefined): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    return toValidatedDecimalString(value);
}
