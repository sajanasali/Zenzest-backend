import express from 'express';
import mongoose, { Schema, Document } from 'mongoose'
import createServer from './configs/server';
import userRouter from  './routes/userRoute'
import doctorRouter from './routes/doctor.Route'

const app = createServer();

const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello, TypeScript and Node.js!');
  });


  app.use('/api/',userRouter);
  app.use('/api/doctor/',doctorRouter)
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });