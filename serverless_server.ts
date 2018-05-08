const express = require("express");
const bodyParse = require("body-parser");
const fs = require("fs");
//const method_override = require("method_override");
const config = require("config");
const {exec, execFile} = require("child_process");
const requiredFiles = {};
const requestP = require('request-promise-native');

let fileMap = {
	"t.js":"t123.js"
};

const app = new express();

app.use(bodyParse.urlencoded({extended:true}));
app.use(bodyParse.json());

let port = config.express.port;
app.listen(port, () => console.log('Serverless server is listening on port '+port+'!'));	

app.post("/createFile/:fileName", (req, res, next)=>{
	const fileContents = req.body.fileContents;
	const fileName = req.params.fileName;

	console.log("wrting "+"serverless/script_files/"+fileName);
	fs.writeFileSync(fileName, fileContents);
	res.end(fileName);

	next();
});

// function requireFile(req, res, next){
// 	let file = getFile(req.params.fileName || req.body.file || req.query.file);
// 	console.log(file)
// 	file = fileMap[file];
// 	console.log(file)

// 	if(file===undefined){
// 		let errMsg = "file not found: "+file
// 		console.log(req.params.fileName || req.body.file || req.query.file)
// 		console.error(errMsg);
// 		res.status(500).end(errMsg);
// 	}else{

// 		if(requiredFiles[file]===undefined||true){
		
// 			requiredFiles[file]={};
// 			console.log("file is "+file);
// 			requiredFiles[file].init = require(file);
// 			requiredFiles[file].funct = requiredFiles[file].init();
// 			requiredFiles[file].funct();

// 			res.end("done1");
		
// 		}else if( requiredFiles[file].good!==false ){
// 			requiredFiles[file].funct();
// 			res.end("done2");
// 		}
		
// 	}
// }

function executeFile(req, res, next){
	let file = getFile(req.params.fileName);

	let params = req.query || {};
	for( let k in req.body  ){
		params[k]=req.body[k];
	}

	params = JSON.stringify(JSON.stringify(params));

	let toExec = "ts-node "+file+" "+params;
	console.log("toExec "+toExec);

	exec(toExec, (err, stdout, stderr)=>{
		res.end(stdout);
		next();
	});

}

app.get("/execFile/:fileName", executeFile);
app.post("/execFile/:fileName", executeFile);
// app.get("/requireFile/:fileName", requireFile);
// app.post("/requireFile/:fileName", requireFile);

function getFile(simpleStr:string){
	return "./serverless_files/"+simpleStr;
}
