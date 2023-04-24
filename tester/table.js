const c = require('chalk'),
  size = require('window-size'),
  readline = require('readline'),
  curPos = require('get-cursor-position');


function test1(table) {
  var artificialWindowSize = 80;
  var plate = '='.repeat(artificialWindowSize);
  var header = "";
  var rows = [];
  var floor = Math.floor(artificialWindowSize / table.headers.length);
  var ceil = Math.ceil(artificialWindowSize / table.headers.length);

  var colSizes=[];
  // if floor and ceil dont match, add remaining to last column
  for (let i=0;i<table.headers.length;i++) {
    if ((i+1)===table.headers.length && (floor !== ceil)) {
      colSizes.push(floor+(ceil-floor))
    } else {
      colSizes.push(floor);
    }
  }
  //console.log(colSizes);
  // how about create the header strings
  for (let i=0;i<colSizes.length;i++) {
    var col = "|";
    var leftSide = (colSizes[i] - table.headers[i].length)/2;
    var rightSide = (colSizes[i] - table.headers[i].length)/2;
    col += " ".repeat(leftSide);
    col += table.headers[i];
    col += " ".repeat(rightSide);
    if ((i+1) === colSizes.length) {
      // we are on the last row
      col += "|";
    }

    header += col;
  }
  console.log(header + ", l: "+header.length);

  // i guess build all rows now? the header is decent
  processArrayOfArrays(0);
  function processArrayOfArrays(index) {
    if (index < table.rows.length) {
      processArrayOfStrings(table.rows[index],(err,anotherArr)=>{
        if (err) throw err;
        else {
          if (anotherArr) processArrayOfStrings(anotherArr);
          else {
            processArrayOfArrays(index+1);
          }
        }
      })
    } else {

    }
  }

  function processArrayOfStrings(arrOfStrings) {
    var leftOvers;
    for (let i=0;i<colSizes.length;i++) {
      // check if current string is longer than the max column size
      var val;
      if (arrOfStrings[i].length > colSizes[i]) {
        // we need to prune
        var strings = splitStringToLength(arrOfStrings[i], colSizes[i]);
        val = strings[0];
        //for (var i = count - 1; i >= 0; i--) {}
        if (!leftOvers) {
          leftOvers=[];
          for (let j=0;j<i;j++) {
            if ((j+1)===i) leftOvers.push(string)
            leftOvers.push("");
          }
        }
      }
    }
  }
}



test1({
  "headers": [
    "English",
    "Arabic Origin",
    "Arabic Meaning"
  ],
  "rows": [
    ["admiral","amir al-baHr","Ruler of the Sea"],
    ["alcohol","al-kuHul","a mixture of powdered antimony"],
    ["alcove","al-qubba","a dome or arch"],
    ["algebra","al-jabr","to reduce or consolidate"],
    ["almanac","al-manakh","a calendar"],
    ["arsenal","daar As-SinaaH","house of manufacture"],
    ["azure","al-azward","lapis lazuli"],
    ["candy","qand","cane sugar"],
    ["coffee","qahwa","coffee"],
    ["cotton","quTun","cotton"],
    ["elixer","al-iksiir","philosopher's stone"],
    ["","",""]
  ]
});

function splitStringToLength(string, maxStringLength) {
  let strings=[];
  if (string.lenth < maxStringLength) {
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
