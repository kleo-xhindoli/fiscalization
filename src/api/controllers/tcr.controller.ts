import { Request, Response } from 'express';
import { NextFn } from '../../types';
import { registerTCR, cashBalance } from '../../services/TCR.service';
import { toCentralEuropeanTimezone } from '../../utils/date-utils';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { badRequest } from 'boom';

export async function handleRegisterTCR(
  req: Request,
  res: Response,
  next: NextFn
) {
  try {
    let { businUnitCode, issuerNUIS, tcrIntID, validFrom, validTo } = req.body;

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
      if (!validFrom) {
        // Default validFrom to now if it is not specified
        validFrom = validFromLocalized = toCentralEuropeanTimezone(validFrom);
      }

      validToLocalized = toCentralEuropeanTimezone(validTo);

      // Validate validTo not in the past
      let difference = differenceInCalendarDays(parseISO(validTo), now);
      if (difference < 0)
        return next(badRequest('validTo cannot be in the past'));

      // Validate validTo not before validFrom
      difference = differenceInCalendarDays(
        parseISO(validTo),
        parseISO(validFrom)
      );
      if (difference < 0)
        return next(badRequest('validTo cannot be before validFrom'));
    }

    const response = await registerTCR({
      businUnitCode,
      issuerNUIS,
      tcrIntID,
      validFrom: validFromLocalized,
      validTo: validToLocalized,
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
      changeDateTime,
      issuerNUIS,
      cashAmt,
      operation,
      tcrCode,
      isSubseqDeliv,
    } = req.validatedBody;

    const formattedDateTime = toCentralEuropeanTimezone(changeDateTime);

    const response = await cashBalance({
      changeDateTime: formattedDateTime,
      issuerNUIS,
      cashAmt,
      operation,
      tcrCode,
      isSubseqDeliv,
    });

    res.json(response);
  } catch (e) {
    next(e);
  }
}
