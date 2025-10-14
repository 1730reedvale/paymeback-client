import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import DebtCard from "../components/DebtCard";
export default function Debts() {
    const sample = [
        { name: "Chris P.", amount: 120, status: "pending", note: "Movie night" },
        { name: "Lana Q.", amount: 980, status: "overdue", note: "Group trip" },
    ];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "segmented", children: [_jsx("button", { className: "tab active", children: "All Debts" }), _jsx("button", { className: "tab", children: "Owed to Me" }), _jsx("button", { className: "tab", children: "I Owe" })] }), _jsx("div", { className: "card-list", children: sample.map((d, i) => (_jsx(DebtCard, { ...d }, i))) })] }));
}
