const readline = require('readline'),
  c = require('chalk'),
  util = require('./util.js'),
  size = require('window-size');
  /*rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'yo> '
  });*/
//rl.prompt();

//console.log("0123456789".substr(0, 21))
spliceTestSuite(0, 4, new Array(10))
function spliceTestSuite(chunk, size, arr) {
  
}

//genMultiChoice();
/*
  lets say the max width = 100
  each cell can only be 50 max
    the "| " takes two spots.
    the index "0. " takes 3 spots.

    We have 5 length removed for a fact. the index could take more but that'll never happen

    We need to log the potential answer inside this 45 character location.
    If the answer exceeds 45 characters, we need to log it on the next line.

*/
/*genMultiChoice([
    "2",
    "two"
],
[
  "butt","45","gibble","1","infinity","0","dog"
],(answer)=>{
  console.log(`correct answer is ${answer}`)
});*/


// what we'll actually use
function genMultiChoice(correctArr,incorrectArr,cb) {
  let index=0,stringIndex=0,arrOfAnswerIndexes=['a','s','z','x','d','f','c','v'],data=[],correctAnswer;
  console.log(`window width: ${size.width}`);
  let maxStringLength = Math.floor(size.width / 2) - (6 + (index.toString().length));
  console.log(`max character length is ${maxStringLength}`);
  let useFirstAnswer=false;
  if (useFirstAnswer) data.push({ isCorrect: true, val: correctArr[0] });
  else data.push({ isCorrect: true, val: util.shuffle(correctArr)[0] });
  // add up to 3 incorrect options, shuffled
  incorrectArr = util.shuffle(incorrectArr);
  for (let i=0;i<incorrectArr.length;i++) {
    data.push({ isCorrect: false, val: incorrectArr[i] });
    if (i===2) break;
  }
  data = util.shuffle(data);
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
    var a0,a1;
    stringIndex=0;
    if (data[ai0]) {
      a0=splitStringToLength(data[ai0].val,maxStringLength);
      if (data[ai0].isCorrect) { correctAnswer = arrOfAnswerIndexes[ai0]; }
    } else return; // no more data
    if (data[ai1]) {
      a1=splitStringToLength(data[ai1].val,maxStringLength);
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
        else row+=`   ${a0[stringIndex]}`;
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

/*genMultiChoice([
  {
    val: "The answer to PI is 33.89, due to irregularities in space time"
  },
  {
    val: "Only if you really want to. The banana is a hell of a thing. sdfsdf sdfsdfsd dfsdfsd sdfsdf ssdfsd f",
    correct: true
  },
  {
    val: "Well if the shoe fits."
  },
  {
    val: "Banana butter roller calls"
  }
]);*/
// the function accepts an array of objects with a property named val and correct boolean
function genMultiChoiceExample2(data) {
  // works great, just need to render last row
  let index=0,stringIndex=0,arrOfAnswerIndexes=['a','s','z','x','d','f','c','v'];
  console.log(`window width: ${size.width}`);
  let maxStringLength = Math.floor(size.width / 2) - (6 + (index.toString().length));
  console.log(`max character length is ${maxStringLength}`);

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
    }
  }

  function createRow(ai0,ai1) {
    // we have to render two answers at a time due to console.log
    var a0,a1;
    stringIndex=0;
    if (data[ai0]) a0=splitStringToLength(data[ai0].val,maxStringLength);
    else return; // no more data
    if (data[ai1]) a1=splitStringToLength(data[ai1].val,maxStringLength);
    if (ai0 === 0) console.log('='.repeat(size.width));
    render();
    function render() {
      // alright lets create the row
      let firstRowSpent=false;
      let row="|";
      // we need to add the first array's data
      if (a0[stringIndex]) {
        if (stringIndex === 0) row+=` ${arrOfAnswerIndexes[ai0]}: ${a0[stringIndex]}`;
        else row+=`   ${a0[stringIndex]}`;
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


function genMultiChoiceExample1(data) {
  // works great, just need to render last row
  let index=0,answerIndex=0,stringIndex=0;
  console.log(`window width: ${size.width}`);
  let maxStringLength = Math.floor(size.width / 2) - (6 + (index.toString().length));
  console.log(`max character length is ${maxStringLength}`)
  createRow(0,1);
  function createRow(ai0,ai1) {
    // we have to render two answers at a time due to console.log
    var a0,a1;
    if (data[index]) a0=splitStringToLength(data[index].val,maxStringLength);
    else return; // no more data
    if (data[index+1]) a1=splitStringToLength(data[index+1].val,maxStringLength);
    index = index+2;
    console.log('='.repeat(size.width));
    render();
    function render() {
      // alright lets create the row
      let firstRowSpent=false;
      let row="|";
      // we need to add the first array's data
      if (a0[stringIndex]) {
        if (stringIndex === 0) row+=` ${ai0}: ${a0[stringIndex]}`;
        else row+=`   ${a0[stringIndex]}`;
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
        if (stringIndex === 0) row+=` ${ai1}: ${a1[stringIndex]}`;
        else row+=`    ${a1[stringIndex]}`;

      } else {
        if (firstRowSpent) {
          // both are empty, kill
          console.log('='.repeat(size.width));
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

function genMultiChoiceExample0(data) {
  let index=0,answerIndex=0,stringIndex=0;
  console.log(`window width: ${size.width}`);
  let maxStringLength = Math.floor(size.width / 2) - (6 + (index.toString().length));
  console.log(`max character length is ${maxStringLength}`)
  createRow();
  function createRow() {
    // we have to render two answers at a time due to console.log
    var s0,s1,a0,a1;
    if (data[index]) a0=splitStringToLength(data[index].val,maxStringLength);
    else return; // no more data
    if (data[index+1]) a1=splitStringToLength(data[index+1].val,maxStringLength);
    index = index+2;

    // alright lets create the row
    let row = `| ${answerIndex}: `;
    // we need to add the first array's data
    row += a0[stringIndex];
    if (row.length < (Math.floor(size.width / 2)-1) ) {
      // we need to add the difference
      let fillerAmount = (Math.floor(size.width / 2)-1) - row.length;
      console.log(`adding ${fillerAmount} to the first answer option`)
      row+=" ".repeat(fillerAmount);
    }
    row+="|";
    answerIndex++;
    // lets add the last part if it exists
    if (a1[stringIndex]) {
      row+=` ${answerIndex}: ${a1[stringIndex]}`;
      if (row.length < (size.width-1)) {
        // add filler again
        let fillerAmount = (size.width-1) - row.length;
        console.log(`adding ${fillerAmount} to the last answer option`)
        row+=" ".repeat(fillerAmount);
      }

    }
    // holy shit it might be time to render this thing!
    row+="|";
    console.log(`Row length::: ${row.length}`)
    console.log('='.repeat(size.width));
    console.log(row);
    console.log('='.repeat(size.width));
  }

}

//let strArr = splitStringToLength("This is going to be a long sentence with lotso stuff in it.",10);
//console.log(`FINAL: arr count: ${strArr.length} vals: ${JSON.stringify(strArr)}`);

function splitStringToLength(string, maxStringLength) {
  let strings=[];
  if (string.lenth > maxStringLength) {
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

function genMultiChoiceOld() {
  let index=0;
	console.log(`window width: ${size.width}`);
	console.log('_'.repeat(size.width));
	console.log(Math.floor(size.width / 2));
  // lets create a 2 X 2 grid
  createRow(0,
      "The square root of PI is 32348343.546464",
      "The monkey and the chicken crossed the road to get to the other side");

  function createRow(index,s0,s1) {
    let maxCharLength = Math.floor(size.width / 2) - 4 - (index.toString().length);
    console.log(`max character length is ${maxCharLength}`)
    console.log('='.repeat(size.width));
    // creating first cell
    let cell1StrArr = splitStringToLength(string, maxCharLength);
    for (let i=0;i<cell1StrArr.length;i++) {
      if (i===0) console.log(`| ${index}. ${cell1StrArr[i]}`)
      else {
        let filler = ' '.repeat(index.toString().length+2)
        console.log(`| ${filler}${cell1StrArr[i]}`)
      }
    }
  }
}
function splitStringToLengthOld(string, maxStringLength) {
  /*
    we pass in a string and a max string length
    If the string parameter exceeds the max length, cut it at the max, push that
    portion into the array, rinse repeat
  */
  let strings =[];
  if (string.length > maxStringLength) {
    // start the dicing process
    let currentString = string.substr(0, maxStringLength);
    console.log(`Current cut stting is '${currentString}'. we still need the rest`)
    let restOfString = string.substr(maxStringLength, string.length);
    console.log(`Rest of string is '${restOfString}'. Probably need to cut it some more`)

  } else strings.push(string);
  return strings;

}

//getPercentage();
function getPercentage() {
  let passed = 10,failed = 10;
  console.log((passed / (passed+failed)) * 100);
  console.log(parseFloat((111 / 200) * 100).toFixed(0));
}



function createQuestionGrid() {

}


/*
	string - This is a bunch of info~~This will be on a new line~-This will be below a horizontal rule~~another break for some reason

	after hr split
		This is a bunch of info~~This will be on a new line
		This will be below a horizontal rule~~another break for some reason

		,"input"
		, "alts": [""]

{
  "label": "Title",
  "groups": ["group1","grou2"],
  "mediaTypes": ["text"],
  "testType": "test",
  "version": {
    "content": 1,
    "schema": 1
  },
  "description": "description",
  "data": [
    {
      "types": ["flashcard"],
      "question": { "type": "text", "val": "question" },
      "answer": { "type": "text", "val": ["answer"] }
    },
    {
      "types": ["flashcard"],
      "question": { "type": "text", "val": "question" },
      "answer": { "type": "text", "val": ["answer"] }
    }
  ]
}
{
  "label": "Title",
  "groups": ["group1","grou2"],
  "mediaTypes": ["text"],
  "testType": "test",
  "version": {
    "content": 1,
    "schema": 1
  },
  "description": "description",
  "data": [
    {
      "types": ["flashcard","input"],
      "question": { "type": "text", "val": "question" },
      "answer": { "type": "text", "val": ["answer"] }
    },
    {
      "types": ["flashcard","input"],
      "question": { "type": "text", "val": "question" },
      "answer": { "type": "text", "val": ["answer"] }
    }
  ]
}
{
  "label": "Title",
  "groups": ["group1","grou2"],
  "mediaTypes": ["text"],
  "testType": "test",
  "version": {
    "content": 1,
    "schema": 1
  },
  "description": "description",
  "data": [
    {
      "types": ["flashcard","input","multi"],
      "question": { "type": "text", "val": "question" },
      "answer": {
        "type": "text",
        "val": ["answer"],
        "wrongChoices": ["choice1","choice2","choice3","choice4","choice5","choice6"],
        "limit": 3 // we can display up to 8 options (7 wrong choices). Incorrect options are shuffled in randomly,
        "useFirstAnswer": true
      }
    },
    {
      "types": ["flashcard","input","multi"],
      "question": { "type": "text", "val": "question" },
      "answer": {
        "type": "text",
        "val": ["answer1","answer2","answer3"],
        "wrongChoices": ["choice1","choice2","choice3","choice4"],
        limit: 1, // i guess users can have a 2 question multiple choice
        "useFirstAnswer": false // we can randomly select the answer to display
      }
    }
  ]
}

// we will support tests that have no answer, for people who stupidly want
// rotating info. This is basically a text/html video but whatever. shouldnt be hard to include
{
  "label": "Title",
  "groups": ["group1","grou2"],
  "mediaTypes": ["text"],
  "testType": "instructionSet",
  "version": {
    "content": 1,
    "schema": 1
  },
  "description": "description",
  "data": [
    {
      "type": "text", "val": "display_info"
    }
  ]
}

*/
var config = require('./settings.json');
//testSplit();
function testSplit() {
	let string = "This is a bunch of info~~This will be on a new line~~This will be below a horizontal rule~~another break for some reason";

	if (~string.indexOf('~-')) {
		console.log('inner')
		// we want to display the information in the same order, we can do this wrong
		let vals = string.split('~-');

		for(let i=0;i<vals.length;i++) {
			if (~vals[i].indexOf('~~')) {
				let moreSplits = vals[i].split('~~');
				for(let j=0;j<moreSplits.length;j++) console.log(moreSplits[j]);
			}
			if ((i+1)<vals.length) console.log('_____________________________');
		}
	} else {
		// no hr, just split and display in order
		console.log('outer')
		if (~string.indexOf('~~')) {
			let strings = string.split('~~');
			for(let i=0;i<strings.length;i++) console.log(strings[i]);
		} else {
			console.log(string);
		}
	}
}

function showInputTest() {
	let text = "what is 1+1?";
	util.displayText(text);

}
function showMultiChoiceTest() {

}
process.stdin.on('keypress', (s, key)=>{
	console.log(key.name);
	if (key.name === "`") console.log('test')

});
