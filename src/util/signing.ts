import {SigningOptions} from "../types";
import {randomUUID} from "node:crypto";
import {XmlElement} from "libxml2-wasm";
import * as XAdES from "xadesjs";
import {Crypto} from "@peculiar/webcrypto";
import {XMLSerializer} from "@xmldom/xmldom";
import * as nodecrypto from "node:crypto";

export class XmlSigner {
    private options: SigningOptions;
    private crypto: Crypto;
    private privateKey: CryptoKey | null = null;
    private publicKey: CryptoKey | null = null;
    private certificate: string;

    private defaultOptions = {
        signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
        canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
        digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
    };

    constructor(options: SigningOptions) {
        this.options = {...this.defaultOptions, ...options};
        this.crypto = new Crypto();
        XAdES.Application.setEngine("NodeJS", this.crypto);

        this.certificate = extractPemCertificate(this.options.publicCert);
        this.initializeKeys();
    }

    private async initializeKeys(): Promise<void> {
        const privateKeyPem = extractPemPrivateKey(this.options.privateKey);
        const privateKeyDer = pemToDer(privateKeyPem);

        // Import private key
        const hashAlgorithm = this.getHashAlgorithmFromSignatureAlgorithm(this.options.signatureAlgorithm);
        this.privateKey = await this.crypto.subtle.importKey(
            "pkcs8",
            privateKeyDer,
            {
                name: "RSASSA-PKCS1-v1_5",
                hash: hashAlgorithm
            },
            false,
            ["sign"]
        );

        // For verification, we'll extract the public key from the certificate when needed
        // The certificate itself will be used in the signing process
        this.publicKey = null;
    }

    private preparePemForXAdES(pem: string): string {
        return pem
            .replace(/-----(BEGIN|END)[\w\d\s]+-----/g, "")
            .replace(/[\r\n]/g, "");
    }

    private getHashAlgorithmFromSignatureAlgorithm(signatureAlgorithm: string | undefined): string {
        // Map XML signature algorithm URIs to WebCrypto hash algorithm names
        switch (signatureAlgorithm) {
            case 'http://www.w3.org/2000/09/xmldsig#rsa-sha1':
                return 'SHA-1';
            case 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256':
                return 'SHA-256';
            case 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha384':
                return 'SHA-384';
            case 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512':
                return 'SHA-512';
            default:
                // Default to SHA-256 if unknown algorithm
                return 'SHA-256';
        }
    }

    static generateId(prefix?: string): string {
        return prefix ? `${prefix}-${randomUUID()}` : randomUUID();
    }

    /**
     * Sign a fiscalization request XML document
     * @param xml - The XML string to sign
     * @returns The signed XML string
     */
    async signFiscalizationRequest(xml: string, referenceUri: string): Promise<string> {
        if (!this.privateKey) {
            await this.initializeKeys();
        }

        if (!this.privateKey) {
            throw new Error("Failed to initialize private key");
        }

        const xmlDoc = XAdES.Parse(xml);
        const signedXml = new XAdES.SignedXml();

        // Extract hash algorithm from signature algorithm URI
        const hashAlgorithm = this.getHashAlgorithmFromSignatureAlgorithm(this.options.signatureAlgorithm);

        const algorithm = {
            name: "RSASSA-PKCS1-v1_5",
            hash: hashAlgorithm
        };

        const signature = await signedXml.Sign(
            algorithm,
            this.privateKey,
            xmlDoc,
            {
                x509: [this.preparePemForXAdES(this.certificate)],
                references: [
                    {
                        uri: referenceUri,
                        hash: hashAlgorithm,
                        transforms: ["enveloped", "exc-c14n"]
                    }
                ],
                signingCertificateV2: this.preparePemForXAdES(this.certificate),
                signingTime: {
                    value: new Date()
                }
            }
        );

        const elSignature = signature.GetXml();

        if (!elSignature) {
            throw new Error("Failed to create signature XML element");
        }

        // Append signature to the document
        xmlDoc.documentElement.appendChild(elSignature);

        // Serialize the signed document
        return new XMLSerializer().serializeToString(xmlDoc);
    }

    static async isValidSignature(signedXml: string | Buffer): Promise<boolean>;
    static async isValidSignature(signedXml: string | Buffer, publicCert: string | Buffer): Promise<boolean>;
    static async isValidSignature(signedXml: string | Buffer, publicCert: string | Buffer, signature: XmlElement): Promise<boolean>
    static async isValidSignature(signedXml: string | Buffer, publicCert?: string | Buffer, signature?: XmlElement): Promise<boolean> {
        if (!signedXml) {
            throw new Error("Signed XML is required for signature validation");
        }

        const crypto = new Crypto();
        XAdES.Application.setEngine("NodeJS", crypto);

        if (Buffer.isBuffer(signedXml)) {
            signedXml = signedXml.toString('utf8');
        }

        const xmlDoc = XAdES.Parse(signedXml);
        const xmlSignatures = xmlDoc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");

        if (xmlSignatures.length === 0) {
            throw new Error("No signature found in the signed XML");
        }

        const signedXmlInstance = new XAdES.SignedXml(xmlDoc);
        signedXmlInstance.LoadXml(xmlSignatures[0]);

        if (publicCert) {
            const cert = new nodecrypto.X509Certificate(publicCert);
            const publicKeyPem = cert.publicKey.export({ type: 'spki', format: 'pem' }) as string;

            // Remove PEM headers/footers and newlines
            const pemContents = publicKeyPem
                .replace(/-----BEGIN PUBLIC KEY-----/, '')
                .replace(/-----END PUBLIC KEY-----/, '')
                .replace(/\s+/g, '');

            const publicKeyDer = Buffer.from(pemContents, 'base64');

            const cryptoKey = await crypto.subtle.importKey(
                'spki',
                publicKeyDer,
                {
                    name: 'RSASSA-PKCS1-v1_5',
                    hash: 'SHA-256',
                },
                true,
                ['verify']
            );

            return await signedXmlInstance.Verify(cryptoKey);
        }

        return await signedXmlInstance.Verify();

    }
}

function pemToDer(pem: string): ArrayBuffer {
    const pemContent = pem
        .replace(/-----(BEGIN|END)[\w\d\s]+-----/g, "")
        .replace(/[\r\n]/g, "");
    return new Uint8Array(Buffer.from(pemContent, "base64")).buffer;
}

function extractPemCertificate(input: string | Buffer): string {
    const startTag = '-----BEGIN CERTIFICATE-----';
    const endTag = '-----END CERTIFICATE-----';
    const str = Buffer.isBuffer(input) ? input.toString('utf8') : input;
    const beginIndex = str.indexOf(startTag);
    const endIndex = str.indexOf(endTag, beginIndex) + endTag.length;
    if (beginIndex === -1 || endIndex === -1) throw "No PEM certificate found in the input";
    return str.substring(beginIndex, endIndex);
}

function extractPemPrivateKey(input: string | Buffer): string {
    const startTag = '-----BEGIN PRIVATE KEY-----';
    const endTag = '-----END PRIVATE KEY-----';
    const str = Buffer.isBuffer(input) ? input.toString('utf8') : input
    const beginIndex = str.indexOf(startTag);
    const endIndex = str.indexOf(endTag, beginIndex) + endTag.length;
    if (beginIndex === -1 || endIndex === -1) throw "No PEM private key found in the input";
    return str.substring(beginIndex, endIndex);
}
