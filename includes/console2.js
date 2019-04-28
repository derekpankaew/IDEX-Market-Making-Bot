const fs = require("fs");

function log(data) {

    var logMe = fs.createWriteStream('./logs/IDEXLog.txt', {flags: 'a'});

    try {
        logMe.write(data + '\n');
        logMe.end();
    }

    catch(e) {
        console.log("Error writing to log file");
    };



    console.log(data);
};

//function end() {
//    logMe.end();
//};

module.exports = {
    log
};