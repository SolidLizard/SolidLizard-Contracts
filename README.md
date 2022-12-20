## Lizard exchange

[![codecov](https://codecov.io/gh/lizard-exchange/lizard-contracts/branch/master/graph/badge.svg?token=U94WAFLRT7)](https://codecov.io/gh/lizard-exchange/lizard-contracts)

Lizard allows low cost, near 0 slippage trades on uncorrelated or tightly correlated assets. The protocol incentivizes
fees instead of liquidity. Liquidity providers (LPs) are given incentives in the form of `token`, the amount received is
calculated as follows;

* 100% of weekly distribution weighted on votes from ve-token holders

The above is distributed to the `gauge` (see below), however LPs will earn between 40% and 100% based on their own
ve-token balance.

LPs with 0 ve* balance, will earn a maximum of 40%.

## AMM

What differentiates Lizard's AMM;

Lizard AMMs are compatible with all the standard features as popularized by Uniswap V2, these include;

* Lazy LP management
* Fungible LP positions
* Chained swaps to route between pairs
* priceCumulativeLast that can be used as external TWAP
* Flashloan proof TWAP
* Direct LP rewards via `skim`
* xy>=k

Lizard adds on the following features;

* 0 upkeep 30 minute TWAPs. This means no additional upkeep is required, you can quote directly from the pair
* Fee split. Fees do not auto accrue, this allows external protocols to be able to profit from the fee claim
* New curve: x3y+y3x, which allows efficient stable swaps
* Curve
  quoting: `y = (sqrt((27 a^3 b x^2 + 27 a b^3 x^2)^2 + 108 x^12) + 27 a^3 b x^2 + 27 a b^3 x^2)^(1/3)/(3 2^(1/3) x) - (2^(1/3) x^3)/(sqrt((27 a^3 b x^2 + 27 a b^3 x^2)^2 + 108 x^12) + 27 a^3 b x^2 + 27 a b^3 x^2)^(1/3)`
* Routing through both stable and volatile pairs
* Flashloan proof reserve quoting

## token

**TBD**

## ve-token

Vested Escrow (ve), this is the core voting mechanism of the system, used by `LizardFactory` for gauge rewards and gauge
voting.

This is based off of ve(3,3)

* `deposit_for` deposits on behalf of
* `emit Transfer` to allow compatibility with third party explorers
* balance is moved to `tokenId` instead of `address`
* Locks are unique as NFTs, and not on a per `address` basis

```
function balanceOfNFT(uint) external returns (uint)
```

## LizardPair

LizardPair is the base pair, referred to as a `pool`, it holds two (2) closely correlated assets (example MIM-UST) if a
stable pool or two (2) uncorrelated assets (example FTM-SPELL) if not a stable pool, it uses the standard UniswapV2Pair
interface for UI & analytics compatibility.

```
function mint(address to) external returns (uint liquidity)
function burn(address to) external returns (uint amount0, uint amount1)
function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external
```

Functions should not be referenced directly, should be interacted with via the LizardRouter

Fees are not accrued in the base pair themselves, but are transfered to `PairFees` which has a 1:1 relationship
with `LizardPair`

### LizardFactory

LizardFactory allows for the creation of `pools`
via ```function createPair(address tokenA, address tokenB, bool stable) external returns (address pair)```

LizardFactory uses an immutable pattern to create pairs, further reducing the gas costs involved in swaps

Anyone can create a pool permissionlessly.

### LizardRouter

LizardRouter is a wrapper contract and the default entry point into Stable V1 pools.

```

function addLiquidity(
    address tokenA,
    address tokenB,
    bool stable,
    uint amountADesired,
    uint amountBDesired,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) external ensure(deadline) returns (uint amountA, uint amountB, uint liquidity)

function removeLiquidity(
    address tokenA,
    address tokenB,
    bool stable,
    uint liquidity,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) public ensure(deadline) returns (uint amountA, uint amountB)

function swapExactTokensForTokens(
    uint amountIn,
    uint amountOutMin,
    route[] calldata routes,
    address to,
    uint deadline
) external ensure(deadline) returns (uint[] memory amounts)

```

## Gauge

Gauges distribute arbitrary `token(s)` rewards to LizardPair LPs based on voting weights as defined by `ve` voters.

Arbitrary rewards can be added permissionlessly
via ```function notifyRewardAmount(address token, uint amount) external```

Gauges are completely overhauled to separate reward calculations from deposit and withdraw. This further protect LP
while allowing for infinite token calculations.

Previous iterations would track rewardPerToken as a shift everytime either totalSupply, rewardRate, or time changed.
Instead we track each individually as a checkpoint and then iterate and calculation.

## Bribe

Gauge bribes are natively supported by the protocol, Bribes inherit from Gauges and are automatically adjusted on votes.

Users that voted can claim their bribes via calling ```function getReward(address token) public```

Fees accrued by `Gauges` are distributed to `Bribes`

### BaseV1Voter

Gauge factory permissionlessly creates gauges for `pools` created by `LizardFactory`. Further it handles voting for 100%
of the incentives to `pools`.

```
function vote(address[] calldata _poolVote, uint[] calldata _weights) external
function distribute(address token) external
```

### veLIZARD distribution recipients

| Name | Address | Qty |
|:-----|:--------|:----|
| TBD   | TBD     | TBD |

### Testnet deployment

| Name       | Address                                                                                                                           |
|:-----------|:----------------------------------------------------------------------------------------------------------------------------------|
| wBNB       | [0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd](https://testnet.bscscan.com/address/0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd#code) |
| USDC_TOKEN | [0x88a12B7b6525c0B46c0c200405f49cE0E72D71Aa](https://testnet.bscscan.com/address/0x88a12B7b6525c0B46c0c200405f49cE0E72D71Aa#code) |
| MIM_TOKEN  | [0x549aE613Bb492CCf68A6620848C80262709a1fb4](https://testnet.bscscan.com/address/0x549aE613Bb492CCf68A6620848C80262709a1fb4#code) |
| DAI_TOKEN  | [0xf31d85CA2811B482f783860aacE022cf837dF7fE](https://testnet.bscscan.com/address/0xf31d85CA2811B482f783860aacE022cf837dF7fE#code) |
| USDT_TOKEN | [0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016](https://testnet.bscscan.com/address/0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016#code) |
| MAI_TOKEN  | [0xbf1fc29668e5f5Eaa819948599c9Ac1B1E03E75F](https://testnet.bscscan.com/address/0xbf1fc29668e5f5Eaa819948599c9Ac1B1E03E75F#code) |

| Name                 | Address                                                                                                                            |
|:---------------------|:-----------------------------------------------------------------------------------------------------------------------------------|
| LizardFactory          | [0x422282F18CFE573e7dc6BEcC7242ffad43340aF8](https://testnet.bscscan.com/address/0x422282F18CFE573e7dc6BEcC7242ffad43340aF8#code)  |
| LizardRouter01         | [0x13d862a01d0AB241509A2e47e31d0db04e9b9F49](https://testnet.bscscan.com/address/0x13d862a01d0AB241509A2e47e31d0db04e9b9F49#code)  |
| BribeFactory         | [0xD8a4054d63fCb0030BC73E2323344Ae59A19E92b](https://testnet.bscscan.com/address/0xD8a4054d63fCb0030BC73E2323344Ae59A19E92b#code)  |
| GaugesFactory        | [0xC363F3D4e1C005bf5321040653A088F71Bb974Ab](https://testnet.bscscan.com/address/0xC363F3D4e1C005bf5321040653A088F71Bb974Ab#code)  |
| LIZARD                 | [0x875976AeF383Fe4135B93C3989671056c4dEcDFF](https://testnet.bscscan.com/address/0x875976AeF383Fe4135B93C3989671056c4dEcDFF#code)  |
| LizardMinter           | [0x0C6868831c504Fb0bB61A54FEfC6464804380508](https://testnet.bscscan.com/address/0x0C6868831c504Fb0bB61A54FEfC6464804380508#code)  |
| LizardVoter            | [0xC9d5917A0cb82450Cd687AF31eCAaC967D7F121C](https://testnet.bscscan.com/address/0xC9d5917A0cb82450Cd687AF31eCAaC967D7F121C#code)  |
| veLIZARD               | [0xbEB411eAD71713E7f2814326498Ff2a054242206](https://testnet.bscscan.com/address/0xbEB411eAD71713E7f2814326498Ff2a054242206#code)  |
| VeDist               | [0xa4EB2E1284D9E30fb656Fe6b34c1680Ef5d4cBFC](https://testnet.bscscan.com/address/0xa4EB2E1284D9E30fb656Fe6b34c1680Ef5d4cBFC#code)  |
| Controller           | [0x6ce857d3037e87465b003aCbA264DDF2Cec6D5E4](https://testnet.bscscan.com/address/0x6ce857d3037e87465b003aCbA264DDF2Cec6D5E4#code)  |

### BSC deployment

| Name                 | Address                                                                                                                   |
|:---------------------|:--------------------------------------------------------------------------------------------------------------------------|
| LizardFactory          | [0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016](https://bscscan.com/address/0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016#code) |
| LizardRouter01         | [0xbf1fc29668e5f5Eaa819948599c9Ac1B1E03E75F](https://bscscan.com/address/0xbf1fc29668e5f5Eaa819948599c9Ac1B1E03E75F#code) |
| BribeFactory         | [0xFE700D523094Cc6C673d78F1446AE0743C89586E](https://bscscan.com/address/0xFE700D523094Cc6C673d78F1446AE0743C89586E#code) |
| GaugesFactory        | [0xeE7FFE79689B3d826C7389B95780F42849Fb7019](https://bscscan.com/address/0xeE7FFE79689B3d826C7389B95780F42849Fb7019#code) |
| LIZARD                 | [0xA60205802E1B5C6EC1CAFA3cAcd49dFeECe05AC9](https://bscscan.com/address/0xA60205802E1B5C6EC1CAFA3cAcd49dFeECe05AC9#code) |
| LizardMinter           | [0x308A756B4f9aa3148CaD7ccf8e72c18C758b2EF2](https://bscscan.com/address/0x308A756B4f9aa3148CaD7ccf8e72c18C758b2EF2#code) |
| LizardVoter            | [0xC3B5d80E4c094B17603Ea8Bb15d2D31ff5954aAE](https://bscscan.com/address/0xC3B5d80E4c094B17603Ea8Bb15d2D31ff5954aAE#code) |
| veLIZARD               | [0xd0C1378c177E961D96c06b0E8F6E7841476C81Ef](https://bscscan.com/address/0xd0C1378c177E961D96c06b0E8F6E7841476C81Ef#code) |
| VeDist               | [0xdfB765935D7f4e38641457c431F89d20Db571674](https://bscscan.com/address/0xdfB765935D7f4e38641457c431F89d20Db571674#code) |
| Controller           | [0x2d91C960b03F2C39604aE1b644ba508a1366057c](https://bscscan.com/address/0x2d91C960b03F2C39604aE1b644ba508a1366057c#code) |
