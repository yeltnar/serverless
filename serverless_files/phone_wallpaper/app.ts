let args = process.argv;
args.shift();
args.shift();

const requestP = require('request-promise-native');
const config = require('config');
import { helpersInit } from '../../helpers/helper.ts';

let helpers = helpersInit();

const { search_url, set_wallpaper_url, default_wallpaper, used_wallpaper_file } = config;

// async to allow for await within the function 
(async()=>{

    args = JSON.parse(args[0]||"{}");

    if( (args.preSelected===true||args.preSelected==="true") && args.imgUrl!==undefined){
        
        console.log("using preselected: "+args.imgUrl);
        try{
            setPhoneWallpaper({"wallpaper_url":args.imgUrl});
        }catch(e){
            console.error(e);
        }
    }else if( (args.newWallpaper===true||args.newWallpaper==="true") ){
        
        console.log("setting new wallpaper");
        try{
            let walpaper_info = await getNewPhoneWallpaper()
            setPhoneWallpaper(walpaper_info);
        }catch(e){
            console.error(e);
        }
    }else{
        
           console.log("running top wallpaper");
        try{
            let walpaper_info = await getPhoneWallpaper();
            setPhoneWallpaper(walpaper_info);
        }catch(e){
            console.error(e);
        }
    }

})()

async function setPhoneWallpaper(walpaper_info) {

    let {wallpaper_url, used_wallpaper} = walpaper_info;

    if(used_wallpaper===undefined){
        try{
            used_wallpaper = await helpers.fsPromise.readFile(used_wallpaper_file);
            used_wallpaper = JSON.parse(used_wallpaper);
        }catch(e){
            used_wallpaper=[];
        }
    }

    if(wallpaper_url!==undefined){
        console.log("setting walpaper to " + wallpaper_url);
        
        let options = {
            "url":set_wallpaper_url,
            "method": "post",
            "body": {
                "value1":wallpaper_url,
                "value2":"Device: "+config.deviceName
            },
            "json":true
        };
        await requestP(options);
        used_wallpaper.push(wallpaper_url);
        used_wallpaper=used_wallpaper.slice(-10);
        helpers.fsPromise.writeFile(used_wallpaper_file, JSON.stringify(used_wallpaper));
    }else{
        console.log("not setting walpaper to " + wallpaper_url);
    }
}

async function getPhoneWallpaper() {

    let wallpaper_url="";
    let used_wallpaper=[];

    try {
        let options = {
            "url": search_url
        }

        used_wallpaper = await helpers.fsPromise.readFile(used_wallpaper_file);
        used_wallpaper = JSON.parse(used_wallpaper);

        let search_result = await requestP(options)
        search_result = JSON.parse(search_result);
        search_result = search_result.data.children;
        search_result = search_result.map((ele) => {
            return ele.data.url;
        });

        if( used_wallpaper.indexOf(search_result[0])<0 ){
            wallpaper_url = search_result[0]; // did this to only send top result
        }else{
            wallpaper_url = undefined;
        }


        // let walpaper_to_set = search_result.reduce((acc, cur) => {
        //     if (acc === undefined && used_wallpaper.indexOf(cur)<0) {
        //         acc = cur;
        //     }
        //     return acc;
        // }, undefined);

        // wallpaper_url = walpaper_to_set || default_wallpaper;

    } catch (e) {
        console.error(e)
    }
    return {wallpaper_url,used_wallpaper};
}

async function getNewPhoneWallpaper() {

    let wallpaper_url="";
    let used_wallpaper=[];

    try {
        let options = {
            "url": search_url
        }

        let search_result = await requestP(options)
        search_result = JSON.parse(search_result);
        search_result = search_result.data.children;
        search_result = search_result.map((ele) => {
            return ele.data.url;
        });

        used_wallpaper = await helpers.fsPromise.readFile(used_wallpaper_file);
        used_wallpaper = JSON.parse(used_wallpaper);

        let walpaper_to_set = search_result.reduce((acc, cur) => {
            if (acc === undefined && used_wallpaper.indexOf(cur)<0) {
                acc = cur;
            }
            return acc;
        }, undefined);

        wallpaper_url = walpaper_to_set || default_wallpaper;

    } catch (e) {
        console.error(e)
    }
    return {wallpaper_url,used_wallpaper};
}