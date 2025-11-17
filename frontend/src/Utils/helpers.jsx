import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

export const authenticate = (data, next) => {
    if (window !== 'undefined') {
        // console.log('authenticate', response)
        sessionStorage.setItem('token', JSON.stringify(data.token));
        sessionStorage.setItem('user', JSON.stringify(data.user));
        // Dispatch custom event to notify components of auth change
        window.dispatchEvent(new Event('authChange'));
    }
    next();
};

export const getUser = () => {
    if (window !== 'undefined') {
        if (sessionStorage.getItem('user')) {
            console.log(JSON.parse(sessionStorage.getItem('user')))
            return JSON.parse(sessionStorage.getItem('user'));
        } else {
            return false;
        }
    }
};

// remove token from session storage and sign out from Firebase
export const logout = async (next) => {
    try {
        // Sign out from Firebase
        await firebaseSignOut();
        
        if (window !== 'undefined') {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            // Dispatch custom event to notify components of auth change
            window.dispatchEvent(new Event('authChange'));
        }
        successMsg('Logged out successfully');
        next();
    } catch (error) {
        console.error('Logout error:', error);
        // Still remove local storage even if Firebase logout fails
        if (window !== 'undefined') {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.dispatchEvent(new Event('authChange'));
        }
        next();
    }
};

export const getToken = () => {
    if (window !== 'undefined') {
        if (sessionStorage.getItem('token')) {
            return JSON.parse(sessionStorage.getItem('token'));
        } else {
            return false;
        }
    }
};
export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-center'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-center'
});

// Firebase Authentication Functions
export const firebaseSignUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const firebaseSignIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const firebaseGoogleSignIn = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        throw error;
    }
};

export const firebaseSignOut = async () => {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        throw error;
    }
};