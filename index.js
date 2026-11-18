import { app } from "./app.js";
import dotenv from 'dotenv';
import express from 'express';
import { ApiError } from "./utils/ApiError.js";

dotenv.config({
    path : '.env',
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// new added
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: null
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null
    });
});