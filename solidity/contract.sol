pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import 'base64-sol/base64.sol';

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract YourContract is ERC721 {
  address immutable ogNFT;
  mapping(uint256 => address) owner;
  // how many times a token was transfered by tokenId
  mapping(uint256 => uint256) transferCount;

  constructor(address _ogNFT) {
    ogNFT = _ogNFT;
  }

  //function hasMintedNFT(uint256 _tokenId) public view returns (bool) {
  //  return hasMinted[_tokenId]
  //}

  function generateSVG(uint id) public view returns (string memory) {
    string memory svg = string(abi.encodePacked(

    ));
  }

  function uint2str(uint256 _i) internal pure returns (string memory str) {
    if (_i == 0) {
      return "0";
    }
    uint256 j  = _i;
    uint256 length;
    while (j != 0) {
      length++;
      j /= 10;
    }
    bytes memory bstr = new bytes(length);
    uint256 k = length;
    j = _i;
    while (j != 0) {
      bstr[--k] = bytes(uint8(48 + (j % 10)));
      j /= 10;
    }
    str = string(bstr);
  }
}
