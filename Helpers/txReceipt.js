
const Xdc3 = require("xdc3");

const xdc3 = new Xdc3(
  new Xdc3.providers.HttpProvider("https://rpc.apothem.network")
);
async function txReceipt(txHash) {
  const tx = await xdc3.eth.getTransaction(txHash, (error, txResult) => {
    console.log(txResult);
  });
}

txReceipt("0x153aa12a57a48f52e2c4545dbf4f9422164097ceaa46897f7290d9393d4cbfe2")


