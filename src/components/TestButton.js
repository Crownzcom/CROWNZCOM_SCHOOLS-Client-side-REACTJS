import React from "react";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

function TestButton() {
  const handleClick = () => {
    alert("Button clicked!");
  };

  return (
    <div>
      <Button variant="primary" onClick={handleClick}>
        Click Me
      </Button>
    </div>
  );
}

export default TestButton;
