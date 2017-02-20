var express = require("express");
var mongoose=require('mongoose');
var expressMongoose=require('express-mongoose');
var models=require('./models');
var app = express();
var path = require('path');
var fs=require('fs');
var url = require('url');
var util = require('util');
var qs = require('querystring');
var bodyParser = require('body-parser');
var cors = require('cors');
var marked = require('marked');
var formidable = require('formidable');

const BASE_INDEX = 1000;

const FILE_PATH = path.join(__dirname,'public/essays/');
const TEMP_FILE_PATH = path.join(__dirname,'public/temp/');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));

var essayModel = models.essayModel;
var pwdModel = models.pwdModel; 

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blogs');

app.get('/', function(req, res) { 
	res.send('hello node'); 
});

app.get('/test',function(req,res){
    res.send('get test');
});

app.post('/test',function(req,res){
    res.send('post test');
});

app.post('/login',function(req,res){
    pwdModel.find({'password':req.body.password},function(err,data){
        res.send(data.length>0 ? true : false);
    })
});

app.get('/getEssays', function(req, res){
    essayModel.find(function(err,data){
            res.send(data);
    });
    // if(req.query.essayType == 'all' || req.query.essayType == 'home'){
    //     essayModel.find(function(err,data){
    //         res.send(data);
    //     });
    // }else{
    //     essayModel.find({'type':req.query.essayType},function(err,data){
    //         res.send(data);
    //     });
    // }
});

app.get('/getEssay',function(req,res){
    essayModel.findOne({'index':req.query.index},function(err,data){
        fs.readFile(FILE_PATH + data.filename,'UTF-8',function(err,data){
            res.send(marked(data));
        });
    });
});

app.post('/addEssay',function(req,res){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8'; 
    form.uploadDir = TEMP_FILE_PATH;  //设置上传目录
    form.keepExtensions = true;    //保留后缀
    form.maxFieldsSize = 16 * 1024 * 1024;   //文件大小

    fs.access(FILE_PATH, function(err){
        if(err){
            fs.mkdirSync(FILE_PATH);
        }
        _saveFile();
    });

    function _saveFile(){
        form.parse(req, function(err, fields, files) {
            if(err){
                res.send('a');
            }

            var uploadFields = fields;
            var uploadFiles = files;
            var title = uploadFields.uploadTitle;
            var type = uploadFields.uploadSelect;
            var brief = uploadFields.uploadBrief;
            var file = uploadFiles.uploadFile;
            var filename = file.name;
            var filepath = file.path;

            fs.rename(filepath,FILE_PATH+filename,function(err,data){        
                if(err){
                    res.send('b');
                }
                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth()+1;
                var day = date.getDate();
                var suffixPos = filename.lastIndexOf(".");
                var suffix = filename.substring(suffixPos+1);
                if(suffix === 'md'|| suffix === 'txt'||suffix==='mkd'){
                    essayModel.count(function(err,count){
                        var newEssay = new essayModel({
                            title:title,
                            filename: filename,
                            year:year,
                            month:month,
                            day:day,
                            type:type,
                            brief:brief,
                            index:BASE_INDEX+count+1
                        });
                        newEssay.save(function(err){
                            if(err){
                                res.send(err.body);
                            }else{
                                res.send('文章已成功上传！');
                            }
                        });
                       
                    });
                }else{
                    res.send('文件类型错误！');
                }
            });  
        });
    }

});



    // var filename = req.body.filename;
    // var type = req.body.type;
    // var brief = req.body.brief;
    // var file = req.body.file;
    // var date = new Date();
    // var year = date.getFullYear();
    // var month = date.getMonth()+1;
    // var day = date.getDate();
    // var pos = filename.lastIndexOf("\\");
    // filename = filename.substring(pos+1);
    // var suffixPos = filename.lastIndexOf(".");
    // var suffix = filename.substring(suffixPos+1);
    // if(suffix === 'md'|| suffix === 'txt'||suffix==='mkd'){
//         essayModel.count(function(err,count){
//             var newEssay = new essayModel({
//                 title:title,
//                 filename: filename,
//                 year:year,
//                 month:month,
//                 day:day,
//                 type:type,
//                 brief:brief,
//                 index:BASE_INDEX+count+1
//             });
//             newEssay.save(function(err){
//                 if(err){
//                     console.log(JSON.stringify(err));                    
//                 }else{
//                     res.send('文章已成功上传！');
//                 }
//             });
           
//         });
//     }else{
//         res.send('文件类型错误！');
//     }
// });


//express-mongoose
// app.get('/display',function(req,res){
// 	res.send(user.find());
// });

app.listen(3000);