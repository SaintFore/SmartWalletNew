import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BarChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  width?: number;
  height?: number;
  showLabels?: boolean;
}

export function BarChart({
  data,
  width = 500,
  height = 300,
  showLabels = true,
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    return () => {
      d3.selectAll(".d3-tooltip").remove();
    };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([innerHeight, 0]);

    // 添加网格线
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-innerWidth)
          .tickFormat(() => ""),
      )
      .selectAll("line")
      .style("stroke", "var(--border)")
      .style("stroke-opacity", 0.5)
      .style("stroke-dasharray", "3,3");

    g.selectAll(".grid .domain").remove();

    // X 轴
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("fill", "var(--muted-foreground)")
      .style("font-size", "12px");

    g.selectAll(".domain").style("stroke", "var(--border)");
    g.selectAll(".tick line").style("stroke", "var(--border)");

    // Y 轴
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `¥${d.toLocaleString()}`),
      )
      .selectAll("text")
      .style("fill", "var(--muted-foreground)")
      .style("font-size", "12px");

    // 柱子
    const bars = g
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.name) || 0)
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", (_d: any, i: number) => data[i].color || "var(--primary)")
      .style("cursor", "pointer");

    // 动画
    bars
      .transition()
      .duration(800)
      .delay((_d: any, i: number) => i * 100)
      .attr("y", (d: any) => y(d.value))
      .attr("height", (d: any) => innerHeight - y(d.value));

    // 悬停效果
    bars
      .on("mouseover", function (event: any, d: any) {
        d3.select(this).transition().duration(200).attr("opacity", 0.8);

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
            `<div style="font-weight: 500;">${d.name}</div>
             <div style="color: var(--muted-foreground);">¥${d.value.toLocaleString()}</div>`,
          );

        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("opacity", 1);

        d3.selectAll(".d3-tooltip").remove();
      });

    // 标签
    if (showLabels) {
      g.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d: any) => (x(d.name) || 0) + x.bandwidth() / 2)
        .attr("y", (d: any) => y(d.value) - 8)
        .attr("text-anchor", "middle")
        .style("fill", "var(--foreground)")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("opacity", 0)
        .text((d: any) => `¥${d.value.toLocaleString()}`)
        .transition()
        .duration(800)
        .delay((_d: any, i: number) => i * 100 + 400)
        .style("opacity", 1);
    }
  }, [data, width, height, showLabels]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
    />
  );
}
