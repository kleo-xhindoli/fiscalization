import { v4 as uuid4 } from 'uuid';
import { SignedXml } from 'xml-crypto';
import { ISecurity } from 'soap';

function insertStr(src: string, dst: string, pos: number): string {
  return [dst.slice(0, pos), src, dst.slice(pos)].join('');
}

function generateId(): string {
  return uuid4().replace(/-/gm, '');
}

const oasisBaseUri = 'http://docs.oasis-open.org/wss/2004/01';

export interface IWSSecurityCertOptions {
  hasTimeStamp?: boolean;
  signatureTransformations?: string[];
  signatureAlgorithm?: string;
  additionalReferences?: string[];
  signerOptions?: IXmlSignerOptions;
}

export interface IXmlSignerOptions {
  prefix?: string;
  attrs?: { [key: string]: string };
  existingPrefixes?: { [key: string]: string };
}

export class WSSecurityCert implements ISecurity {
  private publicP12PEM: string;
  private signer: any;
  private signerOptions: IXmlSignerOptions = {};
  private signatureTransformations: string[];

  constructor(
    privatePEM: any,
    publicP12PEM: any,
    password: any,
    options: IWSSecurityCertOptions = {}
  ) {
    this.publicP12PEM = publicP12PEM
      .toString()
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/(\r\n|\n|\r)/gm, '');

    this.signer = new SignedXml();
    if (
      options.signatureAlgorithm ===
      'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
    ) {
      this.signer.signatureAlgorithm = options.signatureAlgorithm;
      const bodyXpath = `//*[@Id="Request"]`;
      this.signer.addReference(
        bodyXpath,
        [
          'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
          'http://www.w3.org/2001/10/xml-exc-c14n#',
        ],
        'http://www.w3.org/2001/04/xmlenc#sha256'
      );
    }

    if (options.signerOptions) {
      const { signerOptions } = options;
      this.signerOptions = signerOptions;
      if (!this.signerOptions.existingPrefixes) {
        this.signerOptions.existingPrefixes = {};
      }
      if (
        this.signerOptions.existingPrefixes &&
        !this.signerOptions.existingPrefixes.wsse
      ) {
        this.signerOptions.existingPrefixes.wsse = `${oasisBaseUri}/oasis-200401-wss-wssecurity-secext-1.0.xsd`;
      }
    } else {
      this.signerOptions = {
        existingPrefixes: {
          wsse: `${oasisBaseUri}/oasis-200401-wss-wssecurity-secext-1.0.xsd`,
        },
      };
    }

    this.signer.signingKey = {
      key: privatePEM,
      passphrase: password,
    };

    this.signatureTransformations = Array.isArray(
      options.signatureTransformations
    )
      ? options.signatureTransformations
      : [
          'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
          'http://www.w3.org/2001/10/xml-exc-c14n#',
        ];

    this.signer.keyInfoProvider = {};
    this.signer.keyInfoProvider.getKeyInfo = (key: any) => {
      return (
        `<X509Data>` +
        `<X509Certificate>${this.publicP12PEM}</X509Certificate>` +
        `</X509Data>`
      );
    };
  }

  public postProcess(xml: any, envelopeKey: any) {
    const xmlWithSec = xml;

    const references = this.signatureTransformations;

    // const bodyXpath = `//*[name(.)='${envelopeKey}:Body']`;
    // TODO: take id as argument
    const bodyXpath = `//*[@Id="Request"]`;
    if (
      !(
        this.signer.references.filter((ref: any) => ref.xpath === bodyXpath)
          .length > 0
      )
    ) {
      this.signer.addReference(bodyXpath, references);
    }

    this.signer.computeSignature(xmlWithSec, this.signerOptions);

    return insertStr(
      this.signer.getSignatureXml(),
      xmlWithSec,
      // TODO: make this dynamic
      xmlWithSec.indexOf('</RegisterTCRRequest')
    );
  }
}
