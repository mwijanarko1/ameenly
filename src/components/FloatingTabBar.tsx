"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const TABS = [
    {
        id: "home",
        label: "Home",
        href: "/",
        icon: (
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
                <path d="M9 21V12h6v9" />
            </svg>
        ),
    },
    {
        id: "submit",
        label: "Submit",
        href: "/submit",
        icon: (
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </svg>
        ),
    },
    {
        id: "profile",
        label: "Profile",
        href: "/profile",
        icon: (
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="8" r="4" />
                <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
            </svg>
        ),
    },
] as const;

export function FloatingTabBar() {
    const pathname = usePathname();
    const { isSignedIn } = useUser();

    function getActiveTab() {
        if (pathname === "/") return "home";
        if (pathname.startsWith("/submit")) return "submit";
        if (pathname.startsWith("/profile")) return "profile";
        return null;
    }

    const activeTab = getActiveTab();
    const activeIndex = activeTab
        ? TABS.findIndex((t) => t.id === activeTab)
        : -1;

    return (
        <nav className="floating-tab-bar" aria-label="Main navigation">
            <div className="floating-tab-bar-inner">
                <div
                    className="floating-tab-slide"
                    style={{
                        transform:
                            activeIndex >= 0
                                ? `translateX(calc(${activeIndex} * 100%))`
                                : "translateX(0)",
                    }}
                    aria-hidden
                />
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const label =
                        tab.id === "profile" && !isSignedIn ? "Sign In" : tab.label;

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`floating-tab ${isActive ? "floating-tab-active" : ""}`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <span className="floating-tab-icon">{tab.icon}</span>
                            <span className="floating-tab-label">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
