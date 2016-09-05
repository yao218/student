////引入mongoose模块
var db = require('mongoose');

//// 链接数据库 mongodb 协议, localhost 主机ip, student_db 数据库名称
db.connect('mongodb://localhost/student_db');


////新创建一个模型
var Student = db.model('Student',{
    name:{type:String,default:""},
    birthday:{type:Date,default:Date.now},
    age:{type:Number,default:0},
    mobile:{type:String,default:""},
    address:{type:String,default:""},
    email:{type:String,default:""},
    hobby:{type:String,default:""},
    gender:{type:String,default:""},
    remarks:{type:String,default:""},
    avatar:{type:String,default:""},
    create_time:{type:Date,default:Date.now},
    updated_time:{type:Date,default:Date.now}
})

/////模块导出
module.exports = {
    Student:Student
}