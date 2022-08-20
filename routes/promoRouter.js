const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router(); //declared as a Router

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send all the promotions to you.');
})
.post((req, res) => {
   res.end('Will add the promotion: ' + req.body.name + ', with details: ' + req.body.description); 
})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promos'); 
 })
 .delete((req, res) => {
    res.end('Will delete all the promotions!');
});

promoRouter.route('/:promoId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res) => {
    res.end('Will send details of the promotion: ' + req.params.promoId);
})
.post((req, res) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promos/' + req.params.promoId); 
})
.put((req, res) => {
    res.write('Updating the promotion: ' + req.params.promoId + '\n');
    res.end('Will update the promotion: ' + req.body.name + ', with details: ' + req.body.description); 
})
.delete((req, res, next) => {
    res.end('Will delete the promotion: ' + req.params.promoId);
});

module.exports = promoRouter;