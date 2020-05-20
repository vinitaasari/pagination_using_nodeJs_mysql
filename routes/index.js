var express = require('express')
var app = express()

app.get('/', function (req, res) {
    res.render('login', {expressFlash: req.flash('error') });
})

app.get('/pagination', function (req, res) {
    res.render('pagination', { title: 'Pagination' })
})

app.get('/login', function (req, res) {
    res.render('login', { title: 'Login' })
})

module.exports = app;