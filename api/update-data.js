import { promises as fs } from "fs";
import path from "path";
const express = require("express");
const db = require("../db");
const app = express();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Cho phép mọi nguồn
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Trả về 200 cho các yêu cầu preflight (OPTIONS)
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
        const { data, createdBy, date } = req.body;

      const result = await db.query(
        "INSERT INTO culi_tracker (data, createdBy, date) VALUES ($1, $2, $3) RETURNING *",
        [data, createdBy, date]
      );

      const insertedData = result.rows[0];
      res.status(200).json({ message: "Data updated successfully", data: insertedData });
    } catch (error) {
      res.status(500).json({ error: "Failed to update data." });
    }
  } else {
    res.status(405).json({ message: "Only POST method is allowed" });
  }
}
