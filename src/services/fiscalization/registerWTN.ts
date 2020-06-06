import methodNamesMap from './methodNameMap';
import { SOAPRequestObject } from '../../types';
import { makeRequest } from './makeSOAPRequest';
import {
  FiscRegisterWTNRequest,
  TransferNoteItem,
  FiscRegieterWTNResponse,
} from '../../types/wtn';
import { toDecimalOrUndefined } from './utils';

function transformWTNItems(items: TransferNoteItem[]) {
  return items.map((item) => ({
    attributes: {
      C: item.code,
      N: item.name,
      Q: item.quantity,
      U: item.unit,
      PB: toDecimalOrUndefined(item.priceBeforeVAT),
      VR: toDecimalOrUndefined(item.vatRate),
      PA: toDecimalOrUndefined(item.priceAfterVAT),
    },
  }));
}

function transformRegisterWTNRequest(
  request: FiscRegisterWTNRequest
): SOAPRequestObject {
  const soapRequest: SOAPRequestObject = {
    ':Header': {
      attributes: {
        SendDateTime: request.header.sendDateTime,
        UUID: request.header.UUID,
        IsSubseqDeliv: request.header.isSubseqDeliv,
      },
    },
    ':WTN': {
      attributes: {
        Type: request.body.wtnType,
        GroupOfGoods: request.body.groupOfGoods,
        Transaction: request.body.transaction,
        IssueDateTime: request.body.issueDateTime,
        OperatorCode: request.body.operatorCode,
        BusinUnitCode: request.body.businUnitCode,
        SoftCode: request.body.softCode,
        WTNOrdNum: request.body.wtnOrdNum,
        WTNNum: request.body.wtnNum,
        FuelPumpNum: request.body.fuelPumNum,
        TotPriceWoVAT: toDecimalOrUndefined(request.body.totPriceWoVAT),
        TotVATAmt: toDecimalOrUndefined(request.body.totVATAmt),
        TotPrice: toDecimalOrUndefined(request.body.totPrice),
        VehOwnership: request.body.vehOwnership,
        VehPlates: request.body.vehPlates,
        StartAddr: request.body.startAddr,
        StartCity: request.body.startCity,
        StartDateTime: request.body.startDateTime,
        StartPoint: request.body.startPoint,
        DestinAddr: request.body.destinAddr,
        DestinCity: request.body.destinCity,
        DestinDateTime: request.body.destinDateTime,
        DestinPoint: request.body.destinPoint,
        IsGoodsFlammable: request.body.isGoodsFlammable,
        IsEscortRequired: request.body.isEscortRequired,
        PackType: request.body.packType,
        PackNum: request.body.packNum,
        ItemsNum: request.body.itemsNum,
        WTNIC: request.body.wtnic,
        WTNICSignature: request.body.wtnicSignature,
        IsAfterDel: request.body.isAfterDel,
      },
      ':Issuer': {
        attributes: {
          NUIS: request.body.issuer.nuis,
          Name: request.body.issuer.name,
          Address: request.body.issuer.address,
          Town: request.body.issuer.town,
        },
      },
      ':Items': {
        ':I': transformWTNItems(request.body.items),
      },
    },
  };

  // Include optional fields if present
  if (request.body.buyer) {
    soapRequest[':WTN'][':Buyer'] = {
      attributes: {
        NUIS: request.body.buyer.nuis,
        Name: request.body.buyer.name,
        Address: request.body.buyer.address,
        Town: request.body.buyer.town,
      },
    };
  }

  if (request.body.carrier) {
    soapRequest[':WTN'][':Carrier'] = {
      attributes: {
        IDType: request.body.carrier.idType,
        IDNum: request.body.carrier.idNum,
        Name: request.body.carrier.name,
        Address: request.body.carrier.address,
        Town: request.body.carrier.town,
      },
    };
  }

  return JSON.parse(JSON.stringify(soapRequest)); // removes undefined values
}

interface RegisterWTNSOAPResponse {
  attributes: {
    Id: 'Response';
    Version: '2';
  };
  Header: {
    attributes: {
      UUID: string;
      RequestUUID: string;
      SendDateTime: string;
    };
  };
  FWTNIC: string;
  Signature: object;
}

export async function sendRegisterWTNRequest(
  request: FiscRegisterWTNRequest,
  key: string,
  cert: string
): Promise<FiscRegieterWTNResponse> {
  const { methodName, rootXmlElement } = methodNamesMap['registerWTNRequest']; // SOAP Action
  const soapReq = transformRegisterWTNRequest(request);
  const res = await makeRequest<RegisterWTNSOAPResponse>(
    methodName,
    soapReq,
    rootXmlElement,
    key,
    cert
  );

  return {
    header: {
      UUID: res.Header.attributes.UUID,
      requestUUID: res.Header.attributes.RequestUUID,
      sendDateTime: res.Header.attributes.SendDateTime,
    },
    body: {
      FWTNIC: res.FWTNIC,
    },
  };
}
