// Helpers shared by the login page (index.html) and the home page (home.html)

// The pages are served under the context path (/api), on the same origin as the API
const API = location.pathname.replace(/\/[^/]*$/, '');
const TOKEN_KEY = 'jwt-demo-token';
const FIELD_LABELS = {userName: 'User name', fullName: 'Full name', password: 'Password'};

// Messages passed with ?msg= when sending the user back to the login page
const LOGIN_MESSAGES = {
    logout: ['Logged out', 'success'],
    expired: ['Your session has expired, please log in again', 'error'],
    invalid: ['Your token is no longer valid (you may have logged in elsewhere or logged out), please log in again', 'error']
};

const $ = id => document.getElementById(id);

function storage(action, value) {
    try {
        if (action === 'get') return localStorage.getItem(TOKEN_KEY);
        if (action === 'set') localStorage.setItem(TOKEN_KEY, value);
        if (action === 'remove') localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
        // If the browser blocks local storage, the login can't be kept across pages
    }
    return null;
}

function showMessage(el, text, type) {
    el.textContent = text;
    el.className = 'message ' + type;
}

function clearMessage(el) {
    el.textContent = '';
    el.className = 'message';
}

// Turns the server's ErrorResponse into a readable message
async function readError(res, fallback) {
    try {
        const body = await res.json();
        const details = Object.entries(body.data || {})
            .filter(([key]) => key !== 'detail' && key !== 'username:')
            .map(([key, msg]) => (FIELD_LABELS[key] || key) + ': ' + msg);
        return [body.message || fallback, ...details].join('\n');
    } catch (e) {
        return fallback + ' (HTTP ' + res.status + ')';
    }
}

// Decodes the JWT payload (for display only; the server does the verification)
function decodeToken(token) {
    try {
        const payload = token.replace(/^Bearer /, '').split('.')[1];
        let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        b64 += '='.repeat((4 - b64.length % 4) % 4);
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) {
        return null;
    }
}

// Returns the payload of a valid token, or null if there is no token or it has expired
function validClaims(token) {
    const claims = token && decodeToken(token);
    return claims && claims.exp * 1000 > Date.now() ? claims : null;
}

// Clears the local login state and goes back to the login page
function goToLogin(msg) {
    storage('remove');
    location.replace(API + '/index.html' + (msg ? '?msg=' + msg : ''));
}
