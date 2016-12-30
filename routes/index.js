var express = require('express');
var multer = require('multer');
var passport = require('passport');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({storage: storage});
var Post = require('../models/post');

var isLogged = function(req, res, next){
    if(req.isAuthenticated())
        return next();
    else
        res.redirect('/users/login');
};

router.get('/', function (req, res, next) {
    Post.find(function (error, data) {
        if (error) return console.error(error);
        res.render('index', {data: data});
    }).sort({date: -1})
});

router.get('/add', isLogged, function (req, res, next) {
    res.render('add', {});
});

router.get('/delete/:id', isLogged, function (req, res, next) {
    Post.findByIdAndRemove(req.params.id, function (err) {
        res.redirect('back');
    });
});

router.get('/edit/:id', isLogged, function (req, res, next) {
    Post.findOne({_id: req.params.id}, function (error, data) {
        if (error) return console.error(error);
        res.render('add', {
            title: data.title,
            author: data.author,
            body: data.body,
            id: req.params.id,
            upload: data.image
        });
    })
});

router.post('/create', upload.single('image'), function (req, res, next) {
    Post.findByIdAndUpdate(req.body.id ? req.body.id : new ObjectId(), {
        $set: {
            title: req.body.title,
            author: req.body.author,
            body: req.body.body,
            image: req.file ? 'uploads/' + req.file.filename : req.body.upload
        }
    }, {upsert: true, setDefaultsOnInsert: true}, function (error, data) {
        if (error) console.error(error);
    });

    res.redirect('/');
});

module.exports = router;
