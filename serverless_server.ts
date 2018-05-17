const express = require("express");
const bodyParse = require("body-parser");
const fs = require("fs");
//const method_override = require("method_override");
const config = require("config");
const {exec, execFile} = require("child_process");
const requiredFiles = {};
const requestP = require('request-promise-native');
import {scheduleInit} from './schedule/schedule';
scheduleInit({executeFile});

let fileMap = {
	"t.js":"t123.js"
};

const app = new express();

app.use(bodyParse.urlencoded({extended:true}));
app.use(bodyParse.json());

let port = config.express.port;
app.listen(port, () => console.log('Serverless server is listening on port '+port+'!'));	

let createFileUri = "/createFile";
app.post(createFileUri, (req, res, next)=>{
	const fileContents = req.body.fileContents;
	let fileName = getFile(req.body.file || req.query.file);
	if(fileName===undefined){
		res.status(404).send("no file name provided");
		console.error("28 no file name provided");
		return 
	}

	console.log("wrting "+fileName);
	fs.writeFileSync(fileName, fileContents);
	res.end(fileName);

	next();
});

let executeFileUri = "/execFile";
async function execFileEndpoint(req, res, next){
	let fileName = req.body.file || req.query.file;
	let options = req.body.options || req.query.options || null;
	let file = getFile(fileName);

	let params = req.query || {};
	for( let k in req.body  ){
		params[k]=req.body[k];
	}

	params = JSON.stringify(JSON.stringify(params));

	let stdout = await executeFile(file, options, params).then();

	res.end(stdout);
	next();

}

function executeFile(file, options, params){

	return new Promise((resolve, reject)=>{

		if(typeof params === 'object'){
			params = JSON.stringify(JSON.stringify(params));
		}

		let toExec = "ts-node "+file+" "+params;
		//console.log("toExec "+toExec);

		exec(toExec, options, (err, stdout, stderr)=>{
			if(err){
				reject(err);
			}if(stderr){
				reject(stderr);
			}else{
				resolve(stdout);
			}
		});
	})

}

app.get(executeFileUri, execFileEndpoint);
app.post(executeFileUri, execFileEndpoint);
// app.get("/requireFile/:fileName", requireFile);
// app.post("/requireFile/:fileName", requireFile);

function getFile(simpleStr:string){
	if(simpleStr===undefined||simpleStr===null){
		return undefined;
	}
	return "./serverless_files/"+simpleStr;
}
	