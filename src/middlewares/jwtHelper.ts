import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
const secret=process.env.secretkey||"itssecret";
dotenv.config();

const verifyJwtToken = async(req:Request,res:Response,next:NextFunction)=>{
  
    let token:string|undefined;
    if ('authorization' in req.headers) {
      //token = req.headers['authorization'].split(' ')[1];
      console.log(token,25);
      if(!token){
       // return res.status(403).send({auth:false, message:'No Token Provided'});
      }
      else{
        try{
          console.log('line 26');
          const decoded = jwt.verify(token,secret);
        console.log(decoded,27);
          //req._id = decoded.id;
          next();
        }
        catch(error){
          //return res.status(500).send({auth:false,message:'Token authentication failed'})
        }
      }
     

  }
  
}

module.exports = {
  verifyJwtToken
}

