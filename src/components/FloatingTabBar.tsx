"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useLayoutEffect, useRef, useState } from "react";

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
        id: "groups",
        label: "Groups",
        href: "/groups",
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    const innerRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<HTMLAnchorElement | null>(null);
    const [slideStyle, setSlideStyle] = useState({ width: 0, x: 0 });

    function getActiveTab() {
        if (pathname === "/") return "home";
        if (pathname.startsWith("/submit")) return "submit";
        if (pathname.startsWith("/groups")) return "groups";
        if (pathname.startsWith("/profile")) return "profile";
        return null;
    }

    const activeTab = getActiveTab();
    const activeIndex = activeTab
        ? TABS.findIndex((t) => t.id === activeTab)
        : -1;

    useLayoutEffect(() => {
        const container = innerRef.current;
        const activeElement = activeTabRef.current;

        if (!container || !activeElement || activeIndex < 0) {
            return;
        }

        let frame = 0;

        const syncActiveTab = () => {
            const nextWidth = activeElement.offsetWidth;
            const nextX = activeElement.offsetLeft;

            setSlideStyle((current) =>
                current.width === nextWidth && current.x === nextX
                    ? current
                    : { width: nextWidth, x: nextX },
            );

            const targetScrollLeft =
                nextX - (container.clientWidth - nextWidth) / 2;
            const maxScrollLeft = Math.max(
                0,
                container.scrollWidth - container.clientWidth,
            );

            container.scrollTo({
                left: Math.min(Math.max(targetScrollLeft, 0), maxScrollLeft),
                behavior: "smooth",
            });
        };

        const scheduleSync = () => {
            cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(syncActiveTab);
        };

        scheduleSync();

        const resizeObserver = new ResizeObserver(scheduleSync);
        resizeObserver.observe(container);
        resizeObserver.observe(activeElement);
        window.addEventListener("resize", scheduleSync);

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            window.removeEventListener("resize", scheduleSync);
        };
    }, [activeIndex, pathname]);

    return (
        <nav className="floating-tab-bar" aria-label="Main navigation">
            <div ref={innerRef} className="floating-tab-bar-inner">
                <div
                    className="floating-tab-slide"
                    style={{
                        opacity: activeIndex >= 0 ? 1 : 0,
                        transform: `translateX(${slideStyle.x}px)`,
                        width: `${slideStyle.width}px`,
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
                            ref={isActive ? activeTabRef : null}
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
