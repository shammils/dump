// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Counter {

    // Private variable of type unsigned int to keep the number of counts
    uint256 private count;
    address private owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    constructor() public {
        owner = msg.sender;
    }

    // Getter to get the count value
    function getCount() public view returns (uint256) {
        return count;
    }

    function increment() public onlyOwner {
        count++;
    }
    function decriment() public onlyOwner {
        count--;
    }
}

/*
https://ethereumdev.io/organize-your-code-and-control-access-to-your-smart-contract-with-modifiers/

restrict the increment and decriment functions to the current owner(there is no
way to change the owner in this script but yeah).
*/
