import fetch from "node-fetch"
import fs from 'fs'
import inquirer from 'inquirer'
import {URL, URLSearchParams} from 'url'
// See https://app.swaggerhub.com/apis/portainer/portainer-ce/2.9.3#/stacks/StackCreate
console.log(import.meta.url)
const config = {
  SERVER_URL: 'http://farnsworth:9000',
  USER: "admin",

  MAGIC_MIRROR:{
    STACK_NAME: "magicmirror",
    IMAGE_NAME: "bastilimbach/docker-magicmirror",
    COMPOSE_FILE_PATH: new URL('../magic-mirror-core/docker-compose.yml', import.meta.url)
  },
  BRACCOUNTING:{
    STACK_NAME: "braccounting",
    IMAGE_NAME: "localhost:5000/magic-kingdom-accounting:latest",
    COMPOSE_FILE_PATH: new URL('../braccounting/docker-compose.yml', import.meta.url)
  }

}


let authToken
async function ask(question, type = "password") {
  const res = await inquirer.prompt([{
    type:type,
    name:"password",
    message:question
  }])
  return res.password

}
async function streamToString(readStream) {
  return new Promise((resolve) => {
    const chunks = [];

    readStream.on("data", function (chunk) {
      chunks.push(chunk);
    });

    // Send the buffer or you can put it into a var
    readStream.on("end", function () {
      resolve(Buffer.concat(chunks).toString());
    });
  })

}

async function getAuthToken() {
  if (!authToken) {
    const password = await ask("Portainer Password")
    const response = await fetch(`${config.SERVER_URL}/api/auth`, {
      method: 'POST',
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({Username: config.USER, Password: password})
    });
    authToken = (await response.json()).jwt;
  }
  return authToken;
}

async function authGet(path) {
  const response = await fetch(`${config.SERVER_URL}${path}`, {
    headers: {
      "Authorization": `Bearer ${await getAuthToken()}`,
      "accept": "application/json"
    },
  })
  return response.json()
}

async function authRequest(path, method, qs, data) {

  const response = await fetch(`${config.SERVER_URL}${path}?${new URLSearchParams(qs).toString()}`, {
    method: method,
    headers: {
      "Authorization": `Bearer ${await getAuthToken()}`,
      "accept": "application/json"
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    console.error("NOT OK", response.status, response.statusText, await streamToString(response.body))
    throw new Error(`NOT OK ${response.status} ${response.statusText} ${await streamToString(response.body)}`)
  }
  return response
}

async function createStack(name, dockerComposeFilename, env = []) {
  return await authRequest("/api/stacks", "POST", {
    type: "2", // compose type
    method: "string",
    endpointId: "1",// local endpoints,query /api/endpoints for more information
  }, {
    Env: env,
    Name: name,
    StackFileContent: fs.readFileSync(dockerComposeFilename, {encoding: "UTF-8"})
  })
}

async function updateStack(id, dockerComposeFilename, env =[]) {
  return await authRequest(`/api/stacks/${id}`, "PUT", {
    endpointId: "1", // local endpoints,query /api/endpoints for more information
  }, {
    Env: env,
    StackFileContent: fs.readFileSync(dockerComposeFilename, {encoding: "UTF-8"})
  })

}
async function pullImage(imageName){
  await authRequest("/api/endpoints/1/docker/images/create", "POST",{

    fromImage:imageName
  },{
    fromImage:imageName
  })
}
async function getStacks() {
  return await authGet(`/api/stacks`);
}

async function createOrUpdate(stacks, stackConfig) {
  let existingStack = stacks.find(stack => stack.Name === stackConfig.STACK_NAME);
  if (existingStack) {
    await pullImage(stackConfig.IMAGE_NAME)
    console.log(`Update stack ${existingStack.Name}`)
    await updateStack(existingStack.Id, stackConfig.COMPOSE_FILE_PATH)
  } else {
    console.log(`Create stack ${stackConfig.STACK_NAME}`)
    await createStack(stackConfig.STACK_NAME, stackConfig.COMPOSE_FILE_PATH)
  }
}

async function doIt() {
  const stacks = await getStacks()
  const res = await inquirer.prompt([{
    type:"checkbox",
    choices:[
      {name: config.BRACCOUNTING.STACK_NAME, value: config.BRACCOUNTING},
      {name: config.MAGIC_MIRROR.STACK_NAME, value: config.MAGIC_MIRROR}
    ],
    name:"stacksToUpdate",
    message:"Which stacks should be updated?"
  }])

  await Promise.all(res.stacksToUpdate.map((stackConfig)=>createOrUpdate(stacks, stackConfig)))
}

(async function () {
  try {
    await doIt()
  } catch (e) {
    console.error(e.message, e)
  }
})()
