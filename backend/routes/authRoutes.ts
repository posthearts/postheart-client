import express from 'express';
import passport from 'passport';
import { googleAuth } from '../controllers/authController';

const router = express.Router();

// Initiate Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), googleAuth);


export default router;