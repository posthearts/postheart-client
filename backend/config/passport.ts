import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User from '../models/User';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: "https://posthearts.vercel.app/api/auth/google/callback"
},
async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
  try {
    console.log('Google profile:', profile);
    const existingUser = await User.findOne({ google_id: profile.id });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return done(null, existingUser);
    }

    const newUser = new User({
      google_id: profile.id,
      name: profile.displayName,
      profile_picture: profile.photos ? profile.photos[0].value : '',
      email: profile.emails ? profile.emails[0].value : ''
    });

    await newUser.save();
    console.log('New user created:', newUser);
    done(null, newUser);
  } catch (err) {
    console.error('Error in Google OAuth callback:', err);
    done(err, undefined);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, undefined);
  }
});

export default passport;