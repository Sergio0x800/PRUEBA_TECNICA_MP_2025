jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

import authMiddleware from '../auth.middleware';
import { Request, Response, NextFunction } from 'express';

describe('authMiddleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    (jwt.verify as jest.Mock).mockReset();
  });

  test('devuelve 401 cuando no hay token', () => {
    authMiddleware(req as Request, res as Response, next as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('devuelve 401 cuando formato inválido', () => {
    req.headers.authorization = 'InvalidToken';
    authMiddleware(req as Request, res as Response, next as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Formato de token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('llama next y adjunta user cuando token válido', () => {
    req.headers.authorization = 'Bearer validtoken';
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, usuario: 'test' });
    authMiddleware(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual({ id: 1, usuario: 'test' });
  });

  test('devuelve 401 cuando token inválido', () => {
    req.headers.authorization = 'Bearer badtoken';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });
    authMiddleware(req as Request, res as Response, next as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
