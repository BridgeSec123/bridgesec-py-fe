import { useRef, useImperativeHandle, forwardRef } from 'react';
import AuthContext from './AuthContext';
import appConfig from '@/configs/app.config';
import { useSessionUser, useToken } from '@/store/authStore';
import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService';
import { REDIRECT_URL_KEY } from '@/constants/app.constant';
import { useNavigate } from 'react-router-dom';
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth';
import type { ReactNode } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import axiosInstance from '@/dashboard/axiosConfig';


type AuthProviderProps = { children: ReactNode };

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction;
};

const IsolatedNavigator = forwardRef<IsolatedNavigatorRef>((_, ref) => {
    const navigate = useNavigate();

    useImperativeHandle(ref, () => {
        return {
            navigate,
        };
    }, [navigate]);

    return <></>;
});

let handleSignIn: (tokens: Token, user?: User) => void;
let redirect: () => void;

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn);
    let user = useSessionUser((state) => state.user);
    const setUser = useSessionUser((state) => state.setUser);
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    );
    const { token, setToken } = useToken();

    const authenticated = Boolean(token && signedIn);

    const navigatorRef = useRef<IsolatedNavigatorRef>(null);

    const apiBaseUrl = import.meta.env.VITE_FIREBASE_API_BASE_URL;

    redirect = () => {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const redirectUrl = params.get(REDIRECT_URL_KEY);

        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        );
    };

    handleSignIn = (tokens: Token, user?: User) => {
        console.log("User :: " +user.email)
        setToken(tokens.accessToken);
        setSessionSignedIn(true);
        localStorage.setItem("okta-token-storage", JSON.stringify(tokens));
        if (user) {    
            setUser(user);
            // useSessionUser((state) => state.setUser({
            // userId: user.userId || null,
            // userName: user.userName || 'User',
            // email: user.email || null,
            // authority: ['USER'],
            // avatar: '',
            // }));
            
        }
    };

    const handleSignOut = () => { 
        console.log("handleSignOut called");  
        localStorage.setItem("okta-token-storage", '{}');            
        setToken('');
        setUser({});
        setSessionSignedIn(false);
        
    };

    
    const signIn = async ({ email, password }: SignInCredential): AuthResult => {
        try {
            const resp = await axiosInstance.post(`${apiBaseUrl}/api/token/`, {
                email: email,
                password:password,
            });
            if (resp) {
                user.email=email                 
                console.log("resp :: "+resp.data.token)

                handleSignIn({ accessToken: resp.data.token}, user);
                //localStorage.setItem("sessionUser", JSON.stringify(user));

                redirect();
                return {
                    status: 'success',
                    message: '',
                };
            }
            return {
                status: 'failed',
                message: 'Unable to sign in',
            };
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            };
        }
    };

    const signUp = async (values: SignUpCredential): AuthResult => {
        try {
            const resp = await apiSignUp(values);
            if (resp) {
                handleSignIn({ accessToken: resp.token }, resp.user);
                redirect();
                return {
                    status: 'success',
                    message: '',
                };
            }
            return {
                status: 'failed',
                message: 'Unable to sign up',
            };
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            };
        }
    };

    const signOut = async () => {
        try {
            await apiSignOut();   
                     
        } finally {
            handleSignOut();
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath);
        }
    };

    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        });
    };

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    );
}

IsolatedNavigator.displayName = 'IsolatedNavigator';

// Exporting the utility object
export const authProvider = {
    handleSignIn: (tokens: Token, user?: User) => handleSignIn(tokens, user),
    redirect: () => redirect(),
};

export default AuthProvider;
