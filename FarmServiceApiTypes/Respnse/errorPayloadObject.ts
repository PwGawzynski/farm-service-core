export interface ErrorPayloadObject {
  message?: string;
  eCode: ErrorCodes;
}

export enum ErrorCodes {
  AlreadyExist,

  UnknownServerError,

  EntityNotExist,

  CauserUnauthorised,

  BadData,
}
