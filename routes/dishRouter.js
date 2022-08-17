const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router(); //declared as a Router

dishRouter.use(bodyParser.json());

dishRouter.route('/') //We'll mount this in the index.js file
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => { //modified res gets passed to it
    res.end('Will send all the dishes to you.');
})
.post((req, res, next) => {
   res.end('Will add the dish: ' + req.body.name + ', with details: ' + req.body.description); 
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes'); 
 })
 .delete((req, res, next) => {
    res.end('Will delete all the dishes!');
});

dishRouter.route('/:dishId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send details of the dish: ' + req.params.dishId);
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId); 
})
.put((req, res, next) => {
    res.write('Updating the dish: ' + req.params.dishId + '\n');
    res.end('Will update the dish: ' + req.body.name + ', with details: ' + req.body.description); 
})
.delete((req, res, next) => {
    res.end('Will delete the dish: ' + req.params.dishId);
});

module.exports = dishRouter;