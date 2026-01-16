import { describe, it, expect } from "vitest";
import { EvidentirajERacunZahtjev } from "../../src/models/fiskalizacija";
import { XmlTestProvider } from "../fixtures/XmlTestProvider";

describe("IndikatorKopije Parsing", () => {
    it("should parse '1' as true", () => {
        const xml = XmlTestProvider.EvidentirajERacunZahtjev.replace(
            "<efis:indikatorKopije>false</efis:indikatorKopije>",
            "<efis:indikatorKopije>1</efis:indikatorKopije>"
        );

        const request = EvidentirajERacunZahtjev.fromXml(xml);
        expect(request.ERacun[0].indikatorKopije).toBe(true);
    });

    it("should parse '0' as false", () => {
        const xml = XmlTestProvider.EvidentirajERacunZahtjev.replace(
            "<efis:indikatorKopije>false</efis:indikatorKopije>",
            "<efis:indikatorKopije>0</efis:indikatorKopije>"
        );

        const request = EvidentirajERacunZahtjev.fromXml(xml);
        expect(request.ERacun[0].indikatorKopije).toBe(false);
    });

    it("should parse 'true' as true", () => {
        const xml = XmlTestProvider.EvidentirajERacunZahtjev.replace(
            "<efis:indikatorKopije>false</efis:indikatorKopije>",
            "<efis:indikatorKopije>true</efis:indikatorKopije>"
        );

        const request = EvidentirajERacunZahtjev.fromXml(xml);
        expect(request.ERacun[0].indikatorKopije).toBe(true);
    });

    it("should parse 'false' as false", () => {
        const xml = XmlTestProvider.EvidentirajERacunZahtjev; // Default is false
        const request = EvidentirajERacunZahtjev.fromXml(xml);
        expect(request.ERacun[0].indikatorKopije).toBe(false);
    });

    it("should output boolean as 'true' or 'false' string in XML", () => {
        // Test parsing '1' -> true -> output "true"
        const xmlInput = XmlTestProvider.EvidentirajERacunZahtjev.replace(
            "<efis:indikatorKopije>false</efis:indikatorKopije>",
            "<efis:indikatorKopije>1</efis:indikatorKopije>"
        );
        const requestData = EvidentirajERacunZahtjev.fromXml(xmlInput);
        const request = new EvidentirajERacunZahtjev(requestData);

        // Convert back to XML string
        const xmlOutput = request.toXmlString();

        // It should contain "true", not "1"
        expect(xmlOutput).toContain("<efis:indikatorKopije>true</efis:indikatorKopije>");
        expect(xmlOutput).not.toContain("<efis:indikatorKopije>1</efis:indikatorKopije>");
    });
});
