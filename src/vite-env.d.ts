/// <reference types="vite/client" />

interface BeehivePayEncryptParams {
  number: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  cvv: string;
}

interface BeehivePayGlobal {
  setPublicKey(key: string): void;
  setTestMode(test: boolean): void;
  encrypt(params: BeehivePayEncryptParams): Promise<string>;
}

declare const BeehivePay: BeehivePayGlobal;
