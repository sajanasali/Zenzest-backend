import MyJWTPayLoad from "../interfaces/jwt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { NextFunction } from "express";
import { HttpStatus } from "../enums/httpStatus";
import userModel from "../model/userModel";
const secret=process.env.secretkey||"itssecret";
dotenv.config();
function decodeToken(token: any): MyJWTPayLoad {
    return jwt.verify(token, "itssecret") as MyJWTPayLoad;
  }

export async function userAthentication(req:Request,res:Response,next:NextFunction){
   
	const testToken = req.headers.get('Authorization')
	let token;

	if (testToken && testToken.startsWith("bearer")) {
		token = testToken.split(" ")[1];
	}

	if (!token) {
		return {
                    status: HttpStatus.UthorizationError,
                    data: {
                      success: false,
                      message: "please login",
                    },
                  };
	}
    const decodedToken = decodeToken(token)
    console.log(decodedToken)
    const Userid=decodedToken.id

    if (decodedToken.role === "User") {
		const user = await userModel.findById(decodedToken.id);
		if (!user) {
			return {
                status: HttpStatus.UthorizationError,
                data: {
                  success: false,
                  message: "The user with given token doesnt exist",
                },
              };
		}
		(req as any).user = user;
	

    
}

}
export  async function useridGetting(req:Request,res:Response,next:NextFunction){
  const testToken = req.headers.get('Authorization')
	let token;

	if (testToken && testToken.startsWith("bearer")) {
		token = testToken.split(" ")[1];
	}

	if (!token) {
		return {
                    status: HttpStatus.UthorizationError,
                    data: {
                      success: false,
                      message: "please login",
                    },
                  };
	}
  const decodedToken = decodeToken(token)
  console.log(decodedToken)
  const Userid=decodedToken.id
}