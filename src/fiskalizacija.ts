import { XmlSigner } from "./util/signing";
import { EvidentirajERacunOdgovor, EvidentirajERacunZahtjev } from "./models/fiskalizacija";
import type {
    FiskalizacijaOptions,
    FiskalizacijaResult,
    IEvidentirajERacunZahtjev,
    IEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev,
    IEvidentirajNaplatuZahtjev,
    IEvidentirajOdbijanjeZahtjev,
    IGreska
} from "./types";
import type { XmlElement } from "libxml2-wasm";
import { XmlDocument } from "libxml2-wasm";
import { FISK_NS } from "./constants/const";
import { usingXmlDocument } from "./util/xml";
import { postRequest } from "./util/http";
import { parseError, ValidationError } from "./util/error";
import {
    EvidentirajIsporukuZaKojuNijeIzdanERacunOdgovor,
    EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev,
    EvidentirajNaplatuOdgovor,
    EvidentirajNaplatuZahtjev,
    EvidentirajOdbijanjeOdgovor,
    EvidentirajOdbijanjeZahtjev
} from "./models/izvjestavanje";
import { FINA_CA_BUNDLE } from "./constants/ca";

interface SerializableRequest {
    toXmlString(): string;
    _id: string;
}

interface ParsedResponse {
    Odgovor: {
        prihvacenZahtjev: boolean;
        greska?: IGreska;
    };
}

type RequestClass<TReqData, TReq extends SerializableRequest> = new (arg: TReqData) => TReq;
type ResponseClass<TRes extends ParsedResponse> = {
    fromXmlElement(elem: XmlElement, options?: { lenient?: boolean; errors?: ValidationError[] }): TRes;
};

interface RequestConfig<TReqData, TReq extends SerializableRequest, TRes extends ParsedResponse> {
    RequestClass: RequestClass<TReqData, TReq>;
    ResponseClass: ResponseClass<TRes>;
    xpath: string;
}

export class FiskalizacijaClient {
    private readonly signer: XmlSigner;
    private readonly options: FiskalizacijaOptions;

    constructor(options: FiskalizacijaOptions) {
        this.options = {
            timeout: 30000,
            ca: FINA_CA_BUNDLE,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "SOAPAction": ""
            },
            ...options
        };

        this.signer = new XmlSigner(options);
    }

    private async execute<TReqData, TReq extends SerializableRequest, TRes extends ParsedResponse>(
        zahtjev: TReq | TReqData,
        config: RequestConfig<TReqData, TReq, TRes>
    ): Promise<FiskalizacijaResult<TReq, TRes>> {
        const result: FiskalizacijaResult<TReq, TRes> = { success: false };

        try {
            const requestInstance = zahtjev instanceof config.RequestClass ? zahtjev : new config.RequestClass(zahtjev as TReqData);

            result.reqObject = requestInstance;

            const signedXml = this.signer.signFiscalizationRequest(requestInstance.toXmlString(), requestInstance._id);
            const soap = this.generateSoapEnvelope(signedXml);
            result.soapReqRaw = soap;

            const { statusCode, data } = await postRequest(soap, this.options);
            result.httpStatusCode = statusCode;
            result.soapResRaw = data;

            try {
                result.soapResSignatureValid = XmlSigner.isValidSignature(result.soapResRaw);
            } catch (error) {
                result.soapResSignatureValid = false;
                result.error = parseError(error);
            }

            usingXmlDocument(XmlDocument.fromString(data), (doc: XmlDocument) => {
                const odgovorElement = doc.get(config.xpath, FISK_NS) as XmlElement;
                if (!odgovorElement) {
                    throw new ValidationError(`HTTP ${statusCode} | ${config.xpath}`, data);
                }

                const resErrors: ValidationError[] = [];
                result.resObject = config.ResponseClass.fromXmlElement(odgovorElement, { lenient: true, errors: resErrors });

                if (resErrors.length > 0) {
                    result.resErrors = resErrors.map(err => parseError(err));
                }

                result.success = result.resObject.Odgovor.prihvacenZahtjev && !result.resObject.Odgovor.greska;
            });
        } catch (error) {
            result.error = parseError(error);
        }

        return result;
    }

    async evidentirajERacun(zahtjev: IEvidentirajERacunZahtjev | EvidentirajERacunZahtjev) {
        return this.execute(zahtjev, {
            RequestClass: EvidentirajERacunZahtjev,
            ResponseClass: EvidentirajERacunOdgovor,
            xpath: "/soapenv:Envelope/soapenv:Body/efis:EvidentirajERacunOdgovor"
        });
    }

    async evidentirajNaplatu(zahtjev: IEvidentirajNaplatuZahtjev | EvidentirajNaplatuZahtjev) {
        return this.execute(zahtjev, {
            RequestClass: EvidentirajNaplatuZahtjev,
            ResponseClass: EvidentirajNaplatuOdgovor,
            xpath: "/soapenv:Envelope/soapenv:Body/eizv:EvidentirajNaplatuOdgovor"
        });
    }

    async evidentirajOdbijanje(zahtjev: IEvidentirajOdbijanjeZahtjev | EvidentirajOdbijanjeZahtjev) {
        return this.execute(zahtjev, {
            RequestClass: EvidentirajOdbijanjeZahtjev,
            ResponseClass: EvidentirajOdbijanjeOdgovor,
            xpath: "/soapenv:Envelope/soapenv:Body/eizv:EvidentirajOdbijanjeOdgovor"
        });
    }

    async evidentirajIsporukuZaKojuNijeIzdanERacun(
        zahtjev: IEvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev | EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev
    ) {
        return this.execute(zahtjev, {
            RequestClass: EvidentirajIsporukuZaKojuNijeIzdanERacunZahtjev,
            ResponseClass: EvidentirajIsporukuZaKojuNijeIzdanERacunOdgovor,
            xpath: "/soapenv:Envelope/soapenv:Body/eizv:EvidentirajIsporukuZaKojuNijeIzdanERacunOdgovor"
        });
    }

    private generateSoapEnvelope(body: string, withXmlDec: boolean = true): string {
        let res = "";
        if (withXmlDec) {
            res += '<?xml version="1.0" encoding="UTF-8"?>';
        }
        res += '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
        res += "<soap:Body>";
        res += body;
        res += "</soap:Body>";
        res += "</soap:Envelope>";
        return res;
    }
}
