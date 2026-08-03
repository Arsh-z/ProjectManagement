import { Router } from "express";
import { getProjects,
    deleteMember,
    updateMemberRole,
    getProjectMembers,
    addMemberToProject,
    deleteProject,
    updateProject,
    createProject,
    getProjecBytId } from "../controllers/proje.js";

import { validate } from "../middlewares/validator.middleware.js";

import { createProjectValidator,addMemberProjectValidator } from "../validators/index.js";

import { verifyJWT , validateProjectPermission} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT)

router
    .route("/")
    .get(getProjects)
    .post(createProjectValidator(), validate, createProject);
    

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRoles), getProjecBytId)
    .put(validateProjectPermission([UserRolesEnum, ADMIN]), createProjectValidator(), validate, updateProject)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteProject);
    


router
    .route("/projectId/members")
    .put(getProjecBytId)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMemberProjectValidator(),
        validate,
        addMemberToProject
    )
    
router
    .route("/projectId/members/:userId")
    .put(validateProjectPermission([UserRolesEnum.ADMIN]),
        updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]),
    deleteMember);


export default  router;


        