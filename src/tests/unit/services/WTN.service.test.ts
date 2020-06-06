import {
  registerWarehouseTransferNote,
  generateWTNIC,
} from '../../../services/WTN.service';
import { sendRegisterWTNRequest } from '../../../services/fiscalization';
import { privateKey, certificate, exampleKey } from '../../__test-data__/keys';
import {
  WTN_TYPE_WTN,
  WTN_GROUP_TYPE_FUEL,
  WTN_TRANSACTION_TYPE_SALES,
  VEH_OWNERSHIP_OWNER,
  WTN_LOCATION_TYPE_WAREHOUSE,
  WTN_LOCATION_TYPE_STORE,
  RegisterWarehouseTransferNoteRequest,
} from '../../../types';

describe('Unit | Service | WTN', () => {
  const wtnRequest: RegisterWarehouseTransferNoteRequest = {
    wtnType: WTN_TYPE_WTN,
    groupOfGoods: WTN_GROUP_TYPE_FUEL,
    transaction: WTN_TRANSACTION_TYPE_SALES,
    issueDateTime: '2020-04-13T22:42:00+02:00',
    operatorCode: 'ax083bc420',
    businUnitCode: 'bg517kw842',
    wtnOrdNum: 1,
    wtnNum: '1/2020',
    fuelPumNum: 'test',

    totPriceWoVAT: 4000,
    totVATAmt: 200,
    totPrice: 4200,

    vehOwnership: VEH_OWNERSHIP_OWNER,
    vehPlates: 'AA200GG',

    startAddr: 'Rruga 3',
    startCity: 'Durres',
    startPoint: WTN_LOCATION_TYPE_WAREHOUSE,
    startDateTime: '2020-04-13T22:42:00+02:00',
    destinAddr: 'Rruga 6',
    destinCity: 'Tirane',
    destinPoint: WTN_LOCATION_TYPE_STORE,
    destinDateTime: '2020-04-14T00:42:00+02:00',

    isGoodsFlammable: true,
    isEscortRequired: false,

    packType: 'liquid tank',
    packNum: 1,
    itemsNum: 1,
    isAfterDel: false,
    issuer: {
      nuis: 'L41323036D',
      name: 'Oil SHPK',
      address: 'Rruga 16',
      town: 'Tirane',
    },

    // carrier: {
    //   idNum: 'K21239067K',
    //   idType: 'ID',
    //   name: 'John Doe',
    // },

    items: [
      {
        name: 'Oil',
        code: '123123',
        unit: 'litre',
        quantity: 200,
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
        wtnType: 'WTN',
        groupOfGoods: 'FUEL',
        transaction: 'SALES',
        issueDateTime: '2020-04-13T22:42:00+02:00',
        operatorCode: 'ax083bc420',
        businUnitCode: 'bg517kw842',
        wtnOrdNum: 1,
        wtnNum: '1/2020',
        fuelPumNum: 'test',
        totPriceWoVAT: 4000,
        totVATAmt: 200,
        totPrice: 4200,
        vehOwnership: 'OWNER',
        vehPlates: 'AA200GG',
        startAddr: 'Rruga 3',
        startCity: 'Durres',
        startPoint: 'WAREHOUSE',
        startDateTime: '2020-04-13T22:42:00+02:00',
        destinAddr: 'Rruga 6',
        destinCity: 'Tirane',
        destinPoint: 'STORE',
        destinDateTime: '2020-04-14T00:42:00+02:00',
        isGoodsFlammable: true,
        isEscortRequired: false,
        packType: 'liquid tank',
        packNum: 1,
        itemsNum: 1,
        isAfterDel: false,
        issuer: {
          nuis: 'L41323036D',
          name: 'Oil SHPK',
          address: 'Rruga 16',
          town: 'Tirane',
        },
        items: [
          {
            name: 'Oil',
            code: '123123',
            unit: 'litre',
            quantity: 200,
          },
        ],
        wtnic: 'C8BB5B851F9A74DA917DA22166504A2A',
        wtnicSignature:
          '87B837307B858ADF7761F3D707009568748C7B8E10C4D338E316D46FAFAE199E5C306701D58EF9107768860FECDCA3FE119106B8C3C5727782870BC4DB180D0B64D61AAA3750E6A40EF071AAF3DBAF1419233FE2362D0C1E5B46AAAE7EA1A9A590F36A5A581FC098E5F6DA61F5321C559F4A3DA7028CE1D3D59DDD687404912A0CF85E9989C660D1E5A8FA0FEF5727BF6AF95B8D51423D13BB08AAFA3FCC83215DC1C99493E03C8EAEB6C2CDF042B855F243D3B64536A7C971CE9F50B67B4EEBC075AB12639B8609F246F84AE7200597CF35DD3CDD3C7EF7B5331AC5DEFE47DDC98C58973DFBB160BB5214AA1BA99D4B146F4C957F87D5943BFD90B246FAA781',
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
