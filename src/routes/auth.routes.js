import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, login, logoutUser, refreshAccessToken, registerUser, resendEmailVerification, resetForgotPassword, verifyEmail } from "../controllers/auth.controller.js";

import { validate } from "../middlewares/validator.middleware.js";

import { userChangeCurrentPassword, userForgotPasswordValidator, userLoginValidator, userRegisterValidator, userResetForgotPasswordValidator } from "../validators/index.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


//unsecure route
router.route('/register').post(userRegisterValidator(), validate ,registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshAccessToken);

router
    .route("/forgot-password")
    .post(userForgotPasswordValidator(), validate, userForgotPasswordValidator);

router.route("/reset-password/:resetToken")
    .post(userResetForgotPasswordValidator,validate,resetForgotPassword);


//secure route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPassword, validate, changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification);

export default router;