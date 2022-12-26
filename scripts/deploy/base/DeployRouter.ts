import {Deploy} from "../Deploy";
import {ethers} from "hardhat";
import {Verify} from "../../Verify";
import {Misc} from "../../Misc";
import {ArbitrumAddresses} from '../../addresses/ArbitrumAddresses';

async function main() {
  const signer = (await ethers.getSigners())[0];

  const FACTORY = '';

  const router = await Deploy.deployLizardRouter01(signer, FACTORY, ArbitrumAddresses.WETH_TOKEN);

  await Misc.wait(5);
  await Verify.verifyWithArgs(router.address, [FACTORY, ArbitrumAddresses.WETH_TOKEN]);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
