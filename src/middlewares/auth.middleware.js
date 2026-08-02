import { User } from "..//models/user.model.js";
import { ProjectMember } from "..//models/projectmember.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, resizeBy, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
        );

        if (!user) {
            throw new ApiError(401, "unauthorized request");
        }
        

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "unauthorized request");
        
    }
});

export const validateProjectPermission = (roles = []) => {
    asyncHandler(async (req, res, next) => {
        const { projectId } = req.params;
        if (!projectId) {
            throw new ApiError(404, "projectId is not found");

        }

        const project = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id)
        })
        if (!project) {
            throw new ApiError(404, "project  not found");

        }

        const givenRole = project?.role
        req.user.role = givenRole



        if (!roles.includes(givenRole)) {
            throw new ApiError(
                403,
                "you do not have permission to perform this action",

            );
        }

        next();
    });
}