// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MonGraffiti.sol";

contract DeployMonGraffiti is Script {
    function run() external returns (MonGraffiti) {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        
        vm.startBroadcast(deployerPrivateKey);

        MonGraffiti monGraffiti = new MonGraffiti();

        vm.stopBroadcast();

        console.log("MonGraffiti contract deployed at:", address(monGraffiti));

        return monGraffiti;
    }
}
