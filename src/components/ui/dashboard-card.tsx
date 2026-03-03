import React from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    glass?: boolean;
}

export function DashboardCard({
    title,
    subtitle,
    icon,
    action,
    glass = false,
    className,
    children,
    ...props
}: DashboardCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-slate-200/60",
                "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300",
                "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
                glass && "bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60",
                className
            )}
            {...props}
        >
            {(title || subtitle || icon || action) && (
                <div className="flex items-start justify-between border-b border-slate-100/50 p-6 pb-4">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                                {icon}
                            </div>
                        )}
                        <div>
                            {title && <h3 className="font-semibold text-slate-900 leading-none tracking-tight">{title}</h3>}
                            {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
                        </div>
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={cn("p-6", (title || subtitle || icon || action) && "pt-5")}>
                {children}
            </div>
        </div>
    );
}

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    className,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: { value: number; label: string; positive?: boolean };
    className?: string;
}) {
    return (
        <DashboardCard className={className}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
                    </div>
                </div>
                {icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        {icon}
                    </div>
                )}
            </div>
            {(subtitle || trend) && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                    {trend && (
                        <span
                            className={cn(
                                "flex items-center font-medium",
                                trend.positive ? "text-emerald-600" : "text-rose-600"
                            )}
                        >
                            {trend.positive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                                </svg>
                            )}
                            {trend.value}%
                        </span>
                    )}
                    {subtitle && <span className="text-slate-500">{subtitle}</span>}
                </div>
            )}
        </DashboardCard>
    );
}
