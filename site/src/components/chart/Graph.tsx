"use client";

import type { DataPoint } from "./DataPoint";
import type { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";

interface GraphProps {
  data: DataPoint[];
  onCurrentValueChange?: (index: number) => void;
}

const Graph = ({ data, onCurrentValueChange }: GraphProps) => {
  const [Chart, setChart] = useState<any>(); //NOSONAR

  useEffect(() => {
    if (onCurrentValueChange) {
      onCurrentValueChange(data[0].value);
    }
    import("react-apexcharts").then((mod) => {
      setChart(() => mod.default);
    });
  }, [onCurrentValueChange, data]);

  const options: ApexOptions = {
    chart: {
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      events: {
        mouseMove: (event, chartContext, config) => {
          if (
            onCurrentValueChange &&
            config.dataPointIndex !== undefined &&
            data.length > config.dataPointIndex &&
            config.dataPointIndex >= 0
          ) {
            onCurrentValueChange(data[config.dataPointIndex].value);
          }
        },
      },
    },
    tooltip: {
      custom: (options: any) => null,
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
