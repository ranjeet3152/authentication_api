var mysql = require('mysql');
const crypto = require('crypto');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'hrg'
});
connection.connect(function(err) {
	if(!err) {
  	console.log("Database is connected ...");
	} else {
  	console.log("Error connecting database ...");
	}
});

exports.register = function(req, res) {
  var user={
    "name":req.body.name,
    "email":req.body.email,
    "password":crypto.pbkdf2Sync(req.body.password, '10', 100, 100, 'sha512').toString('hex')
  }
  connection.query('INSERT INTO user SET ?',user, function (error, results, fields) {
	  if (error) {
	    console.log("error ocurred",error);
	    res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
	  }else {
	    console.log('The solution is: ', results);
	    res.send({
	      "code":200,
	      "success":"user registered sucessfully."
	    });
	  }
  });
}

exports.login = function(req, res) {
  var email= req.body.email;
  var password = crypto.pbkdf2Sync(req.body.password, '10', 100, 100, 'sha512').toString('hex');
  console.log(password);
  connection.query('SELECT * FROM user WHERE email = ?',[email], function (error, results, fields) {
	  if (error) {
	    res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
	  }else {
	    if(results.length > 0) {
	    	console.log(results[0].password);
	      if(results[0].password == password) {
	        res.send({
	          "code":200,
	          "success":"login sucessfull."
	        });
	      }
	      else{
	        res.send({
	          "code":204,
	          "success":"Email and password does not match."
	        });
	      }
	    }
	    else{
	      res.send({
	        "code":204,
	        "success":"Email does not exits."
	      });
	    }
	  }
  });
}

exports.forgetPassword = function(req, res) {
  var email= req.body.email;
  var password = req.body.password;
  var verifyPassword = req.body.verfiy_password;
  if (password == verifyPassword) {
  	var enPassword = crypto.pbkdf2Sync(password, '10', 100, 100, 'sha512').toString('hex')
	  connection.query('UPDATE user SET password = ? WHERE email = ?',[enPassword, email], function (error, results, fields) {
		  if (error) {
		    res.send({
		      "code":400,
		      "failed":"error ocurred."
		    })
		  } else {
		  	res.send({
		  		"code": 200,
		  		"success": "password reset sucessfull."
		  	});
		  }
	  });
	}
	else {
		res.send({
			"code": 401,
			"failed": "password does not match."
		});
	}
}