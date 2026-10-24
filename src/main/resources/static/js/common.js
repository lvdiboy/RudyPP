// 登录页（index.html）与登录后页面（home.html）共用的工具函数

// 页面部署在 context-path（/api）下，接口地址与页面同源
const API = location.pathname.replace(/\/[^/]*$/, '');
const TOKEN_KEY = 'jwt-demo-token';
const FIELD_LABELS = {userName: '用户名', fullName: '姓名', password: '密码'};

// 跳回登录页时通过 ?msg= 传递的提示
const LOGIN_MESSAGES = {
    logout: ['已退出登录', 'success'],
    expired: ['登录已过期，请重新登录', 'error'],
    invalid: ['Token 已失效（可能已在别处登录或已退出），请重新登录', 'error']
};

const $ = id => document.getElementById(id);

function storage(action, value) {
    try {
        if (action === 'get') return localStorage.getItem(TOKEN_KEY);
        if (action === 'set') localStorage.setItem(TOKEN_KEY, value);
        if (action === 'remove') localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
        // 浏览器禁用了本地存储时无法跨页面保持登录状态
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

// 将后端 ErrorResponse 转换成可读的提示
async function readError(res, fallback) {
    try {
        const body = await res.json();
        const details = Object.entries(body.data || {})
            .filter(([key]) => key !== 'detail' && key !== 'username:')
            .map(([key, msg]) => (FIELD_LABELS[key] || key) + '：' + msg);
        return [body.message || fallback, ...details].join('\n');
    } catch (e) {
        return fallback + '（HTTP ' + res.status + '）';
    }
}

// 解析 JWT 中的载荷（仅用于展示，校验由后端完成）
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

// 返回未过期 Token 的载荷，Token 不存在或已过期时返回 null
function validClaims(token) {
    const claims = token && decodeToken(token);
    return claims && claims.exp * 1000 > Date.now() ? claims : null;
}

// 清除本地登录状态并跳回登录页
function goToLogin(msg) {
    storage('remove');
    location.replace(API + '/index.html' + (msg ? '?msg=' + msg : ''));
}
