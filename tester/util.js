const fs = require('fs-extra'),
  size = require('window-size'),
  path = require('path');
var config = require('./settings.json');
module.exports = {
  shuffle: shuffle,
  getFiles: getDisplayFiles,
  loadFiles: loadFiles,
  getFile: getFile,
  updateSettings: updateSettings,
  displayText: displayText,
  getFace: getFace,
  genMultiChoice: genMultiChoice,
  reverseIfNeeded: reverseIfNeeded,
};
function getFace(type) {
  var maddies = ["(๑•̀д•́๑)","(ʘ言ʘ╬)","(°言°怒)","щ(`Д´щ;)","＼`•̀益•́´／","ヽ(`д´；)/","(｀Д´) ","ヽ(*｀ﾟД´)ﾉ","(＃｀д´)ﾉ","(•ˋ _ ˊ•)","(　｀_ゝ´)","（￣^￣）凸","凸(ﾟДﾟ#)","(((p(>o<)q)))","¯\_(ツ)_/¯"];
  var happies = ["ᕕ( ᐛ )ᕗ","(*´－｀*)","┣¨ｷ(〃ﾟ3ﾟ〃)┣¨ｷ"," ٩( ᐛ )و","（˶′◡‵˶）","(♥_♥)","ヽ(*⌒∇⌒*)ﾉ","(*ﾉᐛ)ﾉ♫♩ヽ(ᐖヽ*)♬ヽ(*ᐛ)ﾉ","˙˚ʚ(´◡`)ɞ˚˙","ヾ(＠⌒ー⌒＠)ノ","＼（＾０＾）ノ","（＾O＾）","（＾－＾）","ｷﾀ━(ﾟ∀ﾟ)━!","ヽ(▽ ｀)ノﾜｰｲ♪ヽ(´▽｀)ノﾜｰｲ♪ヽ( ´▽)ノ","b(~_^)d","(b^_^)b","( ´ ▽ ` )b","(ﾉ´ヮ´)ﾉ*: ･ﾟ","o(〃＾▽＾〃)o","ヾ(＾-＾)ノ"];
  if (type === "mad") return maddies[Math.floor(Math.random() * maddies.length)];
  else return happies[Math.floor(Math.random() * happies.length)];
}
function displayText(text,prepend) {
  // we want to split by double tilde and create a horizontal rule for tilde dash
  if (~text.indexOf('~-')) {
		// we want to display the information in the same order, we can do this wrong
		let vals = text.split('~-');
		for(let i=0;i<vals.length;i++) {
			if (~vals[i].indexOf('~~')) {
				let moreSplits = vals[i].split('~~'); //console.log(config.personal.style.defaultIndent,(prepend: prepend ? ""),moreSplits[j]);
				for(let j=0;j<moreSplits.length;j++) console.log(config.personal.style.defaultIndent,(prepend ? prepend : ""),moreSplits[j]);
			}
			if ((i+1)<vals.length) console.log(config.personal.style.hr);
		}
	} else {
		// no hr, just split and display in order
		if (~text.indexOf('~~')) {
			let strings = text.split('~~');
			for(let i=0;i<strings.length;i++) console.log(config.personal.style.defaultIndent,(prepend ? prepend : ""),strings[i]);
		} else {
			console.log(config.personal.style.defaultIndent,(prepend ? prepend : ""),text);
		}
	}
}
function updateSettings() {
  throw Error('not implemented');
}

// TODO: just pass the entire answer object to this method
function genMultiChoice(correctArr,incorrectArr,cb) {
  let index=0,stringIndex=0,arrOfAnswerIndexes=['a','s','z','x','d','f','c','v'],data=[],correctAnswer;

  let maxStringLength = Math.floor(size.width / 2) - (6 + (index.toString().length));

  let useFirstAnswer=true;
  if (useFirstAnswer) data.push({ isCorrect: true, val: correctArr[0] });
  else data.push({ isCorrect: true, val: shuffle(correctArr)[0] });
  // add up to 3 incorrect options, shuffled
  incorrectArr = shuffle(incorrectArr);
  for (let i=0;i<incorrectArr.length;i++) {
    data.push({ isCorrect: false, val: incorrectArr[i] });
    if (i===2) break;
  }
  data = shuffle(data);
  ponder();
  function ponder() {
    if (data[index]) {
      //console.log(`rendering ${index} and ${index+1}`)
      createRow(index,index+1);
      if (data[index+2]) console.log('-'.repeat(size.width));
      index=index+2;
      ponder();
    } else {
      // job is done
      //console.log(`job done. ${index}`)
      console.log('='.repeat(size.width));
      cb(correctAnswer);
    }
  }

  function createRow(ai0,ai1) {
    // we have to render two answers at a time due to console.log
    let a0=[],a1=[];
    stringIndex=0;
    if (data[ai0]) {
      //split strings by tilde and shit
      let ds = splitStringForDisplay(data[ai0].val);
      for (let i=0;i<ds.length;i++) {
        let mls = splitStringToLength(ds[i],maxStringLength);
        for (let j=0;j<mls.length;j++) {a0.push(mls[j]); }
      }
      //a0=splitStringToLength(data[ai0].val,maxStringLength);
      if (data[ai0].isCorrect) { correctAnswer = arrOfAnswerIndexes[ai0]; }
    } else return; // no more data
    if (data[ai1]) {
      let ds = splitStringForDisplay(data[ai1].val);
      for (let i=0;i<ds.length;i++) {
        let mls = splitStringToLength(ds[i],maxStringLength);
        for (let j=0;j<mls.length;j++) a1.push(mls[j]);
      }
      //a1=splitStringToLength(data[ai1].val,maxStringLength);
      if (data[ai1].isCorrect) { correctAnswer = arrOfAnswerIndexes[ai1]; }
    }
    if (ai0 === 0) console.log('='.repeat(size.width));
    render();
    function render() {
      // alright lets create the row
      let firstRowSpent=false;
      let row="|";
      // we need to add the first array's data
      if (a0[stringIndex]) {
        if (stringIndex === 0) row+=` ${arrOfAnswerIndexes[ai0]}: ${a0[stringIndex]}`;
        else row+=`    ${a0[stringIndex]}`;
      } else {
        // this is the end or the road for the first answer
        firstRowSpent=true;
        //console.log('='.repeat(size.width));
        //return;
      }
      // add first answer filler
      if (row.length < (Math.floor(size.width / 2)-1) ) {
        // we need to add the difference
        let fillerAmount = (Math.floor(size.width / 2)-1) - row.length;
        //console.log(`adding ${fillerAmount} to the first answer option`)
        row+=" ".repeat(fillerAmount);
      }

      row+="|";
      // lets add the last part if it exists
      if (a1[stringIndex]) {
        if (stringIndex === 0) row+=` ${arrOfAnswerIndexes[ai1]}: ${a1[stringIndex]}`;
        else row+=`    ${a1[stringIndex]}`;

      } else {
        if (firstRowSpent) {
          // both are empty, kill
          //console.log('='.repeat(size.width));
          return;
        }
      }
      // add second answer filler
      if (row.length < (size.width-1)) {
        // add filler again
        let fillerAmount = (size.width-1) - row.length;
        //console.log(`adding ${fillerAmount} to the last answer option`)
        row+=" ".repeat(fillerAmount);
      }

      // holy shit it might be time to render this thing!
      row+="|";
      //console.log(`Row length::: ${row.length}`)
      //console.log('='.repeat(size.width));
      console.log(row);
      // lets increate the stringIndex and call ourselves
      stringIndex++;
      render();
    }
  }
}

function getFile(path,cb) {
  fs.readJson(path,(err,test)=>{
    if(err) cb(err);
    else cb(null,test);
  });
}
function loadFiles(filePaths,cb) {
  let concat = {label: "Multiple",data: []};
  if (filePaths.length === 1){
    getFile(filePaths[0],(err,test)=>{
      if (err) cb(err);
      else {
        cb(null,test);
      }
    });
  } else if (filePaths.length > 1) {
    get(0);
  } else {
    cb(new Error("loadFiles requires an array of paths"));
  }

  function get(index) {
    if (index < filePaths.length) {
      getFile(filePaths[index],(err,file)=>{
        if (err) cb(err);
        else {
          for(let i=0;i<file.data.length;i++) concat.data.push(file.data[i]);
          get(index+1);
        }
      });
    } else {
      cb(null,concat);
    }
  }
}

function getDisplayFiles(cb) {
  // get test files for each path specified
  // only take the label and the path to be nice to our memory
  get(0);
  var tests = [];
  var errors = [];
  var labels = [];
  function get(index) {
    if (index < config.main.suitePaths.length) {

      getFileDescriptions(config.main.suitePaths[index],(err,files)=>{
        if (err) {
          //cb(err);
          // we probably have all kinds of fucked up paths specified in the array, dont want to kill
          // process when encountering one of them
          errors.push(err);
        } else {
          /*
          // this was an attempt to not use anonymous objects
          let arr = [];
          for (let i=0;i<files.length;i++) {
            let obj = new Object();
            obj[i.toString()] = files[i];
            arr.push(obj);
          }
          cb(null,arr);*/
          //console.log(`fount ${files.length} files in ${config.main.suitePaths[index]}`)
          for (let i=0;i<files.length;i++) {
            if (!config.main.useComplexMediaTests) {
              // remove all tests that use complex media(html, maybe video/audio) if desired
              // only checking for html at the moment
              if (~files[i].mediaTypes.indexOf("html")) {
                if (~config.main.allowedComplexTests.indexOf(files[i].label)) {
                  if (!~labels.indexOf(files[i].label)) { tests.push(files[i]);labels.push(files[i].label); }
                }
              } else {
                if (!~labels.indexOf(files[i].label)) { tests.push(files[i]);labels.push(files[i].label); }
              }
            } else {
              if (!~labels.indexOf(files[i].label)) { tests.push(files[i]);labels.push(files[i].label); }
            }
          }
        }
        get(index+1);
      });
    } else {
      if (errors.length > 0 && tests.length === 0) cb(errors);
      else cb(null,tests);
    }
  }
}
function buildFileArray(cb) {
  getFileDescriptions(config.main.suitePath,(err,files)=>{
    if (err) cb(err);
    else {
      /*
      // this was an attempt to not use anonymous objects
      let arr = [];
      for (let i=0;i<files.length;i++) {
        let obj = new Object();
        obj[i.toString()] = files[i];
        arr.push(obj);
      }
      cb(null,arr);*/
      // remove all tests that use complex media(html, maybe video/audio) if desired
      if (!config.main.useComplexMediaTests) {
        var arr = [];
        for (let i=0;i<files.length;i++) {
          // only checking for html at the moment
          if (~files[i].mediaTypes.indexOf("html")) {
            if (~config.main.allowedComplexTests.indexOf(files[i].label)) arr.push(files[i]);
          } else {
            arr.push(files[i]);
          }
        }
        cb(null,arr);
      } else {
        cb(null,files);
      }
    }
  });
}
function getFileDescriptions(rootPath, cb) {

  getFilePaths(rootPath,(err,items)=>{
    if (err) {
      cb(err);
    } else {
      // get the title and descriptions of all the files
      getFileInformation(items, (err, files)=>{
        if (err) {
          cb(err);
        } else {
          cb(null,files);
        }
      })
    }
  })
}
function getFileInformation(paths, cb) {
  let files = [];
  get(0);
  function get(index) {
    if (index < paths.length) {

      let itemPath = path.parse(paths[index]);
      if (itemPath.ext.length > 0 && itemPath.ext.toLowerCase() === '.json') {
        // object is a json file
        fs.readJson(paths[index], (err,data)=>{
          if (err) {
            /*files.push({
              label: `Error!! (Untested dood;TODO: test this!)`,
              description: `Error reading file ${itemPath.base} located in ${itemPath.dir}. The json is probably invalid.`,
              fileName: itemPath.base,
              filePath: ""
            });*/
            console.log(`Error reading ${paths[index]}, invalid json`);
            get(index+1);
          } else {
            files.push({
              label: data.label ? data.label : `file ${index+1}`,
              mediaTypes: data.mediaTypes,
              filePath: paths[index]
            });
            get(index+1);
          }
        })
      } else {
        get(index+1);
      }

    } else {
      cb(null,files);
    }
  }
}
function getFilePaths(dir, cb) {
  let paths = []
  fs.stat(dir, (err, stats) => {
    if (err) cb(err);
    else {
      // walk directory
      fs.walk(dir)
        .on('data', (item)=> {
          // ensure the item is an file not a directory
          paths.push(item.path);
        })
        .on('end', function() {
          cb(null,paths);
        })
    }
  })
}

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function splitStringForDisplay(text) {
  // sigh, have to duplicate code, basically
  let strings=[];
  if (~text.indexOf('~-')) {
		// we want to display the information in the same order, we can do this wrong
		let vals = text.split('~-');
		for(let i=0;i<vals.length;i++) {
			if (~vals[i].indexOf('~~')) {
				let moreSplits = vals[i].split('~~'); //console.log(config.personal.style.defaultIndent,(prepend: prepend ? ""),moreSplits[j]);
				for(let j=0;j<moreSplits.length;j++) strings.push(moreSplits[j]);
			} else {
        strings.push(vals[i]);
      }
		}
	} else {
		// no hr, just split and display in order
		if (~text.indexOf('~~')) {
			let vals = text.split('~~');
			for(let i=0;i<vals.length;i++) strings.push(vals[i]);
		} else {
			strings.push(text);
		}
	}
  return strings;
}
function splitStringToLength(string, maxStringLength) {
  let strings=[];
  if (string.length < maxStringLength) {
    strings.push(string);
    return strings;
  } else {
    chop(string);
    return strings;
  }
  function chop(piece) {
    strings.push(piece.substr(0, maxStringLength))
    let rest = piece.substr(maxStringLength, piece.length);
    if (rest.length > maxStringLength) {
      chop(rest);
    } else {
      strings.push(rest);
      return;
    }
  }
}
function reverseIfNeeded(args, suite) {
  // TODO: check versions
  console.log(`suite: ${JSON.stringify(suite)}`);
  if (~args.indexOf('r')) {
    console.log('got its')
  }
  process.exit(0);
  return suite;
}
