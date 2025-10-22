import { describe, it, expect } from "vitest";
import type { XmlElement } from "libxml2-wasm";
import { getOptionalAttributeValue, getAttributeValue, usingXmlDocument } from "../../src/util/xml";
import { ValidationError } from "../../src/util/error";

describe("XML Attribute Functions", () => {
    const testXml = `<?xml version="1.0" encoding="UTF-8"?>
<root xmlns:test="http://test.namespace" xmlns:other="http://other.namespace">
    <element id="123" test:name="testValue" other:type="someType" data-attr="dataValue" />
    <element-no-attrs />
</root>`;

    const namespaces = {
        test: "http://test.namespace",
        different: "http://other.namespace"
    };

    describe("getOptionalAttributeValue", () => {
        it("should return attribute value when attribute exists", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;
                const result = getOptionalAttributeValue(element, "id", namespaces);
                expect(result).toBe("123");
            });
        });

        it("should return attribute value from namespaced attribute", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;

                const result = getOptionalAttributeValue(element, "test:name", namespaces);
                expect(result).toBe("testValue");
            });
        });

        it("should return attribute value from different namespace", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;

                const result = getOptionalAttributeValue(element, "different:type", namespaces);
                expect(result).toBe("someType");
            });
        });

        it("should return undefined when attribute does not exist", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;

                const result = getOptionalAttributeValue(element, "nonexistent", namespaces);
                expect(result).toBeUndefined();
            });
        });

        it("should return undefined when element has no attributes", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element-no-attrs", {}) as XmlElement;

                const result = getOptionalAttributeValue(element, "id", namespaces);
                expect(result).toBeUndefined();
            });
        });

        it("should validate attribute value with regex when provided", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;

                const result = getOptionalAttributeValue(element, "id", namespaces, "redniBroj");
                expect(result).toBe("123");
            });
        });

        it("should throw ValidationError when regex validation fails", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;

                expect(() => {
                    getOptionalAttributeValue(element, "test:name", namespaces, "redniBroj");
                }).toThrow(ValidationError);
            });
        });
    });

    describe("getAttributeValue", () => {
        it("should return attribute value when attribute exists", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;
                const result = getAttributeValue(element, "id", namespaces);
                expect(result).toBe("123");
            });
        });

        it("should throw ValidationError when attribute does not exist", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;

                expect(() => {
                    getAttributeValue(element, "nonexistent", namespaces);
                }).toThrow(ValidationError);
            });
        });

        it("should validate attribute value with regex when provided", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;

                const result = getAttributeValue(element, "id", namespaces, "redniBroj");
                expect(result).toBe("123");
            });
        });

        it("should throw ValidationError when regex validation fails", () => {
            usingXmlDocument(testXml, doc => {
                const element = doc.get("element", {}) as XmlElement;

                expect(() => {
                    getAttributeValue(element, "test:name", namespaces, "redniBroj");
                }).toThrow(ValidationError);
            });
        });
    });
});
