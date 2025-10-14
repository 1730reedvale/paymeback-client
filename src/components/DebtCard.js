import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function DebtCard({ name, amount, status = "pending", note }) {
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "meta", children: [_jsx("div", { className: "avatar", style: {
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            background: "linear-gradient(180deg,#79e3cf,#3fbfa9)"
                        } }), _jsxs("div", { children: [_jsx("div", { className: "title", children: name }), _jsx("div", { className: "sub", children: note })] })] }), _jsxs("div", { className: "row", children: [_jsxs("strong", { children: ["$", Number(amount).toLocaleString()] }), _jsx("span", { className: `chip ${status}`, children: statusLabel(status) })] })] }));
}
function statusLabel(s) {
    return s === "paid" ? "Paid" : s === "overdue" ? "Overdue" : "Pending";
}
