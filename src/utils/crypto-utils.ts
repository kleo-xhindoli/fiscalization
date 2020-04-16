import RSA from 'node-rsa';
import forge from 'node-forge';
import {
  InvalidRSAPrivateKeyError,
  InvalidCertificateError,
  CertificateExpiredError,
  KeyDoesNotMatchCertError,
  InvalidCertificateIssuerError,
  InvalidPrivateKey,
} from './errors';
import isPast from 'date-fns/isPast';
import crypto from 'crypto';
import NodeRSA from 'node-rsa';

type PrivateKey = forge.pki.rsa.PrivateKey;
type PublicKey = forge.pki.rsa.PublicKey;
type Certificate = forge.pki.Certificate;

const pki = forge.pki;

const parsePrivateKey = (privateKey: string): PrivateKey => {
  try {
    // Signing of XML fails if the private key is missing new lines
    if (privateKey.indexOf('\n') < 0) throw new InvalidRSAPrivateKeyError();
    return pki.privateKeyFromPem(privateKey) as PrivateKey;
  } catch (e) {
    throw new InvalidRSAPrivateKeyError();
  }
};

const parseCertificate = (cert: string): Certificate => {
  try {
    return pki.certificateFromPem(cert);
  } catch (e) {
    throw new InvalidCertificateError();
  }
};

const validateCertificate = (certificate: Certificate) => {
  // TODO: Validate NUIS
  const { notAfter } = certificate.validity;
  if (isPast(notAfter)) {
    throw new CertificateExpiredError();
  }

  // TODO: Consider enableing in the future. Might not be too safe due to this
  // value changing in the future.
  // const issuer = certificate.issuer.getField('CN');
  // if (issuer?.value !== 'NAIS Class 3 Certification Authority') {
  //   throw new InvalidCertificateIssuerError();
  // }
};

const validateMatch = (certificate: Certificate, privateKey: PrivateKey) => {
  const publicKey = certificate.publicKey as PublicKey;

  // Verify that modulus matches
  if (privateKey.n.toString() !== publicKey.n.toString()) {
    throw new KeyDoesNotMatchCertError();
  }
};

export const validateCryptoIntegrity = (cert: string, key: string) => {
  const certificate = parseCertificate(cert);
  const privateKey = parsePrivateKey(key);
  validateCertificate(certificate);

  // This is disabled for performance reasons
  // validateMatch(certificate, privateKey);
};

// Identification code generation utils
const generateIdentificationCodeSignature = (
  concatinatedInputs: string,
  privateKey: string
) => {
  try {
    const key = new NodeRSA(privateKey, 'private');
    key.setOptions({ signingScheme: 'pkcs1-sha256' });
    const buffer = Buffer.from(concatinatedInputs, 'utf8');
    const signature = key.sign(buffer);

    const signatureString = signature.toString('hex').toUpperCase();
    return { signature, signatureString };
  } catch (e) {
    throw new InvalidPrivateKey();
  }
};

export const generateIdentificationCode = (
  concatinatedInputs: string,
  privateKey: string
): { ic: string; signature: string } => {
  const { signature, signatureString } = generateIdentificationCodeSignature(
    concatinatedInputs,
    privateKey
  );
  const hash = crypto.createHash('md5');
  hash.update(signature);
  const digest = hash.digest('hex').toUpperCase();

  return { ic: digest, signature: signatureString };
};
