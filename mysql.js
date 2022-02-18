var mysql = require('mysql');
var pool = mysql.createPool({
  // host
  host: '122.112.173.122',
  // 端口号
  port: '3306',
  // 用户名
  user: 'root',
  // 密码
  password: 'Qiao331751.',
  // 数据库名
  database: 'accesscard',
});
module.exports =pool