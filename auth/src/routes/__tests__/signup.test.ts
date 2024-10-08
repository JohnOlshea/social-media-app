import request from 'supertest';
import app from '../../app';
import { SIGNUP_ROUTE } from '../signup';
import { User } from '../../models';

/**
 * Valid email conditions:
 *  - Standard email formats from 'express-validator' package
 */
describe('test validity of email input', () => {
  let password = '';

  beforeAll(() => {
    password = 'Validpassword1';
  });

  it('should return 422 if the email is not provided', async () => {
    await request(app).post(SIGNUP_ROUTE).send({ password }).expect(422);
  });

  it('should return 422 if the email is not valid', async () => {
    await request(app)
      .post(SIGNUP_ROUTE)
      .send({ email: 'invalidEmail', password })
      .expect(422);
  });

  it('should return 201 if the email is valid', async () => {
    await request(app)
      .post(SIGNUP_ROUTE)
      .send({ email: 'test@test.com', password })
      .expect(201);
  });
});

/**
 * Valid password conditions:
 *  - At least 8 characters
 *  - At most 32 characters
 *  - One lower-case letter
 *  - One upper-case letter
 *  - One number
 */
describe('test validity of password input', () => {
  let email = '';

  beforeAll(() => {
    email = 'test@test.com';
  });

  it('should return 422 if the password is not provided', async () => {
    await request(app).post(SIGNUP_ROUTE).send({ email }).expect(422);
  });

  it('should return 422 if the password contains less than 8 characters', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'Valid12' })
      .expect(422);
  });

  it('should return 422 if the password contains more than 32 characters', async () => {
    await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email,
        password:
          'Valid12Valid12Valid12Valid12Valid12Valid12Valid12Valid12Valid12Valid12',
      })
      .expect(422);
  });

  it('should return 422 if the password does not contain one lower case letter', async () => {
    await request(app)
      .post(SIGNUP_ROUTE)
      .send({ email, password: 'VALID12VALID12' })
      .expect(422);
  });

  it('should return 422 if the password does not contain one upper-case letter', async () => {
    await request(app)
      .post(SIGNUP_ROUTE)
      .send({ email, password: 'valid12valid12' })
      .expect(422);
  });

  it('should return 422 if the password does not contain a number', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'Validvalid' })
      .expect(422);
  });

  it('should return 201 if the password is valid', async () => {
    await request(app)
      .post(SIGNUP_ROUTE)
      .send({ email, password: 'Valid12valid12' })
      .expect(201);
  });
});

describe('tests sanitization of email input', () => {
  it('should not contain uppercase letters in the domain of the email', async () => {
    const normalizedEmail = 'test@test.com';

    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email: 'test@TEST.COM',
        password: 'Valid123',
      })
      .expect(201);

    expect(response.body.email).toEqual(normalizedEmail);
  });
});

describe('tests sanitization of password input', () => {
  it('should not contain unescaped characters', async () => {
    await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email: 'test@test.com',
        password: 'Valid1<>"',
      })
      .expect(201);
  });
});

describe('tests saving the signed up user to the database', () => {
  const validUserInfo = {
    email: 'test@test.com',
    password: 'Valid123',
  };

  it('saves the user successfully as long as the information is valid', async () => {
    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send(validUserInfo)
      .expect(201);
    const user = await User.findOne({ email: response.body.email });
    const userEmail = user ? user.email : '';

    expect(user).toBeDefined();
    expect(userEmail).toEqual(validUserInfo.email);
  });

  it('does not allow saving a user with a duplicate email', async () => {
    await request(app).post(SIGNUP_ROUTE).send(validUserInfo).expect(201);
    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send(validUserInfo)
      .expect(422);

    expect(response.body.errors[0].message).toEqual(
      'The email is already in the database'
    );
  });

  it('should not include the user password on the response', async () => {
    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send(validUserInfo)
      .expect(201);

    expect(response.body.password).toBeUndefined();
  });

  it('should encrypt the user password when saving the user to the database', async () => {
    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send(validUserInfo)
      .expect(201);

    const newUser = await User.findOne({ email: response.body.email });
    const newUserPassword = newUser ? newUser.password : '';

    expect(newUserPassword.length).toBeGreaterThan(0);
    expect(newUserPassword).not.toEqual(validUserInfo.password);
  });
});
