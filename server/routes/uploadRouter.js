const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

// diskStorage enables us to define the storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => { //cb=callback
        cb( null, 'public/images' ); //error=null, path of storage
    },

    filename: (req, file, cb) => {
        cb( null, file.originalname); //original name is the name from the client side
    }
});

// enables us to specify the kind of files supported for uploading
const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can only upload image files!'), false);
    }
    else {
        return cb(null, true); //true= go ahead with upload
    }
};

const upload = multer({storage: storage, fileFilter: imageFileFilter});
//multer module configuration complete

const uploadRouter = express.Router();

uploadRouter.use(express.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload'); 

 })
 .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,
    upload.single('imageFile'), (req, res) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    res.json(req.file); // file field automatically added in the req object
 })
 .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload'); 
 })
 .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload'); 
 })

module.exports = uploadRouter;