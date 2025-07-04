export type OktaConfig = {
    clientId: string,
    issuer: string,
    redirectUri: string,
    scopes: any,
    pkce: boolean,
}

export const oktaConfig: OktaConfig = {
    clientId: '0oaictmjnjUzW4Lnh1d7',
    issuer: 'https://sivajioieciam.oktapreview.com/oauth2/default',
    redirectUri: window.location.origin + '/login/callback',
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
}