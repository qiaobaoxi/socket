const log4js = require("log4js");
log4js.configure({
    appenders: {
        error: { type: "file", filename: "error.log" }
    },
    categories: { default: { appenders: ["error"], level: "error" } }
})
module.exports = { errorlog: log4js.getLogger() };