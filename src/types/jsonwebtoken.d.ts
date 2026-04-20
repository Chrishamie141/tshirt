declare module "jsonwebtoken" {
  export function sign(payload: string | Buffer | object, secretOrPrivateKey: string, options?: { expiresIn?: string }): string;
  export function verify(token: string, secretOrPublicKey: string): object | string;
  const jwt: {
    sign: typeof sign;
    verify: typeof verify;
  };
  export default jwt;
}
