"use client";

import type { DataPoint } from "./DataPoint";
import type { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";

interface GraphProps {
  data: DataPoint[];
  handleCurrentIndexChange?: (index: number) => void;
}

const Graph = ({ data, handleCurrentIndexChange }: GraphProps) => {
  // biome-ignore lint/suspicious/noExplicitAny: <TODO, replace with proper type>
  const [Chart, setChart] = useState<any>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <TODO, replace with proper deps>
  useEffect(() => {
    handleCurrentIndexChange?.(0);
    import("react-apexcharts").then((mod) => {
      setChart(() => mod.default);
    });
  }, [handleCurrentIndexChange, data]);

  const options: ApexOptions = {
    chart: {
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      events: {
        mouseMove: (_event, _chartContext, config) => {
          if (
            handleCurrentIndexChange &&
            config.dataPointIndex !== undefined &&
            data.length > config.dataPointIndex &&
            config.dataPointIndex >= 0
          ) {
            handleCurrentIndexChange(config.dataPointIndex);
          }
        },
      },
    },
    tooltip: {
      custom: () => null,
      fixed: {
        enabled: true,
        position: "topRight",
        offsetX: 20,
        offsetY: 0,
      },
      theme: "light",
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: "#1C64F2",
        gradientToColors: ["#1C64F2"],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 4,
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: 0,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
  };

  const series = [
    {
      name: "",
      data: data.map((dataPoint) => ({
        x: dataPoint.date,
        y: dataPoint.value,
      })),
      color: "#1A56DB",
    },
  ];

  return (
    Chart && (
      <Chart
        options={options}
        series={series}
        type="area"
        height="90%"
        width="100%"
      />
    )
  );
};

export default Graph;
