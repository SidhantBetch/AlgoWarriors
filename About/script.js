<<<<<<< HEAD
const express = require("express");
const app = express();

app.use(express.static(__dirname));

app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/about.html");
});

app.listen(3000,()=>{
    console.log("Server running on http://localhost:3000");
});
=======
const express = require("express");
const app = express();

app.use(express.static(__dirname));

app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/about.html");
});

app.listen(3000,()=>{
    console.log("Server running on http://localhost:3000");
});
>>>>>>> fafb58bff4022070199ab4e6d30f510abb35612b
