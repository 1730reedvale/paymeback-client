import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import DebtCard from "../components/DebtCard";
import { useEffect } from "react";
import { api } from "../lib/api";
export default function Home() {
    const tabs = [
        { id: "toMe", label: "Owed to Me" },
        { id: "iOwe", label: "I Owe" },
        { id: "all", label: "All" },
    ];
    const [activeTab, setActiveTab] = useState("toMe");
    const debts = {
        toMe: [
            { name: "Ava Stone", amount: 120, status: "pending", note: "Lunch + Uber" },
            { name: "Mike Tran", amount: 640, status: "overdue", note: "Concert tickets split" },
            { name: "Priya K.", amount: 75, status: "paid", note: "Coffee run" },
        ],
        iOwe: [
            { name: "Dan R.", amount: 250, status: "pending", note: "Airbnb share" },
            { name: "Sofia L.", amount: 48, status: "pending", note: "Groceries" },
        ],
        all: [],
    };
    debts.all = [...debts.toMe, ...debts.iOwe];
    const list = debts[activeTab] ?? [];
    useEffect(() => {
        (async () => {
            try {
                const r = await api("/health");
                console.log("API /health status:", r.status);
                const txt = await r.text().catch(() => "(no body)");
                console.log("API /health body:", txt);
            }
            catch (e) {
                console.error("API /health error:", e);
            }
        })();
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx(Segmented, { tabs: tabs, active: activeTab, onChange: setActiveTab }), _jsx("div", { className: "card-list", children: list.map((d, i) => (_jsx(DebtCard, { ...d }, i))) })] }));
}
function Segmented({ tabs, active, onChange, }) {
    return (_jsx("div", { className: "segmented", role: "tablist", "aria-label": "View switcher", children: tabs.map((t) => (_jsx("button", { role: "tab", className: `tab ${active === t.id ? "active" : ""}`, "aria-selected": active === t.id, onClick: () => onChange(t.id), children: t.label }, t.id))) }));
}
