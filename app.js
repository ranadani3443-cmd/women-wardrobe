// Hostinger / cPanel / Cloud Node.js Entry Point
import('./dist/server.cjs').catch((err) => {
  console.error('Failed to start server:', err);
});
