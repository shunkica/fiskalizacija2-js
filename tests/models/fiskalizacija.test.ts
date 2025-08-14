import {describe, it, expect} from "vitest";
import {XmlDocument} from "libxml2-wasm";
import {XmlTestProvider} from "../fixtures/XmlTestProvider";
import {ERacun, EvidentirajERacunZahtjev} from "../../src/models";
import {XmlTestValidator} from "../fixtures/XmlTestValidator";
import {EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev, EvidentirajNaplatuZahtjev, EvidentirajOdbijanjeZahtjev} from "../../src/models";
import {IEvidentirajERacunZahtjev, IEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev} from "../../src";

describe("ERacun", () => {
    describe("fromUbl", () => {
        it("should convert full UBL invoice to ERacun", () => {
            const doc = XmlDocument.fromString(XmlTestProvider.ublInvoiceFull);

            try {
                const root = doc.root;
                const eracun = ERacun.fromUblElement(root, "Invoice");

                XmlTestValidator.validateFullUblInvoice(eracun)

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
                expect(eracun.datumIsporuke).toBeUndefined();
                expect(eracun.referencaNaUgovor).toBeUndefined();
                expect(eracun.PrethodniERacun).toBeUndefined();
                expect(eracun.PrijenosSredstava).toBeUndefined();
                expect(eracun.DokumentUkupanIznos.popust).toBeUndefined();
                expect(eracun.DokumentUkupanIznos.placeniIznos).toBeUndefined();

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
        const data: IEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev = XmlTestProvider.mockEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev(id, "00000000001");
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
