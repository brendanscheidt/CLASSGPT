import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { hash, compare } from "bcrypt";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //get all users
  try {
    const users = await User.find();

    return res.status(200).json({ message: "OK", users });
  } catch (err) {
    console.log(err);

    return res.status(404).json({ message: "ERROR", cause: err.message });
  }
};

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //user signup
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(401).send("User already registered");

    const hashedPass = await hash(password, 10);
    const user = new User({ name, email, password: hashedPass });

    await user.save();

    return res.status(201).json({ message: "OK", id: user._id.toString() });
  } catch (err) {
    console.log(err);

    return res.status(404).json({ message: "ERROR", cause: err.message });
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //user login
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) return res.status(401).send("User not registered");

    const isPasswordCorrect = await compare(password, existingUser.password);

    if (!isPasswordCorrect) return res.status(403).send("Incorrect Password");

    return res
      .status(201)
      .json({ message: "OK", id: existingUser._id.toString() });
  } catch (err) {
    console.log(err);

    return res.status(404).json({ message: "ERROR", cause: err.message });
  }
};
