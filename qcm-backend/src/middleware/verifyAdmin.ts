import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

export const verifyAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.auth?.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Accès réservé à l'admin" });
  }
};
