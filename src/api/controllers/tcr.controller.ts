import { Request, Response } from 'express';
import { NextFn } from '../../types';
import { registerTCR, cashBalance } from '../../services/TCR.service';
import { toCentralEuropeanTimezone } from '../../utils/date-utils';

export async function handleRegisterTCR(
  req: Request,
  res: Response,
  next: NextFn
) {
  try {
    const { businUnit, issuerNUIS, regDateTime, tcrOrdNum } = req.body;

    const formattedDateTime = toCentralEuropeanTimezone(regDateTime);

    const response = await registerTCR({
      businUnit,
      issuerNUIS,
      regDateTime: formattedDateTime,
      tcrOrdNum,
    });

    res.json(response);
  } catch (e) {
    next(e);
  }
}

export async function handleCashBalance(
  req: Request,
  res: Response,
  next: NextFn
) {
  try {
    const {
      balChkDatTim,
      issuerNUIS,
      cashAmt,
      operation,
      tcrNumber,
    } = req.body;

    const formattedDateTime = toCentralEuropeanTimezone(balChkDatTim);

    const response = await cashBalance({
      balChkDatTim: formattedDateTime,
      issuerNUIS,
      cashAmt,
      operation,
      tcrNumber,
    });

    res.json(response);
  } catch (e) {
    next(e);
  }
}
