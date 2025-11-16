import { Request, Response } from "express";

export async function generate(req: Request, res: Response) {
  try {
    // logique génération PDF
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
