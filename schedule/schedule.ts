
//console.log(process.argv);

//const scheduleObj = require('schedule/schedule.json');
const fs = require('fs')
const schedule = require('node-schedule');

let scheduleObj = JSON.parse(fs.readFileSync('schedule/schedule.json').toString());

//console.log(scheduleObj);
let executeFile;

function loadScheduledItems(){
	for(let k in scheduleObj){
		let {file_location,rule,params,name} = scheduleObj[k];
		scheduleObj[k].job=schedule.scheduleJob(rule, async ()=>{
			console.log("running `"+name+"`");
			let result = await executeFile(file_location,params);
			console.log("`"+name +"` result...");
			console.log(result);
		console.log("`"+name+"` next invocation - "+scheduleObj[k].job.nextInvocation());
		});
		console.log("`"+name+"` next invocation - "+scheduleObj[k].job.nextInvocation());
	}
}

export function scheduleInit(params){
	executeFile = params.executeFile;
	loadScheduledItems();
};