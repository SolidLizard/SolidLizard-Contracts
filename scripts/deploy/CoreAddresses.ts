import {
  BribeFactory,
  Lizard,
  LizardFactory,
  LizardMinter,
  LizardRouter01,
  LizardVoter, Controller,
  GaugeFactory,
  Ve,
  VeDist,
  GovernanceTreasury
} from "../../typechain";

export class CoreAddresses {

  readonly token: Lizard;
  readonly gaugesFactory: GaugeFactory;
  readonly bribesFactory: BribeFactory;
  readonly factory: LizardFactory;
  readonly router: LizardRouter01;
  readonly ve: Ve;
  readonly veDist: VeDist;
  readonly voter: LizardVoter;
  readonly minter: LizardMinter;
  readonly controller: Controller;
  readonly treasury: GovernanceTreasury;


  constructor(token: Lizard, gaugesFactory: GaugeFactory, bribesFactory: BribeFactory, factory: LizardFactory, router: LizardRouter01, ve: Ve, veDist: VeDist, voter: LizardVoter, minter: LizardMinter, controller: Controller, treasury: GovernanceTreasury) {
    this.token = token;
    this.gaugesFactory = gaugesFactory;
    this.bribesFactory = bribesFactory;
    this.factory = factory;
    this.router = router;
    this.ve = ve;
    this.veDist = veDist;
    this.voter = voter;
    this.minter = minter;
    this.controller = controller;
    this.treasury = treasury;
  }
}
