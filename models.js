var mongoose=require('mongoose');

var essayModel = new mongoose.Schema({
	title:String,
	filename:String,
	year:Number,
	month:Number,
	day:Number,
	type:String,
	brief:String,
	index:{type:Number,unique:true},
	priority:Number
});

var pwdModel = new mongoose.Schema({
	password:String
});

module.exports = {
	essayModel: mongoose.model('essayModel',essayModel,'essays'),
	pwdModel: mongoose.model('pwdModel',pwdModel,'passwords')
};
