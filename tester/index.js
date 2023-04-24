const readline = require('readline'),
  c = require('chalk'),
  util = require('./util.js'),
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'yo> '
  });
/*
  I guess we should brainstorm how the fuck this thing is going to work.

  - Lets load all test suites in a managable, orderable array so we can
    muck with it
  for now lets just show all test files. we will only show <x>(5) at a time
  the user will enter 'n' for the next set for display, no order

  the user can use the command select <int> to load a test but they still have to hit start
  the user can do start <int> to load on start
*/
var config = require('./settings.json');
const noTestsMessage = `run command '$gen' to load tests if there are any. If there arent then make some (╯°□°）╯︵ ┻━┻`;
var tests=[],loc=0,selected=[],test,step=0,testing=false,timeoutId;
rl.prompt();
rl.on('line',(line)=>{
  let baseCommand,args=line.trim().split(" ");
  if (args.length > 1) baseCommand = args[0];
  else baseCommand = line;
  switch(baseCommand.trim()) {
    case "":
      if (testing) {
        reset();
      } else {
        showCommands();rl.prompt();
      }
    break;
    case "help":
      if (args.length === 1) {showCommands();rl.prompt();}
      else if (args.length >= 2) {
        if (args[1] === "config") {
          if (args.length >= 3) {
            if (args[2] === "main") {
              showMainConfigCommands();
            } else if (args[2] === "personal") {
              showPersonalConfigCommands();
            } else {
              console.log(`unknown command ${args[2]}. Supported commands: [main,personal]`)
            }
          }
        }
      }
      rl.prompt();
    break;
    case "show":
    case "misete":
    case "mite":
      console.log(`press enter for more, enter test numbers to select, 'q' to quit`);
      showNextSet();
    break;
    case "g":
    case "gen":
    case "generate":
      util.getFiles((err,files)=>{
        if (err) {
          console.log(c.red.bold('failed to get files bro'));
        } else {
          console.log(`got ${files.length} test suites`);
          tests = files;
        }
        rl.prompt();
      });
    break;
    case "stat":
    case "status":
      showStatus();
    break;
    case "s":
    case "sel":
    case "select":
    case "add":
      addValidArgsToSelectedArray(args);rl.prompt();
    break;
    case "r":
    case "rm":
    case "remove":
      remove(args);
    break;
    case "c":
    case "clear":
      selected = [];
      console.log('all selected tests removed');rl.prompt();
    break;
    case "go":
    case "ikimasu":
    case "ikimasho":
    case "hajimeru":
    case "hajime":
    case "start":
      // LETS FUCKNG DO THIS SHIT!!!!!!!
      if (selected.length>0) {
        initTest(args);
      } else {
        addValidArgsToSelectedArray(args);
        if (selected.length>0) initTest(args);
        else {console.log(c.red.bold('select some fucking tests first!'));rl.prompt();}
      }
    break;
    default:
      console.log(`unknown command ${c.red(line)}`);
      showCommands();rl.prompt();
    break;
  }
}).on('close',()=>{
  console.log(c.bold('toot toot'));
  rl.close();
  process.exit(0);
});

function showStatus() {
  console.log(c.white.bold('---'),c.green.bold(tests.length),`tests are available`,c.white.bold('---'));
  if (selected.length>0) {
    for (let i=0;i<selected.length;i++) {
        console.log(c.white.bold('---'),c.cyan(c.bold(selected[i]),tests[selected[i]].label),'is selected',c.white.bold('---'));
    }
  }
  else {
    console.log(c.white.bold('---'),'no test is selected',c.white.bold('---'));
    if (tests.length>0) console.log(c.white.bold('---'),`select test 0 - ${tests.length-1} with command '$select <0-${tests.length-1}>' or start immediately with '$start <0-${tests.length-1}>' `,c.white.bold('---'));
    else console.log(c.white.bold('---'),noTestsMessage,c.white.bold('---'));
  }
  if (config.personal.automation.automate===true) console.log(`Tests are set to automate at ${config.personal.automation.interval} ms intervals`);
  else console.log('tests are not automated');
  rl.prompt();
}

function initTest(args) {
  let arr = [];
  for (let i=0;i<selected.length;i++) arr.push(tests[selected[i]].filePath);
  util.loadFiles(arr,(err,suite)=>{
    if (err) { console.log(c.yellow('error starting test suite >:('),c.red.bold(JSON.stringify(err))); }
    else {
      step=0;
      //suite = util.reverseIfNeeded(args, suite);
      // determine if this is a multiple choice only test run (by args)
      if (args[1] && args[1] === "a") {
        if (args[2] && args[3] && args[4] && args[5] && !isNaN(args[2]) && !isNaN(args[3]) && !isNaN(args[4]) && !isNaN(args[5])) {
          let questionLength = parseInt(args[2]);
          let answerLength = parseInt(args[3]);
          if (questionLength > 500) config.personal.automation.questionInterval = questionLength;
          if (answerLength > 500) config.personal.automation.answerInterval = answerLength;
          let originalSuiteSize = suite.data.length;
          suite.data = suite.data.slice(parseInt(args[4]), parseInt(args[5]));
          if (suite.data.length > 0) {
            console.log(`Original suite size: '${c.cyan(originalSuiteSize)}', new size: '${c.cyan(suite.data.length)}', ${c.green.bold('がんばて!!')}`);
            //config.personal.shuffle = false;
            setTimeout(function() {
              test = suite;
              step=0;
              automate();
            }, 1500);
          } else {
            console.log('No tests available after slicing')
            rl.prompt();
          }
        } else {
          test = suite;
          step=0;
          automate();
        }
      } else if (args[1] && args[1] === "m") {
        let customSuite = {label: "Multiple",data: []};
        for (let i=0;i<suite.data.length;i++) {
          if (~suite.data[i].types.indexOf("multi")) customSuite.data.push(suite.data[i]);
        }
        if (customSuite.data.length > 0) {
          if (args[2] && args[3] && !isNaN(args[2]) && !isNaN(args[3])) {

            let originalSuiteSize = customSuite.data.length;
            customSuite.data = customSuite.data.slice(parseInt(args[2]), parseInt(args[3]));
            if (customSuite.data.length > 0) {
              console.log(`Original suite size: '${c.cyan(originalSuiteSize)}', new size: '${c.cyan(customSuite.data.length)}', ${c.green.bold('がんばて!!')}`);
              //config.personal.shuffle = false;
              setTimeout(function() {
                console.log(`enter ${c.cyan('qq')} to quit`);
                test = customSuite;
                performMultipleChoiceTest();
              }, 1500);
            } else {
              console.log('No tests available after slicing')
              rl.prompt();
            }
          } else {
            console.log(`enter ${c.cyan('qq')} to quit`);
            test = customSuite;
            performMultipleChoiceTest();
          }
        } else {
          console.log(`The suites you've selected dont have any multiple choice tests. Try again.`);
          rl.prompt();
        }

      } else if (args[1] && args[1] === "i") {
        // filter all data that doesnt have "input" as one of the types
        let customSuite = {label: "Multiple",data: []};
        for (let i=0;i<suite.data.length;i++) {
          if (~suite.data[i].types.indexOf("input")) customSuite.data.push(suite.data[i]);
        }
        if (customSuite.data.length > 0) {
          // show instruction? no
          //console.log(`hit ${c.cyan('ctrl + space')} to quit`);

          if (args[2] && args[3] && !isNaN(args[2]) && !isNaN(args[3])) {

            let originalSuiteSize = customSuite.data.length;
            customSuite.data = customSuite.data.slice(parseInt(args[2]), parseInt(args[3]));
            if (customSuite.data.length > 0) {
              console.log(`Original suite size: '${c.cyan(originalSuiteSize)}', new size: '${c.cyan(customSuite.data.length)}', ${c.green.bold('がんばて!!')}`);
              //config.personal.shuffle = false;
              setTimeout(function() {
                console.log(`enter ${c.cyan('qq')} to quit`);
                test = customSuite;
                performInputTest();
              }, 1500);
            } else {
              console.log('No tests available after slicing')
              rl.prompt();
            }
          } else {
            console.log(`enter ${c.cyan('qq')} to quit`);
            test = customSuite;
            performInputTest();
          }
        } else {
          console.log(`The suites you've selected dont have any input tests. Try again.`);
          rl.prompt();
        }

      } else {
        test = suite;
        step=0;

        if (config.personal.automation.ask === true && config.personal.automation.automate===false) {
          rl.question(`automate? 'y' for yes, anything else for no.> `,(line)=>{
            if (line === "y") {
              rl.question(`specify a question interval time or hit enter to use default and start> `,(line)=>{
                if (line.trim().length>0) {
                  let questionInterval = parseInt(line.trim());
                  if (!isNaN(questionInterval)&&questionInterval>=500) { config.personal.automation.questionInterval = questionInterval; }
                }
                rl.question(`specify an answer interval time or hit enter to use default and start> `,(line)=>{
                  if (line.trim().length>0) {
                    let answerInterval = parseInt(line.trim());
                    if (!isNaN(answerInterval)&&answerInterval>=500) { config.personal.automation.answerInterval = answerInterval; }
                  }
                  rl.question(`Discect test(s)? 'y' for yes, anything else for no`, line => {
                    if (line === 'y') {
                      rl.question(`enter start index and end index separated by space, IE '50 75' selects 25 items after index 50`, line => {
                        if (line.trim().length) {
                          let vals = line.trim().split(' ');
                          if (vals.length === 2) {
                            let index = parseInt(vals[0]);
                            let size = parseInt(vals[1]);
                            if (!isNaN(index) && !isNaN(size)) {
                              let originalSuiteSize = suite.data.length;
                              suite.data = suite.data.slice(index, size);
                              if (suite.data.length > 0) {
                                console.log(`Original suite size: '${c.cyan(originalSuiteSize)}', new size: '${c.cyan(suite.data.length)}', ${c.green.bold('がんばて!!')}`);
                                //config.personal.shuffle = false;
                                setTimeout(function() {
                                  test = suite;
                                  step=0;
                                  automate();
                                }, 1500);
                              } else {
                                console.log('No tests available after slicing')
                                rl.prompt();
                              }
                            }
                          }
                        }
                      });
                    } else {
                      automate();
                    }
                  });
                });
              });
            } else { go(); }
          });
        } else {
          go();
        }
      }
    }
  });
  function go() {
    if (config.personal.shuffle) test.data = util.shuffle(test.data);
    if (config.personal.automation.automate===true) {
      console.log(c.white.bold('---'),`tests are set to automate. press enter to quit`,c.white.bold('---'));
      setTimeout(automate,1000);
    } else {
      console.log(c.white.bold('---'),`'${c.cyan('f')}' to flip, enter or '${c.cyan('n')}' for next, '${c.cyan('b')}' to go back, '${c.cyan('q')}' to quit`,c.white.bold('---'));
      console.log();
      setTimeout(()=>{performSimpleTest();},1000);
    }
  }
}

function automate() {
  if (config.personal.shuffle) test.data = util.shuffle(test.data);
  let next = "q";
  testing=true;
  evalTest();
  function evalTest() {
    if (!testing) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      rl.prompt();
    }
    else {
      if (step < test.data.length) {
        // anytime this function is called we output the question
        if (next === "q") {
          if (typeof test.data[step].question.val === "object") util.displayText(test.data[step].question.val[0],c.bold('Q:'));
          else util.displayText(test.data[step].question.val,c.bold('Q:'));
          act(config.personal.automation.questionInterval);
        }
        else {
          if (typeof test.data[step].answer.val === "object") util.displayText(test.data[step].answer.val[0],c.bold('A:'));
          else util.displayText(test.data[step].answer.val,c.bold('A:'));
          console.log();
          act(config.personal.automation.answerInterval);
        }
      } else {
        // decide whether to quit or restart
        if (config.personal.automation.stopOnLastTest===true) {
          console.log(`reached last test`);
          testing=false;
          rl.prompt();
        } else {
          console.log(`reshuffling and repeating suite`);
          test.data = util.shuffle(test.data);
          step=0;next="q";evalTest();
        }
      }
    }
  }
  function act(timeout) {
    timeoutId = setTimeout(()=>{
      // view next question or matching answer
      if (next==="q" && config.personal.automation.flip===true) {
        next="a";evalTest();
      } else {
        // inc step
        step++;
        next="q";evalTest();
      }
    },timeout);
  }
}

function performMultipleChoiceTest() {
  if (config.personal.shuffle) test.data = util.shuffle(test.data);
  // display question
  if (typeof test.data[step].question.val === "object") util.displayText(test.data[step].question.val[0]);
  else util.displayText(test.data[step].question.val);
  let score = {failed:0,passed:0},correctAnswer;
  displayOptions();
  function displayOptions() {
    // i think we should return what the correct answer was. Trying to decipher
    // otherwise would fucking suck mung dung
    util.genMultiChoice(test.data[step].answer.val,test.data[step].answer.incorrectOptions,(ca)=>{
      correctAnswer = ca;
      prompt();
    })
  }
  function prompt() {
    rl.question('answer> ',(answer)=>{
      if (answer.trim().length>0) {
        // compare against the val by default.
        // if that fails attempt the alts if they exist
        let washedInput = answer.trim().toLowerCase();
        if (washedInput === "qq") {
          reset();
        } else {
          if (washedInput === correctAnswer) { score.passed++;console.log(c.green.bold(config.personal.style.defaultIndent+'Correct!\n')); }
          else { score.failed++;console.log(c.red.bold(config.personal.style.defaultIndent+`WRONG!!`),`The answer was ${c.cyan.bold(correctAnswer)}\n`); }
          afterInput("multi");
        }
      } else {
        score.failed++;
        console.log(config.personal.style.defaultIndent+` the answer was ${c.bold(test.data[step].answer.val[0])}`);
        afterInput("multi");
      }
    });
  }
  function afterInput(type) {
    step++;
    if (step < test.data.length) {
      if (typeof test.data[step].question.val === "object") util.displayText(test.data[step].question.val[0]);
      else util.displayText(test.data[step].question.val);
      displayOptions();
    } else {
      step=0;
      console.log();
      console.log(c.bold(config.personal.style.defaultIndent+'passed: '+ c.green(score.passed)+' failed: '+c.red(score.failed)+`   ${parseFloat((score.passed / (score.passed+score.failed))*100).toFixed(0)}%`));
      if (score.failed===0) console.log(c.green.bold(`All Correct!! ${util.getFace('happy')}`));
      else if (score.passed===0) console.log(c.red.bold(`All WRONG!! ${util.getFace('mad')}`));
      reset();
    }
  }
}

function performInputTest() {
  if (config.personal.shuffle) test.data = util.shuffle(test.data);
  if (typeof test.data[step].question.val === "object") util.displayText(test.data[step].question.val[0]);
  else util.displayText(test.data[step].question.val);
  let score = {failed:0,passed:0};
  prompt();
  function prompt() {
    rl.question('answer> ',(answer)=>{
      if (answer.trim().length>0) {
        // compare against the val by default.
        // if that fails attempt the alts if they exist
        let washedInput = answer.trim().toLowerCase();
        if (washedInput === "qq") {
          reset();
        } else {
          if (typeof test.data[step].answer.val === "object" && test.data[step].answer.val.length > 0) {
            if (typeof test.data[step].answer.val === "object" && test.data[step].answer.val.length > 0) {
              let passed = false;
              for (let i=0;i<test.data[step].answer.val.length;i++) {
                if (test.data[step].answer.val[i].toLowerCase() === washedInput) {
                  passed=true;
                  break;
                }
              }
              if (passed) { score.passed++;console.log(c.green.bold(config.personal.style.defaultIndent+'Correct!')); }
              else { score.failed++;console.log(c.red.bold(config.personal.style.defaultIndent+`WRONG!!`),`The answer was ${c.cyan.bold(test.data[step].answer.val[0])}`); }
              afterInput("input");
            }
          } else {
            console.log(c.yellow(`answer property on for question '${JSON.stringify(test.data[step].question.val)}' is inproperly formatted.`))
            afterInput("input")
          }
        }
      } else {
        score.failed++;
        console.log(config.personal.style.defaultIndent+` the answer was ${c.bold(test.data[step].answer.val[0])}`);
        afterInput("input");
      }
    });
  }
  function afterInput(type) {
    step++;
    if (step < test.data.length) {
      if (typeof test.data[step].question.val === "object") util.displayText(test.data[step].question.val[0]);
      else util.displayText(test.data[step].question.val);
      prompt();
    } else {
      step=0;
      console.log();
      console.log(c.bold(config.personal.style.defaultIndent+'passed: '+ c.green(score.passed)+' failed: '+c.red(score.failed)+`   ${parseFloat((score.passed / (score.passed+score.failed))*100).toFixed(0)}%`));
      if (score.failed===0) console.log(c.green.bold(`All Correct!! ${util.getFace('happy')}`));
      else if (score.passed===0) console.log(c.red.bold(`All WRONG!! ${util.getFace('mad')}`));
      reset();
    }
  }
}

// TODO: remove one of these duplicate functions... how is this working??
function performSimpleTest() {
  // 'f' to flip flashcard
  // 's' for status (1 out of <x> tests hit)
  // 'q' to quit to main
  let last = "q";
  if (typeof test.data[step].question.val === "object") util.displayText(test.data[step].question.val[0]);
  else util.displayText(test.data[step].question.val);
  prompt();
  function prompt() {
    rl.question(`${step+1}/${test.data.length}> `,(line)=>{
      switch(line.trim()) {
        case "f":
          if (last === 'q') {
            if (typeof test.data[step].answer.val === "object") util.displayText(test.data[step].answer.val[0]);
            else util.displayText(test.data[step].answer.val);
            last="a";
          } else {
            if (typeof test.data[step].question.val === "object") util.displayText(test.data[step].question.val[0]);
            else util.displayText(test.data[step].question.val);
            last="q";
          }
          prompt();
        break;
        case "n":
        case "":
          step++;
          if (step < test.data.length) {

          } else {
            step=0;
            test.data = util.shuffle(test.data);
          }
          performSimpleTest();
        break;
        case "b":
          if (step > 0) {
            step--;
            performSimpleTest();
          } else prompt();
        break;
        case "q":
          rl.prompt();
        break;
        default:
          console.log(`unknown command ${c.red(line)}`);
          console.log(c.white.bold('---'),`'${c.cyan('f')}' to flip, enter or '${c.cyan('n')}' for next, '${c.cyan('b')}' to go back, '${c.cyan('q')}' to quit`,c.white.bold('---'));
          prompt();
        break;
      }
    });
  }
}

function performSimpleTest() {
  // 'f' to flip flashcard
  // 's' for status (1 out of <x> tests hit)
  // 'q' to quit to main
  let last = "q";
  util.displayText(test.data[step].question.val);prompt();
  function prompt() {
    rl.question(`${step+1}/${test.data.length}> `,(line)=>{
      switch(line.trim()) {
        case "f":
          if (last === 'q') {
            util.displayText(test.data[step].answer.val);last="a";
          } else {
            util.displayText(test.data[step].question.val);last="q";
          }
          prompt();
        break;
        case "n":
        case "":
          step++;
          if (step < test.data.length) {

          } else {
            step=0;
            test.data = util.shuffle(test.data);
          }
          performSimpleTest();
        break;
        case "b":
          if (step > 0) {
            step--;
            performSimpleTest();
          } else prompt();
        break;
        case "q":
          rl.prompt();
        break;
        default:
          console.log(`unknown command ${c.red(line)}`);
          console.log(c.white.bold('---'),`'${c.cyan('f')}' to flip, enter or '${c.cyan('n')}' for next, '${c.cyan('b')}' to go back, '${c.cyan('q')}' to quit`,c.white.bold('---'));
          prompt();
        break;
      }
    });
  }
}

function remove(args) {
  if (tests.length > 0) {
    if (args.length >= 2) {
      let index = parseInt(args[1]);
      if (!isNaN(index) && index >= 0 && index < tests.length) {
        selected.splice(index,1);
        console.log(`test ${tests[index].label} removed`);
      } else { console.log(`${args[1]} is an invalid option`); }
    } else { console.log(`specify a test number between 0 - ${tests.length-1}`); }
  } else { console.log(noTestsMessage); }
  rl.prompt();
}

function showNextSet() {
  let newIndex=0;
  if (tests.length > 0) {
    if (loc < tests.length) {
      for (let i=loc;i<tests.length;i++) {
        console.log(`${i}: ${tests[i].label}`);
        loc++;newIndex++;
        if (newIndex===(config.personal.fileDisplayCount)) break;
      }
      if (loc < tests.length) {
        rl.question('> ', (command)=>{
          if (command === '') showNextSet();
          else {
            // if they entered any number of integers try and add them to the list
            if (command.trim().split(" ").length > 0) {
              addValidArgsToSelectedArray(command.trim().split(" "));
              showNextSet();
            } else {
              loc=0;rl.prompt();
            }
          }
        });
      } else {console.log('---end---');loc=0;rl.prompt();}
    } else {
      loc=0;rl.prompt();
    }
  } else {
    console.log('no tests are loaded');rl.prompt();
  }
}

function showCommands() {
  console.log(`${c.cyan('gen')} = generate file array`);
  console.log(`${c.cyan('status')} = shows how many test suites are available, which test is loaded, etc.`);
  console.log(`${c.cyan('help [<cmd>] [<cmd>]')} = show commands, IE. $help, $help config <main/personal>`);
  console.log(`${c.cyan('show <cmd>')} = show test suite options. use 'all' to show all. use 'n' to see next set`);
  console.log(`${c.cyan('select <test_num>')} = selects a test before start is called`);
  console.log(`${c.cyan('clear')} = wipes out all selected tests`);
  console.log(`${c.cyan('rm <test_num>')} = removes a previously selected test`);
  console.log(`${c.cyan('start [<test_num>]')} = start the test suite. if file number is specified we will init that suite`);
  console.log(`${c.cyan('update <config>')} = update settings. possible options are main and personal`);
}
function showTestingCommands() {
  console.log(c.green.bold('testing commands!'));
}
function showMainConfigCommands() {
  console.log(c.green.bold('main config commands!'));
}
function showPersonalConfigCommands() {
  console.log(c.green.bold('personal config commands!'));
}
function showProgress() {
  console.log('- Ability to load multiple files',c.green.bold('COMPLETE'));
  console.log('- Multi test file dir support',c.green.bold('COMPLETE'));
  console.log('- Support multiple choice. score will be tallied at the end');
  console.log('- Ability to create,update and load configurations')
  console.log('- Create and Support test type where user has to enter value. Score will be tallied at the end',c.green.bold('COMPLETE'));
  console.log(c.cyan("    Note:"),'you cant have input and multi on the same test at the same time. ENFORCE!');
  console.log('- Ability to specify any number of tests in select command',c.green.bold('COMPLETE'));
  console.log('- somehow break newline',c.green.bold('COMPLETE'));
  console.log('- Support max length. dont want long things hitting the right side of screen');
  console.log('- automate the suite',c.green.bold('COMPLETE'));
  console.log('    - timeout for next test');
  console.log('    - bool whether we should flip or not');
  console.log('    - how many times to flip(if console.log then 1, if stdout then any number)');
}

function addValidArgsToSelectedArray(args) {
  // args are already trimmed and split by whitespace
  let addedTests = [];
  if (args.length>0) {
    // check if we are adding all tests
    if (args[1] === '*' || args[1] === 'all' || args[1] === 'zenbu') {
      for (let i = 0; i < tests.length; i++) selected.push(i);
      console.log(`added all tests`);
      return;
    }
    // check for specific tests
    for(let i=0;i<args.length;i++) {
      let int = parseInt(args[i]);
      // make sure this is an int, a valid test number and doesnt exist in the selected array
      if (!isNaN(int) &&
          int >= 0 &&
          int < tests.length &&
          !~selected.indexOf(int)) {
        // good to go
        selected.push(int);
        addedTests.push(`(${int}) ${tests[int].label}`);
      }
    }
    if (addedTests.length>0) {
      console.log(`added ${addedTests.join(', ')}`);
      // considering returning true
    }
  } else {
    // we need to tell us something(maybe)
  }
}

process.stdin.on('keypress', (s, key)=>{
	if (testing) {
    if (key.name === "`") {
      reset();
    }
  }
});

function reset() {
  test = undefined;
  step=0;
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  }
  testing = false;
  rl.prompt();
}
