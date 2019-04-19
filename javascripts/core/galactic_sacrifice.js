function getGSAmount() {
  let galaxies = player.galaxies + player.replicanti.galaxies + player.dilation.freeGalaxies;
  let y = 1.5 + Math.max(0, 0.05*(galaxies - 10)) + 0.005 * Math.pow(Math.max(0, galaxies-30) , 2) + 0.0005 * Math.pow(Math.max(0, galaxies-50) , 3);
  if (!player.challenges.includes("postc1")) y = 1.5
  else y *= .08*player.challenges.length
  if (!player.galacticSacrifice.upgrades.includes(52)){
    if (y>100) y = Math.pow(316.22*y,1/3)
    else if (y>10) y = Math.pow(10*y , .5)
  } else if (y >100){
    y = Math.pow(1e4*y , 1/3)
  }
  let z = 1
  if (player.challenges.length >17) {
    z = 0.06*player.challenges.length
    z += galaxies/100
    z *= Math.log(galaxies+3)

  }
  let ret = Decimal.max(Decimal.pow(galaxies, y).times(Decimal.pow(Math.max(0,(player.resets - (player.currentChallenge=="challenge4"?2:4))),z)), 0);
  ret = ret.times(1 + player.eightAmount/50)
  if (player.galacticSacrifice.upgrades.includes(32)) {
    ret = ret.times(galUpgrade32());
  }
  if (player.infinityUpgrades.includes("galPointMult")) {
    ret = ret.times(getPost01Mult())
  }
  if (player.achievements.includes('r37')) {
    ret = ret.times(thatsFastReward());
  }
  if (player.achievements.includes("r62")) ret = ret.times(Math.max(1, player.infinityPoints.log10()))
  return ret.floor().min(“1e20000”);
}

function totalEc(){
  let x=0
  for(i=0; i<=12;i++){
    x += ECTimesCompleted("eterc"+i)
    
  }
  return x
}



function thatsFastReward () {
  if (player.bestInfinityTime >= 18000) {
    return Math.max(180000 / player.bestInfinityTime, 1);
  } else {
    return 10 * (1 + Math.pow(Math.log10(18000 / player.bestInfinityTime), 2));
  }
}

function getPost01Mult() {
  return Math.min(Math.pow(player.infinitied + 1, .3), Math.pow(Math.log(player.infinitied + 3), 3))
}

function decreaseDimCosts () {
  if (player.galacticSacrifice.upgrades.includes(11)) {
    let upg = galUpgrade11();
    TIER_NAMES.forEach(function(name) {
        if (name !== null) player[name+"Cost"] = player[name+"Cost"].div(upg)
    });
    if (player.achievements.includes('r48')) player.tickSpeedCost = player.tickSpeedCost.div(upg)
  } else if (player.achievements.includes('r21') && !player.galacticSacrifice.upgrades.includes(11)) {
    TIER_NAMES.forEach(function(name)  {
        if (name !== null) player[name+"Cost"] = player[name+"Cost"].div(10)
    });
    if (player.achievements.includes('r48')) player.tickSpeedCost = player.tickSpeedCost.div(10)
  }
}

let galUpgrade11 = function () {
  let x = player.infinitied;
  let y;
  let z = 10
  if (player.challenges.length > 14) z -= (player.challenges.length-8)/4
  if (player.challenges.length >20) z += 0.085*player.challenges.length-1.5
  if (player.challenges.length >14 && player.eternities >0 && player.infinitied < 1e8){
    x += 2e6
  }
  
  if (player.infinityUpgrades.includes("postinfi61")){
    x += 1e7
    z -= .1
    if (player.galacticSacrifice.upgrades.length>9) x += player.galacticSacrifice.upgrades.length*1e7
  }
  
  if (totalEc()>0){
    x += 1e10* totalEc()
    z -= Math.pow(totalEc(),0.3)/10
  }
  
  if (x>1e8) x= Math.pow(1e8*x,.5)
  if (player.eternities > 0) z -= 0.5
  if (z<6) z = Math.pow(1296*z,.2)
  
  
  if (x <= 0) {
    y = 2;
  } else if (x < 5) {
    y = x + 2;
  } else if (x < 100) {
    y = Math.pow(x + 5, .5) + 4;
  } else {
    y = Math.pow(Math.log(x), Math.log(x) / z) + 14;
  }
  if (y>1000) y = Math.pow(1000*y,.5)
  if (y>1e4)  y = Math.pow(1e8*y,1/3)
  return Decimal.pow(10, y);
}

let galUpgrade12 = function () {
  return 2 * Math.pow(1 + Math.max(0,(Date.now() - player.galacticSacrifice.last)) / 60000, 0.5);
}

let galUpgrade13 = function () {
  let base = player.galacticSacrifice.galaxyPoints.div(5).plus(1).pow(3);
  let exp = 1;
  if (player.infinityUpgrades.includes("postinfi62")) {
    if (player.currentEternityChall === "") {
      exp = Math.pow(Math.log(player.resets+3),2);
    } else {
      exp = Math.pow(Math.log(player.resets+3),0.5);
    }
  }
  return base.pow(exp);
}

let galUpgrade23 = function () {
  return Math.max(2 + player.galacticSacrifice.galaxyPoints.log(10)*1.5, 2);
}

let galUpgrade31 = function () {
  return 1.1 + .02 * player.extraDimPowerIncrease;
}

let galUpgrade32 = function () {
  let x = (player.totalmoney || player.money);
  if (!player.break && player.eternities === 0) {
    x = x.min(Number.MAX_VALUE);
  }
  return x.pow(0.003).add(1);
}

let galUpgrade33 = function () {
  return Math.max(2 + player.galacticSacrifice.galaxyPoints.log(10)*0.5, 2)
}

let galUpgrade43 = function () {
  return new Decimal(player.galacticSacrifice.galaxyPoints.log10()).pow(50)
}

let galUpgrade51 = function () {
  let x = player.galacticSacrifice.galaxyPoints.pow(.001)
  if (x.log10()>20) return Decimal.pow(10,Math.pow(20*x.log10(),.5))
  return x
}

function galacticSacrifice() {
    let gsAmount = getGSAmount();
    if (gsAmount.lt(1)) return false
    player.galaxies = -1
    player.galacticSacrifice.galaxyPoints = player.galacticSacrifice.galaxyPoints.plus(gsAmount);
    player.galacticSacrifice.times++;
    player.galacticSacrifice.last = Date.now();
    galaxyReset()
}

function GSUnlocked() {
    return player.galacticSacrifice && player.galacticSacrifice.times > 0;
}

function galacticUpgradeSpanDisplay () {
  document.getElementById('galspan11').innerHTML = shortenDimensions(galUpgrade11());
  document.getElementById('galspan12').innerHTML = galUpgrade12().toFixed(2);
  document.getElementById('galspan13').innerHTML = formatValue(player.options.notation, galUpgrade13(), 2, 2);
  document.getElementById('galspan23').innerHTML = (galUpgrade23()/2).toFixed(2);
  document.getElementById('galspan31').innerHTML = galUpgrade31().toFixed(2);
  document.getElementById('galspan32').innerHTML = formatValue(player.options.notation, galUpgrade32(), 2, 2);
  document.getElementById('galspan33').innerHTML = (galUpgrade33()/2).toFixed(2);
  document.getElementById("galcost33").innerHTML = shortenCosts(1e3);
  document.getElementById("galspan43").innerHTML = formatValue(player.options.notation, galUpgrade43(), 2,2);
  document.getElementById("galspan51").innerHTML = formatValue(player.options.notation, galUpgrade51(), 2,2);
  document.getElementById("galcost41").innerHTML = shortenCosts(new Decimal("1e1650"));
  document.getElementById("galcost42").innerHTML = shortenCosts(new Decimal("1e2300"));
  document.getElementById("galcost43").innerHTML = shortenCosts(new Decimal("1e3700"));
  document.getElementById("galcost51").innerHTML = shortenCosts(new Decimal("1e5500"));
  document.getElementById("galcost52").innerHTML = shortenCosts(new Decimal("1e8000"));
  document.getElementById("galcost53").innerHTML = shortenCosts(new Decimal("1e25000"));

}

function newGalacticDataOnInfinity () {
  if (player.achievements.includes('r36')) {
    return {
      galaxyPoints: player.galacticSacrifice.galaxyPoints.plus(getGSAmount()),
      last: Date.now(),
      times: player.galacticSacrifice.times,
      upgrades: player.galacticSacrifice.upgrades
    }
  } else {
    return {
      galaxyPoints: new Decimal(0),
      last: Date.now(),
      times: 0,
      upgrades: []
    }
  }
}

let galUpgradeCosts = {
  11: 1,
  12: 3,
  13: 20,
  21: 1,
  22: 5,
  23: 100,
  31: 2,
  32: 8,
  33: 1000,
  41: new Decimal('1e1650'),
  42: new Decimal("1e2300"),
  43: new Decimal("1e3700"),
  51: new Decimal("1e5500"),
  52: new Decimal("1e8000"),
  53: new Decimal("1e25000")
}

function canBuyGalUpgrade(num) {
    return !player.galacticSacrifice.upgrades.includes(num) &&
    player.galacticSacrifice.galaxyPoints.gte(galUpgradeCosts[num]) &&
    (Math.floor(num / 10) === 1 || player.galacticSacrifice.upgrades.includes(num - 10));
}

function galacticUpgradeButtonTypeDisplay () {
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 3; j++) {
      let e = document.getElementById('galaxy' + i + j);
      let num = +(i + '' + j);
      if (player.galacticSacrifice.upgrades.includes(num)) {
        e.className = 'infinistorebtnbought'
      } else if (canBuyGalUpgrade(num)) {
        e.className = 'infinistorebtn' + j;
      } else {
        e.className = 'infinistorebtnlocked'
      }
    }
  }
}

function buyGalaxyUpgrade (i) {
  if (!canBuyGalUpgrade(i)) {
    return false;
  } else {
    player.galacticSacrifice.upgrades.push(i);
    player.galacticSacrifice.galaxyPoints = player.galacticSacrifice.galaxyPoints.minus(galUpgradeCosts[i]);
    if (i == 11) {
      TIER_NAMES.forEach(function(name) {
          if (name !== null) player[name+"Cost"] = player[name+"Cost"].div(100)
      })
    }
    if (i == 41) {
      for (n=1;n<9;n++) {
        var dim = player["infinityDimension"+n]
        dim.power = Decimal.pow(getInfBuy10Mult(n), dim.baseAmount/10)
      }
    }
    return true;
  }
}
