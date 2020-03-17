import {
  privateKey as key,
  certificate as cert,
} from '../../../__test-data__/keys';
import { WSSecurityCert } from '../../../../services/security/CustomWSSecurityCert';

const configurations = {
  hasTimeStamp: false,
  signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
  signerOptions: {
    prefix: '',
  },
};

describe('Unit | Service | CustomWSSecurityCert', () => {
  it('should correctly sign the given request', () => {
    const unsigned =
      '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:al="https://eFiskalizimi.tatime.gov.al/FiscalizationService" xmlns:als="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body Id="_0"><RegisterTCRRequest xmlns="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema" xmlns:ns2="http://www.w3.org/2000/09/xmldsig#" Id="Request" Version="2"><Header SendDateTime="2020-03-17T16:48:32+01:00" UUID="622eb286-70f4-4105-9f25-3fc13fa79955"></Header><TCR BusinUnitCode="ns187ov411" IssuerNUIS="L41323036D" MaintainerCode="pa979rk772" SoftCode="in820nx828" TCRIntID="1" xmlns:al="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"></TCR></RegisterTCRRequest></SOAP-ENV:Body></SOAP-ENV:Envelope>';
    const expected =
      '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:al="https://eFiskalizimi.tatime.gov.al/FiscalizationService" xmlns:als="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body Id="_0"><RegisterTCRRequest xmlns="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema" xmlns:ns2="http://www.w3.org/2000/09/xmldsig#" Id="Request" Version="2"><Header SendDateTime="2020-03-17T16:48:32+01:00" UUID="622eb286-70f4-4105-9f25-3fc13fa79955"></Header><TCR BusinUnitCode="ns187ov411" IssuerNUIS="L41323036D" MaintainerCode="pa979rk772" SoftCode="in820nx828" TCRIntID="1" xmlns:al="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"></TCR><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"><SignedInfo><CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/><SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><Reference URI="#Request"><Transforms><Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/><Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></Transforms><DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><DigestValue>30gMXLpHpUUZRutwhkU54dlj8Qd9C/A+h6UA2zrMQNU=</DigestValue></Reference></SignedInfo><SignatureValue>CcYy1JTwEMI4fOCrcRfdfIr8MCPS/UtpXHmeSb7TbqvpO5dQvUEN/ANc6JQDUeO933DjGW/oInAYKyQB+V2fasMikLvxcsK/dz9RNu4TndaRo2j1yM+UUi0s+PaetsPXVs+T16oN7L70MFgql2DQU3mF/R6HSceAj1CH90qTpgnSbNwdQAk+Oiy/SZGaKcpg3dUoeutEzS0Kfp9eM412sQ/s0P8p5CJ4AnahOHXc/UT8njSHH0hfs6hfEN4VTxJuisj4WToxRkxVuM0K0sWgzXuKB5dloRZjJuXiOFio2OaL4l5jBcROvRd33iMZ4ITMFMpTwbicCpEOTKF28vvCaQ==</SignatureValue><KeyInfo><X509Data><X509Certificate>MIIFYTCCBEmgAwIBAgIKQ4ym3voejag0IzANBgkqhkiG9w0BAQsFADBLMQswCQYDVQQGEwJBTDENMAsGA1UEChMETkFJUzEtMCsGA1UEAxMkTkFJUyBDbGFzcyAzIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MB4XDTIwMDMxMDA5MTQyOFoXDTIxMDMxMDA5MTQyOFowdzELMAkGA1UEBhMCQUwxDzANBgNVBAcTBlRpcmFuZTESMBAGA1UEChMJSU5PVkFDSU9OMQ0wCwYDVQQMEwRUZXN0MR8wHQYDVQQDExZJTk9WQUNJT04gRmlza2FsaXppbWkxMRMwEQYDVQQEEwpMNDEzMjMwMzZEMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoJNNNDAadPsmUnCqpgsW+kceBA+Q9qMv18FiZZqSvwy48s8ocRrGYsZIvC7u7blziBrJI2zMJr0yg36RMei0VCSt5aFCbwpXroK8eQIsIR/fRBJRgby7V8ZD4wtFZVS8hAjJpSJowMEaLjFAmFMsPDUricJfjb+DcjJ10j0+2/Gh3awKnKPfOUszTuC+yDInoHEqQ6aVkCcMdtDQqJgA3xMz+mv9tZ/I+FoiD8YVEhyAhavAoROfHRo1V5oZ6cW048loo6gyqQ/RHGERlyXjrVpBu+xvKALohkc8YPAptZ44Fd9l7T5hK1tb9ueaiAPSUMdejf2mXvMSBkZhDVS6zQIDAQABo4ICGTCCAhUwZgYIKwYBBQUHAQEEWjBYMCQGCCsGAQUFBzABhhhodHRwOi8vb2NzcC5ha3NoaS5nb3YuYWwwMAYIKwYBBQUHMAKGJGh0dHA6Ly9jZXJ0cy5ha3NoaS5nb3YuYWwvY2xhc3MzLmNydDAOBgNVHQ8BAf8EBAMCBPAwHwYDVR0jBBgwFoAUhyao+9srUZs50JjW9MYzVkdc2AUwHQYDVR0OBBYEFPej/sqZjXoL0+BJhCA8TDzw7fZzMEsGA1UdIAREMEIwQAYMKwYBBAGCsWwKAQEDMDAwLgYIKwYBBQUHAgEWImh0dHA6Ly93d3cuYWtzaGkuZ292LmFsL3JlcG9zaXRvcnkwgacGA1UdHwSBnzCBnDCBmaCBlqCBk4YiaHR0cDovL2NybC5ha3NoaS5nb3YuYWwvY2xhc3MzLmNybIZtbGRhcDovL2xkYXAuYWtzaGkuZ292LmFsL0NOPU5BSVMgQ2xhc3MgMyBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSxPPU5BSVMsQz1BTD9jZXJ0aWZpY2F0ZVJldm9jYXRpb25MaXN0O2JpbmFyeTBFBgNVHREEPjA8oCQGCisGAQQBgjcUAgOgFgwUYWtpbHJhamRob0BnbWFpbC5jb22BFGFraWxyYWpkaG9AZ21haWwuY29tMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcDBDANBgkqhkiG9w0BAQsFAAOCAQEALxEwTJ+VGPL2ZlDoXoHjOqbnA4jKl0bdwRxbgb7CRmHiS8oIyjzNVj7WLY6GJZPdEh059T1N8Ot+szzwIo8FsurhPlgsgDRDXkgC2zL/29x8aeTslUQvQu/GuSTGReP/u2FgOJ4kDiKULGL7G0e1cZPLuuio79+4q7KCzI/Jk+5p9QRj93yrd5dh+WqaFdjFJFBHchSwezzP7bzF7ua0EPdM62ZcNO4IhLz0CuDaNcKYwn0gl6zQ5uTf1oenDrVRYd/frrLCMmuVBnImd2Q3EfDH5Mc8KSCzYl0XqJjJrvKWbpRMClRpmZERNeKkazHHF9rkTMrNTGQXdhXpZZ9vEA==</X509Certificate></X509Data></KeyInfo></Signature></RegisterTCRRequest></SOAP-ENV:Body></SOAP-ENV:Envelope>';
    const sec = new WSSecurityCert(
      key,
      cert,
      '',
      'RegisterTCRRequest',
      configurations
    );

    const signed = sec.postProcess(unsigned, 'SOAP-ENV:Envelope');
    expect(signed).toBe(expected);
  });
});
