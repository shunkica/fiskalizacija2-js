export interface IXmlSerializable {
    toXmlString(): string;
}

export type XmlSerializable<T> = T & IXmlSerializable;

export interface IBusinessTermXpath {
    id: string;
    name: string;
    xpath: {
        Invoice: string[];
        CreditNote: string[];
    };
}
