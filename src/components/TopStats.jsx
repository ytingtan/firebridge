import { Dropdown } from "react-bootstrap";

function TopStats() {
    return (
        <div className="container">
        <div id="leaderboard" className="row my-5">
        <h2 className="mt-5"> View top statistics in various categories here. </h2>
			<div className="col-md-6 my-6 mt-5">
            <Dropdown>
                    <Dropdown.Toggle id="dropdown-basic">
                        Categories
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">Overall</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Attack</Dropdown.Item>
                        <Dropdown.Item href="#/action-3">Defense</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
			</div>
			<div className="col-md-6 my-6 mt-5">
            <h3> Leaderboard</h3>
            <ol>
                <li> The best player</li>
                <li> Second best player</li>
                <li> Third best player</li>
            </ol>
			</div>
		</div>
        </div>           
    );
}

export default TopStats;