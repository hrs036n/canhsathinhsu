import { promises as fs } from 'fs';
import path from 'path';
const express = require("express");
const db = require("../db");
const app = express();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Cho phép mọi nguồn
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Trả về 200 cho các yêu cầu preflight (OPTIONS)
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            const { user } = req.query; // Lấy tham số từ query
            const result = await db.query("SELECT date FROM culi_tracker WHERE createdby = $1", [user]);

            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to read data.' });
        }
    } else {
        res.status(405).json({ message: 'Only GET method is allowed' });
    }
}
