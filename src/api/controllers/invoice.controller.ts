import { Request, Response } from 'express';
import { NextFn, RegisterInvoiceRequest } from '../../types';
import { registerInvoice } from '../../services/Invoice.service';

export async function handleRegisterInvoice(
  req: any,
  res: Response,
  next: NextFn
) {
  try {
    const request: RegisterInvoiceRequest = req.validatedBody;

    const response = await registerInvoice(request);

    res.json(response);
  } catch (e) {
    next(e);
  }
}

export async function handleModifyInvoice(
  req: any,
  res: Response,
  next: NextFn
) {
  try {
    const request: RegisterInvoiceRequest = req.validatedBody;
    const iicRef: string = req.params.iic;

    const response = await registerInvoice(request, iicRef);

    res.json(response);
  } catch (e) {
    next(e);
  }
}
