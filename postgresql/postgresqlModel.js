const { request, response } = require("express");
const Pool = require("pg").Pool;
const env = require("dotenv").config();
const bcrypt = require("bcryptjs");


const pool = new Pool({
    user: env.parsed.POSTGRESQL_DB_USER_NAME,
    password: env.parsed.POSTGRESQL_DB_USER_PASS,
    host: env.parsed.POSTGRESQL_DB_HOST,
    port: env.parsed.POSTGRESQL_DB_PORT,
    database: env.parsed.POSTGRESQL_DB_NAME
});

pool.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Database Connected!");
    }
});


const getPerson = async (request) => {
    console.log("request Body :: getPerson ", JSON.stringify(request.body));
    const { uid } = request.body;
    try {
        return await new Promise(function (resolve, reject) {
            pool.query("SELECT * FROM public.fx_person WHERE uid = $1", [uid], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    console.log("row = ", result.rowCount);
                    if (result && result.rowCount > 0) {
                        resolve({ "record": result.rows, "status": "REC" })
                    } else {
                        resolve({ "record": result.rows, "status": "NOREC" })
                    }
                }
            });
        });

    } catch (exception) {
        console.error(exception);
        throw new Error("Internal Server error");
    }
};

const getLoggedInUsers = async (request) => {
    console.log("get loggedIn user ", JSON.stringify(request.body));
    
    try {
        return await new Promise(function (resolve, reject) {
            pool.query("SELECT uid, dname, logged_in, status FROM public.fx_person", (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    console.log("row = ", result.rowCount);
                    if (result && result.rowCount > 0) {
                        resolve({ "record": result.rows, "status": "REC" })
                    } else {
                        resolve({ "record": result.rows, "status": "NOREC" })
                    }
                }
            });
        });

    } catch (exception) {
        console.error(exception);
        throw new Error("Internal Server error");
    }
};

const toggleLoginStatus = async (request) => {
    console.log("request Body :: toggleLoginStatus ", JSON.stringify(request.body));
    const { uid, status } = request.body;

    try{
        return await new Promise(function (resolve, reject) {
            pool.query('UPDATE public.fx_person SET logged_in = $1 WHERE UID = $2 RETURNING * ', [status, uid], async (error, result) => {
                if (error) {
                    console.log("Error while updating person set ", error);
                    reject(error)
                } else {
                    if (result.rowCount > 0) {
                        resolve({ "record": result.rows, "status": "UPDATED" })
                    } else {
                        resolve({ "record": result.rows, "status": "NOUP" })
                    }
                }
            });
        });
    }catch(error){
        console.error(error);
        throw new Error("Internal Server error");
    }
}

const createPerson = async (request) => {
    console.log("request Body = ", JSON.stringify(request.body));
    const { uid, dname, password } = request.body;
    try {

        let hashedPassword = await bcrypt.hash(password, 10);
        
        return await new Promise(function (resolve, reject) {
            pool.query('INSERT INTO public.fx_person (uid, dname, password, logged_in, status) VALUES ($1, $2, $3, $4, $5) RETURNING * ', [uid, dname, hashedPassword, false, "online"], async (error, result) => {
                if (error) {
                    console.log("Error while inserting data into person ", error);
                    reject(error)
                } else {
                    if (result.rowCount > 0) {
                        resolve({ "record": result.rows, "status": "CREATED" })
                    } else {
                        resolve({ "record": result.rows, "status": "NOCRE" })
                    }
                }
            });
        });
    } catch (error) {
        console.error(error);
        throw new Error("Internal Server error");
    }
};

const createProfile = async (request) => {
    console.log("request Body = ", JSON.stringify(request.body));
    const { uid, dname, fname, lname, phone, ptype } = request.body;

    try {
        return await new Promise(function (resolve, reject) {
            pool.query('INSERT INTO public.fx_person_profile (uid, dname, fname, lname, mobile, mtype) VALUES ($1, $2, $3, $4, $5, $6) RETURNING * ', [uid, dname, fname, lname, phone, ptype], async (error, result) => {
                if (error) {
                    console.log("Error while inserting profile data into person ", error);
                    reject(error)
                } else {
                    if (result.rows.length > 0) {
                        resolve({ "record": result.rows, "status": "CREATED" })
                    } else {
                        resolve({ "record": result.rows, "status": "NOCRE" })
                    }
                }
            });
        });
    } catch (error) {
        console.error(error);
        throw new Error("Internal Server error");
    }

}


module.exports = {
    getPerson,
    createPerson,
    createProfile,
    toggleLoginStatus,
    getLoggedInUsers
}