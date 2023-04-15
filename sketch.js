let handFont;
function preload() {
  handFont = loadFont('Regular.ttf');
}

let [width, height] = [400, 400];

let buttons = [];
let texts = [];
let currentDecision = [];
let karma = 0;
let turns = 6;
let maxTurns = 6;
let caste;
let casteRanks = {"Dalit" : -2, "Sudra" : -1, "Vaisya" : 0, "Kshatriya" : 1, "Brahmin" : 2};
let lifeCount = 1;
let currentPrompt;
let showIfWonPage = false;
let readyToReincarnate = false;
let simsAndDiffsMenuOpen = false;

function randomCaste() {
  caste = random(Object.keys(casteRanks));
  maxTurns = maxTurns + casteRanks[caste];
  console.log(caste);
  console.log(maxTurns);
}

class choice {
  constructor(choiceText, karmaPoints, nextPrompt, specialAction = null, fontSize = 50) {
    this.choiceText = choiceText;
    this.karmaPoints = karmaPoints;
    this.nextPrompt = nextPrompt;
    this.specialAction = specialAction;
    this.fontSize = fontSize;
  }
  
  selectChoice() {
    karma += this.karmaPoints;
    turns -= 1;
    if(this.specialAction) {
    this.specialAction();
    }
    console.log("choice selected, this is: ", this);
    buttons = [];
    this.nextPrompt.doPrompt.call(this.nextPrompt);
  }
}

class prompt {
  constructor(promptText, fontSize = 30) {
    this.promptText = promptText;
    this.choiceList = [];
    this.fontSize = fontSize;
  }
  
  addChoices(choiceList) {
    this.choiceList = choiceList;
  }
  
  doPrompt() {
    let buttonHeight = ((height - (this.choiceList.length + 1) * 10) - 60) / this.choiceList.length;
    this.choiceList.forEach(choice => {
      console.log("selected choice " + choice);
      newButton(10, this.choiceList.indexOf(choice) * (buttonHeight + 10) + 50 , width - 20, buttonHeight, choice.choiceText, choice.fontSize, choice.selectChoice.bind(choice));
    });
    currentPrompt = this;
  }
}

// Create all prompts, yay!!
promptAtHome = new prompt("You start at home.");
promptTookCandy = new prompt("You took the candy bar.");
promptGaveCandy = new prompt("You gave the candy bar back.");
promptMoneyOffered = new prompt("They offer you money for your work.");
promptMoneyAccepted = new prompt("You accepted the money. What next?");
// promptMoneyRefused is just promptOutOfPrompts
promptFoundBeggar = new prompt("You found a beggar. What to do you do?");
promptFoundMoney = new prompt("You found $50, what do you do?");
promptCantFindOwner = new prompt("You can't find who dropped it");
promptFoundOwner = new prompt("You found who dropped it, what next?");
promptKeptMoney = new prompt("You kept the $50, what do you do?");
promptTipping = new prompt("How much do you tip?");
promptOutOfPrompts = new prompt("Where do you want to go?");

// Now add all the decisions (woot woot!)
promptOutOfPrompts.addChoices([new choice("Go to store", 0, promptFoundMoney), new choice("Go home", 0, promptFoundBeggar), new choice("Rake leaves for neighbor", 15, promptMoneyOffered)]);

promptAtHome.addChoices([new choice("Take brother's candy bar\n(+1 turn)", -5, promptTookCandy, function() { turns++ }), new choice("Rake leaves for neighboor", 15, promptMoneyOffered), new choice("Go to store", 0, promptFoundMoney)]);
promptTookCandy.addChoices([new choice("Give back candy bar", 5, promptGaveCandy), new choice("Rake leaves for neighbor", 15, promptMoneyOffered), new choice("Go to store", 0, promptFoundMoney)]);
promptGaveCandy.addChoices([new choice("Rake leaves for neighbor", 15, promptMoneyOffered), new choice("Go to store", 0, promptFoundMoney)]);
promptMoneyOffered.addChoices([new choice("Take the money\n(+1 turn)", 0, promptMoneyAccepted, function() { turns++ }), new choice("Refuse the money", 15, promptOutOfPrompts)]);
promptMoneyAccepted.addChoices([new choice("Buy food for homeless", 25, promptOutOfPrompts), new choice("Go to store", 0, promptFoundMoney)]);
promptFoundBeggar.addChoices([new choice("Give $5", 10, promptOutOfPrompts), new choice("Keep money", -10, promptFoundMoney)]);
promptFoundMoney.addChoices([new choice("Try to find owner", 15, promptCantFindOwner), new choice("Keep $50", -20, promptKeptMoney)]);
promptCantFindOwner.addChoices([new choice("Keep looking", 5, promptFoundOwner), new choice("Give up, keep $50", -5, promptKeptMoney)]);
promptFoundOwner.addChoices([new choice("Go to store", 0, promptFoundMoney), new choice("Go home", 0, promptFoundBeggar)]);
promptKeptMoney.addChoices([new choice("Get dinner", 0, promptTipping), new choice("Give stranger $10", 5, promptOutOfPrompts)]);
promptTipping.addChoices([new choice("Don't tip\n(+2 turn)", 0, promptOutOfPrompts, function() { turns += 2 }), new choice("Tip\n(+1 turn)", 0, promptOutOfPrompts, function() { turns++ }), new choice("Tip Extra", 0, promptOutOfPrompts)]);

let gamemode = '';

function setup() {
  createCanvas(width, height);
  textFont(handFont);
  
  newButton(10, 55, width - 20, height / 2 - 65, 'Hindu', 150, function () { selectGamemode('Hindu') });
  newButton(10, 200, width - 20, height / 2 - 65, 'Buddhist', 150, function () { selectGamemode('Buddhist') });
  newButton(50, 350, width - 100, 40, 'similarities and differences', 30, function () {
  let explanationID = buttons.length;
  simsAndDiffsMenuOpen = true;
  newButton(10, 10, width - 20, height - 20, 'These facts are all included in the game:\n\nSimilarities:\n- Reincarnation\n- Karma\n- Ultimate goal of escaping\nthe cycle of life and death\nDifferences:\n- Moksha vs Nirvana\n- Hinduism has a Caste System\n- Hinduism has specific Dharma for each caste\n- Buddhism has the Four Noble Truths\n- Buddhism has the Eightfold path', 30, function() { buttons.splice(explanationID, 1); simsAndDiffsMenuOpen = false; });
  });
}

function draw() {
  background(220);
  drawShapes();
  if(gamemode == '' && !simsAndDiffsMenuOpen) {
    textSize(40);
    text("What religion would you like to be?", 10, 30);
    textSize(20);
    text("   You must achieve moksha/nirvana to win (reach 120 karma)", 10, 50);
  }
  
  
  if(turns == 0) {
    if(!showIfWonPage) {
      buttons = [];
      currentPrompt = null;

      textSize(100);
      text("You Died!", width/2 - textWidth("You Died!")/2, height/2);
      textSize(25);
      text("click to continue...", width/2 - textWidth("click to continue...")/2, height/2 + 25);
    } else { // show if won page 
      if(karma >= 120) {
          textSize(80);
          text("You achieved", width/2 - textWidth("You achieved")/2, height/2);
          if(gamemode == "Buddhist") {
            textSize(80);
            text("nirvana!", width/2 - textWidth("nirvana!")/2, height/2 + 40);
          } else { // hindu
            textSize(80);
            text("moksha!", width/2 - textWidth("moksha!")/2, height/2 + 45);
          }
      } else {
        readyToReincarnate = true;
        textSize(25);
        text("click to reincarnate...", width/2 - textWidth("click to reincarnate...")/2, height/2 + 30);
        if(gamemode == "Buddhist") {
          textSize(50);
          text("you did not achieve nirvana...", width/2 - textWidth("you did not achieve nirvana..")/2, height/2 + 10);
          text("Try your best to", width/2 - textWidth("Try your best to")/2, height/2 - 100);
          text("follow the Eightfold Path!", width/2 - textWidth("follow the Eightfold Path!")/2, height/2 - 70);
          text("Remember the 4 Noble Truths.", width/2 - textWidth("Remember the 4 Noble Truths.")/2, height/2 - 150);
          
        } else { // hindu
          textSize(50);
          text("you did not achieve moksha...", width/2 - textWidth("you did not achieve moksha..")/2, height/2 + 10);
          textSize(50);
          text("Try your best to", width/2 - textWidth("Try your best to")/2, height/2 - 100);
          text("perform your Dharma!", width/2 - textWidth("perform your Dharma!")/2, height/2 - 70);
        }
      }
    }
  }
}

function mouseClicked() {
  if(turns == 0) {
    if(!showIfWonPage) {
      showIfWonPage = true;
    } else {
      if(readyToReincarnate) {
        lifeCount++;
        readyToReincarnate = false;
        showIfWonPage = false;
        turns = maxTurns + 1;
        promptAtHome.doPrompt();
      }
    }
  }
  
  console.log("clicked!");
  let clickedOn;
  buttons.forEach(function(buttonData) {
    if(buttonData[0] < mouseX && mouseX < (buttonData[0] + buttonData[2]) && buttonData[1] < mouseY && mouseY < (buttonData[1] + buttonData[3])) {
      clickedOn = buttonData;
    }
  });
  if(clickedOn) {
    clickedOn[6].call(clickedOn[6]);
  }
}

function newButton(x, y, width, height, text, fontPt, clickFunc) {
  buttons.push([x, y, width, height, text, fontPt, clickFunc]);
  return(buttons.length - 1);
}

function drawShapes() {
  noStroke();
  buttons.forEach(function(buttonData) {
    rect(buttonData[0], buttonData[1], buttonData[2], buttonData[3]); // draw rect
    textSize(buttonData[5]);
    
    yOffset = (buttonData[4].split('\n').length - 1) * buttonData[5]/2;
    
    buttonData[4].split('\n').forEach(function(line) {
    text(line, buttonData[0] + buttonData[2]/2 - textWidth(line)/2, buttonData[1] + buttonData[3]/2 - buttonData[5]*(1/2) + (buttonData[4].split('\n').indexOf(line)) * buttonData[5] - yOffset, buttonData[2], buttonData[3]);
    });
  });
  if(currentPrompt) {
    textSize(currentPrompt.fontSize);
    text(currentPrompt.promptText, 10, 30);
  }
  
  texts.forEach((oneText) => {
    textSize(oneText[5]);
    text(oneText[0], oneText[1], oneText[2], oneText[3], oneText[4]);
  })
  
  if(gamemode != '') {
    textSize(20);
    text("Karma: " + karma, 10, 390);
    text("Turns Left: " + turns, 390 - textWidth("Turns Left: " + turns), 390);
    text("Lives: " + lifeCount, 200 - textWidth("Lives: " + lifeCount), 390);
    if(gamemode == "Hindu") {
      text(casteRanks[caste] + " turn(s) for being " + caste, 395 - textWidth(casteRanks[caste] + casteRanks[caste] + " turn(s) for being " + caste), 13);
    }
  }
}

function selectGamemode(gamemodeSelected) {
  if(gamemodeSelected == "Hindu") {
    randomCaste();
    turns = maxTurns;
  }
  
  console.log("gamemode selected");
  buttons = [];
  console.log(buttons);
  gamemode = gamemodeSelected;
  promptAtHome.doPrompt.call(promptAtHome);
}

function newText(textToDisplay, x, y, x2 = textWidth(textToDisplay) + 25, y2 = textSize(), fontSize = null) {
  if(!fontSize) {
    if(!textSize()) {
      fontSize = 10;
    } else {
      fontSize = textSize();
    }
  }
  texts.push([textToDisplay, x, y, x2, y2, fontSize]);
}
