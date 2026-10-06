const display = document.getElementById("display");
const buttons = document.querySelectorAll(".button");

let expression = "";
let justCalculated = false;

const operators = ["+", "-", "*", "/", "%"];

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === "clear") {
            clearDisplay();
            return;
        }

        if (action === "delete") {
            deleteLastCharacter();
            return;
        }

        if (action === "calculate") {
            calculate();
            return;
        }

        if (action === "square") {
            calculateSquare();
            return;
        }

        if (value !== undefined) {
            handleInput(value);
        }
    });
});

function handleInput(value) {
    if (justCalculated) {
        if (!operators.includes(value)) {
            expression = "";
        }

        justCalculated = false;
    }

    if (operators.includes(value)) {
        addOperator(value);
    } else if (value === ".") {
        addDecimal();
    } else {
        expression += value;
    }

    updateDisplay();
}

function addOperator(operator) {
    if (expression === "") {
        if (operator === "-") {
            expression = "-";
        }
        return;
    }

    const lastCharacter = expression.slice(-1);

    if (operators.includes(lastCharacter)) {
        expression = expression.slice(0, -1);
    }

    expression += operator;
}

function addDecimal() {
    const parts = expression.split(/[+\-*/%]/);
    const currentNumber = parts[parts.length - 1];

    if (!currentNumber.includes(".")) {
        expression += currentNumber === "" ? "0." : ".";
    }
}

function clearDisplay() {
    expression = "";
    justCalculated = false;
    updateDisplay();
}

function deleteLastCharacter() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

function calculateSquare() {
    if (!expression || operators.includes(expression.slice(-1))) {
        return;
    }

    const value = Number(expression);

    if (!Number.isFinite(value)) {
        showError();
        return;
    }

    expression = String(value * value);
    justCalculated = true;

    updateDisplay();
}

function calculate() {
    if (!expression || operators.includes(expression.slice(-1))) {
        return;
    }

    try {
        const tokens = tokenize(expression);
        const result = evaluateExpression(tokens);

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        expression = String(Number(result.toFixed(10)));
        justCalculated = true;

        updateDisplay();
    } catch {
        showError();
    }
}

function tokenize(input) {
    const tokens = [];
    let number = "";

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (
            /\d/.test(char) ||
            char === "."
        ) {
            number += char;
            continue;
        }

        if (operators.includes(char)) {
            if (number !== "") {
                tokens.push(Number(number));
                number = "";
            }

            tokens.push(char);
        } else {
            throw new Error("Invalid character");
        }
    }

    if (number !== "") {
        tokens.push(Number(number));
    }

    return tokens;
}

function evaluateExpression(tokens) {
    const values = [];
    const ops = [];

    const precedence = {
        "+": 1,
        "-": 1,
        "*": 2,
        "/": 2,
        "%": 2
    };

    function applyOperator() {
        const operator = ops.pop();
        const right = values.pop();
        const left = values.pop();

        let result;

        switch (operator) {
            case "+":
                result = left + right;
                break;

            case "-":
                result = left - right;
                break;

            case "*":
                result = left * right;
                break;

            case "/":
                if (right === 0) {
                    throw new Error("Division by zero");
                }

                result = left / right;
                break;

            case "%":
                if (right === 0) {
                    throw new Error("Division by zero");
                }

                result = left % right;
                break;

            default:
                throw new Error("Unknown operator");
        }

        values.push(result);
    }

    tokens.forEach((token) => {
        if (typeof token === "number") {
            values.push(token);
            return;
        }

        while (
            ops.length &&
            precedence[ops[ops.length - 1]] >= precedence[token]
        ) {
            applyOperator();
        }

        ops.push(token);
    });

    while (ops.length) {
        applyOperator();
    }

    if (values.length !== 1) {
        throw new Error("Invalid expression");
    }

    return values[0];
}

function showError() {
    display.value = "Error";
    expression = "";
    justCalculated = true;
}

function updateDisplay() {
    display.value = expression || "0";
}

document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/\d/.test(key)) {
        handleInput(key);
    } else if (operators.includes(key)) {
        handleInput(key);
    } else if (key === ".") {
        handleInput(".");
    } else if (key === "Enter" || key === "=") {
        calculate();
    } else if (key === "Backspace") {
        deleteLastCharacter();
        updateDisplay();
    } else if (key === "Escape") {
        clearDisplay();
    }
});
