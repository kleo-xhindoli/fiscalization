import { Request, Response } from 'express';
import {
  NextFn,
  RegisterInvoiceRequest,
  RegisterRawInvoiceRequest,
} from '../../types';
import {
  registerInvoice,
  registerRawInvoice,
} from '../../services/Invoice.service';
import { toCentralEuropeanTimezone } from '../../utils/date-utils';

export async function handleRegisterInvoice(
  req: Request,
  res: Response,
  next: NextFn
) {
  try {
    const request: RegisterInvoiceRequest = req.validatedBody;
    request.issueDateTime = toCentralEuropeanTimezone(request.issueDateTime);

    if (request.supplyDateOrPeriod) {
      // Strip time info from start/end dates
      const { start, end } = request.supplyDateOrPeriod;
      request.supplyDateOrPeriod = {
        start: toCentralEuropeanTimezone(start).split('T')[0],
        end: toCentralEuropeanTimezone(end).split('T')[0],
      };
    }

    if (request.payDeadline) {
      request.payDeadline = toCentralEuropeanTimezone(
        request.payDeadline
      ).split('T')[0];
    }

    const { privateKey, certificate } = req;

    const response = await registerInvoice(request, privateKey, certificate);

    res.json(response);
  } catch (e) {
    next(e);
  }
}

export async function handleRawInvoice(
  req: Request,
  res: Response,
  next: NextFn
) {
  const request: RegisterRawInvoiceRequest = req.validatedBody;

  const { privateKey, certificate } = req;

  try {
    const response = await registerRawInvoice(request, privateKey, certificate);
    res.json(response);
  } catch (e) {
    next(e);
  }
}

// NOTE: Invoice correction will be done through the normal route for now

// export async function handleModifyInvoice(
//   req: Request,
//   res: Response,
//   next: NextFn
// ) {
//   try {
//     const request: RegisterInvoiceRequest = req.validatedBody;
//     const iicRef: string = req.params.iic;
//     request.issueDateTime = toCentralEuropeanTimezone(
//       request.issueDateTime
//     );
//     const { privateKey, certificate } = req;

//     const response = await registerInvoice(
//       request,
//       privateKey,
//       certificate,
//       iicRef,
//     );

//     res.json(response);
//   } catch (e) {
//     next(e);
//   }
// }
