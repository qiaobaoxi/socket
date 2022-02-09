var mysql = require('mysql');
var pool = mysql.createPool({
  host     : '122.112.173.122',
  user     : 'root',
  password : 'Qiao331751',
  database : 'accesscard'
});
module.exports =pool