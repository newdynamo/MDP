const { createProxyMiddleware } = require('http-proxy-middleware');

const proxy = createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    logLevel: 'debug'
});

module.exports = {
    port: 3000,
    server: {
        baseDir: "frontend",
        middleware: [
            (req, res, next) => {
                if (req.url.startsWith('/api')) {
                    console.log(`[PROXY] Forwarding ${req.url} to backend...`);
                    return proxy(req, res, next);
                }
                next();
            }
        ]
    }
};
