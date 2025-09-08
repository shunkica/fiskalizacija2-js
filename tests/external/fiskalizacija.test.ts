import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "node:fs";
import { FiskalizacijaClient } from "../../src";
import {
    EvidentirajERacunZahtjev,
    FiskalizacijaService,
    EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev,
    EvidentirajNaplatuZahtjev,
    EvidentirajOdbijanjeZahtjev
} from "../../src/models";
import { XmlTestProvider } from "../fixtures/XmlTestProvider";
import { randomUUID } from "node:crypto";

describe("FiscalizationClient Test Environment", () => {
    if (!process.env.PRIVATE_KEY_FILE || !fs.existsSync(process.env.PRIVATE_KEY_FILE)) {
        throw new Error("Private key file not found. Set PRIVATE_KEY_FILE environment variable.");
    }
    const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_FILE, "utf-8");
    if (!process.env.PUBLIC_KEY_FILE || !fs.existsSync(process.env.PUBLIC_KEY_FILE)) {
        throw new Error("Public certificate file not found. Set PUBLIC_KEY_FILE environment variable.");
    }
    const publicCert = fs.readFileSync(process.env.PUBLIC_KEY_FILE, "utf-8");
    if (!process.env.OIB || !process.env.OIB.match(/^\d{11}$/)) {
        throw new Error("OIB environment variable is not set or invalid. It should be an 11-digit number.");
    }
    const oib = process.env.OIB;

    let client: FiskalizacijaClient;

    beforeEach(() => {
        client = new FiskalizacijaClient({
            service: FiskalizacijaService.test,
            allowSelfSigned: true,
            privateKey: privateKey,
            publicCert: publicCert,
            timeout: 5000
        });
    });

    describe("EvidentirajERacunZahtjev", () => {
        const id = randomUUID();
        const data = XmlTestProvider.mockEvidentirajERacunZahtjev(id, oib);
        const zahtjev = new EvidentirajERacunZahtjev(data);

        it("should submit the request and get a success response", async () => {
            const response = await client.evidentirajERacun(zahtjev);
            expect(response).toBeDefined();
            expect(response.soapResRaw).toBeDefined();
            expect(response.soapResSignatureValid).toBe(true);
            expect(response.resObject).toBeDefined();
            expect(response.error).toBeUndefined();
            expect(response.success, JSON.stringify(response.resObject, null, 2)).toBe(true);
        });
    });

    describe("EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev", () => {
        const id = randomUUID();
        const data = XmlTestProvider.mockEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev(id, oib);
        const zahtjev = new EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev(data);

        it("should submit the request and get a success response", async () => {
            const response = await client.evidentirajIsporukuZaKojuNijeIzdanERacun(zahtjev);
            expect(response).toBeDefined();
            expect(response.soapResRaw).toBeDefined();
            expect(response.soapResSignatureValid).toBe(true);
            expect(response.resObject).toBeDefined();
            expect(response.error).toBeUndefined();
            expect(response.success, JSON.stringify(response.resObject, null, 2)).toBe(true);
        });
    });

    describe("EvidentirajNaplatuZahtjev", () => {
        const id = randomUUID();
        const data = XmlTestProvider.mockEvidentirajNaplatuZahtjev(id, oib);
        const zahtjev = new EvidentirajNaplatuZahtjev(data);

        it("should submit the request and get a success response", async () => {
            // Prvo moramo fiskalizirati račun, jer se evidentiranje naplate oslanja na prethodnu fiskalizaciju
            const evidentirajERacunZahtjev = new EvidentirajERacunZahtjev(XmlTestProvider.mockEvidentirajERacunZahtjev(id, oib));
            const fiskalizacijaResponse = await client.evidentirajERacun(evidentirajERacunZahtjev);
            expect(fiskalizacijaResponse.success).toBe(true);

            const response = await client.evidentirajNaplatu(zahtjev);
            expect(response).toBeDefined();
            expect(response.soapResRaw).toBeDefined();
            expect(response.soapResSignatureValid).toBe(true);
            expect(response.resObject).toBeDefined();
            expect(response.error).toBeUndefined();
            expect(response.success, JSON.stringify(response.resObject, null, 2)).toBe(true);
        });
    });

    describe("EvidentirajOdbijanjeZahtjev", () => {
        const id = randomUUID();
        const data = XmlTestProvider.mockEvidentirajOdbijanjeZahtjev(id, oib);
        const zahtjev = new EvidentirajOdbijanjeZahtjev(data);

        it("should submit the request and get a success response", async () => {
            // Prvo moramo fiskalizirati račun, jer se evidentiranje odbijanja oslanja na prethodnu fiskalizaciju
            const evidentirajERacunZahtjev = new EvidentirajERacunZahtjev(XmlTestProvider.mockEvidentirajERacunZahtjev(id, oib, "U"));
            const fiskalizacijaResponse = await client.evidentirajERacun(evidentirajERacunZahtjev);
            expect(fiskalizacijaResponse.success).toBe(true);

            const response = await client.evidentirajOdbijanje(zahtjev);
            expect(response).toBeDefined();
            expect(response.soapResRaw).toBeDefined();
            expect(response.soapResSignatureValid).toBe(true);
            expect(response.resObject).toBeDefined();
            expect(response.error).toBeUndefined();
            expect(response.success, JSON.stringify(response.resObject, null, 2)).toBe(true);
        });
    });
});
