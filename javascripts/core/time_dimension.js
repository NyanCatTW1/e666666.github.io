//time dimensions

function getTimeDimensionPower(tier) {
  if (player.currentEternityChall == "eterc11") return new Decimal(1)
  var dim = player["timeDimension"+tier]
  var ret = dim.power.pow(2)

  if (player.timestudy.studies.includes(11) && tier == 1) ret = ret.dividedBy(player.tickspeed.dividedBy(1000).pow(0.005).times(0.95).plus(player.tickspeed.dividedBy(1000).pow(0.0003).times(0.05)).max(Decimal.fromMantissaExponent(1, -2500)))
  if (player.achievements.includes("r105")) ret = ret.div(player.tickspeed.div(1000).pow(0.000005))

  ret = ret.times(kongAllDimMult)

  if (player.eternityUpgrades.includes(4)) ret = ret.times(player.achPow)
  if (player.eternityUpgrades.includes(5)) ret = ret.times(Math.max(player.timestudy.theorem, 1))
  if (player.eternityUpgrades.includes(6)) ret = ret.times(player.totalTimePlayed / 10 / 60 / 60 / 24)
  if (player.timestudy.studies.includes(73) && tier == 3) ret = ret.times(calcTotalSacrificeBoost().pow(0.005).min(new Decimal("1e1300")))
  if (player.timestudy.studies.includes(93)) ret = ret.times(Decimal.pow(player.totalTickGained, 0.5).max(1))
  if (player.timestudy.studies.includes(103)) ret = ret.times(Math.max(player.replicanti.galaxies, 1))
  if (player.timestudy.studies.includes(151)) ret = ret.times(1e4)
  if (player.timestudy.studies.includes(221)) ret = ret.times(Decimal.pow(1.01, player.resets))
  if (player.timestudy.studies.includes(227) && tier == 4) ret = ret.times(Math.max(Math.pow(calcTotalSacrificeBoost().log10(), 100), 1))
  if (player.currentEternityChall == "eterc9") ret = ret.times((Decimal.pow(Math.max(player.infinityPower.log2(), 1), 4)).max(1))
  let ec10bonus = new Decimal(1)
  if (ECTimesCompleted("eterc10") !== 0) ec10bonus = new Decimal(Math.max(Math.pow(getInfinitied(), 2) * ECTimesCompleted("eterc10") * 0.02+1, 1))
  if (player.timestudy.studies.includes(31)) ec10bonus = ec10bonus.pow(4)
  ret = ret.times(ec10bonus)
  if (player.achievements.includes("r128")) ret = ret.times(Math.max(player.timestudy.studies.length, 1))
  if (player.galacticSacrifice.upgrades.includes(43)) ret = ret.times(galUpgrade43())
  if (player.replicanti.unl && player.replicanti.amount.gt(1) && player.dilation.upgrades.includes(5)) {
    var replmult = Decimal.pow(Decimal.log2(player.replicanti.amount), 2)

    if (player.timestudy.studies.includes(21)) replmult = replmult.plus(Decimal.pow(player.replicanti.amount, 0.032))
    if (player.timestudy.studies.includes(102)) replmult = replmult.times(Decimal.pow(5, player.replicanti.galaxies))

    ret = ret.times(replmult.pow(0.1))
  }

  if (ret.lt(0)) {
    ret = new Decimal(0)
  }

//if (player.dilation.active) {
    ret = Decimal.pow(10, Math.pow(ret.log10(), 0.75))
    if (player.dilation.upgrades.includes(9)) {
      ret = Decimal.pow(10, Math.pow(ret.log10(), 1.05))
    }
  
//}
  if (ECTimesCompleted("eterc1") !== 0) ret = ret.times(Math.pow(Math.max(player.thisEternity*10, 0.9), 1.2+(ECTimesCompleted("eterc1")*0.2)))
  

  return ret

}


function getTimeDimensionProduction(tier) {
  if (player.currentEternityChall == "eterc10") return new Decimal(0)
  var dim = player["timeDimension"+tier]
  if (player.currentEternityChall == "eterc11") return dim.amount
  var ret = dim.amount
  ret = ret.times(getTimeDimensionPower(tier))
  if (player.currentEternityChall == "eterc7") {
    ret = ret.dividedBy(player.tickspeed.dividedBy(1000))
    ret = Decimal.pow(10, Math.pow(ret.log10(), 0.75))
    if (player.dilation.upgrades.includes(9)) {
      ret = Decimal.pow(10, Math.pow(ret.log10(), 1.05))
    }
  }
  if (player.currentEternityChall == "eterc1") return new Decimal(0)
  return ret
}


function getTimeDimensionRateOfChange(tier) {
  let toGain = getTimeDimensionProduction(tier+1)
  var current = Decimal.max(player["timeDimension"+tier].amount, 1);
  var change  = toGain.times(10).dividedBy(current);
  return change;
}

function getTimeDimensionDescription(tier) {
  var name = TIER_NAMES[tier];

  let description = shortenDimensions(player['timeDimension'+tier].amount);

  if (tier < 8) {
      description += '  (+' + formatValue(player.options.notation, getTimeDimensionRateOfChange(tier), 2, 2) + '%/s)';
  }

  return description;
}

function updateTimeDimensions() {
  if (document.getElementById("timedimensions").style.display == "block" && document.getElementById("dimensions").style.display == "block") {
    for (let tier = 1; tier <= 4; ++tier) {
      document.getElementById("timeD"+tier).textContent = DISPLAY_NAMES[tier] + " Time Dimension x" + shortenMoney(getTimeDimensionPower(tier));
      document.getElementById("timeAmount"+tier).textContent = getTimeDimensionDescription(tier);
    }
    if (player.dilation.studies.includes(2)) {
      for (let tier = 5; tier <= 8; ++tier) {
        if (player.dilation.studies.includes(tier-3)) {
          document.getElementById("timeD"+tier).textContent = DISPLAY_NAMES[tier] + " Time Dimension x" + shortenMoney(getTimeDimensionPower(tier));
          document.getElementById("timeAmount"+tier).textContent = getTimeDimensionDescription(tier);
        }
      }
    }
    for (let tier = 1; tier <= 8; ++tier) {
      if (player.dilation.studies.includes(tier-3) || tier < 5) {
        document.getElementById("timeRow"+tier).style.display = "table-row"
      } else {
        document.getElementById("timeRow"+tier).style.display = "none"
      }
    }
  }
}

var timeDimCostMults = [null, 3, 9, 27, 81, 243, 729, 2187, 6561]
var timeDimStartCosts = [null, 1, 5, 100, 1000, "1e2350", "1e2650", "1e3000", "1e3350"]
function buyTimeDimension(tier) {

  var dim = player["timeDimension"+tier]
  if (tier > 4 && !player.dilation.studies.includes(tier-3)) return false
  if (player.eternityPoints.lt(dim.cost)) return false

  player.eternityPoints = player.eternityPoints.minus(dim.cost)
  dim.amount = dim.amount.plus(1);
  dim.bought += 1
  dim.cost = Decimal.pow(timeDimCostMults[tier], dim.bought).times(timeDimStartCosts[tier])
  if (dim.cost.gte(Number.MAX_VALUE)) {
      dim.cost = Decimal.pow(timeDimCostMults[tier]*1.5, dim.bought).times(timeDimStartCosts[tier])
  }
  if (dim.cost.gte("1e1300")) {
      dim.cost = Decimal.pow(timeDimCostMults[tier]*2.2, dim.bought).times(timeDimStartCosts[tier])
  }
  if (tier > 4) {
    dim.cost = Decimal.pow(timeDimCostMults[tier]*100, dim.bought).times(timeDimStartCosts[tier])
  }
  dim.power = dim.power.times(2)
  updateEternityUpgrades()
  return true
}

function resetTimeDimensions() {
  for (var i=1; i<9; i++) {
      var dim = player["timeDimension"+i]
      dim.amount = new Decimal(dim.bought)
  }

}

function buyMaxTimeDimensions() {
  for(var i=1; i<9; i++) while(buyTimeDimension(i)) continue
}
