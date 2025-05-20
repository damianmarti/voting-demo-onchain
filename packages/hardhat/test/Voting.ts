import { ethers } from "hardhat";
import { expect } from "chai";

describe("Voting", function () {
  let voting: any;
  let accounts: any[];

  beforeEach(async function () {
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.waitForDeployment();
    accounts = await ethers.getSigners();
  });

  it("should start with zero votes for all teams", async function () {
    for (let i = 0; i < 4; i++) {
      expect(await voting.votes(i)).to.equal(0);
    }
  });

  it("should allow voting for each team and count votes", async function () {
    await voting.connect(accounts[0]).vote(0); // Millonarios
    await voting.connect(accounts[1]).vote(1); // IndependienteMedellin
    await voting.connect(accounts[2]).vote(2); // AtleticoNacional
    await voting.connect(accounts[3]).vote(3); // Otros

    expect(await voting.votes(0)).to.equal(1);
    expect(await voting.votes(1)).to.equal(1);
    expect(await voting.votes(2)).to.equal(1);
    expect(await voting.votes(3)).to.equal(1);
  });

  it("should emit Voted event on vote", async function () {
    await expect(voting.vote(0)).to.emit(voting, "Voted").withArgs(accounts[0].address, 0);
  });

  it("should revert for invalid team index", async function () {
    await expect(voting.vote(4)).to.be.revertedWith("Invalid team");
    await expect(voting.getVotes(4)).to.be.revertedWith("Invalid team");
  });

  it("should only allow one vote per address", async function () {
    await voting.vote(0);
    await expect(voting.vote(1)).to.be.revertedWith("Already voted");
    // Another address can still vote
    await voting.connect(accounts[1]).vote(2);
    expect(await voting.votes(2)).to.equal(1);
  });
});
