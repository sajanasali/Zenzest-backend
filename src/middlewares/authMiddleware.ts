import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../model/userModel";
import Doctor from "../model/doctor.Model";

import MyJWTPayLoad from "../interfaces/jwt";
import dotenv from "dotenv";
const secret = process.env.secretkey || "itssecret";
dotenv.config();

function decodeToken(token: string, secret: string): MyJWTPayLoad {
  return jwt.verify(token, secret) as MyJWTPayLoad;
}
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("inside the auth");
  //1.Read the token & check if token exist in header
  const testToken = req.headers.authorization;
  console.log(testToken, "testtoken in auth middleware");
  let token;

  if (testToken) {
    //token = testToken.split(" ")[1];
    const parts = testToken.trim().split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
      console.log(token, "token");
    }
  }

  if (!token) {
    throw Error("Please Login!");
  }

  //2.validate the token
  const decodedToken = jwt.verify(token, secret) as MyJWTPayLoad;

  console.log(decodedToken, "decodedtoken");

  const user = await User.findById(decodedToken.id);

  (req as any).user = decodedToken;

  next();
};

export const protectDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("inside the auth");
  //1.Read the token & check if token exist in header
  const testToken = req.headers.authorization;
  console.log(testToken, "testtoken in auth middleware");
  let token;

  if (testToken) {
    //token = testToken.split(" ")[1];
    const parts = testToken.trim().split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
      console.log(token, "token");
    }
  }

  if (!token) {
    throw Error("Please Login!");
  }

  //2.validate the token
  const decodedToken = jwt.verify(token, secret) as MyJWTPayLoad;

  console.log(decodedToken, "decodedtoken");

  const user = await Doctor.findById(decodedToken.id);

  (req as any).user = decodedToken;

  next();
};
