const requestP = require('request-promise-native');
const config = require('config');
import { helpersInit } from '../../helpers/helper.ts';

let helpers = helpersInit();

const { search_url, set_wallpaper_url, default_wallpaper, used_wallpaper_file } = config;

(async() => {

    try{
        let walpaper_info = await getPhoneWallpaper();
        setPhoneWallpaper(walpaper_info);
    }catch(e){
        console.error(e);
    }

})()

async function setPhoneWallpaper(walpaper_info) {
    let {wallpaper_url, used_wallpaper} = walpaper_info;
    console.log("setting walpaper to " + wallpaper_url);
    
    let options = {
        "url":set_wallpaper_url,
        "method": "post",
        "body": {
            "value1":wallpaper_url
        },
        "json":true
    };
    await requestP(options);
    used_wallpaper.push(wallpaper_url);
    used_wallpaper=used_wallpaper.slice(-10);
    helpers.fsPromise.writeFile(used_wallpaper_file, JSON.stringify(used_wallpaper));
}

async function getPhoneWallpaper() {

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