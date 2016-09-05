var express = require('express');
var router = express.Router();

var db = require('../db');
var moment = require('moment');
/**
 * 设置页面中用于分页的中间页面的内容
 * @param  {[type]} page      [description]
 * @param  {[type]} pageCount [description]
 * @return {[type]}           [description]
 */
function getPages(page, pageCount) {
    var pages = [page]
    // 左边的第1个页码
    var left = page - 1
    // 右边的第1个页码
    var right = page + 1
    // 左右两边各加1个页码，直到页码够11个或
    // 左边到1、右边到总页数
    while (pages.length < 11 && (left >= 1 || right <= pageCount)) {
        if (left > 0) pages.unshift(left--)
        if (right <= pageCount) pages.push(right++)
    }
    return pages
}

/* GET home page. */
router.get('/list/:page', function (req, res, next) {

    var filter = {};
    var name = req.query.name;
    var mobile = req.query.mobile;
    var email = req.query.email;
    var gender = req.query.gender;
    if (!!name) {
        filter.name = { '$regex': `.*?${name}.*?` };
    }
    if (!!mobile) {
        filter.mobile = { '$regex': `.*?${mobile}.*?` };;
    }
    if (!!email) {
        filter.email = { '$regex': `.*?${email}.*?` };;
    }
    if (!!gender) {
        filter.gender = gender;
    }

    var page = req.params.page;
    page = page || 1;
    page = parseInt(page);
    var pageSize = 3
    ///total是根据条件查询到的总数量
    db.Student.find(filter).count((err, total) => {
        if (err) {
            console(err);
        }
        /////总页数(总共有多少页)
        var pageCount = Math.ceil(total / pageSize);
        ////此处做页面范围限制
        if (page > pageCount) {
            page = pageCount
        }
        if (page < 1) {
            page = 1
        }
        /////query 按条件查询
        db.Student.find(filter).skip((page - 1) * pageSize)
            .limit(pageSize).exec((err, data) => {
                data.forEach(function (item) {
                    ////新增一个属性 用于村相互需要在页面上展示的日期时间值
                    item.birthdayForShow = moment(item.birthday).format('YYYY-MM-DD');
                })
                res.render('studens/list', {
                    data: data,
                    pages: getPages(page, pageCount),
                    page: page,
                    pageCount: pageCount
                })
            })
    })
});
/////query 按条件查询
//     db.Student.find(filter).exec((err, data) => {
//         data.forEach(function (item) {
//             //console.log(moment(item.birthday).format('YYYY-MM-DD'));
//             ////新增一个属性 用于村相互需要在页面上展示的日期时间值
//             item.birthdayForShow = moment(item.birthday).format('YYYY-MM-DD');
//         })
//         res.render('studens/list', {
//             data: data
//         });
//     })
// });

/**
 * 新增和修改页面放在一起调用
 * @param  {[type]} '/editor/:id' [description]
 * @param  {[type]} function      (req,         res, next [description]
 * @return {[type]}               [description]
 */
router.get('/editor/:id', function (req, res, next) {
    /////根据id去查找数据
    var id = req.params.id;
    //////通过id去数据库中查找数据
    db.Student.findById(id, (err, data) => {
        if (data) { /////如果找到了 表示修改
            //console.log('data存在')
            ///格式化出一个日期字符串数据 用于在页面修改的时候显示
            data.birthdayForShow = moment(data.birthday).format('YYYY-MM-DD');
            console.log(data.birthdayForShow);
        }
        else { ////如果没有找到 表示新增
            //console.log('data不存在')
            data = new db.Student();
        }
        res.render('studens/editor', { data: data });
    })

    ////////通过以上简单的判断即可实现以下效果,so 注释掉一下代码 使用👌好用的以上方法
    // if (!!id && id != "0") {
    //     db.Student.findById(id, (err, data) => {
    //         if(data){
    //             console.log('data存在')
    //         }
    //         else{
    //             console.log('data不存在')
    //         }
    //         data.birthdayForShow = moment(data.birthday).format('YYYY-MM-DD');
    //         console.log(data.birthdayForShow);
    //         console.log('编辑');
    //         res.render('studens/editor', { data: data });
    //     })
    // }
    // else {
    //     var data = new db.Student();
    //     console.log(data);
    //     console.log('新增');
    //     res.render('studens/editor', { data: data });
    // }

})

router.post('/editor/:id', function (req, res, next) {
    // res.render('studens/editor');

    ///db.Student.
    var id = req.params.id;
    /////获取从页面中传递过来的数据
    var student = req.body;

    //////通过页面传递过来的出生年月计算年龄
    student.age = ((new Date()).getFullYear()) - (new Date(req.body.birthday)).getFullYear();

    /////此处的参数upsert 当我的记录没有找到的时候就新增 如果找到了那么进行修改操作
    db.Student.findByIdAndUpdate(id, student, { upsert: true }, (err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/student/list/0');
    });

    // var student = new db.Student(req.body);
    // console.log('执行新增');
    // student.age = ((new Date()).getFullYear()) - (new Date(req.body.birthday)).getFullYear();
    // student.save((err) => {
    //     if (err) {
    //         console.log(err);
    //     }
    //     res.redirect('/student/list');
    // })
})

/**
 * 根据ID删除记录
 */
router.post('/delete', function (req, res) {
    if (req.body.id) {
        db.Student.findByIdAndRemove(req.body.id, (err) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/student/list/1');
        })
    }
    else {
        res.redirect('/student/list/1');
    }
})

module.exports = router;
