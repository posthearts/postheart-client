import express, { Request, Response } from 'express';
import passport from 'passport';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import letterRoutes from './routes/letterRoutes';
import dotenv from 'dotenv';

dotenv.config();
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Server is running!');
});
app.use('/api', authRoutes);
app.use('/api', letterRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});