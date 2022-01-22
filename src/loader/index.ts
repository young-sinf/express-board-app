import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import logger from "../utils/logger";
import passport from "../utils/passport/index";
import route from "../routes/index";

export default function loader() {
  const app = express();
  passport();
  dotenv.config();

  const mongoUri = process.env.MONGO_URI;

  if (process.env.NODE_ENV !== "test") {
    mongoose.connect(mongoUri + "/board", () => {
      logger.info("DB connected");
    });
  } else {
    mongoose.connect(mongoUri + "/boardTest", () => {
      logger.info("DB connected");
    });
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/api", route());

  app.use((req, res, next) => {
    next("404 Not Found");
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(403).json({ isOk: false, msg: err });
  });

  return app;
}