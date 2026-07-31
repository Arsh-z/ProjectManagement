import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .isLowercase()
            .withMessage("username must e in lowercase")
            .isLength({ min: 3 })
            .withMessage("usernaame must be at least 3 character long"),
        
        
        body("password")
            .trim()
            .notEmpty().withMessage("password is required"),
        
        body("fullName").optional().trim(),
    ];
};

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("EMail is invalid"),
        
        body("password").notEmpty().withMessage("password is required")
        
        
    ];
};

const userChangeCurrentPassword = () => {
    return [
        body("oldPassword").notEmpty().withMessage("old Password is required"),
        bodybody("newPassword").notEmpty().withMessage("new Password is required"),
    ];
};

const userForgotPasswordValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email id invalid"),

    ];
};

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword").notEmpty().withMessage("password is required")
    ];
};

export {
    userRegisterValidator,
    userLoginValidator, 
    userChangeCurrentPassword,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator
    
};