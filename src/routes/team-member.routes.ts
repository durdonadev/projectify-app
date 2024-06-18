import { Router } from 'express';
import { authMiddleware } from '../middlewares';
import { teamMemberController } from '../controllers';

const teamMemberRouter = Router();

teamMemberRouter.post(
    '/',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.create,
);

teamMemberRouter.get(
    '/me',
    authMiddleware.authenticate,
    authMiddleware.isTeamMember,
    teamMemberController.getMe,
);

teamMemberRouter.patch('/create-password', teamMemberController.createPassword);

teamMemberRouter.get(
    '/',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.getAll,
);

teamMemberRouter.patch(
    '/:id/deactivate',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.deactivate,
);

teamMemberRouter.patch(
    '/:id/reactivate',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.reactivate,
);

teamMemberRouter.delete(
    '/:id/delete',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.delete,
);

teamMemberRouter.patch(
    '/:id/update',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.update,
);

teamMemberRouter.post('/login', teamMemberController.login);
export { teamMemberRouter };
