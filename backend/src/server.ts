import app from './app';
import dotenv from 'dotenv';
import { createServer } from 'http';
import notificationService from './services/notificationService';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = createServer(app);

// Initialize WebSocket notification service
notificationService.initialize(server);

server.listen(PORT, (): void => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check at http://localhost:${PORT}/api/health`);
  console.log(`🔔 WebSocket notifications enabled`);
}); 