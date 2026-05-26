"use client";

import * as React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Percent, 
  Download, 
  Calendar,
  Thermometer,
  PieChart as PieChartIcon,
  Package
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const KPIS = [
  { label: "Total Revenue", value: "₦2,450,000", trend: "+12.5%", icon: DollarSign, color: "text-leaf", bg: "bg-leaf/10" },
  { label: "Total Orders", value: "142", trend: "+8.2%", icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "Avg. Order Value", value: "₦17,253", trend: "-2.1%", icon: TrendingUp, color: "text-gold", bg: "bg-gold/10" },
  { label: "Conversion Rate", value: "3.8%", trend: "+1.4%", icon: Percent, color: "text-rose-400", bg: "bg-rose-400/10" },
];

export default function VendorAnalyticsPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            Performance <span className="text-leaf">Analytics</span>.
          </h1>
          <p className="text-sm text-white/50">
            Deep dive into your sales, growth, and operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="rounded-2xl h-12 border-white/10 text-white/60">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button className="rounded-2xl h-12 px-6 shadow-lift">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </header>

      {/* KPI Row */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[32px] border border-forest/20 bg-black/20 p-6 backdrop-blur transition-all hover:border-leaf/30 hover:shadow-lift">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-2xl", kpi.bg, kpi.color)}>
                  <kpi.icon className="h-6 w-6" />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  kpi.trend.startsWith("+") ? "text-leaf" : "text-rose-400"
                )}>
                  {kpi.trend}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">{kpi.label}</div>
                <div className="text-3xl font-black text-white">{kpi.value}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Charts Area */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Sales Trend (Visual Placeholder) */}
        <div className="rounded-[40px] border border-forest/20 bg-black/20 p-8 backdrop-blur space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Sales Trend</h3>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Revenue over last 30 days</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-leaf" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Revenue</span>
              </div>
            </div>
          </div>

          <div className="relative h-64 flex items-end justify-between gap-2 pt-10 px-4">
            {/* Grid Lines */}
            <div className="absolute inset-x-0 top-10 h-[1px] bg-white/5" />
            <div className="absolute inset-x-0 top-[calc(10+54px)] h-[1px] bg-white/5" />
            <div className="absolute inset-x-0 top-[calc(10+108px)] h-[1px] bg-white/5" />
            <div className="absolute inset-x-0 top-[calc(10+162px)] h-[1px] bg-white/5" />
            
            {/* Bars */}
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100, 80, 60, 40].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 group relative"
                style={{ height: `${h}%` }}
              >
                <div className="absolute inset-0 bg-leaf/20 rounded-t-lg transition-all group-hover:bg-leaf group-hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]" />
                {/* Tooltip placeholder */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-leaf text-[#04110D] text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  ₦{(h * 1500).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between px-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">
            <span>May 01</span>
            <span>May 15</span>
            <span>May 30</span>
          </div>
        </div>

        {/* Orders by Category */}
        <div className="rounded-[40px] border border-forest/20 bg-black/20 p-8 backdrop-blur space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Category Mix</h3>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Order distribution by type</p>
            </div>
            <PieChartIcon className="h-5 w-5 text-white/20" />
          </div>

          <div className="flex flex-col items-center gap-10 sm:flex-row sm:justify-around py-4">
            {/* Visual Donut Chart Placeholder */}
            <div className="relative h-48 w-48">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.45)} className="text-leaf" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.25)} className="text-blue-400" transform="rotate(162 50 50)" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.15)} className="text-gold" transform="rotate(252 50 50)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-black text-white">142</div>
                <div className="text-[9px] font-black uppercase text-white/30">Total Orders</div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              {[
                { label: "Vegetables", percentage: "45%", count: 64, color: "bg-leaf" },
                { label: "Livestock", percentage: "25%", count: 35, color: "bg-blue-400" },
                { label: "Grains", percentage: "15%", count: 21, color: "bg-gold" },
                { label: "Others", percentage: "15%", count: 22, color: "bg-white/20" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={cn("h-3 w-3 rounded-full", item.color)} />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white group-hover:text-leaf transition-colors">{item.label}</div>
                    <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{item.count} Orders · {item.percentage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Insights Row */}
      <section className="grid gap-8 lg:grid-cols-3">
        {/* Cold-Chain Performance */}
        <div className="rounded-[40px] border border-blue-500/20 bg-blue-500/5 p-8 backdrop-blur space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
              <Thermometer className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cold-Chain Perf.</h4>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Logistics Health Score</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative h-4 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]" style={{ width: "92%" }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-black text-white">92%</div>
              <div className="text-right">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Exceptional</div>
                <div className="text-[9px] text-white/30">vs 88% regional avg.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Product */}
        <div className="lg:col-span-2 rounded-[40px] border border-forest/20 bg-black/20 p-8 backdrop-blur space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Top Listings</h3>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Performance by individual product</p>
            </div>
            <Package className="h-5 w-5 text-white/20" />
          </div>

          <div className="space-y-4">
            {[
              { name: "Premium Fresh Tomatoes", revenue: "₦842,000", orders: 48, growth: "+18%" },
              { name: "Live Broiler Chicken", revenue: "₦654,000", orders: 32, growth: "+12%" },
              { name: "Yam Tubers (Bulk Ton)", revenue: "₦420,000", orders: 12, growth: "+5%" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-leaf/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-forest/20 text-leaf font-black">#{i+1}</div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white group-hover:text-leaf transition-colors">{p.name}</div>
                    <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{p.orders} Orders sold</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">{p.revenue}</div>
                  <div className="text-[10px] font-bold text-leaf uppercase tracking-widest">{p.growth} growth</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
