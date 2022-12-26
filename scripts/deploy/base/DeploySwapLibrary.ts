import {Deploy} from "../Deploy";
import {ethers} from "hardhat";
import {Verify} from "../../Verify";
import {Misc} from "../../Misc";

const ROUTER = ''

async function main() {
  const signer = (await ethers.getSigners())[0];
  const contract = await Deploy.deployContract(signer, 'SwapLibrary', ROUTER);

  await Misc.wait(5);
  await Verify.verifyWithArgs(contract.address, [ROUTER]);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
