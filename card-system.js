// =====================================================
// WRATH OF REYATH — DICE-TO-CARD SYSTEM
// =====================================================

const cardLayer = document.querySelector("#card-draw-layer");
const cardDialog = document.querySelector(".card-draw-dialog");
const drawnCard = document.querySelector("#drawn-card");
const cardBackImage = document.querySelector("#drawn-card-back");
const cardFrontImage = document.querySelector("#drawn-card-front");
const cardBackFallback = document.querySelector("#card-back-fallback");
const cardFrontFallback = document.querySelector("#card-front-fallback");
const cardKicker = document.querySelector("#card-draw-kicker");
const cardTitle = document.querySelector("#card-draw-title");
const cardDescription = document.querySelector("#card-draw-description");
const cardProbability = document.querySelector("#card-probability");
const cardActions = document.querySelector("#card-draw-actions");
const cardResolution = document.querySelector("#card-resolution");
const storeCardButton = document.querySelector("#store-card");
const useCardButton = document.querySelector("#use-card");
const rollButton = document.querySelector("#roll-button");
const diceStatus = document.querySelector("#dice-status");

const DEFAULT_MAX_HEALTH = 5;
const DEFAULT_MAX_ARMOR = 5;
const DEFAULT_CARD_SLOTS = 2;
const DEFAULT_MAX_CARD_SLOTS = 4;
const CARD_REVEAL_DELAY = 760;

let gameData = null;
let activePlayerId = 1;
let pendingDraw = null;
let previousFocus = null;
const forcedDrawQueue = [];
const lastPlayerSnapshots = new Map();
const announcedDefeats = new Set();

const cardGameState = {
  currentWeather: null,
  reyath: {
    health: 20,
    maxHealth: 20,
    movement: 0,
    awareness: 0,
    stunnedTurns: 0,
    state: "dormant"
  },
  destroyedLocations: new Set(),
  players: new Map()
};

// =====================================================
// STATE INITIALIZATION
// =====================================================

function createPlayerState(player) {
  const playerRules = gameData?.rules?.player ?? {};
  const maxHealth = Number(
    playerRules.maxHealth ?? DEFAULT_MAX_HEALTH
  );
  const maxArmor = Number(
    playerRules.maxArmor ?? DEFAULT_MAX_ARMOR
  );
  const inventoryCapacity = Number(
    playerRules.baseInventorySlots ?? DEFAULT_CARD_SLOTS
  );

  return {
    id: Number(player.id),
    name: player.name,
    characterName: player.characterName ?? player.name,
    controlType: player.controlType ?? "human",
    health: maxHealth,
    maxHealth,
    armor: 0,
    maxArmor,
    inventory: [],
    inventoryCapacity,
    maxInventoryCapacity: Number(
      playerRules.maxInventorySlots ?? DEFAULT_MAX_CARD_SLOTS
    ),
    perks: [],
    statuses: [],
    notice: 0,
    turnNumber: 0,
    defeated: false,
    remainingMoves: 0,
    skippedTurns: 0
  };
}

function initializeCardSystem(data, playerId = 1) {
  gameData = data;
  activePlayerId = Number(playerId);
  cardGameState.players.clear();
  cardGameState.destroyedLocations.clear();
  lastPlayerSnapshots.clear();
  announcedDefeats.clear();
  cardGameState.currentWeather = "normal";

  const reyathRules = data.rules?.reyath ?? {};
  const reyathData = data.reyath ?? {};
  const reyathMaxHealth = Number(
    reyathData.maxHealth ?? reyathRules.maxHealth ?? 20
  );

  cardGameState.reyath.health = Number(
    reyathData.health ?? reyathMaxHealth
  );
  cardGameState.reyath.maxHealth = reyathMaxHealth;
  cardGameState.reyath.movement = 0;
  cardGameState.reyath.awareness = 0;
  cardGameState.reyath.stunnedTurns = 0;
  cardGameState.reyath.state =
    reyathData.state ?? reyathRules.startingState ?? "dormant";

  data.players.forEach((player) => {
    cardGameState.players.set(
      Number(player.id),
      createPlayerState(player)
    );
  });

  decorateInventories();
  emitGameStateUpdate("game-started");
}

function getActivePlayerState() {
  return cardGameState.players.get(Number(activePlayerId));
}

// =====================================================
// INVENTORY DISPLAY
// =====================================================

function getConditionDisplay(status) {
  const turns = Math.max(0, Number(status.turnsRemaining) || 0);
  const suffix = turns > 0 ? ` · ${turns}T` : "";

  if (status.type === "movement-multiplier") {
    const multiplier = Number(status.amount) || 1;
    return {
      label: `${multiplier >= 1 ? "Speed" : "Slow"} ×${multiplier}${suffix}`,
      tone: multiplier >= 1 ? "positive" : "negative"
    };
  }

  if (status.type === "skip-turns") {
    return { label: `Stopped${suffix}`, tone: "negative" };
  }

  if (status.type === "block-draw") {
    return { label: `Draw blocked${suffix}`, tone: "negative" };
  }

  if (status.status === "damage-boost") {
    const uses = Math.max(0, Number(status.usesRemaining) || 0);
    return {
      label: `Damage +${Number(status.amount) || 0} · ${uses} use${uses === 1 ? "" : "s"}`,
      tone: "positive"
    };
  }

  return {
    label: `${status.status ?? status.type}${suffix}`,
    tone: "neutral"
  };
}

function getPerkLabel(perk) {
  const labels = {
    "fur-trapper-boots": "Boots",
    "adventurers-pack": "Pack"
  };
  return labels[perk] ?? perk;
}

function decorateInventories() {
  cardGameState.players.forEach((playerState) => {
    const inventoryElement = document.querySelector(
      `.inventory-card[data-player="${playerState.id}"]`
    );

    if (!inventoryElement) return;

    inventoryElement.classList.toggle(
      "is-defeated",
      Boolean(playerState.defeated)
    );

    const statusText = inventoryElement.querySelector(
      ".inventory-card__status"
    );
    if (statusText && playerState.defeated) {
      statusText.textContent = "Defeated";
    }

    const noticeCount = inventoryElement.querySelector(".notice-count");
    if (noticeCount) {
      noticeCount.textContent = `Notice: ${playerState.notice}`;
    }

    const conditionList = inventoryElement.querySelector(
      ".player-condition-list"
    );
    if (conditionList) {
      conditionList.replaceChildren();
      playerState.statuses
        .slice(0, 3)
        .forEach((status) => {
          const display = getConditionDisplay(status);
          const chip = document.createElement("span");
          chip.className = `condition-chip is-${display.tone}`;
          const label = isStatusActive(playerState, status)
            ? display.label
            : `Next: ${display.label}`;
          chip.textContent = label;
          chip.title = label;
          conditionList.append(chip);
        });
    }

    const healthPoints = inventoryElement.querySelectorAll(
      ".health-point"
    );
    const armorPoints = inventoryElement.querySelectorAll(
      ".armor-point"
    );
    const statCounts = inventoryElement.querySelectorAll(
      ".stat-count"
    );

    healthPoints.forEach((point, index) => {
      point.classList.toggle(
        "is-filled",
        index < playerState.health
      );
    });

    armorPoints.forEach((point, index) => {
      point.classList.toggle(
        "is-filled",
        index < playerState.armor
      );
    });

    if (statCounts[0]) {
      statCounts[0].textContent = String(playerState.health);
    }

    if (statCounts[1]) {
      statCounts[1].textContent = String(playerState.armor);
    }

    const slotContainer = inventoryElement.querySelector(
      ".card-slots"
    );

    if (slotContainer) {
      while (
        slotContainer.children.length < playerState.inventoryCapacity
      ) {
        const slot = document.createElement("div");
        slot.className =
          "inventory-card-slot inventory-card-slot--backpack";
        slotContainer.append(slot);
      }

      slotContainer.classList.toggle(
        "has-backpack-capacity",
        playerState.inventoryCapacity > DEFAULT_CARD_SLOTS
      );
      slotContainer.setAttribute(
        "aria-label",
        `${playerState.inventoryCapacity} card slots`
      );
    }

    const slots = inventoryElement.querySelectorAll(
      ".inventory-card-slot"
    );

    slots.forEach((slot, index) => {
      const storedCard = playerState.inventory[index];
      slot.replaceChildren();
      slot.dataset.slot = String(index);

      if (!storedCard) {
        const label = document.createElement("span");
        label.textContent = `Card ${index + 1}`;
        slot.append(label);
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "stored-card-button";
      button.title = `Use ${storedCard.card.name}`;
      button.setAttribute(
        "aria-label",
        `Use stored card ${storedCard.card.name}`
      );

      const image = document.createElement("img");
      image.src = getCardImage(storedCard.deck, storedCard.card);
      image.alt = "";
      image.style.setProperty(
        "--stored-card-rotation",
        `${storedCard.deck.faceRotation ?? 90}deg`
      );

      const label = document.createElement("span");
      label.textContent = storedCard.card.name;

      button.append(image, label);
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        useStoredCard(playerState.id, index);
      });

      slot.append(button);
    });

    const perkSlots = inventoryElement.querySelectorAll(".perk-slot");
    const visiblePerks = [
      ...(playerState.inventoryCapacity > DEFAULT_CARD_SLOTS
        ? ["adventurers-pack"]
        : []),
      ...playerState.perks
    ];

    perkSlots.forEach((slot, index) => {
      const perk = visiblePerks[index];
      const label = slot.querySelector("span");
      slot.classList.toggle("is-unlocked", Boolean(perk));
      slot.setAttribute(
        "aria-label",
        perk ? `Unlocked perk: ${getPerkLabel(perk)}` : `Locked perk slot ${index + 1}`
      );
      if (label) {
        label.textContent = perk ? getPerkLabel(perk) : String(index + 1);
      }
    });
  });
}

function emitGameStateUpdate(reason = "state-updated") {
  const players = [];

  cardGameState.players.forEach((player) => {
    if (player.health <= 0) {
      player.defeated = true;
    }

    const snapshot = {
      id: player.id,
      name: player.name,
      characterName: player.characterName,
      controlType: player.controlType,
      health: player.health,
      maxHealth: player.maxHealth,
      armor: player.armor,
      maxArmor: player.maxArmor,
      notice: player.notice,
      defeated: player.defeated,
      perks: [...player.perks],
      statuses: player.statuses.map((status) => ({ ...status })),
      inventoryCapacity: player.inventoryCapacity
    };
    const previous = lastPlayerSnapshots.get(player.id);

    if (previous) {
      const healthDelta = snapshot.health - previous.health;
      const armorDelta = snapshot.armor - previous.armor;
      const noticeDelta = snapshot.notice - previous.notice;
      const perksAdded = snapshot.perks.filter(
        (perk) => !previous.perks.includes(perk)
      );
      const statusesAdded = snapshot.statuses.filter(
        (status) => !previous.statuses.some(
          (previousStatus) =>
            previousStatus.type === status.type &&
            previousStatus.source === status.source
        )
      );

      if (
        healthDelta ||
        armorDelta ||
        noticeDelta ||
        perksAdded.length ||
        statusesAdded.length
      ) {
        window.dispatchEvent(
          new CustomEvent("wrath:player-stat-change", {
            detail: {
              playerId: player.id,
              healthDelta,
              armorDelta,
              noticeDelta,
              perksAdded,
              statusesAdded,
              player: snapshot,
              reason
            }
          })
        );
      }
    }

    if (snapshot.defeated && !announcedDefeats.has(player.id)) {
      announcedDefeats.add(player.id);
      window.dispatchEvent(
        new CustomEvent("wrath:player-defeated", {
          detail: { playerId: player.id, player: snapshot, reason }
        })
      );
    }

    lastPlayerSnapshots.set(player.id, snapshot);
    players.push(snapshot);
  });

  decorateInventories();
  window.dispatchEvent(
    new CustomEvent("wrath:game-state-updated", {
      detail: {
        reason,
        players,
        reyath: { ...cardGameState.reyath },
        weather: cardGameState.currentWeather
      }
    })
  );

  if (
    players.length > 0 &&
    players.every((player) => player.defeated)
  ) {
    window.dispatchEvent(
      new CustomEvent("wrath:game-over", {
        detail: {
          outcome: "defeat",
          reason: "all-players-defeated",
          message: "Every participating player has lost all health. Reyath claims the board."
        }
      })
    );
  }
}

function useStoredCard(playerId, slotIndex) {
  const player = cardGameState.players.get(Number(playerId));
  const storedCard = player?.inventory[slotIndex];

  if (!player || !storedCard) return;

  if (Number(playerId) !== Number(activePlayerId)) {
    diceStatus.textContent =
      `It is not ${player.name}'s turn.`;
    return;
  }

  const resolution = applyCardEffects(
    storedCard.deck,
    storedCard.card,
    { skipMovement: true }
  );

  storedCard.usesRemaining -= 1;

  if (storedCard.usesRemaining <= 0) {
    player.inventory.splice(slotIndex, 1);
  }

  decorateInventories();
  diceStatus.textContent =
    `${player.name} used ${storedCard.card.name}. ${resolution}`;
}

function chooseStoredCardForAutomation(player, autoplay = false) {
  if (!player?.inventory.length) return -1;
  if (autoplay) return 0;

  return player.inventory.findIndex(({ deck, card }) => {
    const effects = getCardEffects(deck, card);
    return effects.some((effect) => {
      if (effect.type === "health" && Number(effect.amount) > 0) {
        return player.health < player.maxHealth;
      }
      if (effect.type === "armor" && Number(effect.amount) > 0) {
        return player.armor < player.maxArmor;
      }
      return (
        effect.type === "perk" ||
        effect.type === "inventory-slots" ||
        effect.type === "reyath-stun" ||
        (
          effect.type === "status" &&
          effect.status === "damage-boost"
        )
      );
    });
  });
}

// =====================================================
// DRAWING + FLIPPING
// =====================================================

function getDeckForRoll(result) {
  return gameData?.decks?.find(
    (deck) => Number(deck.number) === Number(result)
  );
}

function getDeckById(deckId) {
  return gameData?.decks?.find((deck) => deck.id === deckId);
}

function getCardEffects(deck, card) {
  return gameData?.rules?.priority2?.cardEffects?.[deck.id]?.[card.id]
    ?? card.effects
    ?? [];
}

function queryAutomationMode(playerId) {
  const player = cardGameState.players.get(Number(playerId));
  const detail = {
    playerId: Number(playerId),
    controlType: player?.controlType ?? "human",
    autoplay: false,
    automated: player?.controlType === "bot"
  };
  window.dispatchEvent(
    new CustomEvent("wrath:automation-query", { detail })
  );
  return detail;
}

function chooseAutomatedCardAction(deck, card, player, mode) {
  if (mode.autoplay) return "use";
  if (!player || player.inventory.length >= player.inventoryCapacity) {
    return "use";
  }

  const effects = getCardEffects(deck, card);
  const restoresHealth = effects.some(
    (effect) => effect.type === "health" && Number(effect.amount) > 0
  );
  const restoresArmor = effects.some(
    (effect) => effect.type === "armor" && Number(effect.amount) > 0
  );
  const grantsCombatValue = effects.some((effect) =>
    effect.type === "perk" ||
    effect.type === "inventory-slots" ||
    effect.type === "reyath-stun" ||
    (
      effect.type === "status" &&
      effect.status === "damage-boost"
    )
  );

  if (grantsCombatValue) return "use";
  if (restoresHealth && player.health < player.maxHealth) return "use";
  if (restoresArmor && player.armor < player.maxArmor) return "use";

  if (
    (restoresHealth && player.health >= player.maxHealth) ||
    (restoresArmor && player.armor >= player.maxArmor)
  ) {
    return "store";
  }

  return "use";
}

function resolvePendingDrawAutomatically() {
  if (!pendingDraw || cardActions.hidden) return false;
  const { deck, card, playerId } = pendingDraw;
  const player = cardGameState.players.get(Number(playerId));
  const mode = queryAutomationMode(playerId);
  if (!player || !mode.automated) return false;

  const decision = chooseAutomatedCardAction(deck, card, player, mode);
  cardActions.hidden = true;
  cardDescription.textContent = mode.autoplay
    ? `Autoplay is using ${card.name} automatically.`
    : `${player.characterName}'s ${mode.controlType} strategy chose to ${decision} ${card.name}.`;

  window.setTimeout(() => {
    if (!pendingDraw) return;
    const currentMode = queryAutomationMode(playerId);
    if (!currentMode.automated) {
      cardActions.hidden = false;
      return;
    }
    if (decision === "store" && !storeCardButton.disabled) {
      storePendingCard();
    } else {
      usePendingCard();
    }
  }, 520);
  return true;
}

function getEncounterDamageProfile(deck, card) {
  if (!deck || !card) {
    return { damage: 0, damageType: "physical" };
  }

  return getCardEffects(deck, card).reduce((profile, effect) => {
    let damage = 0;
    let damageType = "physical";

    if (effect.type === "reyath-attack") {
      damage = Math.max(0, Number(effect.damage) || 0);
      damageType = effect.damageType ?? "physical";
    } else if (effect.type === "health") {
      damage = Math.max(0, -(Number(effect.amount) || 0));
    } else if (effect.type === "hearing-damage") {
      damage = Math.max(0, Math.abs(Number(effect.amount) || 0));
      damageType = "hearing";
    }

    return damage > profile.damage
      ? { damage, damageType }
      : profile;
  }, { damage: 0, damageType: "physical" });
}

function isStatusActive(player, status) {
  if (status.singleUse) {
    return (
      Number(status.usesRemaining) > 0 &&
      Number(player.turnNumber) >= Number(status.startsAtTurn)
    );
  }

  return (
    Number(status.turnsRemaining) > 0 &&
    Number(player.turnNumber) >= Number(status.startsAtTurn)
  );
}

function getActiveStatuses(player, type) {
  return player.statuses.filter((status) =>
    status.type === type && isStatusActive(player, status)
  );
}

function isDrawBlocked(player, deckId) {
  return getActiveStatuses(player, "block-draw").some((status) => {
    const blockedDecks = status.decks ?? (
      status.deck ? [status.deck] : []
    );
    return blockedDecks.includes(deckId);
  });
}

function getCardImage(deck, card) {
  return `${deck.folder}/${card.file}`;
}

function getCardWeight(card) {
  const weight = Number(card.weight ?? 1);
  return Number.isFinite(weight) && weight > 0
    ? weight
    : 1;
}

function getPlayerCardWeight(deck, card) {
  const multipliers =
    gameData?.rules?.balance?.cardDrawMultipliers ?? {};
  const effects = getCardEffects(deck, card);
  let weight = getCardWeight(card);

  if (
    effects.some(
      (effect) =>
        effect.type === "status" &&
        effect.status === "damage-boost"
    )
  ) {
    weight *= Number(multipliers.damageBoost) || 3;
  }

  if (
    effects.some(
      (effect) =>
        effect.type === "health" &&
        Number(effect.amount) > 0
    )
  ) {
    weight *= Number(multipliers.healing) || 2.25;
  }

  if (
    effects.some(
      (effect) =>
        effect.type === "armor" &&
        Number(effect.amount) > 0
    )
  ) {
    weight *= Number(multipliers.armor) || 2.25;
  }

  return weight;
}

function drawRandomCard(deck, { favorPlayer = false } = {}) {
  const getWeight = favorPlayer
    ? (card) => getPlayerCardWeight(deck, card)
    : getCardWeight;
  const totalWeight = deck.cards.reduce(
    (total, card) => total + getWeight(card),
    0
  );
  let drawPosition = Math.random() * totalWeight;
  let index = deck.cards.length - 1;

  for (
    let cardIndex = 0;
    cardIndex < deck.cards.length;
    cardIndex += 1
  ) {
    drawPosition -= getWeight(deck.cards[cardIndex]);

    if (drawPosition < 0) {
      index = cardIndex;
      break;
    }
  }

  const card = deck.cards[index];

  return {
    card,
    index,
    probability: getWeight(card) / totalWeight
  };
}

function handleDiceResult(result, playerId) {
  if (!gameData) return;

  activePlayerId = Number(playerId);
  const deck = getDeckForRoll(result);

  if (!deck || !deck.cards?.length) {
    diceStatus.textContent =
      `Deck ${String(result).padStart(2, "0")} has no cards.`;
    rollButton.disabled = false;
    return;
  }

  const player = cardGameState.players.get(activePlayerId);

  if (player && isDrawBlocked(player, deck.id)) {
    diceStatus.textContent =
      `${player.name}'s ${deck.name} draw was discarded by Tempted Budget.`;
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("wrath:card-draw-closed", {
          detail: {
            deck,
            playerId: activePlayerId,
            source: "player-turn",
            skipped: true
          }
        })
      );
    }, 650);
    return;
  }

  const draw = drawRandomCard(deck, { favorPlayer: true });
  pendingDraw = {
    deck,
    card: draw.card,
    cardIndex: draw.index,
    probability: draw.probability,
    playerId: activePlayerId
  };

  if (Number(result) === 6) {
    window.dispatchEvent(
      new CustomEvent("wrath:immediate-reyath-hazard", {
        detail: {
          playerId: activePlayerId,
          preservesNormalReyathTurn: true
        }
      })
    );
  }

  openCardDraw();
}

function openForcedDraw(deckId, playerId) {
  const deck = getDeckById(deckId);

  if (!deck?.cards?.length) return false;

  const draw = drawRandomCard(deck, { favorPlayer: true });
  pendingDraw = {
    deck,
    card: draw.card,
    cardIndex: draw.index,
    probability: draw.probability,
    playerId: Number(playerId),
    source: "forced-player-draw"
  };
  openCardDraw();
  return true;
}

function handleReyathTurnDraw(completion) {
  if (!gameData || pendingDraw) {
    completion?.({ resolved: false });
    return false;
  }

  const deck = getDeckForRoll(6);

  if (!deck || !deck.cards?.length) {
    diceStatus.textContent = "Reyath's Deck 06 has no cards.";
    completion?.({ resolved: false });
    return false;
  }

  const draw = drawRandomCard(deck);
  pendingDraw = {
    deck,
    card: draw.card,
    cardIndex: draw.index,
    probability: draw.probability,
    playerId: activePlayerId,
    source: "reyath-turn",
    actor: "reyath",
    completion
  };

  openCardDraw();
  return true;
}

function setImageWithFallback(image, fallback, src, fallbackText) {
  image.hidden = false;
  fallback.hidden = true;
  fallback.textContent = "";
  image.src = src;

  image.onerror = () => {
    image.hidden = true;
    fallback.hidden = false;
    fallback.setAttribute(
      "aria-label",
      `${fallbackText} image could not be loaded`
    );
  };
}

function openCardDraw() {
  const { deck, card } = pendingDraw;
  const player = cardGameState.players.get(pendingDraw.playerId);
  const isReyathTurn = pendingDraw.actor === "reyath";
  const probability = pendingDraw.probability * 100;

  previousFocus = document.activeElement;
  rollButton.disabled = true;
  drawnCard.classList.remove("is-revealed");
  cardActions.hidden = true;
  cardResolution.textContent = "";
  cardLayer.hidden = false;
  cardLayer.style.setProperty(
    "--face-rotation",
    `${deck.faceRotation ?? 90}deg`
  );

  cardKicker.textContent =
    isReyathTurn
      ? `Reyath's turn · Deck ${deck.code}`
      : `Dice ${deck.number} · ${deck.name}`;
  cardTitle.textContent = isReyathTurn
    ? `Reyath draws from Deck ${deck.code}`
    : `${player.name} drew from Deck ${deck.code}`;
  cardDescription.textContent =
    "The number side is turning over to reveal your card.";
  cardProbability.textContent =
    `Draw chance: ${probability.toFixed(2)}%`;

  setImageWithFallback(
    cardBackImage,
    cardBackFallback,
    deck.backImage,
    `Deck ${deck.code}`
  );
  setImageWithFallback(
    cardFrontImage,
    cardFrontFallback,
    getCardImage(deck, card),
    card.name
  );

  requestAnimationFrame(() => {
    cardLayer.classList.add("is-open");
    cardDialog.focus?.();
  });

  window.setTimeout(() => {
    if (!pendingDraw) return;

    drawnCard.classList.add("is-revealed");
    cardTitle.textContent = card.name;

    const resolvesAutomatically =
      Number(deck.number) === 4 ||
      deck.resolution === "automatic" ||
      deck.storable === false;

    if (resolvesAutomatically) {
      cardDescription.textContent = Number(deck.number) === 4
        ? `${card.name} is an Unluckiness card. Its effects resolve automatically and it cannot be stored.`
        : `${card.name} resolves automatically and cannot be stored.`;
      cardActions.hidden = true;

      const resolution = applyCardEffects(deck, card);
      cardResolution.textContent = resolution;

      window.setTimeout(() => {
        closeCardDraw(
          isReyathTurn
            ? `Reyath resolved ${card.name}. ${resolution}`
            : `${player.name} resolved ${card.name}. ${resolution}`
        );
      }, 1500);

      return;
    }

    cardDescription.textContent =
      `Choose whether ${player.name} stores this card or uses it now.`;
    cardActions.hidden = false;

    const inventoryFull =
      player.inventory.length >= player.inventoryCapacity;
    storeCardButton.disabled = inventoryFull;
    storeCardButton.textContent = inventoryFull
      ? "Inventory full"
      : "Store in inventory";

    useCardButton.focus();
    resolvePendingDrawAutomatically();
  }, CARD_REVEAL_DELAY);
}

function closeCardDraw(message = "") {
  cardLayer.classList.remove("is-open");
  const completedDraw = pendingDraw;
  pendingDraw = null;

  window.setTimeout(() => {
    cardLayer.hidden = true;
    drawnCard.classList.remove("is-revealed");
    cardActions.hidden = true;
    rollButton.disabled = true;
    diceStatus.textContent = message || "Ready to roll.";
    previousFocus?.focus?.();

    if (
      completedDraw?.source !== "reyath-turn" &&
      forcedDrawQueue.length > 0
    ) {
      const nextDeckId = forcedDrawQueue.shift();
      if (openForcedDraw(nextDeckId, completedDraw?.playerId)) {
        return;
      }
    }

    window.dispatchEvent(
      new CustomEvent("wrath:card-draw-closed", {
        detail: {
          deck: completedDraw?.deck,
          card: completedDraw?.card,
          playerId: completedDraw?.playerId,
          source: completedDraw?.source ?? "player-turn",
          message
        }
      })
    );

    completedDraw?.completion?.({
      resolved: true,
      deck: completedDraw.deck,
      card: completedDraw.card,
      message
    });
  }, 260);
}

// =====================================================
// STORE ANIMATION
// =====================================================

function animateCardToInventory(deck, card, targetSlot, onComplete) {
  const sourceRect = drawnCard.getBoundingClientRect();
  const targetRect = targetSlot.getBoundingClientRect();
  const flyingCard = document.createElement("img");

  flyingCard.className = "card-flight";
  flyingCard.src = getCardImage(deck, card);
  flyingCard.alt = "";
  flyingCard.style.setProperty(
    "--flight-rotation",
    `${deck.faceRotation ?? 90}deg`
  );
  flyingCard.style.left = `${sourceRect.left}px`;
  flyingCard.style.top = `${sourceRect.top}px`;
  flyingCard.style.width = `${sourceRect.width}px`;
  flyingCard.style.height = `${sourceRect.height}px`;
  document.body.append(flyingCard);

  requestAnimationFrame(() => {
    flyingCard.style.left = `${targetRect.left}px`;
    flyingCard.style.top = `${targetRect.top}px`;
    flyingCard.style.width = `${targetRect.width}px`;
    flyingCard.style.height = `${targetRect.height}px`;
    flyingCard.style.opacity = "0.16";
  });

  window.setTimeout(() => {
    flyingCard.remove();
    onComplete();
  }, 620);
}

function storePendingCard() {
  if (!pendingDraw) return;

  const { deck, card, playerId } = pendingDraw;
  const player = cardGameState.players.get(playerId);

  if (deck.storable === false || Number(deck.number) === 4) {
    cardResolution.textContent =
      `${deck.name} cards resolve immediately and cannot be stored.`;
    return;
  }

  if (player.inventory.length >= player.inventoryCapacity) {
    cardResolution.textContent =
      `This inventory already contains its maximum of ${player.inventoryCapacity} cards.`;
    return;
  }

  const destinationIndex = player.inventory.length;
  const movementResolution = applyCardEffects(
    deck,
    card,
    { movementOnly: true }
  );
  player.inventory.push({
    deck,
    card,
    movementResolved: true,
    usesRemaining: Math.max(1, Number(card.uses) || 1)
  });

  decorateInventories();
  const targetSlot = document.querySelector(
    `.inventory-card[data-player="${playerId}"] ` +
    `.inventory-card-slot[data-slot="${destinationIndex}"]`
  );

  storeCardButton.disabled = true;
  useCardButton.disabled = true;
  cardResolution.textContent =
    `${card.name} is moving into ${player.name}'s inventory. ${movementResolution}`;

  animateCardToInventory(deck, card, targetSlot, () => {
    useCardButton.disabled = false;
    closeCardDraw(
      `${player.name} stored ${card.name}.`
    );
  });
}

// =====================================================
// EFFECT RESOLUTION
// =====================================================

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getEffectTargets(effect) {
  if (effect.target === "all-players") {
    return [...cardGameState.players.values()].filter(
      (player) => !player.defeated
    );
  }

  if (
    pendingDraw?.actor === "reyath" &&
    ["current-player", "proximate-player"].includes(effect.target)
  ) {
    const targetDetail = {
      mode: effect.target === "proximate-player"
        ? "proximate"
        : "nearest",
      playerIds: []
    };

    window.dispatchEvent(
      new CustomEvent("wrath:reyath-target-query", {
        detail: targetDetail
      })
    );

    return targetDetail.playerIds
      .map((playerId) => cardGameState.players.get(Number(playerId)))
      .filter(Boolean);
  }

  return [getActivePlayerState()].filter(Boolean);
}

function changeHealth(player, amount) {
  if (amount >= 0) {
    const before = player.health;
    player.health = clamp(
      player.health + amount,
      0,
      player.maxHealth
    );
    return player.health - before;
  }

  let damage = Math.abs(amount);
  const absorbed = Math.min(player.armor, damage);
  player.armor -= absorbed;
  damage -= absorbed;
  player.health = clamp(
    player.health - damage,
    0,
    player.maxHealth
  );

  return -(absorbed + damage);
}

function resolveHearingDamage(effect) {
  const messages = [];

  getEffectTargets(effect).forEach((player) => {
    const defenseRoll = Math.floor(Math.random() * 6) + 1;

    if (defenseRoll >= 4) {
      messages.push(
        `${player.name} rolled ${defenseRoll} and avoided hearing damage.`
      );
    } else {
      player.health = clamp(
        player.health - Math.abs(Number(effect.amount) || 0),
        0,
        player.maxHealth
      );
      messages.push(
        `${player.name} rolled ${defenseRoll} and took ${Math.abs(effect.amount)} hearing damage.`
      );
    }
  });

  return messages;
}

function addTimedStatus(player, effect, card) {
  const duration = Math.max(
    1,
    Number(effect.durationTurns ?? effect.amount) || 1
  );
  const startsAtTurn = Number(player.turnNumber) +
    (effect.starts === "next" ? 1 : 0);

  const isSingleUseDamageBoost =
    effect.type === "status" &&
    effect.status === "damage-boost";

  player.statuses.push({
    ...effect,
    turnsRemaining: isSingleUseDamageBoost ? 0 : duration,
    startsAtTurn,
    sourceCard: card.id,
    ...(isSingleUseDamageBoost
      ? { singleUse: true, usesRemaining: 1 }
      : {})
  });
}

function getMovementMultiplier(player) {
  return getActiveStatuses(player, "movement-multiplier")
    .reduce(
      (total, status) => total * (Number(status.amount) || 1),
      1
    );
}

function grantPlayerMovement(player, amount, card, messages) {
  const baseMovement = Math.max(0, Number(amount) || 0);
  const multiplier = getMovementMultiplier(player);
  const adjustedMovement = baseMovement > 0
    ? Math.max(1, Math.floor(baseMovement * multiplier))
    : 0;

  player.remainingMoves =
    Math.max(0, Number(player.remainingMoves) || 0) + adjustedMovement;
  messages.push(
    multiplier === 1
      ? `${player.name} gains ${adjustedMovement} tile move${adjustedMovement === 1 ? "" : "s"}.`
      : `${player.name} gains ${adjustedMovement} tile move${adjustedMovement === 1 ? "" : "s"} after a ×${multiplier} speed modifier.`
  );

  window.dispatchEvent(
    new CustomEvent("wrath:player-movement", {
      detail: {
        playerId: player.id,
        amount: adjustedMovement,
        baseAmount: baseMovement,
        multiplier,
        total: player.remainingMoves,
        card
      }
    })
  );
}

function applyCardEffects(deck, card, options = {}) {
  const messages = [];
  const cardEffects = getCardEffects(deck, card);
  const statusTypes = new Set([
    "movement-multiplier",
    "status",
    "skip-turns",
    "block-draw",
    "perk",
    "inventory-slots",
    "reyath-stun"
  ]);
  const orderedEffects = [
    ...cardEffects.filter((effect) => statusTypes.has(effect.type)),
    ...cardEffects.filter((effect) => !statusTypes.has(effect.type))
  ];

  orderedEffects.forEach((effect) => {
    const isMovementEffect = [
      "movement",
      "player-movement",
      "reyath-movement",
      "bonus-roll-movement"
    ].includes(effect.type);

    if (options.movementOnly && !isMovementEffect) return;
    if (options.skipMovement && isMovementEffect) return;

    switch (effect.type) {
      case "health":
      case "armor": {
        getEffectTargets(effect).forEach((player) => {
          if (effect.type === "health") {
            changeHealth(player, Number(effect.amount) || 0);
          } else {
            player.armor = clamp(
              player.armor + (Number(effect.amount) || 0),
              0,
              player.maxArmor
            );
          }

          messages.push(
            `${player.name}: ${effect.type} ${effect.amount >= 0 ? "+" : ""}${effect.amount}.`
          );
        });
        break;
      }

      case "set-armor":
        getEffectTargets(effect).forEach((player) => {
          player.armor = clamp(
            Number(effect.amount) || 0,
            0,
            player.maxArmor
          );
          messages.push(`${player.name}'s armor is now ${player.armor}.`);
        });
        break;

      case "hearing-damage":
        messages.push(...resolveHearingDamage(effect));
        break;

      case "movement":
        if (Number(deck.number) !== 6) {
          getEffectTargets({
            ...effect,
            target: effect.target === "reyath"
              ? "current-player"
              : effect.target
          }).forEach((player) => {
            grantPlayerMovement(player, effect.amount, card, messages);
          });
          break;
        }

        // Deck 06 uses the same legacy JSON type for Reyath movement.
        // Continue into the Reyath-specific resolver below.
      case "reyath-movement":
        cardGameState.reyath.movement += Number(effect.amount) || 0;
        messages.push(
          `Reyath gains ${effect.amount} immediate tile move${effect.amount === 1 ? "" : "s"}.`
        );
        window.dispatchEvent(
          new CustomEvent("wrath:reyath-movement", {
            detail: {
              amount: Number(effect.amount) || 0,
              total: cardGameState.reyath.movement,
              card
            }
          })
        );
        break;

      case "player-movement":
        getEffectTargets(effect).forEach((player) => {
          grantPlayerMovement(player, effect.amount, card, messages);
        });
        break;

      case "bonus-roll-movement": {
        const roll = Math.floor(Math.random() * 6) + 1;
        const successRolls = (effect.successRolls ?? []).map(Number);
        const player = getActivePlayerState();

        if (player && successRolls.includes(roll)) {
          grantPlayerMovement(player, effect.amount, card, messages);
          messages.push(`${player.name} rolled ${roll} and earned the bonus move.`);
        } else if (player) {
          messages.push(`${player.name} rolled ${roll}; no Frosty Freeze bonus move.`);
        }
        break;
      }

      case "destroy-reyath-location": {
        const demolitionDetail = {
          card,
          deck,
          playerId: activePlayerId,
          rules: gameData?.rules?.demolition ?? {},
          message: ""
        };

        window.dispatchEvent(
          new CustomEvent("wrath:demolition-request", {
            detail: demolitionDetail
          })
        );

        messages.push(
          demolitionDetail.message ||
          "Demolition is waiting for the board to resolve it."
        );
        break;
      }

      case "set-weather":
        cardGameState.currentWeather = effect.weather;
        messages.push(`Weather changed to ${effect.weather}.`);
        window.dispatchEvent(
          new CustomEvent("wrath:weather-change", {
            detail: {
              weather: effect.weather,
              texture: effect.texture ?? "normal",
              card,
              deck
            }
          })
        );
        break;

      case "strong-winds":
        window.dispatchEvent(
          new CustomEvent("wrath:strong-winds", {
            detail: { card, deck }
          })
        );
        messages.push("Strong Winds moved every player to the opposite side of the road.");
        break;

      case "notice":
        getEffectTargets(effect).forEach((player) => {
          player.notice = Math.max(
            0,
            Number(player.notice) + (Number(effect.amount) || 0)
          );
          messages.push(`${player.name} notice +${effect.amount}.`);
        });
        break;

      case "reyath-awareness":
        cardGameState.reyath.awareness = Math.max(
          0,
          cardGameState.reyath.awareness +
            (Number(effect.amount) || 0)
        );
        messages.push(`Reyath awareness +${effect.amount}.`);
        break;

      case "monster-teleport": {
        const mostNoticedPlayer = [...cardGameState.players.values()]
          .filter((player) => !player.defeated)
          .sort((first, second) =>
            Number(second.notice) - Number(first.notice) ||
            first.id - second.id
          )[0];
        const teleportDetail = {
          destination: effect.destination,
          targetPlayerId: mostNoticedPlayer?.id ?? null,
          card,
          deck,
          resolved: false,
          message: ""
        };

        window.dispatchEvent(
          new CustomEvent("wrath:reyath-teleport-request", {
            detail: teleportDetail
          })
        );

        messages.push(
          teleportDetail.message ||
          "Reyath's teleport could not find a destination."
        );
        break;
      }

      case "reyath-movement-mode":
        window.dispatchEvent(
          new CustomEvent("wrath:reyath-movement-mode", {
            detail: { mode: effect.mode, card }
          })
        );
        messages.push(`Reyath movement mode: ${effect.mode}.`);
        break;

      case "reyath-attack":
        window.dispatchEvent(
          new CustomEvent("wrath:reyath-attack", {
            detail: { ...effect, card, deck }
          })
        );
        messages.push(`${card.name} queued a ${effect.pattern} attack.`);
        break;

      case "draw-card":
        forcedDrawQueue.push(effect.deck);
        messages.push(`A forced draw from ${effect.deck} is queued.`);
        break;

      case "movement-multiplier":
      case "status":
      case "skip-turns":
      case "block-draw":
        getEffectTargets(effect).forEach((player) => {
          addTimedStatus(player, effect, card);
        });
        messages.push(`${effect.type} condition updated.`);
        break;

      case "inventory-slots":
        getEffectTargets(effect).forEach((player) => {
          player.inventoryCapacity = clamp(
            player.inventoryCapacity + (Number(effect.amount) || 0),
            DEFAULT_CARD_SLOTS,
            player.maxInventoryCapacity
          );
        });
        messages.push("Inventory capacity increased.");
        break;

      case "perk":
        getEffectTargets(effect).forEach((player) => {
          if (!player.perks.includes(effect.perk)) {
            player.perks.push(effect.perk);
          }
        });
        messages.push(`${effect.perk} unlocked.`);
        break;

      case "reyath-stun":
        cardGameState.reyath.stunnedTurns += Math.max(
          1,
          Number(effect.durationTurns) || 1
        );
        window.dispatchEvent(
          new CustomEvent("wrath:reyath-stun", {
            detail: {
              turns: cardGameState.reyath.stunnedTurns,
              card
            }
          })
        );
        messages.push("Reyath will remain idle on its next turn.");
        break;

      case "clear-weather-statuses":
        getEffectTargets(effect).forEach((player) => {
          player.statuses = player.statuses.filter(
            (status) => status.duration !== "until-weather-changes"
          );
        });
        messages.push("Weather-linked statuses cleared.");
        break;

      case "teleport":
        window.dispatchEvent(
          new CustomEvent("wrath:player-teleport", {
            detail: {
              playerId: activePlayerId,
              destination: effect.destination,
              card
            }
          })
        );
        messages.push("Player teleport queued for board resolution.");
        break;

      default:
        messages.push(`${effect.type} is queued for board resolution.`);
    }
  });

  emitGameStateUpdate(`card:${card.id}`);
  window.dispatchEvent(
    new CustomEvent("wrath:card-used", {
      detail: {
        deck,
        card,
        playerId: activePlayerId,
        gameState: cardGameState
      }
    })
  );

  return messages.join(" ") || "No immediate numerical effect.";
}

function usePendingCard() {
  if (!pendingDraw) return;

  const { deck, card, playerId } = pendingDraw;
  const player = cardGameState.players.get(playerId);
  const resolution = applyCardEffects(deck, card);

  storeCardButton.disabled = true;
  useCardButton.disabled = true;
  cardResolution.textContent = resolution;

  window.setTimeout(() => {
    useCardButton.disabled = false;
    closeCardDraw(
      `${player.name} used ${card.name}. ${resolution}`
    );
  }, 1100);
}

// =====================================================
// EVENTS
// =====================================================

window.addEventListener("wrath:ready", (event) => {
  initializeCardSystem(
    event.detail.data,
    event.detail.playerId
  );
});

window.addEventListener("wrath:active-player", (event) => {
  activePlayerId = Number(event.detail.playerId);
  const player = cardGameState.players.get(activePlayerId);

  if (player) {
    player.turnNumber += 1;
    player.remainingMoves = 0;
  }
  requestAnimationFrame(decorateInventories);
});

window.addEventListener("wrath:automation-state-query", (event) => {
  if (!event.detail) return;
  const player = cardGameState.players.get(
    Number(event.detail.playerId)
  );
  if (!player) return;
  event.detail.health = player.health;
  event.detail.maxHealth = player.maxHealth;
  event.detail.armor = player.armor;
  event.detail.maxArmor = player.maxArmor;
  event.detail.inventoryCount = player.inventory.length;
  event.detail.inventoryCapacity = player.inventoryCapacity;
  event.detail.notice = player.notice;
  event.detail.statuses = player.statuses.map((status) => ({ ...status }));
});

window.addEventListener("wrath:automation-turn-start", (event) => {
  if (!event.detail) return;
  const player = cardGameState.players.get(
    Number(event.detail.playerId)
  );
  if (!player || player.defeated) return;

  const mode = queryAutomationMode(player.id);
  if (!mode.automated) return;
  const storedCardIndex = chooseStoredCardForAutomation(
    player,
    mode.autoplay
  );
  if (storedCardIndex < 0) return;

  useStoredCard(player.id, storedCardIndex);
  event.detail.usedStoredCard = true;
});

window.addEventListener("wrath:autoplay-change", (event) => {
  if (event.detail?.enabled) {
    resolvePendingDrawAutomatically();
  }
});

window.addEventListener("wrath:player-turn-start-query", (event) => {
  const player = cardGameState.players.get(
    Number(event.detail?.playerId)
  );

  if (!player || !event.detail) return;

  const skipStatus = getActiveStatuses(player, "skip-turns")[0];
  event.detail.skipTurn = Boolean(skipStatus);
  event.detail.message = skipStatus
    ? `${player.name} cannot move this turn because of Stop Light Stupidity.`
    : "";
});

window.addEventListener("wrath:player-turn-ended", (event) => {
  const player = cardGameState.players.get(
    Number(event.detail?.playerId)
  );

  if (!player) return;

  const expiredStatuses = [];
  player.statuses.forEach((status) => {
    if (status.singleUse) return;

    if (isStatusActive(player, status)) {
      status.turnsRemaining -= 1;
      if (status.turnsRemaining <= 0) {
        expiredStatuses.push(status);
      }
    }
  });
  player.statuses = player.statuses.filter(
    (status) => status.singleUse
      ? Number(status.usesRemaining) > 0
      : Number(status.turnsRemaining) > 0
  );
  expiredStatuses.forEach((status) => {
    window.dispatchEvent(
      new CustomEvent("wrath:status-expired", {
        detail: {
          playerId: player.id,
          status,
          label: getConditionDisplay(status).label.replace(/ · \d+T$/, "")
        }
      })
    );
  });
  emitGameStateUpdate("turn-ended");
});

window.addEventListener("wrath:movement-permission-query", (event) => {
  if (!event.detail) return;

  const player = cardGameState.players.get(
    Number(event.detail.playerId)
  );
  const roadRow = Number(
    gameData?.rules?.priority2?.roadRow ?? 2
  );
  const floodedWeather =
    gameData?.rules?.priority2?.floodedWeather ?? "rain-storm";
  const enteringRoad = Number(event.detail.to?.row) === roadRow;
  const hasBoots = player?.perks.includes("fur-trapper-boots");

  if (
    cardGameState.currentWeather === floodedWeather &&
    enteringRoad &&
    !hasBoots
  ) {
    event.detail.allowed = false;
    event.detail.reason =
      `${player?.name ?? "This player"} needs Fur Trapper Boots to enter the flooded weather road.`;
  }
});

window.addEventListener("wrath:reyath-turn-start-query", (event) => {
  if (!event.detail) return;

  if (cardGameState.reyath.stunnedTurns > 0) {
    cardGameState.reyath.stunnedTurns -= 1;
    event.detail.skipTurn = true;
    event.detail.message =
      "Reyath is stunned by Burrito Bowl Blaster and remains idle.";
  }
});

window.addEventListener("wrath:reyath-attack-resolution", (event) => {
  const detail = event.detail ?? {};
  const damage = Math.max(0, Number(detail.damage) || 0);
  const dodgeThreshold = Number(detail.dodgeThreshold) || 0;
  const results = [];
  const manualRolls = new Map(
    (detail.manualRolls ?? []).map((result) => [
      Number(result.playerId),
      result
    ])
  );

  (detail.playerIds ?? []).forEach((playerId) => {
    const player = cardGameState.players.get(Number(playerId));
    if (!player) return;

    const manualResult = manualRolls.get(player.id);
    const defenseRoll = manualResult
      ? Number(manualResult.roll)
      : dodgeThreshold > 0
        ? Math.floor(Math.random() * 6) + 1
        : null;
    const attackDodged = manualResult
      ? Boolean(manualResult.dodged)
      : defenseRoll !== null && defenseRoll >= dodgeThreshold;
    const resolvedDamage = manualResult
      ? Math.max(0, Number(manualResult.damage) || 0)
      : attackDodged
        ? 0
        : damage;

    if (!attackDodged && resolvedDamage > 0) {
      if (detail.damageType === "hearing") {
        player.health = clamp(
          player.health - resolvedDamage,
          0,
          player.maxHealth
        );
      } else {
        changeHealth(player, -resolvedDamage);
      }
    }

    results.push({
      playerId: player.id,
      roll: defenseRoll,
      dodged: attackDodged,
      damage: attackDodged ? 0 : resolvedDamage
    });
  });

  detail.results = results;
  detail.message = results.length === 0
    ? "No players were inside the attack area."
    : results.map((result) => {
        if (result.dodged) {
          return `Player ${result.playerId} rolled ${result.roll} and dodged.`;
        }
        const rollMessage = result.roll === null
          ? ""
          : ` rolled ${result.roll} and`;
        return `Player ${result.playerId}${rollMessage} took ${result.damage} damage.`;
      }).join(" ");
  emitGameStateUpdate("reyath-attack");
});

window.addEventListener("wrath:player-step-complete", (event) => {
  const player = cardGameState.players.get(
    Number(event.detail?.playerId)
  );

  if (player) {
    player.remainingMoves = Math.max(
      0,
      Number(event.detail?.remainingMoves) || 0
    );
  }
});

window.addEventListener("wrath:dice-result", (event) => {
  handleDiceResult(
    event.detail.result,
    event.detail.playerId
  );
});

window.addEventListener("wrath:reyath-card-draw", (event) => {
  if (!event.detail) return;

  event.detail.handled = handleReyathTurnDraw(
    event.detail.complete
  );
});

window.addEventListener("wrath:reyath-state-change", (event) => {
  const nextState = event.detail?.state;

  if (nextState) {
    cardGameState.reyath.state = nextState;
  }
});

window.addEventListener("wrath:demolition-resolved", (event) => {
  if (event.detail?.destroyed) {
    cardGameState.destroyedLocations.add(
      Number(event.detail.locationId)
    );
  }
});

window.addEventListener("wrath:combat-profile-query", (event) => {
  const player = cardGameState.players.get(
    Number(event.detail?.playerId)
  );
  if (!player || !event.detail) return;

  const damageBoost = getActiveStatuses(player, "status")
    .find((status) => status.status === "damage-boost");
  event.detail.damageBoost = Math.max(
    0,
    Number(damageBoost?.amount) || 0
  );
});

window.addEventListener("wrath:damage-boost-consumed", (event) => {
  const player = cardGameState.players.get(
    Number(event.detail?.playerId)
  );
  if (!player) return;

  const damageBoost = getActiveStatuses(player, "status")
    .find((status) => status.status === "damage-boost");
  if (!damageBoost) return;

  damageBoost.usesRemaining = Math.max(
    0,
    Number(damageBoost.usesRemaining) - 1
  );
  player.statuses = player.statuses.filter(
    (status) =>
      status !== damageBoost || Number(status.usesRemaining) > 0
  );
  decorateInventories();
  emitGameStateUpdate("damage-boost-consumed");
});

window.addEventListener("wrath:encounter-card-evaluate", (event) => {
  if (!event.detail?.card) return;
  const deck = getDeckForRoll(6);
  if (!deck) return;

  const profile = getEncounterDamageProfile(
    deck,
    event.detail.card
  );
  event.detail.damage = profile.damage;
  event.detail.damageType = profile.damageType;
  event.detail.image = getCardImage(deck, event.detail.card);
  event.detail.handled = true;
});

window.addEventListener("wrath:encounter-card-request", (event) => {
  if (!event.detail) return;
  const deck = getDeckForRoll(6);
  if (!deck?.cards?.length) return;

  const draw = drawRandomCard(deck);
  const profile = getEncounterDamageProfile(deck, draw.card);
  event.detail.deck = deck;
  event.detail.card = draw.card;
  event.detail.damage = profile.damage;
  event.detail.damageType = profile.damageType;
  event.detail.image = getCardImage(deck, draw.card);
  event.detail.probability = draw.probability;
  event.detail.handled = true;
});

window.addEventListener("wrath:encounter-success", (event) => {
  const damage = Math.max(
    0,
    Number(
      event.detail?.damage ??
      gameData?.rules?.reyath?.successfulEncounterDamage ??
      1
    ) || 0
  );

  cardGameState.reyath.health = clamp(
    cardGameState.reyath.health - damage,
    0,
    cardGameState.reyath.maxHealth
  );
  cardGameState.reyath.movement = 0;
  cardGameState.reyath.state = "dormant";

  window.dispatchEvent(
    new CustomEvent("wrath:reyath-health-change", {
      detail: {
        health: cardGameState.reyath.health,
        maxHealth: cardGameState.reyath.maxHealth,
        damage
      }
    })
  );

  window.dispatchEvent(
    new CustomEvent("wrath:reyath-retreat", {
      detail: {
        reason: "successful-encounter",
        damage
      }
    })
  );

  if (cardGameState.reyath.health <= 0) {
    window.dispatchEvent(
      new CustomEvent("wrath:game-over", {
        detail: {
          outcome: "victory",
          reason: "reyath-defeated",
          message: "The players reduced Reyath's health to zero and survived the expedition."
        }
      })
    );
  }
});

window.addEventListener("wrath:encounter-failure", (event) => {
  const player = cardGameState.players.get(
    Number(event.detail?.playerId)
  );
  const damage = Math.max(0, Number(event.detail?.damage) || 0);

  if (!player || player.defeated) return;

  if (event.detail?.damageType === "hearing") {
    player.health = clamp(
      player.health - damage,
      0,
      player.maxHealth
    );
  } else {
    changeHealth(player, -damage);
  }
  emitGameStateUpdate("encounter-failure");
});

window.addEventListener("wrath:reset-game", () => {
  pendingDraw = null;
  forcedDrawQueue.length = 0;
  previousFocus = null;
  cardLayer.classList.remove("is-open");
  cardLayer.hidden = true;
  drawnCard.classList.remove("is-revealed");
  cardActions.hidden = true;
  cardResolution.textContent = "";
});

window.wrathCardGameState = cardGameState;

storeCardButton.addEventListener("click", storePendingCard);
useCardButton.addEventListener("click", usePendingCard);

