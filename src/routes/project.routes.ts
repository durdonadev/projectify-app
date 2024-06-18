import { Router } from 'express';
import { authMiddleware } from '../middlewares';
import { projectController } from '../controllers';

const projectRouter = Router();
projectRouter.post(
    '/:id/contributors/add',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.addContributor,
);

projectRouter.patch(
    '/:id/contributors/:teamMemberId/change-status',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.changeContributorStatus,
);

projectRouter.get(
    '/:id/contributors',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.getContributors,
);

projectRouter.post(
    '/',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.create,
);

projectRouter.get(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.getOne,
);

projectRouter.patch(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.update,
);
projectRouter.get(
    '/',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.getAll,
);

projectRouter.patch(
    '/:id/change-status',
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.changeStatus,
);

export { projectRouter };
