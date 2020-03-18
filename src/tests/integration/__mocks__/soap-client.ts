const FiscalizationService = JSON.parse(
  `{"FiscalizationService":{"FiscalizationServicePort":{"registerInvoice":{"input":{"Header":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"Invoice":{"SupplyDateOrPeriod":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"CorrectiveInv":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"PayMethods":{"PayMethod":{"Vouchers":{"Voucher":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"Currency":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"Seller":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"Buyer":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"Items":{"I":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"SameTaxes":{"SameTax":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"ConsTaxes":{"ConsTax":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"Fees":{"Fee":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"SumInvIICRefs":{"SumInvIICRef":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"}},"output":{"Header":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"FIC":"UUIDSType|string|pattern"}},"registerTCR":{"input":{"Header":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"TCR":"string"},"output":{"Header":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"TCRCode":"RegistrationCodeSType|string|pattern"}},"registerCashDeposit":{"input":{"Header":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"CashDeposit":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"}},"output":{"Header":{"targetNSAlias":"al","targetNamespace":"https://eFiskalizimi.tatime.gov.al/FiscalizationService/schema"},"FCDC":"UUIDSType|string|pattern"}}}}}`
);
const getResponseHeader = (req: any) => {
  return {
    attributes: {
      UUID: '11111111-1111-1111-1111-111111111111',
      RequestUUID:
        req[':Header']?.attributes?.UUID ||
        '22222222-2222-2222-2222-222222222222',
      SendDateTime: '2020-03-17T19:48:28.840+01:00',
    },
  };
};

const getMockTCRResponse = (req: any) => {
  return [
    {
      attributes: {
        Id: 'Response',
        Version: '2',
      },
      Header: getResponseHeader(req),
      TCRCode: 'vb721zy972',
      Signature: {},
    },
  ];
};

const getMockInvoiceResponse = (req: any) => {
  return [
    {
      attributes: {
        Id: 'Response',
        Version: '2',
      },
      Header: getResponseHeader(req),
      FIC: '33333333-3333-3333-3333-333333333333',
      Signature: {},
    },
  ];
};

const getMockCashBalanceResponse = (req: any) => {
  return [
    {
      attributes: {
        Id: 'Response',
        Version: '2',
      },
      Header: getResponseHeader(req),
      FCDC: '44444444-4444-4444-4444-444444444444',
      Signature: {},
    },
  ];
};

export default {
  _events: {},
  _eventsCount: 0,
  addBodyAttributeAsync: jest.fn().mockResolvedValue({}),
  addHttpHeaderAsync: jest.fn().mockResolvedValue({}),
  addListenerAsync: jest.fn().mockResolvedValue({}),
  addSoapHeaderAsync: jest.fn().mockResolvedValue({}),
  changeSoapHeaderAsync: jest.fn().mockResolvedValue({}),
  clearBodyAttributesAsync: jest.fn().mockResolvedValue({}),
  clearHttpHeadersAsync: jest.fn().mockResolvedValue({}),
  clearSoapHeadersAsync: jest.fn().mockResolvedValue({}),
  describeAsync: jest.fn().mockResolvedValue({}),
  emitAsync: jest.fn().mockResolvedValue({}),
  endpoint: 'https://efiskalizimi-test.tatime.gov.al/FiscalizationService-v2/',
  eventNamesAsync: jest.fn().mockResolvedValue({}),
  FiscalizationService,
  getBodyAttributesAsync: jest.fn().mockResolvedValue({}),
  getHttpHeadersAsync: jest.fn().mockResolvedValue({}),
  getMaxListenersAsync: jest.fn().mockResolvedValue({}),
  getSoapHeadersAsync: jest.fn().mockResolvedValue({}),
  hasOwnPropertyAsync: jest.fn().mockResolvedValue({}),
  httpClient: { _request: {} },
  isPrototypeOfAsync: jest.fn().mockResolvedValue({}),
  listenerCountAsync: jest.fn().mockResolvedValue({}),
  listenersAsync: jest.fn().mockResolvedValue({}),
  normalizeNames: undefined,
  offAsync: jest.fn().mockResolvedValue({}),
  onAsync: jest.fn().mockResolvedValue({}),
  onceAsync: jest.fn().mockResolvedValue({}),
  prependListenerAsync: jest.fn().mockResolvedValue({}),
  prependOnceListenerAsync: jest.fn().mockResolvedValue({}),
  propertyIsEnumerableAsync: jest.fn().mockResolvedValue({}),
  rawListenersAsync: jest.fn().mockResolvedValue({}),
  /** ---- IMPORTANT SHIT: ---- */
  registerCashDeposit: jest.fn((req, cb) => {
    cb(null, getMockCashBalanceResponse(req));
  }),
  registerCashDepositAsync: jest.fn(req =>
    Promise.resolve(getMockCashBalanceResponse(req))
  ),
  registerInvoice: jest.fn((req, cb) => {
    cb(null, getMockInvoiceResponse(req));
  }),
  registerInvoiceAsync: jest.fn(req =>
    Promise.resolve(getMockInvoiceResponse(req))
  ),
  registerTCR: jest.fn((req, cb) => {
    cb(null, getMockTCRResponse(req));
  }),
  registerTCRAsync: jest.fn(req => Promise.resolve(getMockTCRResponse(req))),
  setSecurity: jest.fn().mockReturnValue({}),
  lastRequest: '',
  lastResponse: '',
  /** ---- END OF IMPORTANT SHIT ---- */
  removeAllListenersAsync: jest.fn().mockResolvedValue({}),
  removeListenerAsync: jest.fn().mockResolvedValue({}),
  setEndpointAsync: jest.fn().mockResolvedValue({}),
  setMaxListenersAsync: jest.fn().mockResolvedValue({}),
  setSecurityAsync: jest.fn().mockResolvedValue({}),
  setSOAPActionAsync: jest.fn().mockResolvedValue({}),
  streamAllowed: undefined,
  toLocaleStringAsync: jest.fn().mockResolvedValue({}),
  toStringAsync: jest.fn().mockResolvedValue({}),
  valueOfAsync: jest.fn().mockResolvedValue({}),
  wsdl: {},
};
