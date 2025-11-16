Session Cookie Security (Backend/src/server.js)

findings are in Backend/src/server.js line 14, related to insecure session configuration:

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false })); 

OWASP Top 10 violation (A01:2021 - Broken Access Control)
GDPR/privacy

Default cookie name - Makes fingerprinting easier for attackers
No domain set - Cookie could leak across subdomains
No expiration - Persistent cookies without expiry
No httpOnly flag - Vulnerable to XSS attacks (JavaScript can access cookie)
No path restriction - Cookie sent to all paths
No secure flag - Cookie can be sent over HTTP (not HTTPS only)

Recommended Fix

app.use(session({ name: 'utopiahire.sid', secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24, domain: process.env.COOKIE_DOMAIN, path: '/' } })); 
