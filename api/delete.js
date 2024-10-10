const express = require("express");
const db = require("../db");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Cho phép mọi nguồn
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Trả về 200 cho các yêu cầu preflight (OPTIONS)
    res.status(200).end();
    return;
  }

  if (req.method === "DELETE") {
    try {
      const { createdBy, date } = req.body;

      await db.query(
        "DELETE FROM culi_tracker WHERE createdBy = $1 AND date = $2",
        [createdBy, date]
      );
      res.status(200).json({ message: "Data deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update data." });
    }
  } else {
    res.status(405).json({ message: "Only POST method is allowed" });
  }
}
