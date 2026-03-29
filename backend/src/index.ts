import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { redis } from './config/redis';

async function main() {
  await redis.connect();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 DLC CRM API running on http://localhost:${env.PORT}`);
    console.log(`📦 Environment: ${env.NODE_ENV}`);
  });

  async function shutdown(signal: string) {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      await redis.quit();
      console.log('✅ Server shut down');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
