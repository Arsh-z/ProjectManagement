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



export { userRegisterValidator };