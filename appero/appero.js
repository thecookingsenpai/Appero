const fse = require('fs-extra');
var request = require("request");
const decompress = require("decompress");
const prompt = require("prompt-sync")({ sigint: true });

var url = prompt("URL: ");
var name = prompt("Name: ");

decompress("baseapp.zip", "./")
  .then(() => {
    main();
  })

function main() {

    // Arguments parsing
        console.log(url)
        // Safety check
        if(!url) {
            console.error('No URL specified');
            process.exit(1);
        } else if ( (!url.startsWith('http://')) && (!url.startsWith('https://')) ) {
            console.error('URL must start with http:// or https://');
            process.exit(1);
        } 
        // Trying to get favicon
        try {
            var stream = request(url + "/favicon.ico").pipe(fse.createWriteStream('favicon.ico'))
            stream.on('finish', function () { 
                if (fse.existsSync("favicon.ico")) {
                    finalWrap(true)
                }
            })
        } catch (err) {
            console.log("No favicon")
            finalWrap(false)
        }
        

}


function finalWrap(fav) {
    // Wrapping with random id
    var folder_name
    if (name==="") {
        var rid = Math.floor(Math.random() * 8192);
        folder_name = "./apps/app_" + rid
    } else {
        folder_name = name;
    }
    fse.copySync("./baseapp.app", folder_name)
    // Writing location
    fse.writeFileSync(folder_name + "/Contents/MacOS/location.config", url, "utf8")
    // Changing name
    var plist = fse.readFileSync(folder_name + "/Contents/Info.plist", "utf8")
    var newPlist = plist.replace("Appero Native App", folder_name)
    fse.writeFileSync(folder_name + "/Contents/Info.plist", newPlist, "utf8")
    // Icon
    if (fav) {
        fse.removeSync(folder_name + "/Contents/Resources/electron.icns")
        fse.moveSync("favicon.ico", folder_name + "/Contents/Resources/electron.icns")
    }
    // Packing
    fse.moveSync(folder_name, folder_name + ".app")
    fse.removeSync("baseapp.app")
    console.log('Done');
}