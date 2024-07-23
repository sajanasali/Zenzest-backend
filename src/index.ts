import express from "express";
import mongoose, { Schema, Document } from "mongoose";
import createServerconfig from "./configs/server";
import userRouter from "./routes/userRoute";
import http from 'http'
import { createServer } from "http";

import doctorRouter from "./routes/doctor.Route";
import adminRouter from "./routes/adminRoute";
import { useridGetting } from "./middlewares/doctorAuth";
import socketManager from "./configs/socket";
const app = createServerconfig();
import { Server } from "socket.io";

const port = 3000;
app.use("/paymentonline/webhook", express.raw({ type: "application/json" }));
app.get("/", (req, res) => {
  res.send("Hello, TypeScript and Node.js!");
});

app.use("/api/", userRouter);
app.use("/api/doctor/", doctorRouter);
app.use("/api/admin/", adminRouter);
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Create an HTTP server instance
const serverhttp = createServer(app)

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:4200"],
    credentials: true,
     methods:['GET','POST']
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
});

socketManager(io);
// server.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });