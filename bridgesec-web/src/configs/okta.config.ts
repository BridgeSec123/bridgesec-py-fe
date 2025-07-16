export type OktaConfig = {
    clientId: string,
    issuer: string,
    redirectUri: string,
    scopes: any,
    pkce: boolean,
}

export const oktaConfig: OktaConfig = {
    clientId: '0oanyzd6atWGPyrnM1d7',
    issuer: 'http://localhost:8000/okta/login/',
    redirectUri: 'http://localhost:8000/okta/callback/',
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
}