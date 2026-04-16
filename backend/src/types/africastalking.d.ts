declare module 'africastalking' {
  interface ATOptions { apiKey: string; username: string; }
  interface SMSRecipient { status: string; number: string; cost: string; }
  interface SMSResult { SMSMessageData: { Recipients: SMSRecipient[] } }
  interface SMS { send(opts: { to: string[]; message: string; from?: string }): Promise<SMSResult>; }
  interface ATInstance { SMS: SMS; }
  function AfricasTalking(opts: ATOptions): ATInstance;
  export = AfricasTalking;
}
