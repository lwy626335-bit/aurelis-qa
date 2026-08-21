"use client";

import type { demoReport as DemoReportType } from "@aurelis/database/demo";
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Dimensions = typeof DemoReportType.dimensions;
type Trend = typeof DemoReportType.trend;

const tooltipStyle = {
  background: "#111318",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 9,
  color: "#f5f4f0",
  fontSize: 12,
  boxShadow: "0 18px 48px rgba(0,0,0,0.36)",
};

export function QualityRadar({ data }: { data: Dimensions }) {
  return (
    <div data-chart="radar" className="h-[300px] min-w-0 w-full" role="img" aria-label="Radar chart comparing current and previous quality dimension scores">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={[...data]} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.09)" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: "#989ba3", fontSize: 10 }} />
          <Radar isAnimationActive={false} dataKey="previous" stroke="#555963" fill="#555963" fillOpacity={0.12} strokeWidth={1} />
          <Radar isAnimationActive={false} dataKey="score" stroke="#d6b978" fill="#d6b978" fillOpacity={0.16} strokeWidth={1.7} />
          <Tooltip contentStyle={tooltipStyle} cursor={false} />
        </RadarChart>
      </ResponsiveContainer>
      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.dimension}>{item.dimension}: {item.score}, previous {item.previous}</li>
        ))}
      </ul>
    </div>
  );
}

export function QualityTrend({ data }: { data: Trend }) {
  return (
    <div data-chart="trend" className="h-[280px] min-w-0 w-full" role="img" aria-label="Quality score trend over five demo evaluations">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[...data]} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="qualityArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d6b978" stopOpacity={0.24} />
              <stop offset="100%" stopColor="#d6b978" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="label" tick={{ fill: "#777a83", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={[60, 100]} tick={{ fill: "#777a83", fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(214,185,120,0.3)" }} />
          <Area isAnimationActive={false} type="monotone" dataKey="quality" stroke="#d6b978" strokeWidth={2} fill="url(#qualityArea)" activeDot={{ r: 4, fill: "#d6b978", strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.label}>{item.label}: quality score {item.quality}</li>
        ))}
      </ul>
    </div>
  );
}
