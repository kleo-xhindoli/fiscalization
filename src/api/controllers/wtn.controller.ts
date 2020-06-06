import { Request, Response } from 'express';
import { NextFn } from '../../types';
import { registerWarehouseTransferNote } from '../../services/WTN.service';
import { RegisterWarehouseTransferNoteRequest } from '../../types/wtn';
import { toCentralEuropeanTimezone } from '../../utils/date-utils';

export async function handleRegisterWTN(
  req: Request,
  res: Response,
  next: NextFn
) {
  try {
    const { certificate, privateKey } = req;
    const wtnReq = req.validatedBody as RegisterWarehouseTransferNoteRequest;

    wtnReq.issueDateTime = toCentralEuropeanTimezone(wtnReq.issueDateTime);
    wtnReq.startDateTime = toCentralEuropeanTimezone(wtnReq.startDateTime);
    wtnReq.destinDateTime = toCentralEuropeanTimezone(wtnReq.destinDateTime);

    const response = await registerWarehouseTransferNote(
      wtnReq,
      privateKey,
      certificate
    );

    res.json(response);
  } catch (e) {
    next(e);
  }
}
