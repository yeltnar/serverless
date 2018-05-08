if( process.argv[2] === undefined ){
	console.log("no args found");
}else{
	let data
	try{
		data = JSON.parse(process.argv[2]||"{}")
	}catch(e){
		console.log(e);
	}
	console.log(data)
}

