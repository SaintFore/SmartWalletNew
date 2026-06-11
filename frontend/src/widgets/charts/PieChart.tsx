import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  width?: number;
  height?: number;
  innerRadius?: number;
}

const defaultColors = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export function PieChart({
  data,
  width = 300,
  height = 300,
  innerRadius = 0,
}: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    return () => {
      d3.selectAll(".d3-tooltip").remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2;
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<(typeof data)[0]>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.02);

    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(radius - 20) as any;

    const arcHover = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(radius - 15) as any;

    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr(
        "fill",
        (_: any, i: number) => defaultColors[i % defaultColors.length],
      )
      .attr("stroke", "var(--background)")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event: any, d: any) {
        d3.select(this).transition().duration(200).attr("d", arcHover);

        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "d3-tooltip")
          .style("position", "absolute")
          .style("background", "var(--card)")
          .style("border", "1px solid var(--border)")
          .style("border-radius", "8px")
          .style("padding", "8px 12px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000")
          .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
          .html(
            `<div style="font-weight: 500;">${d.data.name}</div>
             <div style="color: var(--muted-foreground);">¥${d.data.value.toLocaleString()}</div>`,
          );

        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("d", arc);

        d3.selectAll(".d3-tooltip").remove();
      })
      .transition()
      .duration(800)
      .attrTween("d", function (d: any) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t: number) {
          return arc(interpolate(t));
        };
      });

    // 添加标签
    arcs
      .append("text")
      .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("font-weight", "500")
      .style("fill", "white")
      .style("pointer-events", "none")
      .text((d: any) => {
        const total = d3.sum(data, (d) => d.value);
        const percentage = ((d.data.value / total) * 100).toFixed(0);
        return Number(percentage) > 5 ? `${percentage}%` : "";
      });
  }, [data, width, height, innerRadius]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    />
  );
}
