import {Deploy} from "../Deploy";
import hre, {ethers} from "hardhat";
import {Verify} from "../../Verify";
import {Misc} from "../../Misc";
import {writeFileSync} from "fs";
import {formatUnits, parseUnits} from "ethers/lib/utils";
import {ArbitrumAddresses} from '../../addresses/ArbitrumAddresses';
import {LizardMinter__factory, LizardVoter__factory, IERC20__factory} from "../../../typechain";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {TimeUtils} from "../../../test/TimeUtils";


const voterTokens = [
  ArbitrumAddresses.WETH_TOKEN,
  ArbitrumAddresses.USDC_TOKEN,
  ArbitrumAddresses.FRAX_TOKEN,
  ArbitrumAddresses.DAI_TOKEN,
  ArbitrumAddresses.USDT_TOKEN,
  ArbitrumAddresses.WBTC_TOKEN

];

const claimants = [
  ArbitrumAddresses.GOVERNANCE, // for Governance
  ArbitrumAddresses.GOVERNANCE, // for Sphere
  ArbitrumAddresses.GOVERNANCE, // for Usd+
  ArbitrumAddresses.GOVERNANCE, // for Qi-dao
  ArbitrumAddresses.GOVERNANCE, // for Beefy
  ArbitrumAddresses.GOVERNANCE, // for Valas
  ArbitrumAddresses.GOVERNANCE, // for DotDot
  ArbitrumAddresses.GOVERNANCE, // for TUSD
  ArbitrumAddresses.GOVERNANCE, // for Stader
  ArbitrumAddresses.GOVERNANCE, // for reserve1
  ArbitrumAddresses.GOVERNANCE, // for reserve2
];

const claimantsAmounts = [
  parseUnits("10000000"), // Governance
  parseUnits("500000"), // Sphere
  parseUnits("500000"), // Usd+
  parseUnits("500000"), // Qi-dao
  parseUnits("500000"), // Beefy
  parseUnits("500000"), // Valas
  parseUnits("500000"), // DotDot
  parseUnits("500000"), // TUSD
  parseUnits("500000"), // Stader
  parseUnits("500000"), // reserve1
  parseUnits("500000"), // reserve2
];

const FACTORY = ''; //todo fill

// ! choose wisely
const WARMING_UP = 1;

async function main() {
  let signer;
  if (hre.network.name === "hardhat") {
    signer = await Misc.impersonate(ArbitrumAddresses.GOVERNANCE);
  } else {
    signer = (await ethers.getSigners())[0];
  }

  const minterMax = parseUnits((15_000_000).toString());

  const [
    controller,
    token,
    gaugesFactory,
    bribesFactory,
    ve,
    veDist,
    voter,
    minter,
  ] = await Deploy.deployLizardSystem(
    signer,
    voterTokens,
    claimants,
    claimantsAmounts,
    minterMax,
    FACTORY,
    WARMING_UP
  );

  const data = ''
    + 'controller: ' + controller.address + '\n'
    + 'token: ' + token.address + '\n'
    + 'gaugesFactory: ' + gaugesFactory.address + '\n'
    + 'bribesFactory: ' + bribesFactory.address + '\n'
    + 've: ' + ve.address + '\n'
    + 'veDist: ' + veDist.address + '\n'
    + 'voter: ' + voter.address + '\n'
    + 'minter: ' + minter.address + '\n'

  console.log(data);

  if (hre.network.name === "hardhat") {
    await check(signer, minter.address, token.address, veDist.address, voter.address);
  }


  if (hre.network.name !== "hardhat") {
    writeFileSync('tmp/core.txt', data);

    await Misc.wait(5);

    await Verify.verify(controller.address);
    await Verify.verify(token.address);
    await Verify.verify(gaugesFactory.address);
    await Verify.verify(bribesFactory.address);
    await Verify.verifyWithArgs(ve.address, [token.address, controller.address]);
    await Verify.verifyWithArgs(veDist.address, [ve.address]);
    await Verify.verifyWithArgs(voter.address, [ve.address, FACTORY, gaugesFactory.address, bribesFactory.address]);
    await Verify.verifyWithArgs(minter.address, [ve.address, controller.address]);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

async function check(signer: SignerWithAddress, minter: string, token: string, veDist: string, voter: string) {
  const minterCtr = LizardMinter__factory.connect(minter, signer);
  const tokenCtr = IERC20__factory.connect(token, signer);
  const voterCtr = LizardVoter__factory.connect(voter, signer);

  console.log("govBal after deploy", formatUnits(await tokenCtr.balanceOf(signer.address)));

  const activePeriod = (await minterCtr.activePeriod()).toNumber();

  console.log('activePeriod', activePeriod, new Date(activePeriod * 1000));

  if (signer.provider) {
    const blockNum = await signer.provider.getBlockNumber();
    const block = await signer.provider.getBlock(blockNum);
    console.log('block', blockNum, block.timestamp, new Date(block.timestamp * 1000), ((activePeriod - block.timestamp) / 60 / 60 / 24).toFixed(2));


    await voterCtr.createGauge('0x89b26af36fa8705a27934fced56d154bda01315a');
    await voterCtr.vote(1, ['0x89b26af36fa8705a27934fced56d154bda01315a'], ['100']);

    await TimeUtils.advanceBlocksOnTs(activePeriod - block.timestamp);

    await minterCtr.updatePeriod();

    console.log("govBal", formatUnits(await tokenCtr.balanceOf(signer.address)));
    console.log("veDistBal", formatUnits(await tokenCtr.balanceOf(veDist)));
    console.log("voterBal", formatUnits(await tokenCtr.balanceOf(voter)));
  }
}
