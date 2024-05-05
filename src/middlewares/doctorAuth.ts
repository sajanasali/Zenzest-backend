import MyJWTPayLoad from "../interfaces/jwt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { NextFunction } from "express";
import { HttpStatus } from "../enums/httpStatus";
import { IncomingHttpHeaders } from "http";

const secret=process.env.secretkey||"itssecret";
dotenv.config();

declare module 'express' {
    interface Request {
        user?: any; // Or a more specific type if known
    }
}
function decodeToken(token: any): MyJWTPayLoad {
    return jwt.verify(token, "itssecret") as MyJWTPayLoad;
  }



    
    // const testToken = req.headers.get('Authorization')
    //   let token;
  
    //   if (testToken && testToken.startsWith("bearer")) {
    //       token = testToken.split(" ")[1];
    //   }
  
    //   if (!token) {
    //       return {
    //                   status: HttpStatus.UthorizationError,
    //                   data: {
    //                     success: false,
    //                     message: "please login",
    //                   },
    //                 };
    //   }
      
    // const decodedToken = decodeToken(token)
    // req.id = decodedToken.id
    // console.log(decodedToken)
    // if (!decodedToken || !decodedToken.userId) {
    //     return {
    //         status: HttpStatus.UthorizationError,
    //         data: {
    //           success: false,
    //           message: "please login",
    //         },
    //       };
    //   }
    
    //   // Attach userId to request object
    //  // req.user = { userId: decodedToken.id };
    //  //const Userid=
     
    //   next();

    export  async function useridGetting(req:Request,res:Response,next:NextFunction):Promise<any>{
    const authHeader = req.headers.get('Authorization')
   

  
    const token = authHeader?.split(' ')[1];

    try {
      const decoded = decodeToken(token)
    const payloadtoken = decoded.id; 
    
     (req as any).headers.user=payloadtoken
    console.log((req as any).user)
    
      next();
    } catch (err) {
      console.error(err);
     HttpStatus.ServerError
    }
  

  
    
  }
  