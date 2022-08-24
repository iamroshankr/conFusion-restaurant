const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(express.json());

dishRouter.route('/') 
.get((req, res, next) => {
    
    Dishes.find({})
    .populate('comments.author')
    .then( (dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes); //this will be put in the response body and sent back
    }, (err) => next(err))
    .catch( (err) => next(err));

})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    Dishes.create(req.body)
    .then( (dish) => {
        console.log('Dish Created', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch( (err) => next(err));

})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes'); 

 })
 .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    Dishes.deleteMany({})
    .then( (resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch( (err) => next(err));

});

dishRouter.route('/:dishId')
.get((req, res, next) => {

    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then( (dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch( (err) => next(err));

})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId); 

})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, {new: true})
    .then( (dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch( (err) => next(err));

})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    Dishes.findByIdAndRemove(req.params.dishId)
    .then( (resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch( (err) => next(err));

});

dishRouter.route('/:dishId/comments') 
.get((req, res, next) => {
    
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then( (dish) => {
        if(dish) {

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch( (err) => next(err));

})
.post(authenticate.verifyUser, (req, res, next) => {

    Dishes.findById(req.params.dishId)
    .then( (dish) => {
        if(dish) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then( (dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then( (dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch( (err) => next(err));

})
.put(authenticate.verifyUser, (req, res, next) => {

    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/' + req.params.dishId + ' /comments'); 

 })
 .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    Dishes.findById(req.params.dishId)
    .then( (dish) => {
        if(dish) {

            for(var i= (dish.comments.length - 1); i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
                //way to access a subdocument
                // doc.subdoc.id(subdoc_id)
            }

            // better way: findOneAndUpdate & $pull

            dish.save()
            .then( (dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch( (err) => next(err));

});

dishRouter.route('/:dishId/comments/:cmntId')
.get((req, res, next) => {

    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then( (dish) => {
        if( dish && dish.comments.id(req.params.cmntId) ) {

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json( dish.comments.id(req.params.cmntId) );
        }
        else if(!dish) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.cmntId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch( (err) => next(err));

})
.post(authenticate.verifyUser, (req, res, next) => {

    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId + '/comments/' + req.params.cmntId); 

})
.put(authenticate.verifyUser, (req, res, next) => {

    Dishes.findById(req.params.dishId)
    .then( (dish) => {
        if( dish && dish.comments.id(req.params.cmntId) ) {

            if( dish.comments.id(req.params.cmntId).author._id.equals(req.user._id) ) {

                if(req.body.rating) {
                    dish.comments.id(req.params.cmntId).rating = req.body.rating;
                }
                if(req.body.comment) {
                    dish.comments.id(req.params.cmntId).comment = req.body.comment;
                }

                dish.save()
                .then( (dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then( (dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish.comments);
                    });
                }, (err) => next(err));
            }
            else {
                err = new Error('You are not authorised to perform this operation!');
                err.status = 403;
                return next(err);
            }
        }
        else if(!dish) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.cmntId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch( (err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {

    Dishes.findById(req.params.dishId)
    .then( (dish) => {
        if( dish && dish.comments.id(req.params.cmntId) ) {
            if( dish.comments.id(req.params.cmntId).author._id.equals(req.user._id) ) {

                dish.comments.id(req.params.cmntId).remove();
    
                dish.save()
                .then( (dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then( (dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish.comments);
                    });
                }, (err) => next(err));
            }
            else {
                err = new Error('You are not authorised to perform this operation!');
                err.status = 403;
                return next(err);
            }
        }
        else if(!dish) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.cmntId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch( (err) => next(err)); 
});

module.exports = dishRouter;