import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import * as tokenService from './token.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    const refreshToken = await tokenService.createRefreshToken(
      result.user.id,
      req.headers['user-agent'],
      req.ip
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
      accessToken: result.accessToken,
      user: { id: result.user.id, email: result.user.email, firstName: result.user.firstName, lastName: result.user.lastName },
      organization: { id: result.org.id, name: result.org.name, slug: result.org.slug },
    }, 201);
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(
      req.body.email,
      req.body.password,
      req.headers['user-agent'],
      req.ip
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
      accessToken: result.accessToken,
      user: { id: result.user.id, email: result.user.email, firstName: result.user.firstName, lastName: result.user.lastName },
      orgId: result.orgId,
    });
  } catch (err) { next(err); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedError('No refresh token');

    const { newRefreshToken, userId, orgId } = await tokenService.rotateRefreshToken(
      token,
      req.headers['user-agent'],
      req.ip
    );

    const user = await authService.getMe(userId);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const accessToken = tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      orgId,
    });

    sendSuccess(res, { accessToken });
  } catch (err) { next(err); }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await tokenService.revokeRefreshToken(token);
    res.clearCookie('refreshToken');
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, { message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (err) { next(err); }
}

export async function inviteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.inviteUser({
      ...req.body,
      orgId: req.orgId!,
      invitedById: req.user!.id,
    });
    sendSuccess(res, { userId: result.user.id, message: 'Invitation sent' }, 201);
  } catch (err) { next(err); }
}
