declare namespace Express {
  export interface Request {
    authClient: string;
    privateKey: string;
    certificate: string;
    validatedBody?: any;
  }
}
