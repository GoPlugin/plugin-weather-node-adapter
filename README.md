# Xinfin Network + Plugin:  API Data pull from Customized Acurite Weather Unit

Demonstrating how to connect Xinfin Network and Plugin together, and thus bringing the world of oracles to Xinfin Network.

There are two main implications:

The connection of Plugin to Xinfin Network allows for the growth of all types of oracles on Xinfin Network to power exchanges, other oracle needs, and bridge Web2 technology with Web3.

Automating the process by including the CRON so that it updates the price value periodically

## Setup Steps

Follow plugin-deployment script to setup Plugin Node

Please see 
[plugin-deployment](https://github.com/GoPlugin/plugin-deployment)

### Steps to be done If you want to try this locally
1) Setup & Run Plugin Node in local system
2) Download and Setup Customized External Initiator in local system using this link(External Initiator)
3) Deploy Contracts in Apothem Network
- 3a) Deploy PliToken.sol in "Apothem" network
- 3b) Deploy Oracle.sol in "Apothem" network by overriding the PLI contract address
4) Run SetfulfillmentPermission of your plugin node address in Oracle 
5) Deploy WeatherConsumer.sol in "Apothem" network
6) Fund your "WeatherConsumer" contract address with PLI token
7) Go to Plugin GUI 
- 7a) Create a bridge to connect external adapter
- 7b) Create a job spec with Oracle address - It will result JOB ID
8) Fund your plugin node address(regular) with enough XDC & PLI token
9) Execute weather_adapter and keep listening for events 
10) Trigger requestweather function from remix to register the request

Before configuring the Plugin components, there needs to be an oracle contract on the Xinfin Network that emits events. This is needed for the EI(External Initiator) to trigger job runs on the Plugin node.

### 1) Setup & Run Plugin Node in local system

[plugin-deployment](https://github.com/GoPlugin/plugin-deployment)

### 2) Download and Setup Customized External Initiator in local system using this link(External Initiator)

External initiators observe a blockchain node endpoint and will trigger runs on the Plugin node.  
_Note: Prerequisite for Go to be installed. See [here](https://golang.org/doc/install) for instructions._

Clone and build the [external initiator repository](https://github.com/GoPlugin/external-initiator) 

```
git clone https://github.com/GoPlugin/external-initiator
cd external-initiator
go install
```

Create a `.env` file in the `external-initiator` folder with the following contents:

```
EI_DATABASEURL=postgresql://$USERNAME:$PASSWORD@$SERVER:$PORT/$DATABASE
EI_CHAINLINKURL=http://localhost:6688
EI_IC_ACCESSKEY=<INSERT KEY>
EI_IC_SECRET=<INSERT KEY>
EI_CI_ACCESSKEY=<INSERT KEY>
EI_CI_SECRET=<INSERT KEY>
```

_Note: the database URL should be separate from the Plugin node database_

The 4 keys in the `external-initiator/.env` file are generated by the Plugin node with the following process. 

1. Once you run "plugin node start" and your plugin is in running mode, then open a new terminal and type `plugin admin login` and the username/password from when the container is created.
2. To create the keys, `plugin initiators create <NAME> <URL>`. Note that in this case the name is xdc and the url is http://localhost:8080/jobs to access the locally run external-initiator (otherwise, they are on two different networks). The 4 keys are generated in the same order as listed above.

The external initiator can be started up using:

```
./external-initiator "{\"name\":\"xinfin-testnet\",\"type\":\"xinfin\",\"url\":\"https://rpc.apothem.network\"}" --chainlinkurl "http://localhost:6688/"
```

### 3) Deploy Contracts in Apothem Network

#### 3a) Deploy PliToken.sol in "Apothem" network

do download this repo and do the following

copy PliToken.sol from contracts folder and do the deployment using remix IDE - https://remix.xinfin.network/

Make sure, you have "Injected web3" and XdcPay wallet is connected. Once deployed, copy the contract address - > this is going to be the key address for all the steps. This address has to be overriden in .env before you run Plugin node using -> PLI_CONTRACT_ADDRESS paramater

#### 3b) Deploy Oracle.sol in "Apothem" network by overriding the PLI contract address

copy Oracle.sol from contracts folder and do the deployment using remix IDE - https://remix.xinfin.network/

Make sure, you have "Injected web3" and xinpay wallet is connected. Deploy Oracle by overriding PLI Token address which you got from step 3a) -- Once deployed, copy the contract address - > this is going to be the oracle address which will be overriden while you deploy Vinter contract - so keep it safe

### 4) Run SetfulfillmentPermission of your plugin node address in Oracle 

Copy the "Account_address" from Plugin GUi under Key sections, you will find "regular" account. This address basically talks to Oracle contract. go to Remix and run setFulfilmentPermission with account address & boolean value to true

### 5) Deploy WeatherConsumer.sol in "Apothem" network

copy WeatherConsumer.sol from contracts folder and do the deployment using remix IDE - https://remix.xinfin.network/

Make sure, you have "Injected web3" and XdcPay wallet is connected. Deploy Contract by overriding PLI Token address which you got from step 3a) -- Once deployed, copy the contract address - > this is going to be the client contract address 

### 6) Fund your "WeatherConsumer" contract address with PLI token

Make sure you fund your contract address with enough PLI token - This is key step, without which you will not be able to trigger requestweather function - it will throw Json-RPC error. So keep this in mind and dont skip it.

### 7) Create Bridge & Job Spec in Plugin GUI

#### 7a) Create a bridge to register the "External adapter"

- Login Plugin UI using the email ID & Password which you have setup during Plugin node setup
- Go to Bridge section
  - Give a name(user defined) for ex - weather
  - Give a URL and it should be http://localhost:5000

once done, save this and you should be good.

#### 7b) Create a Job ID using following job spec

- Login Plugin UI using the email ID & Password which you have setup during Plugin node setup
- Go to Job section
  - Click "New Job" and copy paste the following job spec

```
{
  "initiators": [
    {
      "type": "external",
      "params": {
        "name": "xdcnew",
        "body": {
          "endpoint": "xinfin-testnet",
          "addresses": ["0xac01be7848651fbc7a9f3e8b72f9d47a0f4ceb47"]
        }
      }
    }
  ],
  "tasks": [
    {
      "type": "weather"
    },
    {
      "type": "copy",
        "params": {
        "copyPath": [
          "result"
        ]
      }
    },
    {
      "type": "multiply"
    },
    {
      "type": "ethuint256"
    },
    {
       "type": "EthTx"
    }
  ]
}

```

The initiators set the contract address that triggers the Plugin node to initiate a specific job, while tasks defines the work pipeline for this job. Note that the parameter “address: 0xac01be7848651fbc7a9f3e8b72f9d47a0f4ceb47" indicates that the node will only listen to that address for the job ID, which should be updated with the deployed Oracle contract address properly.

For example, the “tasks” define that the Plugin node will first retrieve data from the external adapter "weather" (i.e., the Bridge will interact with the URL endpoint of external adapter to access the data in JSON format), copy the data field, multiply it by 100, and convert it into uint256 type.
The new Job can be found in the Tab of “Jobs” as below. 

once done, save this and you should be get a job ID in this format  --> 8cbc3e6ceed04d5b9a7591374325b640

#### 7c) Copy this JOB_ID and feed this in client contract 

This job id should be overriden in requestweather function in remix and trigger

### 8) Fund your Plugin node address(regular) with enough XDC & PLI token

Fund your Plugin node address (Regular) with enough XDC & PLI token. Once you transfer enough token and XDC, you will be able to see the balances in Plugin GUI under Key Sections.

### 9) Execute VinterAPI_Adapter and keep listening for events 

External adapters are provided in the [weather_adapter](./weather_adapter) folder. They are simple servers built using Express that receives a post API call from the Plugin node and sends the information to the smart contract on Xinfin Network.

```
cd weather_adapter
yarn
yarn start
```

Don't forget to install packages with `yarn` and then start the servers with `yarn start`. The external servers will start on `http://localhost:5000`

| Bridge Name    | Endpoint                     | Functionality                          |
| -------------- | ---------------------------- | -------------------------------------- |
| `weather`    | http://localhost:5000          | Sending transaction to Xinfin Network  |


Once the above steps are successful, you will be able to see the job is triggered in Plugin UI and task is succesfully writing weather on blockchain.
