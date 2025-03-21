import express from "express";
import morgan from "morgan";

import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT;
const app = express();

//logging middleware
if(process.env.NODE_ENV === 'development') app.use(morgan("dev"));



//Body Parser Middleware
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended: true, limit: '10kb'}))


//Global Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Internal server Error",
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    })
})


//API Routes






//404 error page not found
//it should always be at the bottom
//404 handler
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found !!!",
    })
})


app.listen(port, () => {
    console.log(`server is running at port ${port} in ${process.env.NODE_ENV}`);
    
});