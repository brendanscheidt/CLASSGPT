import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";
export const getAllUsers = async (req, res, next) => {
    //get all users
    try {
        const users = await User.find();
        return res.status(200).json({ message: "OK", users });
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
export const userSignup = async (req, res, next) => {
    //user signup
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(401).send("User already registered");
        const hashedPass = await hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPass,
        });
        await user.save();
        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            expires,
            httpOnly: true,
            signed: true,
        });
        return res.status(201).json({
            message: "OK",
            name: user.name,
            email: user.email,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
export const userLogin = async (req, res, next) => {
    //user login
    console.log("test");
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser)
            return res.status(401).send("User not registered");
        const isPasswordCorrect = await compare(password, existingUser.password);
        if (!isPasswordCorrect)
            return res.status(403).send("Incorrect Password");
        const token = createToken(existingUser._id.toString(), existingUser.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            expires,
            httpOnly: true,
            signed: true,
        });
        return res.status(201).json({
            message: "OK",
            name: existingUser.name,
            email: existingUser.email,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
export const verifyUser = async (req, res, next) => {
    //user token check
    try {
        const existingUser = await User.findById(res.locals.jwtData.id);
        if (!existingUser) {
            return res.status(401).send("User not registered OR Token malfunctioned");
        }
        if (existingUser._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        return res.status(200).json({
            message: "OK",
            name: existingUser.name,
            email: existingUser.email,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
export const userLogout = async (req, res, next) => {
    //user token check
    try {
        const existingUser = await User.findById(res.locals.jwtData.id);
        if (!existingUser)
            return res.status(401).send("User not registered OR Token malfunctioned");
        if (existingUser._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        res.clearCookie(COOKIE_NAME, {
            path: "/",
            httpOnly: true,
            signed: true,
        });
        return res.status(201).json({
            message: "OK",
            name: existingUser.name,
            email: existingUser.email,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
//# sourceMappingURL=user-controllers.js.map