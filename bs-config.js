const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

const proxy = createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    logLevel: 'debug'
});

const validRoutes = ['/dashboard', '/fleet', '/trading-ets', '/trading-fueleu', '/trading-history', '/calculator', '/mypage', '/admin'];

module.exports = {
    port: 3000,
    server: {
        baseDir: "frontend",
        middleware: [
            (req, res, next) => {
                console.log(`[Middleware] Request: ${req.url}`);
                if (req.url.startsWith('/api')) {
                    console.log(`[PROXY] Forwarding ${req.url} to backend...`);
                    return proxy(req, res, next);
                }
                
                // SPA Fallback for defined routes
                const pathname = req.url.split('?')[0];
                if (validRoutes.includes(pathname) || validRoutes.some(r => pathname.startsWith(r + '/'))) {
                    console.log(`[SPA Fallback] Serving dashboard.html for ${req.url}`);
                    const content = fs.readFileSync(path.join(__dirname, 'frontend', 'dashboard.html'));
                    res.setHeader('Content-Type', 'text/html');
                    return res.end(content);
                }
                
                next();
            }
        ]
    }
};
