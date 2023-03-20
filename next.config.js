module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://firebridge-backend.herokuapp.com/:path*' // Proxy to Backend
            }
        ]
    }
}