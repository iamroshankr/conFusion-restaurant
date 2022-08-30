const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(express.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then( (fav) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);
    }, (err) => next(err))
    .catch( (err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    Favorites.findOne({user: req.user._id}, (err, fav) => {
        if(err) {
            next(err);
        }
        else if(fav) {
            req.body.forEach( (dish) => {
                if( fav.dishes.indexOf(dish._id) === -1 ) {
                    fav.dishes.push(dish._id);
                }
            });
            fav.save()
            .then( (fav) => {
                Favorites.findById(fav._id)
                .populate('user')
                .populate('dishes')
                .then( (fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                });
            }, (err) => next(err))
            .catch( (err) => next(err));
        }
        else {
            const dishArr = [];
            req.body.forEach( (dish) => {
                dishArr.push(dish._id);
            });
            Favorites.create({
                user: req.user._id,
                dishes: dishArr
            })
            .then( (fav) => {
                Favorites.findById(fav._id)
                .populate('user')
                .populate('dishes')
                .then( (fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                });
            }, (err) => next(err))
            .catch( (err) => next(err));
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites'); 
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
    Favorites.findOneAndDelete({user: req.user._id}, (err, resp) => {
        if(err) {
            next(err);
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }
    });
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorites.findOne({user: req.user._id})
    .then( (favs) => {
        if(!favs) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({'exists': false, 'favorites': favs});
        }
        else {
            if(favs.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({'exists': false, 'favorites': favs});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({'exists': true, 'favorites': favs});
            }
        }
    }, (err) => next(err))
    .catch( (err) => next(err) );
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    Favorites.findOne({user: req.user._id}, (err, fav) => {
        if(err) {
            next(err);
        }
        else if(fav) {
            if( fav.dishes.indexOf(req.params.dishId) === -1 ) {
                fav.dishes.push(req.params.dishId);

                fav.save()
                .then( (fav) => {
                    Favorites.findById(fav._id)
                    .populate('user')
                    .populate('dishes')
                    .then( (fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);
                    });
                }, (err) => next(err))
                .catch( (err) => next(err));
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }
        }
        else {
            Favorites.create({
                user: req.user._id,
                dishes: [req.params.dishId]
            })
            .then( (fav) => {
                Favorites.findById(fav._id)
                .populate('user')
                .populate('dishes')
                .then( (fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                });
            }, (err) => next(err))
            .catch( (err) => next(err));
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId); 
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
    Favorites.findOne({user: req.user._id}, (err, fav) => {
        if(err) {
            next(err);
        }
        else if(fav) {
            fav.dishes = fav.dishes.filter( (dish) => !dish._id.equals(req.params.dishId));
            fav.save()
            .then( (fav) => {
                Favorites.findById(fav._id)
                .populate('user')
                .populate('dishes')
                .then( (fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                });
            }, (err) => next(err))
            .catch( (err) => next(err));
        }
        else {
            const error = new Error('Favourites List is empty!');
            error.status = 400;
            next(error);
        }
    })
});

module.exports = favoriteRouter;