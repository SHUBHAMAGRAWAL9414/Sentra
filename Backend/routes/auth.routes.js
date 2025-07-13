import express from 'express';
import { signUp } from '../controllers/auth.controllers.js';
import { Login } from '../controllers/auth.controllers.js';
import { logOut } from '../controllers/auth.controllers.js';

const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.post('/signin',Login);
authRouter.get('/logout',logOut);


export default authRouter;