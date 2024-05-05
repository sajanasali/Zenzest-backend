import express from 'express';
import mongoose, { Schema, Document } from 'mongoose'
import createServer from './configs/server';
import userRouter from  './routes/userRoute'
import doctorRouter from './routes/doctor.Route'
import adminRouter  from './routes/adminRoute'
import { useridGetting } from './middlewares/doctorAuth';

const app = createServer();
const {Server}=require('socket.io')

const port = 3000;
app.use('/paymentonline/webhook', express.raw({ type: 'application/json' }));
app.get('/', (req, res) => {
    res.send('Hello, TypeScript and Node.js!');
  });


  app.use('/api/',userRouter);
  app.use('/api/doctor/',doctorRouter)
  app.use('/api/admin/',adminRouter)
  const server=app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

  const io = new Server(server,{cors: {
    origin: ['http://localhost:4200', 'https://admin.socket.io'],
    credentials: true
  }})