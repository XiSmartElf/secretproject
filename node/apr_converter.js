'use strict'

var unified_rate = function(initial_reward, base){
    var time_indays = 0;
    var reward = initial_reward;
    var base = base;

    this.addyears = (len, extra_reward)=>{
        time_indays+=len*365;
        if(extra_reward) reward += extra_reward/365/len;
        return this;
    }

    this.addmonths = (len, extra_reward)=>{
        time_indays+=len*30.5;
        if(extra_reward) reward += extra_reward/30.5/len;
        return this;
    }

    this.addweeks = (len, extra_reward)=>{
        time_indays+=len*7;
        if(extra_reward) reward += extra_reward/len/7;
        return this;
    }

    this.adddays = (len, extra_reward)=>{
        time_indays+=len;
        if(extra_reward) reward += extra_reward/len;
        return this;
    }

    this.getAPR = ()=>{
        return reward/time_indays*365/base;
    }
}

var val = (new unified_rate(200, 1500)).addmonths(3).addweeks(0).getAPR();
console.log(val);