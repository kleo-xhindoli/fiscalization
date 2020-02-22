import { Request, Response } from 'express';
import { NextFn, RegisterInvoiceRequest } from '../../types';
import { registerInvoice } from '../../services/Invoice.service';

export async function handleRegisterInvoice(
  req: Request,
  res: Response,
  next: NextFn
) {
  try {
    const request: RegisterInvoiceRequest = req.validatedBody;
    const { privateKey, certificate } = req;

    const response = await registerInvoice(request, privateKey, certificate);

    res.json(response);
  } catch (e) {
    next(e);
  }
}

export async function handleModifyInvoice(
  req: Request,
  res: Response,
  next: NextFn
) {
  try {
    const request: RegisterInvoiceRequest = req.validatedBody;
    const iicRef: string = req.params.iic;
    const { privateKey, certificate } = req;

    const response = await registerInvoice(
      request,
      iicRef,
      privateKey,
      certificate
    );

    res.json(response);
  } catch (e) {
    next(e);
  }
}
