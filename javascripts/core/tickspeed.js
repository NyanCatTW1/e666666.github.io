function canBuyTickSpeed() {
  if (player.currentEternityChall == "eterc9") return false
  return canBuyDimension(3);
}

function getTickSpeedMultiplier() {
  if (!player.challenges.includes("postc3")) return 1;
  if (player.galaxies + player.replicanti.galaxies + player.dilation.freeGalaxies < 3) {
      let baseMultiplier = 0.9;
      if (player.galaxies == 0) baseMultiplier = 0.89
      if (player.currentChallenge == "challenge6" || player.currentChallenge == "postc1") baseMultiplier = 0.93;
      let perGalaxy = 0.02;
      let galaxies = player.galaxies+player.replicanti.galaxies+player.dilation.freeGalaxies
      if (player.timestudy.studies.includes(133)) galaxies += player.replicanti.galaxies/2
      if (player.timestudy.studies.includes(132)) galaxies += player.replicanti.galaxies*0.4
      if (player.timestudy.studies.includes(225)) galaxies += Math.floor(player.replicanti.amount.e / 1000)
      if (player.timestudy.studies.includes(226)) galaxies += Math.floor(player.replicanti.gal / 15)
      galaxies += Math.min(player.replicanti.galaxies, player.replicanti.gal) * Math.max(Math.pow(Math.log10(player.infinityPower.plus(1).log10()+1), 0.03 * ECTimesCompleted("eterc8"))-1, 0)
      if (player.infinityUpgrades.includes("galaxyBoost")) perGalaxy *= 2;
      if (player.infinityUpgrades.includes("postGalaxy")) perGalaxy *= 1.5;
      if (player.challenges.includes("postc5")) perGalaxy *= 1.1;
      if (player.achievements.includes("r86")) perGalaxy *= 1.01;
      if (player.timestudy.studies.includes(212)) perGalaxy *= Math.min(Math.pow(player.timeShards.max(2).log2(), 0.005), 1.1)

      return baseMultiplier-(player.galaxies*perGalaxy);
  } else {
      let baseMultiplier = 0.8
      if (player.currentChallenge == "challenge6" || player.currentChallenge == "postc1") baseMultiplier = 0.83
      let perGalaxy = 0.965
      let galaxies = player.galaxies-2+player.replicanti.galaxies+player.dilation.freeGalaxies
      if (player.timestudy.studies.includes(133)) galaxies += player.replicanti.galaxies/2
      if (player.timestudy.studies.includes(132)) galaxies += player.replicanti.galaxies*0.4
      if (player.timestudy.studies.includes(225)) galaxies += Math.floor(player.replicanti.amount.e / 1000)
      if (player.timestudy.studies.includes(226)) galaxies += Math.floor(player.replicanti.gal / 15)
      galaxies +=  Math.min(player.replicanti.galaxies, player.replicanti.gal) * Math.max(Math.pow(Math.log10(player.infinityPower.plus(1).log10()+1), 0.03 * ECTimesCompleted("eterc8"))-1, 0)
      if (player.infinityUpgrades.includes("galaxyBoost")) galaxies *= 2;
      if (player.infinityUpgrades.includes("postGalaxy")) galaxies *= 1.5;
      if (player.challenges.includes("postc5")) galaxies *= 1.1;
      if (player.achievements.includes("r86")) galaxies *= 1.01
      if (player.timestudy.studies.includes(212)) galaxies *= Math.min(Math.pow(player.timeShards.max(2).log2(), 0.005), 1.1)
      if (player.timestudy.studies.includes(232)) galaxies *= Math.pow(1+player.galaxies/1000, 0.2)

      return baseMultiplier * (Math.pow(perGalaxy, (galaxies-2)))
  }
}

function getPostC3RewardMult () {
  if (player.galacticSacrifice.upgrades.includes(22)) {
    return 1.05+(player.galaxies*0.025);
  } else {
    return 1.05+(player.galaxies*0.005);
  }
}

function buyTickSpeed() {
  if (!canBuyTickSpeed()) {
      return false;
  }

  if (!canAfford(player.tickSpeedCost)) {
      return false;
  }

  player.money = player.money.minus(player.tickSpeedCost);
  if (player.currentChallenge != "challenge5" && player.currentChallenge != "postc5") player.tickSpeedCost = player.tickSpeedCost.times(player.tickspeedMultiplier);
  else multiplySameCosts(player.tickSpeedCost)
  if (player.tickSpeedCost.gte(Number.MAX_VALUE)) player.tickspeedMultiplier = player.tickspeedMultiplier.times(player.tickSpeedMultDecrease);
  if (player.currentChallenge == "challenge2" || player.currentChallenge == "postc1") player.chall2Pow = 0
  player.tickspeed = player.tickspeed.times(getTickSpeedMultiplier());
  player.postC3Reward = player.postC3Reward.times(getPostC3RewardMult())
  postc8Mult = new Decimal(1)
  player.why = player.why + 1
  return true;
}

document.getElementById("tickSpeed").onclick = function () {
  buyTickSpeed();

  updateTickSpeed();
};

function buyMaxTickSpeed() {
  if (!canBuyTickSpeed()) return false
  var mult = getTickSpeedMultiplier()
  if (player.currentChallenge == "challenge2" || player.currentChallenge == "postc1") player.chall2Pow = 0
  if (player.currentChallenge == "challenge5" || player.currentChallenge == "postc5" || player.tickSpeedCost.lt(Number.MAX_VALUE) || player.tickSpeedMultDecrease > 2) {
      while (player.money.gt(player.tickSpeedCost) && (player.tickSpeedCost.lt(Number.MAX_VALUE) || player.tickSpeedMultDecrease > 2 || player.currentChallenge == "postc5")) {
          player.money = player.money.minus(player.tickSpeedCost);
          if (player.currentChallenge != "challenge5" && player.currentChallenge != "postc5") player.tickSpeedCost = player.tickSpeedCost.times(player.tickspeedMultiplier);
          else multiplySameCosts(player.tickSpeedCost)
          if (player.tickSpeedCost.gte(Number.MAX_VALUE)) player.tickspeedMultiplier = player.tickspeedMultiplier.times(player.tickSpeedMultDecrease);
          player.tickspeed = player.tickspeed.times(mult);
          player.postC3Reward = player.postC3Reward.times(getPostC3RewardMult())
          postc8Mult = new Decimal(1)
          if (player.tickSpeedCost.gt(Number.MAX_VALUE)) buyMaxTickSpeed()
      }
  } else {

      var a = Math.log10(Math.sqrt(player.tickSpeedMultDecrease))
      var b = player.tickspeedMultiplier.dividedBy(Math.sqrt(player.tickSpeedMultDecrease)).log10()
      var c = player.tickSpeedCost.dividedBy(player.money).log10()
      var discriminant = Math.pow(b, 2) - (c *a* 4)
      if (discriminant < 0) return false
      var buying = Math.floor((Math.sqrt(Math.pow(b, 2) - (c *a *4))-b)/(2 * a))+1
      if (buying <= 0) return false
      player.tickspeed = player.tickspeed.times(Decimal.pow(mult, buying));
      player.postC3Reward = player.postC3Reward.times(Decimal.pow(getPostC3RewardMult(), buying))
      for (var i = 0; i<buying-1; i++) {
          player.tickSpeedCost = player.tickSpeedCost.times(player.tickspeedMultiplier)
          player.tickspeedMultiplier = player.tickspeedMultiplier.times(player.tickSpeedMultDecrease)
      }
      if (player.money.gte(player.tickSpeedCost)) player.money = player.money.minus(player.tickSpeedCost)
      player.tickSpeedCost = player.tickSpeedCost.times(player.tickspeedMultiplier)
      player.tickspeedMultiplier = player.tickspeedMultiplier.times(player.tickSpeedMultDecrease)
  }

  updateTickSpeed()
}


function updateTickSpeed() {
  var exp = player.tickspeed.e;
  if (exp > 1) document.getElementById("tickSpeedAmount").textContent = 'Tickspeed: ' + player.tickspeed.toFixed(0);
  else {
      document.getElementById("tickSpeedAmount").textContent = 'Tickspeed: ' + player.tickspeed.times(new Decimal(100).dividedBy(Decimal.pow(10, exp))).toFixed(0) + ' / ' + shorten(new Decimal(100).dividedBy(Decimal.pow(10, exp)));
  }
}
