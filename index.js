import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import mongodb from "mongodb";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

var MongoClient = mongodb.MongoClient;
var url = "mongodb://0.0.0.0:27017/";
const databasename = "VIZIONSYS";
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/VIZIONSYS")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

const formdataSchema = new mongoose.Schema({
    BranchName: { type: String, required: true },
    Dependency: { type: String, required: true },
    ChangeLog: { type: String, required: true },
    TicketID: { type: String, required: true },
    DeveloperName: { type: String, required: true },
});

const FormData = mongoose.model("FormData", formdataSchema);
app.get("/", (req, res) => {
    res.redirect("/display");
    res.render("open", { users: [] }); // Pass an empty array for 'users'
});

// Updated route to fetch and display data directly from MongoDB
app.get("/display", (req, res) => {
    MongoClient.connect(url)
        .then((client) => {
            const connect = client.db(databasename);
            const collection = connect.collection("formdatas");

            collection.find({}).toArray()
                .then((ans) => {
                    // Render 'display.ejs' with the fetched data
                    res.render("open", { users: ans });
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    res.status(500).send("Error fetching data");
                });
        })
        .catch((error) => {
            console.error("Database connection error:", error);
            res.status(500).send("Database connection error");
        });
});

app.post("/datatransfer", (req, res) => {
    const { branchname, "Ticket ID": ticket_id, "Change log": change_log, Dependency: dependency, "Developer name": developer_name } = req.body;

    const newFormData = new FormData({
        BranchName: branchname,
        TicketID: ticket_id,
        ChangeLog: change_log,
        Dependency: dependency,
        DeveloperName: developer_name,
    });

    newFormData.save()
        .then(() => {
            console.log("Data saved successfully");
            res.redirect("/display"); // Redirect to display data after saving
        })
        .catch((error) => {
            console.error("Error saving data:", error);
            res.status(500).send("Error saving data");
        });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});