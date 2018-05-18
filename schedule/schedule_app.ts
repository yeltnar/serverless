
//console.log(process.argv);

//const scheduleObj = require('schedule/schedule.json');
const fs = require('fs')
const schedule = require('node-schedule');

let scheduleObj = JSON.parse(fs.readFileSync('schedule/schedule.json').toString());

//console.log(scheduleObj);
let runShell;

function loadScheduledItems(){
	for(let k in scheduleObj){
		try{
			let {command,rule,params,name,options} = scheduleObj[k];
			scheduleObj[k].job=schedule.scheduleJob(rule, async ()=>{
				console.log("running `"+name+"`");
				let result;
				try{
					result = await runShell(command,options,params);
				}catch(e){console.error("schedule app 21");console.error(e);}
				console.log("`"+name +"` result...");
				console.log(result);
				console.log("`"+name+"` next invocation - "+scheduleObj[k].job.nextInvocation());
			});
			console.log("`"+name+"` next invocation - "+scheduleObj[k].job.nextInvocation());
		}catch(e){console.error("schedule 25");console.error(e);}
	}
}

export function scheduleInit(params){
	runShell = params.runShell;
	loadScheduledItems();
};