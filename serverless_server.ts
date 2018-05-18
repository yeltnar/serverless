const express = require("express");
const bodyParse = require("body-parser");
const fs = require("fs");
//const method_override = require("method_override");
const config = require("config");
const {exec, execFile} = require("child_process");
const requiredFiles = {};
const requestP = require('request-promise-native');
import {scheduleInit} from './schedule/schedule_app';
scheduleInit({runShell});

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

let tsExecuteFileUri = "/tsExecFile";
async function tsExecFileEndpoint(req, res, next){
	let fileName = req.body.file || req.query.file;
	let options = req.body.options || req.query.options || null;
	let file = getFile(fileName);

	let params = req.query || {};
	for( let k in req.body  ){
		params[k]=req.body[k];
	}

	params = JSON.stringify(JSON.stringify(params));


	let msg
	console.log(";;;;;;;;;;;;;;;;;;;;;");
	try{
		msg = await executeFile(file, options, params);
	}catch(e){
		console.error("serverless_server 56");
		console.error(e);
		msg=e.toString();
	}
	console.log("]]]]]]]]]]]]]]]]]]]]]");

	res.end(msg);
	next();

}

let runShellUri = "/runShell";
async function runShellEndpoint(req, res, next){
	let toExec = req.body.toExec || req.query.toExec;
	let options = req.body.options || req.query.options || null;

	let params = req.query || {};
	for( let k in req.body  ){
		params[k]=req.body[k];
	}

	params = JSON.stringify(JSON.stringify(params));

	let msg
	try{
		msg = await runShell(toExec, options);
	}catch(e){
		console.error("serverless_server 89");
		console.error(e);
		msg=e.toString();
	}

	res.end(msg);
	next();

}

async function executeFile(file, options, params){

	if(typeof params === 'object'){
		params = JSON.stringify(JSON.stringify(params));
	}

	let toExec = "ts-node "+file+" "+params;

	return runShell(toExec,options);
	

}

function runShell(toExec, options){
	return new Promise((resolve, reject)=>{

		exec(toExec, options, (err, stdout, stderr)=>{
			if(err){
				console.error("run shell err");
				reject(err);
			}if(stderr){
				console.error("run shell stderr");
				reject(stderr);
			}else{
				resolve(stdout);
			}
		});
	});
}

app.get(tsExecuteFileUri, tsExecFileEndpoint);
app.post(tsExecuteFileUri, tsExecFileEndpoint);
app.get(runShellUri, runShellEndpoint);
app.post(runShellUri, runShellEndpoint);
// app.get("/requireFile/:fileName", requireFile);
// app.post("/requireFile/:fileName", requireFile);

function getFile(simpleStr:string){
	if(simpleStr===undefined||simpleStr===null){
		return undefined;
	}
	return "./serverless_files/"+simpleStr;
}
	