import { describe, it, expect } from "vitest";
import { getERacunFromUbl, getRacunFromUbl } from "../../src";
import { usingXmlDocument } from "../../src/util/xml";
import type { XmlElement } from "libxml2-wasm";
import { ValidationError } from "../../src/util/error";
import { XmlTestProvider } from "../fixtures/XmlTestProvider";

// Load the minimal UBL invoice fixture
const ublInvoiceXml = XmlTestProvider.ublInvoiceMinimal;

// Create an SBD wrapper around the UBL invoice
const sbdInvoiceXml = `<?xml version="1.0" encoding="UTF-8"?>
<StandardBusinessDocument xmlns="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader">
  <StandardBusinessDocumentHeader>
    <HeaderVersion>1.0</HeaderVersion>
    <Sender>
      <Identifier Authority="iso6523-actorid-upis">9934:11111111119</Identifier>
    </Sender>
    <Receiver>
      <Identifier Authority="iso6523-actorid-upis">9934:22222222226</Identifier>
    </Receiver>
    <DocumentIdentification>
      <Standard>urn:oasis:names:specification:ubl:schema:xsd:Invoice-2</Standard>
      <TypeVersion>2.1</TypeVersion>
      <InstanceIdentifier>MINIMAL-001</InstanceIdentifier>
      <Type>Invoice</Type>
      <CreationDateAndTime>2026-01-15T00:00:00Z</CreationDateAndTime>
    </DocumentIdentification>
  </StandardBusinessDocumentHeader>
  ${ublInvoiceXml}
</StandardBusinessDocument>`;

describe("getERacunFromUbl", () => {
    describe("UBL Invoice - all input types", () => {
        it("should parse from string", () => {
            const result = getERacunFromUbl(ublInvoiceXml);
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("MINIMAL-001");
        });

        it("should parse from Buffer", () => {
            const buffer = Buffer.from(ublInvoiceXml, "utf-8");
            const result = getERacunFromUbl(buffer);
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("MINIMAL-001");
        });

        it("should parse from XmlDocument", () => {
            usingXmlDocument(ublInvoiceXml, doc => {
                const result = getERacunFromUbl(doc);
                expect(result).toBeDefined();
                expect(result.brojDokumenta).toBe("MINIMAL-001");
            });
        });

        it("should parse from XmlElement", () => {
            usingXmlDocument(ublInvoiceXml, doc => {
                const rootElement = doc.root;
                const result = getERacunFromUbl(rootElement);
                expect(result).toBeDefined();
                expect(result.brojDokumenta).toBe("MINIMAL-001");
            });
        });
    });

    describe("StandardBusinessDocument - all input types", () => {
        it("should extract UBL from SBD string", () => {
            const result = getERacunFromUbl(sbdInvoiceXml);
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("MINIMAL-001");
        });

        it("should extract UBL from SBD Buffer", () => {
            const buffer = Buffer.from(sbdInvoiceXml, "utf-8");
            const result = getERacunFromUbl(buffer);
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("MINIMAL-001");
        });

        it("should extract UBL from SBD XmlDocument", () => {
            usingXmlDocument(sbdInvoiceXml, doc => {
                const result = getERacunFromUbl(doc);
                expect(result).toBeDefined();
                expect(result.brojDokumenta).toBe("MINIMAL-001");
            });
        });

        it("should extract UBL from SBD XmlElement", () => {
            usingXmlDocument(sbdInvoiceXml, doc => {
                const rootElement = doc.root;
                const result = getERacunFromUbl(rootElement);
                expect(result).toBeDefined();
                expect(result.brojDokumenta).toBe("MINIMAL-001");
            });
        });

        it("should handle nested XmlElement extraction from SBD", () => {
            usingXmlDocument(sbdInvoiceXml, doc => {
                // Simulate user extracting the Invoice element manually
                const invoiceElement = doc.get("//ubl:Invoice", { ubl: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" }) as XmlElement;
                expect(invoiceElement).toBeDefined();

                const result = getERacunFromUbl(invoiceElement);
                expect(result).toBeDefined();
                expect(result.brojDokumenta).toBe("MINIMAL-001");
            });
        });
    });

    describe("Error handling", () => {
        it("should throw ValidationError for invalid root element", () => {
            const invalidXml = `<?xml version="1.0"?><Invalid`;
            expect(() => getERacunFromUbl(invalidXml)).toThrow(ValidationError);
        });

        it("should throw ValidationError for XML without UBL content", () => {
            const sbdWithoutUbl = `<?xml version="1.0" encoding="UTF-8"?>
<StandardBusinessDocument xmlns="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader">
  <StandardBusinessDocumentHeader>
    <HeaderVersion>1.0</HeaderVersion>
  </StandardBusinessDocumentHeader>
  <SomeOtherDocument>
    <data>test</data>
  </SomeOtherDocument>
</StandardBusinessDocument>`;
            expect(() => getERacunFromUbl(sbdWithoutUbl)).toThrow(ValidationError);
        });
    });

    describe("Lenient extraction", () => {
        it("should partially extract fields from invalid UBL when lenient is true", () => {
            const result = getERacunFromUbl(XmlTestProvider.ublInvoiceInvalid, { lenient: true });
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("INVALID-001");
            expect(result.datumIzdavanja).toBe("2026-01-15");
            // Check that required but missing fields are empty or default
            expect(result.Izdavatelj.ime).toBe("");
            expect(result.StavkaERacuna).toEqual([]);
            expect(result.DokumentUkupanIznos.neto).toBe("");
        });

        it("should report ValidationErrors even when lenient is true", () => {
            const errors: ValidationError[] = [];
            getERacunFromUbl(XmlTestProvider.ublInvoiceInvalid, { lenient: true, errors });
            expect(errors.length).toEqual(11);
            expect(errors.some(e => e.message.includes("cbc:InvoiceTypeCode"))).toBe(true);
            expect(errors.some(e => e.message.includes("cac:AccountingSupplierParty"))).toBe(true);
            expect(errors.some(e => e.message.includes("cac:AccountingCustomerParty"))).toBe(true);
            expect(errors.some(e => e.message.includes("cac:LegalMonetaryTotal"))).toBe(true);
        });

        it("should throw ValidationError from invalid UBL when lenient is false (default)", () => {
            expect(() => getERacunFromUbl(XmlTestProvider.ublInvoiceInvalid)).toThrow(ValidationError);
        });

        it("should handle regex validation failure lenietly", () => {
            const ublWithInvalidDate = XmlTestProvider.ublInvoiceMinimal.replace(
                "<cbc:IssueDate>2026-01-15</cbc:IssueDate>",
                "<cbc:IssueDate>INVALID-DATE</cbc:IssueDate>"
            );
            const result = getERacunFromUbl(ublWithInvalidDate, { lenient: true });
            expect(result.datumIzdavanja).toBe("INVALID-DATE");
        });

        it("should collect errors when errors array is provided", () => {
            const errors: ValidationError[] = [];
            getERacunFromUbl(XmlTestProvider.ublInvoiceInvalid, { lenient: true, errors });
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(e => e.message.includes("BG-4"))).toBe(true); // Issuer Group missing
        });
    });
});

describe("getRacunFromUbl", () => {
    describe("UBL Invoice - all input types", () => {
        it("should parse from string", () => {
            const result = getRacunFromUbl(ublInvoiceXml);
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("MINIMAL-001");
        });

        it("should parse from Buffer", () => {
            const buffer = Buffer.from(ublInvoiceXml, "utf-8");
            const result = getRacunFromUbl(buffer);
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("MINIMAL-001");
        });

        it("should parse from XmlDocument", () => {
            usingXmlDocument(ublInvoiceXml, doc => {
                const result = getRacunFromUbl(doc);
                expect(result).toBeDefined();
                expect(result.brojDokumenta).toBe("MINIMAL-001");
            });
        });

        it("should parse from XmlElement", () => {
            usingXmlDocument(ublInvoiceXml, doc => {
                const rootElement = doc.root;
                const result = getRacunFromUbl(rootElement);
                expect(result).toBeDefined();
                expect(result.brojDokumenta).toBe("MINIMAL-001");
            });
        });
    });

    describe("StandardBusinessDocument - all input types", () => {
        it("should extract UBL from SBD string", () => {
            const result = getRacunFromUbl(sbdInvoiceXml);
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("MINIMAL-001");
        });

        it("should extract UBL from SBD Buffer", () => {
            const buffer = Buffer.from(sbdInvoiceXml, "utf-8");
            const result = getRacunFromUbl(buffer);
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("MINIMAL-001");
        });

        it("should extract UBL from SBD XmlDocument", () => {
            usingXmlDocument(sbdInvoiceXml, doc => {
                const result = getRacunFromUbl(doc);
                expect(result).toBeDefined();
                expect(result.brojDokumenta).toBe("MINIMAL-001");
            });
        });

        it("should extract UBL from SBD XmlElement", () => {
            usingXmlDocument(sbdInvoiceXml, doc => {
                const rootElement = doc.root;
                const result = getRacunFromUbl(rootElement);
                expect(result).toBeDefined();
                expect(result.brojDokumenta).toBe("MINIMAL-001");
            });
        });
    });

    describe("Error handling", () => {
        it("should throw ValidationError for SBD without UBL content", () => {
            const sbdWithoutUbl = `<?xml version="1.0" encoding="UTF-8"?>
<StandardBusinessDocument xmlns="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader">
  <StandardBusinessDocumentHeader>
    <HeaderVersion>1.0</HeaderVersion>
  </StandardBusinessDocumentHeader>
  <SomeOtherDocument>
    <data>test</data>
  </SomeOtherDocument>
</StandardBusinessDocument>`;
            expect(() => getRacunFromUbl(sbdWithoutUbl)).toThrow(ValidationError);
        });
    });

    describe("Lenient extraction", () => {
        it("should partially extract fields from invalid UBL when lenient is true", () => {
            const result = getRacunFromUbl(XmlTestProvider.ublInvoiceInvalid, { lenient: true });
            expect(result).toBeDefined();
            expect(result.brojDokumenta).toBe("INVALID-001");
            expect(result.datumIzdavanja).toBe("2026-01-15");
            // Check that required but missing fields are empty or default
            expect(result.Izdavatelj.ime).toBe("");
            expect(result.StavkaRacuna).toEqual([]);
            expect(result.DokumentUkupanIznos.neto).toBe("");
        });

        it("should report ValidationErrors even when lenient is true", () => {
            const errors: ValidationError[] = [];
            getRacunFromUbl(XmlTestProvider.ublInvoiceInvalid, { lenient: true, errors });
            expect(errors.length).toEqual(11);
            expect(errors.some(e => e.message.includes("cbc:InvoiceTypeCode"))).toBe(true);
            expect(errors.some(e => e.message.includes("cac:AccountingSupplierParty"))).toBe(true);
            expect(errors.some(e => e.message.includes("cac:AccountingCustomerParty"))).toBe(true);
            expect(errors.some(e => e.message.includes("cac:LegalMonetaryTotal"))).toBe(true);
        });

        it("should throw ValidationError from invalid UBL when lenient is false (default)", () => {
            expect(() => getRacunFromUbl(XmlTestProvider.ublInvoiceInvalid)).toThrow(ValidationError);
        });
    });
});
