import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

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
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).send({});
    }

    if (/.+@[A-Z]/g.test(req.body.email)) {
      res.sendStatus(422);
    }

    if (/[><'"/]/g.test(req.body.password)) {
      res.sendStatus(422);
    }

    res.status(200).send({ email: req.body.email });
  }
);

export default signupRouter;
