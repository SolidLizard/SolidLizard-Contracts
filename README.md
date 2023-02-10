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


### Arbitrum deployment

| Name                 | Address                                                                                                                   |
|:---------------------|:--------------------------------------------------------------------------------------------------------------------------|
| LizardFactory          | [0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016](https://arbiscan.io/address/0x734d84631f00dC0d3FCD18b04b6cf42BFd407074#code) |
| LizardRouter01         | [0xF26515D5482e2C2FD237149bF6A653dA4794b3D0](https://arbiscan.io/address/0xF26515D5482e2C2FD237149bF6A653dA4794b3D0#code) |
| BribeFactory         | [0x6855D50f7dc1A3b08B8cf55d09F6DbeA0ce3304F](https://arbiscan.io/address/0x6855D50f7dc1A3b08B8cf55d09F6DbeA0ce3304F#code) |
| GaugesFactory        | [0x330b0AaC13E389313e48f9B70E4d1531C71A5094](https://arbiscan.io/address/0x330b0AaC13E389313e48f9B70E4d1531C71A5094#code) |
| SLIZ                 | [0x463913D3a3D3D291667D53B8325c598Eb88D3B0e](https://arbiscan.io/address/0x463913D3a3D3D291667D53B8325c598Eb88D3B0e#code) |
| LizardMinter           | [0x4d24e9cc5A8c848f3F8BFA14Ebb8a7607105Ec3C](https://arbiscan.io/address/0x4d24e9cc5A8c848f3F8BFA14Ebb8a7607105Ec3C#code) |
| LizardVoter            | [0x98A1De08715800801E9764349F5A71cBe63F99cc](https://arbiscan.io/address/0x98A1De08715800801E9764349F5A71cBe63F99cc#code) |
| veSLIZ               | [0x29d3622c78615A1E7459e4bE434d816b7de293e4](https://arbiscan.io/address/0x29d3622c78615A1E7459e4bE434d816b7de293e4#code) |
| VeDist               | [0xBfa51D9635FA9BE5117093EfeFf06d388D539b86](https://arbiscan.io/address/0xBfa51D9635FA9BE5117093EfeFf06d388D539b86#code) |
| Controller           | [0x23C7170FD3fEc8ef421EBA8F69b8E72Dd86Ac713](https://arbiscan.io/address/0x23C7170FD3fEc8ef421EBA8F69b8E72Dd86Ac713#code) |
