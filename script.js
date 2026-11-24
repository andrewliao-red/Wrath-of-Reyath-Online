import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";

// =====================================================
// ELEMENT SELECTION
// =====================================================

const deckRow = document.querySelector("#deck-row");
const boardViewport = document.querySelector("#board-viewport");
const boardCanvas = document.querySelector("#board-canvas");
const boardWebGL = document.querySelector("#board-webgl");
const boardStatus = document.querySelector("#board-status");
const zoomOutButton = document.querySelector("#zoom-out");
const zoomInButton = document.querySelector("#zoom-in");
const resetViewButton = document.querySelector("#reset-view");
const soundToggleButton = document.querySelector("#sound-toggle");
const zoomLevel = document.querySelector("#zoom-level");
const inventoryGrid = document.querySelector("#inventory-grid");
const inventoryResizer = document.querySelector("#inventory-resizer");
const dice = document.querySelector("#dice");
const diceStatus = document.querySelector("#dice-status");
const rollButton = document.querySelector("#roll-button");
const loadMessage = document.querySelector("#load-message");
const gameSetupLayer = document.querySelector("#game-setup-layer");
const playerCountDecreaseButton = document.querySelector(
  "#player-count-decrease"
);
const playerCountIncreaseButton = document.querySelector(
  "#player-count-increase"
);
const playerCountOutput = document.querySelector("#player-count-output");
const characterSelectionGrid = document.querySelector(
  "#character-selection-grid"
);
const gameSetupError = document.querySelector("#game-setup-error");
const startGameButton = document.querySelector("#start-game");
const turnPhaseLabel = document.querySelector("#turn-phase-label");
const remainingMovesLabel = document.querySelector("#remaining-moves");
const finishMovementButton = document.querySelector("#finish-movement");
const autoplayToggleButton = document.querySelector("#autoplay-toggle");
const turnTransitionLayer = document.querySelector(
  "#turn-transition-layer"
);
const turnTransitionKicker = document.querySelector(
  "#turn-transition-kicker"
);
const turnTransitionTitle = document.querySelector(
  "#turn-transition-title"
);
const turnTransitionMessage = document.querySelector(
  "#turn-transition-message"
);
const reyathHealthFill = document.querySelector("#reyath-health-fill");
const reyathHealthValue = document.querySelector("#reyath-health-value");
const reyathStateValue = document.querySelector("#reyath-state-value");
const reyathHud = document.querySelector(".reyath-hud");
const boardEventLog = document.querySelector("#board-event-log");
const encounterLayer = document.querySelector("#encounter-layer");
const encounterKicker = document.querySelector("#encounter-kicker");
const encounterTitle = document.querySelector("#encounter-title");
const encounterContext = document.querySelector("#encounter-context");
const encounterDice = document.querySelector("#encounter-dice");
const encounterRoll = document.querySelector("#encounter-roll");
const encounterRollButton = document.querySelector(
  "#encounter-roll-button"
);
const encounterMessage = document.querySelector("#encounter-message");
const gameOverLayer = document.querySelector("#game-over-layer");
const gameOverKicker = document.querySelector("#game-over-kicker");
const gameOverTitle = document.querySelector("#game-over-title");
const gameOverMessage = document.querySelector("#game-over-message");
const restartGameButton = document.querySelector("#restart-game");

// =====================================================
// FALLBACK DATA
// =====================================================

const fallbackCardTexture = {
  source: "procedural",
  pattern: "linen",
  base: "#111111",
  line: "#353535",
  accent: "#737373",
  scale: 10
};

const fallbackData = {
  gameTitle: "Wrath of Reyath",
  textures: {
    cards: {
      food: { ...fallbackCardTexture, pattern: "linen" },
      armor: { ...fallbackCardTexture, pattern: "diagonal" },
      weather: { ...fallbackCardTexture, pattern: "waves" },
      unluckiness: { ...fallbackCardTexture, pattern: "crosshatch" },
      noise: { ...fallbackCardTexture, pattern: "signal" },
      monster: { ...fallbackCardTexture, pattern: "scales" }
    },
    board: {
      location: {
        source: "procedural",
        pattern: "stone",
        base: "#111111",
        line: "#353535",
        accent: "#555555",
        repeat: [2.2, 1.4],
        roughness: 0.92,
        metalness: 0.04
      },
      weather: {
        source: "procedural",
        pattern: "etched-stone",
        base: "#222222",
        line: "#505050",
        accent: "#777777",
        repeat: [5, 1.2],
        roughness: 0.84,
        metalness: 0.06
      },
      base: {
        source: "procedural",
        pattern: "wood",
        base: "#070707",
        line: "#262626",
        accent: "#414141",
        repeat: [3.5, 2.6],
        roughness: 0.96,
        metalness: 0.02
      }
    },
    ui: {}
  },
  decks: [
    { id: "food", name: "Food", code: "FD", texture: "food" },
    { id: "armor", name: "Clothing + Armor", code: "AR", texture: "armor" },
    { id: "weather", name: "Weather", code: "WT", texture: "weather" },
    { id: "unluckiness", name: "Unluckiness", code: "UL", texture: "unluckiness" },
    { id: "noise", name: "Noise", code: "NS", texture: "noise" },
    { id: "monster", name: "Monster", code: "MN", texture: "monster" }
  ],
  board: {
    columns: 4,
    rows: 4,
    weatherLabel: "Current Weather"
  },
  dice: {
    size: 1.6,
    textures: {},
    animation: {
      gravity: -22,
      launchVelocity: 9,
      horizontalVelocity: 1.4,
      restitution: 0.56,
      bounceCount: 3,
      rotationSpeed: 11,
      settleDuration: 450
    }
  },
  players: [
    {
      id: 1,
      name: "Player 1",
      characterName: "Baron Scorch",
      sprite: "pictures-textures-assets/characters/baron-scorch-oc/BaronScorch.png",
      startPosition: { column: 0, row: 4 }
    },
    {
      id: 2,
      name: "Player 2",
      characterName: "Harry Wizard",
      sprite: "pictures-textures-assets/characters/hari-wizard-oc/HarryWizard.png",
      startPosition: { column: 0, row: 4 }
    },
    {
      id: 3,
      name: "Player 3",
      characterName: "Elf Archer",
      sprite: "pictures-textures-assets/characters/elf-oc/Elf-Archer.png",
      startPosition: { column: 0, row: 4 }
    },
    {
      id: 4,
      name: "Player 4",
      characterName: "Khaos Agent",
      sprite: "pictures-textures-assets/characters/khaos-agent-oc/NoobSaibot.png",
      startPosition: { column: 0, row: 4 }
    }
  ],
  reyath: {
    name: "Reyath",
    sprite: "pictures-textures-assets/characters/reyath/Reyath.png",
    startPosition: {
      column: 3,
      row: 4
    },
    scale: 2
  }
};

// =====================================================
// GAME STATE
// =====================================================

let activePlayer = 1;
let loadedGameData = fallbackData;
let currentRound = 1;
let turnPhase = "loading";
let turnTransitioning = false;
let reyathActionInProgress = false;
let queuedReyathMovement = 0;
let queuedReyathAttacks = [];
let reyathMovementMode = "nearest-player";
let reyathPatrolDirection = -1;
let pendingTurnCompletion = false;
let gameStarted = false;
let gameOver = false;
let encounterFeedbackActive = false;
let encounterSequenceActive = false;
let encounterSequencePromise = Promise.resolve();
let activeReyathCard = null;
let setupPlayerCount = 4;
let characterRoster = [];
let setupCharacterSelections = [];
let setupControlSelections = [];
let inventoryResizeStartY = 0;
let inventoryResizeStartHeight = 0;
let inventoryPanelHeight = 190;
let currentReyathHealth = 20;
let currentReyathMaxHealth = 20;
let autoplayEnabled = false;
let automationRunId = 0;
let automatedMovementRunning = false;
const defeatedPlayerIds = new Set();
const reducedMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
let soundEnabled = false;
let audioContext = null;

// Priority 5 uses a second Three.js dice renderer inside the combat
// lightbox. It shares the same textures and result orientation as the
// board dice, but owns an independent animation state.
let encounterDiceRenderer = null;
let encounterDiceScene = null;
let encounterDiceCamera = null;
let encounterDiceMesh = null;
let encounterDiceFloor = null;
let encounterDiceResizeObserver = null;
let encounterDiceAnimationFrame = 0;
let encounterRollRequest = null;

// =====================================================
// THREE.JS DICE STATE
// =====================================================

const DEFAULT_DICE_CONFIG = {
  size: 1.6,
  textures: {},
  animation: {
    gravity: -22,
    launchVelocity: 9,
    horizontalVelocity: 1.4,
    restitution: 0.56,
    bounceCount: 3,
    rotationSpeed: 11,
    settleDuration: 450
  }
};

let diceRenderer = null;
let diceScene = null;
let diceCamera = null;
let diceMesh = null;
let diceFloor = null;
let diceResizeObserver = null;
let diceConfig = DEFAULT_DICE_CONFIG;
let diceState = "loading";
let diceResult = 1;
let diceBounceCounter = 0;
let diceLastFrameTime = 0;
let diceRollStartTime = 0;
let diceSettleStartTime = 0;

const diceVelocity = new THREE.Vector3();
const diceAngularVelocity = new THREE.Vector3();
const diceSettleStartPosition = new THREE.Vector3();
const diceSettleEndPosition = new THREE.Vector3();
const diceSettleStartQuaternion = new THREE.Quaternion();
const diceTargetQuaternion = new THREE.Quaternion();

// =====================================================
// THREE.JS BOARD SETTINGS
// =====================================================

const TILE_WIDTH = 5;
const TILE_DEPTH = 3.25;
const TILE_HEIGHT = 0.34;
const TILE_GAP = 0.28;
const BASE_HEIGHT = 0.34;

const CAMERA_FOV = 32;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 200;
const CAMERA_START_POSITION = new THREE.Vector3(0, 26, 27);
const MIN_CAMERA_DISTANCE = 18;
const MAX_CAMERA_DISTANCE = 65;
const ZOOM_FACTOR = 0.85;
const PAN_STEP = 1.2;
const GIZMO_MIN_SIZE = 76;
const GIZMO_MAX_SIZE = 112;
const GIZMO_MARGIN = 12;

let renderer;
let scene;
let camera;
let controls;
let boardGroup;
let weatherRoadTile = null;
let weatherTextureStates = {};
let hoveredTile = null;
let gizmoScene;
let gizmoCamera;
let defaultCameraDistance = CAMERA_START_POSITION.length();

const interactiveTiles = [];
const locationTilesById = new Map();
const locationTilesByCoordinate = new Map();
const destroyedLocationIds = new Set();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// =====================================================
// PLAYER SPRITE SETTINGS
// =====================================================

const PLAYER_SPRITE_HEIGHT = 2.2; // controls sprite size
const PLAYER_MOVE_DURATION = reducedMotionQuery.matches ? 1 : 280;
const PLAYER_JUMP_HEIGHT = reducedMotionQuery.matches ? 0 : 1.1;

let playerSprite = null;
let reyathSprite = null;
let playerMoving = false;
let activePlayerMovement = 0;
let reyathState = "dormant";

let playerPosition = {
  column: 0,
  row: 4
};

const playerSprites = new Map();
const playerPositions = new Map();
const playerMovementBudgets = new Map();

const reyathPosition = {
  column: 3,
  row: 0
};

const reyathHollowPosition = {
  column: 3,
  row: 0
};

const boardMovementPoints = new Map();

// =====================================================
// DATA LOADING
// =====================================================

async function loadGameData() {
  try {
    const response = await fetch("assets.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(
      "assets.json could not be loaded. Using fallback layout data.",
      error
    );

    loadMessage.hidden = false;
    loadMessage.textContent =
      "Preview note: fallback data is active. Run the project through a local server to load assets.json.";

    return fallbackData;
  }
}

// =====================================================
// DECKS
// =====================================================

function createCardBackground(texture = fallbackCardTexture) {
  const base = texture.base ?? "#111111";
  const line = texture.line ?? "#353535";
  const accent = texture.accent ?? "#737373";
  const scale = Math.max(4, Number(texture.scale) || 10);

  if (texture.source === "image" && texture.url) {
    return {
      color: base,
      image: `url("${texture.url}")`,
      size: "cover"
    };
  }

  const patterns = {
    linen: {
      image: `
        repeating-linear-gradient(
          0deg,
          transparent 0 ${scale - 1}px,
          ${line} ${scale - 1}px ${scale}px
        ),
        repeating-linear-gradient(
          90deg,
          transparent 0 ${scale - 1}px,
          ${line} ${scale - 1}px ${scale}px
        )
      `,
      size: `${scale}px ${scale}px`
    },
    diagonal: {
      image: `repeating-linear-gradient(
        135deg,
        transparent 0 ${scale}px,
        ${line} ${scale}px ${scale + 2}px,
        transparent ${scale + 2}px ${scale * 2}px
      )`,
      size: `${scale * 2}px ${scale * 2}px`
    },
    waves: {
      image: `repeating-radial-gradient(
        ellipse at 50% -10%,
        transparent 0 ${scale}px,
        ${line} ${scale}px ${scale + 2}px,
        transparent ${scale + 2}px ${scale * 2}px
      )`,
      size: `${scale * 2}px ${scale * 2}px`
    },
    crosshatch: {
      image: `
        repeating-linear-gradient(
          45deg,
          transparent 0 ${scale}px,
          ${line} ${scale}px ${scale + 1}px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent 0 ${scale}px,
          ${accent} ${scale}px ${scale + 1}px
        )
      `,
      size: `${scale * 2}px ${scale * 2}px`
    },
    signal: {
      image: `
        repeating-linear-gradient(
          90deg,
          transparent 0 ${scale - 2}px,
          ${line} ${scale - 2}px ${scale}px
        ),
        linear-gradient(
          180deg,
          transparent 44%,
          ${accent} 47% 53%,
          transparent 56%
        )
      `,
      size: `${scale}px ${scale}px, 100% 100%`
    },
    scales: {
      image: `
        radial-gradient(
          circle at 50% 100%,
          transparent 0 45%,
          ${line} 47% 52%,
          transparent 54%
        )
      `,
      size: `${scale}px ${scale}px`
    }
  };

  return {
    color: base,
    ...(patterns[texture.pattern] ?? patterns.linen)
  };
}

function renderDecks(decks, cardTextures = {}) {
  deckRow.replaceChildren();

  decks.forEach((deck) => {
    const card = document.createElement("article");
    const texture = cardTextures[deck.texture] ?? fallbackCardTexture;
    const background = createCardBackground(texture);

    card.className = "deck-card";
    card.dataset.deck = deck.id;
    card.dataset.texture = deck.texture ?? "default";
    card.setAttribute("role", "img");
    card.setAttribute(
      "aria-label",
      `${deck.name}, Deck ${deck.code}`
    );
    card.style.setProperty("--deck-base", background.color);
    card.style.setProperty(
      "--deck-texture",
      deck.backImage
        ? `url("${deck.backImage}")`
        : background.image
    );
    card.style.setProperty(
      "--deck-texture-size",
      deck.backImage ? "cover" : background.size
    );
    deckRow.append(card);
  });
}

// =====================================================
// THREE.JS LABELS
// =====================================================

function createLabelTexture(title, subtitle, isWeather = false) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 1024;
  labelCanvas.height = 512;

  const context = labelCanvas.getContext("2d");
  context.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillStyle = isWeather ? "#ffffff" : "#d8d8d8";
  context.font = "700 62px Arial, Helvetica, sans-serif";
  context.fillText(title.toUpperCase(), 512, 190);

  context.fillStyle = isWeather ? "#bdbdbd" : "#ffffff";
  context.font = isWeather
    ? "700 88px Arial, Helvetica, sans-serif"
    : "700 126px Arial, Helvetica, sans-serif";
  context.fillText(subtitle.toUpperCase(), 512, 315);

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy()
  );
  texture.needsUpdate = true;

  return texture;
}

function createLabelPlane(title, subtitle, width, depth, isWeather = false) {
  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.MeshBasicMaterial({
    map: createLabelTexture(title, subtitle, isWeather),
    transparent: true,
    depthWrite: false,
    toneMapped: false
  });

  const label = new THREE.Mesh(geometry, material);
  label.rotation.x = -Math.PI / 2;
  label.position.y = TILE_HEIGHT / 2 + 0.012;
  label.renderOrder = 3;

  return label;
}

function addTileEdges(mesh, geometry, color = 0xffffff) {
  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.72
  });

  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  mesh.add(edges);
  mesh.userData.edges = edges;
}

// =====================================================
// ORIENTATION GIZMO
// =====================================================

function createAxisLabelSprite(label, color) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 128;
  labelCanvas.height = 128;

  const context = labelCanvas.getContext("2d");
  context.clearRect(0, 0, 128, 128);
  context.beginPath();
  context.arc(64, 64, 52, 0, Math.PI * 2);
  context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  context.fill();

  context.fillStyle = "#ffffff";
  context.font = "700 64px Arial, Helvetica, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, 64, 67);

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    toneMapped: false
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.48, 0.48, 0.48);
  sprite.renderOrder = 10;

  return sprite;
}

function createGizmoAxis(direction, color, label) {
  const axisGroup = new THREE.Group();
  const axisLength = 1.3;
  const negativeLength = 0.62;

  const positiveGeometry = new THREE.CylinderGeometry(
    0.035,
    0.035,
    axisLength,
    12
  );
  const positiveMaterial = new THREE.MeshBasicMaterial({ color });
  const positiveAxis = new THREE.Mesh(positiveGeometry, positiveMaterial);
  positiveAxis.position.copy(direction).multiplyScalar(axisLength / 2);
  positiveAxis.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction
  );
  axisGroup.add(positiveAxis);

  const negativeDirection = direction.clone().negate();
  const negativeGeometry = new THREE.CylinderGeometry(
    0.022,
    0.022,
    negativeLength,
    10
  );
  const negativeMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.28
  });
  const negativeAxis = new THREE.Mesh(negativeGeometry, negativeMaterial);
  negativeAxis.position.copy(negativeDirection).multiplyScalar(
    negativeLength / 2
  );
  negativeAxis.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    negativeDirection
  );
  axisGroup.add(negativeAxis);

  const endpoint = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 18, 12),
    new THREE.MeshBasicMaterial({ color })
  );
  endpoint.position.copy(direction).multiplyScalar(axisLength);
  axisGroup.add(endpoint);

  const labelSprite = createAxisLabelSprite(label, color);
  labelSprite.position.copy(direction).multiplyScalar(axisLength + 0.34);
  axisGroup.add(labelSprite);

  return axisGroup;
}

function initializeOrientationGizmo() {
  gizmoScene = new THREE.Scene();

  gizmoCamera = new THREE.OrthographicCamera(
    -2.25,
    2.25,
    2.25,
    -2.25,
    0.1,
    20
  );

  const backdrop = new THREE.Sprite(
    new THREE.SpriteMaterial({
      color: 0x050505,
      transparent: true,
      opacity: 0.72,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    })
  );
  backdrop.scale.set(4.1, 4.1, 1);
  backdrop.renderOrder = -10;
  gizmoScene.add(backdrop);

  const centerSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 24, 16),
    new THREE.MeshBasicMaterial({
      color: 0xd0d0d0,
      transparent: true,
      opacity: 0.88
    })
  );
  gizmoScene.add(centerSphere);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.13,
    side: THREE.DoubleSide
  });

  const xyRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.04, 0.012, 8, 64),
    ringMaterial
  );
  gizmoScene.add(xyRing);

  const xzRing = xyRing.clone();
  xzRing.rotation.x = Math.PI / 2;
  gizmoScene.add(xzRing);

  const yzRing = xyRing.clone();
  yzRing.rotation.y = Math.PI / 2;
  gizmoScene.add(yzRing);

  gizmoScene.add(
    createGizmoAxis(new THREE.Vector3(1, 0, 0), 0xe74c3c, "X"),
    createGizmoAxis(new THREE.Vector3(0, 1, 0), 0x52c878, "Y"),
    createGizmoAxis(new THREE.Vector3(0, 0, 1), 0x4287f5, "Z")
  );
}

function getGizmoViewport() {
  const width = Math.max(1, boardCanvas.clientWidth);
  const height = Math.max(1, boardCanvas.clientHeight);
  const size = Math.round(
    Math.min(
      GIZMO_MAX_SIZE,
      Math.max(GIZMO_MIN_SIZE, Math.min(width, height) * 0.22)
    )
  );

  return {
    size,
    x: width - size - GIZMO_MARGIN,
    y: height - size - GIZMO_MARGIN
  };
}

function renderOrientationGizmo() {
  if (!gizmoScene || !gizmoCamera || !camera || !controls) return;

  const width = Math.max(1, boardCanvas.clientWidth);
  const height = Math.max(1, boardCanvas.clientHeight);
  const viewport = getGizmoViewport();

  const cameraDirection = camera.position
    .clone()
    .sub(controls.target)
    .normalize();

  gizmoCamera.position.copy(cameraDirection.multiplyScalar(6));
  gizmoCamera.up.copy(camera.up);
  gizmoCamera.lookAt(0, 0, 0);
  gizmoCamera.updateMatrixWorld();

  renderer.clearDepth();
  renderer.setScissorTest(true);
  renderer.setScissor(
    viewport.x,
    viewport.y,
    viewport.size,
    viewport.size
  );
  renderer.setViewport(
    viewport.x,
    viewport.y,
    viewport.size,
    viewport.size
  );
  renderer.render(gizmoScene, gizmoCamera);
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, width, height);
}

// =====================================================
// DATA-DRIVEN THREE.JS TEXTURES
// =====================================================

function createSeededRandom(seedText = "texture") {
  let seed = 2166136261;

  for (const character of seedText) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function drawSurfaceNoise(context, random, accent, amount = 900) {
  context.save();
  context.fillStyle = accent;
  context.globalAlpha = 0.13;

  for (let index = 0; index < amount; index += 1) {
    const size = random() > 0.9 ? 2 : 1;
    const x = Math.floor(random() * context.canvas.width);
    const y = Math.floor(random() * context.canvas.height);
    context.fillRect(x, y, size, size);
  }

  context.restore();
}

function drawStoneTexture(context, config, random, etched = false) {
  const { width, height } = context.canvas;
  const line = config.line ?? "#353535";
  const accent = config.accent ?? "#555555";

  context.lineWidth = etched ? 3 : 2;
  context.strokeStyle = line;
  context.globalAlpha = etched ? 0.7 : 0.48;

  for (let index = 0; index < 28; index += 1) {
    const centerX = random() * width;
    const centerY = random() * height;
    const radius = 18 + random() * 72;
    const points = 5 + Math.floor(random() * 4);

    context.beginPath();

    for (let point = 0; point < points; point += 1) {
      const angle = (point / points) * Math.PI * 2;
      const variation = radius * (0.66 + random() * 0.42);
      const x = centerX + Math.cos(angle) * variation;
      const y = centerY + Math.sin(angle) * variation;

      if (point === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }

    context.closePath();
    context.stroke();
  }

  context.globalAlpha = 0.3;
  context.strokeStyle = accent;

  const lineCount = etched ? 22 : 10;

  for (let index = 0; index < lineCount; index += 1) {
    const startX = random() * width;
    const startY = random() * height;

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(
      startX + (random() - 0.5) * 150,
      startY + (random() - 0.5) * 150
    );
    context.stroke();
  }

  context.globalAlpha = 1;
  drawSurfaceNoise(context, random, accent, etched ? 1250 : 900);
}

function drawWoodTexture(context, config, random) {
  const { width, height } = context.canvas;
  const line = config.line ?? "#262626";
  const accent = config.accent ?? "#414141";

  context.lineWidth = 2;

  for (let row = 0; row < height; row += 14) {
    context.beginPath();
    context.strokeStyle = row % 28 === 0 ? accent : line;
    context.globalAlpha = row % 28 === 0 ? 0.32 : 0.48;

    for (let x = -20; x <= width + 20; x += 12) {
      const y = row + Math.sin((x + row) * 0.035) * 4;

      if (x === -20) context.moveTo(x, y);
      else context.lineTo(x, y);
    }

    context.stroke();
  }

  context.globalAlpha = 0.24;
  context.strokeStyle = accent;

  for (let index = 0; index < 14; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const radiusX = 10 + random() * 26;
    const radiusY = 4 + random() * 9;

    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    context.stroke();
  }

  context.globalAlpha = 1;
  drawSurfaceNoise(context, random, accent, 650);
}

function createProceduralBoardTexture(config = {}) {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 512;
  textureCanvas.height = 512;

  const context = textureCanvas.getContext("2d");
  const pattern = config.pattern ?? "stone";
  const random = createSeededRandom(
    `${pattern}-${config.base}-${config.line}-${config.accent}`
  );

  context.fillStyle = config.base ?? "#111111";
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

  if (pattern === "wood") {
    drawWoodTexture(context, config, random);
  } else {
    drawStoneTexture(
      context,
      config,
      random,
      pattern === "etched-stone"
    );
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const repeat = Array.isArray(config.repeat)
    ? config.repeat
    : [1, 1];

  texture.repeat.set(
    Number(repeat[0]) || 1,
    Number(repeat[1]) || 1
  );

  texture.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy()
  );

  texture.needsUpdate = true;

  return texture;
}

function createBoardTexture(config = {}) {
  if (config.source === "image" && config.url) {
    const texture = new THREE.TextureLoader().load(config.url);
    const repeat = Array.isArray(config.repeat)
      ? config.repeat
      : [1, 1];

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(
      Number(repeat[0]) || 1,
      Number(repeat[1]) || 1
    );

    return texture;
  }

  return createProceduralBoardTexture(config);
}

function createBoardMaterial(config = {}, fallbackColor = 0x111111) {
  const hasTextureConfiguration = Object.keys(config).length > 0;

  return new THREE.MeshStandardMaterial({
    color: hasTextureConfiguration ? 0xffffff : fallbackColor,
    map: hasTextureConfiguration ? createBoardTexture(config) : null,
    emissive: 0x000000,
    roughness: Number(config.roughness ?? 0.9),
    metalness: Number(config.metalness ?? 0.04)
  });
}

// =====================================================
// THREE.JS BOARD GEOMETRY
// =====================================================

function createLocationTile(
  number,
  x,
  z,
  textureConfig,
  column,
  visualRow
) {
  const geometry = new THREE.BoxGeometry(
    TILE_WIDTH,
    TILE_HEIGHT,
    TILE_DEPTH
  );

  const material = createBoardMaterial(textureConfig, 0x080808);

  const tile = new THREE.Mesh(geometry, material);
  tile.position.set(x, TILE_HEIGHT / 2 + 0.02, z);
  tile.castShadow = true;
  tile.receiveShadow = true;
  tile.userData.label = `Board space ${String(number).padStart(2, "0")}`;
  tile.userData.isWeather = false;
  tile.userData.locationId = number;
  tile.userData.boardColumn = column;
  tile.userData.boardRow = visualRow;
  tile.userData.destroyed = false;
  tile.userData.isHollow = false;
  tile.userData.baseEmissive = 0x000000;

  addTileEdges(tile, geometry);

  interactiveTiles.push(tile);
  locationTilesById.set(number, tile);
  locationTilesByCoordinate.set(
    `${column}-${visualRow}`,
    tile
  );
  boardGroup.add(tile);
}

function createWeatherTile(label, width, z, textureConfig) {
  const geometry = new THREE.BoxGeometry(
    width,
    TILE_HEIGHT,
    TILE_DEPTH
  );

  const material = createBoardMaterial(textureConfig, 0x242424);

  const weatherTile = new THREE.Mesh(geometry, material);
  weatherTile.position.set(0, TILE_HEIGHT / 2 + 0.02, z);
  weatherTile.castShadow = true;
  weatherTile.receiveShadow = true;
  weatherTile.userData.label = `Weather road: ${label}`;
  weatherTile.userData.isWeather = true;
  weatherTile.userData.baseEmissive = 0x000000;

  addTileEdges(weatherTile, geometry);

  interactiveTiles.push(weatherTile);
  boardGroup.add(weatherTile);
  weatherRoadTile = weatherTile;
}

function updateWeatherRoadTexture(textureName = "normal") {
  if (!weatherRoadTile) return;

  const textureConfig =
    weatherTextureStates[textureName] ??
    weatherTextureStates.normal ??
    loadedGameData.textures?.board?.weather;

  if (!textureConfig) return;

  const previousMaterial = weatherRoadTile.material;
  const nextMaterial = createBoardMaterial(textureConfig, 0x242424);
  weatherRoadTile.material = nextMaterial;
  weatherRoadTile.userData.weatherTexture = textureName;
  weatherRoadTile.userData.baseEmissive = 0x000000;
  weatherRoadTile.userData.transitionStartedAt = performance.now();
  previousMaterial?.map?.dispose?.();
  previousMaterial?.dispose?.();
}

// =====================================================
// PLAYER SPRITE
// =====================================================

function getMovementPoint(column, row) {
  return boardMovementPoints.get(
    `${column}-${row}`
  );
}

function getPlayerDisplayPoint(playerId, column, row) {
  const point = getMovementPoint(column, row)?.clone();

  if (!point) return null;

  const offsets = {
    1: [-0.34, -0.22],
    2: [0.34, -0.22],
    3: [-0.34, 0.22],
    4: [0.34, 0.22]
  };
  const [xOffset, zOffset] = offsets[playerId] ?? [0, 0];

  point.x += xOffset;
  point.z += zOffset;
  return point;
}

function createPlayerSprite(playerData = {}) {
  if (!playerData.sprite) {
    console.warn(
      `${playerData.name ?? "A player"} does not have a sprite image.`
    );

    return;
  }

  const playerId = Number(playerData.id) || 1;
  const textureLoader = new THREE.TextureLoader();
  let sprite = null;

  const texture = textureLoader.load(
    playerData.sprite,
    (loadedTexture) => {
      /*
        Keep pixel-art sprites sharp instead of
        allowing Three.js to blur the image.
      */

      loadedTexture.magFilter =
        THREE.NearestFilter;

      loadedTexture.minFilter =
        THREE.NearestFilter;

      loadedTexture.colorSpace =
        THREE.SRGBColorSpace;

      const imageWidth =
        loadedTexture.image?.width || 1;

      const imageHeight =
        loadedTexture.image?.height || 1;

      const aspectRatio =
        imageWidth / imageHeight;

      sprite?.scale.set(
          PLAYER_SPRITE_HEIGHT * aspectRatio,
          PLAYER_SPRITE_HEIGHT,
          1
        );
      if (sprite) {
        sprite.userData.baseScale = sprite.scale.clone();
      }
    },

    undefined,

    (error) => {
      console.error(
        `${playerData.name ?? "The player"} sprite could not be loaded.`,
        error
      );
    }
  );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.magFilter =
    THREE.NearestFilter;

  texture.minFilter =
    THREE.NearestFilter;

  const material =
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      toneMapped: false
    });

  sprite = new THREE.Sprite(material);
  sprite.name = playerData.name ?? `Player ${playerId}`;
  sprite.userData.playerId = playerId;
  sprite.scale.set(
    PLAYER_SPRITE_HEIGHT,
    PLAYER_SPRITE_HEIGHT,
    1
  );
  sprite.renderOrder = 10 + playerId;

  const startPosition =
    playerData.startPosition ?? {
      column: 0,
      row: 4
    };

  const position = {
    column:
    THREE.MathUtils.clamp(
      startPosition.column ?? 0,
      0,
      3
    ),
    row:
    THREE.MathUtils.clamp(
      startPosition.row ?? 4,
      0,
      4
    )
  };

  playerSprites.set(playerId, sprite);
  playerPositions.set(playerId, position);
  playerMovementBudgets.set(playerId, 0);

  const startingPoint =
    getPlayerDisplayPoint(
      playerId,
      position.column,
      position.row
    );

  if (startingPoint) {
    sprite.position.copy(startingPoint);
  }

  rememberSpriteRestPose(sprite, sprite.position.y);

  boardGroup.add(sprite);

  if (playerId === activePlayer) {
    playerSprite = sprite;
    playerPosition = position;
  }
}

// =====================================================
// REYATH SPRITE
// =====================================================

function createReyathSprite(reyathData = {}) {
  if (!reyathData.sprite) {
    console.warn("Reyath does not have a sprite image.");
    return;
  }

  const sizeMultiplier = Math.max(
    0.1,
    Number(reyathData.scale) || 2
  );
  const reyathHeight =
    PLAYER_SPRITE_HEIGHT * sizeMultiplier;
  const textureLoader = new THREE.TextureLoader();

  const texture = textureLoader.load(
    reyathData.sprite,
    (loadedTexture) => {
      loadedTexture.magFilter = THREE.NearestFilter;
      loadedTexture.minFilter = THREE.NearestFilter;
      loadedTexture.colorSpace = THREE.SRGBColorSpace;

      const imageWidth = loadedTexture.image?.width || 1;
      const imageHeight = loadedTexture.image?.height || 1;
      const aspectRatio = imageWidth / imageHeight;

      reyathSprite.scale.set(
        reyathHeight * aspectRatio,
        reyathHeight,
        1
      );
      reyathSprite.userData.baseScale = reyathSprite.scale.clone();
    },
    undefined,
    (error) => {
      console.error(
        "The Reyath sprite could not be loaded.",
        error
      );
    }
  );

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.05,
    depthWrite: false,
    toneMapped: false
  });

  reyathSprite = new THREE.Sprite(material);
  reyathSprite.name = reyathData.name ?? "Reyath";
  reyathSprite.scale.set(
    reyathHeight,
    reyathHeight,
    1
  );
  reyathSprite.renderOrder = 11;

  const startPosition =
    reyathData.startPosition ?? {
      column: 3,
      row: 0
    };

  const column = THREE.MathUtils.clamp(
    startPosition.column ?? 3,
    0,
    3
  );
  const row = THREE.MathUtils.clamp(
    startPosition.row ?? 0,
    0,
    4
  );

  reyathPosition.column = column;
  reyathPosition.row = row;
  reyathHollowPosition.column = column;
  reyathHollowPosition.row = row;
  reyathState =
    reyathData.state ??
    loadedGameData?.rules?.reyath?.startingState ??
    "dormant";

  reyathSprite.userData.state = reyathState;

  const hollowTile = locationTilesByCoordinate.get(
    `${column}-${row}`
  );

  if (hollowTile) {
    hollowTile.userData.isHollow = true;
  }

  const startingPoint = getMovementPoint(column, row);

  if (startingPoint) {
    reyathSprite.position.copy(startingPoint);

    // The movement grid stores Player 1's center height.
    // Raise Reyath so the larger sprite still rests on the tile.
    reyathSprite.position.y =
      TILE_HEIGHT + 0.02 + reyathHeight / 2;
  }

  rememberSpriteRestPose(reyathSprite, reyathSprite.position.y);

  boardGroup.add(reyathSprite);
}

// =====================================================
// PRIORITY 0 — REYATH + DEMOLITION RULES
// =====================================================

function getLocationTileAt(column, row) {
  return locationTilesByCoordinate.get(`${column}-${row}`);
}

function getPlayersAtPosition(column, row) {
  const occupants = [];

  playerPositions.forEach((position, playerId) => {
    if (
      !defeatedPlayerIds.has(Number(playerId)) &&
      position.column === column &&
      position.row === row
    ) {
      occupants.push({
        id: playerId,
        name: `Player ${playerId}`
      });
    }
  });

  return occupants;
}

function markLocationDestroyed(tile, tintValue = "#ff3030") {
  if (!tile || tile.userData.destroyed) return false;

  const material = tile.material.clone();
  const destroyedColor = new THREE.Color(tintValue);

  material.color.lerp(destroyedColor, 0.58);
  material.emissive.copy(destroyedColor).multiplyScalar(0.12);
  material.needsUpdate = true;
  tile.material = material;
  tile.userData.destroyed = true;
  tile.userData.baseEmissive = material.emissive.getHex();
  tile.userData.destroyedAt = performance.now();
  destroyedLocationIds.add(tile.userData.locationId);

  return true;
}

function resolveDemolitionRequest(detail = {}) {
  const rules = {
    saveRolls: [1, 2, 3],
    destroyRolls: [4, 5, 6],
    destroyedTint: "#ff3030",
    hollowIsIndestructible: true,
    ...detail.rules
  };
  const tile = getLocationTileAt(
    reyathPosition.column,
    reyathPosition.row
  );

  if (!tile) {
    detail.message =
      "Demolition had no effect because Reyath is not standing on a location tile.";
    return;
  }

  if (rules.hollowIsIndestructible && tile.userData.isHollow) {
    detail.message = "The Hollow cannot be demolished.";
    return;
  }

  if (tile.userData.destroyed) {
    detail.message =
      `${tile.userData.label} was already demolished, so it cannot be destroyed twice.`;
    return;
  }

  const occupants = getPlayersAtPosition(
    reyathPosition.column,
    reyathPosition.row
  );
  const saveRolls = new Set(
    (rules.saveRolls ?? [1, 2, 3]).map(Number)
  );
  const playerRolls = occupants.map((player) => ({
    ...player,
    roll: Math.floor(Math.random() * 6) + 1
  }));
  const successfulSave = playerRolls.find((result) =>
    saveRolls.has(result.roll)
  );

  if (successfulSave) {
    detail.message =
      `${successfulSave.name} rolled ${successfulSave.roll} and saved ${tile.userData.label} from Demolition.`;
    window.dispatchEvent(
      new CustomEvent("wrath:demolition-resolved", {
        detail: {
          destroyed: false,
          saved: true,
          locationId: tile.userData.locationId,
          playerRolls
        }
      })
    );
    return;
  }

  markLocationDestroyed(tile, rules.destroyedTint);

  const failedRollText = playerRolls.length
    ? ` ${playerRolls.map((result) =>
        `${result.name} rolled ${result.roll}`
      ).join("; ")}.`
    : "";

  detail.message =
    `${tile.userData.label} was demolished and remains traversable.${failedRollText}`;

  window.dispatchEvent(
    new CustomEvent("wrath:demolition-resolved", {
      detail: {
        destroyed: true,
        saved: false,
        locationId: tile.userData.locationId,
        playerRolls
      }
    })
  );

  const destructibleLocations = [...locationTilesById.values()]
    .filter((locationTile) => !locationTile.userData.isHollow);

  if (
    destructibleLocations.length > 0 &&
    destructibleLocations.every(
      (locationTile) => locationTile.userData.destroyed
    )
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "wrath:all-destructible-locations-destroyed"
      )
    );
  }
}

function setReyathState(nextState) {
  reyathState = nextState;

  if (reyathSprite) {
    reyathSprite.userData.state = nextState;
  }

  window.dispatchEvent(
    new CustomEvent("wrath:reyath-state-change", {
      detail: { state: nextState }
    })
  );
}

function moveReyathToHollow(damage = 1) {
  reyathPosition.column = reyathHollowPosition.column;
  reyathPosition.row = reyathHollowPosition.row;

  const hollowPoint = getMovementPoint(
    reyathPosition.column,
    reyathPosition.row
  );

  if (reyathSprite && hollowPoint) {
    const start = reyathSprite.position.clone();
    const destination = hollowPoint.clone();
    destination.y =
      TILE_HEIGHT +
      0.02 +
      (reyathSprite.userData.baseScale?.y ?? reyathSprite.scale.y) / 2;
    const startedAt = performance.now();
    const duration = reducedMotionQuery.matches ? 1 : 680;
    reyathSprite.userData.isPathAnimating = true;
    reyathSprite.userData.animationState = "retreating";
    playGameSound("damage");

    function animateRetreat(time) {
      const progress = Math.min((time - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      reyathSprite.position.lerpVectors(start, destination, eased);
      reyathSprite.position.y +=
        Math.sin(progress * Math.PI) *
        (reducedMotionQuery.matches ? 0 : 1.4);
      reyathSprite.material.opacity = 1 - Math.sin(progress * Math.PI) * 0.58;

      if (progress < 1) {
        requestAnimationFrame(animateRetreat);
        return;
      }

      reyathSprite.position.copy(destination);
      reyathSprite.userData.groundY = destination.y;
      reyathSprite.userData.isPathAnimating = false;
      reyathSprite.userData.animationState = "idle";
      resetSpriteVisuals(reyathSprite, 0.78);
      setReyathState("dormant");
    }

    requestAnimationFrame(animateRetreat);
  } else {
    setReyathState("dormant");
  }

  boardStatus.textContent =
    `Reyath took ${damage} damage and retreated to the Hollow.`;
}

// =====================================================
// PLAYER MOVEMENT
// =====================================================

function animatePlayerMovement(
  destinationColumn,
  destinationRow
) {
  if (
    gameOver ||
    encounterSequenceActive ||
    !playerSprite ||
    playerMoving
  ) {
    return;
  }

  const destination =
    getPlayerDisplayPoint(
      activePlayer,
      destinationColumn,
      destinationRow
    );

  if (!destination) {
    return;
  }

  playerMoving = true;
  playerSprite.userData.isPathAnimating = true;
  playerSprite.userData.animationState = "moving";
  playerSprite.userData.animationUntil = 0;
  playGameSound("move");

  const startingPosition =
    playerSprite.position.clone();

  const endingPosition =
    destination.clone();

  const animationStart =
    performance.now();

  function animate(currentTime) {
    const elapsed =
      currentTime - animationStart;

    const progress =
      Math.min(
        elapsed / PLAYER_MOVE_DURATION,
        1
      );

    /*
      Smooth acceleration and deceleration.
    */

    const easedProgress =
      progress < 0.5
        ? 2 * progress * progress
        : 1 -
          Math.pow(
            -2 * progress + 2,
            2
          ) / 2;

    playerSprite.position.x =
      THREE.MathUtils.lerp(
        startingPosition.x,
        endingPosition.x,
        easedProgress
      );

    playerSprite.position.z =
      THREE.MathUtils.lerp(
        startingPosition.z,
        endingPosition.z,
        easedProgress
      );

    /*
      Create the upward jump arc.
    */

    const jumpOffset =
      Math.sin(progress * Math.PI) *
      PLAYER_JUMP_HEIGHT;

    playerSprite.position.y =
      THREE.MathUtils.lerp(
        startingPosition.y,
        endingPosition.y,
        easedProgress
      ) + jumpOffset;

    if (!reducedMotionQuery.matches) {
      const baseScale =
        playerSprite.userData.baseScale ?? playerSprite.scale;
      const stretch = Math.sin(progress * Math.PI);
      const direction = destinationColumn - playerPosition.column;
      const facing = direction < 0 ? -1 : direction > 0 ? 1 : Math.sign(playerSprite.scale.x) || 1;
      playerSprite.scale.set(
        Math.abs(baseScale.x) * facing * (1 - stretch * 0.08),
        baseScale.y * (1 + stretch * 0.13),
        baseScale.z
      );
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
      return;
    }

    playerSprite.position.copy(
      endingPosition
    );
    playerSprite.userData.groundY = endingPosition.y;
    playerSprite.userData.isPathAnimating = false;
    playerSprite.userData.animationState = "idle";
    resetSpriteVisuals(playerSprite, 1);

    playerPosition.column =
      destinationColumn;

    playerPosition.row =
      destinationRow;

    activePlayerMovement = Math.max(
      0,
      activePlayerMovement - 1
    );
    playerMovementBudgets.set(
      activePlayer,
      activePlayerMovement
    );

    playerMoving = false;
    updateTurnInterface();

    const onWeatherRoad =
      destinationRow === 2;

    boardStatus.textContent =
      onWeatherRoad
        ? `Player ${activePlayer} is on the weather road, position ${destinationColumn + 1}. ${activePlayerMovement} move${activePlayerMovement === 1 ? "" : "s"} remaining.`
        : `Player ${activePlayer} moved to column ${destinationColumn + 1}, row ${destinationRow + 1}. ${activePlayerMovement} move${activePlayerMovement === 1 ? "" : "s"} remaining.`;

    window.dispatchEvent(
      new CustomEvent("wrath:player-step-complete", {
        detail: {
          playerId: activePlayer,
          column: destinationColumn,
          row: destinationRow,
          remainingMoves: activePlayerMovement
        }
      })
    );

    const collidedWithReyath =
      destinationColumn === reyathPosition.column &&
      destinationRow === reyathPosition.row;

    if (collidedWithReyath) {
      queueReyathEncounter({
        playerId: activePlayer,
        reason: "player-entered-reyath-tile",
        column: destinationColumn,
        row: destinationRow
      });
    } else if (activePlayerMovement === 0) {
      window.setTimeout(() => {
        completeActivePlayerTurn();
      }, 420);
    }
  }

  requestAnimationFrame(animate);
}

function movePlayer(
  columnChange,
  rowChange,
  { automated = false } = {}
) {
  if (
    !playerSprite ||
    playerMoving ||
    encounterSequenceActive ||
    turnPhase !== "moving" ||
    (isActivePlayerAutomated() && !automated)
  ) {
    return;
  }

  if (activePlayerMovement <= 0) {
    boardStatus.textContent =
      `Player ${activePlayer} has no tile moves remaining.`;
    return;
  }

  const nextColumn =
    playerPosition.column +
    columnChange;

  const nextRow =
    playerPosition.row +
    rowChange;

  /*
    Stop movement outside the 4 × 5 grid.
  */

  const outsideBoard =
    nextColumn < 0 ||
    nextColumn > 3 ||
    nextRow < 0 ||
    nextRow > 4;

  if (outsideBoard) {
    boardStatus.textContent =
      `Player ${activePlayer} cannot move beyond the board.`;

    return;
  }

  const movementPermission = {
    playerId: activePlayer,
    from: {
      column: playerPosition.column,
      row: playerPosition.row
    },
    to: {
      column: nextColumn,
      row: nextRow
    },
    allowed: true,
    reason: ""
  };

  window.dispatchEvent(
    new CustomEvent("wrath:movement-permission-query", {
      detail: movementPermission
    })
  );

  if (!movementPermission.allowed) {
    boardStatus.textContent = movementPermission.reason ||
      `Player ${activePlayer} cannot enter that space.`;
    return;
  }

  const destination =
    getMovementPoint(
      nextColumn,
      nextRow
    );

  if (!destination) {
    console.warn(
      "No movement point was found:",
      {
        column: nextColumn,
        row: nextRow
      }
    );

    boardStatus.textContent =
      `Missing movement point at column ${nextColumn}, row ${nextRow}.`;

    return;
  }

  boardStatus.textContent =
    `Moving Player ${activePlayer} from column ${playerPosition.column}, row ${playerPosition.row} to column ${nextColumn}, row ${nextRow}.`;

  animatePlayerMovement(
    nextColumn,
    nextRow
  );
}

function movePlayersToOppositeSideOfRoad() {
  playerPositions.forEach((position, playerId) => {
    const destinationRow = 4 - position.row;
    position.row = destinationRow;

    const sprite = playerSprites.get(playerId);
    const destination = getPlayerDisplayPoint(
      playerId,
      position.column,
      destinationRow
    );

    if (sprite && destination) {
      sprite.position.copy(destination);
      sprite.userData.groundY = destination.y;
      setPlayerAnimationState(playerId, "perk", 720);
    }
  });

  if (playerPositions.has(activePlayer)) {
    playerPosition = playerPositions.get(activePlayer);
    playerSprite = playerSprites.get(activePlayer);
  }

  boardStatus.textContent =
    "Strong Winds moved every player to the opposite side of the weather road.";
  playGameSound("weather");
}

// =====================================================
// GAME SETUP + TURN INTERFACE
// =====================================================

function getPlayerCountBounds() {
  const playerRules = loadedGameData.rules?.player ?? {};

  return {
    minimum: THREE.MathUtils.clamp(
      Number(playerRules.minPlayers) || 1,
      1,
      4
    ),
    maximum: THREE.MathUtils.clamp(
      Number(playerRules.maxPlayers) || 4,
      1,
      4
    )
  };
}

function getConfiguredPlayer(playerId) {
  return loadedGameData.players?.find(
    (player) => Number(player.id) === Number(playerId)
  ) ?? null;
}

function isPlayerAutomated(playerId) {
  const player = getConfiguredPlayer(playerId);
  return Boolean(
    player &&
    (
      player.controlType === "bot" ||
      (player.controlType === "human" && autoplayEnabled)
    )
  );
}

function isActivePlayerAutomated() {
  return gameStarted && isPlayerAutomated(activePlayer);
}

function getAutomationThinkDelay(multiplier = 1) {
  if (reducedMotionQuery.matches) return 20;
  const baseDelay = Math.max(
    120,
    Number(loadedGameData.rules?.automation?.thinkDelay) || 420
  );
  return Math.round(baseDelay * multiplier);
}

function getPlayerAutomationSnapshot(playerId) {
  const detail = {
    playerId: Number(playerId),
    health: 5,
    maxHealth: 5,
    armor: 0,
    maxArmor: 5,
    inventoryCount: 0
  };
  window.dispatchEvent(
    new CustomEvent("wrath:automation-state-query", { detail })
  );
  return detail;
}

function getPlayerAutomationStrategy(playerId) {
  const player = getConfiguredPlayer(playerId);
  const configured =
    loadedGameData.rules?.automation?.strategies?.[
      player?.characterName
    ] ?? {};
  return {
    style: configured.style ?? "balanced",
    preferredAxis: configured.preferredAxis ?? "column",
    finishWhenHealthAtOrBelow: Math.max(
      0,
      Number(configured.finishWhenHealthAtOrBelow) || 0
    ),
    cautionDistance: Math.max(
      0,
      Number(configured.cautionDistance) || 0
    ),
    randomStepChance: THREE.MathUtils.clamp(
      Number(configured.randomStepChance) || 0,
      0,
      1
    )
  };
}

function updateAutoplayControl() {
  if (!autoplayToggleButton) return;
  autoplayToggleButton.disabled = !gameStarted || gameOver;
  autoplayToggleButton.setAttribute(
    "aria-pressed",
    String(autoplayEnabled)
  );
  autoplayToggleButton.textContent =
    `Autoplay: ${autoplayEnabled ? "On" : "Off"}`;
}

function setAutoplayEnabled(enabled) {
  if (!gameStarted || gameOver) return;
  autoplayEnabled = Boolean(enabled);
  automationRunId += 1;
  updateAutoplayControl();
  updateTurnInterface();
  window.dispatchEvent(
    new CustomEvent("wrath:autoplay-change", {
      detail: {
        enabled: autoplayEnabled,
        playerId: activePlayer
      }
    })
  );
  appendGameLog(
    autoplayEnabled
      ? "Autoplay enabled for all human-controlled characters."
      : "Autoplay disabled. Human-controlled characters are manual again."
  );

  if (autoplayEnabled) {
    window.setTimeout(
      () => resumeAutomationForCurrentPhase(),
      getAutomationThinkDelay(0.35)
    );
  }
}

function getPhaseDisplayName() {
  const labels = {
    loading: "Loading",
    setup: "Game setup",
    transitioning: "Changing turns",
    "awaiting-roll": `Player ${activePlayer}: roll dice`,
    rolling: `Player ${activePlayer}: rolling dice`,
    "resolving-card": `Player ${activePlayer}: resolving card`,
    moving: `Player ${activePlayer}: movement`,
    encounter: "Reyath encounter",
    reyath: "Reyath's turn",
    "game-over": "Game over"
  };

  return labels[turnPhase] ?? "Game in progress";
}

function updateTurnInterface() {
  turnPhaseLabel.textContent = getPhaseDisplayName();
  remainingMovesLabel.textContent =
    `Moves: ${Math.max(0, activePlayerMovement)}`;

  finishMovementButton.disabled =
    !gameStarted ||
    gameOver ||
    turnPhase !== "moving" ||
    activePlayerMovement <= 0 ||
    playerMoving ||
    turnTransitioning ||
    pendingTurnCompletion ||
    isActivePlayerAutomated();

  rollButton.disabled =
    !gameStarted ||
    gameOver ||
    turnPhase !== "awaiting-roll" ||
    diceState !== "idle" ||
    turnTransitioning ||
    isActivePlayerAutomated();

  updateAutoplayControl();
}

function ensureSetupSelections() {
  const usedIds = new Set();

  for (let index = 0; index < setupPlayerCount; index += 1) {
    const character = setupCharacterSelections[index];

    if (!character || usedIds.has(character.rosterId)) {
      setupCharacterSelections[index] = null;
      continue;
    }

    usedIds.add(character.rosterId);
  }

  for (let index = 0; index < setupPlayerCount; index += 1) {
    if (setupCharacterSelections[index]) continue;

    const availableCharacter = characterRoster.find(
      (character) => !usedIds.has(character.rosterId)
    );

    if (availableCharacter) {
      setupCharacterSelections[index] = availableCharacter;
      usedIds.add(availableCharacter.rosterId);
    }
  }

  for (let index = 0; index < setupPlayerCount; index += 1) {
    if (!setupControlSelections[index]) {
      setupControlSelections[index] = index === 0 ? "human" : "bot";
    }
  }
}

function renderCharacterSelection() {
  ensureSetupSelections();
  characterSelectionGrid.replaceChildren();

  for (let index = 0; index < setupPlayerCount; index += 1) {
    const selectedCharacter = setupCharacterSelections[index];
    const playerNumber = index + 1;
    const card = document.createElement("article");
    card.className = "character-selection-card";

    const controllerToggle = document.createElement("button");
    const controllerType = setupControlSelections[index] ?? "bot";
    controllerToggle.type = "button";
    controllerToggle.className = "controller-type-toggle";
    controllerToggle.dataset.controller = controllerType;
    controllerToggle.textContent = controllerType === "human"
      ? "Player"
      : "Bot";
    controllerToggle.setAttribute(
      "aria-label",
      `Player ${playerNumber} controller: ${controllerType === "human" ? "human player" : "bot"}. Click to change.`
    );
    controllerToggle.addEventListener("click", () => {
      setupControlSelections[index] =
        setupControlSelections[index] === "human" ? "bot" : "human";
      renderCharacterSelection();
    });

    const portrait = document.createElement("img");
    portrait.className = "character-selection-portrait";
    portrait.src = selectedCharacter?.sprite ?? "";
    portrait.alt = selectedCharacter
      ? `${selectedCharacter.characterName} portrait`
      : "Character portrait";

    const label = document.createElement("label");
    label.htmlFor = `player-${playerNumber}-character`;
    label.textContent = `Player ${playerNumber}`;

    const select = document.createElement("select");
    select.id = `player-${playerNumber}-character`;
    select.dataset.playerIndex = String(index);
    select.setAttribute(
      "aria-label",
      `Choose Player ${playerNumber}'s character`
    );

    characterRoster.forEach((character) => {
      const option = document.createElement("option");
      option.value = character.rosterId;
      option.textContent = character.characterName;
      option.selected =
        character.rosterId === selectedCharacter?.rosterId;
      select.append(option);
    });

    select.addEventListener("change", () => {
      const nextCharacter = characterRoster.find(
        (character) => character.rosterId === select.value
      );

      if (!nextCharacter) return;

      const previousCharacter = setupCharacterSelections[index];
      const duplicateIndex = setupCharacterSelections
        .slice(0, setupPlayerCount)
        .findIndex(
          (character, candidateIndex) =>
            candidateIndex !== index &&
            character?.rosterId === nextCharacter.rosterId
        );

      setupCharacterSelections[index] = nextCharacter;

      if (duplicateIndex >= 0) {
        setupCharacterSelections[duplicateIndex] = previousCharacter;
      }

      gameSetupError.textContent = "";
      renderCharacterSelection();
    });

    card.append(controllerToggle, portrait, label, select);
    characterSelectionGrid.append(card);
  }

  playerCountOutput.textContent =
    `${setupPlayerCount} player${setupPlayerCount === 1 ? "" : "s"}`;

  const { minimum, maximum } = getPlayerCountBounds();
  playerCountDecreaseButton.disabled = setupPlayerCount <= minimum;
  playerCountIncreaseButton.disabled = setupPlayerCount >= maximum;
}

function changeSetupPlayerCount(amount) {
  const { minimum, maximum } = getPlayerCountBounds();
  setupPlayerCount = THREE.MathUtils.clamp(
    setupPlayerCount + amount,
    minimum,
    maximum
  );
  gameSetupError.textContent = "";
  renderCharacterSelection();
}

function configureGameSetup(data) {
  characterRoster = data.players.map((player, index) => ({
    rosterId: `character-${index + 1}`,
    characterName: player.characterName ?? `Character ${index + 1}`,
    sprite: player.sprite,
    startPosition: {
      column: Number(player.startPosition?.column) || 0,
      row: Number(player.startPosition?.row) || 0
    }
  }));

  const { maximum } = getPlayerCountBounds();
  setupPlayerCount = Math.min(maximum, characterRoster.length);
  setupCharacterSelections = characterRoster.slice();
  const defaultHumanPlayers = THREE.MathUtils.clamp(
    Number(data.rules?.automation?.defaultHumanPlayers) || 1,
    0,
    setupPlayerCount
  );
  setupControlSelections = Array.from(
    { length: setupPlayerCount },
    (_, index) => index < defaultHumanPlayers ? "human" : "bot"
  );
  turnPhase = "setup";
  rollButton.disabled = true;
  renderCharacterSelection();
  updateTurnInterface();
}

async function startConfiguredGame() {
  const chosenCharacters = setupCharacterSelections.slice(
    0,
    setupPlayerCount
  );
  const uniqueCharacters = new Set(
    chosenCharacters.map((character) => character?.rosterId)
  );

  if (
    chosenCharacters.some((character) => !character) ||
    uniqueCharacters.size !== chosenCharacters.length
  ) {
    gameSetupError.textContent =
      "Each participating player must use a different character.";
    return;
  }

  startGameButton.disabled = true;
  loadedGameData.players = chosenCharacters.map((character, index) => ({
    id: index + 1,
    name: `Player ${index + 1}`,
    characterName: character.characterName,
    sprite: character.sprite,
    startPosition: { ...character.startPosition },
    controlType: setupControlSelections[index] ?? "bot"
  }));

  gameOver = false;
  defeatedPlayerIds.clear();
  boardEventLog?.replaceChildren();
  gameOverLayer.hidden = true;

  activePlayer = 1;
  currentRound = 1;
  queuedReyathMovement = 0;
  queuedReyathAttacks = [];
  reyathMovementMode = "nearest-player";
  reyathPatrolDirection = -1;
  pendingTurnCompletion = false;
  encounterSequenceActive = false;
  encounterFeedbackActive = false;
  encounterRollRequest = null;
  activeReyathCard = null;
  playerMovementBudgets.clear();
  activePlayerMovement = 0;
  autoplayEnabled = false;
  automationRunId += 1;
  automatedMovementRunning = false;
  currentReyathMaxHealth = Math.max(
    1,
    Number(loadedGameData.reyath?.maxHealth) || 20
  );
  currentReyathHealth = THREE.MathUtils.clamp(
    Number(loadedGameData.reyath?.health) || currentReyathMaxHealth,
    0,
    currentReyathMaxHealth
  );

  if (!renderer || !scene) {
    gameSetupError.textContent =
      "This game requires WebGL for the Three.js board and dice. Enable hardware acceleration or open it in a WebGL-capable browser.";
    startGameButton.disabled = false;
    return;
  }

  buildThreeBoard(
    loadedGameData.board,
    loadedGameData.textures?.board,
    loadedGameData.players,
    loadedGameData.reyath
  );
  renderPlayers(
    loadedGameData.players,
    loadedGameData.textures?.ui
  );

  gameStarted = true;
  gameSetupLayer.hidden = true;

  window.dispatchEvent(
    new CustomEvent("wrath:ready", {
      detail: {
        data: loadedGameData,
        playerId: activePlayer
      }
    })
  );

  await beginPlayerTurn(loadedGameData.players[0].id);
}

function returnToGameSetup() {
  gameStarted = false;
  gameOver = false;
  turnPhase = "setup";
  turnTransitioning = false;
  pendingTurnCompletion = false;
  encounterSequenceActive = false;
  encounterFeedbackActive = false;
  encounterRollRequest = null;
  activeReyathCard = null;
  queuedReyathMovement = 0;
  queuedReyathAttacks = [];
  defeatedPlayerIds.clear();
  playerMovementBudgets.clear();
  activePlayerMovement = 0;
  autoplayEnabled = false;
  automationRunId += 1;
  automatedMovementRunning = false;
  currentReyathMaxHealth = Math.max(
    1,
    Number(loadedGameData.reyath?.maxHealth) || 20
  );
  currentReyathHealth = currentReyathMaxHealth;

  gameOverLayer.hidden = true;
  encounterLayer.hidden = true;
  encounterLayer.classList.remove("is-visible", "is-interactive");
  turnTransitionLayer.hidden = true;
  turnTransitionLayer.classList.remove("is-visible");
  gameSetupLayer.hidden = false;
  startGameButton.disabled = false;
  rollButton.disabled = true;
  finishMovementButton.disabled = true;
  boardEventLog?.replaceChildren();

  const { maximum } = getPlayerCountBounds();
  setupPlayerCount = Math.min(maximum, characterRoster.length);
  setupCharacterSelections = characterRoster.slice();
  setupControlSelections = Array.from(
    { length: setupPlayerCount },
    (_, index) => index === 0 ? "human" : "bot"
  );
  renderCharacterSelection();
  diceStatus.textContent = "Choose players to begin a new game.";
  boardStatus.textContent = "Game setup reopened.";
  updateTurnInterface();

  window.dispatchEvent(new CustomEvent("wrath:reset-game"));
}

function finishActivePlayerMovement({ automated = false } = {}) {
  if (
    !gameStarted ||
    turnPhase !== "moving" ||
    playerMoving ||
    encounterSequenceActive ||
    pendingTurnCompletion ||
    (isActivePlayerAutomated() && !automated)
  ) {
    return;
  }

  activePlayerMovement = 0;
  playerMovementBudgets.set(activePlayer, 0);
  updateTurnInterface();

  window.dispatchEvent(
    new CustomEvent("wrath:player-step-complete", {
      detail: {
        playerId: activePlayer,
        column: playerPosition.column,
        row: playerPosition.row,
        remainingMoves: 0,
        finishedEarly: true
      }
    })
  );

  boardStatus.textContent =
    `Player ${activePlayer} finished movement early.`;
  completeActivePlayerTurn();
}

function getLegalAutomatedSteps(playerId) {
  const position = playerPositions.get(Number(playerId));
  if (!position) return [];

  const directions = [
    { columnChange: 1, rowChange: 0, axis: "column" },
    { columnChange: -1, rowChange: 0, axis: "column" },
    { columnChange: 0, rowChange: 1, axis: "row" },
    { columnChange: 0, rowChange: -1, axis: "row" }
  ];

  return directions
    .map((direction) => ({
      ...direction,
      column: position.column + direction.columnChange,
      row: position.row + direction.rowChange
    }))
    .filter((destination) =>
      destination.column >= 0 &&
      destination.column <= 3 &&
      destination.row >= 0 &&
      destination.row <= 4
    )
    .filter((destination) => {
      const permission = {
        playerId: Number(playerId),
        from: { ...position },
        to: {
          column: destination.column,
          row: destination.row
        },
        allowed: true,
        reason: ""
      };
      window.dispatchEvent(
        new CustomEvent("wrath:movement-permission-query", {
          detail: permission
        })
      );
      return permission.allowed;
    });
}

function chooseAutomatedPlayerStep(playerId) {
  const strategy = getPlayerAutomationStrategy(playerId);
  const legalSteps = getLegalAutomatedSteps(playerId);
  if (legalSteps.length === 0) return null;

  if (Math.random() < strategy.randomStepChance) {
    return legalSteps[Math.floor(Math.random() * legalSteps.length)];
  }

  return legalSteps
    .map((step) => ({
      ...step,
      distance:
        Math.abs(step.column - reyathPosition.column) +
        Math.abs(step.row - reyathPosition.row),
      axisPreference: step.axis === strategy.preferredAxis ? 0 : 1
    }))
    .sort((first, second) =>
      first.distance - second.distance ||
      first.axisPreference - second.axisPreference ||
      first.row - second.row ||
      first.column - second.column
    )[0];
}

function shouldAutomatedPlayerFinishEarly(playerId) {
  const player = getConfiguredPlayer(playerId);
  if (!player || player.controlType !== "bot") return false;

  const strategy = getPlayerAutomationStrategy(playerId);
  if (strategy.finishWhenHealthAtOrBelow <= 0) return false;

  const state = getPlayerAutomationSnapshot(playerId);
  const position = playerPositions.get(Number(playerId));
  if (!position) return false;
  const distanceToReyath =
    Math.abs(position.column - reyathPosition.column) +
    Math.abs(position.row - reyathPosition.row);

  return (
    state.health <= strategy.finishWhenHealthAtOrBelow &&
    state.armor <= 0 &&
    distanceToReyath <= strategy.cautionDistance
  );
}

async function runAutomatedMovementTurn(playerId, runId = automationRunId) {
  if (automatedMovementRunning || !isPlayerAutomated(playerId)) return;
  automatedMovementRunning = true;

  try {
    while (
      !gameOver &&
      runId === automationRunId &&
      Number(activePlayer) === Number(playerId) &&
      isPlayerAutomated(playerId)
    ) {
      while (
        !gameOver &&
        runId === automationRunId &&
        (playerMoving || encounterSequenceActive)
      ) {
        await waitFor(80);
      }

      if (
        turnPhase !== "moving" ||
        activePlayerMovement <= 0 ||
        pendingTurnCompletion
      ) {
        break;
      }

      if (shouldAutomatedPlayerFinishEarly(playerId)) {
        boardStatus.textContent =
          `Player ${playerId}'s ${getPlayerAutomationStrategy(playerId).style} bot finished movement to avoid a risky encounter.`;
        finishActivePlayerMovement({ automated: true });
        break;
      }

      const step = chooseAutomatedPlayerStep(playerId);
      if (!step) {
        boardStatus.textContent =
          `Player ${playerId}'s bot found no legal movement path.`;
        finishActivePlayerMovement({ automated: true });
        break;
      }

      const previousColumn = playerPosition.column;
      const previousRow = playerPosition.row;
      movePlayer(
        step.columnChange,
        step.rowChange,
        { automated: true }
      );

      while (
        !gameOver &&
        runId === automationRunId &&
        (playerMoving || encounterSequenceActive)
      ) {
        await waitFor(80);
      }

      if (
        playerPosition.column === previousColumn &&
        playerPosition.row === previousRow &&
        turnPhase === "moving"
      ) {
        finishActivePlayerMovement({ automated: true });
        break;
      }

      await waitFor(getAutomationThinkDelay(0.35));
    }
  } finally {
    automatedMovementRunning = false;
    updateTurnInterface();
  }
}

function resumeAutomationForCurrentPhase() {
  if (
    !gameStarted ||
    gameOver ||
    turnTransitioning ||
    !isActivePlayerAutomated()
  ) {
    return;
  }

  const playerId = activePlayer;
  const runId = automationRunId;

  if (turnPhase === "awaiting-roll") {
    rollDice({ automated: true });
    return;
  }

  if (turnPhase === "moving") {
    runAutomatedMovementTurn(playerId, runId);
    return;
  }

  if (turnPhase === "encounter" && encounterRollRequest) {
    handleEncounterRollButton();
  }
}

function getInventoryPanelBounds() {
  return {
    minimum: 110,
    maximum: Math.max(
      150,
      Math.min(420, Math.round(window.innerHeight * 0.46))
    )
  };
}

function setInventoryPanelHeight(nextHeight, persist = true) {
  const { minimum, maximum } = getInventoryPanelBounds();
  inventoryPanelHeight = THREE.MathUtils.clamp(
    Math.round(Number(nextHeight) || minimum),
    minimum,
    maximum
  );

  document.documentElement.style.setProperty(
    "--inventory-panel-height",
    `${inventoryPanelHeight}px`
  );
  inventoryResizer.setAttribute(
    "aria-valuenow",
    String(inventoryPanelHeight)
  );
  inventoryResizer.setAttribute("aria-valuemax", String(maximum));

  if (persist) {
    try {
      localStorage.setItem(
        "wrath-inventory-panel-height",
        String(inventoryPanelHeight)
      );
    } catch {
      // Storage may be unavailable in privacy-restricted previews.
    }
  }

  requestAnimationFrame(() => {
    resizeThreeBoard();
  });
}

function resetInventoryPanelHeight() {
  const defaultHeight = THREE.MathUtils.clamp(
    Math.round(window.innerHeight * 0.22),
    150,
    250
  );
  setInventoryPanelHeight(defaultHeight);
}

function initializeInventoryResizer() {
  let savedHeight = null;

  try {
    savedHeight = Number(
      localStorage.getItem("wrath-inventory-panel-height")
    );
  } catch {
    savedHeight = null;
  }

  if (Number.isFinite(savedHeight) && savedHeight > 0) {
    setInventoryPanelHeight(savedHeight, false);
  } else {
    resetInventoryPanelHeight();
  }
}

function beginInventoryResize(event) {
  if (event.button !== 0) return;

  inventoryResizeStartY = event.clientY;
  inventoryResizeStartHeight = inventoryPanelHeight;
  inventoryResizer.classList.add("is-resizing");
  document.body.classList.add("is-resizing-panels");
  inventoryResizer.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function continueInventoryResize(event) {
  if (!inventoryResizer.classList.contains("is-resizing")) return;

  const verticalDifference = inventoryResizeStartY - event.clientY;
  setInventoryPanelHeight(
    inventoryResizeStartHeight + verticalDifference,
    false
  );
}

function finishInventoryResize(event) {
  if (!inventoryResizer.classList.contains("is-resizing")) return;

  inventoryResizer.classList.remove("is-resizing");
  document.body.classList.remove("is-resizing-panels");
  inventoryResizer.releasePointerCapture?.(event.pointerId);
  setInventoryPanelHeight(inventoryPanelHeight, true);
}

function handleInventoryResizerKeyboard(event) {
  const changes = {
    ArrowUp: 18,
    ArrowDown: -18,
    PageUp: 48,
    PageDown: -48
  };

  if (event.code === "Home") {
    event.preventDefault();
    resetInventoryPanelHeight();
    return;
  }

  const change = changes[event.code];

  if (!change) return;

  event.preventDefault();
  setInventoryPanelHeight(inventoryPanelHeight + change);
}

// =====================================================
// TURN ORDER + AUTONOMOUS REYATH
// =====================================================

function waitFor(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

// =====================================================
// PRIORITY 4 — MOTION + PROCEDURAL SOUND
// =====================================================

function getAudioContext() {
  if (!soundEnabled) return null;

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function playTone({
  frequency = 220,
  endFrequency = frequency,
  duration = 0.12,
  gain = 0.04,
  type = "square",
  delay = 0
} = {}) {
  const context = getAudioContext();
  if (!context) return;

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(20, endFrequency),
    start + duration
  );
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + 0.015);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playGameSound(cue) {
  if (!soundEnabled) return;

  const sounds = {
    move: [
      { frequency: 150, endFrequency: 190, duration: 0.07, gain: 0.025 }
    ],
    dice: [
      { frequency: 130, endFrequency: 260, duration: 0.16, gain: 0.035, type: "triangle" },
      { frequency: 210, endFrequency: 170, duration: 0.08, gain: 0.02, delay: 0.16 }
    ],
    card: [
      { frequency: 320, endFrequency: 620, duration: 0.18, gain: 0.03, type: "triangle" }
    ],
    turn: [
      { frequency: 220, endFrequency: 330, duration: 0.12, gain: 0.025, type: "sine" },
      { frequency: 330, endFrequency: 440, duration: 0.12, gain: 0.025, type: "sine", delay: 0.1 }
    ],
    attack: [
      { frequency: 95, endFrequency: 42, duration: 0.42, gain: 0.055, type: "sawtooth" }
    ],
    damage: [
      { frequency: 180, endFrequency: 70, duration: 0.22, gain: 0.045, type: "square" }
    ],
    heal: [
      { frequency: 330, endFrequency: 660, duration: 0.25, gain: 0.035, type: "sine" }
    ],
    armor: [
      { frequency: 250, endFrequency: 210, duration: 0.1, gain: 0.03, type: "triangle" },
      { frequency: 420, endFrequency: 390, duration: 0.12, gain: 0.025, type: "triangle", delay: 0.08 }
    ],
    weather: [
      { frequency: 240, endFrequency: 120, duration: 0.5, gain: 0.022, type: "sine" }
    ],
    victory: [
      { frequency: 330, endFrequency: 440, duration: 0.18, gain: 0.035, type: "triangle" },
      { frequency: 440, endFrequency: 660, duration: 0.22, gain: 0.035, type: "triangle", delay: 0.16 }
    ],
    defeat: [
      { frequency: 190, endFrequency: 55, duration: 0.65, gain: 0.045, type: "sawtooth" }
    ]
  };

  (sounds[cue] ?? sounds.card).forEach(playTone);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundToggleButton?.setAttribute(
    "aria-pressed",
    String(soundEnabled)
  );
  soundToggleButton?.setAttribute(
    "aria-label",
    soundEnabled
      ? "Disable game sound effects"
      : "Enable game sound effects"
  );
  if (soundToggleButton) {
    soundToggleButton.textContent = soundEnabled
      ? "Sound on"
      : "Sound off";
  }

  if (soundEnabled) {
    getAudioContext();
    playGameSound("turn");
  }
}

function rememberSpriteRestPose(sprite, groundY = sprite?.position.y ?? 0) {
  if (!sprite) return;
  sprite.userData.baseScale = sprite.scale.clone();
  sprite.userData.groundY = groundY;
  sprite.userData.animationState = sprite.userData.animationState ?? "idle";
  sprite.userData.animationUntil = 0;
  sprite.userData.isPathAnimating = false;
  sprite.userData.animationPhase =
    Number(sprite.userData.playerId ?? 5) * 0.73;
}

function setPlayerAnimationState(playerId, state, duration = 520) {
  const sprite = playerSprites.get(Number(playerId));
  if (!sprite) return;
  sprite.userData.animationState = state;
  sprite.userData.animationUntil = performance.now() + duration;
}

function setReyathAnimationState(state, duration = 650) {
  if (!reyathSprite) return;
  reyathSprite.userData.animationState = state;
  reyathSprite.userData.animationUntil = performance.now() + duration;
}

function resetSpriteVisuals(sprite, opacity = 1) {
  const baseScale = sprite.userData.baseScale ?? sprite.scale;
  const facing = Math.sign(sprite.scale.x) || 1;
  sprite.scale.set(
    Math.abs(baseScale.x) * facing,
    baseScale.y,
    baseScale.z
  );
  sprite.material.color.setHex(0xffffff);
  sprite.material.rotation = 0;
  sprite.material.opacity = opacity;
}

function updatePlayerSpriteAnimation(sprite, playerId, time) {
  if (!sprite?.material) return;

  const defeated = defeatedPlayerIds.has(Number(playerId));
  const defaultOpacity = Number(playerId) === Number(activePlayer) ? 1 : 0.72;
  const phase = sprite.userData.animationPhase ?? 0;
  const stateExpired =
    sprite.userData.animationUntil > 0 &&
    time >= sprite.userData.animationUntil;

  if (stateExpired && !defeated) {
    sprite.userData.animationState = "idle";
    sprite.userData.animationUntil = 0;
  }

  if (defeated) {
    resetSpriteVisuals(sprite, 0.2);
    sprite.material.rotation = -0.95;
    sprite.material.color.setHex(0x777777);
    sprite.scale.multiplyScalar(0.82);
    return;
  }

  if (!sprite.userData.isPathAnimating) {
    resetSpriteVisuals(sprite, defaultOpacity);
    const activeBoost = Number(playerId) === Number(activePlayer) ? 1.35 : 1;
    sprite.position.y =
      (sprite.userData.groundY ?? sprite.position.y) +
      Math.sin(time * 0.0032 + phase) * 0.055 * activeBoost;
  }

  const effectProgress = THREE.MathUtils.clamp(
    (sprite.userData.animationUntil - time) / 520,
    0,
    1
  );
  const pulse = Math.sin((1 - effectProgress) * Math.PI * 4);

  if (sprite.userData.animationState === "hurt") {
    sprite.material.color.setHex(0xff6262);
    sprite.scale.x *= 1 + pulse * 0.07;
  } else if (sprite.userData.animationState === "heal") {
    sprite.material.color.setHex(0x8dffad);
    sprite.scale.multiplyScalar(1 + Math.max(0, pulse) * 0.08);
  } else if (sprite.userData.animationState === "armor") {
    sprite.material.color.setHex(0x83bdff);
  } else if (sprite.userData.animationState === "perk") {
    sprite.material.color.setHex(0xffe766);
    sprite.scale.multiplyScalar(1 + Math.max(0, pulse) * 0.06);
  }
}

function updateReyathSpriteAnimation(time) {
  if (!reyathSprite?.material || reyathSprite.userData.isPathAnimating) return;

  resetSpriteVisuals(reyathSprite, reyathState === "dormant" ? 0.78 : 1);
  const baseY = reyathSprite.userData.groundY ?? reyathSprite.position.y;
  const speed = reyathState === "dormant" ? 0.0018 : 0.004;
  const distance = reyathState === "dormant" ? 0.08 : 0.14;
  reyathSprite.position.y = baseY + Math.sin(time * speed) * distance;

  if (
    reyathSprite.userData.animationUntil > 0 &&
    time >= reyathSprite.userData.animationUntil
  ) {
    reyathSprite.userData.animationState = "idle";
    reyathSprite.userData.animationUntil = 0;
  }

  const state = reyathSprite.userData.animationState;
  if (state === "hurt") {
    reyathSprite.material.color.setHex(0xff4040);
    reyathSprite.scale.multiplyScalar(
      0.93 + Math.sin(time * 0.024) * 0.04
    );
  } else if (state === "attacking") {
    reyathSprite.material.color.setHex(0x8fd7ff);
    reyathSprite.scale.multiplyScalar(
      1.04 + Math.max(0, Math.sin(time * 0.02)) * 0.08
    );
  }
}

function updateBoardAnimationStates(time) {
  if (reducedMotionQuery.matches) return;

  playerSprites.forEach((sprite, playerId) => {
    updatePlayerSpriteAnimation(sprite, playerId, time);
  });
  updateReyathSpriteAnimation(time);

  locationTilesById.forEach((tile) => {
    if (!tile.userData.destroyed || tile === hoveredTile) return;
    const pulse = 0.08 + (Math.sin(time * 0.003 + tile.userData.locationId) + 1) * 0.035;
    tile.material.emissive.setRGB(pulse * 1.8, pulse * 0.18, pulse * 0.18);
  });

  if (weatherRoadTile?.userData.transitionStartedAt) {
    const progress = Math.min(
      (time - weatherRoadTile.userData.transitionStartedAt) / 700,
      1
    );
    const wave = Math.sin(progress * Math.PI);
    weatherRoadTile.scale.y = 1 + wave * 0.18;
    weatherRoadTile.material.emissive.setRGB(
      wave * 0.18,
      wave * 0.24,
      wave * 0.28
    );
    if (progress >= 1) {
      weatherRoadTile.scale.y = 1;
      weatherRoadTile.material.emissive.setHex(
        weatherRoadTile.userData.baseEmissive ?? 0x000000
      );
      weatherRoadTile.userData.transitionStartedAt = 0;
    }
  }
}

function appendGameLog(message, tone = "neutral") {
  if (!boardEventLog || !message) return;

  const entry = document.createElement("li");
  entry.dataset.tone = tone;
  entry.textContent = message;
  entry.classList.add("is-new");
  boardEventLog.append(entry);

  window.setTimeout(() => entry.classList.remove("is-new"), 320);

  while (boardEventLog.children.length > 4) {
    boardEventLog.firstElementChild?.remove();
  }
}

function updateReyathHud(detail = {}) {
  const health = Math.max(0, Number(detail.health) || 0);
  const maxHealth = Math.max(1, Number(detail.maxHealth) || 20);
  currentReyathHealth = health;
  currentReyathMaxHealth = maxHealth;
  const percentage = THREE.MathUtils.clamp(
    (health / maxHealth) * 100,
    0,
    100
  );

  reyathHealthFill.style.width = `${percentage}%`;
  reyathHealthValue.textContent = `${health} / ${maxHealth} HP`;
  reyathHealthFill.parentElement?.setAttribute(
    "aria-valuemax",
    String(maxHealth)
  );
  reyathHealthFill.parentElement?.setAttribute(
    "aria-valuenow",
    String(health)
  );

  if (detail.state) {
    reyathStateValue.textContent = detail.state;
  }

  if (Number(detail.damage) > 0) {
    reyathHud.classList.remove("is-damaged");
    requestAnimationFrame(() => reyathHud.classList.add("is-damaged"));
    window.setTimeout(() => reyathHud.classList.remove("is-damaged"), 520);
  }
}

function getEncounterPlayerSuccessChance() {
  const fallbackTiers = [
    { reyathHealth: 20, playerSuccessChance: 0.75 },
    { reyathHealth: 10, playerSuccessChance: 0.6 },
    { reyathHealth: 5, playerSuccessChance: 0.5 }
  ];
  const configuredTiers =
    loadedGameData.rules?.balance?.encounterAdvantage;
  const tiers = (
    Array.isArray(configuredTiers) && configuredTiers.length > 0
      ? configuredTiers
      : fallbackTiers
  )
    .map((tier) => ({
      health: Number(tier.reyathHealth),
      chance: THREE.MathUtils.clamp(
        Number(tier.playerSuccessChance),
        0,
        1
      )
    }))
    .filter(
      (tier) =>
        Number.isFinite(tier.health) &&
        Number.isFinite(tier.chance)
    )
    .sort((first, second) => second.health - first.health);

  if (tiers.length === 0) return 0.5;
  if (currentReyathHealth >= tiers[0].health) {
    return tiers[0].chance;
  }

  for (let index = 0; index < tiers.length - 1; index += 1) {
    const upper = tiers[index];
    const lower = tiers[index + 1];

    if (
      currentReyathHealth <= upper.health &&
      currentReyathHealth >= lower.health
    ) {
      const range = upper.health - lower.health;
      const progress = range > 0
        ? (currentReyathHealth - lower.health) / range
        : 0;
      return THREE.MathUtils.lerp(
        lower.chance,
        upper.chance,
        progress
      );
    }
  }

  return tiers[tiers.length - 1].chance;
}

function rollEncounterDie(threshold) {
  const successChance = getEncounterPlayerSuccessChance();
  const shouldSucceed = Math.random() < successChance;
  const faces = [1, 2, 3, 4, 5, 6].filter((face) =>
    shouldSucceed ? face >= threshold : face < threshold
  );
  const availableFaces = faces.length > 0
    ? faces
    : [1, 2, 3, 4, 5, 6];
  return availableFaces[
    Math.floor(Math.random() * availableFaces.length)
  ];
}

async function showEncounterFeedback({
  kicker = "Reyath encounter",
  title = "Attack resolved",
  roll = null,
  message = "",
  duration = 1250
} = {}) {
  while (encounterFeedbackActive && !gameOver) {
    await waitFor(80);
  }

  if (gameOver) return;
  encounterFeedbackActive = true;
  encounterKicker.textContent = kicker;
  encounterTitle.textContent = title;
  encounterContext.hidden = true;
  encounterDice.hidden = true;
  encounterRollButton.hidden = true;
  encounterLayer.classList.remove("is-interactive");
  encounterRoll.textContent = roll ?? "—";
  encounterRoll.hidden = roll === null;
  encounterMessage.textContent = message;
  encounterLayer.hidden = false;

  requestAnimationFrame(() => {
    encounterLayer.classList.add("is-visible");
  });

  await waitFor(duration);
  encounterLayer.classList.remove("is-visible", "is-interactive");
  await waitFor(190);
  encounterLayer.hidden = true;
  encounterFeedbackActive = false;
}

async function requestEncounterDiceRoll({
  mode = "combat",
  playerId,
  threshold,
  card = null,
  damage = 0,
  damageBoost = 0
} = {}) {
  while (encounterFeedbackActive && !gameOver) {
    await waitFor(80);
  }

  if (gameOver) return null;
  encounterFeedbackActive = true;
  const previousFocus = document.activeElement;
  const isCombat = mode === "combat";
  const targetLabel = isCombat
    ? `Roll ${threshold}–6 to hit Reyath`
    : `Roll ${threshold}–6 to dodge`;

  encounterKicker.textContent = isCombat
    ? `Player ${playerId} · Direct combat`
    : `Player ${playerId} · Defensive roll`;
  encounterTitle.textContent = isCombat
    ? "Attack Reyath"
    : card?.name ?? "Dodge Reyath's attack";
  encounterContext.hidden = false;
  const advantagePercent = Math.round(
    getEncounterPlayerSuccessChance() * 100
  );
  encounterContext.textContent = isCombat
    ? `${targetLabel}. Successful damage: ${1 + damageBoost}${damageBoost > 0 ? ` (1 base + ${damageBoost} buff)` : ""}. Player success chance: ${advantagePercent}%.`
    : `${targetLabel}. Failed dodge damage: ${damage}. Player success chance: ${advantagePercent}%.`;
  encounterMessage.textContent = "Press Roll Dice when you are ready.";
  encounterRoll.hidden = true;
  encounterDice.hidden = false;
  encounterRollButton.hidden = false;
  encounterRollButton.disabled = false;
  encounterRollButton.textContent = "Roll dice";
  encounterLayer.hidden = false;
  encounterLayer.classList.add("is-interactive");

  await initializeEncounterDiceScene();
  if (encounterDiceMesh) {
    resizeEncounterDiceRenderer();
  } else {
    encounterDice.hidden = true;
    encounterRoll.hidden = false;
    encounterRoll.textContent = "—";
  }

  requestAnimationFrame(() => {
    encounterLayer.classList.add("is-visible");
    encounterRollButton.focus();
  });

  return new Promise((resolve) => {
    encounterRollRequest = async () => {
      encounterRollButton.disabled = true;
      encounterRollButton.textContent = "Rolling…";
      encounterMessage.textContent = `Player ${playerId} is rolling…`;

      const result = rollEncounterDie(threshold);
      await animateEncounterDiceRoll(result);
      const succeeded = result >= threshold;

      encounterRoll.textContent = String(result);
      encounterMessage.textContent = isCombat
        ? succeeded
          ? `Player ${playerId} rolled ${result} and landed a hit.`
          : `Player ${playerId} rolled ${result} and missed.`
        : succeeded
          ? `Player ${playerId} rolled ${result} and dodged the attack.`
          : `Player ${playerId} rolled ${result} and failed to dodge.`;
      playGameSound(succeeded ? "heal" : "damage");

      await waitFor(reducedMotionQuery.matches ? 1 : 950);
      encounterLayer.classList.remove("is-visible", "is-interactive");
      await waitFor(reducedMotionQuery.matches ? 1 : 190);
      encounterLayer.hidden = true;
      encounterRollButton.hidden = true;
      encounterRollButton.disabled = false;
      encounterRollRequest = null;
      encounterFeedbackActive = false;
      previousFocus?.focus?.();
      resolve(result);
    };

    if (isPlayerAutomated(playerId)) {
      window.setTimeout(() => {
        if (encounterRollRequest && isPlayerAutomated(playerId)) {
          handleEncounterRollButton();
        }
      }, getAutomationThinkDelay(0.75));
    }
  });
}

function handleEncounterRollButton() {
  if (!encounterRollRequest || encounterRollButton.disabled) return;
  const startRoll = encounterRollRequest;
  encounterRollRequest = null;
  startRoll();
}

function endGame(outcome, message) {
  if (gameOver) return;

  gameOver = true;
  turnPhase = "game-over";
  rollButton.disabled = true;
  finishMovementButton.disabled = true;
  encounterLayer.classList.remove("is-visible", "is-interactive");
  encounterLayer.hidden = true;
  encounterFeedbackActive = false;

  const victory = outcome === "victory";
  gameOverKicker.textContent = victory ? "Victory" : "Defeat";
  gameOverTitle.textContent = victory
    ? "Reyath has been defeated"
    : "The expedition has fallen";
  gameOverMessage.textContent = message;
  gameOverLayer.hidden = false;
  playGameSound(victory ? "victory" : "defeat");
  appendGameLog(message, victory ? "success" : "damage");
  updateTurnInterface();
}

function getLivingPlayersOnReyathTile(detail = {}) {
  const requestedIds = new Set();

  if (Number(detail.playerId)) {
    requestedIds.add(Number(detail.playerId));
  }
  (detail.players ?? []).forEach((player) => {
    const playerId = Number(player?.id ?? player);
    if (playerId) requestedIds.add(playerId);
  });

  const occupants = getPlayersAtPosition(
    reyathPosition.column,
    reyathPosition.row
  );
  occupants.forEach((player) => requestedIds.add(Number(player.id)));

  return [...requestedIds]
    .filter((playerId) => !defeatedPlayerIds.has(playerId))
    .filter((playerId) => {
      const position = playerPositions.get(playerId);
      return position &&
        position.column === reyathPosition.column &&
        position.row === reyathPosition.row;
    })
    .sort((first, second) => first - second);
}

function getPlayerCombatProfile(playerId) {
  const detail = {
    playerId: Number(playerId),
    damageBoost: 0
  };
  window.dispatchEvent(
    new CustomEvent("wrath:combat-profile-query", { detail })
  );
  return detail;
}

function getEncounterFailureCard(card = null) {
  const detail = {
    card,
    damage: 0,
    image: "",
    handled: false
  };
  window.dispatchEvent(
    new CustomEvent(
      card
        ? "wrath:encounter-card-evaluate"
        : "wrath:encounter-card-request",
      { detail }
    )
  );
  return detail;
}

async function resolveDirectReyathEncounter(detail = {}) {
  const playerIds = getLivingPlayersOnReyathTile(detail);
  if (playerIds.length === 0 || gameOver) return;

  encounterSequenceActive = true;
  const previousPhase = turnPhase;
  turnPhase = "encounter";
  rollButton.disabled = true;
  finishMovementButton.disabled = true;
  updateTurnInterface();

  let totalDamageToReyath = 0;
  let failureCard = activeReyathCard;
  let failureCardDetail = failureCard
    ? getEncounterFailureCard(failureCard)
    : null;

  appendGameLog(
    `${playerIds.map((id) => `Player ${id}`).join(", ")} entered direct combat with Reyath.`,
    "damage"
  );

  for (const playerId of playerIds) {
    if (gameOver || defeatedPlayerIds.has(playerId)) continue;

    const combatProfile = getPlayerCombatProfile(playerId);
    const damageBoost = Math.max(
      0,
      Number(combatProfile.damageBoost) || 0
    );
    const roll = await requestEncounterDiceRoll({
      mode: "combat",
      playerId,
      threshold: 4,
      damageBoost
    });

    if (roll === null || gameOver) break;

    if (roll >= 4) {
      const damage = 1 + damageBoost;
      totalDamageToReyath += damage;
      if (damageBoost > 0) {
        window.dispatchEvent(
          new CustomEvent("wrath:damage-boost-consumed", {
            detail: { playerId, amount: damageBoost }
          })
        );
      }
      appendGameLog(
        `Player ${playerId} rolled ${roll} and dealt ${damage} damage to Reyath.`,
        "success"
      );
      continue;
    }

    if (!failureCardDetail) {
      failureCardDetail = getEncounterFailureCard();
      failureCard = failureCardDetail.card;
    }
    const incomingDamage = Math.max(
      0,
      Number(failureCardDetail?.damage) || 0
    );
    const cardName = failureCard?.name ?? "Reyath's encounter";

    window.dispatchEvent(
      new CustomEvent("wrath:encounter-failure", {
        detail: {
          playerId,
          roll,
          damage: incomingDamage,
          damageType: failureCardDetail?.damageType ?? "physical",
          card: failureCard
        }
      })
    );
    appendGameLog(
      incomingDamage > 0
        ? `Player ${playerId} rolled ${roll}. ${cardName} dealt ${incomingDamage} damage.`
        : `Player ${playerId} rolled ${roll}. ${cardName} caused no direct damage.`,
      incomingDamage > 0 ? "damage" : "neutral"
    );
  }

  if (totalDamageToReyath > 0 && !gameOver) {
    window.dispatchEvent(
      new CustomEvent("wrath:encounter-success", {
        detail: {
          playerIds,
          damage: totalDamageToReyath
        }
      })
    );
  }

  encounterSequenceActive = false;
  if (!gameOver) {
    turnPhase = previousPhase;
    if (previousPhase !== "reyath") {
      turnPhase = activePlayerMovement > 0
        ? "moving"
        : "resolving-card";
    }
    updateTurnInterface();

    if (
      previousPhase !== "reyath" &&
      activePlayerMovement <= 0 &&
      !pendingTurnCompletion
    ) {
      window.setTimeout(() => completeActivePlayerTurn(), 220);
    }
  }
}

function queueReyathEncounter(detail = {}) {
  const queued = encounterSequencePromise.then(() =>
    resolveDirectReyathEncounter(detail)
  );
  encounterSequencePromise = queued.catch((error) => {
    console.error("Reyath encounter could not resolve.", error);
    encounterSequenceActive = false;
  });
  return queued;
}

function getNextParticipatingPlayer(afterPlayerId) {
  return loadedGameData.players.find((player) =>
    Number(player.id) > Number(afterPlayerId) &&
    !defeatedPlayerIds.has(Number(player.id))
  )?.id ?? null;
}

async function showTurnTransition(
  title,
  message,
  duration = 1050
) {
  playGameSound("turn");
  turnTransitionKicker.textContent = `Round ${currentRound}`;
  turnTransitionTitle.textContent = title;
  turnTransitionMessage.textContent = message;
  turnTransitionLayer.hidden = false;

  requestAnimationFrame(() => {
    turnTransitionLayer.classList.add("is-visible");
  });

  await waitFor(duration);
  turnTransitionLayer.classList.remove("is-visible");
  await waitFor(220);
  turnTransitionLayer.hidden = true;
}

function activatePlayerPawn(playerId) {
  const position = playerPositions.get(playerId);
  const sprite = playerSprites.get(playerId);

  if (!position || !sprite) return false;

  activePlayer = playerId;
  playerPosition = position;
  playerSprite = sprite;
  activePlayerMovement = Math.max(
    0,
    Number(playerMovementBudgets.get(playerId)) || 0
  );

  playerSprites.forEach((candidate, candidateId) => {
    candidate.material.opacity = candidateId === playerId ? 1 : 0.72;
  });

  renderPlayers(
    loadedGameData.players,
    loadedGameData.textures?.ui
  );

  window.dispatchEvent(
    new CustomEvent("wrath:active-player", {
      detail: { playerId: activePlayer }
    })
  );

  return true;
}

async function beginPlayerTurn(playerId) {
  if (gameOver) return;

  if (defeatedPlayerIds.has(Number(playerId))) {
    const nextPlayer = getNextParticipatingPlayer(playerId);
    if (nextPlayer !== null) {
      await beginPlayerTurn(nextPlayer);
    } else {
      await beginReyathTurn();
    }
    return;
  }
  activeReyathCard = null;
  automationRunId += 1;
  automatedMovementRunning = false;
  turnTransitioning = true;
  turnPhase = "transitioning";
  rollButton.disabled = true;
  activePlayerMovement = 0;
  playerMovementBudgets.set(playerId, 0);
  activatePlayerPawn(playerId);
  updateTurnInterface();

  const turnStart = {
    playerId,
    skipTurn: false,
    message: ""
  };
  window.dispatchEvent(
    new CustomEvent("wrath:player-turn-start-query", {
      detail: turnStart
    })
  );

  await showTurnTransition(
    `${getConfiguredPlayer(playerId)?.controlType === "bot" ? "Bot Player" : "Player"} ${playerId}'s Turn`,
    turnStart.skipTurn
      ? turnStart.message
      : isPlayerAutomated(playerId)
        ? "Automated strategy will roll, resolve the card, and choose a movement path."
        : "Roll the dice, resolve the card, then use every available tile move."
  );

  turnTransitioning = false;

  if (turnStart.skipTurn) {
    turnPhase = "transitioning";
    diceStatus.textContent = turnStart.message;
    boardStatus.textContent = turnStart.message;
    updateTurnInterface();
    await waitFor(500);
    await completeActivePlayerTurn();
    return;
  }

  turnPhase = "awaiting-roll";
  diceStatus.textContent = isPlayerAutomated(playerId)
    ? `Player ${playerId}: automated turn preparing.`
    : `Player ${playerId}: roll the dice.`;
  boardStatus.textContent = isPlayerAutomated(playerId)
    ? `Player ${playerId}'s automated strategy is evaluating the board.`
    : `Player ${playerId}'s turn.`;
  updateTurnInterface();

  if (isPlayerAutomated(playerId)) {
    const turnDetail = { playerId, usedStoredCard: false };
    window.dispatchEvent(
      new CustomEvent("wrath:automation-turn-start", {
        detail: turnDetail
      })
    );
    const runId = automationRunId;
    window.setTimeout(() => {
      if (
        runId === automationRunId &&
        Number(activePlayer) === Number(playerId)
      ) {
        resumeAutomationForCurrentPhase();
      }
    }, getAutomationThinkDelay(turnDetail.usedStoredCard ? 1.1 : 0.65));
  }
}

function findNearestPlayerToReyath() {
  return [...playerPositions.entries()]
    .filter(([playerId]) => !defeatedPlayerIds.has(Number(playerId)))
    .map(([playerId, position]) => ({
      playerId,
      position,
      distance:
        Math.abs(position.column - reyathPosition.column) +
        Math.abs(position.row - reyathPosition.row)
    }))
    .sort((first, second) =>
      first.distance - second.distance ||
      first.playerId - second.playerId
    )[0] ?? null;
}

function chooseReyathStep(targetPosition) {
  const columnDifference =
    targetPosition.column - reyathPosition.column;
  const rowDifference =
    targetPosition.row - reyathPosition.row;

  if (columnDifference === 0 && rowDifference === 0) {
    return null;
  }

  const prioritizeColumns =
    Math.abs(columnDifference) > Math.abs(rowDifference) ||
    (
      Math.abs(columnDifference) === Math.abs(rowDifference) &&
      currentRound % 2 === 0
    );

  if (prioritizeColumns && columnDifference !== 0) {
    return {
      column: reyathPosition.column + Math.sign(columnDifference),
      row: reyathPosition.row
    };
  }

  if (rowDifference !== 0) {
    return {
      column: reyathPosition.column,
      row: reyathPosition.row + Math.sign(rowDifference)
    };
  }

  return {
    column: reyathPosition.column + Math.sign(columnDifference),
    row: reyathPosition.row
  };
}

function animateReyathStep(destination) {
  return new Promise((resolve) => {
    if (!reyathSprite) {
      resolve();
      return;
    }

    const destinationPoint = getMovementPoint(
      destination.column,
      destination.row
    )?.clone();

    if (!destinationPoint) {
      resolve();
      return;
    }

    destinationPoint.y =
      TILE_HEIGHT + 0.02 + reyathSprite.scale.y / 2;

    const start = reyathSprite.position.clone();
    const startTime = performance.now();
    const duration = reducedMotionQuery.matches ? 1 : 380;
    reyathSprite.userData.isPathAnimating = true;
    reyathSprite.userData.animationState = "moving";
    playGameSound("move");

    function animate(time) {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      reyathSprite.position.lerpVectors(start, destinationPoint, eased);
      reyathSprite.position.y += Math.sin(progress * Math.PI) * 0.38;

      if (!reducedMotionQuery.matches) {
        const baseScale =
          reyathSprite.userData.baseScale ?? reyathSprite.scale;
        const stretch = Math.sin(progress * Math.PI);
        const direction = destination.column - reyathPosition.column;
        const facing = direction < 0 ? -1 : direction > 0 ? 1 : Math.sign(reyathSprite.scale.x) || 1;
        reyathSprite.scale.set(
          Math.abs(baseScale.x) * facing * (1 - stretch * 0.06),
          baseScale.y * (1 + stretch * 0.1),
          baseScale.z
        );
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
        return;
      }

      reyathSprite.position.copy(destinationPoint);
      reyathSprite.userData.groundY = destinationPoint.y;
      reyathSprite.userData.isPathAnimating = false;
      reyathSprite.userData.animationState = "idle";
      resetSpriteVisuals(reyathSprite, 1);
      reyathPosition.column = destination.column;
      reyathPosition.row = destination.row;

      const atHollow =
        reyathPosition.column === reyathHollowPosition.column &&
        reyathPosition.row === reyathHollowPosition.row;
      setReyathState(atHollow ? "dormant" : "active");

      window.dispatchEvent(
        new CustomEvent("wrath:reyath-position-changed", {
          detail: {
            column: reyathPosition.column,
            row: reyathPosition.row,
            state: reyathState
          }
        })
      );
      resolve();
    }

    requestAnimationFrame(animate);
  });
}

async function moveReyathAutonomously(stepCount) {
  reyathActionInProgress = true;

  for (let step = 0; step < stepCount; step += 1) {
    if (reyathMovementMode === "weather-patrol") {
      let destination;

      if (reyathPosition.row !== 2) {
        destination = {
          column: reyathPosition.column,
          row: reyathPosition.row + Math.sign(2 - reyathPosition.row)
        };
      } else {
        let nextColumn = reyathPosition.column + reyathPatrolDirection;
        if (nextColumn < 0 || nextColumn > 3) {
          reyathPatrolDirection *= -1;
          nextColumn = reyathPosition.column + reyathPatrolDirection;
        }
        destination = {
          column: nextColumn,
          row: 2
        };
      }

      boardStatus.textContent =
        "Reyath is patrolling the weather road.";
      await animateReyathStep(destination);
      await waitFor(130);
      continue;
    }

    const target = findNearestPlayerToReyath();

    if (!target) break;

    if (target.distance === 0) {
      await queueReyathEncounter({
        playerId: target.playerId,
        reason: "reyath-reached-player",
        column: reyathPosition.column,
        row: reyathPosition.row
      });
      boardStatus.textContent =
        `Reyath encountered Player ${target.playerId}.`;
      break;
    }

    const destination = chooseReyathStep(target.position);

    if (!destination) break;

    boardStatus.textContent =
      `Reyath is pursuing Player ${target.playerId}.`;
    await animateReyathStep(destination);

    const occupants = getPlayersAtPosition(
      reyathPosition.column,
      reyathPosition.row
    );

    if (occupants.length > 0) {
      await queueReyathEncounter({
        players: occupants,
        reason: "reyath-reached-players",
        column: reyathPosition.column,
        row: reyathPosition.row
      });
      boardStatus.textContent =
        `Reyath encountered ${occupants.map((player) => player.name).join(" and ")}.`;
      break;
    }

    await waitFor(130);
  }

  reyathActionInProgress = false;
}

function getReyathAttackCoordinates(pattern) {
  const coordinates = [];

  if (pattern === "row") {
    for (let column = 0; column < 4; column += 1) {
      coordinates.push({ column, row: reyathPosition.row });
    }
    return coordinates;
  }

  if (pattern === "column") {
    for (let row = 0; row < 5; row += 1) {
      coordinates.push({ column: reyathPosition.column, row });
    }
    return coordinates;
  }

  const includeDiagonals = pattern === "surrounding-eight";

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      const isCenter = rowOffset === 0 && columnOffset === 0;
      const isDiagonal = rowOffset !== 0 && columnOffset !== 0;

      if (!isCenter && isDiagonal && !includeDiagonals) continue;

      const column = reyathPosition.column + columnOffset;
      const row = reyathPosition.row + rowOffset;

      if (column >= 0 && column <= 3 && row >= 0 && row <= 4) {
        coordinates.push({ column, row });
      }
    }
  }

  return coordinates;
}

function showReyathAttackIndicator(attack, coordinates) {
  return new Promise((resolve) => {
    if (!boardGroup || coordinates.length === 0) {
      resolve();
      return;
    }

    const indicatorGroup = new THREE.Group();
    const color = new THREE.Color(attack.color ?? "#248cff");
    setReyathAnimationState("attacking", 1100);
    playGameSound("attack");

    coordinates.forEach(({ column, row }) => {
      const point = getMovementPoint(column, row);
      if (!point) return;

      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const indicator = new THREE.Mesh(
        new THREE.BoxGeometry(
          TILE_WIDTH * 0.92,
          0.12,
          TILE_DEPTH * 0.88
        ),
        material
      );
      indicator.position.set(point.x, TILE_HEIGHT + 0.18, point.z);
      indicator.userData.telegraphType = "tile";
      indicatorGroup.add(indicator);
    });

    const firstPoint = getMovementPoint(
      coordinates[0].column,
      coordinates[0].row
    );
    const lastPoint = getMovementPoint(
      coordinates.at(-1).column,
      coordinates.at(-1).row
    );

    if (
      firstPoint &&
      lastPoint &&
      (attack.pattern === "row" || attack.pattern === "column")
    ) {
      const rowAttack = attack.pattern === "row";
      const span = rowAttack
        ? Math.abs(lastPoint.x - firstPoint.x) + TILE_WIDTH
        : Math.abs(lastPoint.z - firstPoint.z) + TILE_DEPTH;
      const beamMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(
          rowAttack ? span : TILE_WIDTH * 0.22,
          1.9,
          rowAttack ? TILE_DEPTH * 0.18 : span
        ),
        beamMaterial
      );
      beam.position.set(
        (firstPoint.x + lastPoint.x) / 2,
        TILE_HEIGHT + 1.05,
        (firstPoint.z + lastPoint.z) / 2
      );
      beam.scale.y = 0.05;
      beam.userData.telegraphType = "beam";
      indicatorGroup.add(beam);
    } else {
      coordinates.forEach(({ column, row }) => {
        const point = getMovementPoint(column, row);
        if (!point) return;
        const pillarMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.24,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(
            TILE_WIDTH * 0.28,
            3.6,
            TILE_DEPTH * 0.28
          ),
          pillarMaterial
        );
        pillar.position.set(point.x, 5.2, point.z);
        pillar.userData.telegraphType = "pillar";
        pillar.userData.targetY = TILE_HEIGHT + 1.85;
        indicatorGroup.add(pillar);
      });
    }

    boardGroup.add(indicatorGroup);
    const startTime = performance.now();
    const duration = reducedMotionQuery.matches ? 1 : 1050;

    function animateIndicator(time) {
      const progress = Math.min((time - startTime) / duration, 1);
      const pulse = 0.2 + Math.sin(progress * Math.PI * 6) * 0.16;

      indicatorGroup.children.forEach((indicator) => {
        const type = indicator.userData.telegraphType;
        indicator.material.opacity = Math.max(0.04, pulse) * (1 - progress * 0.72);

        if (type === "tile") {
          indicator.scale.y = 1 + Math.sin(progress * Math.PI) * 8;
        } else if (type === "beam") {
          indicator.scale.y = Math.max(0.05, Math.sin(progress * Math.PI));
        } else if (type === "pillar") {
          indicator.position.y = THREE.MathUtils.lerp(
            5.2,
            indicator.userData.targetY,
            Math.min(progress * 1.7, 1)
          );
          indicator.scale.y = 0.65 + Math.sin(progress * Math.PI) * 0.45;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animateIndicator);
        return;
      }

      boardGroup.remove(indicatorGroup);
      boardViewport.classList.remove("is-under-attack");
      void boardViewport.offsetWidth;
      boardViewport.classList.add("is-under-attack");
      window.setTimeout(() => {
        boardViewport.classList.remove("is-under-attack");
      }, 380);
      indicatorGroup.children.forEach((indicator) => {
        indicator.geometry.dispose();
        indicator.material.dispose();
      });
      setReyathAnimationState("idle", 1);
      resolve();
    }

    requestAnimationFrame(animateIndicator);
  });
}

async function resolveQueuedReyathAttacks() {
  const attacks = queuedReyathAttacks.splice(0);

  for (const attack of attacks) {
    const coordinates = getReyathAttackCoordinates(attack.pattern);
    const affectedKeys = new Set(
      coordinates.map(({ column, row }) => `${column}-${row}`)
    );
    const playerIds = [...playerPositions.entries()]
      .filter(([playerId]) => !defeatedPlayerIds.has(Number(playerId)))
      .filter(([, position]) =>
        affectedKeys.has(`${position.column}-${position.row}`)
      )
      .map(([playerId]) => playerId);
    const targetPlayerId = findNearestPlayerToReyath()?.playerId ?? null;

    boardStatus.textContent =
      `${attack.card?.name ?? "Reyath"} targets ${attack.pattern}.`;
    await showReyathAttackIndicator(attack, coordinates);

    const manualRolls = [];
    const dodgeThreshold = Math.max(
      0,
      Number(attack.dodgeThreshold) || 0
    );
    const attackDamage = Math.max(0, Number(attack.damage) || 0);

    if (dodgeThreshold > 0 && playerIds.length > 0) {
      encounterSequenceActive = true;
      for (const playerId of playerIds) {
        if (gameOver || defeatedPlayerIds.has(Number(playerId))) {
          continue;
        }
        const roll = await requestEncounterDiceRoll({
          mode: "dodge",
          playerId,
          threshold: dodgeThreshold,
          card: attack.card,
          damage: attackDamage
        });
        if (roll === null) continue;
        manualRolls.push({
          playerId: Number(playerId),
          roll,
          dodged: roll >= dodgeThreshold,
          damage: roll >= dodgeThreshold ? 0 : attackDamage
        });
      }
      encounterSequenceActive = false;
    }

    const resolution = {
      ...attack,
      playerIds,
      targetPlayerId,
      manualRolls,
      message: ""
    };
    window.dispatchEvent(
      new CustomEvent("wrath:reyath-attack-resolution", {
        detail: resolution
      })
    );
    boardStatus.textContent = resolution.message ||
      `${attack.card?.name ?? "Reyath"} resolved.`;

    const defenseRoll = resolution.results?.[0]?.roll ?? null;
    const attackDodged =
      resolution.results?.length > 0 &&
      resolution.results.every((result) => result.dodged);
    appendGameLog(
      resolution.message,
      attackDodged ? "success" : playerIds.length > 0 ? "damage" : "neutral"
    );

    if (dodgeThreshold === 0 || playerIds.length === 0) {
      await showEncounterFeedback({
        kicker: `${attack.pattern.replaceAll("-", " ")} attack`,
        title: attack.card?.name ?? "Reyath attack",
        roll: defenseRoll,
        message: resolution.message,
        duration: 1350
      });
    }
    await waitFor(320);
  }
}

async function runImmediateReyathHazard() {
  const steps = queuedReyathMovement;
  queuedReyathMovement = 0;

  if (steps <= 0 && queuedReyathAttacks.length === 0) return;

  await showTurnTransition(
    "Immediate Reyath Hazard",
    steps > 0
      ? `Reyath gains ${steps} immediate tile move${steps === 1 ? "" : "s"}.`
      : "Reyath is preparing an immediate attack.",
    850
  );
  if (steps > 0) {
    await moveReyathAutonomously(steps);
  }
  await resolveQueuedReyathAttacks();
  reyathMovementMode = "nearest-player";
}

function drawReyathTurnCard() {
  return new Promise((resolve) => {
    const drawDetail = {
      handled: false,
      complete: resolve
    };

    window.dispatchEvent(
      new CustomEvent("wrath:reyath-card-draw", {
        detail: drawDetail
      })
    );

    if (!drawDetail.handled) {
      resolve({ resolved: false });
    }
  });
}

async function beginReyathTurn() {
  if (gameOver) return;
  turnTransitioning = true;
  turnPhase = "reyath";
  rollButton.disabled = true;
  updateTurnInterface();
  playerSprites.forEach((sprite) => {
    sprite.material.opacity = 0.72;
  });
  renderPlayers(
    loadedGameData.players,
    loadedGameData.textures?.ui
  );

  await showTurnTransition(
    "Reyath's Turn",
    "Reyath will draw from Deck 06 and execute the revealed card."
  );

  const reyathTurnStart = {
    skipTurn: false,
    message: ""
  };
  window.dispatchEvent(
    new CustomEvent("wrath:reyath-turn-start-query", {
      detail: reyathTurnStart
    })
  );

  if (reyathTurnStart.skipTurn) {
    boardStatus.textContent = reyathTurnStart.message;
    diceStatus.textContent = reyathTurnStart.message;
    await waitFor(700);
    currentRound += 1;
    pendingTurnCompletion = false;
    turnTransitioning = false;
    await beginPlayerTurn(1);
    return;
  }

  boardStatus.textContent = "Reyath is drawing from Deck 06.";
  await drawReyathTurnCard();

  const cardMovement = Math.max(0, queuedReyathMovement);
  queuedReyathMovement = 0;

  if (cardMovement > 0) {
    await moveReyathAutonomously(cardMovement);
  } else {
    boardStatus.textContent =
      "Reyath's card resolved without additional movement.";
  }

  await resolveQueuedReyathAttacks();
  reyathMovementMode = "nearest-player";

  await waitFor(420);

  currentRound += 1;
  pendingTurnCompletion = false;
  turnTransitioning = false;
  await beginPlayerTurn(1);
}

async function completeActivePlayerTurn() {
  if (
    gameOver ||
    encounterSequenceActive ||
    pendingTurnCompletion ||
    turnTransitioning ||
    playerMoving ||
    turnPhase === "reyath"
  ) {
    return;
  }

  pendingTurnCompletion = true;
  turnPhase = "transitioning";
  rollButton.disabled = true;
  updateTurnInterface();

  window.dispatchEvent(
    new CustomEvent("wrath:player-turn-ended", {
      detail: { playerId: activePlayer }
    })
  );

  if (queuedReyathMovement > 0 || queuedReyathAttacks.length > 0) {
    await runImmediateReyathHazard();
  }

  const nextPlayer = getNextParticipatingPlayer(activePlayer);

  if (nextPlayer !== null) {
    pendingTurnCompletion = false;
    await beginPlayerTurn(nextPlayer);
    return;
  }

  await beginReyathTurn();
}

function buildThreeBoard(
  board,
  boardTextures = {},
  players = [],
  reyathData = {}
)
{  if (boardGroup) {
    scene.remove(boardGroup);
  }

  boardGroup = new THREE.Group();
  boardGroup.name = "Wrath of Reyath Board";
  interactiveTiles.length = 0;
  locationTilesById.clear();
  locationTilesByCoordinate.clear();
  destroyedLocationIds.clear();
  weatherRoadTile = null;
  weatherTextureStates = boardTextures.weatherStates ?? {};
  playerSprites.clear();
  playerPositions.clear();
  playerMovementBudgets.clear();

  const visualRows = board.rows + 1;
  const totalWidth =
    board.columns * TILE_WIDTH +
    (board.columns - 1) * TILE_GAP;
  const totalDepth =
    visualRows * TILE_DEPTH +
    (visualRows - 1) * TILE_GAP;

  const baseGeometry = new THREE.BoxGeometry(
    totalWidth + 0.8,
    BASE_HEIGHT,
    totalDepth + 0.8
  );
  const baseMaterial = createBoardMaterial(boardTextures.base, 0x050505);
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = -BASE_HEIGHT / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  addTileEdges(base, baseGeometry, 0x555555);
  boardGroup.add(base);

  const rowZ = (visualRow) =>
    ((visualRows - 1) / 2 - visualRow) *
    (TILE_DEPTH + TILE_GAP);

  const columnX = (column) =>
    (column - (board.columns - 1) / 2) *
    (TILE_WIDTH + TILE_GAP);

    /*
    Create a 4 × 5 navigation grid.

    Row 2 represents four invisible movement
    positions running across the weather road.
    */

    boardMovementPoints.clear();

    const playerGroundHeight =
    TILE_HEIGHT +
    0.02 +
    PLAYER_SPRITE_HEIGHT / 2;

    for (
    let movementRow = 0;
    movementRow < visualRows;
    movementRow += 1
    ) {
    for (
        let movementColumn = 0;
        movementColumn < board.columns;
        movementColumn += 1
    ) {
        boardMovementPoints.set(
        `${movementColumn}-${movementRow}`,

        new THREE.Vector3(
            columnX(movementColumn),
            playerGroundHeight,
            rowZ(movementRow)
        )
        );
    }
    }

    let tileNumber = 1;

for (let row = 0; row < board.rows; row += 1) {
  const visualRow = row >= 2 ? row + 1 : row;

  for (
    let column = 0;
    column < board.columns;
    column += 1
  ) {
    /*
      Find the JSON information associated with
      the current numbered location tile.
    */

    const locationData =
      board.locations?.find(
        (location) =>
          location.id === tileNumber
      );

    /*
      If this location has a texture name,
      retrieve its full texture configuration
      from textures.board.locations.
    */

    const customTexture =
      locationData?.texture
        ? boardTextures.locations?.[
            locationData.texture
          ]
        : null;

    /*
      Use the custom image texture when one exists.

      Otherwise, fall back to the default procedural
      stone texture at textures.board.location.
    */

    const textureConfig =
      customTexture ??
      boardTextures.location;

    createLocationTile(
      tileNumber,
      columnX(column),
      rowZ(visualRow),
      textureConfig,
      column,
      visualRow
    );

    tileNumber += 1;
  }
}

  createWeatherTile(
    board.weatherLabel,
    totalWidth,
    rowZ(2),
    boardTextures.weather
  );

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(totalWidth + 7, totalDepth + 7),
    new THREE.ShadowMaterial({
      color: 0x000000,
      opacity: 0.42
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -BASE_HEIGHT - 0.02;
  shadow.receiveShadow = true;
  boardGroup.add(shadow);

  players.forEach((player) => {
    createPlayerSprite(player);
  });
  createReyathSprite(reyathData);
  scene.add(boardGroup);
  boardStatus.textContent =
    `Three-dimensional board ready with ${board.columns * board.rows} locations and one weather road.`;
}

// =====================================================
// THREE.JS SCENE
// =====================================================

function initializeThreeScene(
  board,
  boardTextures = {},
  players = [],
  reyathData = {}
) {
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: boardWebGL,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
  } catch (error) {
    console.error("WebGL could not be initialized.", error);
    loadMessage.hidden = false;
    loadMessage.textContent =
      "The 3D board could not start because WebGL is unavailable in this browser.";
    boardStatus.textContent = "The three-dimensional board is unavailable.";
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = false;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101010);
  scene.fog = new THREE.Fog(0x101010, 38, 78);

  const initialWidth = Math.max(1, boardCanvas.clientWidth);
  const initialHeight = Math.max(1, boardCanvas.clientHeight);

  camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    initialWidth / initialHeight,
    CAMERA_NEAR,
    CAMERA_FAR
  );
  camera.position.copy(CAMERA_START_POSITION);

  const hemisphereLight = new THREE.HemisphereLight(
    0xffffff,
    0x111111,
    1.65
  );
  scene.add(hemisphereLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
  keyLight.position.set(-10, 20, 14);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -24;
  keyLight.shadow.camera.right = 24;
  keyLight.shadow.camera.top = 24;
  keyLight.shadow.camera.bottom = -24;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x7d7d7d, 1.2);
  rimLight.position.set(14, 9, -16);
  scene.add(rimLight);

  controls = new MapControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = false;
  controls.minDistance = MIN_CAMERA_DISTANCE;
  controls.maxDistance = MAX_CAMERA_DISTANCE;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = Math.PI / 2.08;
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
  controls.update();
  defaultCameraDistance = camera.position.distanceTo(controls.target);
  controls.saveState();

  initializeOrientationGizmo();
  buildThreeBoard(
    board,
    boardTextures,
    players,
    reyathData
  );
  resizeThreeBoard();
  updateZoomInterface();

  controls.addEventListener("change", updateZoomInterface);
  controls.addEventListener("start", () => {
    boardViewport.classList.add("is-dragging");
  });
  controls.addEventListener("end", () => {
    boardViewport.classList.remove("is-dragging");
  });
  renderer.domElement.addEventListener("pointermove", handleTileHover);
  renderer.domElement.addEventListener("pointerleave", clearTileHover);
  renderer.domElement.addEventListener("pointerdown", () => {
    boardViewport.focus({ preventScroll: true });
  });
  renderer.domElement.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  renderer.setAnimationLoop((time) => {
    controls.update();
    updateBoardAnimationStates(time);
    renderer.setScissorTest(false);
    renderer.setViewport(
      0,
      0,
      boardCanvas.clientWidth,
      boardCanvas.clientHeight
    );
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    renderOrientationGizmo();
  });
}

// =====================================================
// RESIZING
// =====================================================

function resizeThreeBoard() {
  if (!renderer || !camera) return;

  const width = Math.max(1, boardCanvas.clientWidth);
  const height = Math.max(1, boardCanvas.clientHeight);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);
}

// =====================================================
// TILE HOVER — NO TILE SELECTION
// =====================================================

function setHoveredTile(tile) {
  if (hoveredTile === tile) return;

  clearTileHover();
  hoveredTile = tile;

  if (!hoveredTile) return;

  hoveredTile.material.emissive.setHex(
    hoveredTile.userData.destroyed
      ? 0x5a1010
      : hoveredTile.userData.isWeather
        ? 0x242424
        : 0x202020
  );
  hoveredTile.userData.edges.material.opacity = 1;
  boardStatus.textContent = hoveredTile.userData.label;
}

function clearTileHover() {
  if (!hoveredTile) return;

  hoveredTile.material.emissive.setHex(
    hoveredTile.userData.baseEmissive ?? 0x000000
  );
  hoveredTile.userData.edges.material.opacity = 0.72;
  hoveredTile = null;
}

function handleTileHover(event) {
  if (!camera || interactiveTiles.length === 0) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const gizmoViewport = getGizmoViewport();
  const localX = event.clientX - rect.left;
  const localY = event.clientY - rect.top;

  const isOverGizmo =
    localX >= gizmoViewport.x &&
    localX <= gizmoViewport.x + gizmoViewport.size &&
    localY >= GIZMO_MARGIN &&
    localY <= GIZMO_MARGIN + gizmoViewport.size;

  if (isOverGizmo) {
    clearTileHover();
    boardStatus.textContent = "Board orientation axis.";
    return;
  }

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects(interactiveTiles, false);

  setHoveredTile(intersections[0]?.object ?? null);
}

// =====================================================
// CAMERA CONTROLS
// =====================================================

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function updateZoomInterface() {
  if (!camera || !controls) return;

  const distance = camera.position.distanceTo(controls.target);
  const zoomPercent = Math.round(
    (defaultCameraDistance / distance) * 100
  );

  zoomLevel.textContent = `${zoomPercent}%`;
  zoomOutButton.disabled = distance >= MAX_CAMERA_DISTANCE - 0.01;
  zoomInButton.disabled = distance <= MIN_CAMERA_DISTANCE + 0.01;
}

function setCameraDistance(nextDistance) {
  if (!camera || !controls) return;

  const distance = clamp(
    nextDistance,
    MIN_CAMERA_DISTANCE,
    MAX_CAMERA_DISTANCE
  );
  const direction = camera.position
    .clone()
    .sub(controls.target)
    .normalize();

  camera.position.copy(
    controls.target.clone().add(direction.multiplyScalar(distance))
  );
  controls.update();
  updateZoomInterface();
}

function zoomCamera(direction) {
  if (!camera || !controls) return;

  const currentDistance = camera.position.distanceTo(controls.target);
  const nextDistance = direction > 0
    ? currentDistance * ZOOM_FACTOR
    : currentDistance / ZOOM_FACTOR;

  setCameraDistance(nextDistance);
}

function resetBoardView() {
  if (!controls) return;

  controls.reset();
  clearTileHover();
  updateZoomInterface();
  boardStatus.textContent = "Three-dimensional board view reset.";
}

function panCamera(horizontal, forwardAmount) {
  if (!camera || !controls) return;

  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
  right.y = 0;
  right.normalize();

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const movement = right
    .multiplyScalar(horizontal)
    .add(forward.multiplyScalar(forwardAmount));

  camera.position.add(movement);
  controls.target.add(movement);
  controls.update();
}

function handleGameKeyboard(event) {
  const activeElement =
    document.activeElement;

  const isTyping =
    activeElement?.matches(
      "input, textarea, select"
    );

  if (isTyping) {
    return;
  }

  if (!gameStarted) {
    return;
  }

  /*
    Shift + Arrow controls the camera.

    This is checked first so camera controls and
    player movement cannot trigger simultaneously.
  */

  if (event.shiftKey) {
    const cameraActions = {
      ArrowLeft: () =>
        panCamera(-PAN_STEP, 0),

      ArrowRight: () =>
        panCamera(PAN_STEP, 0),

      ArrowUp: () =>
        panCamera(0, PAN_STEP),

      ArrowDown: () =>
        panCamera(0, -PAN_STEP)
    };

    const cameraAction =
      cameraActions[event.code];

    if (cameraAction) {
      event.preventDefault();
      event.stopPropagation();
      cameraAction();
    }

    return;
  }

  /*
    Use event.code instead of event.key.

    This reads the physical keyboard key and is
    more reliable for WASD and arrow controls.
  */

    const movementKeys = {
    /*
        W and Up Arrow now move toward
        increasing board-row values.
    */

    KeyW: {
        columnChange: 0,
        rowChange: 1
    },

    ArrowUp: {
        columnChange: 0,
        rowChange: 1
    },

    /*
        S and Down Arrow now move toward
        decreasing board-row values.
    */

    KeyS: {
        columnChange: 0,
        rowChange: -1
    },

    ArrowDown: {
        columnChange: 0,
        rowChange: -1
    },

    KeyA: {
        columnChange: -1,
        rowChange: 0
    },

    ArrowLeft: {
        columnChange: -1,
        rowChange: 0
    },

    KeyD: {
        columnChange: 1,
        rowChange: 0
    },

    ArrowRight: {
        columnChange: 1,
        rowChange: 0
    }
    };
    
  const movement =
    movementKeys[event.code];

  if (movement) {
    event.preventDefault();
    event.stopPropagation();

    movePlayer(
      movement.columnChange,
      movement.rowChange
    );

    return;
  }

  /*
    Remaining camera controls.
  */

  if (
    event.code === "Equal" ||
    event.code === "NumpadAdd"
  ) {
    event.preventDefault();
    zoomCamera(1);
    return;
  }

  if (
    event.code === "Minus" ||
    event.code === "NumpadSubtract"
  ) {
    event.preventDefault();
    zoomCamera(-1);
    return;
  }

  if (
    event.code === "Digit0" ||
    event.code === "Numpad0"
  ) {
    event.preventDefault();
    resetBoardView();
  }
}

// =====================================================
// PLAYER INVENTORIES
// =====================================================

function renderPlayers(players, uiTextures = {}) {
  inventoryGrid.replaceChildren();

  players.forEach((player) => {
    const inventory = document.createElement("article");
    inventory.className = "inventory-card";
    inventory.dataset.player = player.id;

    if (defeatedPlayerIds.has(Number(player.id))) {
      inventory.classList.add("is-defeated");
    }

    if (
      gameStarted &&
      player.id === activePlayer &&
      turnPhase !== "reyath"
    ) {
      inventory.classList.add("is-active");
    }

    const healthPoints = Array.from(
      { length: 5 },
      (_, index) => `
        <span
          class="stat-point health-point is-filled"
          aria-label="Health point ${index + 1}"
        ></span>
      `
    ).join("");

    const armorPoints = Array.from(
      { length: 5 },
      (_, index) => `
        <span
          class="stat-point armor-point"
          aria-label="Armor point ${index + 1}"
        ></span>
      `
    ).join("");

    const perkSlots = Array.from(
      { length: 6 },
      (_, index) => `
        <div
          class="perk-slot"
          aria-label="Locked perk slot ${index + 1}"
        >
          <span>${index + 1}</span>
        </div>
      `
    ).join("");

    inventory.setAttribute(
      "aria-label",
      `${player.name} inventory. Five health points, five armor points, two card slots, and six perk slots.`
    );

    inventory.innerHTML = `
      <div class="inventory-card__meta">
        <div>
          <p class="inventory-card__label">Inventory ${player.id}</p>
          <h3>${player.name}</h3>
        </div>
        <div class="inventory-meta-stats">
          <span class="inventory-card__status">
            ${
              defeatedPlayerIds.has(Number(player.id))
                ? "Defeated"
                : gameStarted &&
                  player.id === activePlayer &&
                  turnPhase !== "reyath"
                  ? "Active"
                  : "Waiting"
            }
          </span>
          <span class="notice-count">Notice: 0</span>
        </div>
      </div>

      <div
        class="player-condition-list"
        aria-label="Active conditions"
      ></div>

      <div class="inventory-interface" aria-hidden="true">
        <div class="character-slot">
          ${
            player.sprite
              ? `<img class="inventory-character-image" src="${player.sprite}" alt="">`
              : "<span>Character</span>"
          }
        </div>

        <div class="inventory-stats">
          <div class="stat-row health-row">
            <span class="stat-row__label">HP</span>
            <div class="stat-track">${healthPoints}</div>
            <span class="stat-count">5</span>
          </div>

          <div class="stat-row armor-row">
            <span class="stat-row__label">AR</span>
            <div class="stat-track">${armorPoints}</div>
            <span class="stat-count">5</span>
          </div>
        </div>

        <div class="inventory-lower">
          <div class="card-slots" aria-label="Two card slots">
            <div class="inventory-card-slot">
              <span>Card 1</span>
            </div>
            <div class="inventory-card-slot">
              <span>Card 2</span>
            </div>
          </div>

          <div class="perk-slots" aria-label="Six perk slots">
            ${perkSlots}
          </div>
        </div>
      </div>
    `;

    inventoryGrid.append(inventory);
  });
}

// =====================================================
// DICE
// =====================================================

function createFallbackDiceFaceTexture(value) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");
  const pipLayouts = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]]
  };

  context.fillStyle = "#f4f4f4";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#111111";
  context.lineWidth = 10;
  context.strokeRect(6, 6, 244, 244);
  context.fillStyle = "#111111";

  pipLayouts[value].forEach(([x, y]) => {
    context.beginPath();
    context.arc(x * canvas.width, y * canvas.height, 20, 0, Math.PI * 2);
    context.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

async function loadDiceFaceTexture(
  value,
  source,
  targetRenderer = diceRenderer
) {
  if (!source) {
    return createFallbackDiceFaceTexture(value);
  }

  try {
    const texture = await new THREE.TextureLoader().loadAsync(source);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = Math.min(
      8,
      targetRenderer?.capabilities?.getMaxAnisotropy?.() ?? 1
    );
    return texture;
  } catch (error) {
    console.warn(`Could not load dice face ${value}: ${source}`, error);
    return createFallbackDiceFaceTexture(value);
  }
}

function getDiceTargetQuaternion(result) {
  const rotations = {
    1: [0, 0, 0],
    2: [-Math.PI / 2, 0, 0],
    3: [0, 0, Math.PI / 2],
    4: [0, 0, -Math.PI / 2],
    5: [Math.PI / 2, 0, 0],
    6: [Math.PI, 0, 0]
  };

  const [x, y, z] = rotations[result];
  const faceOrientation = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(x, y, z, "XYZ")
  );
  const quarterTurn = Math.floor(Math.random() * 4) * (Math.PI / 2);
  const heading = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    quarterTurn
  );

  return heading.multiply(faceOrientation).normalize();
}

function resizeEncounterDiceRenderer() {
  if (
    !encounterDiceRenderer ||
    !encounterDiceCamera ||
    !encounterDice
  ) {
    return;
  }

  const width = Math.max(1, encounterDice.clientWidth);
  const height = Math.max(1, encounterDice.clientHeight);
  encounterDiceRenderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
  encounterDiceRenderer.setSize(width, height, false);
  encounterDiceCamera.aspect = width / height;
  encounterDiceCamera.updateProjectionMatrix();
}

async function initializeEncounterDiceScene() {
  if (!encounterDice || encounterDiceRenderer) return;

  try {
    encounterDiceScene = new THREE.Scene();
    encounterDiceScene.background = new THREE.Color(0x101010);

    encounterDiceCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    encounterDiceCamera.position.set(4.8, 3.7, 5.8);
    encounterDiceCamera.lookAt(0, 0.75, 0);

    encounterDiceRenderer = new THREE.WebGLRenderer({ antialias: true });
    encounterDiceRenderer.outputColorSpace = THREE.SRGBColorSpace;
    encounterDiceRenderer.shadowMap.enabled = true;
    encounterDiceRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    encounterDiceRenderer.domElement.setAttribute("aria-hidden", "true");
    encounterDice.replaceChildren(encounterDiceRenderer.domElement);

    encounterDiceScene.add(
      new THREE.HemisphereLight(0xffffff, 0x252525, 2.4)
    );
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    encounterDiceScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9db5ff, 1.1);
    fillLight.position.set(-4, 2, -3);
    encounterDiceScene.add(fillLight);

    encounterDiceFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.MeshStandardMaterial({
        color: 0x181818,
        roughness: 0.95,
        metalness: 0
      })
    );
    encounterDiceFloor.rotation.x = -Math.PI / 2;
    encounterDiceFloor.receiveShadow = true;
    encounterDiceScene.add(encounterDiceFloor);

    const textureSources = diceConfig.textures ?? {};
    const textures = await Promise.all(
      [1, 2, 3, 4, 5, 6].map((value) =>
        loadDiceFaceTexture(
          value,
          textureSources[String(value)] ?? textureSources[value],
          encounterDiceRenderer
        )
      )
    );
    const faceMaterials = textures.map((texture) =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.42,
        metalness: 0.05
      })
    );
    const materials = [
      faceMaterials[2],
      faceMaterials[3],
      faceMaterials[0],
      faceMaterials[5],
      faceMaterials[1],
      faceMaterials[4]
    ];

    encounterDiceMesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        diceConfig.size,
        diceConfig.size,
        diceConfig.size,
        2,
        2,
        2
      ),
      materials
    );
    encounterDiceMesh.position.set(0, diceConfig.size / 2, 0);
    encounterDiceMesh.castShadow = true;
    encounterDiceScene.add(encounterDiceMesh);

    encounterDiceResizeObserver = new ResizeObserver(
      resizeEncounterDiceRenderer
    );
    encounterDiceResizeObserver.observe(encounterDice);
    resizeEncounterDiceRenderer();

    const renderEncounterDice = () => {
      if (
        encounterDiceRenderer &&
        encounterDiceScene &&
        encounterDiceCamera
      ) {
        encounterDiceRenderer.render(
          encounterDiceScene,
          encounterDiceCamera
        );
        encounterDiceAnimationFrame = requestAnimationFrame(
          renderEncounterDice
        );
      }
    };
    renderEncounterDice();
  } catch (error) {
    console.warn("Encounter dice could not initialize.", error);
    encounterDiceRenderer = null;
    encounterDiceScene = null;
    encounterDiceCamera = null;
    encounterDiceMesh = null;
  }
}

function animateEncounterDiceRoll(result) {
  if (!encounterDiceMesh) {
    return waitFor(reducedMotionQuery.matches ? 1 : 520);
  }

  playGameSound("dice");
  const size = diceConfig.size;
  const targetQuaternion = getDiceTargetQuaternion(result);
  const startedAt = performance.now();
  const duration = reducedMotionQuery.matches ? 1 : 1150;
  let settlingQuaternion = null;

  encounterDiceMesh.position.set(
    THREE.MathUtils.randFloat(-0.25, 0.25),
    size / 2,
    THREE.MathUtils.randFloat(-0.18, 0.18)
  );
  encounterDiceMesh.quaternion.setFromEuler(
    new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
  );

  return new Promise((resolve) => {
    function animate(time) {
      const progress = Math.min((time - startedAt) / duration, 1);
      const flightProgress = Math.min(progress / 0.7, 1);
      const bounceProgress = Math.max(0, (progress - 0.7) / 0.3);

      encounterDiceMesh.position.y =
        size / 2 +
        Math.sin(flightProgress * Math.PI) * 2.25 +
        Math.abs(Math.sin(bounceProgress * Math.PI * 3)) *
          (1 - bounceProgress) * 0.42;
      encounterDiceMesh.position.x =
        Math.sin(progress * Math.PI * 2) * (1 - progress) * 0.42;
      encounterDiceMesh.position.z =
        Math.cos(progress * Math.PI * 2) * (1 - progress) * 0.26;

      if (progress < 0.72) {
        encounterDiceMesh.rotateX(0.17);
        encounterDiceMesh.rotateY(0.21);
        encounterDiceMesh.rotateZ(0.12);
      } else {
        if (!settlingQuaternion) {
          settlingQuaternion = encounterDiceMesh.quaternion.clone();
        }
        const settleProgress = THREE.MathUtils.clamp(
          (progress - 0.72) / 0.28,
          0,
          1
        );
        encounterDiceMesh.quaternion.slerpQuaternions(
          settlingQuaternion,
          targetQuaternion,
          1 - Math.pow(1 - settleProgress, 3)
        );
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
        return;
      }

      encounterDiceMesh.position.set(0, size / 2, 0);
      encounterDiceMesh.quaternion.copy(targetQuaternion);
      resolve();
    }

    requestAnimationFrame(animate);
  });
}

function resizeDiceRenderer() {
  if (!diceRenderer || !diceCamera || !dice) return;

  const width = Math.max(1, dice.clientWidth);
  const height = Math.max(1, dice.clientHeight);
  diceRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  diceRenderer.setSize(width, height, false);
  diceCamera.aspect = width / height;
  diceCamera.updateProjectionMatrix();
}

async function initializeDiceScene(customConfig = {}) {
  if (!dice || !rollButton || !diceStatus) return;

  diceConfig = {
    ...DEFAULT_DICE_CONFIG,
    ...customConfig,
    textures: {
      ...DEFAULT_DICE_CONFIG.textures,
      ...(customConfig.textures ?? {})
    },
    animation: {
      ...DEFAULT_DICE_CONFIG.animation,
      ...(customConfig.animation ?? {})
    }
  };

  rollButton.disabled = true;
  diceStatus.textContent = "Preparing 3D dice…";

  dice.style.position = "relative";
  dice.style.display = "block";
  dice.style.width = "clamp(88px, 7vw, 116px)";
  dice.style.minWidth = "88px";
  dice.style.height = "clamp(88px, 7vw, 116px)";
  dice.style.padding = "0";
  dice.style.overflow = "hidden";
  dice.style.background = "#101010";
  dice.style.color = "transparent";

  diceScene = new THREE.Scene();
  diceScene.background = new THREE.Color(0x101010);

  diceCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  diceCamera.position.set(4.8, 3.7, 5.8);
  diceCamera.lookAt(0, 0.75, 0);

  diceRenderer = new THREE.WebGLRenderer({ antialias: true });
  diceRenderer.outputColorSpace = THREE.SRGBColorSpace;
  diceRenderer.shadowMap.enabled = true;
  diceRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  diceRenderer.domElement.style.display = "block";
  diceRenderer.domElement.style.width = "100%";
  diceRenderer.domElement.style.height = "100%";
  diceRenderer.domElement.setAttribute("aria-hidden", "true");
  dice.replaceChildren(diceRenderer.domElement);

  const ambientLight = new THREE.HemisphereLight(0xffffff, 0x252525, 2.4);
  diceScene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
  keyLight.position.set(4, 7, 5);
  keyLight.castShadow = true;
  diceScene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9db5ff, 1.1);
  fillLight.position.set(-4, 2, -3);
  diceScene.add(fillLight);

  diceFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.MeshStandardMaterial({
      color: 0x181818,
      roughness: 0.95,
      metalness: 0
    })
  );
  diceFloor.rotation.x = -Math.PI / 2;
  diceFloor.receiveShadow = true;
  diceScene.add(diceFloor);

  const textureSources = diceConfig.textures;
  const textures = await Promise.all(
    [1, 2, 3, 4, 5, 6].map((value) =>
      loadDiceFaceTexture(
        value,
        textureSources[String(value)] ?? textureSources[value]
      )
    )
  );

  const faceMaterials = textures.map((texture) =>
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.42,
      metalness: 0.05
    })
  );

  // BoxGeometry material order: right, left, top, bottom, front, back.
  const materials = [
    faceMaterials[2],
    faceMaterials[3],
    faceMaterials[0],
    faceMaterials[5],
    faceMaterials[1],
    faceMaterials[4]
  ];

  diceMesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      diceConfig.size,
      diceConfig.size,
      diceConfig.size,
      2,
      2,
      2
    ),
    materials
  );
  diceMesh.position.set(0, diceConfig.size / 2, 0);
  diceMesh.castShadow = true;
  diceScene.add(diceMesh);

  diceResizeObserver?.disconnect();
  diceResizeObserver = new ResizeObserver(resizeDiceRenderer);
  diceResizeObserver.observe(dice);
  resizeDiceRenderer();

  diceState = "idle";
  dice.dataset.state = "idle";
  dice.setAttribute("aria-label", "3D dice. Current result: 1");
  diceStatus.textContent = "Ready to roll.";
  rollButton.disabled = false;
  diceLastFrameTime = performance.now();
  requestAnimationFrame(updateDiceAnimation);
}

function startDiceSettle(time) {
  if (!diceMesh || diceState === "settling") return;

  diceState = "settling";
  diceSettleStartTime = time;
  diceSettleStartPosition.copy(diceMesh.position);
  diceSettleEndPosition.set(0, diceConfig.size / 2, 0);
  diceSettleStartQuaternion.copy(diceMesh.quaternion);
  diceVelocity.set(0, 0, 0);
  diceAngularVelocity.set(0, 0, 0);
}

function finishDiceRoll() {
  diceMesh.position.copy(diceSettleEndPosition);
  diceMesh.quaternion.copy(diceTargetQuaternion);
  diceState = "idle";
  dice.dataset.state = "idle";
  dice.setAttribute("aria-label", `3D dice result: ${diceResult}`);
  diceStatus.textContent = `Player ${activePlayer} rolled ${diceResult}.`;
  playGameSound("card");
  turnPhase = "resolving-card";
  updateTurnInterface();
  window.dispatchEvent(
    new CustomEvent("wrath:dice-result", {
      detail: {
        result: diceResult,
        playerId: activePlayer
      }
    })
  );
}

function updateDicePhysics(time, deltaTime) {
  const animation = diceConfig.animation;
  const floorHeight = diceConfig.size / 2;
  const horizontalLimit = 1.45;

  diceVelocity.y += animation.gravity * deltaTime;
  diceMesh.position.addScaledVector(diceVelocity, deltaTime);

  const rotationStep = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      diceAngularVelocity.x * deltaTime,
      diceAngularVelocity.y * deltaTime,
      diceAngularVelocity.z * deltaTime,
      "XYZ"
    )
  );
  diceMesh.quaternion.multiply(rotationStep).normalize();

  ["x", "z"].forEach((axis) => {
    if (Math.abs(diceMesh.position[axis]) > horizontalLimit) {
      diceMesh.position[axis] = THREE.MathUtils.clamp(
        diceMesh.position[axis],
        -horizontalLimit,
        horizontalLimit
      );
      diceVelocity[axis] *= -0.62;
    }
  });

  if (diceMesh.position.y <= floorHeight && diceVelocity.y < 0) {
    diceMesh.position.y = floorHeight;

    if (diceBounceCounter < animation.bounceCount) {
      diceBounceCounter += 1;
      diceVelocity.y = Math.max(
        1.25,
        Math.abs(diceVelocity.y) * animation.restitution
      );
      diceVelocity.x *= 0.72;
      diceVelocity.z *= 0.72;
      diceAngularVelocity.multiplyScalar(0.78);
    } else {
      startDiceSettle(time);
    }
  }

  if (time - diceRollStartTime > 5000) {
    startDiceSettle(time);
  }
}

function updateDiceSettle(time) {
  const duration = Math.max(1, diceConfig.animation.settleDuration);
  const progress = THREE.MathUtils.clamp(
    (time - diceSettleStartTime) / duration,
    0,
    1
  );
  const easedProgress = 1 - Math.pow(1 - progress, 3);

  diceMesh.position.lerpVectors(
    diceSettleStartPosition,
    diceSettleEndPosition,
    easedProgress
  );
  diceMesh.quaternion.slerpQuaternions(
    diceSettleStartQuaternion,
    diceTargetQuaternion,
    easedProgress
  );

  if (progress >= 1) {
    finishDiceRoll();
  }
}

function updateDiceAnimation(time) {
  if (!diceRenderer || !diceScene || !diceCamera) return;

  const deltaTime = Math.min((time - diceLastFrameTime) / 1000, 0.034);
  diceLastFrameTime = time;

  if (diceState === "rolling") {
    updateDicePhysics(time, deltaTime);
  } else if (diceState === "settling") {
    updateDiceSettle(time);
  }

  diceRenderer.render(diceScene, diceCamera);
  requestAnimationFrame(updateDiceAnimation);
}

function rollWeightedPlayerDeck() {
  const configuredWeights =
    loadedGameData.rules?.balance?.playerDeckRollWeights ?? {};
  const entries = [1, 2, 3, 4, 5, 6].map((face) => ({
    face,
    weight: Math.max(
      0,
      Number(configuredWeights[String(face)]) ||
        (face <= 3 ? 3 : 1)
    )
  }));
  const totalWeight = entries.reduce(
    (total, entry) => total + entry.weight,
    0
  );

  if (totalWeight <= 0) {
    return Math.floor(Math.random() * 6) + 1;
  }

  let drawPosition = Math.random() * totalWeight;
  for (const entry of entries) {
    drawPosition -= entry.weight;
    if (drawPosition < 0) return entry.face;
  }

  return entries[entries.length - 1].face;
}

function rollDice({ automated = false } = {}) {
  if (
    !gameStarted ||
    diceState !== "idle" ||
    !diceMesh ||
    turnPhase !== "awaiting-roll" ||
    turnTransitioning ||
    (isActivePlayerAutomated() && !automated)
  ) {
    return;
  }

  diceResult = rollWeightedPlayerDeck();
  playGameSound("dice");
  diceTargetQuaternion.copy(getDiceTargetQuaternion(diceResult));
  diceBounceCounter = 0;
  diceRollStartTime = performance.now();
  diceState = "rolling";
  turnPhase = "rolling";
  updateTurnInterface();

  dice.dataset.state = "rolling";
  diceStatus.textContent = `Player ${activePlayer} is rolling…`;
  dice.setAttribute("aria-label", "3D dice rolling");
  rollButton.disabled = true;

  diceMesh.position.set(
    THREE.MathUtils.randFloat(-0.32, 0.32),
    diceConfig.size / 2 + 0.02,
    THREE.MathUtils.randFloat(-0.22, 0.22)
  );
  diceMesh.quaternion.setFromEuler(
    new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
  );

  const horizontalVelocity = diceConfig.animation.horizontalVelocity;
  diceVelocity.set(
    THREE.MathUtils.randFloatSpread(horizontalVelocity * 2),
    diceConfig.animation.launchVelocity,
    THREE.MathUtils.randFloatSpread(horizontalVelocity * 2)
  );

  const spin = diceConfig.animation.rotationSpeed;
  diceAngularVelocity.set(
    THREE.MathUtils.randFloat(spin * 0.72, spin),
    THREE.MathUtils.randFloat(spin * 0.72, spin),
    THREE.MathUtils.randFloat(spin * 0.72, spin)
  );
}

// =====================================================
// INITIALIZATION
// =====================================================

async function initializeGame() {
  const data = await loadGameData();
  loadedGameData = data;

  renderDecks(data.decks, data.textures?.cards);
  renderPlayers(data.players, data.textures?.ui);
  initializeThreeScene(
    data.board,
    data.textures?.board,
    [],
    data.reyath
  );
  configureGameSetup(data);
  await initializeDiceScene(data.dice);
}

rollButton.addEventListener("click", () => rollDice());
soundToggleButton?.addEventListener("click", toggleSound);
playerCountDecreaseButton.addEventListener("click", () => {
  changeSetupPlayerCount(-1);
});
playerCountIncreaseButton.addEventListener("click", () => {
  changeSetupPlayerCount(1);
});
startGameButton.addEventListener("click", startConfiguredGame);
finishMovementButton.addEventListener(
  "click",
  () => finishActivePlayerMovement()
);
autoplayToggleButton?.addEventListener("click", () => {
  setAutoplayEnabled(!autoplayEnabled);
});
restartGameButton.addEventListener("click", returnToGameSetup);
encounterRollButton.addEventListener(
  "click",
  handleEncounterRollButton
);

window.addEventListener("wrath:player-movement", (event) => {
  if (Number(event.detail?.playerId) !== Number(activePlayer)) return;

  activePlayerMovement = Math.max(
    0,
    Number(event.detail?.total) || 0
  );
  playerMovementBudgets.set(
    activePlayer,
    activePlayerMovement
  );
  turnPhase = activePlayerMovement > 0
    ? "moving"
    : "resolving-card";
  rollButton.disabled = true;
  updateTurnInterface();
  boardStatus.textContent =
    `Player ${activePlayer} may move ${activePlayerMovement} tile${activePlayerMovement === 1 ? "" : "s"}.`;
});

window.addEventListener("wrath:automation-query", (event) => {
  if (!event.detail) return;
  const player = getConfiguredPlayer(event.detail.playerId);
  event.detail.controlType = player?.controlType ?? "human";
  event.detail.autoplay = Boolean(
    player?.controlType === "human" && autoplayEnabled
  );
  event.detail.automated = Boolean(
    player?.controlType === "bot" || event.detail.autoplay
  );
});

window.addEventListener("wrath:reyath-movement", (event) => {
  queuedReyathMovement += Math.max(
    0,
    Number(event.detail?.amount) || 0
  );
});

window.addEventListener("wrath:reyath-attack", (event) => {
  if (!event.detail) return;
  queuedReyathAttacks.push({ ...event.detail });
});

window.addEventListener("wrath:reyath-movement-mode", (event) => {
  reyathMovementMode = event.detail?.mode ?? "nearest-player";
});

window.addEventListener("wrath:weather-change", (event) => {
  updateWeatherRoadTexture(event.detail?.texture ?? "normal");
  playGameSound("weather");
  boardStatus.textContent =
    `Weather changed to ${event.detail?.weather ?? "normal"}.`;
  appendGameLog(boardStatus.textContent, "neutral");
});

window.addEventListener("wrath:strong-winds", () => {
  movePlayersToOppositeSideOfRoad();
});

window.addEventListener("wrath:card-draw-closed", (event) => {
  playGameSound("card");
  if (Number(event.detail?.deck?.number) === 6) {
    activeReyathCard = event.detail?.card ?? null;
  }
  if (event.detail?.source === "reyath-turn") {
    if (event.detail?.message) {
      appendGameLog(event.detail.message);
    }
    updateTurnInterface();
    return;
  }

  rollButton.disabled = true;

  if (event.detail?.message) {
    appendGameLog(event.detail.message);
  }

  if (activePlayerMovement > 0) {
    turnPhase = "moving";
    diceStatus.textContent =
      `Player ${activePlayer}: ${activePlayerMovement} move${activePlayerMovement === 1 ? "" : "s"} remaining.`;
    updateTurnInterface();
    if (isActivePlayerAutomated()) {
      window.setTimeout(
        () => resumeAutomationForCurrentPhase(),
        getAutomationThinkDelay(0.55)
      );
    }
    return;
  }

  updateTurnInterface();

  window.setTimeout(() => {
    completeActivePlayerTurn();
  }, 260);
});

window.addEventListener("wrath:reyath-target-query", (event) => {
  if (!event.detail) return;

  const candidates = [...playerPositions.entries()]
    .filter(([playerId]) => !defeatedPlayerIds.has(Number(playerId)))
    .map(([playerId, position]) => ({
      playerId,
      distance:
        Math.abs(position.column - reyathPosition.column) +
        Math.abs(position.row - reyathPosition.row)
    }))
    .sort((first, second) =>
      first.distance - second.distance ||
      first.playerId - second.playerId
    );

  event.detail.playerIds = event.detail.mode === "proximate"
    ? candidates
        .filter((candidate) => candidate.distance <= 1)
        .slice(0, 1)
        .map((candidate) => candidate.playerId)
    : candidates.slice(0, 1).map((candidate) => candidate.playerId);
});

window.addEventListener("wrath:reyath-teleport-request", (event) => {
  if (!event.detail) return;

  const requestedPlayerId = Number(event.detail.targetPlayerId);
  const requestedPosition = playerPositions.get(requestedPlayerId);
  const target = requestedPosition
    ? {
        playerId: requestedPlayerId,
        position: requestedPosition
      }
    : findNearestPlayerToReyath();

  if (!target) {
    event.detail.message = "Reyath found no player to teleport toward.";
    return;
  }

  window.dispatchEvent(
    new CustomEvent("wrath:reyath-position", {
      detail: {
        column: target.position.column,
        row: target.position.row
      }
    })
  );

  event.detail.resolved = true;
  event.detail.message =
    `Reyath teleported to Player ${target.playerId}'s tile.`;

  window.dispatchEvent(
    new CustomEvent("wrath:reyath-encounter", {
      detail: {
        playerId: target.playerId,
        column: target.position.column,
        row: target.position.row,
        reason: "monster-teleport"
      }
    })
  );
});

window.addEventListener("wrath:demolition-request", (event) => {
  resolveDemolitionRequest(event.detail);
});

window.addEventListener("wrath:reyath-retreat", (event) => {
  queuedReyathMovement = 0;
  queuedReyathAttacks = [];
  reyathMovementMode = "nearest-player";
  moveReyathToHollow(Math.max(0, Number(event.detail?.damage) || 0));
});

window.addEventListener("wrath:reyath-position", (event) => {
  const column = THREE.MathUtils.clamp(
    Number(event.detail?.column) || 0,
    0,
    3
  );
  const row = THREE.MathUtils.clamp(
    Number(event.detail?.row) || 0,
    0,
    4
  );

  reyathPosition.column = column;
  reyathPosition.row = row;

  const destination = getMovementPoint(column, row);

  if (reyathSprite && destination) {
    reyathSprite.position.copy(destination);
    reyathSprite.position.y =
      TILE_HEIGHT + 0.02 + reyathSprite.scale.y / 2;
    reyathSprite.userData.groundY = reyathSprite.position.y;
    setReyathAnimationState("attacking", 620);
  }

  const atHollow =
    column === reyathHollowPosition.column &&
    row === reyathHollowPosition.row;

  setReyathState(atHollow ? "dormant" : "active");
});

window.addEventListener("wrath:noise-triggered", (event) => {
  const awayFromHollow =
    reyathPosition.column !== reyathHollowPosition.column ||
    reyathPosition.row !== reyathHollowPosition.row;
  const accepted = reyathState === "active" && awayFromHollow;

  if (event.detail) {
    event.detail.accepted = accepted;
    event.detail.message = accepted
      ? "The active Reyath detected the noise."
      : "The noise had no attraction effect while Reyath was dormant in the Hollow.";
  }
});

window.addEventListener("wrath:game-state-updated", (event) => {
  const reyath = event.detail?.reyath;
  if (reyath) {
    updateReyathHud(reyath);
  }
});

window.addEventListener("wrath:reyath-health-change", (event) => {
  updateReyathHud(event.detail);
  setReyathAnimationState("hurt", 720);
  playGameSound("damage");
  appendGameLog(
    `Reyath lost ${event.detail?.damage ?? 0} health and retreated to the Hollow.`,
    "success"
  );
});

window.addEventListener("wrath:reyath-state-change", (event) => {
  const state = event.detail?.state ?? "dormant";
  reyathStateValue.textContent = state;
});

window.addEventListener("wrath:player-stat-change", (event) => {
  const detail = event.detail ?? {};
  const inventory = document.querySelector(
    `.inventory-card[data-player="${detail.playerId}"]`
  );

  if (detail.healthDelta) {
    const damaged = detail.healthDelta < 0;
    setPlayerAnimationState(
      detail.playerId,
      damaged ? "hurt" : "heal",
      620
    );
    playGameSound(damaged ? "damage" : "heal");
    inventory?.classList.remove("is-damaged", "is-healed");
    requestAnimationFrame(() => {
      inventory?.classList.add(damaged ? "is-damaged" : "is-healed");
    });
    window.setTimeout(() => {
      inventory?.classList.remove("is-damaged", "is-healed");
    }, 520);
    appendGameLog(
      `Player ${detail.playerId} ${damaged ? "lost" : "gained"} ${Math.abs(detail.healthDelta)} health.`,
      damaged ? "damage" : "success"
    );
  }

  if (detail.armorDelta) {
    setPlayerAnimationState(detail.playerId, "armor", 620);
    inventory?.classList.remove("is-armored");
    requestAnimationFrame(() => inventory?.classList.add("is-armored"));
    window.setTimeout(() => inventory?.classList.remove("is-armored"), 620);
    playGameSound("armor");
    appendGameLog(
      `Player ${detail.playerId} ${detail.armorDelta < 0 ? "lost" : "gained"} ${Math.abs(detail.armorDelta)} armor.`
    );
  }

  if (detail.noticeDelta) {
    inventory?.classList.remove("is-noticed");
    requestAnimationFrame(() => inventory?.classList.add("is-noticed"));
    window.setTimeout(() => inventory?.classList.remove("is-noticed"), 620);
    appendGameLog(
      `Player ${detail.playerId} notice ${detail.noticeDelta > 0 ? "+" : ""}${detail.noticeDelta}.`
    );
  }

  if (detail.perksAdded?.length) {
    setPlayerAnimationState(detail.playerId, "perk", 780);
    inventory?.classList.remove("is-perk-updated");
    requestAnimationFrame(() => {
      inventory?.classList.add("is-perk-updated");
    });
    window.setTimeout(() => {
      inventory?.classList.remove("is-perk-updated");
    }, 720);
    playGameSound("heal");
    appendGameLog(
      `Player ${detail.playerId} unlocked ${detail.perksAdded.join(", ")}.`,
      "success"
    );
  }

  if (detail.statusesAdded?.length) {
    setPlayerAnimationState(detail.playerId, "perk", 620);
  }
});

window.addEventListener("wrath:status-expired", (event) => {
  appendGameLog(
    `Player ${event.detail?.playerId}'s ${event.detail?.label ?? "condition"} expired.`
  );
});

window.addEventListener("wrath:player-defeated", (event) => {
  const playerId = Number(event.detail?.playerId);
  defeatedPlayerIds.add(playerId);
  playerMovementBudgets.set(playerId, 0);

  const sprite = playerSprites.get(playerId);
  if (sprite) {
    sprite.userData.animationState = "defeated";
    sprite.userData.animationUntil = 0;
    sprite.material.opacity = 0.2;
  }

  playGameSound("defeat");

  if (playerId === activePlayer) {
    activePlayerMovement = 0;
    turnPhase = "resolving-card";
    updateTurnInterface();
  }

  appendGameLog(`Player ${playerId} has been defeated.`, "damage");
});

window.addEventListener("wrath:reyath-encounter", (event) => {
  if (
    gameOver ||
    event.detail?.reason === "monster-teleport" ||
    queuedReyathAttacks.length > 0
  ) {
    return;
  }
  const promise = queueReyathEncounter(event.detail ?? {});
  if (event.detail) {
    event.detail.promise = promise;
  }
});

window.addEventListener("wrath:all-destructible-locations-destroyed", () => {
  endGame(
    "defeat",
    "Every destructible location has been demolished. Reyath has destroyed the board."
  );
});

window.addEventListener("wrath:game-over", (event) => {
  endGame(
    event.detail?.outcome ?? "defeat",
    event.detail?.message ?? "The game has ended."
  );
});

zoomOutButton.addEventListener("click", () => {
  zoomCamera(-1);
});

zoomInButton.addEventListener("click", () => {
  zoomCamera(1);
});

resetViewButton.addEventListener("click", resetBoardView);
inventoryResizer.addEventListener("pointerdown", beginInventoryResize);
inventoryResizer.addEventListener("pointermove", continueInventoryResize);
inventoryResizer.addEventListener("pointerup", finishInventoryResize);
inventoryResizer.addEventListener("pointercancel", finishInventoryResize);
inventoryResizer.addEventListener("dblclick", resetInventoryPanelHeight);
inventoryResizer.addEventListener(
  "keydown",
  handleInventoryResizerKeyboard
);
window.addEventListener("resize", () => {
  setInventoryPanelHeight(inventoryPanelHeight, false);
});
window.addEventListener("keydown", handleGameKeyboard, {capture: true});
const boardResizeObserver = new ResizeObserver(resizeThreeBoard);
boardResizeObserver.observe(boardCanvas);

initializeInventoryResizer();
initializeGame();

