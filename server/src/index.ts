import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai.routes';
import suggestionRoutes from './routes/suggestion.routes';
import mpRoutes from './routes/mp.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and parsing of JSON/URL-encoded bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register routes
app.use('/api/ai', aiRoutes);
app.use('/api', suggestionRoutes);
app.use('/api/mp', mpRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    env: {
      supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      geminiConfigured: !!process.env.GEMINI_API_KEY
    }
  });
});

app.listen(PORT, () => {
  console.log(`Jansunwai AI Backend is running on port ${PORT}`);
});
