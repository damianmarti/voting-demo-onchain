// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Voting {
    enum Team {
        Millonarios,
        IndependienteMedellin,
        AtleticoNacional,
        Otros
    }

    // Vote counts for each team
    uint256[4] public votes;

    // Track if an address has voted
    mapping(address => bool) public hasVoted;

    // Event emitted when a vote is cast
    event Voted(address indexed voter, Team team);

    /**
     * Vote for your favorite team. Only costs gas.
     * @param team The team to vote for (0: Millonarios, 1: IndependienteMedellin, 2: AtleticoNacional, 3: Otros)
     */
    function vote(uint8 team) external {
        require(team < 4, "Invalid team");
        require(!hasVoted[msg.sender], "Already voted");
        votes[team] += 1;
        hasVoted[msg.sender] = true;
        emit Voted(msg.sender, Team(team));
    }

    /**
     * Get the vote count for a specific team
     * @param team The team index
     */
    function getVotes(uint8 team) external view returns (uint256) {
        require(team < 4, "Invalid team");
        return votes[team];
    }

    /**
     * Get all vote counts
     */
    function getAllVotes() external view returns (uint256[4] memory) {
        return votes;
    }
}
