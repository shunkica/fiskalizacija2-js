import type { XmlElement } from "libxml2-wasm";
import type { RegexKey } from "../constants/regex";
import { XmlDocument } from "libxml2-wasm";
import { REGEX } from "../constants/regex";
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

interface ExtractionOptions {
    regexKey?: RegexKey;
    lenient?: boolean;
    errors?: ValidationError[];
}

function normalizeWhitespace(content: string): string {
    return content.replace(/\s+/g, " ").trim();
}

export function getElementContent(parentEl: XmlElement, tag: string, ns: Record<string, string>, options: ExtractionOptions = {}): string {
    const { regexKey, lenient, errors } = options;
    const el = parentEl.get(tag, ns) as XmlElement | null;
    if (!el) {
        throw new ValidationError(`Element '${tag}' nije pronađen u elementu '${parentEl.prefix}:${parentEl.name}'`, undefined);
    }
    const trimmedContent = normalizeWhitespace(el.content);
    if (regexKey && !REGEX[regexKey].test(trimmedContent)) {
        const err = new ValidationError(`Element '${tag}' ne zadovoljava regex ${REGEX[regexKey]}`, trimmedContent);
        if (lenient) {
            if (errors) {
                errors.push(err);
            }
        } else {
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
    const { regexKey, lenient, errors } = options;
    const el = parentEl.get(tag, ns) as XmlElement | null;
    if (!el) {
        return undefined;
    }
    const trimmedContent = normalizeWhitespace(el.content);
    if (regexKey && !REGEX[regexKey].test(trimmedContent)) {
        const err = new ValidationError(`Element '${tag}' ne zadovoljava regex ${REGEX[regexKey]}`, trimmedContent);
        if (lenient) {
            if (errors) {
                errors.push(err);
            }
        } else {
            throw err;
        }
    }
    return trimmedContent;
}

export function getElementContentNumber(parentEl: XmlElement, tag: string, ns: Record<string, string>, options: ExtractionOptions = {}): number {
    const content = getElementContent(parentEl, tag, ns, options);
    const num = Number(content);
    if (isNaN(num)) {
        const err = new ValidationError(`Element '${tag}' ne sadrži valjani broj: ${content}`, content);
        if (options.lenient) {
            if (options.errors) {
                options.errors.push(err);
            }
            return 0;
        } else {
            throw err;
        }
    }
    return num;
}

export function getOptionalElementContentNumber(
    parentEl: XmlElement,
    tag: string,
    ns: Record<string, string>,
    options: ExtractionOptions = {}
): number | undefined {
    const content = getOptionalElementContent(parentEl, tag, ns, options);
    if (content === undefined) {
        return undefined;
    }
    const num = Number(content);
    if (isNaN(num)) {
        const err = new ValidationError(`Element '${tag}' ne sadrži valjani broj: ${content}`, content);
        if (options.lenient) {
            if (options.errors) {
                options.errors.push(err);
            }
            return undefined;
        } else {
            throw err;
        }
    }
    return num;
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
    regexKey?: keyof typeof REGEX
): string | undefined {
    const xpath = `@${name}`;
    const attrs = el.find(xpath, ns);
    if (!attrs || attrs.length === 0) {
        return undefined;
    }
    const value = attrs[0].content;
    if (regexKey && !REGEX[regexKey].test(value)) {
        throw new ValidationError(`Atribut '${name}' ne zadovoljava regex ${REGEX[regexKey]}`, value);
    }
    return value;
}

export function getAttributeValue(el: XmlElement, name: string, ns: Record<string, string>, regexKey?: keyof typeof REGEX): string {
    const xpath = `@${name}`;
    const attrs = el.find(xpath, ns);
    if (!attrs || attrs.length === 0) {
        throw new ValidationError(`Atribut '${name}' nije pronađen u elementu '${el.prefix}:${el.name}'`, undefined);
    }
    const value = attrs[0].content;
    if (regexKey && !REGEX[regexKey].test(value)) {
        throw new ValidationError(`Atribut '${name}' ne zadovoljava regex ${REGEX[regexKey]}`, value);
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
