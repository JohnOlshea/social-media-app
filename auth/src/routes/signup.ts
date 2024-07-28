import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/user';

export const SIGNUP_ROUTE = '/api/auth/signup';
const signupRouter = express.Router();

signupRouter.post(
  SIGNUP_ROUTE,
  [
    body('email')
      .isEmail()
      .withMessage('Email must be in a valid format')
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 8, max: 32 })
      .withMessage('Password must be between 8 and 32 characters'),
    body('password')
      .matches(/^(.*[a-z].*)$/)
      .withMessage('Password must contain at least one lowercase letter'),
    body('password')
      .matches(/^(.*[A-Z].*)$/)
      .withMessage('Password must contain at least one uppercase letter'),
    body('password')
      .matches(/^(.*\d.*)$/)
      .withMessage('Password must contain at least one number'),
    body('password').escape(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.sendStatus(422);
    }

    if (/.+@[A-Z]/g.test(req.body.email)) {
      return res.sendStatus(422);
    }

    if (/[><'"/]/g.test(req.body.password)) {
      return res.sendStatus(422);
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.sendStatus(422);
    }

    const newUser = await User.create({ email, password });
    return res.status(201).send({ email: newUser.email });
  }
);

export default signupRouter;
