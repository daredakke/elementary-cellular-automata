// Works well enough for 8-bit binary numbers
function intToBin(n) {
  return ("00000000" + n.toString(2)).slice(-8);
}


function clamp(value, min, max) {
  let clampedValue = value;

  if (value < min) {
    clampedValue = min;
  }

  if (value > max) {
    clampedValue = max;
  }
  return clampedValue;
}


function buildInitialGeneration(length, ratio, randomise=false) {
  let generation = [];
  let status;

  while (generation.length < length) {
    status = 0;

    if (randomise) {
      let oddsToLive = clamp(Number(ratio), 0, 100);

      if (!Number.isNaN(oddsToLive)) {
        if (Math.floor(Math.random() * 100) < oddsToLive) {
          status = 1;
        }

        if (oddsToLive === 0 && generation.length === Math.floor(length * 0.5)) {
          status = 1;
        }
      }
    }
    generation.push(status);
  }
  return generation;
}


function buildRuleSet(binary) {
  let rules = {};

  for (let i = 0; i < binary.length; i++) {
    rules[patterns[i]] = Number(binary[i]);
  }
  return rules;
}


function drawCellGrid(allGenerations, cellSize, theme) {
  let y = 0;
  let cellX = 0;
  let cellY = 0;

  for (generation of allGenerations) {
    for (let x = 0; x < generation.length; x++) {
      cellX = x * cellSize;

      context.fillStyle = generation[x] ? theme["fg"] : theme["bg"];
      context.fillRect(cellX, cellY, cellX + cellSize, cellY + cellSize);
    }
    y++;
    cellY = y * cellSize;
  }
}


function getNextGeneration(generation) {
  let nextGeneration = [];
  let left, right;
  let pattern = "";

  for (let index = 0; index < generation.length; index++) {
    left = index - 1;
    right = index + 1;

    if (left < 0) {
      left = generation.length - 1;
    }

    if (right >= generation.length) {
      right = 0;
    }

    pattern = `${generation[left]}${generation[index]}${generation[right]}`;
    
    nextGeneration.push(rules[pattern]);
  }
  return nextGeneration;
}


function simulate(iterations, initialGeneration) {
  let allGenerations = [initialGeneration]

  while (allGenerations.length < iterations) {
    allGenerations.push(getNextGeneration(allGenerations[allGenerations.length - 1]));
  }
  return allGenerations;
}


const colours = [
  {
    "fg": "black",
    "bg": "white",
  },
  {
    "fg": "dimgrey",
    "bg": "lightgrey",
  },
  {
    "fg": "steelblue",
    "bg": "skyblue",
  },
  {
    "fg": "palevioletred",
    "bg": "pink",
  },
  {
    "fg": "orange",
    "bg": "navajowhite",
  },
  {
    "fg": "mediumseagreen",
    "bg": "palegreen",
  },
  {
    "fg": "crimson",
    "bg": "bisque",
  },
  {
    "fg": "midnightblue",
    "bg": "lightsteelblue",
  },
];
const canvas = document.querySelector("#canvas");
const btnStart = document.querySelector("#start");
const btnRandomise = document.querySelector("#randomise");
const btnReset = document.querySelector("#reset");
const inputRule = document.querySelector("#rule");
const inputCellSize = document.querySelector("#cellSize");
const inputRatio = document.querySelector("#ratio");
const selectColours = document.querySelector("#colours");
const context = canvas.getContext("2d");
const patterns = ["111", "110", "101", "100", "011", "010", "001", "000"];
let cellSize = 2;
let columns = Math.floor(canvas.width / cellSize);
let rows = Math.floor(canvas.height / cellSize);
let rule = 110;
let binary = "";
let rules = {};
let initialGeneration = buildInitialGeneration(columns, inputRatio.value)
let allGenerations = [initialGeneration];
let selectedTheme = Number(selectColours.value);

drawCellGrid(allGenerations, cellSize, colours[selectedTheme]);


btnStart.addEventListener("click", function() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  rule = clamp(Number(inputRule.value), 0, 255);

  if (Number.isNaN(rule)) {
    rule = 110;
  }

  binary = intToBin(rule);
  rules = buildRuleSet(binary);
  allGenerations = simulate(rows, initialGeneration);
  drawCellGrid(allGenerations, cellSize, colours[selectedTheme]);
});


btnRandomise.addEventListener("click", function() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  initialGeneration = buildInitialGeneration(columns, inputRatio.value, true);
  allGenerations = [initialGeneration];
  drawCellGrid(allGenerations, cellSize, colours[selectedTheme]);
});


btnReset.addEventListener("click", function() {
  window.location.reload(true);
});


inputRule.addEventListener("change", function() {
  allGenerations = [initialGeneration];
});


inputCellSize.addEventListener("change", function() {
  cellSize = clamp(Number(inputCellSize.value), 1, 10);

  if (Number.isNaN(cellSize)) {
    cellSize = 2;
  }

  columns = Math.floor(canvas.width / cellSize);
  rows = Math.floor(canvas.height / cellSize);

  context.clearRect(0, 0, canvas.width, canvas.height);
  initialGeneration = buildInitialGeneration(columns, inputRatio.value);
  allGenerations = [initialGeneration];
  drawCellGrid(allGenerations, cellSize, colours[selectedTheme]);
});


selectColours.addEventListener("change", function() {
  selectedTheme = Number(selectColours.value);
  drawCellGrid(allGenerations, cellSize, colours[selectedTheme]);
});