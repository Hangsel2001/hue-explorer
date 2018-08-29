#!/usr/bin/env node
const huejay = require('huejay');
const program = require('commander');
const config = require('config');
let client = new huejay.Client({
  host:     config.bridge.host,        
  username: config.bridge.username        
}); 
program
    .option('--bridges', 'List bridge devices')
    .option('-, --groups [value]', 'List rooms')
    .option('--scenes', 'List scenes')
    .option('-v, --verbose', 'Show verbose info')
    .option('-s, --set-scene [value]', 'Activate a scene by id');


program
  .command('group [value]')
  .option('-o, --turn-on', 'turn on group')
  .option('-x, --off', 'Turn off group')
  .option('-b, --brightness [brightness]')
  .option('-c, --color-temp [colorTemp]')
  .action((value, cmd) => {    
    if (value) {
    client.groups.getById(value).then(group => {
      // console.log(group);
      // console.log(cmd);
      if (cmd.brightness) {
        group.brightness = parseInt(cmd.brightness);
      }
      if (cmd.colorTemp) {
        group.colorTemp = parseInt(cmd.colorTemp);
      }
      if (cmd.off) {
        group.on = false;
        console.log("off");
      }
      if (cmd.turnOn) {
        group.on = true;
        console.log("on");
      }
      if (!(cmd.brightness || cmd.colorTemp || cmd.off || cmd.turnOn)) {
        logGroup(group);
      }

      return client.groups.save(group);
    });
  } else {
    client.groups.getAll()
    .then(groups => {
      for (let group of groups) {
        logGroup(group);
      }
      });    
  };
});


program.parse(process.argv);

if (program.verbose) {
  console.log(program);
}



if (program.bridges) {
    huejay.discover()
    .then(bridges => {
      for (let bridge of bridges) {
        console.log(`Id: ${bridge.id}, IP: ${bridge.ip}`);
      }
    })
    .catch(error => {
      console.log(`An error occurred: ${error.message}`);
    });
}




if (program.rooms === true) { // List all rooms
      client.groups.getAll()
  .then(groups => {
    for (let group of groups) {
      console.log(`Group [${group.id}]: ${group.name}`);
      console.log(`  Type: ${group.type}`);
      console.log(`  Class: ${group.class}`);
      console.log('  Light Ids: ' + group.lightIds.join(', '));
      if (program.verbose) {
        console.log('  State:');
        console.log(`    Any on:     ${group.anyOn}`);
        console.log(`    All on:     ${group.allOn}`);
        console.log('  Action:');
        console.log(`    On:         ${group.on}`);
        console.log(`    Brightness: ${group.brightness}`);
        console.log(`    Color mode: ${group.colorMode}`);
        console.log(`    Hue:        ${group.hue}`);
        console.log(`    Saturation: ${group.saturation}`);
    //   console.log(`    X/Y:        ${group.xy[0]}, ${group.xy[1]}`);
        console.log(`    Color Temp: ${group.colorTemp}`);
        console.log(`    Alert:      ${group.alert}`);
        console.log(`    Effect:     ${group.effect}`);
    
        if (group.modelId !== undefined) {
            console.log(`  Model Id: ${group.modelId}`);
            console.log(`  Unique Id: ${group.uniqueId}`);
            console.log('  Model:');
            console.log(`    Id:           ${group.model.id}`);
            console.log(`    Manufacturer: ${group.model.manufacturer}`);
            console.log(`    Name:         ${group.model.name}`);
            console.log(`    Type:         ${group.model.type}`);
        }
    
        console.log();
        }
    }
  });
} else if (program.groups) {
    client.groups.getById(program.groups).then(group => {
        console.log(`Group [${group.id}]: ${group.name}`);
        const allLights = group.lightIds.join(', ');
        console.log('  Light Ids: ' + allLights);
        client.scenes.getAll().then(scenes => {
            var roomScenes = scenes.filter((item)=> item.lightIds.join(', ') === allLights);           
            for (let scene of roomScenes) {                
                console.log(`    Scene [${scene.id}]: ${scene.name}`);
            }
        })
    })
}

if (program.scenes) {
    client.scenes.getAll()
  .then(scenes => {
    for (let scene of scenes) {
      console.log(`Scene [${scene.id}]: ${scene.name}`);
      console.log('  Lights:', scene.lightIds.join(', '));
      console.log();
    }
  });
}

if (program.setScene) {
    client.scenes.recall(program.setScene)
  .then(() => {
    console.log('Scene was recalled');
  })
  .catch(error => {
    console.log(error.stack);
  });
}
function logGroup(group) {
  console.log(`Group [${group.id}]: ${group.name}`);
  const allLights = group.lightIds.join(', ');
  console.log('  Light Ids: ' + allLights);
  console.log('  Brightness: ' + group.brightness);
  console.log('  ColorTemp: ' + group.colorTemp);
}

