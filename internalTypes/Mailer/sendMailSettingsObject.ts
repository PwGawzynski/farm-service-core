/**
 * Specifies attachments options send via email
 */
export interface AttachmentsOptions {
  filename: string;
  content?: any;
  path?: string;
  contentType?: string;
  cid?: string;
  encoding?: string;
  contentDisposition?: 'attachment' | 'inline' | undefined;
  href?: string;
}

/**
 * Specify parameters used to send any template email to any receiver
 */
export interface SendMailSettingsObject {
  to: string;
  template: string;
  subject: string;
  context?: object;
  attachments?: Array<AttachmentsOptions>;
}
