"use strict";

const server = require("express")()
const args = require("minimist")(process.argv.slice(2))
const os = require("os")
const cmd = require("node-cmd")
const icloud = require("icloud")()
const locker = require("./locker")

let locked;
let contacts;

icloud.login(args.iuser, args.ipass, (err) => {
    if(err) throw "unable to login to icloud, aborting."
    else icloud.contacts((err, result) => {
        if(err) throw "unable to get contacts, aborting."
        else contacts = console.log(result.contacts)
    })
})

server.post("/lock", (request, result) => {
    if(locker.isLocked()) {
        if(locker.getLockData().address == request.connection.remoteAddress) {
            locker.updateLock()
            result.status(200).send("Updated lock.")
        } else result.status(401).send("Server locked.")
    } else {
        locker.lock(request.connection.remoteAddress)
        result.status(202).send("Lock accepted.")
    }
})

const safeRouter = server.Router()
safeRouter.use((request, result, next) => {
    if(locker.isLocked()) {
        if(locker.getLockData().address == request.connection.remoteAddress) next()
        else result.status(401).send("Server locked.")
    } else result.status(503).send("Please lock before using this endpoint.")
})
safeRouter.post("/send", (request, result) => {
    const message = request.query.message
    const number = request.query.number
    if(message && number) {
        cmd("osascript " + __dirname + "/../messages.applescript ")
        result.status(200).send("Message sent")
    } else result.status(400).send("Message or number not supplied.")
})
safeRouter.get("/contacts", (request, result) => result.json(contacts))