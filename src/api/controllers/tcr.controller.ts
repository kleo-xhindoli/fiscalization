import { Request, Response } from 'express';
import { NextFn } from '../../types';
import { registerTCR, cashBalance } from '../../services/TCR.service';
import { toCentralEuropeanTimezone } from '../../utils/date-utils';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { badRequest } from '@hapi/boom';

export async function handleRegisterTCR(
  req: Request,
  res: Response,
  next: NextFn
) {
  try {
    let { businUnitCode, issuerNUIS, tcrIntID, validFrom, validTo } = req.body;
    const { privateKey, certificate } = req;

    let validFromLocalized: string | null = null;
    let validToLocalized: string | null = null;
    const now = new Date();

    if (validFrom) {
      validFromLocalized = toCentralEuropeanTimezone(validFrom);

      // Validate validFrom not in the past
      const difference = differenceInCalendarDays(parseISO(validFrom), now);
      if (difference < 0)
        return next(badRequest('validFrom cannot be in the past'));
    }

    if (validTo) {
      validToLocalized = toCentralEuropeanTimezone(validTo);
      if (validFrom) {
        // Validate validTo not before validFrom
        const difference = differenceInCalendarDays(
          parseISO(validTo),
          parseISO(validFrom)
        );
        if (difference < 0) {
          return next(badRequest('validTo cannot be before validFrom'));
        }
      }
    }

    const response = await registerTCR(
      {
        businUnitCode,
        issuerNUIS,
        tcrIntID,
        validFrom: validFromLocalized?.split('T')[0],
        validTo: validToLocalized?.split('T')[0],
      },
      privateKey,
      certificate
    );

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
      changeDateTime,
      issuerNUIS,
      cashAmt,
      operation,
      tcrCode,
      isSubseqDeliv,
    } = req.validatedBody;

    const formattedDateTime = toCentralEuropeanTimezone(changeDateTime);
    const { privateKey, certificate } = req;

    const response = await cashBalance(
      {
        changeDateTime: formattedDateTime,
        issuerNUIS,
        cashAmt,
        operation,
        tcrCode,
        isSubseqDeliv,
      },
      privateKey,
      certificate
    );

    res.json(response);
  } catch (e) {
    next(e);
  }
}
