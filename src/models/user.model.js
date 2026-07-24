import mongoose from "mongoose";
import brcypt from "bcrpt";
import jwt from "jsonwebtoken";
import crypto from "crypto";




const userSchema = new Schema({
    {
        avatar: {
            type: {
                url: String,
                localPath: String
            },
            default: {
                url: `https://placehold.co/200x200`,
                localPath: ""
            },
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            reuired: [true, "Password is required"]
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type : String
        },
        ForgotPasswordtokken: {
            type:String
        },
        ForgotPasswordExpiry: {
            type: Date
        },
        emailVerificationToken: {
            type: String
            
        },
        emailVerificationExpiry: {
            type: Date
        },
    }, 
    {
        timestamps: true,
    },
    
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await brcypt.hash(this.password, 10);
    next():
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await brcypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = funstion() {

    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiryIn:process.env.ACCESS_TOKEN_EXPIRY
        }
        
    )
}


userSchema.methods.generaterRefreshToken = funstion() {

    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiryIn:process.env.REFRESH_TOKEN_EXPIRY
        }-
        
    )
}


export const User = mongoose.model("User", userSchema);

    