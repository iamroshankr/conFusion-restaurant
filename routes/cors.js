// configure my cors code in one seperate file
const express = require('express');
const cors = require('cors');

const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://linux:3001'];

const corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if(whitelist.indexOf(req.header('Origin')) !== -1 ) {
        corsOptions = { origin: true };
        // means origin is present in whitelist and hence is accepted
    }
    else {
        corsOptions = { origin: false };
    }

    callback( null, corsOptions );
};

module.exports.cors = cors();
module.exports.corsWithOptions = cors(corsOptionsDelegate);