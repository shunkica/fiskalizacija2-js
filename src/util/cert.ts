export function extractPemCertificate(pem: string | Buffer): string {
    if (Buffer.isBuffer(pem)) {
        pem = pem.toString("utf8");
    }
    const match = pem.match(/-----BEGIN CERTIFICATE-----(.*?)-----END CERTIFICATE-----/s);
    if (match && match[0]) {
        return match[0].trim();
    }
    throw new Error("Invalid PEM certificate format");
}

export function extractPemPrivateKey(pem: string | Buffer): string {
    if (Buffer.isBuffer(pem)) {
        pem = pem.toString("utf8");
    }
    const match = pem.match(/-----BEGIN (?:RSA )?PRIVATE KEY-----(.*?)-----END (?:RSA )?PRIVATE KEY-----/s);
    if (match && match[0]) {
        return match[0].trim();
    }
    throw new Error("Invalid PEM private key format");
}
