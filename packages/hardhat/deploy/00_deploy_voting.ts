import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployVoting: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Voting", {
    from: deployer,
    log: true,
    autoMine: true, // speed up deployment on local network
  });
};

deployVoting.tags = ["Voting"];

export default deployVoting;
