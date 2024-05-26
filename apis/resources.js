const { request, response } = require("express");
const postgres = require("./../postgresql/postgresqlModel");


const createUser = (request, response) => {
    const { uid, dname, fname, lname, password, confPassword, phone, ptype } = request.body;
    console.log("Data - ", request.body);
    var isExist = false;
    postgres.pool.query('SELECT uid FROM public.fx_person WHERE uid = $1', [uid], async (error, results) => {
        if (error) {
            console.log("Error while reading person data ", error);
            throw error;
        } else {
            if (results.rows.length > 0) {
                isExist = true;
                return response.status(200).send({ "result": `This user id ${uid} already registered`, "status": false });
            }
        }
    });

    // User id does not exist
    if (!isExist) {
        postgres.pool.query('INSERT INTO public.fx_person (uid, dname, password, logged_in) VALUES ($1, $2, $3, $4) RETURNING * ', [uid, dname, password, false], async (error, result) => {
            if (error) {
                console.log("Error while inserting data into person ", error);
                throw error;
            } else {
                if (result.rows.length > 0) {
                    //return response.status(200).send({ "result": `This user id ${uid} registered`, "status": true });
                }
            }
        });

        postgres.pool.query('INSERT INTO public.fx_user_profile (uid, dname, fname, lname, mobile, mtype) VALUES ($1, $2, $3, $4, $5, $6) RETURNING * ', [uid, dname, fname, lname, phone, ptype], async (error, result) => {
            if (error) {
                console.log("Error while insert data into user profile ", error);
                throw error;
            } else {
                if (result.rows.length > 0) {
                    return response.status(200).send({ "result": `This user id ${uid} registered`, "status": true });
                }
            }
        });
    }
}


const updateUser = (request, response) => {
    console.log("Request body :: ", request.body);
    return response.status(200).send({ "status": "updateUser" });
}

const deleteUser = (request, response) => {
    console.log("Request body :: ", request.body);
    return response.status(200).send({ "status": "deleteUser" });
}

const getUser = (request, response) => {
    console.log("Request body :: ", request.body);
    return response.status(200).send({ "status": "getUser" });
}

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getUser
}