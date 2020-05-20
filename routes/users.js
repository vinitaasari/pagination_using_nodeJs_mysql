var express = require('express')
var app = express()
const { sign } = require("jsonwebtoken");
const { checkToken } = require("../auth/token_validation");
var md5 = require('md5');

app.get('/data', checkToken, function (req, res, next) {
  try {
    var limit = 2;
    var page = req.param('page');
    var skip = page * limit - page;
    var orderBy = req.param('orderBy');
    var sortBy = req.param('sortBy');
    var query = '';

    if (orderBy) {
      query = 'select p.project_title, u.username from ilance_projects p INNER JOIN ilance_users u ON u.user_id = p.user_id order by ' + orderBy + ' ' + sortBy + ' limit ' + limit + ' offset ' + skip;
    } else {
      query = 'select p.project_title, u.username from ilance_projects p INNER JOIN ilance_users u ON u.user_id = p.user_id limit ' + limit + ' offset ' + skip;
    }

    console.log("limit :" + limit + "\n page : " + page + "\n skip : " + skip + "\n orderBy :" + orderBy + " \n sortBy : " + sortBy);

    req.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        return next(err);
      } else {
        conn.query(query, function (err, rows, fields) {
          if (err) {
            console.error('SQL error: ', err);
          }
          if (rows || fields) {
            res.json(rows);
          } else {
            res.json({ "data": "not found" });
          }
        });
      }
    });
  } catch (ex) {
    console.error("Internal error:" + ex);
    return next(ex);
  }
})

app.post('/login', function (req, res, next) {

  req.getConnection(function (err, conn) {
    if (err) {
      console.error('SQL Connection error: ', err);
      return next(err);
    } else {
      conn.query(
        `select * from ilance_users where username = ?`,
        [req.body.email],
        (error, results, fields) => {

          if (error) {
            callBack(error);
          }
          else if (results.length===0) {
            req.flash('error', 'Invalid Email');
            return res.redirect('/');
          }
          else if (results[0].password === (md5(md5(req.body.password) + results[0].salt))) {
            results[0].password = undefined;
            const jsontoken = sign({ result: results }, "qwe1234", {
              expiresIn: "1h"
            });
            res.redirect('/pagination');
          } else {
            req.flash('error', 'Password is wrong');
            res.redirect('/');
          }
        }
      );
    }
  });
})

module.exports = app
