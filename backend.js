const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const pgdb = require("./postgresql/postgresqlModel");
const apis = require("./apis/resources");
const { request } = require("http");
const { error } = require("console");
const { escape } = require("querystring");

const app = express();
const port = 3003;

const publicDir = path.join(__dirname, "./public");
dotenv.config({ path: "./.env" })
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);


app.use(cors());
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: 'false' }))
app.use(express.json());

app.use(function (request, response, next) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
});

app.post("/api/user/update", apis.updateUser);
app.post("/api/user/delete", apis.deleteUser);
app.get("/api/user/get", apis.getUser);

app.post("/api/user/register", (req, res) => {
    console.log("Request data from register api :: ", req);
    console.log("Request data from register api :: ", JSON.stringify(req.body));
    pgdb.getPerson(req).then(response => {
        console.log("response status = ", response.status);
        if (response.status === "REC") {
            res.status(200).send(response);
        } else if (response.status === "NOREC") {
            pgdb.createPerson(req).then(response => {
                if (response.status === "CREATED") {
                    pgdb.createProfile(req).then(response => {
                        if (response.status === "CREATED") {
                            res.status(201).send(response);
                        } else {
                            res.status(204).send(response);
                        }
                    });

                } else {
                    res.status(204).send(response);
                }
            });
        } else {
            res.status(204).send(response);
        }
    }).catch(error => {
        console.log(error);
        res.status(500).send(error);
    });
});

app.post("/api/user/logged", (req, res) => {
    console.log("Get logged in user ", req.body);
    pgdb.getLoggedInUsers(req).then(response => {
        if(response.status === "REC"){
            return res.status(201).send({ "record": response.record, "status": true });
        }else{
            return res.status(201).send({ "record": response.record, "status": false });
        }
    });
});

app.post("/api/user/login", (req, res) => {
    const { password } = req.body;
    pgdb.getPerson(req).then(response => {
        if (response.status === "REC") {
            response.record.forEach(element => {
                validatePassword(element.password, password).then((result) => {
                    console.log("Matched = ", result);
                    if (result) {
                        pgdb.toggleLoginStatus(req).then((response) => {
                            console.log("Response = ", response);
                            if (response && response.status === "UPDATED") {
                                return res.status(201).send({ "record": response.record, "status": true });
                            } else {
                                return res.status(201).send({ "record": response.record, "status": false });
                            }
                        });
                    } else {
                        return res.status(201).send({ "record": response.record, "status": false });
                    }

                });
            });
        } else {
            return res.status(200).send({ "record": response.rows, "status": false });
        }
    });



    // Update logged-in status


});

app.put("/api/user/logout", (req, res) => {
    console.log("request Body = ", JSON.stringify(req.body));
    const { uid, status } = req.body;
    pgdb.toggleLoginStatus(req).then((response) => {
        console.log("response status = ", response);
        if (response.status && response.status === "UPDATED") {
            return res.status(201).send({ "record": response.record, "status": true });
        } else {
            return res.status(201).send({ "record": response.record, "status": false });
        }
    });
});

async function validatePassword(hashPass, password) {
    return await new Promise(function (resolve, reject) {
        bcrypt.compare(password, hashPass, (error, result) => {
            if (error) {
                console.log("Error while comparing password: ", error);
                reject(error);

            }
            if (result) {
                console.log("Password match! ", result);
                return resolve(true);;
            } else {
                console.log("Password does not match! ", result);
                return resolve(false);;
            }
        });

    });

}

app.get("/", function (request, response) {
    response.status(200).send("Hello World!");
});

app.listen(port, () => {
    console.log(`Application is running on port ${port}`);
});