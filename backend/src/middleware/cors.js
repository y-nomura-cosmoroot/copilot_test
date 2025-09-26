const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    // 開発環境では全てのオリジンを許可
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // 本番環境では特定のオリジンのみ許可
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://your-frontend-domain.com'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);