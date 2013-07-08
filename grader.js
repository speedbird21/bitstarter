#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var checksFile = "";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    parseFile(cheerio.load(fs.readFileSync(htmlfile)));
};

var cheerioResponse = function(html) {
    parseFile(cheerio.load(html));
};

var loadUrl = function(url) {
    rest.get(url).on('complete', cheerioResponse);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var parseFile = function($)
{
    var checks = loadChecks(checksFile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    var out = JSON.stringify(out, null, 4)
    fs.writeFileSync("checks.txt", out);
    console.log(out);
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
 
   return fn.bind({});
};

var runChecks = function(htmlFile, url, checks) {
    
    if(url != null){
	console.log("Processing url");
	loadUrl(url);
    }
    else {
	console.log("Processing file");
	cheerioHtmlFile(htmlFile);
    }
};

if(require.main == module) {
    
    console.log("Running at command line! args : %j", process.argv);
    var args = process.argv;
    if(args.length < 2) {
	console.log("Incorrect number of arguments");
	return;
    }

    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'url')
        .parse(process.argv);

    if(program.checks) console.log("Checks file :" + program.checks);
    if(program.file) console.log("File to be processed : " + program.file);
    if(program.url) console.log("Url : %s", program.url);

    checksFile = program.checks;
    runChecks(program.file, program.url, program.checks)
    
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
