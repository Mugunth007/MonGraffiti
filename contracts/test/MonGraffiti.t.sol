// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MonGraffiti.sol";

contract MonGraffitiTest is Test {
    MonGraffiti public graffitiContract;

    address public user1 = address(0x111);
    address public user2 = address(0x222);

    function setUp() public {
        graffitiContract = new MonGraffiti();
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    function testPublishGraffiti() public {
        vm.prank(user1);
        uint256 id = graffitiContract.publishGraffiti(
            "MON Frog",
            35676200,
            139650300,
            "https://supabase.co/art1.png"
        );

        assertEq(id, 1);
        assertEq(graffitiContract.getTotalGraffitis(), 1);

        MonGraffiti.GraffitiItem memory item = graffitiContract.getGraffiti(1);
        assertEq(item.title, "MON Frog");
        assertEq(item.creator, user1);
        assertEq(item.latitude, 35676200);
        assertEq(item.longitude, 139650300);
    }

    function testLikeGraffiti() public {
        vm.prank(user1);
        graffitiContract.publishGraffiti("MON Rocket", 37774900, -122419400, "https://supabase.co/art2.png");

        vm.prank(user2);
        graffitiContract.likeGraffiti(1);

        MonGraffiti.GraffitiItem memory item = graffitiContract.getGraffiti(1);
        assertEq(item.likesCount, 1);
    }

    function testTipArtist() public {
        vm.prank(user1);
        graffitiContract.publishGraffiti("MON Alien", 40712800, -74006000, "https://supabase.co/art3.png");

        uint256 initBalance = user1.balance;

        vm.prank(user2);
        graffitiContract.tipArtist{value: 1 ether}(1);

        assertEq(user1.balance, initBalance + 1 ether);
    }
}
