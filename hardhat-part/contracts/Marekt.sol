// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface IBlueMonkey {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract Market {
    uint256 public price = 0.001 ether;
    uint256 public balace;
    address public owner;

    IBlueMonkey BlueMonkey;

    constructor(address _blueMonkey) payable {
        BlueMonkey = IBlueMonkey(_blueMonkey);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    event BuyEnd(address indexed buyer, uint256 amount);
    event SellEnd(address indexed seller, uint256 amount);

    function buy(uint256 amount) external payable {
        require(amount > 0, "amount is 0");
        uint cost = price * amount;
        require(msg.value == cost);
        (bool success, ) = payable(address(this)).call{value: cost}("");
        require(success, "Transaction failed!");
        bool s = BlueMonkey.transfer(msg.sender, amount);
        require(s, "Transaction failed");
        emit BuyEnd(msg.sender, amount);
    }

    function sell(uint256 amount) external payable {
        require(amount > 0, "amount is 0");
        uint cost = price * amount;
        (bool success, ) = msg.sender.call{value: cost}("");
        require(success, "transaction failed");
        bool s = BlueMonkey.transferFrom(msg.sender, address(this), amount);
        require(s, "Transaction failed");
        emit SellEnd(msg.sender, amount);
    }

    function withdraw() external payable onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success);
    }

    function getEthBalance() external view returns (uint256) {
        return msg.sender.balance;
    }

    function getTotalPrice(uint256 amount) external view returns (uint) {
        return (amount * price);
    }

    receive() external payable {}
}
