import {
  registerWarehouseTransferNote,
  generateWTNIC,
} from '../../../services/WTN.service';
import { sendRegisterWTNRequest } from '../../../services/fiscalization';
import { privateKey, certificate, exampleKey } from '../../__test-data__/keys';

describe('Unit | Service | WTN', () => {
  const wtnRequest = {
    dateTimeCreated: '2020-04-13T22:42:00+02:00',
    wtnNum: 1232020,
    operatorCode: 'ax083bc420',
    businUnit: 'bg517kw842',
    startAddr: 'Rruga 1',
    startCity: 'Tirane',
    destinAddr: 'Rruga 2',
    destinCity: 'Durres',
    isAfterDel: false,
    transDate: '2020-04-13T22:42:00+02:00',
    carrierId: 'uniq-carrier',
    vehPlates: 'AA123PP',
    issuer: {
      nuis: 'L41323036D',
      name: 'John Doe',
    },
    items: [
      {
        name: 'Some Item',
        code: '123123',
        unit: 'piece',
        quantity: 1,
      },
    ],
  };

  describe('registerWarehouseTransferNote', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      // @ts-ignore
      sendRegisterWTNRequest = jest.fn(async (req) => {
        const FWTNIC = '55555555-5555-5555-5555-555555555555';
        return {
          header: {
            requestUUID: req.header.UUID,
            sendDateTime: req.header.sendDateTime,
            UUID: '44444444-4444-4444-4444-444444444444',
          },
          body: {
            FWTNIC,
          },
        };
      });
    });

    it('registers registers a new WTN with valid data', async () => {
      const response = await registerWarehouseTransferNote(
        wtnRequest,
        privateKey,
        certificate
      );

      expect(response.body).toMatchObject({
        dateTimeCreated: '2020-04-13T22:42:00+02:00',
        wtnNum: 1232020,
        operatorCode: 'ax083bc420',
        businUnit: 'bg517kw842',
        startAddr: 'Rruga 1',
        startCity: 'Tirane',
        destinAddr: 'Rruga 2',
        destinCity: 'Durres',
        isAfterDel: false,
        transDate: '2020-04-13T22:42:00+02:00',
        carrierId: 'uniq-carrier',
        vehPlates: 'AA123PP',
        issuer: {
          nuis: 'L41323036D',
          name: 'John Doe',
        },
        items: [
          {
            name: 'Some Item',
            code: '123123',
            unit: 'piece',
            quantity: 1,
          },
        ],
        wtnic: '1810A28D31713ECAE6CC4648943CA37D',
        wtnicSignature:
          '1E81AA623B8D2740E19CBBFD32B0EA638D0B36ACD78EE2177BA0F74E659D960C2AE57A1497E879DE5F1998B2757996E812B815E435959C59E104046F3B3C69D312700E673E354B3717E75C5D2DA72ABEB60C1CF15354D6E87839DE5B2B52145CCBFCADCAA8E6CD1B6A4594AE6BBE5F7220A5205DE85B243C922F035911A2DE428CC2DC5E097E9354609EE84500793CB72424284C95749DCC53DCD34875307C2D68B0F4DFFE44548254891253097BFE5B00615A732F8A2D13D7C258642D0179608D0572F121949836E721116B8D6E590570F12A55FF42E0B5843233B05B3A6C116F5404B4882B7E668EA89887EF5D5BEBAC92E92F9453EB5C9525CF3020D01C4B',
      });

      expect(response.body.FWTNIC).toBe('55555555-5555-5555-5555-555555555555');
      expect(response.header.UUID).toBeDefined();
      expect(response.header.requestUUID).toBeDefined();
      expect(response.header.sendDateTime).toBeDefined();
    });
  });

  describe('generateWTNIC & generateWTNICSignature', () => {
    it('generates the correct WTNIC & signature for the given data', () => {
      const { wtnic, wtnicSignature } = generateWTNIC(
        'I12345678I',
        '2019-06-12T17:05:43+02:00',
        '9952',
        'bb123bb123',
        'ss123ss123',
        exampleKey
      );

      expect(wtnicSignature).toBe(
        '7F3E538EFDEA77AE4DD7AE9E6E1C5EA4A6AF6951745C0BBAF67E032A461A3D7B6E213BC787C312343C282C335BDEF0413543AD117CBEAC2EA61FE32554C6C87880AE6279970D12C3C77D5C8CB045CAE6CFA4C904A4B09DCDC3E166C0246FEBE9E05E60B02A0AC05A7DCAAE40407FA7222CDB2BF2EB82F1917CAB4D1D6785B9A5A0D61825EFE9A778A04C04D0C75C09C41B7A1458FD2175E681239D5921AB8C65E5C213893FBBECB4F97153407398DD451A870929C471D7C7969AB1181E50B6CA3692C641994BF3AC1009C45B68F8879007DCBFD3576FD02B83745781A0AE1851EFC7416F3D3EA0D1E8EB01835D1B64931C6504AFD00BEFD84019CF994E9AF9AE'
      );
      expect(wtnic).toBe('363350A9E21BC289253AAC9DC8C5E7E5');
    });
  });
});
