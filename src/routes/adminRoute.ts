import express, { Request, Response } from "express";
import AdminController from "../controller/admin.Controller";
import AdminUsecase from "../usecases/admin.Usecase";
import adminRepository from "../repositories/admin.Repository";

const Router = express.Router();
const adminrepository = new adminRepository();
const adminUsecase = new AdminUsecase(adminrepository);
const adminController = new AdminController(adminUsecase);

Router.post("/login", (req: Request, res: Response) => {
  console.log(req.header, "Request header");
  adminController.loginUser(req, res);
});
Router.get("/bookings", (req: Request, res: Response) => {
  console.log("inside the appointment router");
  adminController.getAppointments(req, res);
});
Router.put("/blockDoctor", (req: Request, res: Response) => {
  console.log(req.body, "request from blockuser");
  adminController.blockDoctor(req, res);
});
Router.put("/blockuser", (req: Request, res: Response) => {
  console.log(req.body, "request from blockuser");
  adminController.blockuser(req, res);
});
Router.post("/createDoctor", (req: Request, res: Response) => {
  console.log(req.header, "Request header");
  adminController.createDoctor(req, res);
});
export default Router;
