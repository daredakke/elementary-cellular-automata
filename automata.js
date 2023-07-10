// Works well enough for 8-bit binary numbers
function intToBin(n) {
  return ("00000000" + n.toString(2)).slice(-8);
}


function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}


function buildInitialGeneration(length, oddsToLiveRatio, randomise=false) {
  let generation = [];
  let halfway = Math.floor(length * 0.5);
  let status;
  let oddsToLive = clamp(Number(oddsToLiveRatio), 0, 100);

  if (Number.isNaN(oddsToLive)) {
    oddsToLive = 0;
  }

  while (generation.length < length) {
    status = 0;

    if (
      randomise &&
      (
        Math.floor(Math.random() * 100) < oddsToLive || 
        oddsToLive === 0 && generation.length === halfway
      )
    ) {
      status = 1;
    }
    generation.push(status);
  }
  return generation;
}


function buildRuleSet(binary) {
  let rules = [];

  for (let i = 0; i < binary.length; i++) {
    rules.unshift(Number(binary[i]));
  }
  return rules;
}


function drawCellGrid(allGenerations, theme) {
  const fg = theme["fg"], bg = theme["bg"]
  let dataX, offset, layer;

  for (let y = 0; y < allGenerations.length; y++) {
    offset = (y * allGenerations.length) * 2;

    for (let x = 0; x < allGenerations[y].length; x++) {
      dataX = (x * 4) + offset;
      layer = allGenerations[y][x] ? fg : bg;

      imageData.data[dataX] = layer[0];
      imageData.data[dataX + 1] = layer[1];
      imageData.data[dataX + 2] = layer[2];
      imageData.data[dataX + 3] = 255;
    }
  }
  context.imageSmoothingEnabled = false;
  context.putImageData(imageData, 0, 0);
}


function getNextGeneration(generation) {
  let nextGeneration = new Int8Array(generation.length);
  let left, right, rule;

  for (let index = 0; index < generation.length; index++) {
    // Wrap neighbouring indexes if they go out of bounds
    left = index - 1 < 0 ? generation.length - 1 : index - 1;
    right = index + 1 >= generation.length ? 0 : index + 1;

    rule = generation[right] ? 1 : 0;
    rule += generation[index] ? 2 : 0;
    rule += generation[left] ? 4 : 0;
    
    nextGeneration[index] = rules[rule];
  }
  return nextGeneration;
}


function clearImage() {
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i + 3] = 0;
  }
}


function simulate(iterations, initialGeneration) {
  let allGenerations = [initialGeneration]

  while (allGenerations.length < iterations) {
    allGenerations.push(getNextGeneration(allGenerations.at(-1)));
  }
  return allGenerations;
}


const themes = [
  // Black and white
  {
    "fg": [0, 0, 0],
    "bg": [255, 255, 255],
  },
  // Grey
  {
    "fg": [100, 100, 100],
    "bg": [200, 200, 200],
  },
  // Blue
  {
    "fg": [70, 130, 180],
    "bg": [135, 206, 235],
  },
  // Pink
  {
    "fg": [219, 112, 147],
    "bg": [255, 192, 203],
  },
  // Orange
  {
    "fg": [245, 155, 0],
    "bg": [255, 222, 173],
  },
  // Green
  {
    "fg": [60, 179, 113],
    "bg": [152, 251, 152],
  },
  // Crimson
  {
    "fg": [220, 20, 60],
    "bg": [255, 228, 196],
  },
  // Indigo
  {
    "fg": [25, 25, 112],
    "bg": [176, 196, 222],
  },
];
const canvas = document.querySelector("#canvas");
const btnGenerate = document.querySelector("#generate");
const btnRandomise = document.querySelector("#randomise");
const btnReset = document.querySelector("#reset");
const inputRule = document.querySelector("#rule");
const inputCellSize = document.querySelector("#cellSize");
const inputRatio = document.querySelector("#ratio");
const selectThemes = document.querySelector("#themes");
const context = canvas.getContext("2d");
const imageData = context.createImageData(canvas.width, canvas.height);
let rule = 110;
let binary = "";
let rules = [];
let initialGeneration = buildInitialGeneration(canvas.width, inputRatio.value)
let allGenerations = [initialGeneration];
let selectedTheme = Number(selectThemes.value);


drawCellGrid(allGenerations, themes[selectedTheme]);


btnGenerate.addEventListener("click", function() {
  rule = clamp(Number(inputRule.value), 0, 255);

  if (Number.isNaN(rule)) {
    rule = 110;
  }

  binary = intToBin(rule);
  rules = buildRuleSet(binary);
  allGenerations = simulate(canvas.height, initialGeneration);
  drawCellGrid(allGenerations, themes[selectedTheme]);
});


btnRandomise.addEventListener("click", function() {
  clearImage();

  context.clearRect(0, 0, canvas.width, canvas.height);
  initialGeneration = buildInitialGeneration(canvas.width, inputRatio.value, true);
  allGenerations = [initialGeneration];
  drawCellGrid(allGenerations, themes[selectedTheme]);
});


btnReset.addEventListener("click", function() {
  window.location.reload(true);
});


inputRule.addEventListener("change", function() {
  allGenerations = [initialGeneration];
});


selectThemes.addEventListener("change", function() {
  selectedTheme = Number(selectThemes.value);
  drawCellGrid(allGenerations, themes[selectedTheme]);
});