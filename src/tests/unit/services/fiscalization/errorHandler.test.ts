import { convertAndLogError } from '../../../../services/fiscalization/errorHandler';
import logger from '../../../../api/config/logger';
import {
  ClientFiscalizationError,
  ServerFiscalizationError,
  FiscalizationError,
} from '../../../../utils/errors';

describe('Unit | Service | Fiscalization | errorHandler', () => {
  describe('convertAndLogError', () => {
    let mockClient: any = {};
    beforeEach(() => {
      jest.clearAllMocks();
      mockClient = {
        lastRequest: 'last request',
        lastResponse: 'last response',
      };
    });
    it('should convert and log a Fiscalization client error', () => {
      const err = {
        cause: {
          root: {
            Envelope: {
              Header: null,
              Body: {
                Fault: {
                  faultcode: 'env:CLIENT',
                  faultstring:
                    "XML validation against XSD failed, with exception: cvc-pattern-valid: Value 'ns187ov411fdafd' is not facet-valid with respect to pattern '[a-z]{2}[0-9]{3}[a-z]{2}[0-9]{3}' for type 'RegistrationCodeSType'.",
                  detail: {
                    code: '11',
                    requestUUID: '0367372e-d15a-4f4c-abe2-1426b2ad3733',
                    responseUUID: '0f38550e-46f1-4402-acac-5b647cd0bbd8',
                  },
                },
              },
            },
          },
        },
      };
      // @ts-ignore
      logger = {
        error: jest.fn(),
      };
      const res = convertAndLogError(err, { sample: 'Request' }, mockClient);

      expect(res).toBeInstanceOf(ClientFiscalizationError);
      // @ts-ignore
      expect(logger.error.mock.calls.length).toBe(1);
      // @ts-ignore
      expect(logger.error.mock.calls[0][0]).toContain('Client');
    });

    it('should convert and log a Fiscalization server error', () => {
      const err = {
        cause: {
          root: {
            Envelope: {
              Header: null,
              Body: {
                Fault: {
                  faultcode: 'env:Server',
                  faultstring:
                    "XML validation against XSD failed, with exception: cvc-pattern-valid: Value 'ns187ov411fdafd' is not facet-valid with respect to pattern '[a-z]{2}[0-9]{3}[a-z]{2}[0-9]{3}' for type 'RegistrationCodeSType'.",
                  detail: {
                    code: '900',
                    requestUUID: '0367372e-d15a-4f4c-abe2-1426b2ad3733',
                    responseUUID: '0f38550e-46f1-4402-acac-5b647cd0bbd8',
                  },
                },
              },
            },
          },
        },
      };
      // @ts-ignore
      logger = {
        error: jest.fn(),
      };
      const res = convertAndLogError(err, { sample: 'Request' }, mockClient);

      expect(res).toBeInstanceOf(ServerFiscalizationError);
      // @ts-ignore
      expect(logger.error.mock.calls.length).toBe(1);
      // @ts-ignore
      expect(logger.error.mock.calls[0][0]).toContain('Server');
    });

    it('should fallback to a generic FiscalizationError if the error type cannot be identified', () => {
      const err = new Error('Random error');
      // @ts-ignore
      logger = {
        error: jest.fn(),
      };
      const res = convertAndLogError(err, { sample: 'Request' }, mockClient);

      expect(res).toBeInstanceOf(FiscalizationError);
      // @ts-ignore
      expect(logger.error.mock.calls.length).toBe(1);
    });
  });
});
