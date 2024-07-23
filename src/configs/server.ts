import  express  from "express";
const bodyParser = require('body-parser');
import cors from "cors";
import morgan  from "morgan";
import connectDB from "./db";
const CreateServer=()=>{
 const app= express();
  connectDB();

 app.use(express.json())
	app.use(express.urlencoded({ extended: true }))
    app.use(morgan("dev"))
	app.use(cors({
		origin: "*",
		credentials: true
	}))
     return app

}

export default CreateServer