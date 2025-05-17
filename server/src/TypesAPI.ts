export type ResponseEncrypt = {
  dataEncrypted?: string;
  error?: { message: string; timestamp: string };
};

export type ResponseDecrypt = {
  dataDecrypted?: string;
  error?: { message: string; timestamp: string };
};

export type RequestEncrypt = {
  dataToEncrypt: string;
};

export type RequestDecrypt = {
  dataToDecrypt: string;
};
  