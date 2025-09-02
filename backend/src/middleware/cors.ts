import cors from 'cors';

const corsOptions = {
  origin: '*', // Adjust as needed for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default cors(corsOptions); 