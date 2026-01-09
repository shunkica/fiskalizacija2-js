import { describe, it, expect } from "vitest";
import { XmlDocument } from "libxml2-wasm";
import { XmlTestProvider } from "../fixtures/XmlTestProvider";
import { XmlTestValidator } from "../fixtures/XmlTestValidator";
import type { IEvidentirajERacunZahtjev, IEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev } from "../../src";
import { ERacun, EvidentirajERacunZahtjev } from "../../src/models/fiskalizacija";
import {
    EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev,
    EvidentirajNaplatuZahtjev,
    EvidentirajOdbijanjeZahtjev
} from "../../src/models/izvjestavanje";

describe("ERacun", () => {
    describe("fromUbl", () => {
        it("should convert full UBL invoice to ERacun", () => {
            const doc = XmlDocument.fromString(XmlTestProvider.ublInvoiceFull);

            try {
                const root = doc.root;
                const eracun = ERacun.fromUblElement(root, "Invoice");

                XmlTestValidator.validateFullUblInvoice(eracun);
            } finally {
                doc.dispose();
            }
        });

        it("should convert minimal UBL invoice to ERacun", () => {
            const doc = XmlDocument.fromString(XmlTestProvider.ublInvoiceMinimal);

            try {
                const root = doc.root;
                const eracun = ERacun.fromUblElement(root, "Invoice");

                XmlTestValidator.validateMinimalUblInvoice(eracun);
            } finally {
                doc.dispose();
            }
        });

        it("should handle optional fields correctly", () => {
            const doc = XmlDocument.fromString(XmlTestProvider.ublInvoiceMinimal);

            try {
                const root = doc.root;
                const eracun = ERacun.fromUblElement(root, "Invoice");

                // Test that optional fields are undefined when not present
                expect(eracun.referencaNaUgovor).toBeUndefined();
                expect(eracun.datumIsporuke).toBeUndefined();
                expect(eracun.PrethodniERacun).toBeUndefined();
                expect(eracun.PrijenosSredstava).toBeUndefined();
                expect(eracun.DokumentUkupanIznos.popust).toBeUndefined();
                expect(eracun.DokumentUkupanIznos.trosak).toBeUndefined();
                expect(eracun.DokumentUkupanIznos.placeniIznos).toBeUndefined();
                expect(eracun.DokumentPopust).toBeUndefined();
                expect(eracun.DokumentTrosak).toBeUndefined();
            } finally {
                doc.dispose();
            }
        });

        it("should throw validation error for invalid UBL", () => {
            const doc = XmlDocument.fromString(XmlTestProvider.ublInvoiceInvalid);
            try {
                const root = doc.root;

                expect(() => {
                    ERacun.fromUblElement(root, "Invoice");
                }).toThrow();
            } finally {
                doc.dispose();
            }
        });

        it("should use HRTaxTotal data when present instead of TaxTotal for RaspodjelaPdv", () => {
            const doc = XmlDocument.fromString(XmlTestProvider.ublInvoiceHrTaxTotal);

            try {
                const root = doc.root;
                const eracun = ERacun.fromUblElement(root, "Invoice");

                // The HRTaxTotal has 3 subtotals, while TaxTotal has only 2
                expect(eracun.RaspodjelaPdv).toHaveLength(3);

                // First subtotal: HR:N
                expect(eracun.RaspodjelaPdv[0].kategorijaPdv).toBe("E");
                expect(eracun.RaspodjelaPdv[0].oporeziviIznos).toBe(28.95);
                expect(eracun.RaspodjelaPdv[0].iznosPoreza).toBe(0.0);
                expect(eracun.RaspodjelaPdv[0].stopa).toBe("0");
                expect(eracun.RaspodjelaPdv[0].tekstRazlogaOslobodenja).toBe("PDV nije obračunat temeljem čl.33 st 3 Zakona o PDVu");
                expect(eracun.RaspodjelaPdv[0].hrOznakaKategorijaPdv).toBe("HR:N");

                // Second subtotal: HR:PDV25
                expect(eracun.RaspodjelaPdv[1].kategorijaPdv).toBe("S");
                expect(eracun.RaspodjelaPdv[1].oporeziviIznos).toBe(322.7);
                expect(eracun.RaspodjelaPdv[1].iznosPoreza).toBe(80.68);
                expect(eracun.RaspodjelaPdv[1].stopa).toBe("25");
                expect(eracun.RaspodjelaPdv[1].hrOznakaKategorijaPdv).toBe("HR:PDV25");

                // Third subtotal: HR:E
                expect(eracun.RaspodjelaPdv[2].kategorijaPdv).toBe("E");
                expect(eracun.RaspodjelaPdv[2].oporeziviIznos).toBe(5.88);
                expect(eracun.RaspodjelaPdv[2].iznosPoreza).toBe(0.0);
                expect(eracun.RaspodjelaPdv[2].stopa).toBe("0");
                expect(eracun.RaspodjelaPdv[2].tekstRazlogaOslobodenja).toBe("PDV nije obračunat temeljem čl.40 st. 1 Zakona o PDVu");
                expect(eracun.RaspodjelaPdv[2].hrOznakaKategorijaPdv).toBe("HR:E");
            } finally {
                doc.dispose();
            }
        });
    });
});

describe("Model serialization and deserialization", () => {
    describe("EvidentirajERacun", () => {
        const xml = XmlTestProvider.EvidentirajERacunZahtjev;
        const id = XmlTestProvider.EvidentirajERacunZahtjev_ID;
        const data = XmlTestProvider.mockEvidentirajERacunZahtjev(id, "00000000001");
        const zahtjev = new EvidentirajERacunZahtjev(data);

        it("should deserialize XML without throwing", () => {
            let res!: IEvidentirajERacunZahtjev;
            expect(() => {
                res = EvidentirajERacunZahtjev.fromXml(xml);
            }).not.toThrow();
            expect(res.ERacun[0].brojDokumenta).toBe(XmlTestProvider.EvidentirajERacunZahtjev_brojDokumenta);
        });

        it("should serialize and deserialize without throwing", () => {
            let stringXml = "";
            expect(() => {
                stringXml = zahtjev.toXmlString();
            }).not.toThrow();

            expect(() => {
                EvidentirajERacunZahtjev.fromXml(stringXml);
            }).not.toThrow();
        });
    });

    describe("EvidentirajIsporukuZaKojuNijeIzdanERacun", () => {
        const xml = XmlTestProvider.EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev;
        const id = XmlTestProvider.EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev_brojDokumenta;
        const data: IEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev = XmlTestProvider.mockEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev(
            id,
            "00000000001"
        );
        const zahtjev = new EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev(data);

        it("should deserialize XML correctly", () => {
            const res = EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev.fromXml(xml);
            expect(res.Racun[0].brojDokumenta).toBe(id);
        });

        it("should serialize mock object and deserialize without throwing", () => {
            let stringXml = "";
            expect(() => {
                stringXml = zahtjev.toXmlString();
            }).not.toThrow();

            expect(() => {
                EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev.fromXml(stringXml);
            }).not.toThrow();
        });
    });

    describe("EvidentirajNaplatuZahtjev", () => {
        const xml = XmlTestProvider.EvidentirajNaplatuZahtjev;
        const id = XmlTestProvider.EvidentirajNaplatuZahtjev_brojDokumenta;
        const data = XmlTestProvider.mockEvidentirajNaplatuZahtjev(id, "00000000001");
        const zahtjev = new EvidentirajNaplatuZahtjev(data);

        it("should deserialize XML correcly", () => {
            const res = EvidentirajNaplatuZahtjev.fromXml(xml);
            expect(res.Naplata[0].brojDokumenta).toBe(id);
        });

        it("should serialize mock object and deserialize without throwing", () => {
            expect(() => {
                EvidentirajNaplatuZahtjev.fromXml(zahtjev.toXmlString());
            }).not.toThrow();
        });
    });

    describe("EvidentirajOdbijanjeZahtjev", () => {
        const xml = XmlTestProvider.EvidentirajOdbijanjeZahtjev;
        const id = XmlTestProvider.EvidentirajOdbijanjeZahtjev_brojDokumenta;
        const data = XmlTestProvider.mockEvidentirajOdbijanjeZahtjev(id, "00000000001");
        const zahtjev = new EvidentirajOdbijanjeZahtjev(data);

        it("should deserialize XML correctly", () => {
            const res = EvidentirajOdbijanjeZahtjev.fromXml(xml);
            expect(res.Odbijanje[0].brojDokumenta).toBe(id);
        });

        it("should serialize mock object and deserialize without throwing", () => {
            expect(() => {
                EvidentirajOdbijanjeZahtjev.fromXml(zahtjev.toXmlString());
            }).not.toThrow();
        });
    });
});
