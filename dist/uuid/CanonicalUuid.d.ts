import { Brand } from '../type/Brand';
export type CanonicalUuid = Brand<string, 'CanonicalUuid'>;
export declare const CanonicalUuid: {
    fromString: (uuid: string) => CanonicalUuid;
    parse: (uuid: string) => CanonicalUuid;
    v4: () => CanonicalUuid;
    v7: () => CanonicalUuid;
    toString: (uuid: CanonicalUuid) => string;
    isValid: (value: any) => value is CanonicalUuid;
    compare: (a: CanonicalUuid, b: CanonicalUuid) => number;
    min: (a: CanonicalUuid, b: CanonicalUuid) => CanonicalUuid;
    max: (a: CanonicalUuid, b: CanonicalUuid) => CanonicalUuid;
    getVersion: (uuid: CanonicalUuid) => number;
    isV7: (uuid: CanonicalUuid) => boolean;
    isV4: (uuid: CanonicalUuid) => boolean;
};
