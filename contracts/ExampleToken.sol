pragma solidity ^0.4.18;

import "./ERC721Token.sol";

/**
 * @title ERC721TokenMock
 * This mock just provides a public mint and burn functions for testing purposes.
 */
contract ExampleToken is ERC721Token {
  function mint(address _to, uint256 _tokenId) public {
    super._mint(_to, _tokenId);
  }

  function burn(uint256 _tokenId) public {
    super._burn(_tokenId);
  }
}