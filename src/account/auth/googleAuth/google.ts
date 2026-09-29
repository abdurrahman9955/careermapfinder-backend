import { Router } from 'express';
import passport from 'passport';
import { googleCallback } from './controller';

const googleRouter = Router();

googleRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

googleRouter.get( '/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallback );

export default googleRouter;
