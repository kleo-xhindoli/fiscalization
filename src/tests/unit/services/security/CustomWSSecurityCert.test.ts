import { key, cert } from './keys.pem';
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
      '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:al="https://eFiskalizimi.tatime.gov.al/FiscalizationService" xmlns:als="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body Id="_0"><RegisterTCRRequest xmlns="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema" xmlns:ns2="http://www.w3.org/2000/09/xmldsig#" Id="Request"><Header SendDateTime="2020-02-22T12:02:31+01:00" UUID="2945b476-820f-4165-977d-b23ec9b3b480"></Header><TCR BusinUnit="bg517kw842" IssuerNUIS="J81609010U" ManufacNum="mm123mm123" RegDateTime="2020-02-22T12:02:31+01:00" SoftNum="ss123ss123" TCROrdNum="1" xmlns:al="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"></TCR></RegisterTCRRequest></SOAP-ENV:Body></SOAP-ENV:Envelope>';
    const expected =
      '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:al="https://eFiskalizimi.tatime.gov.al/FiscalizationService" xmlns:als="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body Id="_0"><RegisterTCRRequest xmlns="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema" xmlns:ns2="http://www.w3.org/2000/09/xmldsig#" Id="Request"><Header SendDateTime="2020-02-22T12:02:31+01:00" UUID="2945b476-820f-4165-977d-b23ec9b3b480"></Header><TCR BusinUnit="bg517kw842" IssuerNUIS="J81609010U" ManufacNum="mm123mm123" RegDateTime="2020-02-22T12:02:31+01:00" SoftNum="ss123ss123" TCROrdNum="1" xmlns:al="https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"></TCR><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"><SignedInfo><CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/><SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><Reference URI="#Request"><Transforms><Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/><Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></Transforms><DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><DigestValue>+SvHs2q61G4NfiFmi74DOZ7Ncu8XlqfSKvToUEbHqSo=</DigestValue></Reference></SignedInfo><SignatureValue>RjegJhBRsKOxJIXkNJXGdx4Qwgdz6B1SOIz9ubDBiOJAjP92rzxtjI99ZnowwHyFdX0tFEZM+Ttv8xpPM2I8uCo274rdk6jGZXepfE1/9D9/RpE5vUg+YsEiSMBYbUI7LgMcfidyTTtQvIRXyyeS5YPnxnN+U9SSEgZL1arfNTeAqo9ETwPkMyhU0nWFG06sLwX+kJfX2UoO7/C7iaRpSggxjboXSzRySmuBDdiR9w35YmV3e7Vv3Nw5LCWba3grLiZsBcdU+WzEy9OOcxtIkvzW4Gu4ogE7DMeitU1VpCOAUq7UZrQF5QOcTe9h2XxFfSGChh4Sg7OUwhTt5GrgFQ==</SignatureValue><KeyInfo><X509Data><X509Certificate>MIIFXTCCBEWgAwIBAgIKQ3yI+5sXyI2pKjANBgkqhkiG9w0BAQsFADBLMQswCQYDVQQGEwJBTDENMAsGA1UEChMETkFJUzEtMCsGA1UEAxMkTkFJUyBDbGFzcyAzIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MB4XDTIwMDIxOTEwMDIxNloXDTIxMDIxODEwMDIxNlowczELMAkGA1UEBhMCQUwxDzANBgNVBAcTBlRpcmFuZTEQMA4GA1UEChMHRkFTVEVDSDENMAsGA1UEDBMEVGVzdDEdMBsGA1UEAxMURkFTVEVDSCBGaXNrYWxpemltaTExEzARBgNVBAQTCko4MTYwOTAxMFUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC3NA712bUS/brIjUbbTKSbQtm2VZoYBInjeLALiZxuoL7eZEoZTOrPaMSshjVPGeWGOjJSvuRUh3cgdvxlrZwrrisZ4TpRS6HWpPYqEK2C+bWvz5JKVgjP0oYnHu3gZCqDvdBT7P3m3HoglP+gkFDwiVr/g25SbuQ5IopI3CgempW++ztlqZGcqIDo/8VsF1kJSqMiUaYMBp0WpUZdLjRMIQg0tNhhv0/jI4knNkSLRzE7G9QM39+f2Jclg3JHBGg/lUZIXHqGM2uZ0FVqDHedyxYO9zxiw4Oq1xNx9X7y8k1pfq5NHGZ6lLZkqnTvSmNLuR/c7Bg40Q8cZYs2BgqLAgMBAAGjggIZMIICFTBmBggrBgEFBQcBAQRaMFgwJAYIKwYBBQUHMAGGGGh0dHA6Ly9vY3NwLmFrc2hpLmdvdi5hbDAwBggrBgEFBQcwAoYkaHR0cDovL2NlcnRzLmFrc2hpLmdvdi5hbC9jbGFzczMuY3J0MA4GA1UdDwEB/wQEAwIE8DAfBgNVHSMEGDAWgBSHJqj72ytRmznQmNb0xjNWR1zYBTAdBgNVHQ4EFgQUZZsxw/VI6aYBxbgETMnD7ij9C+EwSwYDVR0gBEQwQjBABgwrBgEEAYKxbAoBAQMwMDAuBggrBgEFBQcCARYiaHR0cDovL3d3dy5ha3NoaS5nb3YuYWwvcmVwb3NpdG9yeTCBpwYDVR0fBIGfMIGcMIGZoIGWoIGThiJodHRwOi8vY3JsLmFrc2hpLmdvdi5hbC9jbGFzczMuY3Jshm1sZGFwOi8vbGRhcC5ha3NoaS5nb3YuYWwvQ049TkFJUyBDbGFzcyAzIENlcnRpZmljYXRpb24gQXV0aG9yaXR5LE89TkFJUyxDPUFMP2NlcnRpZmljYXRlUmV2b2NhdGlvbkxpc3Q7YmluYXJ5MEUGA1UdEQQ+MDygJAYKKwYBBAGCNxQCA6AWDBRhcGFwYUBmYXN0ZWNoLmNvbS5hbIEUYXBhcGFAZmFzdGVjaC5jb20uYWwwHQYDVR0lBBYwFAYIKwYBBQUHAwIGCCsGAQUFBwMEMA0GCSqGSIb3DQEBCwUAA4IBAQCPlkziRBEh+KSa6lAVfu7lS36Y5yEzK3nZkJZPritwlgz7+wZSCVjIgxBtnf0A6Wr72BOzEf5I0gPUH2f17y1IMdypKC5h8zY0GYq2Zf76SR1Ex2wvF+4BxEMMIyCU3Hqe3YAfHntOPYygnGmLhJMvkZvySIvgq/IgbcakPPgd1eoTyh1qnyTtevnz5rYSqWYRXUEfeqGZrbAhJUbIBgoLed4upEzdrQl6TNbt3WO1e9JZlzYi5NuBBxcVNi91zL1dG+S3L07CeKXEZd7MmetU2okVnPYrpdmEmoiYCIFTWYExXHw9D2JcrP4jVx4oPyVMJNPRhoTCv1dXdthHnfdd</X509Certificate></X509Data></KeyInfo></Signature></RegisterTCRRequest></SOAP-ENV:Body></SOAP-ENV:Envelope>';
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
